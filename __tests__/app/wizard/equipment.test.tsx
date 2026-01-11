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

describe("Equipment Screen", () => {
  it("can import the equipment screen module", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    expect(EquipmentScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    const result = render(
      <WizardProvider>
        <EquipmentScreen />
      </WizardProvider>
    );
    expect(result).toBeTruthy();
  });

  it("renders title text", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    render(
      <WizardProvider>
        <EquipmentScreen />
      </WizardProvider>
    );
    expect(screen.getByText("What's in your gym?")).toBeTruthy();
  });

  it("renders subtitle text", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    render(
      <WizardProvider>
        <EquipmentScreen />
      </WizardProvider>
    );
    expect(
      screen.getByText(
        /Select all equipment you have access to right now/
      )
    ).toBeTruthy();
  });

  it("renders all equipment options", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    render(
      <WizardProvider>
        <EquipmentScreen />
      </WizardProvider>
    );

    // Check for main equipment types
    expect(screen.getByText("Barbell")).toBeTruthy();
    expect(screen.getByText("Dumbbell")).toBeTruthy();
    expect(screen.getByText("Bodyweight")).toBeTruthy();
  });

  it("renders step indicator showing step 2", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    render(
      <WizardProvider>
        <EquipmentScreen />
      </WizardProvider>
    );
    expect(screen.getByText("Step 2 of 4")).toBeTruthy();
  });

  it("renders continue button", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    render(
      <WizardProvider>
        <EquipmentScreen />
      </WizardProvider>
    );
    expect(screen.getByText("Continue")).toBeTruthy();
  });

  it("renders back button", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    const { getByTestId } = render(
      <WizardProvider>
        <EquipmentScreen />
      </WizardProvider>
    );
    expect(getByTestId("back-button")).toBeTruthy();
  });
});
