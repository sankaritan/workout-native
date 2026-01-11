/**
 * TypeScript interfaces for database tables
 */

// Exercise Library
export interface Exercise {
  id: number;
  name: string;
  muscle_group: MuscleGroup;
  equipment_required: Equipment | null;
  is_compound: boolean;
  description: string | null;
}

export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';

export type Equipment = 'Barbell' | 'Dumbbell' | 'Bodyweight' | 'Cables' | 'Machines' | 'Bands';

// Workout Plans
export interface WorkoutPlan {
  id: number;
  name: string;
  description: string | null;
  weekly_frequency: number; // 2-5 sessions per week
  duration_weeks: number; // 4, 6, 8, or 12
  estimated_duration_minutes: number | null;
  created_at: string; // ISO datetime string
  is_active: boolean;
}

// Workout Session Templates
export interface WorkoutSessionTemplate {
  id: number;
  workout_plan_id: number;
  sequence_order: number;
  name: string;
  target_muscle_groups: string; // JSON array stringified
  estimated_duration_minutes: number | null;
}

// Session Exercise Templates
export interface SessionExerciseTemplate {
  id: number;
  session_template_id: number;
  exercise_id: number;
  exercise_order: number;
  sets: number;
  reps: number;
  is_warmup: boolean;
}

// Completed Workout Sessions
export interface WorkoutSessionCompleted {
  id: number;
  workout_plan_id: number;
  session_template_id: number;
  started_at: string; // ISO datetime string
  completed_at: string | null; // ISO datetime string
  notes: string | null;
}

// Completed Exercise Sets
export interface ExerciseSetCompleted {
  id: number;
  completed_session_id: number;
  exercise_id: number;
  set_number: number;
  weight: number; // lbs or kg
  reps: number;
  is_warmup: boolean;
  completed_at: string; // ISO datetime string
}

// Preferences (AsyncStorage)
export interface Preferences {
  onboarding_completed: boolean;
  unit_preference: 'lbs' | 'kg';
}

// Insert types (omit auto-generated fields)
export type ExerciseInsert = Omit<Exercise, 'id'>;
export type WorkoutPlanInsert = Omit<WorkoutPlan, 'id'>;
export type WorkoutSessionTemplateInsert = Omit<WorkoutSessionTemplate, 'id'>;
export type SessionExerciseTemplateInsert = Omit<SessionExerciseTemplate, 'id'>;
export type WorkoutSessionCompletedInsert = Omit<WorkoutSessionCompleted, 'id'>;
export type ExerciseSetCompletedInsert = Omit<ExerciseSetCompleted, 'id'>;

// Query result types with joined data
export interface WorkoutPlanWithSessions extends WorkoutPlan {
  sessions?: WorkoutSessionTemplate[];
}

export interface SessionTemplateWithExercises extends WorkoutSessionTemplate {
  exercises?: (SessionExerciseTemplate & { exercise?: Exercise })[];
}

export interface CompletedSessionWithSets extends WorkoutSessionCompleted {
  sets?: ExerciseSetCompleted[];
}
