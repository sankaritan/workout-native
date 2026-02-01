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

    const sorted = muscleExercises.sort((a, b) => a.priority - b.priority);

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
 * Order exercises by priority, then alphabetically by name
 * This ensures consistent ordering across sessions (e.g., Deadlift always before Squat)
 */
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

/**
 * Select initial exercises based on training frequency
 * Returns flat array of exercises (2 per relevant muscle group)
 * Prioritizes by priority tiers, filters by available equipment
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
