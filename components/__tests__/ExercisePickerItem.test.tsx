import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { ExercisePickerItem } from "@/components/ExercisePickerItem";
import type { Exercise } from "@/lib/storage/types";

// Mock MaterialIcons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

describe("ExercisePickerItem", () => {
  const mockCompoundExercise: Exercise = {
    id: 1,
    name: "Bench Press",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Shoulders", "Arms"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Compound chest exercise",
  };

  const mockIsolatedExercise: Exercise = {
    id: 2,
    name: "Dumbbell Fly",
    muscle_group: "Chest",
    muscle_groups: ["Chest"],
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Isolation chest exercise",
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders exercise name", () => {
    render(
      <ExercisePickerItem
        exercise={mockCompoundExercise}
        onPress={mockOnPress}
      />
    );
    expect(screen.getByText("Bench Press")).toBeTruthy();
  });

  it("renders compound badge for compound exercises", () => {
    render(
      <ExercisePickerItem
        exercise={mockCompoundExercise}
        onPress={mockOnPress}
      />
    );
    expect(screen.getByText("Compound")).toBeTruthy();
  });

  it("renders isolated badge for isolation exercises", () => {
    render(
      <ExercisePickerItem
        exercise={mockIsolatedExercise}
        onPress={mockOnPress}
      />
    );
    expect(screen.getByText("Isolated")).toBeTruthy();
  });

  it("renders equipment type", () => {
    render(
      <ExercisePickerItem
        exercise={mockCompoundExercise}
        onPress={mockOnPress}
      />
    );
    expect(screen.getByText(/Barbell/)).toBeTruthy();
  });

  it("renders bodyweight when equipment is null", () => {
    const bodyweightExercise: Exercise = {
      ...mockCompoundExercise,
      equipment_required: null,
    };
    render(
      <ExercisePickerItem
        exercise={bodyweightExercise}
        onPress={mockOnPress}
      />
    );
    expect(screen.getByText(/Bodyweight/)).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    render(
      <ExercisePickerItem
        exercise={mockCompoundExercise}
        onPress={mockOnPress}
      />
    );
    const item = screen.getByTestId(`exercise-picker-item-${mockCompoundExercise.id}`);
    fireEvent.press(item);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("renders with correct testID", () => {
    render(
      <ExercisePickerItem
        exercise={mockCompoundExercise}
        onPress={mockOnPress}
      />
    );
    expect(screen.getByTestId(`exercise-picker-item-${mockCompoundExercise.id}`)).toBeTruthy();
  });

  it("renders description when available", () => {
    render(
      <ExercisePickerItem
        exercise={mockCompoundExercise}
        onPress={mockOnPress}
      />
    );
    expect(screen.getByText("Compound chest exercise")).toBeTruthy();
  });

  it("does not render description when null", () => {
    const noDescExercise: Exercise = {
      ...mockCompoundExercise,
      description: null,
    };
    render(
      <ExercisePickerItem
        exercise={noDescExercise}
        onPress={mockOnPress}
      />
    );
    expect(screen.queryByText("Compound chest exercise")).toBeNull();
  });
});
