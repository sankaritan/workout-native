/**
 * Focus Selection Screen
 * Step 3 of 5 in workout wizard
 */

import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "@/components/BackButton";
import { WizardContinueButton } from "@/components/ui/WizardContinueButton";
import { useWizard } from "@/lib/wizard-context";
import { cn } from "@/lib/utils/cn";

// Focus options based on design mock - order: Strength, Balanced, Endurance
const FOCUS_OPTIONS: Array<{
  value: "Balanced" | "Strength" | "Endurance";
  label: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
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
    icon: "crop-square",
  },
  {
    value: "Endurance",
    label: "Endurance",
    description: "High reps. Focus on stamina and conditioning.",
    icon: "directions-run",
  },
];

export default function FocusScreen() {
  const insets = useSafeAreaInsets();
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
    <View className="flex-1 bg-background-dark w-full">
      {/* Header */}
      <View className="bg-background-dark/80 px-4 pb-2 w-full" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center justify-between mb-4">
          {/* Back button */}
          <BackButton onPress={handleBack} />

          {/* Step indicator */}
          <Text className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Step 3 of 5
          </Text>

          {/* Empty space for balance */}
          <View className="size-10" />
        </View>

        {/* Segmented Progress Bar - 3 of 5 filled */}
        <View className="flex-row gap-2">
          <View className="flex-1 h-1.5 rounded-full bg-primary" />
          <View className="flex-1 h-1.5 rounded-full bg-primary" />
          <View className="flex-1 h-1.5 rounded-full bg-primary" />
          <View className="flex-1 h-1.5 rounded-full bg-white/10" />
          <View
            testID="progress-bar"
            className="flex-1 h-1.5 rounded-full bg-white/10"
          />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 120 + insets.bottom,
        }}
      >
        {/* Title and Subtitle */}
        <View className="mb-8">
          <Text className="text-3xl font-bold leading-tight tracking-tight text-white mb-2">
            Define Your Goal
          </Text>
          <Text className="text-gray-400 text-base font-normal leading-relaxed">
            We will optimize sets, reps, and rest periods based on this choice.
          </Text>
        </View>

        {/* Training Focus Options - Compact horizontal cards */}
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
                {/* Icon */}
                <View
                  className={cn(
                    "h-12 w-12 rounded-lg items-center justify-center mr-4",
                    isSelected ? "bg-primary/20" : "bg-surface-dark-highlight"
                  )}
                >
                  <MaterialIcons
                    name={option.icon}
                    size={24}
                    color="#13ec6d"
                  />
                </View>

                {/* Text content */}
                <View className="flex-1">
                  <Text className="text-base font-bold text-white mb-0.5">
                    {option.label}
                  </Text>
                  <Text className="text-sm text-gray-400 leading-snug">
                    {option.description}
                  </Text>
                </View>

                {/* Radio button */}
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
      </ScrollView>

      {/* Continue Button (Fixed at bottom) */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-lg border-t border-white/5 p-4 w-full"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <WizardContinueButton
          onPress={handleContinue}
          disabled={isContinueDisabled}
          accessibilityLabel="Continue to exercises"
        />
      </View>
    </View>
  );
}
