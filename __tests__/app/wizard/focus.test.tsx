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

describe("Focus Screen", () => {
  // Simple rendering test to verify module loads
  it("can import the focus screen module", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    expect(FocusScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    const result = render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <FocusScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(result).toBeTruthy();
  });

  it("renders title text", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <FocusScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(screen.getByText("What's your goal?")).toBeTruthy();
  });

  it("renders all focus options", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <FocusScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );

    expect(screen.getAllByText("Hypertrophy").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Strength").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Endurance").length).toBeGreaterThan(0);
  });

  it("renders step indicator", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <FocusScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(screen.getByText("Step 3 of 4")).toBeTruthy();
  });

  it("renders generate plan button", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <FocusScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(screen.getByText("Generate Plan")).toBeTruthy();
  });
});
