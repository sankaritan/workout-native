import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import WorkoutSessionScreen from "@/app/session/[id]";

// Mock expo-router
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "1" }),
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock storage functions
jest.mock("@/lib/storage/storage", () => ({
  getSessionWithExercises: jest.fn(),
  getLastCompletedSetForExercise: jest.fn(),
  insertCompletedSession: jest.fn(),
  updateCompletedSession: jest.fn(),
  insertCompletedSet: jest.fn(),
  deleteCompletedSetsBySessionId: jest.fn(),
  getWorkoutPlanById: jest.fn(),
  getInProgressSessionByTemplateId: jest.fn(),
  getCompletedSetsBySessionId: jest.fn(),
}));

// Mock alert utility
let mockAlertCallback: (() => void) | null = null;
jest.mock("@/lib/utils/alert", () => ({
  showAlert: jest.fn((title: string, message?: string, buttons?: any[]) => {
    if (buttons && buttons.length > 1) {
      // Store the confirm callback for testing
      const confirmButton = buttons.find((btn: any) => btn.style !== "cancel");
      if (confirmButton?.onPress) {
        mockAlertCallback = confirmButton.onPress;
        // Auto-call it for most tests
        confirmButton.onPress();
      }
    }
  }),
}));

// Mock safe area context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock MaterialIcons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

import {
  getSessionWithExercises,
  getLastCompletedSetForExercise,
  insertCompletedSession,
  updateCompletedSession,
  insertCompletedSet,
  deleteCompletedSetsBySessionId,
  getInProgressSessionByTemplateId,
  getCompletedSetsBySessionId,
} from "@/lib/storage/storage";
import { showAlert } from "@/lib/utils/alert";
import { router } from "expo-router";

const mockSession = {
  id: 1,
  workout_plan_id: 1,
  sequence_order: 1,
  name: "Upper Body A",
  target_muscle_groups: '["Chest","Back"]',
  estimated_duration_minutes: 45,
  exercises: [
    {
      id: 1,
      session_template_id: 1,
      exercise_id: 1,
      exercise_order: 1,
      sets: 3,
      reps: 10,
      is_warmup: 0,
      exercise: {
        id: 1,
        name: "Bench Press",
        muscle_group: "Chest",
        equipment_required: "Barbell",
        priority: 1,
        description: "Compound chest exercise",
      },
    },
    {
      id: 2,
      session_template_id: 1,
      exercise_id: 2,
      exercise_order: 2,
      sets: 3,
      reps: 12,
      is_warmup: 0,
      exercise: {
        id: 2,
        name: "Bent Over Row",
        muscle_group: "Back",
        equipment_required: "Barbell",
        priority: 1,
        description: "Compound back exercise",
      },
    },
  ],
};

describe("WorkoutSessionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSessionWithExercises as jest.Mock).mockReturnValue(mockSession);
    (getLastCompletedSetForExercise as jest.Mock).mockReturnValue({
      weight: 135,
      reps: 10,
    });
    (insertCompletedSession as jest.Mock).mockReturnValue(1);
    (getInProgressSessionByTemplateId as jest.Mock).mockReturnValue(null);
    (getCompletedSetsBySessionId as jest.Mock).mockReturnValue([]);
    (deleteCompletedSetsBySessionId as jest.Mock).mockReturnValue(undefined);
    mockAlertCallback = null;
  });

  it("renders session name in header", async () => {
    render(<WorkoutSessionScreen />);

    await waitFor(() => {
      expect(screen.getByText("Upper Body A")).toBeTruthy();
    });
  });

  it("renders finish button", async () => {
    render(<WorkoutSessionScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("finish-button")).toBeTruthy();
    });
  });

  it("renders first exercise name", async () => {
    render(<WorkoutSessionScreen />);

    await waitFor(() => {
      expect(screen.getByText("Bench Press")).toBeTruthy();
    });
  });

  it("shows target sets and reps", async () => {
    render(<WorkoutSessionScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Target: 3 × 10 reps/)).toBeTruthy();
    });
  });

  it("shows previous performance", async () => {
    render(<WorkoutSessionScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Last Time: 135lbs × 10 reps/)).toBeTruthy();
    });
  });

  it("renders set tracker", async () => {
    render(<WorkoutSessionScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("set-tracker")).toBeTruthy();
    });
  });

  it("creates completed session on mount", async () => {
    render(<WorkoutSessionScreen />);

    await waitFor(() => {
      expect(insertCompletedSession).toHaveBeenCalledWith(
        expect.objectContaining({
          workout_plan_id: 1,
          session_template_id: 1,
        })
      );
    });
  });

  it("navigates to next exercise", async () => {
    render(<WorkoutSessionScreen />);

    await waitFor(() => {
      expect(screen.getByText("Bench Press")).toBeTruthy();
    });

    const nextButton = screen.getByTestId("next-exercise-button");
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(screen.getByText("Bent Over Row")).toBeTruthy();
    });
  });

  it("navigates to previous exercise", async () => {
    render(<WorkoutSessionScreen />);

    await waitFor(() => {
      expect(screen.getByText("Bench Press")).toBeTruthy();
    });

    // Go to next exercise first
    const nextButton = screen.getByTestId("next-exercise-button");
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(screen.getByText("Bent Over Row")).toBeTruthy();
    });

    // Go back to previous
    const prevButton = screen.getByTestId("previous-exercise-button");
    fireEvent.press(prevButton);

    await waitFor(() => {
      expect(screen.getByText("Bench Press")).toBeTruthy();
    });
  });

  it("disables previous button on first exercise", async () => {
    render(<WorkoutSessionScreen />);

    await waitFor(() => {
      const prevButton = screen.getByTestId("previous-exercise-button");
      expect(prevButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  it("disables next button on last exercise", async () => {
    render(<WorkoutSessionScreen />);

    await waitFor(() => {
      expect(screen.getByText("Bench Press")).toBeTruthy();
    });

    // Navigate to last exercise
    const nextButton = screen.getByTestId("next-exercise-button");
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(nextButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  it("shows finish confirmation dialog", async () => {
    render(<WorkoutSessionScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("finish-button")).toBeTruthy();
    });

    const finishButton = screen.getByTestId("finish-button");
    fireEvent.press(finishButton);

    expect(showAlert).toHaveBeenCalledWith(
      "Finish Workout",
      "Are you sure you want to finish this workout?",
      expect.any(Array)
    );
  });

  it("saves sets and completes session on finish", async () => {
    render(<WorkoutSessionScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("finish-button")).toBeTruthy();
    });

    const finishButton = screen.getByTestId("finish-button");
    fireEvent.press(finishButton);

    // Since window.confirm returns true in our mock, the confirm callback executes immediately
    await waitFor(() => {
      expect(updateCompletedSession).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith("/(tabs)");
    });
  });

  it("navigates back if session not found", async () => {
    (getSessionWithExercises as jest.Mock).mockReturnValue(null);

    render(<WorkoutSessionScreen />);

    await waitFor(() => {
      expect(showAlert).toHaveBeenCalledWith("Error", "Session not found");
      expect(router.back).toHaveBeenCalled();
    });
  });
});
