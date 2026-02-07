/**
 * Exercise List Item Component
 * Displays a single exercise with sets, reps, and details
 */

import React from "react";
import { View, Text } from "react-native";
import type { ProgramExercise } from "@/lib/workout-generator/types";
import { ExerciseInfoRow } from "@/components/ui/ExerciseInfoRow";
import { SetsRepsBadge } from "@/components/ui/SetsRepsBadge";

export interface ExerciseListItemProps {
  exercise: ProgramExercise;
}

export function ExerciseListItem({ exercise }: ExerciseListItemProps) {
  return (
    <View className="flex-row items-center bg-white/5 rounded-lg p-3">
      {/* Order Number */}
      <View className="bg-white/10 rounded-full size-8 items-center justify-center mr-3">
        <Text className="text-white font-bold text-sm">
          {exercise.order}
        </Text>
      </View>

      {/* Exercise Info */}
      <ExerciseInfoRow className="flex-1" exercise={exercise.exercise} />

      {/* Sets × Reps */}
      <SetsRepsBadge sets={exercise.sets} repsMin={exercise.repsMin} repsMax={exercise.repsMax} />
    </View>
  );
}
