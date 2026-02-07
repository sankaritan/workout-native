/**
 * PriorityBadge
 * Shows compound/isolated priority label
 */

import React from "react";
import { Text, View } from "react-native";
import { cn } from "@/lib/utils/cn";
import {
  EXERCISE_PRIORITY_BADGES,
  EXERCISE_PRIORITY_LABELS,
  type ExercisePriority,
} from "@/lib/storage/types";

export interface PriorityBadgeProps {
  priority: ExercisePriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <View
      className={cn(
        "px-2.5 py-1 rounded-full border",
        EXERCISE_PRIORITY_BADGES[priority].border,
        EXERCISE_PRIORITY_BADGES[priority].background
      )}
    >
      <Text
        className={cn(
          "text-xs font-medium uppercase",
          EXERCISE_PRIORITY_BADGES[priority].text
        )}
      >
        {EXERCISE_PRIORITY_LABELS[priority]}
      </Text>
    </View>
  );
}
