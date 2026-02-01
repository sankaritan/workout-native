import type {
  Exercise,
  MuscleGroup,
  Equipment,
  ExercisePriority,
} from "../../../lib/storage/types";
import { getMuscleGroupsForFrequency } from "./muscle-groups";

export interface SelectionReason {
  exerciseId: number;
  exerciseName: string;
  primaryMuscle: MuscleGroup;
  equipment: Equipment | null;
  priority: ExercisePriority;
  reason: string;
}

export interface SelectionDiagnostics {
  filteredByEquipment: number;
  relevantMuscles: MuscleGroup[];
  reasons: SelectionReason[];
  muscleBreakdown: Array<{
    muscle: MuscleGroup;
    candidateCount: number;
    selectedNames: string[];
  }>;
}

export function filterExercisesByEquipment(
  exercises: Exercise[],
  availableEquipment: Equipment[]
): Exercise[] {
  return exercises.filter(
    (exercise) =>
      exercise.equipment_required === null ||
      availableEquipment.includes(exercise.equipment_required)
  );
}

export function filterExercisesByMuscleGroup(
  exercises: Exercise[],
  muscleGroup: MuscleGroup
): Exercise[] {
  return exercises.filter((exercise) =>
    exercise.muscle_groups.includes(muscleGroup)
  );
}

export function filterExercisesByMuscleGroups(
  exercises: Exercise[],
  muscleGroups: MuscleGroup[]
): Exercise[] {
  return exercises.filter((exercise) =>
    exercise.muscle_groups.some((mg) => muscleGroups.includes(mg))
  );
}

export function filterExercisesByPrimaryMuscle(
  exercises: Exercise[],
  muscleGroup: MuscleGroup
): Exercise[] {
  return exercises.filter((exercise) => exercise.muscle_groups[0] === muscleGroup);
}

export function orderExercises(exercises: Exercise[]): Exercise[] {
  return [...exercises].sort((a, b) => {
    // Primary sort: by priority (compounds first)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // Secondary sort: alphabetical by name for consistent ordering
    return a.name.localeCompare(b.name);
  });
}

export function selectInitialExercises(
  availableExercises: Exercise[],
  equipment: Equipment[],
  frequency: number
): { selected: Exercise[]; diagnostics: SelectionDiagnostics } {
  const filteredByEquipment = filterExercisesByEquipment(availableExercises, equipment);
  const relevantMuscleGroups = getMuscleGroupsForFrequency(frequency);

  const selected: Exercise[] = [];
  const reasons: SelectionReason[] = [];
  const muscleBreakdown: Array<{
    muscle: MuscleGroup;
    candidateCount: number;
    selectedNames: string[];
  }> = [];

  for (const muscleGroup of relevantMuscleGroups) {
    const muscleExercises = filterExercisesByPrimaryMuscle(
      filteredByEquipment,
      muscleGroup
    );

    const sorted = orderExercises(muscleExercises);
    const chosen = sorted.slice(0, 2);

    muscleBreakdown.push({
      muscle: muscleGroup,
      candidateCount: muscleExercises.length,
      selectedNames: chosen.map((exercise) => exercise.name),
    });

    chosen.forEach((exercise, index) => {
      selected.push(exercise);
      reasons.push({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        primaryMuscle: exercise.muscle_groups[0],
        equipment: exercise.equipment_required,
        priority: exercise.priority,
        reason: `${muscleGroup} slot ${index + 1}/2, priority ${exercise.priority}`,
      });
    });
  }

  return {
    selected,
    diagnostics: {
      filteredByEquipment: filteredByEquipment.length,
      relevantMuscles: relevantMuscleGroups,
      reasons,
      muscleBreakdown,
    },
  };
}
