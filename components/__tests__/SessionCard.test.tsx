import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { SessionCard } from "@/components/SessionCard";
import type { ProgramSession } from "@/lib/workout-generator/types";

// Mock MaterialIcons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

describe("SessionCard", () => {
  const mockSession: ProgramSession = {
    name: "Upper Body A",
    dayOfWeek: 1,
    primaryMuscles: ["Chest", "Back", "Shoulders"],
    exercises: [
      {
        exercise: {
          id: 1,
          name: "Bench Press",
          muscle_group: "Chest",
          muscle_groups: ["Chest", "Shoulders", "Arms"],
          equipment_required: "Barbell",
          priority: 1,
          description: "Compound chest exercise",
        },
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        order: 1,
      },
      {
        exercise: {
          id: 2,
          name: "Pull-up",
          muscle_group: "Back",
          muscle_groups: ["Back", "Arms"],
          equipment_required: "Bodyweight",
          priority: 2,
          description: "Bodyweight back exercise",
        },
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        order: 2,
      },
    ],
  };

  it("renders session name", () => {
    render(<SessionCard session={mockSession} />);
    expect(screen.getByText("Upper Body A")).toBeTruthy();
  });

  it("renders day of week", () => {
    render(<SessionCard session={mockSession} />);
    expect(screen.getByText("Day 1")).toBeTruthy();
  });

  it("renders exercise count", () => {
    render(<SessionCard session={mockSession} />);
    expect(screen.getByText("2 exercises")).toBeTruthy();
  });

  it("starts expanded", () => {
    render(<SessionCard session={mockSession} />);
    // Exercises should be visible initially
    expect(screen.getByText("Bench Press")).toBeTruthy();
    expect(screen.getByText("Pull-up")).toBeTruthy();
  });

  it("collapses when clicked", () => {
    const { getByTestId } = render(<SessionCard session={mockSession} />);
    const card = getByTestId("session-card");

    // Click to collapse (starts expanded)
    fireEvent.press(card);

    // Exercises should now be hidden
    expect(screen.queryByText("Bench Press")).toBeNull();
    expect(screen.queryByText("Pull-up")).toBeNull();
  });

  it("expands when clicked again", () => {
    const { getByTestId } = render(<SessionCard session={mockSession} />);
    const card = getByTestId("session-card");

    // Collapse (starts expanded)
    fireEvent.press(card);
    expect(screen.queryByText("Bench Press")).toBeNull();

    // Expand again
    fireEvent.press(card);
    expect(screen.getByText("Bench Press")).toBeTruthy();
  });

  it("renders singular exercise text when only one exercise", () => {
    const singleExerciseSession: ProgramSession = {
      ...mockSession,
      exercises: [mockSession.exercises[0]],
    };
    render(<SessionCard session={singleExerciseSession} />);
    expect(screen.getByText("1 exercise")).toBeTruthy();
  });
});
