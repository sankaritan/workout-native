/**
 * Wizard Layout
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
          contentStyle: { backgroundColor: "#102218" },
        }}
      />
    </WizardProvider>
  );
}
