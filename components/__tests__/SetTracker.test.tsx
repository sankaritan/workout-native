import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { SetTracker } from "../SetTracker";

describe("SetTracker", () => {
  const mockOnSetsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with correct number of sets", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        onSetsChange={mockOnSetsChange}
        testID="set-tracker"
      />
    );

    expect(screen.getByTestId("set-row-1")).toBeTruthy();
    expect(screen.getByTestId("set-row-2")).toBeTruthy();
    expect(screen.getByTestId("set-row-3")).toBeTruthy();
  });

  it("renders header columns", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        onSetsChange={mockOnSetsChange}
      />
    );

    expect(screen.getByText("Set")).toBeTruthy();
    expect(screen.getByText("Previous")).toBeTruthy();
    expect(screen.getByText("lbs")).toBeTruthy();
    expect(screen.getByText("Reps")).toBeTruthy();
    expect(screen.getByText("Done")).toBeTruthy();
  });

  it("shows previous performance as placeholder", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        previousWeight={225}
        previousReps={8}
        onSetsChange={mockOnSetsChange}
      />
    );

    // Check rows show previous data (should have multiple instances)
    const previousTexts = screen.getAllByText("225 × 8");
    expect(previousTexts.length).toBeGreaterThan(0);
  });

  it("allows weight input", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        onSetsChange={mockOnSetsChange}
      />
    );

    const weightInput = screen.getByTestId("weight-input-1");
    fireEvent.changeText(weightInput, "135");

    expect(weightInput.props.value).toBe("135");
  });

  it("allows reps input", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        onSetsChange={mockOnSetsChange}
      />
    );

    const repsInput = screen.getByTestId("reps-input-1");
    fireEvent.changeText(repsInput, "10");

    expect(repsInput.props.value).toBe("10");
  });

  it("marks set as completed when checkbox pressed", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        onSetsChange={mockOnSetsChange}
      />
    );

    // Enter weight and reps
    const weightInput = screen.getByTestId("weight-input-1");
    const repsInput = screen.getByTestId("reps-input-1");
    fireEvent.changeText(weightInput, "135");
    fireEvent.changeText(repsInput, "10");

    // Press checkbox
    const checkbox = screen.getByTestId("complete-checkbox-1");
    fireEvent.press(checkbox);

    // Verify onSetsChange called with completed set
    const lastCall = mockOnSetsChange.mock.calls[mockOnSetsChange.mock.calls.length - 1][0];
    expect(lastCall[0].isCompleted).toBe(true);
    expect(lastCall[0].weight).toBe(135);
    expect(lastCall[0].reps).toBe(10);
  });

  it("disables completed set inputs", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        onSetsChange={mockOnSetsChange}
      />
    );

    // Complete first set
    const weightInput = screen.getByTestId("weight-input-1");
    const repsInput = screen.getByTestId("reps-input-1");
    fireEvent.changeText(weightInput, "135");
    fireEvent.changeText(repsInput, "10");

    const checkbox = screen.getByTestId("complete-checkbox-1");
    fireEvent.press(checkbox);

    // Check inputs are now disabled
    expect(screen.getByTestId("weight-input-1").props.editable).toBe(false);
    expect(screen.getByTestId("reps-input-1").props.editable).toBe(false);
  });

  it("adds new set when add button pressed", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        onSetsChange={mockOnSetsChange}
        testID="set-tracker"
      />
    );

    // Initial 3 sets
    expect(screen.getByTestId("set-row-1")).toBeTruthy();
    expect(screen.getByTestId("set-row-2")).toBeTruthy();
    expect(screen.getByTestId("set-row-3")).toBeTruthy();

    // Add a set
    const addButton = screen.getByTestId("add-set-button");
    fireEvent.press(addButton);

    // Should now have 4 sets
    expect(screen.getByTestId("set-row-4")).toBeTruthy();
  });

  it("calls onSetsChange when sets update", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        onSetsChange={mockOnSetsChange}
      />
    );

    // Change weight
    const weightInput = screen.getByTestId("weight-input-1");
    fireEvent.changeText(weightInput, "225");

    // Should call onSetsChange
    expect(mockOnSetsChange).toHaveBeenCalled();

    const lastCall = mockOnSetsChange.mock.calls[mockOnSetsChange.mock.calls.length - 1][0];
    expect(lastCall[0].weight).toBe(225);
  });

  it("highlights active set (first incomplete)", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        onSetsChange={mockOnSetsChange}
      />
    );

    // First set should be active initially
    const firstRow = screen.getByTestId("set-row-1");
    expect(firstRow.props.className).toContain("border-primary");

    // Complete first set
    const weightInput = screen.getByTestId("weight-input-1");
    const repsInput = screen.getByTestId("reps-input-1");
    fireEvent.changeText(weightInput, "135");
    fireEvent.changeText(repsInput, "10");
    const checkbox = screen.getByTestId("complete-checkbox-1");
    fireEvent.press(checkbox);

    // Second set should now be active
    const secondRow = screen.getByTestId("set-row-2");
    expect(secondRow.props.className).toContain("border-primary");
  });
});
