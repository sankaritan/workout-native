/**
 * ExerciseCardWithActions Component
 * Displays an exercise with swap and remove action buttons
 * Used in the exercise review step of the wizard
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "@/lib/utils/cn";
import type { Exercise } from "@/lib/storage/types";

export interface ExerciseCardWithActionsProps {
  /** The exercise to display */
  exercise: Exercise;
  /** Callback when swap button is pressed */
  onSwap: () => void;
  /** Callback when remove button is pressed */
  onRemove: () => void;
  /** Whether the remove button is enabled (false when only 1 exercise in group) */
  canRemove: boolean;
  /** Optional testID for testing */
  testID?: string;
}

/**
 * ExerciseCardWithActions Component
 * Shows exercise name, compound/isolated badge, equipment, and action buttons
 */
export function ExerciseCardWithActions({
  exercise,
  onSwap,
  onRemove,
  canRemove,
  testID,
}: ExerciseCardWithActionsProps) {
  return (
    <View
      testID={testID}
      className="flex-row items-center bg-surface-dark rounded-xl p-3 mb-2"
    >
      {/* Exercise Info */}
      <View className="flex-1 mr-2">
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="text-white font-semibold">
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
        <Text className="text-xs text-gray-400">
          {exercise.equipment_required || "Bodyweight"}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center gap-1">
        {/* Swap Button */}
        <Pressable
          testID="swap-button"
          onPress={onSwap}
          accessibilityLabel="Swap exercise"
          accessibilityRole="button"
          className="p-2 rounded-lg active:bg-white/10"
        >
          <MaterialIcons name="swap-horiz" size={22} color="#6b8779" />
        </Pressable>

        {/* Remove Button */}
        <Pressable
          testID="remove-button"
          onPress={canRemove ? onRemove : undefined}
          disabled={!canRemove}
          accessibilityLabel="Remove exercise"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canRemove }}
          className={cn(
            "p-2 rounded-lg active:bg-white/10",
            !canRemove && "opacity-30"
          )}
        >
          <MaterialIcons
            name="close"
            size={22}
            color={canRemove ? "#ef4444" : "#6b8779"}
          />
        </Pressable>
      </View>
    </View>
  );
}
