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

/**
 * Get sets/reps scheme based on training focus
 */
export function getSetsRepsScheme(
  focus: "Hypertrophy" | "Strength" | "Endurance"
): SetsRepsScheme {
  switch (focus) {
    case "Hypertrophy":
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
