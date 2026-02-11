import {
  initStorage,
  resetStorage,
  insertWorkoutPlan,
  insertSessionTemplate,
  insertExerciseTemplate,
  insertExercise,
  insertCompletedSession,
  getCompletedSessionById,
  getSingleSessionsByPlanId,
  getPlanExercises,
} from "@/lib/storage/storage";
import type { Exercise, WorkoutPlanInsert } from "@/lib/storage/types";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  multiGet: jest.fn(() =>
    Promise.resolve([
      ["workout_exercises", null],
      ["workout_plans", null],
      ["workout_session_templates", null],
      ["workout_exercise_templates", null],
      ["workout_completed_sessions", null],
      ["workout_completed_sets", null],
      ["workout_id_counters", null],
    ])
  ),
  multiSet: jest.fn(() => Promise.resolve()),
}));

describe("single session storage helpers", () => {
  let plan: WorkoutPlanInsert;
  let exercises: Exercise[];

  beforeEach(async () => {
    jest.clearAllMocks();
    await initStorage();

    exercises = [
      {
        id: 1,
        name: "Bench Press",
        muscle_group: "Chest",
        muscle_groups: ["Chest"],
        equipment_required: "Barbell",
        priority: 1,
        description: null,
      },
      {
        id: 2,
        name: "Lat Pulldown",
        muscle_group: "Back",
        muscle_groups: ["Back"],
        equipment_required: "Machines",
        priority: 2,
        description: null,
      },
    ];

    plan = {
      name: "Test Plan",
      description: null,
      weekly_frequency: 3,
      duration_weeks: 4,
      estimated_duration_minutes: 45,
      focus: "Balanced",
      equipment_used: ["Barbell"],
      created_at: "2025-02-01T00:00:00.000Z",
      is_active: true,
    };
  });

  afterEach(async () => {
    await resetStorage();
  });

  it("deduplicates plan exercises when gathering unique list", () => {
    const planId = insertWorkoutPlan(plan);
    insertExercise(exercises[0]);
    insertExercise(exercises[1]);

    const sessionA = insertSessionTemplate({
      workout_plan_id: planId,
      sequence_order: 1,
      name: "Day 1",
      target_muscle_groups: JSON.stringify(["Chest"]),
      estimated_duration_minutes: 30,
    });
    const sessionB = insertSessionTemplate({
      workout_plan_id: planId,
      sequence_order: 2,
      name: "Day 2",
      target_muscle_groups: JSON.stringify(["Back"]),
      estimated_duration_minutes: 30,
    });

    insertExerciseTemplate({
      session_template_id: sessionA,
      exercise_id: exercises[0].id,
      exercise_order: 1,
      sets: 3,
      reps: 8,
      is_warmup: false,
    });
    insertExerciseTemplate({
      session_template_id: sessionA,
      exercise_id: exercises[1].id,
      exercise_order: 2,
      sets: 3,
      reps: 10,
      is_warmup: false,
    });
    // Duplicate exercise across sessions should be returned once
    insertExerciseTemplate({
      session_template_id: sessionB,
      exercise_id: exercises[0].id,
      exercise_order: 1,
      sets: 4,
      reps: 6,
      is_warmup: false,
    });

    const uniqueExercises = getPlanExercises(planId);

    expect(uniqueExercises.map((e) => e.id)).toEqual([1, 2]);
  });

  it("returns only single sessions for a plan and defaults type for plan sessions", () => {
    const planId = insertWorkoutPlan(plan);

    const singleSessionId = insertCompletedSession({
      workout_plan_id: planId,
      session_template_id: -1,
      started_at: "2025-02-02T08:00:00.000Z",
      completed_at: null,
      notes: null,
      session_type: "single",
      exercise_id: 2,
    });

    const planSessionId = insertCompletedSession({
      workout_plan_id: planId,
      session_template_id: 10,
      started_at: "2025-02-01T08:00:00.000Z",
      completed_at: "2025-02-01T09:00:00.000Z",
      notes: null,
    });

    const singles = getSingleSessionsByPlanId(planId);

    expect(singles.map((s) => s.id)).toEqual([singleSessionId]);
    expect(getCompletedSessionById(planSessionId)?.session_type).toBe("plan");
  });
});
