import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WizardProvider } from "@/lib/wizard-context";

// Mock expo-router
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
    muscleGroup: "Chest",
  }),
  Stack: {
    Screen: () => null,
  },
}));

// Mock MaterialIcons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

// Mock storage to return test exercises
jest.mock("@/lib/storage/storage", () => ({
  getAllExercises: jest.fn().mockReturnValue([
    { id: 1, name: "Bench Press", muscle_group: "Chest", equipment_required: "Barbell", is_compound: true, description: "Compound chest exercise" },
    { id: 2, name: "Push-up", muscle_group: "Chest", equipment_required: "Bodyweight", is_compound: true, description: "Bodyweight chest exercise" },
    { id: 3, name: "Dumbbell Fly", muscle_group: "Chest", equipment_required: "Dumbbell", is_compound: false, description: "Isolation chest exercise" },
    { id: 4, name: "Cable Crossover", muscle_group: "Chest", equipment_required: "Cables", is_compound: false, description: null },
    { id: 5, name: "Deadlift", muscle_group: "Back", equipment_required: "Barbell", is_compound: true, description: null },
  ]),
}));

// Safe area initial metrics for testing
const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

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
    const result = render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <AddExerciseScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(result).toBeTruthy();
  });

  it("renders title text", () => {
    const AddExerciseScreen = require("@/app/wizard/add-exercise").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <AddExerciseScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(screen.getByText("Add Exercise")).toBeTruthy();
  });

  it("renders close button", () => {
    const AddExerciseScreen = require("@/app/wizard/add-exercise").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <AddExerciseScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(screen.getByTestId("close-button")).toBeTruthy();
  });

  it("displays muscle group in subtitle", () => {
    const AddExerciseScreen = require("@/app/wizard/add-exercise").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <AddExerciseScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(screen.getByText(/Chest/)).toBeTruthy();
  });

  it("calls router.back when close button is pressed", () => {
    const AddExerciseScreen = require("@/app/wizard/add-exercise").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <AddExerciseScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    const closeButton = screen.getByTestId("close-button");
    fireEvent.press(closeButton);
    expect(mockRouterBack).toHaveBeenCalled();
  });
});
