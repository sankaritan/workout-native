import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ExerciseListItem } from "@/components/ExerciseListItem";
import type { ProgramExercise } from "@/lib/workout-generator/types";

// Mock MaterialIcons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

describe("ExerciseListItem", () => {
  const mockExercise: ProgramExercise = {
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
  };

  it("renders exercise name", () => {
    render(<ExerciseListItem exercise={mockExercise} />);
    expect(screen.getByText("Bench Press")).toBeTruthy();
  });

  it("renders sets and reps", () => {
    render(<ExerciseListItem exercise={mockExercise} />);
    expect(screen.getByText("3 × 8-12")).toBeTruthy();
  });

  it("renders muscle group", () => {
    render(<ExerciseListItem exercise={mockExercise} />);
    expect(screen.getByText(/Chest/)).toBeTruthy();
  });

  it("renders equipment", () => {
    render(<ExerciseListItem exercise={mockExercise} />);
    expect(screen.getByText(/Barbell/)).toBeTruthy();
  });

  it("renders order number", () => {
    render(<ExerciseListItem exercise={mockExercise} />);
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("renders bodyweight when equipment is null", () => {
    const bodyweightExercise: ProgramExercise = {
      ...mockExercise,
      exercise: {
        ...mockExercise.exercise,
        equipment_required: null,
      },
    };
    render(<ExerciseListItem exercise={bodyweightExercise} />);
    expect(screen.getByText(/Bodyweight/)).toBeTruthy();
  });
});
