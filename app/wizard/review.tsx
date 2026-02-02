/**
 * Plan Review Screen
 * Step 5 of 5 - Shows generated workout plan with accept/regenerate options
 */

import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "@/components/BackButton";
import { WizardContinueButton } from "@/components/ui/WizardContinueButton";
import { useWizard } from "@/lib/wizard-context";
import { WorkoutPlanCard } from "@/components/WorkoutPlanCard";
import { WorkoutDesignInfo } from "@/components/WorkoutDesignInfo";
import { SessionCard } from "@/components/SessionCard";
import { generateWorkoutProgramFromCustomExercises, saveWorkoutProgram } from "@/lib/workout-generator/engine";

export default function PlanReviewScreen() {
  const insets = useSafeAreaInsets();
  const { state, updateState, resetState } = useWizard();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPlanId, setSavedPlanId] = useState<number | null>(null);

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

          // Save to storage and mark as active
          const planId = saveWorkoutProgram(program);
          setSavedPlanId(planId);

          // Update state with generated program
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
   * Plan is already saved and marked as active during generation
   */
  const handleAcceptPlan = () => {
    console.log("Plan accepted!");

    // Reset wizard state
    resetState();
    
    // Navigate to the newly created plan instead of home
    if (savedPlanId) {
      router.push(`/workout/${savedPlanId}`);
    } else {
      router.push("/");
    }
  };

  /**
   * Handle regenerate button press
   * Go back to exercises screen to modify
   */
  const handleRegenerate = () => {
    // Clear generated program so it regenerates when coming back
    updateState({ generatedProgram: undefined });
    router.back();
  };

  /**
   * Handle back button press
   */
  const handleBack = () => {
    // Clear generated program so it regenerates when coming back
    updateState({ generatedProgram: undefined });
    router.back();
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
            Tap to expand and view exercises
          </Text>
        </View>

        {/* Session Cards */}
        {generatedProgram.sessions.map((session, idx) => (
          <SessionCard key={idx} session={session} dayNumber={idx + 1} />
        ))}
      </ScrollView>

      {/* Action Buttons (Fixed at bottom) */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-lg border-t border-white/5 p-4 w-full"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="gap-3">
          {/* Accept Plan Button */}
          <WizardContinueButton
            onPress={handleAcceptPlan}
            label="Accept Plan"
            icon="check-circle"
            testID="accept-button"
            accessibilityLabel="Accept workout plan"
          />

          {/* Edit Exercises Button */}
          <Pressable
            onPress={handleRegenerate}
            testID="edit-button"
            accessibilityRole="button"
            accessibilityLabel="Edit exercises"
            className="flex-row items-center justify-center gap-2 bg-surface-dark border border-white/10 rounded-xl px-6 py-4 active:scale-[0.98]"
          >
            <MaterialIcons name="edit" size={20} color="#ffffff" />
            <Text className="text-white text-base font-bold">
              Edit Exercises
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
