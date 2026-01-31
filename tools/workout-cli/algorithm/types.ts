import type { Exercise, MuscleGroup, Equipment } from "../../../lib/storage/types";

export interface GenerationInput {
  frequency: number;
  equipment: Equipment[];
  focus: "Balanced" | "Strength" | "Endurance";
}

export interface SetsRepsScheme {
  sets: number;
  repsMin: number;
  repsMax: number;
}

export interface ProgramExercise {
  exercise: Exercise;
  sets: number;
  repsMin: number;
  repsMax: number;
  order: number;
}

export interface ProgramSession {
  name: string;
  dayOfWeek: number;
  exercises: ProgramExercise[];
  primaryMuscles: MuscleGroup[];
}

export interface WorkoutProgram {
  name: string;
  focus: "Balanced" | "Strength" | "Endurance";
  durationWeeks: number;
  sessionsPerWeek: number;
  sessions: ProgramSession[];
}

export type SplitType = "Full Body" | "Upper/Lower" | "Push/Pull/Legs" | "Body Part Split";
