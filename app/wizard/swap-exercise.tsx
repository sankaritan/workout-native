/**
 * Swap Exercise Screen
 * Unified full-screen picker to swap an exercise with muscle group filters
 */

import React, { useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useWizard } from "@/lib/wizard-context";
import { ExercisePickerScreen } from "@/components/ExercisePickerScreen";
import type { Exercise, MuscleGroup } from "@/lib/storage/types";

export default function SwapExerciseScreen() {
  const { state, updateState } = useWizard();
  const params = useLocalSearchParams<{ exerciseId: string }>();

  const currentExerciseId = parseInt(params.exerciseId, 10);
  const customExercises = state.customExercises || [];

  // Find the current exercise being swapped
  const currentExercise = useMemo(() => {
    return customExercises.find((e) => e.id === currentExerciseId);
  }, [customExercises, currentExerciseId]);

  const initialMuscleFilters: MuscleGroup[] = currentExercise?.muscle_groups.length
    ? [currentExercise.muscle_groups[0]]
    : [];

  /**
   * Handle exercise selection - swap and go back
   */
  const handleSelectExercise = (exercise: Exercise) => {
    // Replace current exercise with selected exercise in flat array
    const updated = customExercises.map((e) =>
      e.id === currentExerciseId ? exercise : e
    );

    updateState({ customExercises: updated });
    router.back();
  };

  /**
   * Handle close button press
   */
  const handleClose = () => {
    router.back();
  };

  return (
    <ExercisePickerScreen
      title="Swap Exercise"
      subtitle={`Replacing: ${currentExercise?.name || "Unknown"}`}
      equipment={state.equipment}
      excludedExerciseIds={[currentExerciseId, ...customExercises.map((exercise) => exercise.id)]}
      initialMuscleFilters={initialMuscleFilters}
      onSelectExercise={handleSelectExercise}
      onClose={handleClose}
    />
  );
}
