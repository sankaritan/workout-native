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

describe("Equipment Screen", () => {
  // Simple rendering test to verify module loads
  it("can import the equipment screen module", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    expect(EquipmentScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    const result = render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <EquipmentScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(result).toBeTruthy();
  });

  it("renders title text", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <EquipmentScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(screen.getByText("What's in your gym?")).toBeTruthy();
  });

  it("renders all equipment options", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <EquipmentScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );

    expect(screen.getByText("Barbell")).toBeTruthy();
    expect(screen.getByText("Dumbbell")).toBeTruthy();
    expect(screen.getByText("Bodyweight")).toBeTruthy();
  });

  it("renders step indicator", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <EquipmentScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(screen.getByText("Step 2 of 5")).toBeTruthy();
  });

  it("renders continue button", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <WizardProvider>
          <EquipmentScreen />
        </WizardProvider>
      </SafeAreaProvider>
    );
    expect(screen.getByText("Continue")).toBeTruthy();
  });
});
