/**
 * TypeScript interfaces for database tables
 */

// Exercise Library
export type ExercisePriority = 1 | 2 | 3 | 4 | 5;

export const EXERCISE_PRIORITY_LABELS: Record<ExercisePriority, string> = {
  1: "Big Lifts",
  2: "Major Lifts",
  3: "Support Lifts",
  4: "Single-Muscle",
  5: "Core",
};

export const EXERCISE_PRIORITY_BADGES: Record<
  ExercisePriority,
  { border: string; text: string; background?: string }
> = {
  1: { border: "border-primary", text: "text-primary", background: "bg-primary/20" }, // Filled background for prominence
  2: { border: "border-primary", text: "text-primary" }, // Outlined only
  3: { border: "border-gray-500", text: "text-gray-400" },
  4: { border: "border-gray-500", text: "text-gray-400" },
  5: { border: "border-gray-500", text: "text-gray-400" },
};

export function isCompoundPriority(priority: ExercisePriority): boolean {
  return priority <= 3;
}

export interface Exercise {
  id: number;
  name: string;
  muscle_group: MuscleGroup; // DEPRECATED: Keep for compatibility, always matches muscle_groups[0]
  muscle_groups: MuscleGroup[]; // Array of muscles worked: [primary, ...secondaries]
  equipment_required: Equipment | null;
  priority: ExercisePriority;
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
  focus?: "Balanced" | "Strength" | "Endurance"; // Training goal/focus (optional for backward compatibility)
  equipment_used?: Equipment[]; // Equipment used in this plan (optional for backward compatibility)
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
export type WorkoutSessionType = "plan" | "single";

export interface WorkoutSessionCompleted {
  id: number;
  workout_plan_id: number;
  session_template_id: number;
  started_at: string; // ISO datetime string
  completed_at: string | null; // ISO datetime string
  notes: string | null;
  session_type?: WorkoutSessionType;
  exercise_id?: number | null;
  name?: string | null;
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
  strava_sync_enabled: boolean;
  strava_connected: boolean;
  strava_install_id: string | null;
  strava_sync_token: string | null;
  strava_last_sync_at: string | null;
  strava_last_sync_error: string | null;
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
