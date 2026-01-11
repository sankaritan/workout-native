/**
 * Dashboard Home Screen
 * Empty state with button to start wizard (temporary for testing)
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomeScreen() {
  const handleGeneratePlan = () => {
    router.push("/wizard/frequency");
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6">
      {/* Icon placeholder */}
      <View className="relative w-64 h-64 mb-10 flex items-center justify-center">
        <View className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <View className="relative z-10">
          <MaterialIcons name="fitness-center" size={120} color="#13ec6d" />
        </View>
      </View>

      {/* Text content */}
      <View className="max-w-xs mx-auto space-y-4 items-center">
        <Text className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-center">
          Welcome to your new routine
        </Text>
        <Text className="text-slate-600 dark:text-gray-400 leading-relaxed text-center">
          It looks like you don't have a workout plan yet. Let's build a custom
          schedule tailored to your goals.
        </Text>
      </View>

      {/* Generate Plan Button */}
      <View className="mt-10 w-full max-w-sm">
        <Pressable
          onPress={handleGeneratePlan}
          className="w-full rounded-xl bg-primary py-4 px-6 shadow-lg active:scale-[0.98] transition-all"
          accessibilityRole="button"
          accessibilityLabel="Generate your first workout plan"
        >
          <View className="flex-row items-center justify-center gap-3">
            <MaterialIcons name="add-circle" size={24} color="#102218" />
            <Text className="text-background-dark text-lg font-bold">
              Generate Your First Plan
            </Text>
          </View>
        </Pressable>
        <Text className="mt-4 text-xs text-slate-400 dark:text-gray-500 text-center">
          Takes about 2 minutes to set up
        </Text>
      </View>
    </View>
  );
}
