/**
 * Review Swap Exercise Screen
 * Swap an exercise in the generated program (Step 5)
 * Similar to swap-exercise.tsx but operates on generatedProgram.sessions
 */

import React, { useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useWizard } from "@/lib/wizard-context";
import { ExercisePickerScreen } from "@/components/ExercisePickerScreen";
import type { Exercise } from "@/lib/storage/types";

export default function ReviewSwapExerciseScreen() {
  const { state, updateState } = useWizard();
  const params = useLocalSearchParams<{ sessionIndex: string; exerciseIndex: string }>();

  const sessionIndex = parseInt(params.sessionIndex, 10);
  const exerciseIndex = parseInt(params.exerciseIndex, 10);

  // Get current exercise from generatedProgram
  const currentExercise = useMemo(() => {
    if (!state.generatedProgram?.sessions[sessionIndex]) return undefined;
    const session = state.generatedProgram.sessions[sessionIndex];
    return session.exercises[exerciseIndex]?.exercise;
  }, [state.generatedProgram, sessionIndex, exerciseIndex]);


  /**
   * Handle exercise selection - swap in generatedProgram and go back
   */
  const handleSelectExercise = (exercise: Exercise) => {
    if (!state.generatedProgram) return;

    // Clone the program
    const updatedProgram = {
      ...state.generatedProgram,
      sessions: state.generatedProgram.sessions.map((session, idx) => {
        if (idx !== sessionIndex) return session;

        // Update the specific exercise
        return {
          ...session,
          exercises: session.exercises.map((ex, exIdx) => {
            if (exIdx !== exerciseIndex) return ex;

            // Replace exercise, keep sets/reps the same
            return {
              ...ex,
              exercise: exercise,
            };
          }),
        };
      }),
    };

    updateState({ generatedProgram: updatedProgram });
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
      showAllPill={true}
      onSelectExercise={handleSelectExercise}
      onClose={handleClose}
    />
  );
}
