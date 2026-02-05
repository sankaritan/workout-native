import React from "react";
import { render, screen } from "@testing-library/react-native";
import WorkoutDetailScreen from "@/app/workout/[id]";
import type { WorkoutPlan, WorkoutSessionTemplate, WorkoutSessionCompleted } from "@/lib/storage/types";

// Mock expo-router
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "1" }),
  useFocusEffect: jest.fn(),
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock safe area context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock MaterialIcons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

// Mock BackButton component
jest.mock("@/components/BackButton", () => ({
  BackButton: ({ onPress }: { onPress: () => void }) => null,
}));

// Mock storage functions
const mockGetWorkoutPlanById = jest.fn();
const mockGetSessionTemplatesByPlanId = jest.fn();
const mockGetCompletedSessionsByPlanId = jest.fn();
const mockGetInProgressSessionByPlanId = jest.fn();
const mockHasAnyCompletedSets = jest.fn();
const mockIsStorageInitialized = jest.fn();
const mockGetLatestCompletedSessionByTemplateId = jest.fn();

jest.mock("@/lib/storage/storage", () => ({
  getWorkoutPlanById: (...args: any[]) => mockGetWorkoutPlanById(...args),
  getSessionTemplatesByPlanId: (...args: any[]) => mockGetSessionTemplatesByPlanId(...args),
  getCompletedSessionsByPlanId: (...args: any[]) => mockGetCompletedSessionsByPlanId(...args),
  getInProgressSessionByPlanId: (...args: any[]) => mockGetInProgressSessionByPlanId(...args),
  hasAnyCompletedSets: (...args: any[]) => mockHasAnyCompletedSets(...args),
  isStorageInitialized: (...args: any[]) => mockIsStorageInitialized(...args),
  getLatestCompletedSessionByTemplateId: (...args: any[]) => mockGetLatestCompletedSessionByTemplateId(...args),
}));

describe("WorkoutDetailScreen - Next Label on All Sessions", () => {
  const mockPlan: WorkoutPlan = {
    id: 1,
    name: "Test Workout Plan",
    weekly_frequency: 3,
    duration_weeks: 4,
    created_at: new Date().toISOString(),
  };

  const mockSessions: WorkoutSessionTemplate[] = [
    {
      id: 1,
      workout_plan_id: 1,
      name: "Session 1",
      sequence_order: 1,
      estimated_duration_minutes: 45,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      workout_plan_id: 1,
      name: "Session 2",
      sequence_order: 2,
      estimated_duration_minutes: 50,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      workout_plan_id: 1,
      name: "Session 3",
      sequence_order: 3,
      estimated_duration_minutes: 40,
      created_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsStorageInitialized.mockReturnValue(true);
    mockGetWorkoutPlanById.mockReturnValue(mockPlan);
    mockGetSessionTemplatesByPlanId.mockReturnValue(mockSessions);
    mockGetInProgressSessionByPlanId.mockReturnValue(null);
    mockHasAnyCompletedSets.mockReturnValue(false);
    mockGetLatestCompletedSessionByTemplateId.mockReturnValue(null);
  });

  it("should show NEXT label on first session when no sessions are completed", () => {
    mockGetCompletedSessionsByPlanId.mockReturnValue([]);

    render(<WorkoutDetailScreen />);

    // Should have exactly one NEXT label
    expect(screen.getByText("NEXT")).toBeTruthy();
  });

  it("should show NEXT label on the first uncompleted session", () => {
    const completedSessions: WorkoutSessionCompleted[] = [
      {
        id: 100,
        session_template_id: 1,
        workout_plan_id: 1,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      },
    ];
    mockGetCompletedSessionsByPlanId.mockReturnValue(completedSessions);
    mockGetLatestCompletedSessionByTemplateId.mockImplementation((templateId: number) => {
      if (templateId === 1) {
        return completedSessions[0];
      }
      return null;
    });

    render(<WorkoutDetailScreen />);

    // Should have exactly one NEXT label on the next uncompleted session
    expect(screen.getByText("NEXT")).toBeTruthy();
  });

  it("should show NEXT label on first session when all sessions are completed (cycling through)", () => {
    // All sessions completed at least once
    const completedSessions: WorkoutSessionCompleted[] = [
      {
        id: 100,
        session_template_id: 1,
        workout_plan_id: 1,
        started_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 101,
        session_template_id: 2,
        workout_plan_id: 1,
        started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 102,
        session_template_id: 3,
        workout_plan_id: 1,
        started_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    mockGetCompletedSessionsByPlanId.mockReturnValue(completedSessions);
    mockGetLatestCompletedSessionByTemplateId.mockImplementation((templateId: number) => {
      const session = completedSessions.find((s) => s.session_template_id === templateId);
      return session || null;
    });

    render(<WorkoutDetailScreen />);

    // When all sessions are completed, the NEXT label should still appear
    // This is the key test: NEXT label should show even on completed sessions when cycling
    expect(screen.getByText("NEXT")).toBeTruthy();
    // Verify "Last workout" text appears (indicating sessions were completed before)
    const lastWorkoutTexts = screen.getAllByText(/Last workout:/);
    expect(lastWorkoutTexts.length).toBeGreaterThan(0);
  });
});
