import React from "react";
import { screen } from "@testing-library/react-native";
import { renderWithWizard, setupWizardMocks } from "@/__tests__/test-utils";

// Setup common mocks
setupWizardMocks();

describe("Equipment Screen", () => {
  // Simple rendering test to verify module loads
  it("can import the equipment screen module", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    expect(EquipmentScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    const result = renderWithWizard(<EquipmentScreen />);
    expect(result).toBeTruthy();
  });

  it("renders title text", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    renderWithWizard(<EquipmentScreen />);
    expect(screen.getByText("What's in your gym?")).toBeTruthy();
  });

  it("renders all equipment options", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    renderWithWizard(<EquipmentScreen />);

    expect(screen.getByText("Barbell")).toBeTruthy();
    expect(screen.getByText("Dumbbell")).toBeTruthy();
    expect(screen.getByText("Bodyweight")).toBeTruthy();
  });

  it("renders step indicator", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    renderWithWizard(<EquipmentScreen />);
    expect(screen.getByText("Step 2 of 5")).toBeTruthy();
  });

  it("renders continue button", () => {
    const EquipmentScreen = require("@/app/wizard/equipment").default;
    renderWithWizard(<EquipmentScreen />);
    expect(screen.getByText("Continue")).toBeTruthy();
  });
});
