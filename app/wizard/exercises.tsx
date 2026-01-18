/**
 * Exercise Review Screen
 * Step 4 of 5 in workout wizard
 * Allows users to customize exercises by muscle group
 */

import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWizard } from "@/lib/wizard-context";
import { cn } from "@/lib/utils/cn";
import { MuscleGroupSection } from "@/components/MuscleGroupSection";
import { selectInitialExercisesByMuscleGroup } from "@/lib/workout-generator/exercise-selector";
import { getAllExercises } from "@/lib/storage/storage";
import type { MuscleGroup } from "@/lib/storage/types";
import type { MuscleGroupExercises } from "@/lib/workout-generator/types";

// All muscle groups in display order
const ALL_MUSCLE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

// Maximum exercises per muscle group
const MAX_EXERCISES_PER_GROUP = 5;

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const { state, updateState } = useWizard();
  const [customExercises, setCustomExercises] = useState<MuscleGroupExercises[]>(
    state.customExercises || []
  );

  // Initialize custom exercises on mount if not already set
  useEffect(() => {
    if (!state.customExercises && state.equipment) {
      const allExercises = getAllExercises();
      const initialExercises = selectInitialExercisesByMuscleGroup(
        allExercises,
        state.equipment
      );
      setCustomExercises(initialExercises);
      updateState({ customExercises: initialExercises });
    }
  }, [state.customExercises, state.equipment, updateState]);

  /**
   * Handle swap exercise - navigate to swap screen
   */
  const handleSwap = (muscleGroup: MuscleGroup, exerciseId: number) => {
    router.push({
      pathname: "/wizard/swap-exercise",
      params: { muscleGroup, exerciseId: String(exerciseId) },
    });
  };

  /**
   * Handle remove exercise
   */
  const handleRemove = (muscleGroup: MuscleGroup, exerciseId: number) => {
    const updated = customExercises.map((entry) => {
      if (entry.muscleGroup === muscleGroup) {
        return {
          ...entry,
          exercises: entry.exercises.filter((e) => e.id !== exerciseId),
        };
      }
      return entry;
    });
    setCustomExercises(updated);
    updateState({ customExercises: updated });
  };

  /**
   * Handle add exercise - navigate to add screen
   */
  const handleAdd = (muscleGroup: MuscleGroup) => {
    router.push({
      pathname: "/wizard/add-exercise",
      params: { muscleGroup },
    });
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

  // Check if we can continue (at least one exercise in any group)
  const hasAnyExercise = customExercises.some((entry) => entry.exercises.length > 0);
  const isContinueDisabled = !hasAnyExercise;

  // Get exercises for a muscle group
  const getExercisesForMuscle = (muscleGroup: MuscleGroup) => {
    const entry = customExercises.find((e) => e.muscleGroup === muscleGroup);
    return entry?.exercises || [];
  };

  // Check if can add more exercises for a muscle group
  const canAddForMuscle = (muscleGroup: MuscleGroup) => {
    const exercises = getExercisesForMuscle(muscleGroup);
    return exercises.length < MAX_EXERCISES_PER_GROUP;
  };

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
            Customize which exercises you want for each muscle group.
          </Text>
        </View>

        {/* Muscle Group Sections */}
        {ALL_MUSCLE_GROUPS.map((muscleGroup) => (
          <MuscleGroupSection
            key={muscleGroup}
            muscleGroup={muscleGroup}
            exercises={getExercisesForMuscle(muscleGroup)}
            onSwap={(exerciseId) => handleSwap(muscleGroup, exerciseId)}
            onRemove={(exerciseId) => handleRemove(muscleGroup, exerciseId)}
            onAdd={() => handleAdd(muscleGroup)}
            canAdd={canAddForMuscle(muscleGroup)}
            testID={`muscle-group-${muscleGroup.toLowerCase()}`}
          />
        ))}
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
