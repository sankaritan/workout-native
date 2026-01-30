/**
 * Workout Generation Engine
 * Core algorithm for creating personalized workout programs
 */

import {
  getAllExercises,
  insertWorkoutPlan,
  insertSessionTemplate,
  insertExerciseTemplate,
} from "@/lib/storage/storage";
import { distributeMuscleGroups } from "./muscle-groups";
import {
  filterExercisesByEquipment,
  selectExercisesForMuscles,
  orderExercises,
} from "./exercise-selector";
import type {
  GenerationInput,
  WorkoutProgram,
  ProgramSession,
  ProgramExercise,
  SetsRepsScheme,
} from "./types";
import type { Exercise, MuscleGroup } from "@/lib/storage/types";

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
 * Generate complete workout program
 * Main entry point for workout generation
 */
export function generateWorkoutProgram(
  input: GenerationInput
): WorkoutProgram {
  const { frequency, equipment, focus } = input;

  // Get all exercises from database
  const allExercises = getAllExercises();

  // Filter exercises by available equipment
  const availableExercises = filterExercisesByEquipment(allExercises, equipment);

  // Get training split and muscle distribution
  const sessionTemplates = distributeMuscleGroups(frequency);

  // Get sets/reps scheme
  const scheme = getSetsRepsScheme(focus);

  // Generate sessions
  const sessions: ProgramSession[] = sessionTemplates.map((template) => {
    // Select exercises for this session's muscle groups
    const maxExercisesPerSession = 5;
    const selectedExercises = selectExercisesForMuscles(
      availableExercises,
      template.muscles,
      maxExercisesPerSession
    );

    // Order exercises (compound first)
    const orderedExercises = orderExercises(selectedExercises);

    // Create program exercises with sets/reps
    const programExercises: ProgramExercise[] = orderedExercises.map(
      (exercise, index) => ({
        exercise,
        sets: scheme.sets,
        repsMin: scheme.repsMin,
        repsMax: scheme.repsMax,
        order: index + 1, // 1-based ordering
      })
    );

    return {
      name: template.name,
      dayOfWeek: template.dayOfWeek,
      exercises: programExercises,
      primaryMuscles: template.muscles,
    };
  });

  // Create program name
  const programName = `${focus} Program (${frequency}x/week)`;

  return {
    name: programName,
    focus,
    durationWeeks: 8, // Default 8 weeks (can be made configurable later)
    sessionsPerWeek: frequency,
    sessions,
  };
}

/**
 * Build a balanced pool of exercises for repetition across sessions
 * Prioritizes compound exercises and maintains muscle group balance
 */
function buildBalancedRepetitionPool(
  candidatesForRepetition: Exercise[],
  totalNeeded: number,
  sessionTemplates: Array<{ muscles: MuscleGroup[] }>
): Exercise[] {
  const repetitionPool: Exercise[] = [];
  const repetitionCounts = new Map<number, number>();

  // Count how many times each exercise appears in candidates
  candidatesForRepetition.forEach((ex) => {
    repetitionCounts.set(ex.id, 0);
  });

  // Build pool by cycling through candidates until we have enough
  let currentIndex = 0;
  while (repetitionPool.length < totalNeeded && candidatesForRepetition.length > 0) {
    const exercise = candidatesForRepetition[currentIndex % candidatesForRepetition.length];
    const currentCount = repetitionCounts.get(exercise.id) || 0;

    // Limit repetitions per exercise (max 2 times to avoid over-representation)
    if (currentCount < 2) {
      repetitionPool.push(exercise);
      repetitionCounts.set(exercise.id, currentCount + 1);
    }

    currentIndex++;

    // Prevent infinite loop if we can't fill the pool
    if (currentIndex > candidatesForRepetition.length * 3) {
      break;
    }
  }

  return repetitionPool;
}

/**
 * Distribute exercises from the repetition pool to sessions needing more exercises
 * Ensures minimum exercises per session while respecting maximum limit
 */
function distributeRepetitionsToSessions(
  repetitionPool: Exercise[],
  sessionExerciseLists: Exercise[][],
  sessionTemplates: Array<{ muscles: MuscleGroup[] }>,
  minExercises: number,
  maxExercises: number
): void {
  if (repetitionPool.length === 0) {
    return; // No exercises to distribute
  }

  // Keep distributing until all sessions meet minimum or we can't add more
  let maxIterations = 100;
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    // Find sessions that need more exercises
    const sessionsNeedingExercises = sessionTemplates
      .map((_, idx) => idx)
      .filter((idx) => sessionExerciseLists[idx].length < minExercises)
      .sort((a, b) => sessionExerciseLists[a].length - sessionExerciseLists[b].length);

    if (sessionsNeedingExercises.length === 0) {
      // All sessions meet minimum
      return;
    }

    let addedExercise = false;

    // Try to add exercises to sessions needing them
    for (const sessionIdx of sessionsNeedingExercises) {
      const sessionList = sessionExerciseLists[sessionIdx];
      const template = sessionTemplates[sessionIdx];

      if (sessionList.length >= maxExercises) {
        continue; // Session is at max capacity
      }

      // First pass: Try to find a compatible exercise
      let foundExercise = false;
      for (const exercise of repetitionPool) {
        const isCompatible = exercise.muscle_groups.some((mg) =>
          template.muscles.includes(mg)
        );

        const alreadyInSession = sessionList.some((ex) => ex.id === exercise.id);

        if (isCompatible && !alreadyInSession) {
          sessionList.push(exercise);
          addedExercise = true;
          foundExercise = true;
          break; // Move to next session
        }
      }

      // Second pass: If no compatible exercise found, add any exercise not already in session
      // This ensures we meet minimum requirements even with less-than-ideal muscle matching
      if (!foundExercise) {
        for (const exercise of repetitionPool) {
          const alreadyInSession = sessionList.some((ex) => ex.id === exercise.id);

          if (!alreadyInSession) {
            sessionList.push(exercise);
            addedExercise = true;
            break; // Move to next session
          }
        }
      }
    }

    // If we couldn't add any exercises, we're done
    if (!addedExercise) {
      return;
    }
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

    // Sort: compound first
    const sorted = primaryMatches.sort((a, b) => {
      if (a.is_compound && !b.is_compound) return -1;
      if (!a.is_compound && b.is_compound) return 1;
      return 0;
    });

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
      .sort((a, b) => {
        // Compound exercises first
        if (a.is_compound && !b.is_compound) return -1;
        if (!a.is_compound && b.is_compound) return 1;
        return 0;
      });

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

        if (isCompatible && !alreadyInSession) {
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
          if (!alreadyInSession) {
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
  // Insert workout plan
  const planId = insertWorkoutPlan({
    name: program.name,
    description: `${program.focus} training program`,
    weekly_frequency: program.sessionsPerWeek,
    duration_weeks: program.durationWeeks,
    estimated_duration_minutes: 60,
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
