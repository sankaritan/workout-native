/**
 * Exercise Review Screen
 * Step 4 of 5 in workout wizard
 * Allows users to customize selected exercises (flat list with muscle group badges)
 */

import { ExerciseCardWithActions } from "@/components/ExerciseCardWithActions";
import { WizardContinueButton } from "@/components/ui/WizardContinueButton";
import { WizardLayout } from "@/components/WizardLayout";
import { getAllExercises } from "@/lib/storage/storage";
import type { Exercise } from "@/lib/storage/types";
import { cn } from "@/lib/utils/cn";
import { useWizard } from "@/lib/wizard-context";
import {
  extractExercisesFromProgram,
  generateWorkoutProgramFromCustomExercises,
} from "@/lib/workout-generator/engine";
import { selectInitialExercises } from "@/lib/workout-generator/exercise-selector";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

// Exercise count limits
const MIN_EXERCISES = 1;
const MAX_EXERCISES = 20;

export default function ExercisesScreen() {
  const { state, updateState } = useWizard();
  const [customExercises, setCustomExercises] = useState<Exercise[]>(
    state.customExercises || [],
  );

  // Initialize or regenerate workout program when equipment or frequency changes
  useEffect(() => {
    if (!state.equipment || !state.frequency || !state.focus) {
      return;
    }

    // Check if equipment or frequency has changed since last generation
    const params = state.exerciseGenerationParams;
    const equipmentChanged =
      !params ||
      JSON.stringify([...state.equipment].sort()) !==
        JSON.stringify([...params.equipment].sort());
    const frequencyChanged = !params || params.frequency !== state.frequency;

    // Generate new program if:
    // 1. No initial program exists yet, OR
    // 2. Equipment changed, OR
    // 3. Frequency changed
    const shouldRegenerate =
      !state.initialGeneratedProgram || equipmentChanged || frequencyChanged;

    if (shouldRegenerate) {
      // Step 1: Select initial exercises (2 per muscle group)
      const allExercises = getAllExercises();
      const initialExercises = selectInitialExercises(
        allExercises,
        state.equipment,
        state.frequency,
      );

      // Step 2: Generate full workout program from these exercises
      const program = generateWorkoutProgramFromCustomExercises(
        {
          frequency: state.frequency,
          equipment: state.equipment,
          focus: state.focus,
        },
        initialExercises,
      );

      // Step 3: Extract exercises from program (may differ from input due to distribution logic)
      const programExercises = extractExercisesFromProgram(program);

      setCustomExercises(programExercises);

      // Update state with program, exercises, and generation params
      updateState({
        customExercises: programExercises,
        initialGeneratedProgram: program,
        initialCustomExercises: programExercises,
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
  }, [state.equipment, state.frequency, state.focus, state.customExercises]);

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
    // Clear generated program and update exercises before navigating
    // This forces regeneration in review screen with current exercises
    updateState({
      customExercises,
      generatedProgram: undefined
    });
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
    <WizardLayout
      step={4}
      totalSteps={5}
      onBack={handleBack}
      bottomAction={(
        <WizardContinueButton
          onPress={handleContinue}
          disabled={isContinueDisabled}
          accessibilityLabel="Continue to review"
        />
      )}
    >
      <View className="mb-6">
        <Text className="text-3xl font-bold leading-tight tracking-tight text-white mb-2">
          Review Exercises
        </Text>
        <Text className="text-gray-400 text-base font-normal leading-relaxed">
          Customize your exercise selection. Minimum {MIN_EXERCISES}, maximum{" "}
          {MAX_EXERCISES} exercises.
        </Text>
      </View>

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
                : "bg-primary/20",
          )}
        >
          <Text
            className={cn(
              "text-xs font-semibold",
              customExercises.length < MIN_EXERCISES
                ? "text-red-500"
                : customExercises.length > MAX_EXERCISES
                  ? "text-red-500"
                  : "text-primary",
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

      {customExercises.length < MAX_EXERCISES && (
        <Pressable
          onPress={handleAdd}
          testID="add-exercise-button"
          accessibilityRole="button"
          accessibilityLabel="Add exercise"
          className="flex-row items-center justify-center bg-surface-dark rounded-xl p-4 mt-2 active:bg-surface-dark-highlight"
        >
          <MaterialIcons
            name="add-circle-outline"
            size={24}
            color="#6b8779"
          />
          <Text className="text-primary font-semibold text-base ml-2">
            Add Exercise
          </Text>
        </Pressable>
      )}
    </WizardLayout>
  );
}
