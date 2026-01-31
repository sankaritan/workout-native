import type { Exercise, MuscleGroup } from "../../../lib/storage/types";
import { distributeMuscleGroups } from "./muscle-groups";
import { orderExercises } from "./exercise-selector";
import type { GenerationInput, WorkoutProgram, ProgramSession, ProgramExercise } from "./types";

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

    const sorted = primaryMatches.sort((a, b) => {
      if (a.is_compound && !b.is_compound) return -1;
      if (!a.is_compound && b.is_compound) return 1;
      return 0;
    });

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
      .sort((a, b) => {
        if (a.is_compound && !b.is_compound) return -1;
        if (!a.is_compound && b.is_compound) return 1;
        return 0;
      });

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

        if (isCompatible && !alreadyInSession) {
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
          if (!alreadyInSession) {
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
        reason: exercise.is_compound ? "Compound exercises first" : "Isolation after compounds",
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
