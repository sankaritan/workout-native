/**
 * Acceptance Test: Complete Exercise Logging Flow
 * 
 * This test validates the entire user journey of logging exercises during a workout:
 * 1. User starts a workout session
 * 2. User logs sets/reps/weight for exercises
 * 3. User completes the workout
 * 4. Data is saved to storage
 * 5. Data is retrievable for history/progress tracking
 * 
 * This is an end-to-end test using virtual DOM (not full browser e2e)
 * to test actual user workflow while maintaining fast test execution.
 */

import {
  initStorage,
  resetStorage,
  insertWorkoutPlan,
  insertSessionTemplate,
  insertExerciseTemplate,
  insertCompletedSession,
  insertCompletedSet,
  updateCompletedSession,
  getCompletedSessionById,
  getCompletedSetsBySessionId,
  getCompletedSetsByExerciseId,
  getLastCompletedSetForExercise,
  getInProgressSessionByPlanId,
  getCompletedSessionsByPlanId,
  getSessionWithExercises,
  hasAnyCompletedSets,
  deleteCompletedSetsBySessionId,
  getAllExercises,
} from "@/lib/storage/storage";
import { seedExercises } from "@/lib/storage/seed-data";
import type {
  WorkoutPlanInsert,
  WorkoutSessionTemplateInsert,
  SessionExerciseTemplateInsert,
  WorkoutSessionCompletedInsert,
  ExerciseSetCompletedInsert,
} from "@/lib/storage/types";

describe("Acceptance Test: Exercise Logging", () => {
  let planId: number;
  let sessionTemplateId: number;
  let benchPressId: number;
  let squatId: number;
  let exerciseId1: number; // First exercise from seed data
  let exerciseId2: number; // Second exercise from seed data

  beforeEach(async () => {
    // Setup storage with exercise database
    await initStorage();
    await resetStorage();
    await seedExercises();

    // Get actual exercise IDs from seeded data
    const allExercises = getAllExercises();
    exerciseId1 = allExercises[0].id;
    exerciseId2 = allExercises[1].id;

    // Create a test workout plan
    const plan: WorkoutPlanInsert = {
      name: "Test Plan",
      description: "Plan for testing exercise logging",
      weekly_frequency: 3,
      duration_weeks: 4,
      estimated_duration_minutes: 60,
      created_at: new Date().toISOString(),
      is_active: true,
    };
    planId = insertWorkoutPlan(plan);

    // Create a session template
    const sessionTemplate: WorkoutSessionTemplateInsert = {
      workout_plan_id: planId,
      sequence_order: 1,
      name: "Upper Body",
      target_muscle_groups: JSON.stringify(["Chest", "Back"]),
      estimated_duration_minutes: 60,
    };
    sessionTemplateId = insertSessionTemplate(sessionTemplate);

    // Add exercises to the session (find exercises from seeded data)
    const sessionWithExercises = getSessionWithExercises(sessionTemplateId);
    
    // Insert exercise templates manually
    const exerciseTemplate1: SessionExerciseTemplateInsert = {
      session_template_id: sessionTemplateId,
      exercise_id: exerciseId1, // Use actual exercise ID from seed data
      exercise_order: 1,
      sets: 3,
      reps: 10,
      is_warmup: false,
    };
    benchPressId = insertExerciseTemplate(exerciseTemplate1);

    const exerciseTemplate2: SessionExerciseTemplateInsert = {
      session_template_id: sessionTemplateId,
      exercise_id: exerciseId2, // Use actual exercise ID from seed data
      exercise_order: 2,
      sets: 3,
      reps: 10,
      is_warmup: false,
    };
    squatId = insertExerciseTemplate(exerciseTemplate2);
  });

  it("should complete full workout logging workflow", async () => {
    // Step 1: User starts a workout session
    const startTime = new Date().toISOString();
    const completedSession: WorkoutSessionCompletedInsert = {
      workout_plan_id: planId,
      session_template_id: sessionTemplateId,
      started_at: startTime,
      completed_at: null, // Not finished yet
      notes: null,
    };
    const completedSessionId = insertCompletedSession(completedSession);
    expect(completedSessionId).toBeGreaterThan(0);

    // Verify session is in-progress
    const inProgressSession = getInProgressSessionByPlanId(planId);
    expect(inProgressSession).not.toBeNull();
    expect(inProgressSession?.id).toBe(completedSessionId);
    expect(inProgressSession?.completed_at).toBeNull();

    // Step 2: User logs sets for first exercise (exercise_id from seed data)
    const benchPressSet1: ExerciseSetCompletedInsert = {
      completed_session_id: completedSessionId,
      exercise_id: exerciseId1,
      set_number: 1,
      weight: 135,
      reps: 10,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    };
    const set1Id = insertCompletedSet(benchPressSet1);
    expect(set1Id).toBeGreaterThan(0);

    const benchPressSet2: ExerciseSetCompletedInsert = {
      completed_session_id: completedSessionId,
      exercise_id: exerciseId1,
      set_number: 2,
      weight: 135,
      reps: 9,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    };
    const set2Id = insertCompletedSet(benchPressSet2);

    const benchPressSet3: ExerciseSetCompletedInsert = {
      completed_session_id: completedSessionId,
      exercise_id: exerciseId1,
      set_number: 3,
      weight: 135,
      reps: 8,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    };
    const set3Id = insertCompletedSet(benchPressSet3);

    // Verify sets are saved
    const sessionSets = getCompletedSetsBySessionId(completedSessionId);
    expect(sessionSets).toHaveLength(3);
    expect(hasAnyCompletedSets(completedSessionId)).toBe(true);

    // Step 3: User logs sets for second exercise (exercise_id from seed data)
    const squatSet1: ExerciseSetCompletedInsert = {
      completed_session_id: completedSessionId,
      exercise_id: exerciseId2,
      set_number: 1,
      weight: 185,
      reps: 10,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    };
    insertCompletedSet(squatSet1);

    const squatSet2: ExerciseSetCompletedInsert = {
      completed_session_id: completedSessionId,
      exercise_id: exerciseId2,
      set_number: 2,
      weight: 185,
      reps: 10,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    };
    insertCompletedSet(squatSet2);

    const squatSet3: ExerciseSetCompletedInsert = {
      completed_session_id: completedSessionId,
      exercise_id: exerciseId2,
      set_number: 3,
      weight: 185,
      reps: 9,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    };
    insertCompletedSet(squatSet3);

    // Verify all sets are saved
    const allSets = getCompletedSetsBySessionId(completedSessionId);
    expect(allSets).toHaveLength(6); // 3 bench press + 3 squat

    // Step 4: User finishes the workout
    const finishTime = new Date().toISOString();
    const notes = "Great workout! Felt strong today.";
    updateCompletedSession(completedSessionId, finishTime, notes);

    // Step 5: Verify workout is completed
    const completedWorkout = getCompletedSessionById(completedSessionId);
    expect(completedWorkout).not.toBeNull();
    expect(completedWorkout?.completed_at).toBe(finishTime);
    expect(completedWorkout?.notes).toBe(notes);

    // Verify no longer in-progress
    const stillInProgress = getInProgressSessionByPlanId(planId);
    expect(stillInProgress).toBeNull();

    // Step 6: Verify data is retrievable for history
    const benchPressSets = getCompletedSetsByExerciseId(exerciseId1);
    expect(benchPressSets.length).toBeGreaterThanOrEqual(3);
    
    // Verify last set for exercise (for progress tracking)
    const lastBenchPressSet = getLastCompletedSetForExercise(exerciseId1);
    expect(lastBenchPressSet).not.toBeNull();
    expect(lastBenchPressSet?.weight).toBe(135);

    // Step 7: Verify completed sessions are tracked
    const planCompletedSessions = getCompletedSessionsByPlanId(planId);
    expect(planCompletedSessions).toHaveLength(1);
    expect(planCompletedSessions[0].id).toBe(completedSessionId);
  });

  it("should handle pausing and resuming workout", async () => {
    // Start session
    const completedSession: WorkoutSessionCompletedInsert = {
      workout_plan_id: planId,
      session_template_id: sessionTemplateId,
      started_at: new Date().toISOString(),
      completed_at: null,
      notes: null,
    };
    const sessionId = insertCompletedSession(completedSession);

    // Log some sets
    const set1: ExerciseSetCompletedInsert = {
      completed_session_id: sessionId,
      exercise_id: exerciseId1,
      set_number: 1,
      weight: 135,
      reps: 10,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    };
    insertCompletedSet(set1);

    // User pauses (leaves session incomplete)
    let inProgress = getInProgressSessionByPlanId(planId);
    expect(inProgress).not.toBeNull();
    expect(inProgress?.id).toBe(sessionId);

    // User comes back and continues (can load sets)
    const savedSets = getCompletedSetsBySessionId(sessionId);
    expect(savedSets).toHaveLength(1);

    // User adds more sets
    const set2: ExerciseSetCompletedInsert = {
      completed_session_id: sessionId,
      exercise_id: exerciseId1,
      set_number: 2,
      weight: 135,
      reps: 10,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    };
    insertCompletedSet(set2);

    // Verify both sets are there
    const allSets = getCompletedSetsBySessionId(sessionId);
    expect(allSets).toHaveLength(2);

    // User finishes
    updateCompletedSession(sessionId, new Date().toISOString());

    // No longer in progress
    inProgress = getInProgressSessionByPlanId(planId);
    expect(inProgress).toBeNull();
  });

  it("should handle editing workout (re-save)", async () => {
    // Complete a workout
    const sessionId = insertCompletedSession({
      workout_plan_id: planId,
      session_template_id: sessionTemplateId,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      notes: "Original workout",
    });

    // Log original sets
    insertCompletedSet({
      completed_session_id: sessionId,
      exercise_id: exerciseId1,
      set_number: 1,
      weight: 135,
      reps: 10,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    });

    insertCompletedSet({
      completed_session_id: sessionId,
      exercise_id: exerciseId1,
      set_number: 2,
      weight: 135,
      reps: 10,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    });

    let sets = getCompletedSetsBySessionId(sessionId);
    expect(sets).toHaveLength(2);

    // User wants to edit - delete old sets and re-save
    deleteCompletedSetsBySessionId(sessionId);
    sets = getCompletedSetsBySessionId(sessionId);
    expect(sets).toHaveLength(0);

    // Save new sets
    insertCompletedSet({
      completed_session_id: sessionId,
      exercise_id: exerciseId1,
      set_number: 1,
      weight: 140, // Increased weight
      reps: 10,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    });

    insertCompletedSet({
      completed_session_id: sessionId,
      exercise_id: exerciseId1,
      set_number: 2,
      weight: 140,
      reps: 10,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    });

    insertCompletedSet({
      completed_session_id: sessionId,
      exercise_id: exerciseId1,
      set_number: 3,
      weight: 140,
      reps: 8,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    });

    // Verify new sets are saved
    sets = getCompletedSetsBySessionId(sessionId);
    expect(sets).toHaveLength(3);
    expect(sets[0].weight).toBe(140);
  });

  it("should track warmup sets separately from working sets", async () => {
    const sessionId = insertCompletedSession({
      workout_plan_id: planId,
      session_template_id: sessionTemplateId,
      started_at: new Date().toISOString(),
      completed_at: null,
      notes: null,
    });

    // Log warmup sets
    insertCompletedSet({
      completed_session_id: sessionId,
      exercise_id: exerciseId1,
      set_number: 1,
      weight: 45, // Empty bar
      reps: 10,
      is_warmup: true,
      completed_at: new Date().toISOString(),
    });

    insertCompletedSet({
      completed_session_id: sessionId,
      exercise_id: exerciseId1,
      set_number: 2,
      weight: 95,
      reps: 5,
      is_warmup: true,
      completed_at: new Date().toISOString(),
    });

    // Log working sets
    insertCompletedSet({
      completed_session_id: sessionId,
      exercise_id: exerciseId1,
      set_number: 3,
      weight: 135,
      reps: 10,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    });

    // All sets are saved
    const allSets = getCompletedSetsBySessionId(sessionId);
    expect(allSets).toHaveLength(3);

    // But last completed set excludes warmups
    const lastWorkingSet = getLastCompletedSetForExercise(exerciseId1);
    expect(lastWorkingSet?.is_warmup).toBe(false);
    expect(lastWorkingSet?.weight).toBe(135);
  });

  it("should handle multiple workout sessions over time", async () => {
    // Session 1 - Week 1
    const session1Id = insertCompletedSession({
      workout_plan_id: planId,
      session_template_id: sessionTemplateId,
      started_at: "2024-01-01T10:00:00.000Z",
      completed_at: "2024-01-01T11:00:00.000Z",
      notes: "Week 1 workout",
    });

    insertCompletedSet({
      completed_session_id: session1Id,
      exercise_id: exerciseId1,
      set_number: 1,
      weight: 135,
      reps: 10,
      is_warmup: false,
      completed_at: "2024-01-01T10:30:00.000Z",
    });

    // Session 2 - Week 2 (progressive overload)
    const session2Id = insertCompletedSession({
      workout_plan_id: planId,
      session_template_id: sessionTemplateId,
      started_at: "2024-01-08T10:00:00.000Z",
      completed_at: "2024-01-08T11:00:00.000Z",
      notes: "Week 2 workout - increased weight!",
    });

    insertCompletedSet({
      completed_session_id: session2Id,
      exercise_id: exerciseId1,
      set_number: 1,
      weight: 140,
      reps: 10,
      is_warmup: false,
      completed_at: "2024-01-08T10:30:00.000Z",
    });

    // Verify both sessions exist
    const allSessions = getCompletedSessionsByPlanId(planId);
    expect(allSessions).toHaveLength(2);

    // Verify history shows progression
    const benchPressSets = getCompletedSetsByExerciseId(exerciseId1);
    expect(benchPressSets.length).toBeGreaterThanOrEqual(2);
    
    // Most recent set should show progression
    const lastSet = getLastCompletedSetForExercise(exerciseId1);
    expect(lastSet?.weight).toBe(140); // Progressed from 135 to 140
  });
});
