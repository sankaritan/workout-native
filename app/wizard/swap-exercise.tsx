/**
 * Swap Exercise Screen
 * Full screen picker to swap an exercise for another in the same muscle group
 */

import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWizard } from "@/lib/wizard-context";
import { ExercisePickerItem } from "@/components/ExercisePickerItem";
import { getAllExercises } from "@/lib/storage/storage";
import { filterExercisesByEquipment, filterExercisesByMuscleGroup } from "@/lib/workout-generator/exercise-selector";
import type { Exercise, MuscleGroup } from "@/lib/storage/types";

export default function SwapExerciseScreen() {
  const insets = useSafeAreaInsets();
  const { state, updateState } = useWizard();
  const params = useLocalSearchParams<{ muscleGroup: MuscleGroup; exerciseId: string }>();

  const muscleGroup = params.muscleGroup;
  const currentExerciseId = parseInt(params.exerciseId, 10);

  // Get available exercises for swapping
  const availableExercises = useMemo(() => {
    const allExercises = getAllExercises();

    // Filter by equipment
    const equipmentFiltered = state.equipment
      ? filterExercisesByEquipment(allExercises, state.equipment)
      : allExercises;

    // Filter by muscle group
    const muscleFiltered = filterExercisesByMuscleGroup(equipmentFiltered, muscleGroup);

    // Get IDs of exercises already selected for this muscle group
    const selectedEntry = state.customExercises?.find((e) => e.muscleGroup === muscleGroup);
    const selectedIds = selectedEntry?.exercises.map((e) => e.id) || [];

    // Exclude the current exercise and already-selected exercises (except current)
    const filtered = muscleFiltered.filter((exercise) => {
      // Exclude current exercise
      if (exercise.id === currentExerciseId) return false;
      // Exclude already-selected exercises (but allow current exercise ID since we're swapping it)
      if (selectedIds.includes(exercise.id) && exercise.id !== currentExerciseId) return false;
      return true;
    });

    // Sort: compounds first
    return filtered.sort((a, b) => {
      if (a.is_compound && !b.is_compound) return -1;
      if (!a.is_compound && b.is_compound) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [state.equipment, state.customExercises, muscleGroup, currentExerciseId]);

  /**
   * Handle exercise selection - swap and go back
   */
  const handleSelectExercise = (exercise: Exercise) => {
    if (!state.customExercises) return;

    // Update the custom exercises, replacing the current exercise with the selected one
    const updated = state.customExercises.map((entry) => {
      if (entry.muscleGroup === muscleGroup) {
        return {
          ...entry,
          exercises: entry.exercises.map((e) =>
            e.id === currentExerciseId ? exercise : e
          ),
        };
      }
      return entry;
    });

    updateState({ customExercises: updated });
    router.back();
  };

  /**
   * Handle close button press
   */
  const handleClose = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-background-dark w-full">
      {/* Header */}
      <View
        className="bg-background-dark px-4 pb-4 border-b border-white/5 w-full"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between">
          {/* Title */}
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">
              Swap Exercise
            </Text>
            <Text className="text-gray-400 mt-1">
              Select a new {muscleGroup} exercise
            </Text>
          </View>

          {/* Close button */}
          <Pressable
            onPress={handleClose}
            className="flex size-10 items-center justify-center rounded-full active:bg-white/10"
            testID="close-button"
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <MaterialIcons name="close" size={24} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* Exercise List */}
      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {availableExercises.length === 0 ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="search-off" size={48} color="#6b8779" />
            <Text className="text-gray-400 text-center mt-4">
              No other exercises available for {muscleGroup} with your equipment.
            </Text>
          </View>
        ) : (
          availableExercises.map((exercise) => (
            <ExercisePickerItem
              key={exercise.id}
              exercise={exercise}
              onPress={() => handleSelectExercise(exercise)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
