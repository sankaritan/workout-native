/**
 * SetsRepsBadge
 */

import React from "react";
import { Text, View } from "react-native";
import { cn } from "@/lib/utils/cn";

export interface SetsRepsBadgeProps {
  sets: number;
  repsMin: number;
  repsMax: number;
  className?: string;
}

export function SetsRepsBadge({ sets, repsMin, repsMax, className }: SetsRepsBadgeProps) {
  return (
    <View className={cn("bg-primary/10 rounded-lg px-3 py-1.5", className)}>
      <Text className="text-primary font-bold text-sm">
        {sets} × {repsMin}-{repsMax}
      </Text>
    </View>
  );
}
