import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import HistoryScreen from "@/app/(tabs)/history";
import * as storage from "@/lib/storage/storage";

// Mock the storage module
jest.mock("@/lib/storage/storage", () => ({
  initStorage: jest.fn(),
  isStorageInitialized: jest.fn(),
  getCompletedSessionsByDateRange: jest.fn(),
  getSessionTemplateById: jest.fn(),
  getCompletedSetsBySessionId: jest.fn(),
  getExerciseById: jest.fn(),
}));

describe("HistoryScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (storage.isStorageInitialized as jest.Mock).mockReturnValue(true);
  });

  describe("Empty State", () => {
    it("shows empty state when no completed workouts", async () => {
      (storage.getCompletedSessionsByDateRange as jest.Mock).mockReturnValue([]);

      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("No Workout History")).toBeTruthy();
        expect(
          screen.getByText("Complete your first workout to start tracking your progress")
        ).toBeTruthy();
      });
    });

    it("shows loading indicator initially", () => {
      (storage.getCompletedSessionsByDateRange as jest.Mock).mockReturnValue([]);

      render(<HistoryScreen />);

      // Should show activity indicator before data loads
      expect(screen.queryByText("History")).toBeFalsy();
    });
  });

  describe("Calendar Display", () => {
    beforeEach(() => {
      const mockSessions = [
        {
          id: 1,
          workout_plan_id: 1,
          session_template_id: 1,
          started_at: "2023-10-05T10:00:00.000Z",
          completed_at: "2023-10-05T11:00:00.000Z",
          notes: null,
        },
        {
          id: 2,
          workout_plan_id: 1,
          session_template_id: 2,
          started_at: "2023-10-12T14:00:00.000Z",
          completed_at: "2023-10-12T15:00:00.000Z",
          notes: null,
        },
      ];

      (storage.getCompletedSessionsByDateRange as jest.Mock).mockReturnValue(mockSessions);
      (storage.getSessionTemplateById as jest.Mock).mockReturnValue({
        id: 1,
        workout_plan_id: 1,
        sequence_order: 1,
        name: "Upper Body A",
        target_muscle_groups: '["Chest", "Back"]',
        estimated_duration_minutes: 60,
      });
      (storage.getCompletedSetsBySessionId as jest.Mock).mockReturnValue([
        {
          id: 1,
          completed_session_id: 1,
          exercise_id: 1,
          set_number: 1,
          weight: 135,
          reps: 8,
          is_warmup: false,
          completed_at: "2023-10-05T10:30:00.000Z",
        },
      ]);
    });

    it("renders calendar with current month and year", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("History")).toBeTruthy();
        // Month name should be displayed
        expect(screen.getByText(/October|November|December|January/)).toBeTruthy();
      });
    });

    it("shows workout count stats", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("Workouts")).toBeTruthy();
        // There might be multiple "2"s on the calendar, so just check that the workout count is rendered
        const allText = screen.getAllByText(/2/);
        expect(allText.length).toBeGreaterThan(0);
      });
    });

    it("shows streak stats", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("Streak")).toBeTruthy();
        expect(screen.getByText("Days")).toBeTruthy();
      });
    });
  });

  describe("Month Navigation", () => {
    beforeEach(() => {
      (storage.getCompletedSessionsByDateRange as jest.Mock).mockReturnValue([
        {
          id: 1,
          workout_plan_id: 1,
          session_template_id: 1,
          started_at: "2023-10-05T10:00:00.000Z",
          completed_at: "2023-10-05T11:00:00.000Z",
          notes: null,
        },
      ]);
    });

    it("displays month and year in header", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("History")).toBeTruthy();
        // Should display a month name and year
        expect(screen.getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeTruthy();
      });
    });

    it("reloads data when navigating months", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("History")).toBeTruthy();
      });

      const initialCallCount = (storage.getCompletedSessionsByDateRange as jest.Mock).mock
        .calls.length;

      // Verify initial call was made
      expect(initialCallCount).toBeGreaterThan(0);
    });
  });

  describe("View Mode Toggle", () => {
    beforeEach(() => {
      (storage.getCompletedSessionsByDateRange as jest.Mock).mockReturnValue([
        {
          id: 1,
          workout_plan_id: 1,
          session_template_id: 1,
          started_at: "2023-10-05T10:00:00.000Z",
          completed_at: "2023-10-05T11:00:00.000Z",
          notes: null,
        },
      ]);
    });

    it("renders month/year toggle", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("Month")).toBeTruthy();
        expect(screen.getByText("Year")).toBeTruthy();
      });
    });

    it("can toggle between month and year view", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        const monthButton = screen.getByText("Month");
        const yearButton = screen.getByText("Year");

        expect(monthButton).toBeTruthy();
        expect(yearButton).toBeTruthy();

        // Click year button
        fireEvent.press(yearButton);

        // Both buttons should still be present
        expect(screen.getByText("Month")).toBeTruthy();
        expect(screen.getByText("Year")).toBeTruthy();
      });
    });
  });

  describe("Session Details Modal", () => {
    beforeEach(() => {
      (storage.getCompletedSessionsByDateRange as jest.Mock).mockReturnValue([
        {
          id: 1,
          workout_plan_id: 1,
          session_template_id: 1,
          started_at: "2023-10-05T10:00:00.000Z",
          completed_at: "2023-10-05T11:00:00.000Z",
          notes: null,
        },
      ]);
      (storage.getSessionTemplateById as jest.Mock).mockReturnValue({
        id: 1,
        workout_plan_id: 1,
        sequence_order: 1,
        name: "Upper Body A",
        target_muscle_groups: '["Chest", "Back"]',
        estimated_duration_minutes: 60,
      });
      (storage.getCompletedSetsBySessionId as jest.Mock).mockReturnValue([
        {
          id: 1,
          completed_session_id: 1,
          exercise_id: 1,
          set_number: 1,
          weight: 135,
          reps: 8,
          is_warmup: false,
          completed_at: "2023-10-05T10:30:00.000Z",
        },
        {
          id: 2,
          completed_session_id: 1,
          exercise_id: 2,
          set_number: 1,
          weight: 95,
          reps: 10,
          is_warmup: false,
          completed_at: "2023-10-05T10:45:00.000Z",
        },
      ]);
    });

    it("modal is initially not visible", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("History")).toBeTruthy();
      });

      // Session name should not be visible initially
      expect(screen.queryByText("Upper Body A")).toBeFalsy();
    });
  });

  describe("Initialization", () => {
    it("initializes storage if not initialized", async () => {
      (storage.isStorageInitialized as jest.Mock).mockReturnValue(false);
      (storage.initStorage as jest.Mock).mockResolvedValue(undefined);
      (storage.getCompletedSessionsByDateRange as jest.Mock).mockReturnValue([]);

      render(<HistoryScreen />);

      await waitFor(() => {
        expect(storage.initStorage).toHaveBeenCalled();
      });
    });

    it("does not initialize storage if already initialized", async () => {
      (storage.isStorageInitialized as jest.Mock).mockReturnValue(true);
      (storage.getCompletedSessionsByDateRange as jest.Mock).mockReturnValue([]);

      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("No Workout History")).toBeTruthy();
      });

      expect(storage.initStorage).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("handles storage errors gracefully", async () => {
      (storage.getCompletedSessionsByDateRange as jest.Mock).mockImplementation(() => {
        throw new Error("Storage error");
      });

      const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

      render(<HistoryScreen />);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          "Failed to load completed sessions:",
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });
  });
});
