import React from "react";
import { screen } from "@testing-library/react-native";
import { renderWithWizard, setupWizardMocks } from "@/__tests__/test-utils";

// Setup common mocks
setupWizardMocks();

describe("Frequency Screen", () => {
  // Simple rendering test to verify module loads
  it("can import the frequency screen module", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    expect(FrequencyScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    const result = renderWithWizard(<FrequencyScreen />);
    expect(result).toBeTruthy();
  });

  it("renders title text", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    renderWithWizard(<FrequencyScreen />);
    expect(screen.getByText("How often do you want to workout?")).toBeTruthy();
  });

  it("renders all frequency options", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    renderWithWizard(<FrequencyScreen />);

    expect(screen.getByText("Casual")).toBeTruthy();
    expect(screen.getByText("Regular")).toBeTruthy();
    expect(screen.getByText("Dedicated")).toBeTruthy();
    expect(screen.getByText("Serious")).toBeTruthy();
  });

  it("renders step indicator", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    renderWithWizard(<FrequencyScreen />);
    expect(screen.getByText("Step 1 of 5")).toBeTruthy();
  });

  it("renders continue button", () => {
    const FrequencyScreen = require("@/app/wizard/frequency").default;
    renderWithWizard(<FrequencyScreen />);
    expect(screen.getByText("Continue")).toBeTruthy();
  });
});
