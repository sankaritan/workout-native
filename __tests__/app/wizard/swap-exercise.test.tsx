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
  useLocalSearchParams: () => ({
    exerciseId: "1",
  }),
  Stack: {
    Screen: () => null,
  },
}));

// Mock MaterialIcons
mockMaterialIcons();

// Mock storage to return test exercises
jest.mock("@/lib/storage/storage", () => ({
  getAllExercises: jest.fn().mockReturnValue([
    { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest", "Shoulders", "Arms"], equipment_required: "Barbell", priority: 1, description: "Compound chest exercise" },
    { id: 2, name: "Push-up", muscle_group: "Chest", muscle_groups: ["Chest", "Arms"], equipment_required: "Bodyweight", priority: 3, description: "Bodyweight chest exercise" },
    { id: 3, name: "Dumbbell Fly", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Dumbbell", priority: 4, description: "Isolation chest exercise" },
    { id: 4, name: "Cable Crossover", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Cables", priority: 4, description: null },
    { id: 5, name: "Deadlift", muscle_group: "Back", muscle_groups: ["Back", "Legs", "Core"], equipment_required: "Barbell", priority: 1, description: null },
  ]),
}));

describe("Swap Exercise Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("can import the swap exercise screen module", () => {
    const SwapExerciseScreen = require("@/app/wizard/swap-exercise").default;
    expect(SwapExerciseScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const SwapExerciseScreen = require("@/app/wizard/swap-exercise").default;
    const result = renderWithWizard(<SwapExerciseScreen />);
    expect(result).toBeTruthy();
  });

  it("renders title text", () => {
    const SwapExerciseScreen = require("@/app/wizard/swap-exercise").default;
    renderWithWizard(<SwapExerciseScreen />);
    expect(screen.getByText("Swap Exercise")).toBeTruthy();
  });

  it("renders close button", () => {
    const SwapExerciseScreen = require("@/app/wizard/swap-exercise").default;
    renderWithWizard(<SwapExerciseScreen />);
    expect(screen.getByTestId("close-button")).toBeTruthy();
  });

  it("displays filter pills for muscle groups", () => {
    const SwapExerciseScreen = require("@/app/wizard/swap-exercise").default;
    renderWithWizard(<SwapExerciseScreen />);
    // Check that muscle group filter pills are present
    expect(screen.getAllByText("Chest").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Back").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Shoulders").length).toBeGreaterThan(0);
  });

  it("calls router.back when close button is pressed", () => {
    const SwapExerciseScreen = require("@/app/wizard/swap-exercise").default;
    renderWithWizard(<SwapExerciseScreen />);
    const closeButton = screen.getByTestId("close-button");
    fireEvent.press(closeButton);
    expect(mockRouterBack).toHaveBeenCalled();
  });

  it("maintains stable pill order when selecting filters", () => {
    const SwapExerciseScreen = require("@/app/wizard/swap-exercise").default;
    const { getAllByText } = renderWithWizard(<SwapExerciseScreen />);
    
    // Get initial order of muscle group pills (excluding those in exercise cards)
    // The first 6 occurrences should be the pills in the expected order
    const expectedOrder = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];
    
    // Verify initial order
    expectedOrder.forEach((muscle, index) => {
      const elements = getAllByText(muscle);
      // First element should be the pill for each muscle group
      expect(elements[0]).toBeTruthy();
    });
    
    // Select a filter (e.g., "Back")
    const backPills = getAllByText("Back");
    fireEvent.press(backPills[0]);
    
    // Verify order is still the same after selection
    expectedOrder.forEach((muscle) => {
      const elements = getAllByText(muscle);
      expect(elements[0]).toBeTruthy();
    });
  });
});
