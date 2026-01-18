import React from "react";
import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
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

// Safe area initial metrics for testing
const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe("Frequency Screen", () => {
  // Simple rendering test to verify module loads
  it("can import the frequency screen module", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    expect(FrequencyScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    const result = render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <FrequencyScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(result).toBeTruthy();
  });

  it("renders title text", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <FrequencyScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(screen.getByText("How often do you want to workout?")).toBeTruthy();
  });

  it("renders all frequency options", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <FrequencyScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );

    expect(screen.getByText("Casual")).toBeTruthy();
    expect(screen.getByText("Regular")).toBeTruthy();
    expect(screen.getByText("Dedicated")).toBeTruthy();
    expect(screen.getByText("Serious")).toBeTruthy();
  });

  it("renders step indicator", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <FrequencyScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(screen.getByText("Step 1 of 5")).toBeTruthy();
  });

  it("renders continue button", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <FrequencyScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(screen.getByText("Continue")).toBeTruthy();
  });
});
