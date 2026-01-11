/**
 * Plan Review Screen
 * Shows generated workout plan with accept/regenerate options
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useWizard } from "@/lib/wizard-context";
import { WorkoutPlanCard } from "@/components/WorkoutPlanCard";
import { SessionCard } from "@/components/SessionCard";

export default function PlanReviewScreen() {
  const { state, resetState } = useWizard();
  const { generatedProgram } = state;

  /**
   * Handle accept plan button press
   * In future: save plan, mark as active, navigate to home
   */
  const handleAcceptPlan = () => {
    console.log("Plan accepted!");
    console.log("TODO: Save plan to database and mark as active");

    // For now, reset wizard and go home
    resetState();
    router.push("/");
  };

  /**
   * Handle regenerate button press
   * Go back to wizard start
   */
  const handleRegenerate = () => {
    resetState();
    router.push("/wizard/frequency");
  };

  // Handle missing program
  if (!generatedProgram) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6">
        <MaterialIcons name="error-outline" size={64} color="#ef4444" />
        <Text className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
          No Plan Found
        </Text>
        <Text className="text-slate-600 dark:text-slate-400 text-center mb-6">
          Please go through the wizard to generate a workout plan.
        </Text>
        <Pressable
          onPress={() => router.push("/wizard/frequency")}
          className="bg-primary rounded-xl px-6 py-3"
        >
          <Text className="text-background-dark font-bold">
            Start Wizard
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="bg-background-light/80 dark:bg-background-dark/80 px-4 pt-4 pb-2">
        <View className="flex-row items-center mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
              Your Workout Plan
            </Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400">
              Review and accept to start training
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-4 pt-4 pb-32">
        {/* Plan Overview Card */}
        <WorkoutPlanCard program={generatedProgram} />

        {/* Sessions Header */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Training Sessions
          </Text>
          <Text className="text-sm text-slate-600 dark:text-slate-400">
            Tap to expand and view exercises
          </Text>
        </View>

        {/* Session Cards */}
        {generatedProgram.sessions.map((session, idx) => (
          <SessionCard key={idx} session={session} />
        ))}
      </ScrollView>

      {/* Action Buttons (Fixed at bottom) */}
      <View className="absolute bottom-0 left-0 right-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-slate-200 dark:border-white/5 p-4 pb-8">
        <View className="gap-3">
          {/* Accept Plan Button */}
          <Pressable
            onPress={handleAcceptPlan}
            testID="accept-button"
            accessibilityRole="button"
            accessibilityLabel="Accept workout plan"
            className="flex-row items-center justify-center gap-2 bg-primary rounded-xl px-6 py-4 shadow-lg active:scale-[0.98]"
          >
            <MaterialIcons name="check-circle" size={20} color="#102218" />
            <Text className="text-background-dark text-base font-bold">
              Accept Plan
            </Text>
          </Pressable>

          {/* Regenerate Button */}
          <Pressable
            onPress={handleRegenerate}
            testID="regenerate-button"
            accessibilityRole="button"
            accessibilityLabel="Regenerate workout plan"
            className="flex-row items-center justify-center gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl px-6 py-4 active:scale-[0.98]"
          >
            <MaterialIcons name="refresh" size={20} color="#ffffff" />
            <Text className="text-slate-900 dark:text-white text-base font-bold">
              Regenerate
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
