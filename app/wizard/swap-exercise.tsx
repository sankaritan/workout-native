/**
 * Swap Exercise Screen
 * Unified full-screen picker to swap an exercise with muscle group filters
 */

import React, { useMemo, useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWizard } from "@/lib/wizard-context";
import { ExercisePickerItem } from "@/components/ExercisePickerItem";
import { FilterPill } from "@/components/ui/FilterPill";
import { getAllExercises } from "@/lib/storage/storage";
import { filterExercisesByEquipment, filterExercisesByMuscleGroups } from "@/lib/workout-generator/exercise-selector";
import type { Exercise, MuscleGroup } from "@/lib/storage/types";

// All muscle groups for filtering
const MUSCLE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];

export default function SwapExerciseScreen() {
  const insets = useSafeAreaInsets();
  const { state, updateState } = useWizard();
  const params = useLocalSearchParams<{ exerciseId: string }>();

  const currentExerciseId = parseInt(params.exerciseId, 10);
  const customExercises = state.customExercises || [];

  // Find the current exercise being swapped
  const currentExercise = useMemo(() => {
    return customExercises.find((e) => e.id === currentExerciseId);
  }, [customExercises, currentExerciseId]);

  // Filter state - pre-select primary muscle group of current exercise
  const [selectedMuscleFilters, setSelectedMuscleFilters] = useState<MuscleGroup[]>([]);

  // Pre-select filter based on current exercise's primary muscle group (first in muscle_groups array)
  useEffect(() => {
    if (currentExercise && currentExercise.muscle_groups.length > 0) {
      setSelectedMuscleFilters([currentExercise.muscle_groups[0]]);
    }
  }, [currentExercise]);

  // Get available exercises for swapping
  const availableExercises = useMemo(() => {
    const allExercises = getAllExercises();

    // Filter by equipment
    const equipmentFiltered = state.equipment
      ? filterExercisesByEquipment(allExercises, state.equipment)
      : allExercises;

    // Filter by selected muscle groups (if any)
    let filtered = equipmentFiltered;
    if (selectedMuscleFilters.length > 0) {
      filtered = filterExercisesByMuscleGroups(filtered, selectedMuscleFilters);
    }

    // Exclude the current exercise
    filtered = filtered.filter((exercise) => exercise.id !== currentExerciseId);

    // Exclude already-selected exercises
    const selectedIds = customExercises.map((e) => e.id);
    filtered = filtered.filter((exercise) => !selectedIds.includes(exercise.id));

    // Sort: best matches first (primary muscle matches), then secondary matches, then compound, then alphabetically
    return filtered.sort((a, b) => {
      // If filters are selected, prioritize primary muscle matches
      if (selectedMuscleFilters.length > 0) {
        const aPrimaryMatch = selectedMuscleFilters.includes(a.muscle_groups[0]);
        const bPrimaryMatch = selectedMuscleFilters.includes(b.muscle_groups[0]);

        if (aPrimaryMatch && !bPrimaryMatch) return -1;
        if (!aPrimaryMatch && bPrimaryMatch) return 1;
      }

      // Within same match level, priority order
      if (a.priority !== b.priority) return a.priority - b.priority;

      // Finally sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [state.equipment, customExercises, selectedMuscleFilters, currentExerciseId]);

  /**
   * Toggle muscle group filter
   */
  const toggleMuscleFilter = (muscle: MuscleGroup) => {
    setSelectedMuscleFilters((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    );
  };

  /**
   * Handle exercise selection - swap and go back
   */
  const handleSelectExercise = (exercise: Exercise) => {
    // Replace current exercise with selected exercise in flat array
    const updated = customExercises.map((e) =>
      e.id === currentExerciseId ? exercise : e
    );

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
        <View className="flex-row items-center justify-between mb-4">
          {/* Title */}
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">
              Swap Exercise
            </Text>
            <Text className="text-gray-400 mt-1">
              Replacing: {currentExercise?.name || "Unknown"}
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

        {/* Filter Pills */}
        <View className="flex-row flex-wrap gap-2">
          {MUSCLE_GROUPS.map((muscle) => (
            <FilterPill
              key={muscle}
              label={muscle}
              selected={selectedMuscleFilters.includes(muscle)}
              onToggle={() => toggleMuscleFilter(muscle)}
            />
          ))}
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
              No exercises available with the selected filters.
            </Text>
            <Text className="text-gray-500 text-center text-sm mt-2">
              Try adjusting your filters or equipment selection.
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
