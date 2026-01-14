/**
 * Tests for Exercise History Screen (Story 12)
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
  },
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(() => ({ id: "1" })),
  router: {
    back: jest.fn(),
  },
}));

// Mock storage module
jest.mock("@/lib/storage/storage", () => ({
  initStorage: jest.fn(),
  isStorageInitialized: jest.fn(),
  getExerciseById: jest.fn(),
  getCompletedSetsByExerciseId: jest.fn(),
}));

// Import after mocks are set up
import ExerciseHistoryScreen from "@/app/exercise/[id]/history";
import * as storage from "@/lib/storage/storage";

// Helper to wrap component with SafeAreaProvider
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      {component}
    </SafeAreaProvider>
  );
};

describe("ExerciseHistoryScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (storage.initStorage as jest.Mock).mockResolvedValue(undefined);
    (storage.isStorageInitialized as jest.Mock).mockReturnValue(true);
  });

  it("displays exercise name", async () => {
    (storage.getExerciseById as jest.Mock).mockReturnValue({
      id: 1,
      name: "Bench Press",
      muscle_group: "Chest",
      equipment_required: "Barbell",
      is_compound: true,
      description: null,
    });

    (storage.getCompletedSetsByExerciseId as jest.Mock).mockReturnValue([]);

    renderWithProviders(<ExerciseHistoryScreen />);

    await waitFor(() => {
      expect(screen.getByText("Bench Press")).toBeTruthy();
    });
  });

  it("displays total session count", async () => {
    (storage.getExerciseById as jest.Mock).mockReturnValue({
      id: 1,
      name: "Bench Press",
      muscle_group: "Chest",
      equipment_required: "Barbell",
      is_compound: true,
      description: null,
    });

    // Mock sets from 3 different sessions
    (storage.getCompletedSetsByExerciseId as jest.Mock).mockReturnValue([
      {
        id: 1,
        completed_session_id: 1,
        exercise_id: 1,
        set_number: 1,
        weight: 135,
        reps: 8,
        is_warmup: false,
        completed_at: "2024-01-01T10:00:00Z",
      },
      {
        id: 2,
        completed_session_id: 2,
        exercise_id: 1,
        set_number: 1,
        weight: 140,
        reps: 8,
        is_warmup: false,
        completed_at: "2024-01-08T10:00:00Z",
      },
      {
        id: 3,
        completed_session_id: 3,
        exercise_id: 1,
        set_number: 1,
        weight: 145,
        reps: 8,
        is_warmup: false,
        completed_at: "2024-01-15T10:00:00Z",
      },
    ]);

    renderWithProviders(<ExerciseHistoryScreen />);

    await waitFor(() => {
      // Component shows "Sessions" label and "3" separately
      expect(screen.getByText("Sessions")).toBeTruthy();
      expect(screen.getByText("3")).toBeTruthy();
    });
  });

  it("displays personal record (PR)", async () => {
    (storage.getExerciseById as jest.Mock).mockReturnValue({
      id: 1,
      name: "Bench Press",
      muscle_group: "Chest",
      equipment_required: "Barbell",
      is_compound: true,
      description: null,
    });

    (storage.getCompletedSetsByExerciseId as jest.Mock).mockReturnValue([
      {
        id: 1,
        completed_session_id: 1,
        exercise_id: 1,
        set_number: 1,
        weight: 135,
        reps: 8,
        is_warmup: false,
        completed_at: "2024-01-01T10:00:00Z",
      },
      {
        id: 2,
        completed_session_id: 2,
        exercise_id: 1,
        set_number: 1,
        weight: 145, // PR weight
        reps: 8,
        is_warmup: false,
        completed_at: "2024-01-08T10:00:00Z",
      },
    ]);

    renderWithProviders(<ExerciseHistoryScreen />);

    await waitFor(() => {
      // Component shows "PR" label and weight/reps
      expect(screen.getByText("PR")).toBeTruthy();
      // Weight "145" appears in multiple places (PR card and history), so use getAllByText
      const weightElements = screen.getAllByText(/145/);
      expect(weightElements.length).toBeGreaterThan(0);
      expect(screen.getByText("8 reps")).toBeTruthy();
    });
  });

  it("renders progress chart with data", async () => {
    (storage.getExerciseById as jest.Mock).mockReturnValue({
      id: 1,
      name: "Bench Press",
      muscle_group: "Chest",
      equipment_required: "Barbell",
      is_compound: true,
      description: null,
    });

    (storage.getCompletedSetsByExerciseId as jest.Mock).mockReturnValue([
      {
        id: 1,
        completed_session_id: 1,
        exercise_id: 1,
        set_number: 1,
        weight: 135,
        reps: 8,
        is_warmup: false,
        completed_at: "2024-01-01T10:00:00Z",
      },
    ]);

    renderWithProviders(<ExerciseHistoryScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("progress-chart")).toBeTruthy();
    });
  });

  it("displays historical sets list", async () => {
    (storage.getExerciseById as jest.Mock).mockReturnValue({
      id: 1,
      name: "Bench Press",
      muscle_group: "Chest",
      equipment_required: "Barbell",
      is_compound: true,
      description: null,
    });

    (storage.getCompletedSetsByExerciseId as jest.Mock).mockReturnValue([
      {
        id: 1,
        completed_session_id: 1,
        exercise_id: 1,
        set_number: 1,
        weight: 135,
        reps: 8,
        is_warmup: false,
        completed_at: "2024-01-01T10:00:00Z",
      },
      {
        id: 2,
        completed_session_id: 1,
        exercise_id: 1,
        set_number: 2,
        weight: 135,
        reps: 8,
        is_warmup: false,
        completed_at: "2024-01-01T10:05:00Z",
      },
    ]);

    renderWithProviders(<ExerciseHistoryScreen />);

    await waitFor(() => {
      // Should show weight × reps format (there are multiple, so use getAllByText)
      const elements = screen.getAllByText(/135.*lbs.*×.*8.*reps/);
      expect(elements.length).toBeGreaterThan(0);
      // Also verify set labels
      expect(screen.getByText("Set 1")).toBeTruthy();
      expect(screen.getByText("Set 2")).toBeTruthy();
    });
  });

  it("shows empty state when no history", async () => {
    (storage.getExerciseById as jest.Mock).mockReturnValue({
      id: 1,
      name: "Bench Press",
      muscle_group: "Chest",
      equipment_required: "Barbell",
      is_compound: true,
      description: null,
    });

    (storage.getCompletedSetsByExerciseId as jest.Mock).mockReturnValue([]);

    renderWithProviders(<ExerciseHistoryScreen />);

    await waitFor(() => {
      expect(screen.getByText(/no history/i)).toBeTruthy();
    });
  });
});
