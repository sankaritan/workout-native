/**
 * Exercise List Item Component
 * Displays a single exercise with sets, reps, and details
 */

import React from "react";
import { View, Text } from "react-native";
import type { ProgramExercise } from "@/lib/workout-generator/types";

export interface ExerciseListItemProps {
  exercise: ProgramExercise;
}

export function ExerciseListItem({ exercise }: ExerciseListItemProps) {
  return (
    <View className="flex-row items-center bg-slate-50 dark:bg-white/5 rounded-lg p-3">
      {/* Order Number */}
      <View className="bg-slate-200 dark:bg-white/10 rounded-full size-8 items-center justify-center mr-3">
        <Text className="text-slate-700 dark:text-white font-bold text-sm">
          {exercise.order}
        </Text>
      </View>

      {/* Exercise Info */}
      <View className="flex-1">
        <Text className="text-slate-900 dark:text-white font-semibold">
          {exercise.exercise.name}
        </Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400">
          {exercise.exercise.muscle_group} •{" "}
          {exercise.exercise.equipment_required || "Bodyweight"}
        </Text>
      </View>

      {/* Sets × Reps */}
      <View className="bg-primary/10 rounded-lg px-3 py-1.5">
        <Text className="text-primary font-bold text-sm">
          {exercise.sets} × {exercise.repsMin}-{exercise.repsMax}
        </Text>
      </View>
    </View>
  );
}
