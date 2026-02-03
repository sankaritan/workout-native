/**
 * Review Swap Exercise Screen
 * Swap an exercise in the generated program (Step 5)
 * Similar to swap-exercise.tsx but operates on generatedProgram.sessions
 */

import React, { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
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

export default function ReviewSwapExerciseScreen() {
  const insets = useSafeAreaInsets();
  const { state, updateState } = useWizard();
  const params = useLocalSearchParams<{ sessionIndex: string; exerciseIndex: string }>();

  const sessionIndex = parseInt(params.sessionIndex, 10);
  const exerciseIndex = parseInt(params.exerciseIndex, 10);

  // Get current exercise from generatedProgram
  const currentExercise = useMemo(() => {
    if (!state.generatedProgram?.sessions[sessionIndex]) return undefined;
    const session = state.generatedProgram.sessions[sessionIndex];
    return session.exercises[exerciseIndex]?.exercise;
  }, [state.generatedProgram, sessionIndex, exerciseIndex]);

  // Get all exercises currently in the program (to exclude from swap options)
  const selectedExerciseIds = useMemo(() => {
    if (!state.generatedProgram?.sessions) return [];
    return state.generatedProgram.sessions.flatMap((session) =>
      session.exercises.map((ex) => ex.exercise.id)
    );
  }, [state.generatedProgram]);

  // Filter state - pre-select primary muscle group of current exercise
  const [selectedMuscleFilters, setSelectedMuscleFilters] = useState<MuscleGroup[]>([]);

  // Pre-select filter based on current exercise's primary muscle group
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
    if (currentExercise) {
      filtered = filtered.filter((exercise) => exercise.id !== currentExercise.id);
    }

    // Exclude already-selected exercises in the program
    filtered = filtered.filter((exercise) => !selectedExerciseIds.includes(exercise.id));

    // Sort: best matches first (primary muscle matches), then priority, then alphabetically
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
  }, [state.equipment, selectedMuscleFilters, currentExercise, selectedExerciseIds]);

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
   * Handle exercise selection - swap in generatedProgram and go back
   */
  const handleSelectExercise = (exercise: Exercise) => {
    if (!state.generatedProgram) return;

    // Clone the program
    const updatedProgram = {
      ...state.generatedProgram,
      sessions: state.generatedProgram.sessions.map((session, idx) => {
        if (idx !== sessionIndex) return session;

        // Update the specific exercise
        return {
          ...session,
          exercises: session.exercises.map((ex, exIdx) => {
            if (exIdx !== exerciseIndex) return ex;

            // Replace exercise, keep sets/reps the same
            return {
              ...ex,
              exercise: exercise,
            };
          }),
        };
      }),
    };

    updateState({ generatedProgram: updatedProgram });
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
