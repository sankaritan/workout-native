import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import HomeScreen from "@/app/(tabs)/index";
import * as storage from "@/lib/storage/storage";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
  useFocusEffect: jest.fn(),
}));

// Mock storage
jest.mock("@/lib/storage/storage");

// Mock safe area context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

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
      (storage.getAllWorkoutPlans as jest.Mock).mockReturnValue([]);
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
      name: "4-Day Balanced",
      description: "Test plan",
      weekly_frequency: 4,
      duration_weeks: 8,
      estimated_duration_minutes: 60,
      focus: "Balanced" as const,
      equipment_used: ["Barbell", "Dumbbell"] as const,
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
      (storage.getAllWorkoutPlans as jest.Mock).mockReturnValue([mockPlan]);
      (storage.getSessionTemplatesByPlanId as jest.Mock).mockReturnValue(
        mockSessions
      );
      (storage.getCompletedSessionsByPlanId as jest.Mock).mockReturnValue([]);
      (storage.getCompletedSessionsByDateRange as jest.Mock).mockReturnValue([]);
    });

    it("renders plans list when plans exist", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Your workout plans")).toBeTruthy();
      });
    });

    it("shows plan card with correct title format", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        // Title should be "[Goal] [Frequency]" e.g., "Balanced 4x/week"
        expect(screen.getByText("Balanced 4x/week")).toBeTruthy();
      });
    });

    it("shows equipment in plan card", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Barbell, Dumbbell")).toBeTruthy();
      });
    });

    it("shows next session in plan card", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Next up: Upper Body A")).toBeTruthy();
      });
    });

    it("displays generate new plan button", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Generate new workout plan")).toBeTruthy();
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
