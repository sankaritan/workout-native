/**
 * MuscleGroupBadges
 * Shows primary + secondary muscle group badges
 */

import React from "react";
import { Text, View } from "react-native";
import { cn } from "@/lib/utils/cn";
import type { MuscleGroup } from "@/lib/storage/types";

export interface MuscleGroupBadgesProps {
  muscles: MuscleGroup[];
  className?: string;
}

export function MuscleGroupBadges({ muscles, className }: MuscleGroupBadgesProps) {
  return (
    <View className={cn("flex-row gap-1 flex-wrap", className)}>
      {muscles.map((muscle, idx) => (
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
  );
}
