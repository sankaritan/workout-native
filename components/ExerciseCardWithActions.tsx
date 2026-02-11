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
import { theme } from "@/constants/theme";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { MuscleGroupBadges } from "@/components/ui/MuscleGroupBadges";

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
  /** Whether to render swap/remove action buttons */
  showActions?: boolean;
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
  showActions = true,
  testID,
}: ExerciseCardWithActionsProps) {
  return (
    <View
      testID={testID}
      className="flex-row items-start bg-surface-dark rounded-xl p-3 mb-2"
    >
      {/* Exercise Info */}
      <View className={cn("flex-1", showActions && "mr-2")}>
        <View className="flex-row items-start justify-between mb-1">
          <Text className="text-white font-semibold flex-1 mr-2">
            {exercise.name}
          </Text>
          {/* Priority Tier Badge - Top Right */}
          <PriorityBadge priority={exercise.priority} />
        </View>
        <Text className="text-xs text-gray-400 mb-1">
          {exercise.equipment_required || "Bodyweight"}
        </Text>

        {/* Muscle Group Badges */}
        {showMuscleGroupBadges && (
          <MuscleGroupBadges className="mt-1" muscles={exercise.muscle_groups} />
        )}
      </View>

      {/* Action Buttons */}
      {showActions && (
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
      )}
    </View>
  );
}
