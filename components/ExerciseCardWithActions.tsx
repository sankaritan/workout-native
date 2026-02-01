/**
 * ExerciseCardWithActions Component
 * Displays an exercise with swap and remove action buttons
 * Used in the exercise review step of the wizard
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

export interface ExerciseCardWithActionsProps {
  /** The exercise to display */
  exercise: Exercise;
  /** Callback when swap button is pressed */
  onSwap: () => void;
  /** Callback when remove button is pressed */
  onRemove: () => void;
  /** Whether the remove button is enabled (false when only 1 exercise in group) */
  canRemove: boolean;
  /** Whether to show muscle group badges */
  showMuscleGroupBadges?: boolean;
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
  showMuscleGroupBadges = false,
  testID,
}: ExerciseCardWithActionsProps) {
  return (
    <View
      testID={testID}
      className="flex-row items-start bg-surface-dark rounded-xl p-3 mb-2"
    >
      {/* Exercise Info */}
      <View className="flex-1 mr-2">
        <View className="flex-row items-start justify-between mb-1">
          <Text className="text-white font-semibold flex-1 mr-2">
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
        <Text className="text-xs text-gray-400 mb-1">
          {exercise.equipment_required || "Bodyweight"}
        </Text>

        {/* Muscle Group Badges */}
        {showMuscleGroupBadges && (
          <View className="flex-row gap-1 mt-1 flex-wrap">
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
        )}
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
          <MaterialIcons name="swap-horiz" size={22} color={theme.colors.text.muted } />
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
            color={canRemove ? theme.colors.danger.DEFAULT : theme.colors.text.muted}
          />
        </Pressable>
      </View>
    </View>
  );
}
