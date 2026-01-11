/**
 * Focus Selection Screen
 * Step 3 of 4 in workout wizard
 */

import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Platform } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { useWizard } from "@/lib/wizard-context";
import { cn } from "@/lib/utils/cn";
import { generateWorkoutProgram, saveWorkoutProgram } from "@/lib/workout-generator/engine";
import { initDatabase } from "@/lib/storage/database";
import { seedExercises } from "@/lib/storage/seed-data";

// Focus options based on database types
const FOCUS_OPTIONS: Array<{
  value: "Hypertrophy" | "Strength" | "Endurance";
  label: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}> = [
  {
    value: "Hypertrophy",
    label: "Hypertrophy",
    description: "Build muscle size",
    icon: "fitness-center",
  },
  {
    value: "Strength",
    label: "Strength",
    description: "Increase max lifts",
    icon: "bolt",
  },
  {
    value: "Endurance",
    label: "Endurance",
    description: "Muscular stamina",
    icon: "trending-up",
  },
];

export default function FocusScreen() {
  const { state, updateState } = useWizard();
  const [selectedFocus, setSelectedFocus] = useState<
    "Hypertrophy" | "Strength" | "Endurance" | undefined
  >(state.focus);
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Handle focus selection
   */
  const handleFocusSelect = (focus: "Hypertrophy" | "Strength" | "Endurance") => {
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
      console.log("Platform:", Platform.OS);
      console.log("Input:", {
        frequency: state.frequency,
        equipment: state.equipment,
        focus: selectedFocus,
      });

      let program;

      // On web, generate with mock data (database not available due to SharedArrayBuffer)
      if (Platform.OS === "web") {
        console.log("Web platform detected - using mock exercise data");

        // Import and use mock exercises for web
        const { generateWorkoutProgramWithMockData } = await import("@/lib/workout-generator/web-generator");
        program = generateWorkoutProgramWithMockData({
          frequency: state.frequency,
          equipment: state.equipment,
          focus: selectedFocus,
        });

        console.log("Program generated (web mock):", program);
      } else {
        // On native, use real database
        console.log("Native platform - using database");
        initDatabase();
        seedExercises();

        program = generateWorkoutProgram({
          frequency: state.frequency,
          equipment: state.equipment,
          focus: selectedFocus,
        });

        console.log("Program generated:", program);

        // Save to database
        const planId = saveWorkoutProgram(program);
        console.log("Plan saved with ID:", planId);
      }

      // Store generated program in wizard context for display
      updateState({ generatedProgram: program });

      // Navigate to confirmation
      router.push("/wizard/confirmation");
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
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="bg-background-light/80 dark:bg-background-dark/80 px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          {/* Back button */}
          <Pressable
            onPress={handleBack}
            className="flex size-10 items-center justify-center rounded-full active:bg-black/5 dark:active:bg-white/10"
            testID="back-button"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>

          {/* Step indicator */}
          <Text className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Step 3 of 4
          </Text>

          {/* Empty space for balance */}
          <View className="size-10" />
        </View>

        {/* Progress Bar */}
        <View className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <View
            testID="progress-bar"
            className="h-full w-3/4 rounded-full bg-primary transition-all duration-500"
          />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-4 pt-4 pb-32">
        {/* Title and Subtitle */}
        <View className="mb-8">
          <Text className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white mb-2">
            What's your goal?
          </Text>
          <Text className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed">
            Choose your training focus to customize your workout plan.
          </Text>
        </View>

        {/* Training Focus Options */}
        <View className="gap-3">
          {FOCUS_OPTIONS.map((option) => (
            <SelectionCard
              key={option.value}
              label={option.label}
              value={option.value}
              subtitle={option.description}
              icon={option.icon}
              selected={selectedFocus === option.value}
              onPress={() => handleFocusSelect(option.value)}
              testID={`focus-${option.value.toLowerCase()}`}
            />
          ))}
        </View>
      </ScrollView>

      {/* Generate Plan Button (Fixed at bottom) */}
      <View className="absolute bottom-0 left-0 right-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-slate-200 dark:border-white/5 p-4 pb-8">
        <Pressable
          onPress={handleGeneratePlan}
          disabled={isGenerateDisabled}
          accessibilityRole="button"
          accessibilityLabel="Generate workout plan"
          accessibilityState={{ disabled: isGenerateDisabled }}
          testID="generate-button"
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold shadow-lg transition-transform",
            isGenerateDisabled
              ? "bg-slate-300 dark:bg-slate-700 opacity-50"
              : "bg-primary active:scale-[0.98] shadow-primary/20"
          )}
        >
          {isGenerating ? (
            <>
              <ActivityIndicator size="small" color="#102218" />
              <Text className="text-base font-bold text-background-dark">
                Generating...
              </Text>
            </>
          ) : (
            <>
              <MaterialIcons
                name="auto-awesome"
                size={20}
                color={isGenerateDisabled ? "#64748b" : "#102218"}
              />
              <Text
                className={cn(
                  "text-base font-bold",
                  isGenerateDisabled
                    ? "text-slate-500 dark:text-slate-400"
                    : "text-background-dark"
                )}
              >
                Generate Plan
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
