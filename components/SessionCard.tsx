/**
 * Session Card Component
 * Expandable card showing workout session details
 */

import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ExerciseListItem } from "./ExerciseListItem";
import type { ProgramSession } from "@/lib/workout-generator/types";

export interface SessionCardProps {
  session: ProgramSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const exerciseCount = session.exercises.length;
  const exerciseText = exerciseCount === 1 ? "exercise" : "exercises";

  return (
    <View className="mb-4">
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        testID="session-card"
        className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-slate-200 dark:border-white/10"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <View className="bg-primary/20 rounded-full px-3 py-1 mr-3">
              <Text className="text-primary font-bold text-xs">
                Day {session.dayOfWeek}
              </Text>
            </View>
            <Text className="text-lg font-bold text-slate-900 dark:text-white flex-1">
              {session.name}
            </Text>
          </View>

          {/* Expand/Collapse Icon */}
          <MaterialIcons
            name={isExpanded ? "expand-less" : "expand-more"}
            size={24}
            color="#9db9a8"
          />
        </View>

        {/* Exercise Count */}
        <Text className="text-sm text-slate-500 dark:text-slate-400">
          {exerciseCount} {exerciseText}
        </Text>

        {/* Expanded Exercise List */}
        {isExpanded && (
          <View className="mt-4 gap-2">
            {session.exercises.map((exercise, idx) => (
              <ExerciseListItem key={idx} exercise={exercise} />
            ))}
          </View>
        )}
      </Pressable>
    </View>
  );
}
