/**
 * Plan Review Screen
 * Step 5 of 5 - Shows generated workout plan with accept/regenerate options
 */

import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "@/components/BackButton";
import { DraggableExerciseItem } from "@/components/DraggableExerciseItem";
import { SortableList } from "@/components/SortableList";
import { WizardContinueButton } from "@/components/ui/WizardContinueButton";
import { WorkoutDesignInfo } from "@/components/WorkoutDesignInfo";
import { WorkoutPlanCard } from "@/components/WorkoutPlanCard";
import { useWizard } from "@/lib/wizard-context";
import { generateWorkoutProgramFromCustomExercises, saveWorkoutProgram } from "@/lib/workout-generator/engine";
import type { ProgramExercise } from "@/lib/workout-generator/types";

export default function PlanReviewScreen() {
  const insets = useSafeAreaInsets();
  const { state, updateState, resetState } = useWizard();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { generatedProgram, customExercises, initialGeneratedProgram, initialCustomExercises, frequency, equipment, focus } = state;

  // Generate or use pre-generated program
  useEffect(() => {
    const generateProgram = async () => {
      // Only generate if we have custom exercises but no program yet
      if (customExercises && !generatedProgram && frequency && equipment && focus) {
        setIsGenerating(true);
        setError(null);

        try {
          let program;

          // Determine if exercises were modified compared to initial selection
          // Compare exercise IDs as sets (order doesn't matter)
          const currentExerciseIds = new Set(customExercises.map((ex) => ex.id));
          const initialExerciseIds = new Set(initialCustomExercises?.map((ex) => ex.id) || []);

          const exercisesWereModified =
            !initialCustomExercises ||
            currentExerciseIds.size !== initialExerciseIds.size ||
            Array.from(currentExerciseIds).some((id) => !initialExerciseIds.has(id));

          // Check if exercises were modified
          if (!exercisesWereModified && initialGeneratedProgram) {
            // Use pre-generated program from step 4 (no modifications)
            console.log("Using pre-generated program (no modifications)");
            program = initialGeneratedProgram;
          } else {
            // Regenerate program with modified exercises
            console.log("Regenerating program (exercises modified)");
            program = generateWorkoutProgramFromCustomExercises(
              { frequency, equipment, focus },
              customExercises
            );
          }

          // Update state with generated program (save on accept)
          updateState({ generatedProgram: program });
        } catch (err) {
          console.error("Failed to generate program:", err);
          setError(err instanceof Error ? err.message : "Failed to generate program");
        } finally {
          setIsGenerating(false);
        }
      }
    };

    generateProgram();
  }, [customExercises, generatedProgram, initialGeneratedProgram, initialCustomExercises, frequency, equipment, focus, updateState]);

  /**
   * Handle accept plan button press
   * Save the current (possibly modified) program and navigate to it
   */
  const handleAcceptPlan = () => {
    console.log("Plan accepted!");

    if (!generatedProgram) {
      console.error("No program to save");
      router.push("/");
      return;
    }

    // Normalize exercise order based on current array order
    const normalizedProgram = {
      ...generatedProgram,
      sessions: generatedProgram.sessions.map((session) => ({
        ...session,
        exercises: session.exercises.map((ex, idx) => ({
          ...ex,
          order: idx + 1,
        })),
      })),
    };

    // Save the current program state (includes any reordering/swaps)
    const finalPlanId = saveWorkoutProgram(normalizedProgram);

    // Reset wizard state
    resetState();

    // Navigate to the newly created plan
    router.push(`/workout/${finalPlanId}`);
  };

  /**
   * Handle back button press
   */
  const handleBack = () => {
    // Clear generated program so it regenerates when coming back
    updateState({ generatedProgram: undefined });
    router.back();
  };

  /**
   * Handle exercise reordering within a session
   */
  const handleExerciseReorder = (sessionIndex: number, newExercises: ProgramExercise[]) => {
    if (!generatedProgram) return;

    // Update order property based on new array index
    const updatedExercises = newExercises.map((ex, idx) => ({
      ...ex,
      order: idx + 1, // 1-based order
    }));

    // Clone program and update the session
    const updatedProgram = {
      ...generatedProgram,
      sessions: generatedProgram.sessions.map((session, idx) =>
        idx === sessionIndex
          ? { ...session, exercises: updatedExercises }
          : session
      ),
    };

    updateState({ generatedProgram: updatedProgram });
  };

  /**
   * Handle exercise swap navigation
   */
  const handleSwapExercise = (sessionIndex: number, exerciseIndex: number) => {
    router.push({
      pathname: "/wizard/review-swap-exercise",
      params: {
        sessionIndex: String(sessionIndex),
        exerciseIndex: String(exerciseIndex),
      },
    });
  };

  // Handle loading state
  if (isGenerating) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center px-6">
        <ActivityIndicator size="large" color="#13ec6d" />
        <Text className="text-xl font-bold text-white mt-4 mb-2">
          Creating Your Plan
        </Text>
        <Text className="text-gray-400 text-center">
          Building your personalized workout program...
        </Text>
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center px-6">
        <MaterialIcons name="error-outline" size={64} color="#ef4444" />
        <Text className="text-xl font-bold text-white mt-4 mb-2">
          Generation Failed
        </Text>
        <Text className="text-gray-400 text-center mb-6">
          {error}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-primary rounded-xl px-6 py-3"
        >
          <Text className="text-background-dark font-bold">
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  // Redirect to wizard start if no program is available
  // This shouldn't happen in normal flow, but handle it gracefully
  useEffect(() => {
    if (!generatedProgram && !isGenerating && !error && !customExercises) {
      router.replace("/wizard/frequency");
    }
  }, [generatedProgram, isGenerating, error, customExercises]);

  // Handle missing program - if we get here without a program, we're still generating or have an error
  // The redirect useEffect will handle the edge case where we truly have no program
  if (!generatedProgram) {
    return null;
  }

  return (
    <View className="flex-1 bg-background-dark w-full">
      {/* Header */}
      <View className="bg-background-dark/80 px-4 pb-2 w-full" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center justify-between mb-4">
          {/* Back button */}
          <BackButton onPress={handleBack} />

          {/* Step indicator */}
          <Text className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Step 5 of 5
          </Text>

          {/* Empty space for balance */}
          <View className="size-10" />
        </View>

        {/* Segmented Progress Bar - 5 of 5 filled */}
        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 h-1.5 rounded-full bg-primary" />
          <View className="flex-1 h-1.5 rounded-full bg-primary" />
          <View className="flex-1 h-1.5 rounded-full bg-primary" />
          <View className="flex-1 h-1.5 rounded-full bg-primary" />
          <View
            testID="progress-bar"
            className="flex-1 h-1.5 rounded-full bg-primary"
          />
        </View>

        {/* Title */}
        <View>
          <Text className="text-2xl font-bold text-white">
            Your Workout Plan
          </Text>
          <Text className="text-sm text-gray-400">
            Review and accept to start training
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 120 + insets.bottom,
        }}
      >
        {/* Plan Overview Card */}
        <WorkoutPlanCard program={generatedProgram} />

        {/* Design Info Section */}
        <WorkoutDesignInfo />

        {/* Sessions Header */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-white mb-2">
            Training Sessions
          </Text>
          <Text className="text-sm text-gray-400">
            Drag to reorder or tap edit to swap exercises
          </Text>
        </View>

        {/* Session Cards with Draggable Exercises */}
        {generatedProgram.sessions.map((session, sessionIdx) => (
          <View key={sessionIdx} className="mb-6">
            {/* Session Header */}
            <View className="bg-surface-dark rounded-t-2xl px-4 pt-4 pb-3 border border-b-0 border-white/10">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <View className="bg-primary/20 rounded-full px-3 py-1 mr-3">
                    <Text className="text-primary font-bold text-xs">
                      Day {sessionIdx + 1}
                    </Text>
                  </View>
                  <Text className="text-lg font-bold text-white flex-1">
                    {session.name}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-gray-400">
                {session.exercises.length} {session.exercises.length === 1 ? "exercise" : "exercises"}
              </Text>
            </View>

            {/* Draggable Exercise List */}
            <View className="bg-surface-dark rounded-b-2xl px-4 pb-4 border border-t-0 border-white/10">
              <SortableList
                data={session.exercises}
                renderItem={(exercise, idx, drag, isActive, dragHandleProps) => (
                  <DraggableExerciseItem
                    exercise={exercise}
                    onSwap={() => handleSwapExercise(sessionIdx, idx)}
                    drag={drag}
                    isActive={isActive}
                    dragHandleProps={dragHandleProps}
                  />
                )}
                onReorder={(newExercises) => handleExerciseReorder(sessionIdx, newExercises)}
                keyExtractor={(exercise, idx) => `${sessionIdx}-${exercise.exercise.id}-${idx}`}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Action Buttons (Fixed at bottom) */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-lg border-t border-white/5 p-4 w-full"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Accept Plan Button */}
        <WizardContinueButton
          onPress={handleAcceptPlan}
          label="Accept Plan"
          icon="check-circle"
          testID="accept-button"
          accessibilityLabel="Accept workout plan"
        />
      </View>
    </View>
  );
}
