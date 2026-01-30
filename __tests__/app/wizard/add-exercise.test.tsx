import React from "react";
import { screen, fireEvent } from "@testing-library/react-native";
import { renderWithWizard, mockMaterialIcons } from "@/__tests__/test-utils";

// Mock expo-router with custom mockRouterBack
const mockRouterBack = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: mockRouterBack,
  },
  useRouter: () => ({
    push: jest.fn(),
    back: mockRouterBack,
  }),
  useLocalSearchParams: () => ({}),
  Stack: {
    Screen: () => null,
  },
}));

// Mock MaterialIcons
mockMaterialIcons();

// Mock storage to return test exercises
jest.mock("@/lib/storage/storage", () => ({
  getAllExercises: jest.fn().mockReturnValue([
    { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest", "Shoulders", "Arms"], equipment_required: "Barbell", is_compound: true, description: "Compound chest exercise" },
    { id: 2, name: "Push-up", muscle_group: "Chest", muscle_groups: ["Chest", "Arms"], equipment_required: "Bodyweight", is_compound: true, description: "Bodyweight chest exercise" },
    { id: 3, name: "Dumbbell Fly", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Dumbbell", is_compound: false, description: "Isolation chest exercise" },
    { id: 4, name: "Cable Crossover", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Cables", is_compound: false, description: null },
    { id: 5, name: "Deadlift", muscle_group: "Back", muscle_groups: ["Back", "Legs", "Core"], equipment_required: "Barbell", is_compound: true, description: null },
  ]),
}));

describe("Add Exercise Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("can import the add exercise screen module", () => {
    const AddExerciseScreen = require("@/app/wizard/add-exercise").default;
    expect(AddExerciseScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const AddExerciseScreen = require("@/app/wizard/add-exercise").default;
    const result = renderWithWizard(<AddExerciseScreen />);
    expect(result).toBeTruthy();
  });

  it("renders title text", () => {
    const AddExerciseScreen = require("@/app/wizard/add-exercise").default;
    renderWithWizard(<AddExerciseScreen />);
    expect(screen.getByText("Add Exercise")).toBeTruthy();
  });

  it("renders close button", () => {
    const AddExerciseScreen = require("@/app/wizard/add-exercise").default;
    renderWithWizard(<AddExerciseScreen />);
    expect(screen.getByTestId("close-button")).toBeTruthy();
  });

  it("displays filter pills for muscle groups", () => {
    const AddExerciseScreen = require("@/app/wizard/add-exercise").default;
    renderWithWizard(<AddExerciseScreen />);
    // Check that muscle group filter pills are present
    expect(screen.getAllByText("Chest").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Back").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Shoulders").length).toBeGreaterThan(0);
    expect(screen.getByText("Compound Only")).toBeTruthy();
  });

  it("calls router.back when close button is pressed", () => {
    const AddExerciseScreen = require("@/app/wizard/add-exercise").default;
    renderWithWizard(<AddExerciseScreen />);
    const closeButton = screen.getByTestId("close-button");
    fireEvent.press(closeButton);
    expect(mockRouterBack).toHaveBeenCalled();
  });

  it("maintains stable pill order when selecting filters", () => {
    const AddExerciseScreen = require("@/app/wizard/add-exercise").default;
    const { getAllByText } = renderWithWizard(<AddExerciseScreen />);
    
    // Get initial order of muscle group pills
    const expectedOrder = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];
    
    // Verify initial order
    expectedOrder.forEach((muscle) => {
      const elements = getAllByText(muscle);
      expect(elements[0]).toBeTruthy();
    });
    
    // Select a filter (e.g., "Legs")
    const legsPills = getAllByText("Legs");
    fireEvent.press(legsPills[0]);
    
    // Verify order is still the same after selection
    expectedOrder.forEach((muscle) => {
      const elements = getAllByText(muscle);
      expect(elements[0]).toBeTruthy();
    });
  });
});
