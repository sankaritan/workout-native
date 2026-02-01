/**
 * Plans List Dashboard (Placeholder)
 * Temporary barebone view showing list of workout plans
 * Will be replaced with proper design later
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { WorkoutPlan } from "@/lib/storage/types";

interface PlansListDashboardProps {
  plans: WorkoutPlan[];
}

export default function PlansListDashboard({ plans }: PlansListDashboardProps) {
  const insets = useSafeAreaInsets();

  const handlePlanPress = (planId: number) => {
    router.push(`/workout/${planId}`);
  };

  const handleGenerateNewPlan = () => {
    router.push("/wizard/frequency");
  };

  return (
    <ScrollView
      className="flex-1 bg-background-dark w-full"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 128,
      }}
    >
      <View>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-white mb-2">
            Your Workout Plans
          </Text>
        </View>

        {/* Placeholder Warning Banner */}
        <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex-row items-start gap-3">
          <MaterialIcons name="warning" size={24} color="#eab308" />
          <View className="flex-1">
            <Text className="text-yellow-500 font-bold mb-1">
              PLACEHOLDER VIEW
            </Text>
            <Text className="text-yellow-500/80 text-sm">
              This is a temporary design. Will be replaced with proper dashboard layout.
            </Text>
          </View>
        </View>

        {/* Plans List */}
        <View className="gap-3 mb-6">
          {plans.map((plan) => (
            <Pressable
              key={plan.id}
              onPress={() => handlePlanPress(plan.id)}
              className="bg-surface-dark rounded-xl p-4 border border-white/10 active:scale-[0.98] flex-row items-center justify-between"
              accessibilityRole="button"
              accessibilityLabel={`View ${plan.name}`}
            >
              <View className="flex-1">
                <Text className="text-white font-bold text-lg mb-1">
                  {plan.name}
                </Text>
                {plan.description && (
                  <Text className="text-gray-400 text-sm" numberOfLines={1}>
                    {plan.description}
                  </Text>
                )}
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#13ec6d" />
            </Pressable>
          ))}
        </View>

        {/* Generate New Plan Button */}
        <Pressable
          onPress={handleGenerateNewPlan}
          className="bg-primary/10 border border-primary/30 rounded-xl py-4 px-6 active:scale-[0.98]"
          accessibilityRole="button"
          accessibilityLabel="Generate a new workout plan"
        >
          <View className="flex-row items-center justify-center gap-2">
            <MaterialIcons name="add-circle" size={24} color="#13ec6d" />
            <Text className="text-primary text-lg font-bold">
              Generate New Plan
            </Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}
