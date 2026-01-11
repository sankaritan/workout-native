import React from "react";
import { render, screen } from "@testing-library/react-native";
import { WizardProvider } from "@/lib/wizard-context";

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

describe("Frequency Screen", () => {
  // Simple rendering test to verify module loads
  it("can import the frequency screen module", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    expect(FrequencyScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    const result = render(
      <WizardProvider>
        <FrequencyScreen />
      </WizardProvider>
    );
    expect(result).toBeTruthy();
  });

  it("renders title text", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    render(
      <WizardProvider>
        <FrequencyScreen />
      </WizardProvider>
    );
    expect(screen.getByText("How often do you want to workout?")).toBeTruthy();
  });

  it("renders all frequency options", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    render(
      <WizardProvider>
        <FrequencyScreen />
      </WizardProvider>
    );

    expect(screen.getByText("Casual")).toBeTruthy();
    expect(screen.getByText("Regular")).toBeTruthy();
    expect(screen.getByText("Dedicated")).toBeTruthy();
    expect(screen.getByText("Serious")).toBeTruthy();
  });

  it("renders step indicator", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    render(
      <WizardProvider>
        <FrequencyScreen />
      </WizardProvider>
    );
    expect(screen.getByText("Step 1 of 4")).toBeTruthy();
  });

  it("renders continue button", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    render(
      <WizardProvider>
        <FrequencyScreen />
      </WizardProvider>
    );
    expect(screen.getByText("Continue")).toBeTruthy();
  });
});
