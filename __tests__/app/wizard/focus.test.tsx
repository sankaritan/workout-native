import React from "react";
import { screen } from "@testing-library/react-native";
import { renderWithWizard, setupWizardMocks } from "@/__tests__/test-utils";

// Setup common mocks
setupWizardMocks();

describe("Focus Screen", () => {
  // Simple rendering test to verify module loads
  it("can import the focus screen module", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    expect(FocusScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    const result = renderWithWizard(<FocusScreen />);
    expect(result).toBeTruthy();
  });

  it("renders title text", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    renderWithWizard(<FocusScreen />);
    expect(screen.getByText("Define Your Goal")).toBeTruthy();
  });

  it("renders all focus options", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    renderWithWizard(<FocusScreen />);

    expect(screen.getAllByText("Balanced").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Strength").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Endurance").length).toBeGreaterThan(0);
  });

  it("renders step indicator", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    renderWithWizard(<FocusScreen />);
    expect(screen.getByText("Step 3 of 5")).toBeTruthy();
  });

  it("renders continue button", () => {
    const FocusScreen = require("@/app/wizard/focus").default;
    renderWithWizard(<FocusScreen />);
    expect(screen.getByText("Continue")).toBeTruthy();
  });
});
