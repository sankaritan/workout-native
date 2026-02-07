/**
 * Workout Generation Engine
 * Core algorithm for creating personalized workout programs
 */

import {
  insertWorkoutPlan,
  insertSessionTemplate,
  insertExerciseTemplate,
} from "@/lib/storage/storage";
import { distributeMuscleGroups } from "./muscle-groups";
import { orderExercises } from "./exercise-selector";
import type {
  GenerationInput,
  WorkoutProgram,
  ProgramSession,
  ProgramExercise,
  SetsRepsScheme,
} from "./types";
import type { Exercise, MuscleGroup, Equipment } from "@/lib/storage/types";
import type { SessionTemplate } from "./muscle-groups";

/**
 * Determines if an exercise requires significant recovery time
 * Currently: Priority 1 + Barbell equipment (the "big 4" lifts: Bench, Squat, Deadlift, Barbell Row)
 */
export function isHighRecoveryExercise(exercise: Exercise): boolean {
  return exercise.priority === 1 && exercise.equipment_required === "Barbell";
}

/**
 * Get sets/reps scheme based on training focus
 */
export function getSetsRepsScheme(
  focus: "Balanced" | "Strength" | "Endurance"
): SetsRepsScheme {
  switch (focus) {
    case "Balanced":
      return { sets: 3, repsMin: 8, repsMax: 12 };
    case "Strength":
      return { sets: 5, repsMin: 3, repsMax: 5 };
    case "Endurance":
      return { sets: 3, repsMin: 15, repsMax: 20 };
  }
}

/**
 * Rebalance exercises across sessions to ensure even distribution
 * Prefers balanced distributions like [4,4,5] over [3,3,6]
 */
function rebalanceExercisesAcrossSessions(
  sessionExerciseLists: Exercise[][],
  sessionTemplates: Array<{ muscles: MuscleGroup[] }>
): void {
  // Keep rebalancing until distribution is within 1 exercise difference
  let maxIterations = 10; // Prevent infinite loops
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    // Calculate current distribution
    const counts = sessionExerciseLists.map((list) => list.length);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);

    // Stop if balanced (difference <= 1)
    if (maxCount - minCount <= 1) {
      return;
    }

    // Find sessions that are over-represented and under-represented
    const overloadedIndices = counts
      .map((count, idx) => ({ count, idx }))
      .filter((item) => item.count > minCount + 1)
      .sort((a, b) => b.count - a.count);

    const underloadedIndices = counts
      .map((count, idx) => ({ count, idx }))
      .filter((item) => item.count === minCount);

    if (overloadedIndices.length === 0 || underloadedIndices.length === 0) {
      // Can't rebalance further
      return;
    }

    let moved = false;

    // Try to move exercises from overloaded to underloaded sessions
    for (const overloaded of overloadedIndices) {
      for (const underloaded of underloadedIndices) {
        const overloadedList = sessionExerciseLists[overloaded.idx];
        const underloadedList = sessionExerciseLists[underloaded.idx];
        const underloadedTemplate = sessionTemplates[underloaded.idx];

        // Find an exercise in overloaded session that's compatible with underloaded session
        const movableExerciseIdx = overloadedList.findIndex((ex) =>
          ex.muscle_groups.some((mg) => underloadedTemplate.muscles.includes(mg))
        );

        if (movableExerciseIdx !== -1) {
          const exercise = overloadedList[movableExerciseIdx];

          // Check if not already in underloaded session
          const alreadyExists = underloadedList.some((ex) => ex.id === exercise.id);

          if (!alreadyExists) {
            // Move exercise
            overloadedList.splice(movableExerciseIdx, 1);
            underloadedList.push(exercise);
            moved = true;
            break; // Exit inner loop to recalculate in next iteration
          }
        }
      }

      if (moved) {
        break; // Exit outer loop to recalculate in next iteration
      }
    }

    // If nothing was moved, we can't balance further
    if (!moved) {
      return;
    }
  }
}

/**
 * Find a session that is not consecutive to the source session
 * and is compatible with the given exercise
 * 
 * @param sourceSessionIdx - The index of the session to find an alternative for
 * @param exercise - The exercise that needs to be moved
 * @param sessionTemplates - All session templates
 * @param sessionExerciseLists - Current exercise assignments for all sessions
 * @param maxExercises - Maximum exercises allowed per session
 * @returns Session index to move to, or null if none found
 */
function findNonConsecutiveSession(
  sourceSessionIdx: number,
  exercise: Exercise,
  sessionTemplates: SessionTemplate[],
  sessionExerciseLists: Exercise[][],
  maxExercises: number
): number | null {
  const sourceDayOfWeek = sessionTemplates[sourceSessionIdx].dayOfWeek;

  // First pass: Find non-consecutive sessions without high-recovery exercises
  for (let i = 0; i < sessionTemplates.length; i++) {
    if (i === sourceSessionIdx) continue;

    const targetDayOfWeek = sessionTemplates[i].dayOfWeek;
    const isConsecutive = Math.abs(targetDayOfWeek - sourceDayOfWeek) === 1;

    if (isConsecutive) continue;

    // Check muscle compatibility
    const isCompatible = exercise.muscle_groups.some((mg) =>
      sessionTemplates[i].muscles.includes(mg)
    );
    if (!isCompatible) continue;

    // Check capacity
    if (sessionExerciseLists[i].length >= maxExercises) continue;

    // Check if exercise already exists in this session
    const alreadyExists = sessionExerciseLists[i].some((ex) => ex.id === exercise.id);
    if (alreadyExists) continue;

    // Prefer sessions without high-recovery exercises
    const hasHighRecovery = sessionExerciseLists[i].some(isHighRecoveryExercise);
    if (!hasHighRecovery) {
      return i;
    }
  }

  // Second pass: Any non-consecutive compatible session with room
  for (let i = 0; i < sessionTemplates.length; i++) {
    if (i === sourceSessionIdx) continue;

    const targetDayOfWeek = sessionTemplates[i].dayOfWeek;
    const isConsecutive = Math.abs(targetDayOfWeek - sourceDayOfWeek) === 1;

    if (isConsecutive) continue;

    const isCompatible = exercise.muscle_groups.some((mg) =>
      sessionTemplates[i].muscles.includes(mg)
    );

    if (!isCompatible) continue;

    if (sessionExerciseLists[i].length >= maxExercises) continue;

    const alreadyExists = sessionExerciseLists[i].some((ex) => ex.id === exercise.id);
    if (alreadyExists) continue;

    return i;
  }

  return null;
}

/**
 * Check if adding an exercise to a session would violate high-recovery spacing rules
 * For 4-5 day splits, high-recovery exercises shouldn't appear on consecutive days
 * 
 * @param sessionIdx - The session we want to add to
 * @param exercise - The exercise we want to add
 * @param sessionTemplates - All session templates
 * @param sessionExerciseLists - Current exercise assignments
 * @param frequency - Training frequency
 * @returns true if adding would violate spacing, false if safe to add
 */
function wouldViolateHighRecoverySpacing(
  sessionIdx: number,
  exercise: Exercise,
  sessionTemplates: SessionTemplate[],
  sessionExerciseLists: Exercise[][],
  frequency: number
): boolean {
  // Only apply to 4-5 day splits and high-recovery exercises
  if (frequency < 4 || !isHighRecoveryExercise(exercise)) {
    return false;
  }

  const currentDayOfWeek = sessionTemplates[sessionIdx].dayOfWeek;

  // Check if this exercise exists in any consecutive session
  for (let i = 0; i < sessionTemplates.length; i++) {
    if (i === sessionIdx) continue;

    const otherDayOfWeek = sessionTemplates[i].dayOfWeek;
    const isConsecutive = Math.abs(otherDayOfWeek - currentDayOfWeek) === 1;

    if (isConsecutive) {
      // Check if the same exercise exists in this consecutive session
      const exerciseExistsInConsecutive = sessionExerciseLists[i].some(
        (ex) => ex.id === exercise.id
      );

      if (exerciseExistsInConsecutive) {
        return true; // Would violate spacing
      }
    }
  }

  return false; // Safe to add
}

/**
 * Generate workout program from user-customized exercises
 * Uses flat array of exercises selected by the user
 * Intelligently distributes exercises across sessions ensuring ALL exercises are included
 * Enforces minimum 4 and maximum 6 exercises per session with intelligent repetition
 */
export function generateWorkoutProgramFromCustomExercises(
  input: GenerationInput,
  customExercises: Exercise[]
): WorkoutProgram {
  const { frequency, focus } = input;

  // Get training split and muscle distribution
  const sessionTemplates = distributeMuscleGroups(frequency);

  // Get sets/reps scheme
  const scheme = getSetsRepsScheme(focus);

  // Validate muscle group coverage (soft validation - warning only)
  validateMuscleGroupCoverage(customExercises, frequency);

  // Track which exercises have been assigned to ensure all are included
  const assignedExercises = new Set<number>();
  const MAX_EXERCISES_PER_SESSION = 6; // Maximum exercises per session
  const MIN_EXERCISES_PER_SESSION = 4; // Minimum exercises per session

  // First pass: assign exercises with primary muscle matches
  const sessionExerciseLists: Exercise[][] = sessionTemplates.map((template) => {
    // Get exercises where PRIMARY muscle matches session targets
    const primaryMatches = customExercises.filter(
      (exercise) =>
        template.muscles.includes(exercise.muscle_groups[0]) &&
        !assignedExercises.has(exercise.id)
    );

    const sorted = primaryMatches.sort((a, b) => a.priority - b.priority);

    // Take up to max exercises per session
    const selected = sorted.slice(0, MAX_EXERCISES_PER_SESSION);
    selected.forEach((ex) => assignedExercises.add(ex.id));

    return selected;
  });

  // Second pass: distribute remaining exercises (secondary muscle matches)
  const unassignedExercises = customExercises.filter(
    (ex) => !assignedExercises.has(ex.id)
  );

  if (unassignedExercises.length > 0) {
    // Sort sessions by how many slots they have available
    const sessionIndices = sessionTemplates.map((_, idx) => idx);
    sessionIndices.sort(
      (a, b) => sessionExerciseLists[a].length - sessionExerciseLists[b].length
    );

    // Distribute unassigned exercises to sessions with available slots
    for (const exercise of unassignedExercises) {
      // Find sessions that target any of this exercise's muscle groups
      const compatibleSessions = sessionIndices.filter((idx) => {
        const template = sessionTemplates[idx];
        return (
          exercise.muscle_groups.some((mg) => template.muscles.includes(mg)) &&
          sessionExerciseLists[idx].length < MAX_EXERCISES_PER_SESSION
        );
      });

      if (compatibleSessions.length > 0) {
        // Assign to the session with fewest exercises
        const targetSession = compatibleSessions[0];
        sessionExerciseLists[targetSession].push(exercise);
        assignedExercises.add(exercise.id);

        // Re-sort after modification
        sessionIndices.sort(
          (a, b) =>
            sessionExerciseLists[a].length - sessionExerciseLists[b].length
        );
      }
      // If no compatible sessions with space, exercise cannot be assigned
      // This is logged as a warning after the loop
    }
  }

  // Rebalance exercises for even distribution (e.g., [4,4,5] instead of [3,3,6])
  rebalanceExercisesAcrossSessions(sessionExerciseLists, sessionTemplates);

  // Third pass: Ensure minimum exercises per session through repetition
  // Simple, robust approach: Keep adding exercises until all sessions meet minimum
  let ensureMinimumIterations = 0;
  const maxEnsureIterations = 50;

  while (ensureMinimumIterations < maxEnsureIterations) {
    ensureMinimumIterations++;

    // Find sessions below minimum
    const sessionsNeedingMore = sessionTemplates
      .map((_, idx) => idx)
      .filter((idx) => sessionExerciseLists[idx].length < MIN_EXERCISES_PER_SESSION)
      .sort((a, b) => sessionExerciseLists[a].length - sessionExerciseLists[b].length);

    if (sessionsNeedingMore.length === 0) {
      break; // All sessions meet minimum
    }

    // Build pool of exercises to add (unassigned first, then assigned for repetition)
    const unassignedPool = customExercises.filter((ex) => !assignedExercises.has(ex.id));
    const assignedPool = customExercises
      .filter((ex) => assignedExercises.has(ex.id))
      .sort((a, b) => a.priority - b.priority);

    const exercisePool = [...unassignedPool, ...assignedPool];

    if (exercisePool.length === 0) {
      break; // No exercises available
    }

    let addedInThisIteration = false;

    // Try to add one exercise to each session needing more
    for (const sessionIdx of sessionsNeedingMore) {
      const sessionList = sessionExerciseLists[sessionIdx];
      const template = sessionTemplates[sessionIdx];

      if (sessionList.length >= MAX_EXERCISES_PER_SESSION) {
        continue; // Session is at max
      }

      // Try to find a compatible exercise not already in this session
      let added = false;
      for (const exercise of exercisePool) {
        const isCompatible = exercise.muscle_groups.some((mg) =>
          template.muscles.includes(mg)
        );
        const alreadyInSession = sessionList.some((ex) => ex.id === exercise.id);
        
        // Check if adding would violate high-recovery spacing
        const wouldViolateSpacing = wouldViolateHighRecoverySpacing(
          sessionIdx,
          exercise,
          sessionTemplates,
          sessionExerciseLists,
          frequency
        );

        if (isCompatible && !alreadyInSession && !wouldViolateSpacing) {
          sessionList.push(exercise);
          assignedExercises.add(exercise.id);
          addedInThisIteration = true;
          added = true;
          break;
        }
      }

      // If no compatible exercise found, add any exercise not in this session
      if (!added) {
        for (const exercise of exercisePool) {
          const alreadyInSession = sessionList.some((ex) => ex.id === exercise.id);
          
          // Check spacing even for non-compatible exercises
          const wouldViolateSpacing = wouldViolateHighRecoverySpacing(
            sessionIdx,
            exercise,
            sessionTemplates,
            sessionExerciseLists,
            frequency
          );
          
          if (!alreadyInSession && !wouldViolateSpacing) {
            sessionList.push(exercise);
            assignedExercises.add(exercise.id);
            addedInThisIteration = true;
            break;
          }
        }
      }
    }

    // If we couldn't add anything, stop trying
    if (!addedInThisIteration) {
      break;
    }
  }

  // High-recovery exercise spacing (for 4-5 day splits only)
  // Prevents the SAME high-recovery exercise from appearing on consecutive days
  // It's OK to have different high-recovery exercises on consecutive days
  if (frequency >= 4) {
    const { getConsecutiveDayPairs } = require("./muscle-groups");
    const consecutivePairs = getConsecutiveDayPairs(sessionTemplates);

    for (const [dayA, dayB] of consecutivePairs) {
      const exercisesInA = sessionExerciseLists[dayA];
      const exercisesInB = sessionExerciseLists[dayB];

      // Find high-recovery exercises that appear in BOTH consecutive days
      const highRecoveryInA = exercisesInA.filter(isHighRecoveryExercise);
      const duplicateHighRecovery = highRecoveryInA.filter((exA) =>
        exercisesInB.some((exB) => exB.id === exA.id && isHighRecoveryExercise(exB))
      );

      // Move duplicate high-recovery exercises from dayB to a non-consecutive day
      for (const exerciseToMove of duplicateHighRecovery) {
        const alternateSession = findNonConsecutiveSession(
          dayB,
          exerciseToMove,
          sessionTemplates,
          sessionExerciseLists,
          MAX_EXERCISES_PER_SESSION
        );

        if (alternateSession !== null) {
          // Remove from dayB
          const exerciseIndex = sessionExerciseLists[dayB].findIndex(
            (ex) => ex.id === exerciseToMove.id
          );
          if (exerciseIndex !== -1) {
            sessionExerciseLists[dayB].splice(exerciseIndex, 1);
            // Add to alternate session
            sessionExerciseLists[alternateSession].push(exerciseToMove);
            console.log(
              `Spacing: Moved ${exerciseToMove.name} from session ${dayB + 1} to ${alternateSession + 1} to avoid back-to-back heavy lifting`
            );
          }
        } else {
          // Try moving from dayA instead
          const alternateForA = findNonConsecutiveSession(
            dayA,
            exerciseToMove,
            sessionTemplates,
            sessionExerciseLists,
            MAX_EXERCISES_PER_SESSION
          );

          if (alternateForA !== null) {
            const exerciseIndex = sessionExerciseLists[dayA].findIndex(
              (ex) => ex.id === exerciseToMove.id
            );
            if (exerciseIndex !== -1) {
              sessionExerciseLists[dayA].splice(exerciseIndex, 1);
              sessionExerciseLists[alternateForA].push(exerciseToMove);
              console.log(
                `Spacing: Moved ${exerciseToMove.name} from session ${dayA + 1} to ${alternateForA + 1} to avoid back-to-back heavy lifting`
              );
            }
          } else {
            // Could not find alternative - log warning but continue
            console.warn(
              `Warning: Could not space high-recovery exercise ${exerciseToMove.name} appearing on consecutive days ${dayA + 1} and ${dayB + 1}`
            );
          }
        }
      }
    }
  }

  // Generate final sessions with now ordered exercises
  const sessions: ProgramSession[] = sessionTemplates.map((template, index) => {
    const sessionExercises = sessionExerciseLists[index];

    // Order and create program exercises
    const orderedExercises = orderExercises(sessionExercises);
    const programExercises: ProgramExercise[] = orderedExercises.map(
      (exercise, idx) => ({
        exercise,
        sets: scheme.sets,
        repsMin: scheme.repsMin,
        repsMax: scheme.repsMax,
        order: idx + 1,
      })
    );

    return {
      name: template.name,
      dayOfWeek: template.dayOfWeek,
      exercises: programExercises,
      primaryMuscles: template.muscles,
    };
  });

  // Warn if not all exercises were assigned
  if (assignedExercises.size < customExercises.length) {
    const unassigned = customExercises.filter(
      (ex) => !assignedExercises.has(ex.id)
    );
    console.warn(
      `Warning: ${unassigned.length} exercises could not be assigned:`,
      unassigned.map((ex) => ex.name)
    );
  }

  // Create program name
  const programName = `${focus} Program (${frequency}x/week)`;

  return {
    name: programName,
    focus,
    durationWeeks: 8,
    sessionsPerWeek: frequency,
    sessions,
  };
}

/**
 * Extract all unique exercises from a workout program
 * Returns flat array of exercises in program order
 */
export function extractExercisesFromProgram(program: WorkoutProgram): Exercise[] {
  const exerciseIds = new Set<number>();
  const exercises: Exercise[] = [];

  // Iterate through sessions in order
  program.sessions.forEach((session) => {
    session.exercises.forEach((programEx) => {
      // Only add if not already included (avoid duplicates)
      if (!exerciseIds.has(programEx.exercise.id)) {
        exerciseIds.add(programEx.exercise.id);
        exercises.push(programEx.exercise);
      }
    });
  });

  return exercises;
}

/**
 * Validate muscle group coverage (soft validation - warning only)
 */
function validateMuscleGroupCoverage(
  exercises: Exercise[],
  frequency: number
): boolean {
  const { getMuscleGroupsForFrequency } = require("./muscle-groups");
  const requiredMuscleGroups = getMuscleGroupsForFrequency(frequency);
  const coveredMuscleGroups = new Set<MuscleGroup>();

  exercises.forEach((ex) => {
    ex.muscle_groups.forEach((mg) => coveredMuscleGroups.add(mg));
  });

  const missingGroups = requiredMuscleGroups.filter(
    (mg: MuscleGroup) => !coveredMuscleGroups.has(mg)
  );

  if (missingGroups.length > 0) {
    console.warn(`Warning: Missing coverage for: ${missingGroups.join(", ")}`);
    return false;
  }

  return true;
}

/**
 * Save workout program to storage
 * Returns the created plan ID
 */
export function saveWorkoutProgram(program: WorkoutProgram): number {
  // Collect all unique equipment used across all exercises in the program
  const equipmentSet = new Set<Equipment>();
  program.sessions.forEach((session) => {
    session.exercises.forEach((programEx) => {
      if (programEx.exercise.equipment_required) {
        equipmentSet.add(programEx.exercise.equipment_required);
      }
    });
  });
  const equipment_used = Array.from(equipmentSet);

  // Insert workout plan
  const planId = insertWorkoutPlan({
    name: program.name,
    description: `${program.focus} training program`,
    weekly_frequency: program.sessionsPerWeek,
    duration_weeks: program.durationWeeks,
    estimated_duration_minutes: 60,
    focus: program.focus,
    equipment_used,
    created_at: new Date().toISOString(),
    is_active: true,
  });

  // Insert session templates
  program.sessions.forEach((session, sessionIndex) => {
    const sessionTemplateId = insertSessionTemplate({
      workout_plan_id: planId,
      sequence_order: sessionIndex + 1,
      name: session.name,
      target_muscle_groups: JSON.stringify(session.primaryMuscles),
      estimated_duration_minutes: 60,
    });

    // Insert exercises for this session
    session.exercises.forEach((programEx) => {
      insertExerciseTemplate({
        session_template_id: sessionTemplateId,
        exercise_id: programEx.exercise.id,
        exercise_order: programEx.order,
        sets: programEx.sets,
        reps: programEx.repsMax, // Use max reps as target
        is_warmup: false,
      });
    });
  });

  console.log(`Workout plan saved with ID: ${planId}`);
  console.log(`Program: ${program.name}`);
  console.log(`Sessions: ${program.sessions.length}`);
  program.sessions.forEach((session, i) => {
    console.log(`  Session ${i + 1}: ${session.name} - ${session.exercises.length} exercises`);
  });

  return planId;
}
