/**
 * Add Exercise Screen
 * Unified full-screen picker to add exercises with muscle group filters
 */

import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CancelButton } from "@/components/CancelButton";
import { useWizard } from "@/lib/wizard-context";
import { ExercisePickerItem } from "@/components/ExercisePickerItem";
import { FilterPill } from "@/components/ui/FilterPill";
import { getAllExercises } from "@/lib/storage/storage";
import { filterExercisesByEquipment, filterExercisesByMuscleGroups } from "@/lib/workout-generator/exercise-selector";
import type { Exercise, MuscleGroup } from "@/lib/storage/types";

// All muscle groups for filtering
const MUSCLE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];

// Maximum total exercises
const MAX_EXERCISES = 20;

export default function AddExerciseScreen() {
  const insets = useSafeAreaInsets();
  const { state, updateState } = useWizard();

  // Filter state
  const [selectedMuscleFilters, setSelectedMuscleFilters] = useState<MuscleGroup[]>([]);

  const customExercises = state.customExercises || [];

  // Check if at max limit
  const isAtMaxLimit = customExercises.length >= MAX_EXERCISES;

  // Get available exercises for adding
  const availableExercises = useMemo(() => {
    if (isAtMaxLimit) return [];

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
  }, [state.equipment, customExercises, selectedMuscleFilters, isAtMaxLimit]);

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
   * Handle exercise selection - add and go back
   */
  const handleSelectExercise = (exercise: Exercise) => {
    if (isAtMaxLimit) return;

    // Add to flat array
    const updated = [...customExercises, exercise];
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
              Add Exercise
            </Text>
            <Text className="text-gray-400 mt-1">
              {customExercises.length}/{MAX_EXERCISES} exercises selected
            </Text>
          </View>

          {/* Close button */}
          <CancelButton 
            onPress={handleClose} 
            testID="close-button"
            accessibilityLabel="Close"
            label="Close"
          />
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
        {isAtMaxLimit ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="block" size={48} color="#6b8779" />
            <Text className="text-gray-400 text-center mt-4">
              Maximum of {MAX_EXERCISES} exercises reached.
            </Text>
            <Text className="text-gray-500 text-center text-sm mt-2">
              Remove an exercise to add a new one.
            </Text>
          </View>
        ) : availableExercises.length === 0 ? (
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
