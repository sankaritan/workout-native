/**
 * ExerciseInfoRow
 * Shows exercise name + muscle group + equipment
 */

import React from "react";
import { Text, View } from "react-native";
import type { Exercise } from "@/lib/storage/types";

export interface ExerciseInfoRowProps {
  exercise: Exercise;
  className?: string;
}

export function ExerciseInfoRow({ exercise, className }: ExerciseInfoRowProps) {
  return (
    <View className={className}>
      <Text className="text-white font-semibold">
        {exercise.name}
      </Text>
      <Text className="text-xs text-gray-400">
        {exercise.muscle_group} • {exercise.equipment_required || "Bodyweight"}
      </Text>
    </View>
  );
}
