/**
 * Types for workout generation engine
 */

import type { Exercise, MuscleGroup, Equipment } from "@/lib/storage/types";

/**
 * Input parameters for workout generation
 */
export interface GenerationInput {
  frequency: number; // 2-5 days per week
  equipment: Equipment[]; // Available equipment
  focus: "Balanced" | "Strength" | "Endurance";
}

/**
 * Sets/reps scheme based on focus
 */
export interface SetsRepsScheme {
  sets: number;
  repsMin: number;
  repsMax: number;
}

/**
 * Exercise with assigned sets/reps
 */
export interface ProgramExercise {
  exercise: Exercise;
  sets: number;
  repsMin: number;
  repsMax: number;
  order: number; // Position in session (1-based)
}

/**
 * Training session template
 */
export interface ProgramSession {
  name: string;
  dayOfWeek: number; // 1-7 (Monday = 1)
  exercises: ProgramExercise[];
  primaryMuscles: MuscleGroup[]; // Main muscle groups targeted
}

/**
 * Complete workout program
 */
export interface WorkoutProgram {
  name: string;
  focus: "Balanced" | "Strength" | "Endurance";
  durationWeeks: number;
  sessionsPerWeek: number;
  sessions: ProgramSession[];
}

/**
 * Weekly volume tracking per muscle group
 */
export interface MuscleVolume {
  muscleGroup: MuscleGroup;
  totalSets: number;
}

/**
 * Training split type
 */
export type SplitType = "Full Body" | "Upper/Lower" | "Push/Pull/Legs" | "Body Part Split";

/**
 * Exercises grouped by muscle group
 * @deprecated Use flat Exercise[] array instead. This type is kept for backward compatibility only.
 * The new multi-muscle group system uses Exercise.muscle_groups array for compound exercises.
 */
export interface MuscleGroupExercises {
  muscleGroup: MuscleGroup;
  exercises: Exercise[];
}
