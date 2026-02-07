/**
 * ExercisePickerItem Component
 * Displays an exercise option in the swap/add picker screens
 * Used in swap-exercise and add-exercise wizard screens
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { Exercise } from "@/lib/storage/types";
import { theme } from "@/constants/theme";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { MuscleGroupBadges } from "@/components/ui/MuscleGroupBadges";

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
          <PriorityBadge priority={exercise.priority} />
        </View>
        <Text className="text-sm text-gray-400 mb-1">
          {exercise.equipment_required || "Bodyweight"}
        </Text>

        {/* Muscle Group Badges */}
        <MuscleGroupBadges className="mb-1" muscles={exercise.muscle_groups} />

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
