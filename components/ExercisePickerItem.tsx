/**
 * ExercisePickerItem Component
 * Displays an exercise option in the swap/add picker screens
 * Used in swap-exercise and add-exercise wizard screens
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "@/lib/utils/cn";
import {
  EXERCISE_PRIORITY_BADGES,
  EXERCISE_PRIORITY_LABELS,
  type Exercise,
} from "@/lib/storage/types";
import { theme } from "@/constants/theme";

export interface ExercisePickerItemProps {
  /** The exercise to display */
  exercise: Exercise;
  /** Callback when the item is pressed */
  onPress: () => void;
}

/**
 * ExercisePickerItem Component
 * Shows exercise name, compound/isolated badge, equipment, and description
 */
export function ExercisePickerItem({
  exercise,
  onPress,
}: ExercisePickerItemProps) {
  return (
    <Pressable
      testID={`exercise-picker-item-${exercise.id}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Select ${exercise.name}`}
      className="flex-row items-start bg-surface-dark rounded-xl p-4 mb-2 active:bg-surface-dark-highlight"
    >
      {/* Exercise Info */}
      <View className="flex-1">
        <View className="flex-row items-start justify-between mb-1">
          <Text className="text-white font-semibold text-base flex-1 mr-2">
            {exercise.name}
          </Text>
          {/* Priority Tier Badge - Top Right */}
          <View
            className={cn(
              "px-2.5 py-1 rounded-full border",
              EXERCISE_PRIORITY_BADGES[exercise.priority].border,
              EXERCISE_PRIORITY_BADGES[exercise.priority].background
            )}
          >
            <Text
              className={cn(
                "text-xs font-medium uppercase",
                EXERCISE_PRIORITY_BADGES[exercise.priority].text
              )}
            >
              {EXERCISE_PRIORITY_LABELS[exercise.priority]}
            </Text>
          </View>
        </View>
        <Text className="text-sm text-gray-400 mb-1">
          {exercise.equipment_required || "Bodyweight"}
        </Text>

        {/* Muscle Group Badges */}
        <View className="flex-row gap-1 mb-1 flex-wrap">
          {exercise.muscle_groups.map((muscle, idx) => (
            <View
              key={muscle}
              className={cn(
                "px-2 py-0.5 rounded",
                idx === 0 ? "bg-primary/30" : "bg-gray-600/30"
              )}
            >
              <Text
                className={cn(
                  "text-xs font-semibold",
                  idx === 0 ? "text-primary" : "text-gray-400"
                )}
              >
                {muscle}
              </Text>
            </View>
          ))}
        </View>

        {exercise.description && (
          <Text className="text-xs text-gray-500">
            {exercise.description}
          </Text>
        )}
      </View>

      {/* Chevron */}
      <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.muted } />
    </Pressable>
  );
}
