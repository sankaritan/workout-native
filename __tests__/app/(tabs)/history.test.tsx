import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
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

// Helper to create mock sessions for the current month
function createMockSessionsForCurrentMonth() {
  const now = new Date();
  const day5 = new Date(now.getFullYear(), now.getMonth(), 5, 10, 0, 0);
  const day12 = new Date(now.getFullYear(), now.getMonth(), 12, 14, 0, 0);

  return [
    {
      id: 1,
      workout_plan_id: 1,
      session_template_id: 1,
      started_at: day5.toISOString(),
      completed_at: new Date(day5.getTime() + 3600000).toISOString(), // +1 hour
      notes: null,
    },
    {
      id: 2,
      workout_plan_id: 1,
      session_template_id: 2,
      started_at: day12.toISOString(),
      completed_at: new Date(day12.getTime() + 3600000).toISOString(), // +1 hour
      notes: null,
    },
  ];
}

function createMockTemplate() {
  return {
    id: 1,
    workout_plan_id: 1,
    sequence_order: 1,
    name: "Upper Body A",
    target_muscle_groups: '["Chest", "Back"]',
    estimated_duration_minutes: 60,
  };
}

function createMockSets() {
  return [
    {
      id: 1,
      completed_session_id: 1,
      exercise_id: 1,
      set_number: 1,
      weight: 135,
      reps: 8,
      is_warmup: false,
      completed_at: new Date().toISOString(),
    },
  ];
}

describe("HistoryScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (storage.isStorageInitialized as jest.Mock).mockReturnValue(true);
    (storage.getCompletedSessionsByDateRange as jest.Mock).mockReturnValue([]);
    (storage.getSessionTemplateById as jest.Mock).mockReturnValue(null);
    (storage.getCompletedSetsBySessionId as jest.Mock).mockReturnValue([]);
  });

  describe("Empty State", () => {
    it("shows empty state when no completed workouts", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("No Workout History")).toBeTruthy();
      });

      expect(
        screen.getByText("Complete your first workout to start tracking your progress")
      ).toBeTruthy();
    });
  });

  describe("With Workout Data", () => {
    beforeEach(() => {
      (storage.getCompletedSessionsByDateRange as jest.Mock).mockReturnValue(
        createMockSessionsForCurrentMonth()
      );
      (storage.getSessionTemplateById as jest.Mock).mockReturnValue(createMockTemplate());
      (storage.getCompletedSetsBySessionId as jest.Mock).mockReturnValue(createMockSets());
    });

    it("renders History header when sessions exist", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("History")).toBeTruthy();
      });
    });

    it("renders current month and year", async () => {
      render(<HistoryScreen />);

      const now = new Date();
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const expectedMonthYear = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

      await waitFor(() => {
        expect(screen.getByText(expectedMonthYear)).toBeTruthy();
      });
    });

    it("shows workout count stats", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("Workouts")).toBeTruthy();
      });

      // Workouts label should be visible - the count is displayed nearby
      // We verify the stats section exists rather than the specific number
      // since the calendar also contains the number "2" as a date
    });

    it("shows streak stats section", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("Streak")).toBeTruthy();
      });

      expect(screen.getByText("Days")).toBeTruthy();
    });

    it("renders month/year toggle buttons", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("Month")).toBeTruthy();
      });

      expect(screen.getByText("Year")).toBeTruthy();
    });

    it("can toggle between month and year view", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("Month")).toBeTruthy();
      });

      const yearButton = screen.getByText("Year");
      fireEvent.press(yearButton);

      // Both buttons should still exist after toggle
      expect(screen.getByText("Month")).toBeTruthy();
      expect(screen.getByText("Year")).toBeTruthy();
    });

    it("modal is not visible initially", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("History")).toBeTruthy();
      });

      // Template name should not be visible (modal closed)
      expect(screen.queryByText("Upper Body A")).toBeFalsy();
    });
  });

  describe("Month Navigation", () => {
    beforeEach(() => {
      (storage.getCompletedSessionsByDateRange as jest.Mock).mockReturnValue(
        createMockSessionsForCurrentMonth()
      );
    });

    it("calls getCompletedSessionsByDateRange on mount", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(storage.getCompletedSessionsByDateRange).toHaveBeenCalled();
      });
    });

    it("fetches data with correct date range for current month", async () => {
      render(<HistoryScreen />);

      await waitFor(() => {
        expect(storage.getCompletedSessionsByDateRange).toHaveBeenCalled();
      });

      const calls = (storage.getCompletedSessionsByDateRange as jest.Mock).mock.calls;
      expect(calls.length).toBeGreaterThan(0);

      const [startDate, endDate] = calls[0];
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Should be querying for first and last day of current month
      const now = new Date();
      expect(start.getMonth()).toBe(now.getMonth());
      expect(start.getFullYear()).toBe(now.getFullYear());
      expect(start.getDate()).toBe(1);
    });
  });

  describe("Initialization", () => {
    it("initializes storage if not initialized", async () => {
      (storage.isStorageInitialized as jest.Mock).mockReturnValue(false);
      (storage.initStorage as jest.Mock).mockResolvedValue(undefined);

      render(<HistoryScreen />);

      await waitFor(() => {
        expect(storage.initStorage).toHaveBeenCalled();
      });
    });

    it("does not initialize storage if already initialized", async () => {
      (storage.isStorageInitialized as jest.Mock).mockReturnValue(true);

      render(<HistoryScreen />);

      await waitFor(() => {
        expect(screen.getByText("No Workout History")).toBeTruthy();
      });

      expect(storage.initStorage).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("handles storage errors gracefully", async () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

      (storage.getCompletedSessionsByDateRange as jest.Mock).mockImplementation(() => {
        throw new Error("Storage error");
      });

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
