import React from "react";
import { render, screen } from "@testing-library/react-native";
import { WizardContinueButton } from "../WizardContinueButton";

describe("WizardContinueButton", () => {
  it("renders with default label", () => {
    render(<WizardContinueButton onPress={() => {}} />);
    expect(screen.getByText("Continue")).toBeTruthy();
  });

  it("renders with custom label", () => {
    render(<WizardContinueButton label="Accept Plan" onPress={() => {}} />);
    expect(screen.getByText("Accept Plan")).toBeTruthy();
  });

  it("renders with custom testID", () => {
    render(<WizardContinueButton testID="custom-button" onPress={() => {}} />);
    expect(screen.getByTestId("custom-button")).toBeTruthy();
  });

  it("has correct accessibility attributes when enabled", () => {
    render(<WizardContinueButton onPress={() => {}} />);
    const button = screen.getByRole("button");
    expect(button.props.accessibilityState).toEqual({ disabled: false });
  });

  it("has correct accessibility attributes when disabled", () => {
    render(<WizardContinueButton disabled onPress={() => {}} />);
    const button = screen.getByRole("button");
    expect(button.props.accessibilityState).toEqual({ disabled: true });
  });

  it("applies disabled styling when disabled", () => {
    render(<WizardContinueButton disabled onPress={() => {}} />);
    const button = screen.getByTestId("continue-button");
    expect(button.props.className).toContain("opacity-50");
  });

  it("applies enabled styling when not disabled", () => {
    render(<WizardContinueButton onPress={() => {}} />);
    const button = screen.getByTestId("continue-button");
    expect(button.props.className).toContain("bg-primary");
  });

  it("renders icon", () => {
    render(<WizardContinueButton onPress={() => {}} />);
    const button = screen.getByTestId("continue-button");
    // Icon is a child of the button
    expect(button.props.children).toHaveLength(2); // Text and Icon
  });
});
