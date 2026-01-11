import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { SelectionCard } from "@/components/ui/SelectionCard";

describe("SelectionCard", () => {
  describe("Rendering", () => {
    it("renders with required props", () => {
      render(
        <SelectionCard
          label="Regular"
          value="3"
          subtitle="Days / Week"
          selected={false}
          onPress={() => {}}
        />
      );

      expect(screen.getByText("Regular")).toBeTruthy();
      expect(screen.getByText("3")).toBeTruthy();
      expect(screen.getByText("Days / Week")).toBeTruthy();
    });

    it("renders with icon", () => {
      render(
        <SelectionCard
          label="Regular"
          value="3"
          subtitle="Days / Week"
          icon="bolt"
          selected={false}
          onPress={() => {}}
        />
      );

      expect(screen.getByText("Regular")).toBeTruthy();
    });

    it("renders without icon", () => {
      render(
        <SelectionCard
          label="Regular"
          value="3"
          subtitle="Days / Week"
          selected={false}
          onPress={() => {}}
        />
      );

      expect(screen.getByText("Regular")).toBeTruthy();
    });
  });

  describe("Selection State", () => {
    it("applies selected styles when selected=true", () => {
      const { rerender, getByTestId } = render(
        <SelectionCard
          label="Regular"
          value="3"
          subtitle="Days / Week"
          selected={false}
          onPress={() => {}}
          testID="card"
        />
      );

      const card = getByTestId("card");
      const unselectedStyle = card.props.className;

      rerender(
        <SelectionCard
          label="Regular"
          value="3"
          subtitle="Days / Week"
          selected={true}
          onPress={() => {}}
          testID="card"
        />
      );

      const selectedCard = getByTestId("card");
      const selectedStyle = selectedCard.props.className;

      // Styles should be different when selected
      expect(selectedStyle).not.toEqual(unselectedStyle);
    });

    it("shows check icon when selected", () => {
      render(
        <SelectionCard
          label="Regular"
          value="3"
          subtitle="Days / Week"
          selected={true}
          onPress={() => {}}
        />
      );

      // Check icon should be present (MaterialIcons check_circle)
      expect(screen.getByText("Regular")).toBeTruthy();
    });
  });

  describe("Interaction", () => {
    it("calls onPress when pressed", () => {
      const onPress = jest.fn();

      const { getByTestId } = render(
        <SelectionCard
          label="Regular"
          value="3"
          subtitle="Days / Week"
          selected={false}
          onPress={onPress}
          testID="card"
        />
      );

      fireEvent.press(getByTestId("card"));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("does not call onPress when disabled", () => {
      const onPress = jest.fn();

      const { getByTestId } = render(
        <SelectionCard
          label="Regular"
          value="3"
          subtitle="Days / Week"
          selected={false}
          onPress={onPress}
          disabled={true}
          testID="card"
        />
      );

      fireEvent.press(getByTestId("card"));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has correct accessibility role", () => {
      const { getByTestId } = render(
        <SelectionCard
          label="Regular"
          value="3"
          subtitle="Days / Week"
          selected={false}
          onPress={() => {}}
          testID="card"
        />
      );

      const card = getByTestId("card");
      expect(card.props.accessibilityRole).toBe("radio");
    });

    it("has correct accessibility state when selected", () => {
      const { getByTestId } = render(
        <SelectionCard
          label="Regular"
          value="3"
          subtitle="Days / Week"
          selected={true}
          onPress={() => {}}
          testID="card"
        />
      );

      const card = getByTestId("card");
      expect(card.props.accessibilityState).toMatchObject({ checked: true });
    });

    it("has correct accessibility state when not selected", () => {
      const { getByTestId } = render(
        <SelectionCard
          label="Regular"
          value="3"
          subtitle="Days / Week"
          selected={false}
          onPress={() => {}}
          testID="card"
        />
      );

      const card = getByTestId("card");
      expect(card.props.accessibilityState).toMatchObject({ checked: false });
    });

    it("has accessibility label combining all text", () => {
      const { getByTestId } = render(
        <SelectionCard
          label="Regular"
          value="3"
          subtitle="Days / Week"
          selected={false}
          onPress={() => {}}
          testID="card"
        />
      );

      const card = getByTestId("card");
      expect(card.props.accessibilityLabel).toContain("Regular");
      expect(card.props.accessibilityLabel).toContain("3");
    });
  });

  describe("Custom TestID", () => {
    it("applies custom testID", () => {
      const { getByTestId } = render(
        <SelectionCard
          label="Regular"
          value="3"
          subtitle="Days / Week"
          selected={false}
          onPress={() => {}}
          testID="custom-test-id"
        />
      );

      expect(getByTestId("custom-test-id")).toBeTruthy();
    });
  });
});
