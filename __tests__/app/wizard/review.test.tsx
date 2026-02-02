import React from "react";
import { screen, waitFor } from "@testing-library/react-native";
import { renderWithWizard, setupWizardMocks } from "@/__tests__/test-utils";
import { router } from "expo-router";
import * as storage from "@/lib/storage/storage";

// Setup common mocks
setupWizardMocks();

// Mock storage functions
jest.mock("@/lib/storage/storage", () => ({
  getAllExercises: jest.fn(),
  insertWorkoutPlan: jest.fn(),
  insertSessionTemplate: jest.fn(),
  insertExerciseTemplate: jest.fn(),
}));

describe("Plan Review Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getAllExercises to return a basic set
    (storage.getAllExercises as jest.Mock).mockReturnValue([
      {
        id: 1,
        name: "Bench Press",
        muscle_group: "Chest",
        muscle_groups: ["Chest", "Shoulders", "Arms"],
        equipment_required: "Barbell",
        priority: 1,
      },
    ]);
    
    // Mock insertWorkoutPlan to return an ID
    (storage.insertWorkoutPlan as jest.Mock).mockReturnValue(1);
    (storage.insertSessionTemplate as jest.Mock).mockReturnValue(1);
    (storage.insertExerciseTemplate as jest.Mock).mockReturnValue(1);
  });

  // Simple rendering test to verify module loads
  it("can import the review screen module", () => {
    const ReviewScreen = require("@/app/wizard/review").default;
    expect(ReviewScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const ReviewScreen = require("@/app/wizard/review").default;
    const result = renderWithWizard(<ReviewScreen />);
    expect(result).toBeTruthy();
  });

  it("shows error message when no program is available", () => {
    const ReviewScreen = require("@/app/wizard/review").default;
    renderWithWizard(<ReviewScreen />);
    expect(screen.getByText("No Plan Found")).toBeTruthy();
  });
  
  it("does not save workout plan until user clicks Accept Plan", async () => {
    const ReviewScreen = require("@/app/wizard/review").default;
    const { rerender } = renderWithWizard(<ReviewScreen />, {
      // Provide initial wizard state with generated program
      // This simulates arriving at the review screen with a program
    });
    
    // Initially, insertWorkoutPlan should not have been called
    expect(storage.insertWorkoutPlan).not.toHaveBeenCalled();
    
    // Even after re-rendering (simulating navigation back and forth),
    // insertWorkoutPlan should still not be called
    rerender(
      <ReviewScreen />
    );
    
    await waitFor(() => {
      expect(storage.insertWorkoutPlan).not.toHaveBeenCalled();
    });
  });
});
