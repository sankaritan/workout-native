/**
 * Temporary Reset Data Screen
 * Allows resetting all test data during development
 * TODO: Remove this before production
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { resetStorage } from "@/lib/storage/storage";
import { seedExercises, seedTestWorkoutPlan, seedMockWorkoutHistory } from "@/lib/storage/seed-data";
import { showAlert } from "@/lib/utils/alert";

export default function ResetScreen() {
  const handleReset = () => {
    showAlert(
      "Reset All Data",
      "This will delete all workout data and reset to initial state with mock data. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              // Reset storage
              await resetStorage();

              // Re-seed with initial data
              seedExercises();
              seedTestWorkoutPlan();
              seedMockWorkoutHistory();

              showAlert("Success", "All data has been reset successfully!");

              // Navigate back to home
              router.replace("/(tabs)");
            } catch (error) {
              console.error("Failed to reset data:", error);
              showAlert("Error", "Failed to reset data. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background-dark items-center justify-center px-6">
      <MaterialIcons name="refresh" size={80} color="#9db9a8" />
      <Text className="text-2xl font-bold text-white mt-6 mb-2 text-center">
        Development Tools
      </Text>
      <Text className="text-text-muted text-center mb-8">
        This screen will be removed before production
      </Text>

      <Pressable
        onPress={handleReset}
        className="bg-red-500/20 border border-red-500/40 rounded-xl px-8 py-4 active:scale-[0.98]"
      >
        <View className="flex-row items-center gap-3">
          <MaterialIcons name="delete-forever" size={24} color="#ef4444" />
          <Text className="text-red-500 text-base font-bold">
            Reset All Data
          </Text>
        </View>
      </Pressable>

      <Text className="text-xs text-text-muted mt-4 text-center max-w-xs">
        This will delete all workouts, sessions, and history, then re-seed with
        fresh mock data including progression patterns.
      </Text>
    </View>
  );
}
