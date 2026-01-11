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

describe("Plan Review Screen", () => {
  // Simple rendering test to verify module loads
  it("can import the review screen module", () => {
    const ReviewScreen = require("@/app/wizard/review").default;
    expect(ReviewScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const ReviewScreen = require("@/app/wizard/review").default;
    const result = render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <ReviewScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(result).toBeTruthy();
  });

  it("shows error message when no program is available", () => {
    const ReviewScreen = require("@/app/wizard/review").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <ReviewScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(screen.getByText("No Plan Found")).toBeTruthy();
  });
});
