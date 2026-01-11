/**
 * Temporary Confirmation Screen
 * Placeholder until Story 7 (Workout Generation Engine) is implemented
 * Shows the wizard selections before generating the actual plan
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useWizard } from "@/lib/wizard-context";

export default function ConfirmationScreen() {
  const { state, resetState } = useWizard();

  const handleStartOver = () => {
    resetState();
    router.push("/wizard/frequency");
  };

  const handleGoHome = () => {
    resetState();
    router.push("/");
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 px-6 pt-12">
        {/* Success Icon */}
        <View className="items-center mb-8">
          <View className="size-24 rounded-full bg-primary/20 items-center justify-center mb-4">
            <MaterialIcons name="check-circle" size={64} color="#13ec6d" />
          </View>
          <Text className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-2">
            Wizard Complete!
          </Text>
          <Text className="text-slate-600 dark:text-slate-400 text-center">
            Your selections are ready for plan generation
          </Text>
        </View>

        {/* Wizard Summary */}
        <View className="bg-white dark:bg-surface-dark rounded-2xl p-6 mb-6 border border-slate-200 dark:border-white/10">
          <Text className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Your Selections
          </Text>

          {/* Frequency */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Workout Frequency
            </Text>
            <Text className="text-lg text-slate-900 dark:text-white">
              {state.frequency} days per week
            </Text>
          </View>

          {/* Equipment */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Available Equipment
            </Text>
            <Text className="text-lg text-slate-900 dark:text-white">
              {state.equipment?.join(", ") || "None selected"}
            </Text>
          </View>

          {/* Focus */}
          <View>
            <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Training Focus
            </Text>
            <Text className="text-lg text-slate-900 dark:text-white">
              {state.focus}
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
          <Text className="text-slate-700 dark:text-slate-300 text-sm">
            <Text className="font-bold">Note: </Text>
            This is a temporary confirmation screen. In Story 7, clicking
            "Generate Plan" will trigger the rule-based workout generation
            engine to create your personalized workout plan.
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 pb-8">
          <Pressable
            onPress={handleStartOver}
            className="flex-row items-center justify-center gap-2 bg-primary rounded-xl px-6 py-4 active:scale-[0.98]"
            accessibilityRole="button"
            accessibilityLabel="Start wizard over"
          >
            <MaterialIcons name="refresh" size={20} color="#102218" />
            <Text className="text-background-dark text-base font-bold">
              Start Over
            </Text>
          </Pressable>

          <Pressable
            onPress={handleGoHome}
            className="flex-row items-center justify-center gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl px-6 py-4 active:scale-[0.98]"
            accessibilityRole="button"
            accessibilityLabel="Go to home screen"
          >
            <MaterialIcons name="home" size={20} color="#ffffff" />
            <Text className="text-slate-900 dark:text-white text-base font-bold">
              Go Home
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
