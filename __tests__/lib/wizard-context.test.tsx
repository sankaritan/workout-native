import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Text, Pressable } from "react-native";
import {
  WizardProvider,
  useWizard,
  WizardState,
} from "@/lib/wizard-context";

// Test component that uses the wizard context
function TestComponent() {
  const { state, updateState, resetState } = useWizard();

  return (
    <>
      <Text testID="frequency">{state.frequency || "none"}</Text>
      <Text testID="equipment">{state.equipment?.join(",") || "none"}</Text>
      <Text testID="focus">{state.focus || "none"}</Text>
      <Text testID="duration">{state.duration || "none"}</Text>
      <Pressable
        testID="set-frequency"
        onPress={() => updateState({ frequency: 4 })}
      >
        <Text>Set Frequency</Text>
      </Pressable>
      <Pressable
        testID="set-equipment"
        onPress={() =>
          updateState({ equipment: ["Barbell", "Dumbbell"] })
        }
      >
        <Text>Set Equipment</Text>
      </Pressable>
      <Pressable
        testID="set-focus"
        onPress={() => updateState({ focus: "Hypertrophy" })}
      >
        <Text>Set Focus</Text>
      </Pressable>
      <Pressable
        testID="set-duration"
        onPress={() => updateState({ duration: 8 })}
      >
        <Text>Set Duration</Text>
      </Pressable>
      <Pressable testID="reset" onPress={() => resetState()}>
        <Text>Reset</Text>
      </Pressable>
    </>
  );
}

describe("WizardContext", () => {
  describe("Initial State", () => {
    it("provides default empty state", () => {
      render(
        <WizardProvider>
          <TestComponent />
        </WizardProvider>
      );

      expect(screen.getByTestId("frequency").props.children).toBe("none");
      expect(screen.getByTestId("equipment").props.children).toBe("none");
      expect(screen.getByTestId("focus").props.children).toBe("none");
      expect(screen.getByTestId("duration").props.children).toBe("none");
    });
  });

  describe("Update State", () => {
    it("updates frequency", () => {
      render(
        <WizardProvider>
          <TestComponent />
        </WizardProvider>
      );

      fireEvent.press(screen.getByTestId("set-frequency"));
      expect(screen.getByTestId("frequency").props.children).toBe(4);
    });

    it("updates equipment", () => {
      render(
        <WizardProvider>
          <TestComponent />
        </WizardProvider>
      );

      fireEvent.press(screen.getByTestId("set-equipment"));
      expect(screen.getByTestId("equipment").props.children).toBe(
        "Barbell,Dumbbell"
      );
    });

    it("updates focus", () => {
      render(
        <WizardProvider>
          <TestComponent />
        </WizardProvider>
      );

      fireEvent.press(screen.getByTestId("set-focus"));
      expect(screen.getByTestId("focus").props.children).toBe("Hypertrophy");
    });

    it("updates duration", () => {
      render(
        <WizardProvider>
          <TestComponent />
        </WizardProvider>
      );

      fireEvent.press(screen.getByTestId("set-duration"));
      expect(screen.getByTestId("duration").props.children).toBe(8);
    });

    it("merges state on multiple updates", () => {
      render(
        <WizardProvider>
          <TestComponent />
        </WizardProvider>
      );

      fireEvent.press(screen.getByTestId("set-frequency"));
      fireEvent.press(screen.getByTestId("set-equipment"));

      expect(screen.getByTestId("frequency").props.children).toBe(4);
      expect(screen.getByTestId("equipment").props.children).toBe(
        "Barbell,Dumbbell"
      );
    });
  });

  describe("Reset State", () => {
    it("resets all state to initial values", () => {
      render(
        <WizardProvider>
          <TestComponent />
        </WizardProvider>
      );

      // Set all values
      fireEvent.press(screen.getByTestId("set-frequency"));
      fireEvent.press(screen.getByTestId("set-equipment"));
      fireEvent.press(screen.getByTestId("set-focus"));
      fireEvent.press(screen.getByTestId("set-duration"));

      // Verify values are set
      expect(screen.getByTestId("frequency").props.children).toBe(4);
      expect(screen.getByTestId("equipment").props.children).toBe(
        "Barbell,Dumbbell"
      );
      expect(screen.getByTestId("focus").props.children).toBe("Hypertrophy");
      expect(screen.getByTestId("duration").props.children).toBe(8);

      // Reset
      fireEvent.press(screen.getByTestId("reset"));

      // Verify all values are reset
      expect(screen.getByTestId("frequency").props.children).toBe("none");
      expect(screen.getByTestId("equipment").props.children).toBe("none");
      expect(screen.getByTestId("focus").props.children).toBe("none");
      expect(screen.getByTestId("duration").props.children).toBe("none");
    });
  });

  describe("Error Handling", () => {
    it("throws error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useWizard must be used within a WizardProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("State Persistence", () => {
    it("maintains state within same provider instance", () => {
      render(
        <WizardProvider>
          <TestComponent />
        </WizardProvider>
      );

      // Set frequency
      fireEvent.press(screen.getByTestId("set-frequency"));
      expect(screen.getByTestId("frequency").props.children).toBe(4);

      // Set equipment
      fireEvent.press(screen.getByTestId("set-equipment"));

      // Both values should still be present
      expect(screen.getByTestId("frequency").props.children).toBe(4);
      expect(screen.getByTestId("equipment").props.children).toBe("Barbell,Dumbbell");
    });
  });
});
