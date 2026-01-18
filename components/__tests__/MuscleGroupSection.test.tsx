import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { MuscleGroupSection } from "@/components/MuscleGroupSection";
import type { Exercise } from "@/lib/storage/types";

// Mock MaterialIcons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

describe("MuscleGroupSection", () => {
  const mockExercises: Exercise[] = [
    {
      id: 1,
      name: "Bench Press",
      muscle_group: "Chest",
      equipment_required: "Barbell",
      is_compound: true,
      description: null,
    },
    {
      id: 2,
      name: "Dumbbell Fly",
      muscle_group: "Chest",
      equipment_required: "Dumbbell",
      is_compound: false,
      description: null,
    },
  ];

  const mockOnSwap = jest.fn();
  const mockOnRemove = jest.fn();
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders muscle group name", () => {
    render(
      <MuscleGroupSection
        muscleGroup="Chest"
        exercises={mockExercises}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        onAdd={mockOnAdd}
        canAdd={true}
      />
    );
    expect(screen.getByText("Chest")).toBeTruthy();
  });

  it("renders exercise count", () => {
    render(
      <MuscleGroupSection
        muscleGroup="Chest"
        exercises={mockExercises}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        onAdd={mockOnAdd}
        canAdd={true}
      />
    );
    expect(screen.getByText("(2)")).toBeTruthy();
  });

  it("renders all exercise cards", () => {
    render(
      <MuscleGroupSection
        muscleGroup="Chest"
        exercises={mockExercises}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        onAdd={mockOnAdd}
        canAdd={true}
      />
    );
    expect(screen.getByText("Bench Press")).toBeTruthy();
    expect(screen.getByText("Dumbbell Fly")).toBeTruthy();
  });

  it("renders add exercise button when canAdd is true", () => {
    render(
      <MuscleGroupSection
        muscleGroup="Chest"
        exercises={mockExercises}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        onAdd={mockOnAdd}
        canAdd={true}
      />
    );
    expect(screen.getByText("Add Exercise")).toBeTruthy();
  });

  it("does not render add exercise button when canAdd is false", () => {
    render(
      <MuscleGroupSection
        muscleGroup="Chest"
        exercises={mockExercises}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        onAdd={mockOnAdd}
        canAdd={false}
      />
    );
    expect(screen.queryByText("Add Exercise")).toBeNull();
  });

  it("calls onAdd when add button is pressed", () => {
    render(
      <MuscleGroupSection
        muscleGroup="Chest"
        exercises={mockExercises}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        onAdd={mockOnAdd}
        canAdd={true}
      />
    );
    const addButton = screen.getByText("Add Exercise");
    fireEvent.press(addButton);
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it("calls onSwap with correct exercise ID when swap is pressed", () => {
    render(
      <MuscleGroupSection
        muscleGroup="Chest"
        exercises={mockExercises}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        onAdd={mockOnAdd}
        canAdd={true}
      />
    );
    // Find all swap buttons and press the first one
    const swapButtons = screen.getAllByTestId("swap-button");
    fireEvent.press(swapButtons[0]);
    expect(mockOnSwap).toHaveBeenCalledWith(1); // First exercise ID
  });

  it("calls onRemove with correct exercise ID when remove is pressed", () => {
    render(
      <MuscleGroupSection
        muscleGroup="Chest"
        exercises={mockExercises}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        onAdd={mockOnAdd}
        canAdd={true}
      />
    );
    // Find all remove buttons and press the second one
    const removeButtons = screen.getAllByTestId("remove-button");
    fireEvent.press(removeButtons[1]);
    expect(mockOnRemove).toHaveBeenCalledWith(2); // Second exercise ID
  });

  it("disables remove when only one exercise exists", () => {
    const singleExercise = [mockExercises[0]];
    render(
      <MuscleGroupSection
        muscleGroup="Chest"
        exercises={singleExercise}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        onAdd={mockOnAdd}
        canAdd={true}
      />
    );
    const removeButton = screen.getByTestId("remove-button");
    fireEvent.press(removeButton);
    expect(mockOnRemove).not.toHaveBeenCalled();
  });

  it("renders empty state when no exercises", () => {
    render(
      <MuscleGroupSection
        muscleGroup="Chest"
        exercises={[]}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        onAdd={mockOnAdd}
        canAdd={true}
      />
    );
    expect(screen.getByText("(0)")).toBeTruthy();
    expect(screen.getByText("Add Exercise")).toBeTruthy();
  });

  it("renders with testID when provided", () => {
    render(
      <MuscleGroupSection
        muscleGroup="Chest"
        exercises={mockExercises}
        onSwap={mockOnSwap}
        onRemove={mockOnRemove}
        onAdd={mockOnAdd}
        canAdd={true}
        testID="test-section"
      />
    );
    expect(screen.getByTestId("test-section")).toBeTruthy();
  });
});
