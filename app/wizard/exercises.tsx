/**
 * Exercise Review Screen
 * Step 4 of 5 in workout wizard
 * Allows users to customize selected exercises (flat list with muscle group badges)
 */

import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWizard } from "@/lib/wizard-context";
import { cn } from "@/lib/utils/cn";
import { ExerciseCardWithActions } from "@/components/ExerciseCardWithActions";
import { selectInitialExercises } from "@/lib/workout-generator/exercise-selector";
import { getAllExercises } from "@/lib/storage/storage";
import type { Exercise } from "@/lib/storage/types";

// Exercise count limits
const MIN_EXERCISES = 6;
const MAX_EXERCISES = 20;

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const { state, updateState } = useWizard();
  const [customExercises, setCustomExercises] = useState<Exercise[]>(
    state.customExercises || []
  );

  // Initialize or regenerate exercises when equipment or frequency changes
  useEffect(() => {
    if (!state.equipment || !state.frequency) {
      return;
    }

    // Check if equipment or frequency has changed since last generation
    const params = state.exerciseGenerationParams;
    const equipmentChanged =
      !params ||
      JSON.stringify([...state.equipment].sort()) !==
        JSON.stringify([...params.equipment].sort());
    const frequencyChanged = !params || params.frequency !== state.frequency;

    // Generate new exercises if:
    // 1. No exercises exist yet, OR
    // 2. Equipment changed, OR
    // 3. Frequency changed
    const shouldRegenerate =
      !state.customExercises || equipmentChanged || frequencyChanged;

    if (shouldRegenerate) {
      const allExercises = getAllExercises();
      const initialExercises = selectInitialExercises(
        allExercises,
        state.equipment,
        state.frequency
      );
      setCustomExercises(initialExercises);

      // Update state with new exercises AND generation params in one call
      updateState({
        customExercises: initialExercises,
        exerciseGenerationParams: {
          equipment: state.equipment,
          frequency: state.frequency,
        },
      });
    } else if (state.customExercises) {
      // Sync local state with wizard context when returning from swap/add screens
      setCustomExercises(state.customExercises);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.equipment, state.frequency]);

  /**
   * Handle swap exercise - navigate to swap screen
   */
  const handleSwap = (exerciseId: number) => {
    router.push({
      pathname: "/wizard/swap-exercise",
      params: { exerciseId: String(exerciseId) },
    });
  };

  /**
   * Handle remove exercise
   */
  const handleRemove = (exerciseId: number) => {
    const updated = customExercises.filter((e) => e.id !== exerciseId);
    setCustomExercises(updated);
    updateState({ customExercises: updated });
  };

  /**
   * Handle add exercise - navigate to add screen
   */
  const handleAdd = () => {
    router.push("/wizard/add-exercise");
  };

  /**
   * Handle continue button press
   */
  const handleContinue = () => {
    // Make sure state is updated before navigating
    updateState({ customExercises });
    router.push("/wizard/review");
  };

  /**
   * Handle back button press
   */
  const handleBack = () => {
    router.back();
  };

  // Check if we can continue (min 6 exercises)
  const isContinueDisabled =
    customExercises.length < MIN_EXERCISES ||
    customExercises.length > MAX_EXERCISES;

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
            Step 4 of 5
          </Text>

          {/* Empty space for balance */}
          <View className="size-10" />
        </View>

        {/* Segmented Progress Bar - 4 of 5 filled */}
        <View className="flex-row gap-2">
          <View className="flex-1 h-1.5 rounded-full bg-primary" />
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
        <View className="mb-6">
          <Text className="text-3xl font-bold leading-tight tracking-tight text-white mb-2">
            Review Exercises
          </Text>
          <Text className="text-gray-400 text-base font-normal leading-relaxed">
            Customize your exercise selection. Minimum {MIN_EXERCISES}, maximum{" "}
            {MAX_EXERCISES} exercises.
          </Text>
        </View>

        {/* Exercise Count */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-white">
            Selected Exercises ({customExercises.length})
          </Text>
          <View
            className={cn(
              "px-3 py-1 rounded-full",
              customExercises.length < MIN_EXERCISES
                ? "bg-red-500/20"
                : customExercises.length > MAX_EXERCISES
                ? "bg-red-500/20"
                : "bg-primary/20"
            )}
          >
            <Text
              className={cn(
                "text-xs font-semibold",
                customExercises.length < MIN_EXERCISES
                  ? "text-red-500"
                  : customExercises.length > MAX_EXERCISES
                  ? "text-red-500"
                  : "text-primary"
              )}
            >
              {customExercises.length < MIN_EXERCISES
                ? `Need ${MIN_EXERCISES - customExercises.length} more`
                : customExercises.length > MAX_EXERCISES
                ? `Remove ${customExercises.length - MAX_EXERCISES}`
                : "Ready"}
            </Text>
          </View>
        </View>

        {/* Flat Exercise List */}
        {customExercises.map((exercise) => (
          <ExerciseCardWithActions
            key={exercise.id}
            exercise={exercise}
            onSwap={() => handleSwap(exercise.id)}
            onRemove={() => handleRemove(exercise.id)}
            canRemove={customExercises.length > MIN_EXERCISES}
            showMuscleGroupBadges={true}
            testID={`exercise-card-${exercise.id}`}
          />
        ))}

        {/* Add Exercise Button */}
        {customExercises.length < MAX_EXERCISES && (
          <Pressable
            onPress={handleAdd}
            testID="add-exercise-button"
            accessibilityRole="button"
            accessibilityLabel="Add exercise"
            className="flex-row items-center justify-center bg-surface-dark rounded-xl p-4 mt-2 active:bg-surface-dark-highlight"
          >
            <MaterialIcons name="add-circle-outline" size={24} color="#6b8779" />
            <Text className="text-primary font-semibold text-base ml-2">
              Add Exercise
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Continue Button (Fixed at bottom) */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-lg border-t border-white/5 p-4 w-full"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <Pressable
          onPress={handleContinue}
          disabled={isContinueDisabled}
          accessibilityRole="button"
          accessibilityLabel="Continue to review"
          accessibilityState={{ disabled: isContinueDisabled }}
          testID="continue-button"
          className={cn(
            "flex-row w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold shadow-lg transition-transform",
            isContinueDisabled
              ? "bg-surface-dark opacity-50"
              : "bg-primary active:scale-[0.98] shadow-primary/20"
          )}
        >
          <Text
            className={cn(
              "text-base font-bold",
              isContinueDisabled
                ? "text-gray-400"
                : "text-background-dark"
            )}
          >
            Continue
          </Text>
          <MaterialIcons
            name="arrow-forward"
            size={20}
            color={isContinueDisabled ? "#6b8779" : "#102218"}
          />
        </Pressable>
      </View>
    </View>
  );
}
