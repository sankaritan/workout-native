import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
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
      />,
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
      />,
    );

    expect(screen.getByText("Adjust Wt")).toBeTruthy();
    expect(screen.getByText("kgs")).toBeTruthy();
    expect(screen.getByText("Adjust Reps")).toBeTruthy();
    expect(screen.getByText("Reps")).toBeTruthy();
    expect(screen.getByText("Done")).toBeTruthy();
  });

  it("prefills first set with previous performance values", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        previousWeight={225}
        previousReps={8}
        onSetsChange={mockOnSetsChange}
      />,
    );

    // First set should be prefilled with previous values
    const weightInput1 = screen.getByTestId("weight-input-1");
    const repsInput1 = screen.getByTestId("reps-input-1");
    expect(weightInput1.props.value).toBe("225");
    expect(repsInput1.props.value).toBe("8");

    // Second set should be empty
    const weightInput2 = screen.getByTestId("weight-input-2");
    const repsInput2 = screen.getByTestId("reps-input-2");
    expect(weightInput2.props.value).toBe("");
    expect(repsInput2.props.value).toBe("");
  });

  it("allows weight input", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        onSetsChange={mockOnSetsChange}
      />,
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
      />,
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
      />,
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
    const lastCall =
      mockOnSetsChange.mock.calls[mockOnSetsChange.mock.calls.length - 1][0];
    expect(lastCall[0].isCompleted).toBe(true);
    expect(lastCall[0].weight).toBe(135);
    expect(lastCall[0].reps).toBe(10);
  });

  it("prefills next set with current set values when Done is pressed", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        onSetsChange={mockOnSetsChange}
      />,
    );

    // Enter weight and reps for first set
    const weightInput1 = screen.getByTestId("weight-input-1");
    const repsInput1 = screen.getByTestId("reps-input-1");
    fireEvent.changeText(weightInput1, "170");
    fireEvent.changeText(repsInput1, "10");

    // Complete first set
    const checkbox1 = screen.getByTestId("complete-checkbox-1");
    fireEvent.press(checkbox1);

    // Second set should now be prefilled with first set's values
    const weightInput2 = screen.getByTestId("weight-input-2");
    const repsInput2 = screen.getByTestId("reps-input-2");
    expect(weightInput2.props.value).toBe("170");
    expect(repsInput2.props.value).toBe("10");
  });

  it("disables completed set inputs", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        onSetsChange={mockOnSetsChange}
      />,
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
      />,
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
      />,
    );

    // Change weight
    const weightInput = screen.getByTestId("weight-input-1");
    fireEvent.changeText(weightInput, "225");

    // Should call onSetsChange
    expect(mockOnSetsChange).toHaveBeenCalled();

    const lastCall =
      mockOnSetsChange.mock.calls[mockOnSetsChange.mock.calls.length - 1][0];
    expect(lastCall[0].weight).toBe(225);
  });

  it("highlights active set (first incomplete)", () => {
    render(
      <SetTracker
        targetSets={3}
        targetReps={10}
        onSetsChange={mockOnSetsChange}
      />,
    );

    // First set should be active initially
    const firstRow = screen.getByTestId("set-row-1");
    // Check that active row has border styling (using inline styles now)
    expect(firstRow.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderWidth: 1 })
      ])
    );

    // Complete first set
    const weightInput = screen.getByTestId("weight-input-1");
    const repsInput = screen.getByTestId("reps-input-1");
    fireEvent.changeText(weightInput, "135");
    fireEvent.changeText(repsInput, "10");
    const checkbox = screen.getByTestId("complete-checkbox-1");
    fireEvent.press(checkbox);

    // Second set should now be active
    const secondRow = screen.getByTestId("set-row-2");
    // Check that second row is now active with border styling
    expect(secondRow.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderWidth: 1 })
      ])
    );
  });

  describe("weight adjustment buttons", () => {
    it("increases weight by 2.5 when plus button is pressed", () => {
      render(
        <SetTracker
          targetSets={3}
          targetReps={10}
          previousWeight={100}
          previousReps={10}
          onSetsChange={mockOnSetsChange}
        />,
      );

      // First set should start with 100kgs (from previous)
      const weightInput = screen.getByTestId("weight-input-1");
      expect(weightInput.props.value).toBe("100");

      // Press plus button
      const plusButton = screen.getByTestId("weight-plus-1");
      fireEvent.press(plusButton);

      // Weight should now be 102.5
      expect(weightInput.props.value).toBe("102.5");
    });

    it("decreases weight by 2.5 when minus button is pressed", () => {
      render(
        <SetTracker
          targetSets={3}
          targetReps={10}
          previousWeight={100}
          previousReps={10}
          onSetsChange={mockOnSetsChange}
        />,
      );

      const weightInput = screen.getByTestId("weight-input-1");
      expect(weightInput.props.value).toBe("100");

      // Press minus button
      const minusButton = screen.getByTestId("weight-minus-1");
      fireEvent.press(minusButton);

      // Weight should now be 97.5
      expect(weightInput.props.value).toBe("97.5");
    });

    it("does not go below 0 when minus button is pressed", () => {
      render(
        <SetTracker
          targetSets={3}
          targetReps={10}
          onSetsChange={mockOnSetsChange}
        />,
      );

      const weightInput = screen.getByTestId("weight-input-1");
      // Set weight to 2
      fireEvent.changeText(weightInput, "2");
      expect(weightInput.props.value).toBe("2");

      // Press minus button - should go to 0, not negative
      const minusButton = screen.getByTestId("weight-minus-1");
      fireEvent.press(minusButton);

      expect(weightInput.props.value).toBe("0");
    });

    it("starts from 0 when pressing plus on empty weight", () => {
      render(
        <SetTracker
          targetSets={3}
          targetReps={10}
          onSetsChange={mockOnSetsChange}
        />,
      );

      // Second set has no weight
      const weightInput = screen.getByTestId("weight-input-2");
      expect(weightInput.props.value).toBe("");

      // Press plus button
      const plusButton = screen.getByTestId("weight-plus-2");
      fireEvent.press(plusButton);

      // Weight should now be 2.5
      expect(weightInput.props.value).toBe("2.5");
    });

    it("disables adjustment buttons for completed sets", () => {
      render(
        <SetTracker
          targetSets={3}
          targetReps={10}
          previousWeight={100}
          previousReps={10}
          onSetsChange={mockOnSetsChange}
        />,
      );

      // Complete first set
      const checkbox = screen.getByTestId("complete-checkbox-1");
      fireEvent.press(checkbox);

      // Buttons should be disabled (have opacity in style)
      const plusButton = screen.getByTestId("weight-plus-1");
      const minusButton = screen.getByTestId("weight-minus-1");
      // Check that disabled buttons have opacity styling
      expect(plusButton.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ opacity: 0.3 })
        ])
      );
      expect(minusButton.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ opacity: 0.3 })
        ])
      );
    });
  });

  describe("reps adjustment buttons", () => {
    it("increases reps by 1 when plus button is pressed", () => {
      render(
        <SetTracker
          targetSets={3}
          targetReps={10}
          previousWeight={100}
          previousReps={10}
          onSetsChange={mockOnSetsChange}
        />,
      );

      // First set should start with 10 reps (from previous)
      const repsInput = screen.getByTestId("reps-input-1");
      expect(repsInput.props.value).toBe("10");

      // Press plus button
      const plusButton = screen.getByTestId("reps-plus-1");
      fireEvent.press(plusButton);

      // Reps should now be 11
      expect(repsInput.props.value).toBe("11");
    });

    it("decreases reps by 1 when minus button is pressed", () => {
      render(
        <SetTracker
          targetSets={3}
          targetReps={10}
          previousWeight={100}
          previousReps={10}
          onSetsChange={mockOnSetsChange}
        />,
      );

      const repsInput = screen.getByTestId("reps-input-1");
      expect(repsInput.props.value).toBe("10");

      // Press minus button
      const minusButton = screen.getByTestId("reps-minus-1");
      fireEvent.press(minusButton);

      // Reps should now be 9
      expect(repsInput.props.value).toBe("9");
    });

    it("does not go below 0 when minus button is pressed", () => {
      render(
        <SetTracker
          targetSets={3}
          targetReps={10}
          onSetsChange={mockOnSetsChange}
        />,
      );

      const repsInput = screen.getByTestId("reps-input-2");
      // Set reps to 0 (start from nothing)
      fireEvent.changeText(repsInput, "0");
      expect(repsInput.props.value).toBe("0");

      // Press minus button - should stay at 0, not go negative
      const minusButton = screen.getByTestId("reps-minus-2");
      fireEvent.press(minusButton);

      expect(repsInput.props.value).toBe("0");
    });

    it("starts from 0 when pressing plus on empty reps", () => {
      render(
        <SetTracker
          targetSets={3}
          targetReps={10}
          onSetsChange={mockOnSetsChange}
        />,
      );

      // Second set has no reps
      const repsInput = screen.getByTestId("reps-input-2");
      expect(repsInput.props.value).toBe("");

      // Press plus button
      const plusButton = screen.getByTestId("reps-plus-2");
      fireEvent.press(plusButton);

      // Reps should now be 1
      expect(repsInput.props.value).toBe("1");
    });

    it("disables adjustment buttons for completed sets", () => {
      render(
        <SetTracker
          targetSets={3}
          targetReps={10}
          previousWeight={100}
          previousReps={10}
          onSetsChange={mockOnSetsChange}
        />,
      );

      // Complete first set
      const checkbox = screen.getByTestId("complete-checkbox-1");
      fireEvent.press(checkbox);

      // Buttons should be disabled (have opacity in style)
      const plusButton = screen.getByTestId("reps-plus-1");
      const minusButton = screen.getByTestId("reps-minus-1");
      // Check that disabled buttons have opacity styling
      expect(plusButton.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ opacity: 0.3 })
        ])
      );
      expect(minusButton.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ opacity: 0.3 })
        ])
      );
    });
  });
});
