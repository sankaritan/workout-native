/**
 * ExercisePickerItem Component
 * Displays an exercise option in the swap/add picker screens
 * Used in swap-exercise and add-exercise wizard screens
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "@/lib/utils/cn";
import type { Exercise } from "@/lib/storage/types";

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
      className="flex-row items-center bg-surface-dark rounded-xl p-4 mb-2 active:bg-surface-dark-highlight"
    >
      {/* Exercise Info */}
      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="text-white font-semibold text-base">
            {exercise.name}
          </Text>
          {/* Compound/Isolated Badge */}
          <View
            className={cn(
              "px-2 py-0.5 rounded",
              exercise.is_compound ? "bg-primary/20" : "bg-gray-500/20"
            )}
          >
            <Text
              className={cn(
                "text-xs font-medium",
                exercise.is_compound ? "text-primary" : "text-gray-400"
              )}
            >
              {exercise.is_compound ? "Compound" : "Isolated"}
            </Text>
          </View>
        </View>
        <Text className="text-sm text-gray-400 mb-1">
          {exercise.equipment_required || "Bodyweight"}
        </Text>
        {exercise.description && (
          <Text className="text-xs text-gray-500">
            {exercise.description}
          </Text>
        )}
      </View>

      {/* Chevron */}
      <MaterialIcons name="chevron-right" size={24} color="#6b8779" />
    </Pressable>
  );
}
