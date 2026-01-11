/**
 * Workout Plan Card Component
 * Displays plan overview with key details
 */

import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { WorkoutProgram } from "@/lib/workout-generator/types";

export interface WorkoutPlanCardProps {
  program: WorkoutProgram;
}

export function WorkoutPlanCard({ program }: WorkoutPlanCardProps) {
  const weekText = program.durationWeeks === 1 ? "week" : "weeks";

  return (
    <View className="bg-white dark:bg-surface-dark rounded-2xl p-6 mb-6 border border-slate-200 dark:border-white/10">
      {/* Program Name */}
      <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        {program.name}
      </Text>

      {/* Plan Details */}
      <View className="gap-3">
        {/* Duration */}
        <View className="flex-row items-center">
          <View className="bg-primary/20 rounded-full size-10 items-center justify-center mr-3">
            <MaterialIcons name="calendar-today" size={20} color="#13ec6d" />
          </View>
          <View>
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              Duration
            </Text>
            <Text className="text-base font-semibold text-slate-900 dark:text-white">
              {program.durationWeeks} {weekText}
            </Text>
          </View>
        </View>

        {/* Frequency */}
        <View className="flex-row items-center">
          <View className="bg-primary/20 rounded-full size-10 items-center justify-center mr-3">
            <MaterialIcons name="fitness-center" size={20} color="#13ec6d" />
          </View>
          <View>
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              Frequency
            </Text>
            <Text className="text-base font-semibold text-slate-900 dark:text-white">
              {program.sessionsPerWeek} sessions/week
            </Text>
          </View>
        </View>

        {/* Focus */}
        <View className="flex-row items-center">
          <View className="bg-primary/20 rounded-full size-10 items-center justify-center mr-3">
            <MaterialIcons name="trending-up" size={20} color="#13ec6d" />
          </View>
          <View>
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              Training Focus
            </Text>
            <Text className="text-base font-semibold text-slate-900 dark:text-white">
              {program.focus}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
