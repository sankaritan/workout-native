/**
 * TypeScript interfaces for database tables
 */

// Exercise Library
export type ExercisePriority = 1 | 2 | 3 | 4 | 5;

export const EXERCISE_PRIORITY_LABELS: Record<ExercisePriority, string> = {
  1: "Primary",
  2: "Secondary",
  3: "Accessory",
  4: "Isolation",
  5: "Core",
};

export const EXERCISE_PRIORITY_BADGES: Record<
  ExercisePriority,
  { background: string; text: string }
> = {
  1: { background: "bg-primary/20", text: "text-primary" },
  2: { background: "bg-blue-500/20", text: "text-blue-400" },
  3: { background: "bg-amber-500/20", text: "text-amber-400" },
  4: { background: "bg-gray-500/20", text: "text-gray-400" },
  5: { background: "bg-gray-500/20", text: "text-gray-400" },
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
