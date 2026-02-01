/**
 * Workout Plan Card Component
 * Displays plan overview with key details
 */

import React from "react";
import { View, Text } from "react-native";
import type { WorkoutProgram } from "@/lib/workout-generator/types";

export interface WorkoutPlanCardProps {
  program: WorkoutProgram;
}

export function WorkoutPlanCard({ program }: WorkoutPlanCardProps) {
  const weekText = program.durationWeeks === 1 ? "week" : "weeks";

  return (
    <View className="bg-surface-dark rounded-2xl p-4 mb-4 border border-white/10">
      {/* Title (strip trailing ' (Nx/week)' if present) */}
      <Text className="text-xl font-bold text-white mb-3">
        {program.name.replace(/\s*\(\d+x\/week\)\s*$/i, "")}
      </Text>

      {/* Compact Stats Row - All in one line */}
      <View className="flex-row gap-2">
        {/* Frequency */}
        <View className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2">
          <Text className="text-primary font-bold text-sm">
            {program.sessionsPerWeek}x/week
          </Text>
        </View>

        {/* Duration */}
        <View className="bg-background-dark/50 border border-white/5 rounded-lg px-3 py-2">
          <Text className="text-white font-semibold text-sm">
            {program.durationWeeks} {weekText}
          </Text>
        </View>

        {/* Focus */}
        <View className="bg-background-dark/50 border border-white/5 rounded-lg px-3 py-2">
          <Text className="text-white font-semibold text-sm">
            {program.focus}
          </Text>
        </View>
      </View>
    </View>
  );
}
