import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { ExerciseCardWithActions } from "@/components/ExerciseCardWithActions";
import type { Exercise } from "@/lib/storage/types";

// Mock MaterialIcons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

describe("ExerciseCardWithActions", () => {
  const mockCompoundExercise: Exercise = {
    id: 1,
    name: "Bench Press",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Shoulders", "Arms"],
    equipment_required: "Barbell",
    priority: 1,
    description: "Compound chest exercise",
  };

  const mockIsolatedExercise: Exercise = {
    id: 2,
    name: "Dumbbell Fly",
    muscle_group: "Chest",
    muscle_groups: ["Chest"],
    equipment_required: "Dumbbell",
    priority: 4,
    description: "Isolation chest exercise",
  };

  const mockOnSwap = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders exercise name", () => {
    render(
      <ExerciseCardWithActions
        exercise={mockCompoundExercise}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        canRemove={true}
      />
    );
    expect(screen.getByText("Bench Press")).toBeTruthy();
  });

  it("renders primary badge for high priority exercises", () => {
    render(
      <ExerciseCardWithActions
        exercise={mockCompoundExercise}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        canRemove={true}
      />
    );
    expect(screen.getByText("Primary")).toBeTruthy();
  });

  it("renders isolation badge for isolation exercises", () => {
    render(
      <ExerciseCardWithActions
        exercise={mockIsolatedExercise}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        canRemove={true}
      />
    );
    expect(screen.getByText("Isolation")).toBeTruthy();
  });

  it("renders equipment type", () => {
    render(
      <ExerciseCardWithActions
        exercise={mockCompoundExercise}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        canRemove={true}
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
      <ExerciseCardWithActions
        exercise={bodyweightExercise}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        canRemove={true}
      />
    );
    expect(screen.getByText(/Bodyweight/)).toBeTruthy();
  });

  it("calls onSwap when swap button is pressed", () => {
    render(
      <ExerciseCardWithActions
        exercise={mockCompoundExercise}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        canRemove={true}
      />
    );
    const swapButton = screen.getByTestId("swap-button");
    fireEvent.press(swapButton);
    expect(mockOnSwap).toHaveBeenCalledTimes(1);
  });

  it("calls onRemove when remove button is pressed", () => {
    render(
      <ExerciseCardWithActions
        exercise={mockCompoundExercise}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        canRemove={true}
      />
    );
    const removeButton = screen.getByTestId("remove-button");
    fireEvent.press(removeButton);
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it("does not call onRemove when canRemove is false", () => {
    render(
      <ExerciseCardWithActions
        exercise={mockCompoundExercise}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        canRemove={false}
      />
    );
    const removeButton = screen.getByTestId("remove-button");
    fireEvent.press(removeButton);
    expect(mockOnRemove).not.toHaveBeenCalled();
  });

  it("shows remove button with reduced opacity when canRemove is false", () => {
    render(
      <ExerciseCardWithActions
        exercise={mockCompoundExercise}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        canRemove={false}
      />
    );
    const removeButton = screen.getByTestId("remove-button");
    expect(removeButton.props.accessibilityState?.disabled).toBe(true);
  });

  it("renders with testID when provided", () => {
    render(
      <ExerciseCardWithActions
        exercise={mockCompoundExercise}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        canRemove={true}
        testID="test-card"
      />
    );
    expect(screen.getByTestId("test-card")).toBeTruthy();
  });
});
