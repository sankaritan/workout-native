import type { Exercise, MuscleGroup } from "../../../lib/storage/types";
import { distributeMuscleGroups } from "./muscle-groups";
import { orderExercises } from "./exercise-selector";
import type { GenerationInput, WorkoutProgram, ProgramSession, ProgramExercise } from "./types";
import type { SessionTemplate } from "./muscle-groups";

/**
 * Determines if an exercise requires significant recovery time
 * Currently: Priority 1 + Barbell equipment (the "big 4" lifts: Bench, Squat, Deadlift, Barbell Row)
 */
function isHighRecoveryExercise(exercise: Exercise): boolean {
  return exercise.priority === 1 && exercise.equipment_required === "Barbell";
}

export interface AssignmentReason {
  exerciseId: number;
  exerciseName: string;
  primaryMuscle: MuscleGroup;
  assignedSessionIndex: number;
  assignedSessionName: string;
  pass: "primary" | "secondary" | "rebalance" | "minimum";
  reason: string;
}

export interface OrderingReason {
  exerciseId: number;
  exerciseName: string;
  sessionIndex: number;
  sessionName: string;
  order: number;
  reason: string;
}

export interface SplitDiagnostics {
  assignments: AssignmentReason[];
  ordering: OrderingReason[];
  unassigned: Exercise[];
}

export function getSetsRepsScheme(
  focus: "Balanced" | "Strength" | "Endurance"
): { sets: number; repsMin: number; repsMax: number } {
  switch (focus) {
    case "Balanced":
      return { sets: 3, repsMin: 8, repsMax: 12 };
    case "Strength":
      return { sets: 5, repsMin: 3, repsMax: 5 };
    case "Endurance":
      return { sets: 3, repsMin: 15, repsMax: 20 };
  }
}

function rebalanceExercisesAcrossSessions(
  sessionExerciseLists: Exercise[][],
  sessionTemplates: Array<{ name?: string; muscles: MuscleGroup[] }>,
  diagnostics: SplitDiagnostics
): void {
  let maxIterations = 10;
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    const counts = sessionExerciseLists.map((list) => list.length);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);

    if (maxCount - minCount <= 1) {
      return;
    }

    const overloadedIndices = counts
      .map((count, idx) => ({ count, idx }))
      .filter((item) => item.count > minCount + 1)
      .sort((a, b) => b.count - a.count);

    const underloadedIndices = counts
      .map((count, idx) => ({ count, idx }))
      .filter((item) => item.count === minCount);

    if (overloadedIndices.length === 0 || underloadedIndices.length === 0) {
      return;
    }

    let moved = false;

    for (const overloaded of overloadedIndices) {
      for (const underloaded of underloadedIndices) {
        const overloadedList = sessionExerciseLists[overloaded.idx];
        const underloadedList = sessionExerciseLists[underloaded.idx];
        const underloadedTemplate = sessionTemplates[underloaded.idx];

        const movableExerciseIdx = overloadedList.findIndex((ex) =>
          ex.muscle_groups.some((mg) => underloadedTemplate.muscles.includes(mg))
        );

        if (movableExerciseIdx !== -1) {
          const exercise = overloadedList[movableExerciseIdx];
          const alreadyExists = underloadedList.some((ex) => ex.id === exercise.id);

          if (!alreadyExists) {
            overloadedList.splice(movableExerciseIdx, 1);
            underloadedList.push(exercise);
            diagnostics.assignments.push({
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              primaryMuscle: exercise.muscle_groups[0],
              assignedSessionIndex: underloaded.idx,
              assignedSessionName:
                sessionTemplates[underloaded.idx]?.name ??
                `Session ${underloaded.idx + 1}`,
              pass: "rebalance",
              reason: `Moved from session ${overloaded.idx + 1} to balance counts`,
            });
            moved = true;
            break;
          }
        }
      }

      if (moved) {
        break;
      }
    }

    if (!moved) {
      return;
    }
  }
}

/**
 * Find a session that is not consecutive to the source session
 * and is compatible with the given exercise
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

    const isCompatible = exercise.muscle_groups.some((mg) =>
      sessionTemplates[i].muscles.includes(mg)
    );
    if (!isCompatible) continue;

    if (sessionExerciseLists[i].length >= maxExercises) continue;

    const alreadyExists = sessionExerciseLists[i].some((ex) => ex.id === exercise.id);
    if (alreadyExists) continue;

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
 */
function wouldViolateHighRecoverySpacing(
  sessionIdx: number,
  exercise: Exercise,
  sessionTemplates: SessionTemplate[],
  sessionExerciseLists: Exercise[][],
  frequency: number
): boolean {
  if (frequency < 4 || !isHighRecoveryExercise(exercise)) {
    return false;
  }

  const currentDayOfWeek = sessionTemplates[sessionIdx].dayOfWeek;

  for (let i = 0; i < sessionTemplates.length; i++) {
    if (i === sessionIdx) continue;

    const otherDayOfWeek = sessionTemplates[i].dayOfWeek;
    const isConsecutive = Math.abs(otherDayOfWeek - currentDayOfWeek) === 1;

    if (isConsecutive) {
      const exerciseExistsInConsecutive = sessionExerciseLists[i].some(
        (ex) => ex.id === exercise.id
      );

      if (exerciseExistsInConsecutive) {
        return true;
      }
    }
  }

  return false;
}

export function generateWorkoutProgramFromCustomExercises(
  input: GenerationInput,
  customExercises: Exercise[]
): { program: WorkoutProgram; diagnostics: SplitDiagnostics } {
  const { frequency, focus } = input;
  const sessionTemplates = distributeMuscleGroups(frequency);
  const scheme = getSetsRepsScheme(focus);

  const diagnostics: SplitDiagnostics = {
    assignments: [],
    ordering: [],
    unassigned: [],
  };

  const assignedExercises = new Set<number>();
  const MAX_EXERCISES_PER_SESSION = 6;
  const MIN_EXERCISES_PER_SESSION = 4;

  const sessionExerciseLists: Exercise[][] = sessionTemplates.map((template, idx) => {
    const primaryMatches = customExercises.filter(
      (exercise) =>
        template.muscles.includes(exercise.muscle_groups[0]) &&
        !assignedExercises.has(exercise.id)
    );

    const sorted = primaryMatches.sort((a, b) => a.priority - b.priority);

    const selected = sorted.slice(0, MAX_EXERCISES_PER_SESSION);
    selected.forEach((ex) => assignedExercises.add(ex.id));

    selected.forEach((exercise) => {
      diagnostics.assignments.push({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        primaryMuscle: exercise.muscle_groups[0],
        assignedSessionIndex: idx,
        assignedSessionName: sessionTemplates[idx]?.name ?? `Session ${idx + 1}`,
        pass: "primary",
        reason: `Primary muscle ${exercise.muscle_groups[0]} matches session`,
      });
    });

    return selected;
  });

  const unassignedExercises = customExercises.filter(
    (ex) => !assignedExercises.has(ex.id)
  );

  if (unassignedExercises.length > 0) {
    const sessionIndices = sessionTemplates.map((_, idx) => idx);
    sessionIndices.sort(
      (a, b) => sessionExerciseLists[a].length - sessionExerciseLists[b].length
    );

    for (const exercise of unassignedExercises) {
      const compatibleSessions = sessionIndices.filter((idx) => {
        const template = sessionTemplates[idx];
        return (
          exercise.muscle_groups.some((mg) => template.muscles.includes(mg)) &&
          sessionExerciseLists[idx].length < MAX_EXERCISES_PER_SESSION
        );
      });

      if (compatibleSessions.length > 0) {
        const targetSession = compatibleSessions[0];
        sessionExerciseLists[targetSession].push(exercise);
        assignedExercises.add(exercise.id);

        diagnostics.assignments.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          primaryMuscle: exercise.muscle_groups[0],
          assignedSessionIndex: targetSession,
          assignedSessionName: sessionTemplates[targetSession]?.name ??
            `Session ${targetSession + 1}`,
          pass: "secondary",
          reason: `Secondary muscle match, assigned to least-loaded compatible session`,
        });

        sessionIndices.sort(
          (a, b) =>
            sessionExerciseLists[a].length - sessionExerciseLists[b].length
        );
      }
    }
  }

  rebalanceExercisesAcrossSessions(sessionExerciseLists, sessionTemplates, diagnostics);

  let ensureMinimumIterations = 0;
  const maxEnsureIterations = 50;

  while (ensureMinimumIterations < maxEnsureIterations) {
    ensureMinimumIterations++;

    const sessionsNeedingMore = sessionTemplates
      .map((_, idx) => idx)
      .filter((idx) => sessionExerciseLists[idx].length < MIN_EXERCISES_PER_SESSION)
      .sort((a, b) => sessionExerciseLists[a].length - sessionExerciseLists[b].length);

    if (sessionsNeedingMore.length === 0) {
      break;
    }

    const unassignedPool = customExercises.filter((ex) => !assignedExercises.has(ex.id));
    const assignedPool = customExercises
      .filter((ex) => assignedExercises.has(ex.id))
      .sort((a, b) => a.priority - b.priority);

    const exercisePool = [...unassignedPool, ...assignedPool];

    if (exercisePool.length === 0) {
      break;
    }

    let addedInThisIteration = false;

    for (const sessionIdx of sessionsNeedingMore) {
      const sessionList = sessionExerciseLists[sessionIdx];
      const template = sessionTemplates[sessionIdx];

      if (sessionList.length >= MAX_EXERCISES_PER_SESSION) {
        continue;
      }

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
          diagnostics.assignments.push({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            primaryMuscle: exercise.muscle_groups[0],
            assignedSessionIndex: sessionIdx,
            assignedSessionName: sessionTemplates[sessionIdx]?.name ??
              `Session ${sessionIdx + 1}`,
            pass: "minimum",
            reason: "Added to satisfy minimum exercises per session (compatible)",
          });
          addedInThisIteration = true;
          added = true;
          break;
        }
      }

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
            diagnostics.assignments.push({
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              primaryMuscle: exercise.muscle_groups[0],
              assignedSessionIndex: sessionIdx,
              assignedSessionName: sessionTemplates[sessionIdx]?.name ??
                `Session ${sessionIdx + 1}`,
              pass: "minimum",
              reason: "Added to satisfy minimum exercises per session (fallback)",
            });
            addedInThisIteration = true;
            break;
          }
        }
      }
    }

    if (!addedInThisIteration) {
      break;
    }
  }

  // High-recovery exercise spacing (for 4-5 day splits only)
  // Prevents the SAME high-recovery exercise from appearing on consecutive days
  if (frequency >= 4) {
    const { getConsecutiveDayPairs } = require("./muscle-groups");
    const consecutivePairs = getConsecutiveDayPairs(sessionTemplates);

    for (const [dayA, dayB] of consecutivePairs) {
      const exercisesInA = sessionExerciseLists[dayA];
      const exercisesInB = sessionExerciseLists[dayB];

      const highRecoveryInA = exercisesInA.filter(isHighRecoveryExercise);
      const duplicateHighRecovery = highRecoveryInA.filter((exA) =>
        exercisesInB.some((exB) => exB.id === exA.id && isHighRecoveryExercise(exB))
      );

      for (const exerciseToMove of duplicateHighRecovery) {
        const alternateSession = findNonConsecutiveSession(
          dayB,
          exerciseToMove,
          sessionTemplates,
          sessionExerciseLists,
          MAX_EXERCISES_PER_SESSION
        );

        if (alternateSession !== null) {
          const exerciseIndex = sessionExerciseLists[dayB].findIndex(
            (ex) => ex.id === exerciseToMove.id
          );
          if (exerciseIndex !== -1) {
            sessionExerciseLists[dayB].splice(exerciseIndex, 1);
            sessionExerciseLists[alternateSession].push(exerciseToMove);
            
            diagnostics.assignments.push({
              exerciseId: exerciseToMove.id,
              exerciseName: exerciseToMove.name,
              primaryMuscle: exerciseToMove.muscle_groups[0],
              assignedSessionIndex: alternateSession,
              assignedSessionName: sessionTemplates[alternateSession]?.name ??
                `Session ${alternateSession + 1}`,
              pass: "minimum",
              reason: `Moved from session ${dayB + 1} to avoid high-recovery exercise on consecutive days`,
            });
          }
        } else {
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
              
              diagnostics.assignments.push({
                exerciseId: exerciseToMove.id,
                exerciseName: exerciseToMove.name,
                primaryMuscle: exerciseToMove.muscle_groups[0],
                assignedSessionIndex: alternateForA,
                assignedSessionName: sessionTemplates[alternateForA]?.name ??
                  `Session ${alternateForA + 1}`,
                pass: "minimum",
                reason: `Moved from session ${dayA + 1} to avoid high-recovery exercise on consecutive days`,
              });
            }
          }
        }
      }
    }
  }

  const sessions: ProgramSession[] = sessionTemplates.map((template, index) => {
    const sessionExercises = sessionExerciseLists[index];
    const orderedExercises = orderExercises(sessionExercises);

    orderedExercises.forEach((exercise, idx) => {
      diagnostics.ordering.push({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sessionIndex: index,
        sessionName: template.name,
        order: idx + 1,
        reason: `Priority ${exercise.priority} ordering`,
      });
    });

    const programExercises: ProgramExercise[] = orderedExercises.map((exercise, idx) => ({
      exercise,
      sets: scheme.sets,
      repsMin: scheme.repsMin,
      repsMax: scheme.repsMax,
      order: idx + 1,
    }));

    return {
      name: template.name,
      dayOfWeek: template.dayOfWeek,
      exercises: programExercises,
      primaryMuscles: template.muscles,
    };
  });

  if (assignedExercises.size < customExercises.length) {
    diagnostics.unassigned = customExercises.filter(
      (ex) => !assignedExercises.has(ex.id)
    );
  }

  const programName = `${focus} Program (${frequency}x/week)`;

  return {
    program: {
      name: programName,
      focus,
      durationWeeks: 8,
      sessionsPerWeek: frequency,
      sessions,
    },
    diagnostics,
  };
}
