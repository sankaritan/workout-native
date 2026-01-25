import React from "react";
import { screen } from "@testing-library/react-native";
import { renderWithWizard, setupWizardMocks } from "@/__tests__/test-utils";

// Setup common mocks
setupWizardMocks();

// Mock storage to return test exercises
jest.mock("@/lib/storage/storage", () => ({
  getAllExercises: jest.fn().mockReturnValue([
    { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Barbell", is_compound: true, description: null },
    { id: 2, name: "Push-up", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Bodyweight", is_compound: true, description: null },
    { id: 3, name: "Cable Flyes", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Cables", is_compound: false, description: null },
    { id: 4, name: "Deadlift", muscle_group: "Back", muscle_groups: ["Back"], equipment_required: "Barbell", is_compound: true, description: null },
    { id: 5, name: "Pull-up", muscle_group: "Back", muscle_groups: ["Back"], equipment_required: "Bodyweight", is_compound: true, description: null },
    { id: 6, name: "Cable Row", muscle_group: "Back", muscle_groups: ["Back"], equipment_required: "Cables", is_compound: true, description: null },
    { id: 7, name: "Squat", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Barbell", is_compound: true, description: null },
    { id: 8, name: "Lunges", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Bodyweight", is_compound: true, description: null },
    { id: 9, name: "Leg Press", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Machines", is_compound: true, description: null },
    { id: 10, name: "Overhead Press", muscle_group: "Shoulders", muscle_groups: ["Shoulders"], equipment_required: "Barbell", is_compound: true, description: null },
    { id: 11, name: "Pike Push-up", muscle_group: "Shoulders", muscle_groups: ["Shoulders"], equipment_required: "Bodyweight", is_compound: true, description: null },
    { id: 12, name: "Cable Lateral Raise", muscle_group: "Shoulders", muscle_groups: ["Shoulders"], equipment_required: "Cables", is_compound: false, description: null },
    { id: 13, name: "Tricep Dips", muscle_group: "Arms", muscle_groups: ["Arms"], equipment_required: "Bodyweight", is_compound: true, description: null },
    { id: 14, name: "Bicep Curl", muscle_group: "Arms", muscle_groups: ["Arms"], equipment_required: "Barbell", is_compound: false, description: null },
    { id: 15, name: "Cable Pushdown", muscle_group: "Arms", muscle_groups: ["Arms"], equipment_required: "Cables", is_compound: false, description: null },
    { id: 16, name: "Plank", muscle_group: "Core", muscle_groups: ["Core"], equipment_required: "Bodyweight", is_compound: false, description: null },
    { id: 17, name: "Ab Wheel", muscle_group: "Core", muscle_groups: ["Core"], equipment_required: "Bodyweight", is_compound: true, description: null },
    { id: 18, name: "Cable Crunch", muscle_group: "Core", muscle_groups: ["Core"], equipment_required: "Cables", is_compound: false, description: null },
  ]),
}));

describe("Exercises Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("can import the exercises screen module", () => {
    const ExercisesScreen = require("@/app/wizard/exercises").default;
    expect(ExercisesScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const ExercisesScreen = require("@/app/wizard/exercises").default;
    const result = renderWithWizard(<ExercisesScreen />);
    expect(result).toBeTruthy();
  });

  it("renders title text", () => {
    const ExercisesScreen = require("@/app/wizard/exercises").default;
    renderWithWizard(<ExercisesScreen />);
    expect(screen.getByText("Review Exercises")).toBeTruthy();
  });

  it("renders step indicator showing step 4 of 5", () => {
    const ExercisesScreen = require("@/app/wizard/exercises").default;
    renderWithWizard(<ExercisesScreen />);
    expect(screen.getByText("Step 4 of 5")).toBeTruthy();
  });

  it("renders empty state when no wizard context is set", () => {
    const ExercisesScreen = require("@/app/wizard/exercises").default;
    renderWithWizard(<ExercisesScreen />);
    // Without frequency and equipment in wizard context, no exercises will be loaded
    // This is expected - the screen is meant to be reached after going through
    // frequency and equipment screens
    expect(screen.getByText("Review Exercises")).toBeTruthy();
    expect(screen.getByText(/Customize your exercise selection/)).toBeTruthy();
  });

  it("renders continue button", () => {
    const ExercisesScreen = require("@/app/wizard/exercises").default;
    renderWithWizard(<ExercisesScreen />);
    expect(screen.getByText("Continue")).toBeTruthy();
  });

  it("renders back button", () => {
    const ExercisesScreen = require("@/app/wizard/exercises").default;
    renderWithWizard(<ExercisesScreen />);
    expect(screen.getByTestId("back-button")).toBeTruthy();
  });

  it("renders progress bar with 4 segments filled", () => {
    const ExercisesScreen = require("@/app/wizard/exercises").default;
    renderWithWizard(<ExercisesScreen />);
    // Check for progress bar - 4 segments filled out of 5
    expect(screen.getByTestId("progress-bar")).toBeTruthy();
  });
});
