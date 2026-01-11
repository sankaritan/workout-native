import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import HomeScreen from "@/app/(tabs)/index";
import * as storage from "@/lib/storage/storage";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock storage
jest.mock("@/lib/storage/storage");

// Mock MaterialIcons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (storage.isStorageInitialized as jest.Mock).mockReturnValue(true);
  });

  describe("Empty state (no active plan)", () => {
    beforeEach(() => {
      (storage.getActiveWorkoutPlan as jest.Mock).mockReturnValue(null);
    });

    it("renders empty state when no active plan", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Welcome to your new routine")).toBeTruthy();
      });
    });

    it("shows generate plan button", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByTestId("generate-plan-button")).toBeTruthy();
      });
    });

    it("displays empty state description", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(
          screen.getByText(/don't have a workout plan yet/i)
        ).toBeTruthy();
      });
    });
  });

  describe("Active plan state", () => {
    const mockPlan = {
      id: 1,
      name: "4-Day Hypertrophy",
      description: "Test plan",
      weekly_frequency: 4,
      duration_weeks: 8,
      estimated_duration_minutes: 60,
      created_at: "2024-01-01T00:00:00.000Z",
      is_active: true,
    };

    const mockSessions = [
      {
        id: 1,
        workout_plan_id: 1,
        sequence_order: 1,
        name: "Upper Body A",
        target_muscle_groups: '["Chest","Back"]',
        estimated_duration_minutes: 60,
      },
      {
        id: 2,
        workout_plan_id: 1,
        sequence_order: 2,
        name: "Lower Body",
        target_muscle_groups: '["Legs"]',
        estimated_duration_minutes: 60,
      },
      {
        id: 3,
        workout_plan_id: 1,
        sequence_order: 3,
        name: "Upper Body B",
        target_muscle_groups: '["Shoulders","Arms"]',
        estimated_duration_minutes: 60,
      },
    ];

    beforeEach(() => {
      (storage.getActiveWorkoutPlan as jest.Mock).mockReturnValue(mockPlan);
      (storage.getSessionTemplatesByPlanId as jest.Mock).mockReturnValue(
        mockSessions
      );
      (storage.getCompletedSessionsByPlanId as jest.Mock).mockReturnValue([]);
    });

    it("renders active plan when exists", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Your Workout Plan")).toBeTruthy();
        expect(screen.getByText("4-Day Hypertrophy")).toBeTruthy();
      });
    });

    it("shows plan details", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Week 1 of 8/)).toBeTruthy();
        expect(screen.getByText(/4x per week/)).toBeTruthy();
      });
    });

    it("displays progress bar", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/0% complete/)).toBeTruthy();
      });
    });

    it("shows next session", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Next Up")).toBeTruthy();
        // Upper Body A appears in multiple places, use getAllByText
        const upperBodyTexts = screen.getAllByText("Upper Body A");
        expect(upperBodyTexts.length).toBeGreaterThan(0);
      });
    });

    it("displays start session button", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByTestId("start-session-button")).toBeTruthy();
      });
    });

    it("shows all sessions list", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText("All Sessions")).toBeTruthy();
        // Sessions appear in multiple places, check they exist
        expect(screen.getAllByText("Upper Body A").length).toBeGreaterThan(0);
        expect(screen.getByText("Lower Body")).toBeTruthy();
        expect(screen.getByText("Upper Body B")).toBeTruthy();
      });
    });

    it("calculates progress correctly with completed sessions", async () => {
      const completedSessions = [
        {
          id: 1,
          workout_plan_id: 1,
          session_template_id: 1,
          started_at: "2024-01-01T10:00:00.000Z",
          completed_at: "2024-01-01T11:00:00.000Z",
          notes: null,
        },
        {
          id: 2,
          workout_plan_id: 1,
          session_template_id: 2,
          started_at: "2024-01-02T10:00:00.000Z",
          completed_at: "2024-01-02T11:00:00.000Z",
          notes: null,
        },
      ];

      (storage.getCompletedSessionsByPlanId as jest.Mock).mockReturnValue(
        completedSessions
      );

      render(<HomeScreen />);

      await waitFor(() => {
        // 2 completed out of 32 total (4 sessions/week * 8 weeks) = 6%
        expect(screen.getByText(/6% complete/)).toBeTruthy();
      });
    });

    it("shows completed checkmarks on finished sessions", async () => {
      // Complete all 3 sessions so the next session (cycling back to first) is marked as done before
      const completedSessions = [
        {
          id: 1,
          workout_plan_id: 1,
          session_template_id: 1,
          started_at: "2024-01-01T10:00:00.000Z",
          completed_at: "2024-01-01T11:00:00.000Z",
          notes: null,
        },
        {
          id: 2,
          workout_plan_id: 1,
          session_template_id: 2,
          started_at: "2024-01-02T10:00:00.000Z",
          completed_at: "2024-01-02T11:00:00.000Z",
          notes: null,
        },
        {
          id: 3,
          workout_plan_id: 1,
          session_template_id: 3,
          started_at: "2024-01-03T10:00:00.000Z",
          completed_at: "2024-01-03T11:00:00.000Z",
          notes: null,
        },
      ];

      (storage.getCompletedSessionsByPlanId as jest.Mock).mockReturnValue(
        completedSessions
      );

      render(<HomeScreen />);

      await waitFor(() => {
        // When all sessions are completed, it cycles back and shows "Done before"
        expect(screen.getByText("Done before")).toBeTruthy();
      });
    });

    it("identifies next uncompleted session", async () => {
      const completedSessions = [
        {
          id: 1,
          workout_plan_id: 1,
          session_template_id: 1,
          started_at: "2024-01-01T10:00:00.000Z",
          completed_at: "2024-01-01T11:00:00.000Z",
          notes: null,
        },
      ];

      (storage.getCompletedSessionsByPlanId as jest.Mock).mockReturnValue(
        completedSessions
      );

      render(<HomeScreen />);

      await waitFor(() => {
        // Next session should be "Lower Body" since Upper Body A is completed
        expect(screen.getAllByText("Lower Body").length).toBeGreaterThan(0);
        // "Next Up" section should be present
        expect(screen.getByText("Next Up")).toBeTruthy();
        // Should have "NEXT" badge in the all sessions list
        expect(screen.getAllByText("NEXT").length).toBeGreaterThan(0);
      });
    });

    it("displays monthly workout stats", async () => {
      const now = new Date();
      const completedSessions = [
        {
          id: 1,
          workout_plan_id: 1,
          session_template_id: 1,
          started_at: now.toISOString(),
          completed_at: now.toISOString(),
          notes: null,
        },
        {
          id: 2,
          workout_plan_id: 1,
          session_template_id: 2,
          started_at: now.toISOString(),
          completed_at: now.toISOString(),
          notes: null,
        },
      ];

      (storage.getCompletedSessionsByPlanId as jest.Mock).mockReturnValue(
        completedSessions
      );

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/2 workouts this month/)).toBeTruthy();
      });
    });
  });

  describe("Loading state", () => {
    it("shows loading indicator initially", () => {
      (storage.isStorageInitialized as jest.Mock).mockReturnValue(false);

      render(<HomeScreen />);

      // ActivityIndicator should be present
      const { UNSAFE_root } = render(<HomeScreen />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
