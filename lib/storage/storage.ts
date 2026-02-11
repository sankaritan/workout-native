/**
 * Cross-platform storage using AsyncStorage
 * Works on both web and mobile (iOS/Android)
 *
 * This replaces expo-sqlite which doesn't work reliably on web.
 * Data is stored as JSON in AsyncStorage.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  Exercise,
  WorkoutPlan,
  WorkoutSessionTemplate,
  SessionExerciseTemplate,
  WorkoutSessionCompleted,
  WorkoutSessionType,
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

// Storage keys
const KEYS = {
  exercises: "workout_exercises",
  workoutPlans: "workout_plans",
  sessionTemplates: "workout_session_templates",
  exerciseTemplates: "workout_exercise_templates",
  completedSessions: "workout_completed_sessions",
  completedSets: "workout_completed_sets",
  idCounters: "workout_id_counters",
} as const;

// ID counter management
interface IdCounters {
  exercises: number;
  workoutPlans: number;
  sessionTemplates: number;
  exerciseTemplates: number;
  completedSessions: number;
  completedSets: number;
}

// In-memory cache for synchronous access
let cache: {
  exercises: Exercise[];
  workoutPlans: WorkoutPlan[];
  sessionTemplates: WorkoutSessionTemplate[];
  exerciseTemplates: SessionExerciseTemplate[];
  completedSessions: WorkoutSessionCompleted[];
  completedSets: ExerciseSetCompleted[];
  idCounters: IdCounters;
  initialized: boolean;
} = {
  exercises: [],
  workoutPlans: [],
  sessionTemplates: [],
  exerciseTemplates: [],
  completedSessions: [],
  completedSets: [],
  idCounters: {
    exercises: 0,
    workoutPlans: 0,
    sessionTemplates: 0,
    exerciseTemplates: 0,
    completedSessions: 0,
    completedSets: 0,
  },
  initialized: false,
};

// ============================================================================
// Initialization
// ============================================================================

/**
 * Check if storage is initialized
 */
export function isStorageInitialized(): boolean {
  return cache.initialized;
}

/**
 * Initialize storage - loads data from AsyncStorage into memory cache
 * This MUST be called before using any other storage functions
 */
export async function initStorage(): Promise<void> {
  if (cache.initialized) {
    console.log("Storage already initialized");
    return;
  }

  console.log("Initializing storage...");

  try {
    // Load all data from AsyncStorage
    const [
      exercisesJson,
      workoutPlansJson,
      sessionTemplatesJson,
      exerciseTemplatesJson,
      completedSessionsJson,
      completedSetsJson,
      idCountersJson,
    ] = await AsyncStorage.multiGet([
      KEYS.exercises,
      KEYS.workoutPlans,
      KEYS.sessionTemplates,
      KEYS.exerciseTemplates,
      KEYS.completedSessions,
      KEYS.completedSets,
      KEYS.idCounters,
    ]);

    cache.exercises = exercisesJson[1] ? JSON.parse(exercisesJson[1]) : [];
    cache.workoutPlans = workoutPlansJson[1] ? JSON.parse(workoutPlansJson[1]) : [];
    cache.sessionTemplates = sessionTemplatesJson[1] ? JSON.parse(sessionTemplatesJson[1]) : [];
    cache.exerciseTemplates = exerciseTemplatesJson[1] ? JSON.parse(exerciseTemplatesJson[1]) : [];

    const completedSessionsRaw: WorkoutSessionCompleted[] = completedSessionsJson[1]
      ? JSON.parse(completedSessionsJson[1])
      : [];
    cache.completedSessions = completedSessionsRaw.map((session) => ({
      session_type: "plan",
      exercise_id: null,
      name: null,
      ...session,
    }));

    cache.completedSets = completedSetsJson[1] ? JSON.parse(completedSetsJson[1]) : [];
    cache.idCounters = idCountersJson[1]
      ? JSON.parse(idCountersJson[1])
      : {
          exercises: 0,
          workoutPlans: 0,
          sessionTemplates: 0,
          exerciseTemplates: 0,
          completedSessions: 0,
          completedSets: 0,
        };

    cache.initialized = true;
    console.log("Storage initialized successfully");
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    throw error;
  }
}

/**
 * Persist cache to AsyncStorage (call after modifications)
 */
async function persistCache(): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [KEYS.exercises, JSON.stringify(cache.exercises)],
      [KEYS.workoutPlans, JSON.stringify(cache.workoutPlans)],
      [KEYS.sessionTemplates, JSON.stringify(cache.sessionTemplates)],
      [KEYS.exerciseTemplates, JSON.stringify(cache.exerciseTemplates)],
      [KEYS.completedSessions, JSON.stringify(cache.completedSessions)],
      [KEYS.completedSets, JSON.stringify(cache.completedSets)],
      [KEYS.idCounters, JSON.stringify(cache.idCounters)],
    ]);
  } catch (error) {
    console.error("Failed to persist cache:", error);
    throw error;
  }
}

/**
 * Reset storage - clears all data
 */
export async function resetStorage(): Promise<void> {
  cache = {
    exercises: [],
    workoutPlans: [],
    sessionTemplates: [],
    exerciseTemplates: [],
    completedSessions: [],
    completedSets: [],
    idCounters: {
      exercises: 0,
      workoutPlans: 0,
      sessionTemplates: 0,
      exerciseTemplates: 0,
      completedSessions: 0,
      completedSets: 0,
    },
    initialized: true,
  };
  await persistCache();
  console.log("Storage reset successfully");
}

// Helper to ensure storage is initialized
function ensureInitialized(): void {
  if (!cache.initialized) {
    throw new Error("Storage not initialized. Call initStorage() first.");
  }
}

// Generate next ID for a table
function getNextId(table: keyof IdCounters): number {
  cache.idCounters[table]++;
  return cache.idCounters[table];
}

// ============================================================================
// Exercise queries
// ============================================================================

export function getAllExercises(): Exercise[] {
  ensureInitialized();
  return [...cache.exercises].sort((a, b) => a.name.localeCompare(b.name));
}

export function getExerciseById(id: number): Exercise | null {
  ensureInitialized();
  return cache.exercises.find((e) => e.id === id) ?? null;
}

export function getExercisesByMuscleGroup(muscleGroup: MuscleGroup): Exercise[] {
  ensureInitialized();
  return cache.exercises
    .filter((e) => e.muscle_group === muscleGroup)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCompoundExercises(): Exercise[] {
  ensureInitialized();
  return cache.exercises
    .filter((e) => e.priority <= 3)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function insertExercise(exercise: ExerciseInsert): number {
  ensureInitialized();
  const id = getNextId("exercises");
  const newExercise: Exercise = { ...exercise, id };
  cache.exercises.push(newExercise);
  // Fire and forget persist - won't block
  persistCache().catch(console.error);
  return id;
}

export function updateExercise(id: number, exercise: Exercise): void {
  ensureInitialized();
  const index = cache.exercises.findIndex((e) => e.id === id);
  if (index !== -1) {
    cache.exercises[index] = exercise;
    // Fire and forget persist - won't block
    persistCache().catch(console.error);
  }
}

// ============================================================================
// Workout Plan queries
// ============================================================================

export function getAllWorkoutPlans(): WorkoutPlan[] {
  ensureInitialized();
  return [...cache.workoutPlans].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getActiveWorkoutPlan(): WorkoutPlan | null {
  ensureInitialized();
  const activePlans = cache.workoutPlans
    .filter((p) => p.is_active)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return activePlans[0] ?? null;
}

export function getWorkoutPlanById(id: number): WorkoutPlan | null {
  ensureInitialized();
  return cache.workoutPlans.find((p) => p.id === id) ?? null;
}

export function insertWorkoutPlan(plan: WorkoutPlanInsert): number {
  ensureInitialized();
  const id = getNextId("workoutPlans");
  const newPlan: WorkoutPlan = { ...plan, id };
  cache.workoutPlans.push(newPlan);
  persistCache().catch(console.error);
  return id;
}

export function updateWorkoutPlanActiveStatus(id: number, isActive: boolean): void {
  ensureInitialized();
  const plan = cache.workoutPlans.find((p) => p.id === id);
  if (plan) {
    plan.is_active = isActive;
    persistCache().catch(console.error);
  }
}

export function deactivateAllWorkoutPlans(): void {
  ensureInitialized();
  cache.workoutPlans.forEach((p) => (p.is_active = false));
  persistCache().catch(console.error);
}

// ============================================================================
// Workout Session Template queries
// ============================================================================

export function getSessionTemplatesByPlanId(planId: number): WorkoutSessionTemplate[] {
  ensureInitialized();
  return cache.sessionTemplates
    .filter((s) => s.workout_plan_id === planId)
    .sort((a, b) => a.sequence_order - b.sequence_order);
}

export function getSessionTemplateById(id: number): WorkoutSessionTemplate | null {
  ensureInitialized();
  return cache.sessionTemplates.find((s) => s.id === id) ?? null;
}

export function insertSessionTemplate(template: WorkoutSessionTemplateInsert): number {
  ensureInitialized();
  const id = getNextId("sessionTemplates");
  const newTemplate: WorkoutSessionTemplate = { ...template, id };
  cache.sessionTemplates.push(newTemplate);
  persistCache().catch(console.error);
  return id;
}

// ============================================================================
// Session Exercise Template queries
// ============================================================================

export function getExerciseTemplatesBySessionId(sessionId: number): SessionExerciseTemplate[] {
  ensureInitialized();
  return cache.exerciseTemplates
    .filter((e) => e.session_template_id === sessionId)
    .sort((a, b) => a.exercise_order - b.exercise_order);
}

export function insertExerciseTemplate(template: SessionExerciseTemplateInsert): number {
  ensureInitialized();
  const id = getNextId("exerciseTemplates");
  const newTemplate: SessionExerciseTemplate = { ...template, id };
  cache.exerciseTemplates.push(newTemplate);
  persistCache().catch(console.error);
  return id;
}

export function getPlanExercises(planId: number): Exercise[] {
  ensureInitialized();
  const sessionTemplates = getSessionTemplatesByPlanId(planId);
  const exerciseIds = new Set<number>();

  sessionTemplates.forEach((session) => {
    const sessionExercises = getExerciseTemplatesBySessionId(session.id);
    sessionExercises.forEach((exercise) => {
      exerciseIds.add(exercise.exercise_id);
    });
  });

  return Array.from(exerciseIds)
    .map((exerciseId) => getExerciseById(exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ============================================================================
// Completed Workout Session queries
// ============================================================================

export function getCompletedSessionsByPlanId(
  planId: number,
  sessionType: WorkoutSessionType | "all" = "plan"
): WorkoutSessionCompleted[] {
  ensureInitialized();
  let sessions = cache.completedSessions.filter((s) => s.workout_plan_id === planId);

  if (sessionType !== "all") {
    sessions = sessions.filter(
      (s) => (s.session_type ?? "plan") === sessionType
    );
  }

  return sessions.sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
}

export function getCompletedSessionById(id: number): WorkoutSessionCompleted | null {
  ensureInitialized();
  return cache.completedSessions.find((s) => s.id === id) ?? null;
}

export function getSingleSessionById(id: number): WorkoutSessionCompleted | null {
  const session = getCompletedSessionById(id);
  if (!session) return null;
  return (session.session_type ?? "plan") === "single" ? session : null;
}

export function getSingleSessionsByPlanId(planId: number): WorkoutSessionCompleted[] {
  return getCompletedSessionsByPlanId(planId, "single");
}

/**
 * Count completed sessions for a specific session template
 */
export function getCompletionCountForTemplate(sessionTemplateId: number): number {
  ensureInitialized();
  return cache.completedSessions.filter(
    (s) => s.session_template_id === sessionTemplateId && s.completed_at !== null
  ).length;
}

/**
 * Get completed session for a template by week number (1-based)
 * Week number corresponds to the Nth completion of the template
 */
export function getCompletedSessionForTemplateWeek(
  sessionTemplateId: number,
  weekNumber: number
): WorkoutSessionCompleted | null {
  ensureInitialized();
  if (weekNumber < 1) return null;
  const completedSessions = cache.completedSessions
    .filter((s) => s.session_template_id === sessionTemplateId && s.completed_at !== null)
    .sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime());
  return completedSessions[weekNumber - 1] ?? null;
}

export function getCompletedSessionsByDateRange(
  startDate: string,
  endDate: string
): WorkoutSessionCompleted[] {
  ensureInitialized();
  return cache.completedSessions
    .filter((s) => {
      const date = s.completed_at ?? s.started_at;
      return date >= startDate && date <= endDate;
    })
    .sort((a, b) => {
      const aDate = a.completed_at ?? a.started_at;
      const bDate = b.completed_at ?? b.started_at;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
}

export function getAllCompletedSessions(): WorkoutSessionCompleted[] {
  ensureInitialized();
  return [...cache.completedSessions].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
}

export function insertCompletedSession(session: WorkoutSessionCompletedInsert): number {
  ensureInitialized();
  const id = getNextId("completedSessions");
  const newSession: WorkoutSessionCompleted = {
    session_type: "plan",
    exercise_id: null,
    name: null,
    ...session,
    id,
    session_type: session.session_type ?? "plan",
    exercise_id: session.exercise_id ?? null,
    name: session.name ?? null,
  };
  cache.completedSessions.push(newSession);
  persistCache().catch(console.error);
  return id;
}

export function updateCompletedSession(
  id: number,
  completedAt: string,
  notes?: string
): void {
  ensureInitialized();
  const session = cache.completedSessions.find((s) => s.id === id);
  if (session) {
    session.completed_at = completedAt;
    session.notes = notes ?? null;
    persistCache().catch(console.error);
  }
}

export function deleteCompletedSession(sessionId: number): void {
  ensureInitialized();
  cache.completedSessions = cache.completedSessions.filter((s) => s.id !== sessionId);
  cache.completedSets = cache.completedSets.filter((s) => s.completed_session_id !== sessionId);
  persistCache().catch(console.error);
}

/**
 * Get in-progress session for a plan (started but not completed)
 * Returns the most recently started session that has completed_at = null
 */
export function getInProgressSessionByPlanId(
  planId: number,
  sessionType: WorkoutSessionType | "all" = "plan"
): WorkoutSessionCompleted | null {
  ensureInitialized();
  const inProgressSessions = cache.completedSessions
    .filter((s) => s.workout_plan_id === planId && s.completed_at === null)
    .filter((s) => sessionType === "all" || (s.session_type ?? "plan") === sessionType)
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  return inProgressSessions[0] ?? null;
}

/**
 * Check if a completed session has any sets entered
 */
export function hasAnyCompletedSets(completedSessionId: number): boolean {
  ensureInitialized();
  return cache.completedSets.some((s) => s.completed_session_id === completedSessionId);
}

/**
 * Get in-progress session for a specific session template
 * Returns the most recent in-progress session (completed_at = null) for this template
 */
export function getInProgressSessionByTemplateId(sessionTemplateId: number): WorkoutSessionCompleted | null {
  ensureInitialized();
  const inProgressSessions = cache.completedSessions
    .filter(
      (s) =>
        s.session_template_id === sessionTemplateId &&
        s.completed_at === null &&
        (s.session_type ?? "plan") === "plan"
    )
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  return inProgressSessions[0] ?? null;
}

export function getInProgressSingleSessionByExercise(
  planId: number,
  exerciseId: number
): WorkoutSessionCompleted | null {
  ensureInitialized();
  const inProgressSessions = cache.completedSessions
    .filter(
      (s) =>
        (s.session_type ?? "plan") === "single" &&
        s.workout_plan_id === planId &&
        s.exercise_id === exerciseId &&
        s.completed_at === null
    )
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

  return inProgressSessions[0] ?? null;
}

/**
 * Get most recently completed session for a specific session template
 */
export function getLatestCompletedSessionByTemplateId(
  sessionTemplateId: number
): WorkoutSessionCompleted | null {
  ensureInitialized();
  const completedSessions = cache.completedSessions
    .filter((s) => s.session_template_id === sessionTemplateId && s.completed_at !== null)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());
  return completedSessions[0] ?? null;
}

// ============================================================================
// Completed Exercise Set queries
// ============================================================================

export function getCompletedSetsBySessionId(sessionId: number): ExerciseSetCompleted[] {
  ensureInitialized();
  return cache.completedSets
    .filter((s) => s.completed_session_id === sessionId)
    .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
}

export function getCompletedSetsByExerciseId(exerciseId: number): ExerciseSetCompleted[] {
  ensureInitialized();
  return cache.completedSets
    .filter((s) => s.exercise_id === exerciseId)
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
}

export function getLastCompletedSetForExercise(
  exerciseId: number,
  excludeSessionId?: number
): ExerciseSetCompleted | null {
  ensureInitialized();
  const sets = cache.completedSets
    .filter(
      (s) =>
        s.exercise_id === exerciseId &&
        !s.is_warmup &&
        s.completed_session_id !== excludeSessionId
    )
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  return sets[0] ?? null;
}

export function insertCompletedSet(set: ExerciseSetCompletedInsert): number {
  ensureInitialized();
  const id = getNextId("completedSets");
  const newSet: ExerciseSetCompleted = { ...set, id };
  cache.completedSets.push(newSet);
  persistCache().catch(console.error);
  return id;
}

/**
 * Delete all completed sets for a session (used when re-saving session data)
 */
export function deleteCompletedSetsBySessionId(sessionId: number): void {
  ensureInitialized();
  cache.completedSets = cache.completedSets.filter((s) => s.completed_session_id !== sessionId);
  persistCache().catch(console.error);
}

// ============================================================================
// Complex queries with joins
// ============================================================================

export interface SessionWithExercises extends WorkoutSessionTemplate {
  exercises: (SessionExerciseTemplate & { exercise: Exercise })[];
}

export function getSessionWithExercises(sessionId: number): SessionWithExercises | null {
  ensureInitialized();

  const session = getSessionTemplateById(sessionId);
  if (!session) return null;

  const exerciseTemplates = getExerciseTemplatesBySessionId(sessionId);
  const exercisesWithDetails = exerciseTemplates.map((et) => {
    const exercise = getExerciseById(et.exercise_id);
    return {
      ...et,
      exercise: exercise!,
    };
  });

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
  ensureInitialized();

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

// ============================================================================
// Backup & Restore
// ============================================================================

/**
 * Get all storage data for backup purposes
 * Returns a copy of the entire cache
 */
export function getAllStorageData() {
  ensureInitialized();
  return {
    exercises: [...cache.exercises],
    workoutPlans: [...cache.workoutPlans],
    sessionTemplates: [...cache.sessionTemplates],
    exerciseTemplates: [...cache.exerciseTemplates],
    completedSessions: [...cache.completedSessions],
    completedSets: [...cache.completedSets],
    idCounters: { ...cache.idCounters },
  };
}

/**
 * Replace all storage data (used for restore from backup)
 * This will overwrite all existing data
 */
export async function replaceAllStorageData(data: {
  exercises: Exercise[];
  workoutPlans: WorkoutPlan[];
  sessionTemplates: WorkoutSessionTemplate[];
  exerciseTemplates: SessionExerciseTemplate[];
  completedSessions: WorkoutSessionCompleted[];
  completedSets: ExerciseSetCompleted[];
  idCounters: IdCounters;
}): Promise<void> {
  ensureInitialized();
  
  // Update cache
  cache.exercises = data.exercises;
  cache.workoutPlans = data.workoutPlans;
  cache.sessionTemplates = data.sessionTemplates;
  cache.exerciseTemplates = data.exerciseTemplates;
  cache.completedSessions = data.completedSessions;
  cache.completedSets = data.completedSets;
  cache.idCounters = data.idCounters;
  
  // Persist to AsyncStorage
  await persistCache();
  console.log("Storage data replaced successfully");
}
