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
          equipment_required: "Barbell",
          is_compound: true,
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
          equipment_required: "Bodyweight",
          is_compound: true,
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

  it("starts collapsed", () => {
    render(<SessionCard session={mockSession} />);
    // Exercises should not be visible initially
    expect(screen.queryByText("Bench Press")).toBeNull();
  });

  it("expands when clicked", () => {
    const { getByTestId } = render(<SessionCard session={mockSession} />);
    const card = getByTestId("session-card");

    fireEvent.press(card);

    // Exercises should now be visible
    expect(screen.getByText("Bench Press")).toBeTruthy();
    expect(screen.getByText("Pull-up")).toBeTruthy();
  });

  it("collapses when clicked again", () => {
    const { getByTestId } = render(<SessionCard session={mockSession} />);
    const card = getByTestId("session-card");

    // Expand
    fireEvent.press(card);
    expect(screen.getByText("Bench Press")).toBeTruthy();

    // Collapse
    fireEvent.press(card);
    expect(screen.queryByText("Bench Press")).toBeNull();
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
