import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { WizardProvider } from "@/lib/wizard-context";
import { router } from "expo-router";
import type { WorkoutProgram } from "@/lib/workout-generator/types";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  Stack: {
    Screen: () => null,
  },
}));

// Mock MaterialIcons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

// Mock the wizard context with a program
const mockProgram: WorkoutProgram = {
  name: "Hypertrophy Program (3x/week)",
  focus: "Hypertrophy",
  durationWeeks: 8,
  sessionsPerWeek: 3,
  sessions: [
    {
      name: "Full Body 1",
      dayOfWeek: 1,
      primaryMuscles: ["Chest", "Back", "Legs"],
      exercises: [
        {
          exercise: {
            id: 1,
            name: "Bench Press",
            muscle_group: "Chest",
            equipment_required: "Barbell",
            is_compound: true,
            description: "Compound chest exercise",
          },
          sets: 3,
          repsMin: 8,
          repsMax: 12,
          order: 1,
        },
      ],
    },
  ],
};

// Custom wrapper with mocked program
const WrapperWithProgram = ({ children }: { children: React.ReactNode }) => {
  const { useWizard } = require("@/lib/wizard-context");
  const originalUseWizard = useWizard;

  // Mock useWizard to return our test program
  jest.spyOn(require("@/lib/wizard-context"), "useWizard").mockReturnValue({
    state: { generatedProgram: mockProgram },
    updateState: jest.fn(),
    resetState: jest.fn(),
  });

  return <WizardProvider>{children}</WizardProvider>;
};

describe("Plan Review Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("can import the review screen module", () => {
    const ReviewScreen = require("@/app/wizard/review").default;
    expect(ReviewScreen).toBeDefined();
  });

  it("renders plan name", () => {
    const ReviewScreen = require("@/app/wizard/review").default;

    // Mock useWizard
    jest.spyOn(require("@/lib/wizard-context"), "useWizard").mockReturnValue({
      state: { generatedProgram: mockProgram },
      updateState: jest.fn(),
      resetState: jest.fn(),
    });

    render(<ReviewScreen />);
    expect(screen.getByText("Hypertrophy Program (3x/week)")).toBeTruthy();
  });

  it("renders accept button", () => {
    const ReviewScreen = require("@/app/wizard/review").default;

    jest.spyOn(require("@/lib/wizard-context"), "useWizard").mockReturnValue({
      state: { generatedProgram: mockProgram },
      updateState: jest.fn(),
      resetState: jest.fn(),
    });

    const { getByTestId } = render(<ReviewScreen />);
    expect(getByTestId("accept-button")).toBeTruthy();
  });

  it("renders regenerate button", () => {
    const ReviewScreen = require("@/app/wizard/review").default;

    jest.spyOn(require("@/lib/wizard-context"), "useWizard").mockReturnValue({
      state: { generatedProgram: mockProgram },
      updateState: jest.fn(),
      resetState: jest.fn(),
    });

    const { getByTestId } = render(<ReviewScreen />);
    expect(getByTestId("regenerate-button")).toBeTruthy();
  });

  it("navigates to home when accept is clicked", () => {
    const ReviewScreen = require("@/app/wizard/review").default;
    const mockResetState = jest.fn();

    jest.spyOn(require("@/lib/wizard-context"), "useWizard").mockReturnValue({
      state: { generatedProgram: mockProgram },
      updateState: jest.fn(),
      resetState: mockResetState,
    });

    const { getByTestId } = render(<ReviewScreen />);
    const acceptButton = getByTestId("accept-button");

    fireEvent.press(acceptButton);

    expect(mockResetState).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/");
  });

  it("navigates to wizard start when regenerate is clicked", () => {
    const ReviewScreen = require("@/app/wizard/review").default;
    const mockResetState = jest.fn();

    jest.spyOn(require("@/lib/wizard-context"), "useWizard").mockReturnValue({
      state: { generatedProgram: mockProgram },
      updateState: jest.fn(),
      resetState: mockResetState,
    });

    const { getByTestId } = render(<ReviewScreen />);
    const regenerateButton = getByTestId("regenerate-button");

    fireEvent.press(regenerateButton);

    expect(mockResetState).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/wizard/frequency");
  });

  it("shows error message when no program is available", () => {
    const ReviewScreen = require("@/app/wizard/review").default;

    jest.spyOn(require("@/lib/wizard-context"), "useWizard").mockReturnValue({
      state: { generatedProgram: undefined },
      updateState: jest.fn(),
      resetState: jest.fn(),
    });

    render(<ReviewScreen />);
    expect(screen.getByText("No Plan Found")).toBeTruthy();
  });
});
