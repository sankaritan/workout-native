/**
 * Main Dashboard Screen
 * Routes to appropriate dashboard view based on user's workout plans
 */

import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getAllWorkoutPlans,
  isStorageInitialized,
} from "@/lib/storage/storage";
import type { WorkoutPlan } from "@/lib/storage/types";
import EmptyStateDashboard from "@/components/EmptyStateDashboard";
import PlansListDashboard from "@/components/PlansListDashboard";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  // Reload data when screen comes into focus (e.g., after creating a new plan)
  useFocusEffect(
    React.useCallback(() => {
      loadPlans();
    }, [])
  );

  const loadPlans = () => {
    try {
      // Check if storage is ready
      if (!isStorageInitialized()) {
        console.log("Storage not initialized yet");
        setIsLoading(false);
        return;
      }

      // Get all workout plans
      const allPlans = getAllWorkoutPlans();
      setPlans(allPlans);

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load workout plans:", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center w-full">
        <ActivityIndicator size="large" color="#13ec6d" />
      </View>
    );
  }

  // Empty state - no workout plans exist
  if (plans.length === 0) {
    return <EmptyStateDashboard />;
  }

  // Plans exist - show plans list dashboard
  return <PlansListDashboard plans={plans} />;
}
