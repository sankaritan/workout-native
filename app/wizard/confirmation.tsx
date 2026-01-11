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
  const { generatedProgram } = state;

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

        {/* Generated Program */}
        {generatedProgram && (
          <View className="bg-white dark:bg-surface-dark rounded-2xl p-6 mb-6 border border-slate-200 dark:border-white/10">
            <Text className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Generated Workout Plan
            </Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {generatedProgram.name}
            </Text>

            {/* Sessions */}
            {generatedProgram.sessions.map((session, sessionIdx) => (
              <View key={sessionIdx} className="mb-6 last:mb-0">
                <View className="flex-row items-center mb-3">
                  <View className="bg-primary/20 rounded-full px-3 py-1 mr-2">
                    <Text className="text-primary font-bold text-xs">
                      Day {session.dayOfWeek}
                    </Text>
                  </View>
                  <Text className="text-lg font-bold text-slate-900 dark:text-white">
                    {session.name}
                  </Text>
                </View>

                {/* Exercises */}
                <View className="gap-2">
                  {session.exercises.map((programEx, exIdx) => (
                    <View
                      key={exIdx}
                      className="flex-row items-center bg-slate-50 dark:bg-white/5 rounded-lg p-3"
                    >
                      <View className="bg-slate-200 dark:bg-white/10 rounded-full size-8 items-center justify-center mr-3">
                        <Text className="text-slate-700 dark:text-white font-bold text-sm">
                          {programEx.order}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-slate-900 dark:text-white font-semibold">
                          {programEx.exercise.name}
                        </Text>
                        <Text className="text-xs text-slate-500 dark:text-slate-400">
                          {programEx.exercise.muscle_group} • {programEx.exercise.equipment_required || "Bodyweight"}
                        </Text>
                      </View>
                      <View className="bg-primary/10 rounded-lg px-3 py-1.5">
                        <Text className="text-primary font-bold text-sm">
                          {programEx.sets} × {programEx.repsMin}-{programEx.repsMax}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Info Box */}
        {!generatedProgram && (
          <View className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
            <Text className="text-slate-700 dark:text-slate-300 text-sm">
              <Text className="font-bold">Note: </Text>
              No workout program was generated. This might happen on web platform
              where database operations are limited.
            </Text>
          </View>
        )}

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
