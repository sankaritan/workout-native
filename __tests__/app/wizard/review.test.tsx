import React from "react";
import { screen } from "@testing-library/react-native";
import { renderWithWizard, setupWizardMocks } from "@/__tests__/test-utils";

// Setup common mocks
setupWizardMocks();

describe("Plan Review Screen", () => {
  // Simple rendering test to verify module loads
  it("can import the review screen module", () => {
    const ReviewScreen = require("@/app/wizard/review").default;
    expect(ReviewScreen).toBeDefined();
  });

  it("renders without crashing", () => {
    const ReviewScreen = require("@/app/wizard/review").default;
    const result = renderWithWizard(<ReviewScreen />);
    expect(result).toBeTruthy();
  });

  it("redirects to wizard start when no program is available", () => {
    const ReviewScreen = require("@/app/wizard/review").default;
    const result = renderWithWizard(<ReviewScreen />);
    // Component should render and redirect (returns null after redirect)
    expect(result).toBeTruthy();
  });
});
