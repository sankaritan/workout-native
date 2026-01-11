/**
 * Type-safe database query helper functions
 */

import { getDatabase } from "./database";
import type {
  Exercise,
  WorkoutPlan,
  WorkoutSessionTemplate,
  SessionExerciseTemplate,
  WorkoutSessionCompleted,
  ExerciseSetCompleted,
  ExerciseInsert,
  WorkoutPlanInsert,
  WorkoutSessionTemplateInsert,
  SessionExerciseTemplateInsert,
  WorkoutSessionCompletedInsert,
  ExerciseSetCompletedInsert,
  MuscleGroup,
  Equipment,
} from "./types";

// ============================================================================
// Exercise queries
// ============================================================================

export function getAllExercises(): Exercise[] {
  const db = getDatabase();
  return db.getAllSync<Exercise>("SELECT * FROM exercises ORDER BY name");
}

export function getExerciseById(id: number): Exercise | null {
  const db = getDatabase();
  return db.getFirstSync<Exercise>("SELECT * FROM exercises WHERE id = ?", [
    id,
  ]);
}

export function getExercisesByMuscleGroup(muscleGroup: MuscleGroup): Exercise[] {
  const db = getDatabase();
  return db.getAllSync<Exercise>(
    "SELECT * FROM exercises WHERE muscle_group = ? ORDER BY name",
    [muscleGroup]
  );
}

export function getExercisesByEquipment(equipment: Equipment): Exercise[] {
  const db = getDatabase();
  return db.getAllSync<Exercise>(
    "SELECT * FROM exercises WHERE equipment_required = ? ORDER BY name",
    [equipment]
  );
}

export function getCompoundExercises(): Exercise[] {
  const db = getDatabase();
  return db.getAllSync<Exercise>(
    "SELECT * FROM exercises WHERE is_compound = 1 ORDER BY name"
  );
}

export function insertExercise(exercise: ExerciseInsert): number {
  const db = getDatabase();
  const result = db.runSync(
    `INSERT INTO exercises (name, muscle_group, equipment_required, is_compound, description)
     VALUES (?, ?, ?, ?, ?)`,
    [
      exercise.name,
      exercise.muscle_group,
      exercise.equipment_required,
      exercise.is_compound ? 1 : 0,
      exercise.description,
    ]
  );
  return result.lastInsertRowId;
}

// ============================================================================
// Workout Plan queries
// ============================================================================

export function getAllWorkoutPlans(): WorkoutPlan[] {
  const db = getDatabase();
  return db.getAllSync<WorkoutPlan>(
    "SELECT * FROM workout_plans ORDER BY created_at DESC"
  );
}

export function getActiveWorkoutPlan(): WorkoutPlan | null {
  const db = getDatabase();
  return db.getFirstSync<WorkoutPlan>(
    "SELECT * FROM workout_plans WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1"
  );
}

export function getWorkoutPlanById(id: number): WorkoutPlan | null {
  const db = getDatabase();
  return db.getFirstSync<WorkoutPlan>(
    "SELECT * FROM workout_plans WHERE id = ?",
    [id]
  );
}

export function insertWorkoutPlan(plan: WorkoutPlanInsert): number {
  const db = getDatabase();
  const result = db.runSync(
    `INSERT INTO workout_plans (name, description, weekly_frequency, duration_weeks, estimated_duration_minutes, created_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      plan.name,
      plan.description,
      plan.weekly_frequency,
      plan.duration_weeks,
      plan.estimated_duration_minutes,
      plan.created_at,
      plan.is_active ? 1 : 0,
    ]
  );
  return result.lastInsertRowId;
}

export function updateWorkoutPlanActiveStatus(
  id: number,
  isActive: boolean
): void {
  const db = getDatabase();
  db.runSync("UPDATE workout_plans SET is_active = ? WHERE id = ?", [
    isActive ? 1 : 0,
    id,
  ]);
}

export function deactivateAllWorkoutPlans(): void {
  const db = getDatabase();
  db.runSync("UPDATE workout_plans SET is_active = 0");
}

// ============================================================================
// Workout Session Template queries
// ============================================================================

export function getSessionTemplatesByPlanId(
  planId: number
): WorkoutSessionTemplate[] {
  const db = getDatabase();
  return db.getAllSync<WorkoutSessionTemplate>(
    "SELECT * FROM workout_sessions_template WHERE workout_plan_id = ? ORDER BY sequence_order",
    [planId]
  );
}

export function getSessionTemplateById(
  id: number
): WorkoutSessionTemplate | null {
  const db = getDatabase();
  return db.getFirstSync<WorkoutSessionTemplate>(
    "SELECT * FROM workout_sessions_template WHERE id = ?",
    [id]
  );
}

export function insertSessionTemplate(
  template: WorkoutSessionTemplateInsert
): number {
  const db = getDatabase();
  const result = db.runSync(
    `INSERT INTO workout_sessions_template (workout_plan_id, sequence_order, name, target_muscle_groups, estimated_duration_minutes)
     VALUES (?, ?, ?, ?, ?)`,
    [
      template.workout_plan_id,
      template.sequence_order,
      template.name,
      template.target_muscle_groups,
      template.estimated_duration_minutes,
    ]
  );
  return result.lastInsertRowId;
}

// ============================================================================
// Session Exercise Template queries
// ============================================================================

export function getExerciseTemplatesBySessionId(
  sessionId: number
): SessionExerciseTemplate[] {
  const db = getDatabase();
  return db.getAllSync<SessionExerciseTemplate>(
    "SELECT * FROM session_exercises_template WHERE session_template_id = ? ORDER BY exercise_order",
    [sessionId]
  );
}

export function insertExerciseTemplate(
  template: SessionExerciseTemplateInsert
): number {
  const db = getDatabase();
  const result = db.runSync(
    `INSERT INTO session_exercises_template (session_template_id, exercise_id, exercise_order, sets, reps, is_warmup)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      template.session_template_id,
      template.exercise_id,
      template.exercise_order,
      template.sets,
      template.reps,
      template.is_warmup ? 1 : 0,
    ]
  );
  return result.lastInsertRowId;
}

// ============================================================================
// Completed Workout Session queries
// ============================================================================

export function getCompletedSessionsByPlanId(
  planId: number
): WorkoutSessionCompleted[] {
  const db = getDatabase();
  return db.getAllSync<WorkoutSessionCompleted>(
    "SELECT * FROM workout_sessions_completed WHERE workout_plan_id = ? ORDER BY started_at DESC",
    [planId]
  );
}

export function getCompletedSessionById(
  id: number
): WorkoutSessionCompleted | null {
  const db = getDatabase();
  return db.getFirstSync<WorkoutSessionCompleted>(
    "SELECT * FROM workout_sessions_completed WHERE id = ?",
    [id]
  );
}

export function getCompletedSessionsByDateRange(
  startDate: string,
  endDate: string
): WorkoutSessionCompleted[] {
  const db = getDatabase();
  return db.getAllSync<WorkoutSessionCompleted>(
    "SELECT * FROM workout_sessions_completed WHERE started_at >= ? AND started_at <= ? ORDER BY started_at DESC",
    [startDate, endDate]
  );
}

export function insertCompletedSession(
  session: WorkoutSessionCompletedInsert
): number {
  const db = getDatabase();
  const result = db.runSync(
    `INSERT INTO workout_sessions_completed (workout_plan_id, session_template_id, started_at, completed_at, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [
      session.workout_plan_id,
      session.session_template_id,
      session.started_at,
      session.completed_at,
      session.notes,
    ]
  );
  return result.lastInsertRowId;
}

export function updateCompletedSession(
  id: number,
  completedAt: string,
  notes?: string
): void {
  const db = getDatabase();
  db.runSync(
    "UPDATE workout_sessions_completed SET completed_at = ?, notes = ? WHERE id = ?",
    [completedAt, notes ?? null, id]
  );
}

// ============================================================================
// Completed Exercise Set queries
// ============================================================================

export function getCompletedSetsBySessionId(
  sessionId: number
): ExerciseSetCompleted[] {
  const db = getDatabase();
  return db.getAllSync<ExerciseSetCompleted>(
    "SELECT * FROM exercise_sets_completed WHERE completed_session_id = ? ORDER BY completed_at",
    [sessionId]
  );
}

export function getCompletedSetsByExerciseId(
  exerciseId: number
): ExerciseSetCompleted[] {
  const db = getDatabase();
  return db.getAllSync<ExerciseSetCompleted>(
    "SELECT * FROM exercise_sets_completed WHERE exercise_id = ? ORDER BY completed_at DESC",
    [exerciseId]
  );
}

export function getLastCompletedSetForExercise(
  exerciseId: number
): ExerciseSetCompleted | null {
  const db = getDatabase();
  return db.getFirstSync<ExerciseSetCompleted>(
    "SELECT * FROM exercise_sets_completed WHERE exercise_id = ? AND is_warmup = 0 ORDER BY completed_at DESC LIMIT 1",
    [exerciseId]
  );
}

export function insertCompletedSet(set: ExerciseSetCompletedInsert): number {
  const db = getDatabase();
  const result = db.runSync(
    `INSERT INTO exercise_sets_completed (completed_session_id, exercise_id, set_number, weight, reps, is_warmup, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      set.completed_session_id,
      set.exercise_id,
      set.set_number,
      set.weight,
      set.reps,
      set.is_warmup ? 1 : 0,
      set.completed_at,
    ]
  );
  return result.lastInsertRowId;
}

// ============================================================================
// Complex queries with joins
// ============================================================================

export interface SessionWithExercises extends WorkoutSessionTemplate {
  exercises: (SessionExerciseTemplate & { exercise: Exercise })[];
}

export function getSessionWithExercises(
  sessionId: number
): SessionWithExercises | null {
  const db = getDatabase();

  // Get session template
  const session = getSessionTemplateById(sessionId);
  if (!session) return null;

  // Get exercises with details
  const exercises = db.getAllSync<
    SessionExerciseTemplate & { exercise: Exercise }
  >(
    `SELECT
      set.*,
      e.id as 'exercise.id',
      e.name as 'exercise.name',
      e.muscle_group as 'exercise.muscle_group',
      e.equipment_required as 'exercise.equipment_required',
      e.is_compound as 'exercise.is_compound',
      e.description as 'exercise.description'
    FROM session_exercises_template set
    JOIN exercises e ON set.exercise_id = e.id
    WHERE set.session_template_id = ?
    ORDER BY set.exercise_order`,
    [sessionId]
  );

  // Reshape nested exercise data
  const exercisesWithDetails = exercises.map((ex: any) => ({
    id: ex.id,
    session_template_id: ex.session_template_id,
    exercise_id: ex.exercise_id,
    exercise_order: ex.exercise_order,
    sets: ex.sets,
    reps: ex.reps,
    is_warmup: ex.is_warmup,
    exercise: {
      id: ex["exercise.id"],
      name: ex["exercise.name"],
      muscle_group: ex["exercise.muscle_group"],
      equipment_required: ex["exercise.equipment_required"],
      is_compound: ex["exercise.is_compound"],
      description: ex["exercise.description"],
    },
  }));

  return {
    ...session,
    exercises: exercisesWithDetails,
  };
}

export interface CompletedSessionWithDetails extends WorkoutSessionCompleted {
  sets: ExerciseSetCompleted[];
  session_template: WorkoutSessionTemplate | null;
}

export function getCompletedSessionWithDetails(
  sessionId: number
): CompletedSessionWithDetails | null {
  const session = getCompletedSessionById(sessionId);
  if (!session) return null;

  const sets = getCompletedSetsBySessionId(sessionId);
  const template = getSessionTemplateById(session.session_template_id);

  return {
    ...session,
    sets,
    session_template: template,
  };
}
