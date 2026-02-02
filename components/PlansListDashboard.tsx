/**
 * Plans List Dashboard
 * Shown when user has at least one workout plan
 * Design based on design-assets/stitch_workout_frequency_selection/workout_plans_dash/code.html
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { WorkoutPlan } from "@/lib/storage/types";
import { getCompletedSessionsByDateRange, getSessionTemplatesByPlanId, getCompletedSessionsByPlanId } from "@/lib/storage/storage";
import { BalanceIcon } from "@/components/icons";

interface PlansListDashboardProps {
  plans: WorkoutPlan[];
}

/**
 * Get the appropriate icon component for a workout goal/focus
 */
const getGoalIcon = (focus: "Balanced" | "Strength" | "Endurance") => {
  switch (focus) {
    case "Strength":
      return { type: "material" as const, name: "fitness-center" as const };
    case "Balanced":
      return { type: "custom" as const, component: BalanceIcon };
    case "Endurance":
      return { type: "material" as const, name: "directions-run" as const };
  }
};

/**
 * Get the next session name for a workout plan
 */
const getNextSessionName = (plan: WorkoutPlan): string | null => {
  const sessions = getSessionTemplatesByPlanId(plan.id);
  if (sessions.length === 0) return null;

  const completedSessions = getCompletedSessionsByPlanId(plan.id);
  
  // Get completed session template IDs (only truly completed ones)
  const completedTemplateIds = new Set(
    completedSessions
      .filter(s => s.completed_at !== null)
      .map(s => s.session_template_id)
  );

  // Find first session that hasn't been completed yet (in sequence order)
  const nextSession = sessions
    .sort((a, b) => a.sequence_order - b.sequence_order)
    .find(s => !completedTemplateIds.has(s.id));

  // If all sessions completed at least once, return first session (cycle through)
  return nextSession?.name || sessions[0]?.name || null;
};

export default function PlansListDashboard({ plans }: PlansListDashboardProps) {
  const insets = useSafeAreaInsets();

  const handlePlanPress = (planId: number) => {
    router.push(`/workout/${planId}`);
  };

  const handleGenerateNewPlan = () => {
    router.push("/wizard/frequency");
  };

  // Format current date like "Monday, Oct 24"
  const formatCurrentDate = () => {
    const now = new Date();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
    const monthDay = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${dayName}, ${monthDay}`;
  };

  // Get completed sessions count for this month
  const getCompletedThisMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
    const sessions = getCompletedSessionsByDateRange(startOfMonth, endOfMonth);
    return sessions.filter((s) => s.completed_at !== null).length;
  };

  const completedThisMonth = getCompletedThisMonth();

  // Format plan subtitle: "description • X days/week" or just "X days/week"
  const formatPlanSubtitle = (plan: WorkoutPlan) => {
    const frequency = `${plan.weekly_frequency} days/week`;
    if (plan.description) {
      return `${plan.description} • ${frequency}`;
    }
    return frequency;
  };

  // Format plan title: "[Goal] [Frequency]" e.g., "Balanced 3x/week"
  const formatPlanTitle = (plan: WorkoutPlan) => {
    const focus = plan.focus || "Balanced"; // Default to Balanced for backward compatibility
    return `${focus} ${plan.weekly_frequency}x/week`;
  };

  // Format equipment list: "Dumbbell, Barbell"
  const formatEquipment = (plan: WorkoutPlan) => {
    if (!plan.equipment_used || plan.equipment_used.length === 0) {
      return "No equipment";
    }
    return plan.equipment_used.join(", ");
  };

  return (
    <View className="flex-1 bg-background-dark">
      {/* Header */}
      <View 
        className="px-6 pt-8 pb-4"
        style={{ paddingTop: insets.top + 32 }}
      >
        <Text className="text-3xl font-bold tracking-tight text-white">
          Your workout plans
        </Text>
        <Text className="text-sm text-gray-400">
          {formatCurrentDate()}
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Plan Cards */}
        <View className="gap-4 mb-6">
          {plans.map((plan) => {
            const focus = plan.focus || "Balanced"; // Default to Balanced for backward compatibility
            const goalIcon = getGoalIcon(focus);
            const nextSession = getNextSessionName(plan);
            
            return (
              <Pressable
                key={plan.id}
                onPress={() => handlePlanPress(plan.id)}
                className="bg-surface-dark rounded-3xl p-5 border border-white/5 active:scale-[0.99]"
                accessibilityRole="button"
                accessibilityLabel={`View ${plan.name}`}
              >
                <View className="flex-row gap-4 items-center">
                  {/* Icon Area */}
                  <View 
                    className="size-20 rounded-2xl items-center justify-center overflow-hidden border border-white/10"
                    style={{ backgroundColor: 'rgba(19, 236, 109, 0.15)' }}
                  >
                    {/* Decorative background elements */}
                    <View className="absolute inset-0 items-center justify-center opacity-40">
                      <View className="absolute w-full h-1 rotate-45" style={{ backgroundColor: 'rgba(19, 236, 109, 0.4)' }} />
                      <View className="absolute w-full h-1 -rotate-45" style={{ backgroundColor: 'rgba(19, 236, 109, 0.4)' }} />
                      <View className="w-10 h-10 rounded-full border-2" style={{ borderColor: 'rgba(19, 236, 109, 0.3)' }} />
                    </View>
                    {goalIcon.type === 'material' ? (
                      <MaterialIcons name={goalIcon.name} size={32} color="#13ec6d" />
                    ) : (
                      <goalIcon.component size={32} color="#13ec6d" />
                    )}
                  </View>

                  {/* Plan Info */}
                  <View className="flex-1 min-w-0">
                    <Text 
                      className="text-xl font-bold text-white mb-1"
                      numberOfLines={1}
                    >
                      {formatPlanTitle(plan)}
                    </Text>
                    <Text 
                      className="text-sm text-gray-400 mb-0.5"
                      numberOfLines={1}
                    >
                      {formatEquipment(plan)}
                    </Text>
                    {nextSession && (
                      <Text 
                        className="text-sm text-gray-400"
                        numberOfLines={1}
                      >
                        Next up: {nextSession}
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Stats Section */}
        <View className="bg-surface-dark p-6 rounded-2xl border border-white/5 items-center mb-6">
          <View className="flex-row items-center gap-2 mb-2">
            <MaterialIcons name="local-fire-department" size={24} color="#13ec6d" />
            <Text className="text-xs font-medium uppercase tracking-widest text-gray-400">
              Workouts Completed
            </Text>
          </View>
          <Text className="text-4xl font-bold text-white">
            {completedThisMonth}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            This month's progress
          </Text>
        </View>

        {/* Add New Plan Button - matches EmptyStateDashboard style */}
        <Pressable
          onPress={handleGenerateNewPlan}
          className="w-full rounded-2xl bg-primary p-5 active:scale-[0.98]"
          style={{
            shadowColor: '#13ec6d',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 8,
          }}
          accessibilityRole="button"
          accessibilityLabel="Generate new workout plan"
        >
          <View className="flex-row items-center justify-center gap-2">
            <MaterialIcons name="add-circle" size={28} color="#102218" />
            <Text className="text-lg font-bold text-background-dark">
              Generate new workout plan
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}
