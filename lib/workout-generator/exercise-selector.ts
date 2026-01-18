/**
 * Exercise Selection Logic
 * Filters and selects exercises based on equipment and muscle groups
 */

import type { Exercise, MuscleGroup, Equipment } from "@/lib/storage/types";
import type { MuscleGroupExercises } from "./types";
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
 */
export function filterExercisesByMuscleGroup(
  exercises: Exercise[],
  muscleGroup: MuscleGroup
): Exercise[] {
  return exercises.filter((exercise) => exercise.muscle_group === muscleGroup);
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
 * Select initial exercises for each muscle group based on training frequency
 * Only returns exercises for muscle groups that will be used in the workout plan
 * Prioritizes compound exercises, filters by available equipment
 */
export function selectInitialExercisesByMuscleGroup(
  availableExercises: Exercise[],
  equipment: Equipment[],
  frequency: number
): MuscleGroupExercises[] {
  // First filter by equipment
  const filteredByEquipment = filterExercisesByEquipment(availableExercises, equipment);

  // Get only the muscle groups that will be used based on frequency
  const relevantMuscleGroups = getMuscleGroupsForFrequency(frequency);

  // Create entry for each relevant muscle group
  return relevantMuscleGroups.map((muscleGroup) => {
    // Get exercises for this muscle group
    const muscleExercises = filterExercisesByMuscleGroup(filteredByEquipment, muscleGroup);

    // Sort by compound first
    const sorted = orderExercises(muscleExercises);

    // Take up to 3 exercises (preferring 2-3)
    const selected = sorted.slice(0, 3);

    return {
      muscleGroup,
      exercises: selected,
    };
  });
}
