/**
 * Focus Selection Screen
 * Step 3 of 4 in workout wizard
 */

import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWizard } from "@/lib/wizard-context";
import { cn } from "@/lib/utils/cn";
import { generateWorkoutProgram, saveWorkoutProgram } from "@/lib/workout-generator/engine";

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
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Handle focus selection
   */
  const handleFocusSelect = (focus: "Balanced" | "Strength" | "Endurance") => {
    setSelectedFocus(focus);
    updateState({ focus });
  };

  /**
   * Handle generate plan button press
   */
  const handleGeneratePlan = async () => {
    if (!selectedFocus || !state.frequency || !state.equipment) {
      console.error("Missing required wizard state", { state, selectedFocus });
      alert("Missing required information. Please complete all steps.");
      return;
    }

    setIsGenerating(true);

    try {
      console.log("Starting workout generation...");
      console.log("Input:", {
        frequency: state.frequency,
        equipment: state.equipment,
        focus: selectedFocus,
      });

      // Generate workout program (works on both web and mobile)
      const program = generateWorkoutProgram({
        frequency: state.frequency,
        equipment: state.equipment,
        focus: selectedFocus,
      });

      console.log("Program generated:", program);

      // Save to storage
      const planId = saveWorkoutProgram(program);
      console.log("Plan saved with ID:", planId);

      // Store generated program in wizard context for display
      updateState({ generatedProgram: program });

      // Navigate to review screen
      router.push("/wizard/review");
    } catch (error) {
      console.error("Failed to generate workout plan:");
      console.error("Error details:", error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      alert(`Failed to generate workout plan: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle back button press
   */
  const handleBack = () => {
    router.back();
  };

  const isGenerateDisabled = !selectedFocus || isGenerating;

  return (
    <View className="flex-1 bg-background-dark w-full">
      {/* Header */}
      <View className="bg-background-dark/80 px-4 pb-2 w-full" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center justify-between mb-4">
          {/* Back button */}
          <Pressable
            onPress={handleBack}
            className="flex size-10 items-center justify-center rounded-full active:bg-white/10"
            testID="back-button"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>

          {/* Step indicator */}
          <Text className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Step 3 of 4
          </Text>

          {/* Empty space for balance */}
          <View className="size-10" />
        </View>

        {/* Segmented Progress Bar */}
        <View className="flex-row gap-2">
          <View className="flex-1 h-1.5 rounded-full bg-primary" />
          <View className="flex-1 h-1.5 rounded-full bg-primary" />
          <View className="flex-1 h-1.5 rounded-full bg-primary" />
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

      {/* Create Workout Plan Button (Fixed at bottom) */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-lg border-t border-white/5 p-4 w-full"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <Pressable
          onPress={handleGeneratePlan}
          disabled={isGenerateDisabled}
          accessibilityRole="button"
          accessibilityLabel="Create workout plan"
          accessibilityState={{ disabled: isGenerateDisabled }}
          testID="generate-button"
          className={cn(
            "flex-row w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold shadow-lg transition-transform",
            isGenerateDisabled
              ? "bg-surface-dark opacity-50"
              : "bg-primary active:scale-[0.98] shadow-primary/20"
          )}
        >
          {isGenerating ? (
            <>
              <ActivityIndicator size="small" color="#102218" />
              <Text className="text-base font-bold text-background-dark">
                Creating...
              </Text>
            </>
          ) : (
            <>
              <Text
                className={cn(
                  "text-base font-bold",
                  isGenerateDisabled
                    ? "text-gray-400"
                    : "text-background-dark"
                )}
              >
                Create Workout Plan
              </Text>
              <MaterialIcons
                name="bolt"
                size={20}
                color={isGenerateDisabled ? "#6b8779" : "#102218"}
              />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
