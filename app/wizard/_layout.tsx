/**
 * Wizard Stack Layout
 * Wraps wizard screens with WizardProvider for shared state
 */

import { Stack } from "expo-router";
import { WizardProvider } from "@/lib/wizard-context";

export default function WizardLayout() {
  return (
    <WizardProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="frequency" />
        <Stack.Screen name="equipment" />
        <Stack.Screen name="focus" />
        <Stack.Screen name="confirmation" />
      </Stack>
    </WizardProvider>
  );
}
