import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { WizardProvider } from "@/lib/wizard-context";
import { router } from "expo-router";

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

describe("Focus Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("can import the focus screen module", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    expect(FocusScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    const result = render(
      <WizardProvider>
        <FocusScreen />
      </WizardProvider>
    );
    expect(result).toBeTruthy();
  });

  it("renders title text", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    render(
      <WizardProvider>
        <FocusScreen />
      </WizardProvider>
    );
    expect(screen.getByText("What's your goal?")).toBeTruthy();
  });

  it("renders subtitle text", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    render(
      <WizardProvider>
        <FocusScreen />
      </WizardProvider>
    );
    expect(
      screen.getByText(/Choose your training focus to customize/i)
    ).toBeTruthy();
  });

  it("renders all focus options", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    render(
      <WizardProvider>
        <FocusScreen />
      </WizardProvider>
    );

    // Check for focus types (using getAllByText since label and value may match)
    expect(screen.getAllByText("Hypertrophy").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Strength").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Endurance").length).toBeGreaterThan(0);
  });

  it("renders step indicator showing step 3", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    render(
      <WizardProvider>
        <FocusScreen />
      </WizardProvider>
    );
    expect(screen.getByText("Step 3 of 4")).toBeTruthy();
  });

  it("renders generate plan button", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    render(
      <WizardProvider>
        <FocusScreen />
      </WizardProvider>
    );
    expect(screen.getByText("Generate Plan")).toBeTruthy();
  });

  it("renders back button", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    const { getByTestId } = render(
      <WizardProvider>
        <FocusScreen />
      </WizardProvider>
    );
    expect(getByTestId("back-button")).toBeTruthy();
  });

  it("disables generate button when no focus is selected", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    const { getByTestId } = render(
      <WizardProvider>
        <FocusScreen />
      </WizardProvider>
    );
    const button = getByTestId("generate-button");
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it("enables generate button when focus is selected", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    const { getByTestId } = render(
      <WizardProvider>
        <FocusScreen />
      </WizardProvider>
    );

    // Select focus
    const hypertrophyCard = getByTestId("focus-hypertrophy");
    fireEvent.press(hypertrophyCard);

    // Button should now be enabled
    const button = getByTestId("generate-button");
    expect(button.props.accessibilityState.disabled).toBe(false);
  });

  it("navigates back when back button is pressed", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    const { getByTestId } = render(
      <WizardProvider>
        <FocusScreen />
      </WizardProvider>
    );

    const backButton = getByTestId("back-button");
    fireEvent.press(backButton);

    expect(router.back).toHaveBeenCalled();
  });

  it("updates wizard state when focus is selected", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    const { getByTestId } = render(
      <WizardProvider>
        <FocusScreen />
      </WizardProvider>
    );

    // Select focus
    const strengthCard = getByTestId("focus-strength");
    fireEvent.press(strengthCard);

    // Verify selection is reflected in UI (card should be selected)
    expect(strengthCard.props.accessibilityState).toMatchObject({
      checked: true,
    });
  });
});
