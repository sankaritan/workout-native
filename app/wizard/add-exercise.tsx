/**
 * Add Exercise Screen
 * Unified full-screen picker to add exercises with muscle group filters
 */

import React from "react";
import { router } from "expo-router";
import { useWizard } from "@/lib/wizard-context";
import { ExercisePickerScreen } from "@/components/ExercisePickerScreen";
import type { Exercise } from "@/lib/storage/types";

// Maximum total exercises
const MAX_EXERCISES = 20;

export default function AddExerciseScreen() {
  const { state, updateState } = useWizard();

  const customExercises = state.customExercises || [];

  // Check if at max limit
  const isAtMaxLimit = customExercises.length >= MAX_EXERCISES;


  /**
   * Handle exercise selection - add and go back
   */
  const handleSelectExercise = (exercise: Exercise) => {
    if (isAtMaxLimit) return;

    // Add to flat array
    const updated = [...customExercises, exercise];
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
      title="Add Exercise"
      subtitle={`${customExercises.length}/${MAX_EXERCISES} exercises selected`}
      equipment={state.equipment}
      excludedExerciseIds={customExercises.map((exercise) => exercise.id)}
      maxLimitReached={isAtMaxLimit}
      maxLimitTitle={`Maximum of ${MAX_EXERCISES} exercises reached.`}
      maxLimitDescription="Remove an exercise to add a new one."
      onSelectExercise={handleSelectExercise}
      onClose={handleClose}
    />
  );
}
