import type { Exercise, MuscleGroup, Equipment } from "../../../lib/storage/types";
import { getMuscleGroupsForFrequency } from "./muscle-groups";

export interface SelectionReason {
  exerciseId: number;
  exerciseName: string;
  primaryMuscle: MuscleGroup;
  equipment: Equipment | null;
  isCompound: boolean;
  reason: string;
}

export interface SelectionDiagnostics {
  filteredByEquipment: number;
  relevantMuscles: MuscleGroup[];
  reasons: SelectionReason[];
}

export function filterExercisesByEquipment(
  exercises: Exercise[],
  availableEquipment: Equipment[]
): Exercise[] {
  return exercises.filter(
    (exercise) =>
      exercise.equipment_required === "Bodyweight" ||
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
    if (a.is_compound && !b.is_compound) return -1;
    if (!a.is_compound && b.is_compound) return 1;
    return 0;
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

  for (const muscleGroup of relevantMuscleGroups) {
    const muscleExercises = filterExercisesByPrimaryMuscle(
      filteredByEquipment,
      muscleGroup
    );

    const sorted = orderExercises(muscleExercises);
    const chosen = sorted.slice(0, 2);

    chosen.forEach((exercise, index) => {
      selected.push(exercise);
      reasons.push({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        primaryMuscle: exercise.muscle_groups[0],
        equipment: exercise.equipment_required,
        isCompound: exercise.is_compound,
        reason: `${muscleGroup} slot ${index + 1}/2, ${
          exercise.is_compound ? "compound" : "isolation"
        } priority`,
      });
    });
  }

  return {
    selected,
    diagnostics: {
      filteredByEquipment: filteredByEquipment.length,
      relevantMuscles: relevantMuscleGroups,
      reasons,
    },
  };
}
