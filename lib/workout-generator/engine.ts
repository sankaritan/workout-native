/**
 * Workout Generation Engine
 * Core algorithm for creating personalized workout programs
 */

import { getDatabase } from "@/lib/storage/database";
import { getAllExercises } from "@/lib/storage/db-utils";
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
 * Save workout program to database
 * Returns the created plan ID
 */
export function saveWorkoutProgram(program: WorkoutProgram): number {
  const db = getDatabase();

  // Insert workout plan
  const planResult = db.runSync(
    `INSERT INTO workout_plans (name, focus, duration_weeks, sessions_per_week, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      program.name,
      program.focus,
      program.durationWeeks,
      program.sessionsPerWeek,
      new Date().toISOString(),
    ]
  );

  const planId = planResult.lastInsertRowId;

  // Insert session templates
  program.sessions.forEach((session) => {
    const sessionResult = db.runSync(
      `INSERT INTO workout_session_templates (plan_id, name, day_of_week, session_order)
       VALUES (?, ?, ?, ?)`,
      [planId, session.name, session.dayOfWeek, session.dayOfWeek]
    );

    const sessionTemplateId = sessionResult.lastInsertRowId;

    // Insert exercises for this session
    session.exercises.forEach((programEx) => {
      db.runSync(
        `INSERT INTO session_exercise_templates (
          session_template_id,
          exercise_id,
          sets,
          reps_min,
          reps_max,
          exercise_order
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          sessionTemplateId,
          programEx.exercise.id,
          programEx.sets,
          programEx.repsMin,
          programEx.repsMax,
          programEx.order,
        ]
      );
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
