import {
  initStorage,
  resetStorage,
  insertCompletedSession,
  getCompletionCountForTemplate,
  getCompletedSessionForTemplateWeek,
} from "@/lib/storage/storage";

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

describe("storage session cycle helpers", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await initStorage();
  });

  afterEach(async () => {
    await resetStorage();
  });

  it("counts completed sessions per template", () => {
    const templateId = 7;
    insertCompletedSession({
      workout_plan_id: 1,
      session_template_id: templateId,
      started_at: "2025-02-01T08:00:00.000Z",
      completed_at: "2025-02-01T09:00:00.000Z",
      notes: null,
    });
    insertCompletedSession({
      workout_plan_id: 1,
      session_template_id: templateId,
      started_at: "2025-02-08T08:00:00.000Z",
      completed_at: "2025-02-08T09:00:00.000Z",
      notes: null,
    });
    insertCompletedSession({
      workout_plan_id: 1,
      session_template_id: templateId,
      started_at: "2025-02-15T08:00:00.000Z",
      completed_at: "2025-02-15T09:00:00.000Z",
      notes: null,
    });
    insertCompletedSession({
      workout_plan_id: 1,
      session_template_id: templateId,
      started_at: "2025-02-16T08:00:00.000Z",
      completed_at: null,
      notes: null,
    });

    expect(getCompletionCountForTemplate(templateId)).toBe(3);
  });

  it("returns the completed session for a template week", () => {
    const templateId = 3;
    const first = insertCompletedSession({
      workout_plan_id: 1,
      session_template_id: templateId,
      started_at: "2025-02-10T08:00:00.000Z",
      completed_at: "2025-02-10T09:00:00.000Z",
      notes: null,
    });
    const second = insertCompletedSession({
      workout_plan_id: 1,
      session_template_id: templateId,
      started_at: "2025-02-17T08:00:00.000Z",
      completed_at: "2025-02-17T09:00:00.000Z",
      notes: null,
    });
    insertCompletedSession({
      workout_plan_id: 1,
      session_template_id: templateId,
      started_at: "2025-02-24T08:00:00.000Z",
      completed_at: "2025-02-24T09:00:00.000Z",
      notes: null,
    });

    expect(getCompletedSessionForTemplateWeek(templateId, 1)?.id).toBe(first);
    expect(getCompletedSessionForTemplateWeek(templateId, 2)?.id).toBe(second);
    expect(getCompletedSessionForTemplateWeek(templateId, 0)).toBeNull();
  });
});
