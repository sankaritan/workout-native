import React from "react";
import { render, screen } from "@testing-library/react-native";
import { WorkoutPlanCard } from "@/components/WorkoutPlanCard";
import type { WorkoutProgram } from "@/lib/workout-generator/types";

// Mock MaterialIcons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

describe("WorkoutPlanCard", () => {
  const mockProgram: WorkoutProgram = {
    name: "Hypertrophy Program (3x/week)",
    focus: "Balanced",
    durationWeeks: 8,
    sessionsPerWeek: 3,
    sessions: [
      {
        name: "Full Body 1",
        dayOfWeek: 1,
        primaryMuscles: ["Chest", "Back", "Legs"],
        exercises: [],
      },
    ],
  };

  it("renders program name", () => {
    render(<WorkoutPlanCard program={mockProgram} />);
    expect(screen.getByText("Hypertrophy Program (3x/week)")).toBeTruthy();
  });

  it("renders duration", () => {
    render(<WorkoutPlanCard program={mockProgram} />);
    expect(screen.getByText("8 weeks")).toBeTruthy();
  });

  it("renders frequency", () => {
    render(<WorkoutPlanCard program={mockProgram} />);
    expect(screen.getByText("3 sessions/week")).toBeTruthy();
  });

  it("renders focus type", () => {
    render(<WorkoutPlanCard program={mockProgram} />);
    expect(screen.getByText("Balanced")).toBeTruthy();
  });

  it("renders plural weeks correctly", () => {
    const multiWeekProgram: WorkoutProgram = {
      ...mockProgram,
      durationWeeks: 12,
    };
    render(<WorkoutPlanCard program={multiWeekProgram} />);
    expect(screen.getByText("12 weeks")).toBeTruthy();
  });

  it("renders singular week correctly", () => {
    const singleWeekProgram: WorkoutProgram = {
      ...mockProgram,
      durationWeeks: 1,
    };
    render(<WorkoutPlanCard program={singleWeekProgram} />);
    expect(screen.getByText("1 week")).toBeTruthy();
  });
});
