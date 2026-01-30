/**
 * Exercise Selection Logic
 * Filters and selects exercises based on equipment and muscle groups
 */

import type { Exercise, MuscleGroup, Equipment } from "@/lib/storage/types";
import { getMuscleGroupsForFrequency } from "./muscle-groups";

/**
 * Filter exercises by available equipment
 * Always includes bodyweight exercises
 */
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

/**
 * Filter exercises by muscle group
 * Checks if exercise works the specified muscle (either primary or secondary)
 */
export function filterExercisesByMuscleGroup(
  exercises: Exercise[],
  muscleGroup: MuscleGroup
): Exercise[] {
  return exercises.filter((exercise) =>
    exercise.muscle_groups.includes(muscleGroup)
  );
}

/**
 * Filter exercises that work ANY of the specified muscle groups
 */
export function filterExercisesByMuscleGroups(
  exercises: Exercise[],
  muscleGroups: MuscleGroup[]
): Exercise[] {
  return exercises.filter((exercise) =>
    exercise.muscle_groups.some((mg) => muscleGroups.includes(mg))
  );
}

/**
 * Filter exercises where PRIMARY muscle matches
 */
export function filterExercisesByPrimaryMuscle(
  exercises: Exercise[],
  muscleGroup: MuscleGroup
): Exercise[] {
  return exercises.filter((exercise) =>
    exercise.muscle_groups[0] === muscleGroup
  );
}

/**
 * Select exercises for specified muscle groups
 * Prioritizes compound exercises
 */
export function selectExercisesForMuscles(
  availableExercises: Exercise[],
  muscleGroups: MuscleGroup[],
  maxExercises: number
): Exercise[] {
  const selected: Exercise[] = [];
  const exercisesPerMuscle = Math.ceil(maxExercises / muscleGroups.length);

  for (const muscleGroup of muscleGroups) {
    const muscleExercises = filterExercisesByMuscleGroup(
      availableExercises,
      muscleGroup
    );

    // Sort by compound first
    const sorted = muscleExercises.sort((a, b) => {
      if (a.is_compound && !b.is_compound) return -1;
      if (!a.is_compound && b.is_compound) return 1;
      return 0;
    });

    // Take up to exercisesPerMuscle
    const toAdd = sorted.slice(0, exercisesPerMuscle);
    selected.push(...toAdd);

    // Stop if we've reached max
    if (selected.length >= maxExercises) {
      break;
    }
  }

  return selected.slice(0, maxExercises);
}

/**
 * Order exercises with compound movements first
 */
export function orderExercises(exercises: Exercise[]): Exercise[] {
  return [...exercises].sort((a, b) => {
    // Compound exercises first
    if (a.is_compound && !b.is_compound) return -1;
    if (!a.is_compound && b.is_compound) return 1;
    // Maintain original order within same type
    return 0;
  });
}

/**
 * Select initial exercises based on training frequency
 * Returns flat array of exercises (2 per relevant muscle group)
 * Prioritizes compound exercises, filters by available equipment
 */
export function selectInitialExercises(
  availableExercises: Exercise[],
  equipment: Equipment[],
  frequency: number
): Exercise[] {
  // First filter by equipment
  const filteredByEquipment = filterExercisesByEquipment(availableExercises, equipment);

  // Get only the muscle groups that will be used based on frequency
  const relevantMuscleGroups = getMuscleGroupsForFrequency(frequency);

  const selected: Exercise[] = [];

  // Select 2 exercises per relevant muscle group (by primary muscle)
  for (const muscleGroup of relevantMuscleGroups) {
    const muscleExercises = filterExercisesByPrimaryMuscle(
      filteredByEquipment,
      muscleGroup
    );

    // Sort: compound first
    const sorted = orderExercises(muscleExercises);

    // Take 2 exercises per muscle group
    selected.push(...sorted.slice(0, 2));
  }

  return selected;
}
