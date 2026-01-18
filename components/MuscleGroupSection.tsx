/**
 * MuscleGroupSection Component
 * Displays a collapsible section with exercises for a muscle group
 * Used in the exercise review step of the wizard
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ExerciseCardWithActions } from "./ExerciseCardWithActions";
import type { Exercise, MuscleGroup } from "@/lib/storage/types";

export interface MuscleGroupSectionProps {
  /** The muscle group name */
  muscleGroup: MuscleGroup;
  /** Exercises for this muscle group */
  exercises: Exercise[];
  /** Callback when swap button is pressed for an exercise */
  onSwap: (exerciseId: number) => void;
  /** Callback when remove button is pressed for an exercise */
  onRemove: (exerciseId: number) => void;
  /** Callback when add exercise button is pressed */
  onAdd: () => void;
  /** Whether the add button is enabled (false when 5 exercises) */
  canAdd: boolean;
  /** Optional testID for testing */
  testID?: string;
}

/**
 * MuscleGroupSection Component
 * Shows section header with count, exercise cards, and add button
 */
export function MuscleGroupSection({
  muscleGroup,
  exercises,
  onSwap,
  onRemove,
  onAdd,
  canAdd,
  testID,
}: MuscleGroupSectionProps) {
  // Can only remove if there's more than one exercise
  const canRemoveExercise = exercises.length > 1;

  return (
    <View testID={testID} className="mb-6">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-bold text-white">
            {muscleGroup}
          </Text>
          <Text className="text-gray-400">
            ({exercises.length})
          </Text>
        </View>
      </View>

      {/* Exercise Cards */}
      {exercises.map((exercise) => (
        <ExerciseCardWithActions
          key={exercise.id}
          exercise={exercise}
          onSwap={() => onSwap(exercise.id)}
          onRemove={() => onRemove(exercise.id)}
          canRemove={canRemoveExercise}
        />
      ))}

      {/* Add Exercise Button */}
      {canAdd && (
        <Pressable
          onPress={onAdd}
          className="flex-row items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-gray-600 active:bg-white/5"
        >
          <MaterialIcons name="add" size={20} color="#6b8779" />
          <Text className="text-gray-400 font-medium">
            Add Exercise
          </Text>
        </Pressable>
      )}
    </View>
  );
}
