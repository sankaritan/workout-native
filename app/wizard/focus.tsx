/**
 * Focus Selection Screen
 * Step 3 of 5 in workout wizard
 */

import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { WizardContinueButton } from "@/components/ui/WizardContinueButton";
import { WizardLayout } from "@/components/WizardLayout";
import { useWizard } from "@/lib/wizard-context";
import { cn } from "@/lib/utils/cn";
import { BalanceIcon } from "@/components/icons";

// Focus options based on design mock - order: Strength, Balanced, Endurance
const FOCUS_OPTIONS: Array<{
  value: "Balanced" | "Strength" | "Endurance";
  label: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap | React.ComponentType<{ size?: number; color?: string }>;
}> = [
  {
    value: "Strength",
    label: "Strength",
    description: "Low reps, heavy weight. Focus on power.",
    icon: "fitness-center",
  },
  {
    value: "Balanced",
    label: "Balanced",
    description: "Moderate reps. Focus on muscle size (hypertrophy).",
    icon: BalanceIcon,
  },
  {
    value: "Endurance",
    label: "Endurance",
    description: "High reps. Focus on stamina and conditioning.",
    icon: "directions-run",
  },
];

export default function FocusScreen() {
  const { state, updateState } = useWizard();
  const [selectedFocus, setSelectedFocus] = useState<
    "Balanced" | "Strength" | "Endurance" | undefined
  >(state.focus);

  /**
   * Handle focus selection
   */
  const handleFocusSelect = (focus: "Balanced" | "Strength" | "Endurance") => {
    setSelectedFocus(focus);
    updateState({ focus });
  };

  /**
   * Handle continue button press - navigate to exercises screen
   */
  const handleContinue = () => {
    if (!selectedFocus) {
      return;
    }
    // Navigate to exercise review screen
    router.push("/wizard/exercises");
  };

  /**
   * Handle back button press
   */
  const handleBack = () => {
    router.back();
  };

  const isContinueDisabled = !selectedFocus;

  return (
    <WizardLayout
      step={3}
      totalSteps={5}
      onBack={handleBack}
      bottomAction={(
        <WizardContinueButton
          onPress={handleContinue}
          disabled={isContinueDisabled}
          accessibilityLabel="Continue to exercises"
        />
      )}
    >
      <View className="mb-8">
        <Text className="text-3xl font-bold leading-tight tracking-tight text-white mb-2">
          Define Your Goal
        </Text>
        <Text className="text-gray-400 text-base font-normal leading-relaxed">
          We will optimize sets, reps, and rest periods based on this choice.
        </Text>
      </View>

      <View className="gap-3">
        {FOCUS_OPTIONS.map((option) => {
          const isSelected = selectedFocus === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleFocusSelect(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${option.label}: ${option.description}`}
              testID={`focus-${option.value.toLowerCase()}`}
              className={cn(
                "flex-row items-center rounded-xl border-2 p-4",
                "bg-surface-dark",
                isSelected ? "border-primary bg-primary/5" : "border-surface-dark"
              )}
            >
              <View
                className={cn(
                  "h-12 w-12 rounded-lg items-center justify-center mr-4",
                  isSelected ? "bg-primary/20" : "bg-surface-dark-highlight"
                )}
              >
                {typeof option.icon === "string" ? (
                  <MaterialIcons
                    name={option.icon}
                    size={24}
                    color="#13ec6d"
                  />
                ) : (
                  React.createElement(option.icon, {
                    size: 24,
                    color: "#13ec6d",
                  })
                )}
              </View>

              <View className="flex-1">
                <Text className="text-base font-bold text-white mb-0.5">
                  {option.label}
                </Text>
                <Text className="text-sm text-gray-400 leading-snug">
                  {option.description}
                </Text>
              </View>

              <View
                className={cn(
                  "h-6 w-6 rounded-full border-2 items-center justify-center ml-3",
                  isSelected ? "border-primary bg-primary" : "border-gray-500"
                )}
              >
                {isSelected && (
                  <View className="h-2.5 w-2.5 rounded-full bg-background-dark" />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </WizardLayout>
  );
}
