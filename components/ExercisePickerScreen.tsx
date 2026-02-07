/**
 * ExercisePickerScreen
 * Shared full-screen exercise picker with filters
 */

import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CancelButton } from "@/components/CancelButton";
import { ExercisePickerItem } from "@/components/ExercisePickerItem";
import { FilterPill } from "@/components/ui/FilterPill";
import { getAllExercises } from "@/lib/storage/storage";
import { filterExercisesByEquipment, filterExercisesByMuscleGroups } from "@/lib/workout-generator/exercise-selector";
import type { Exercise, Equipment, MuscleGroup } from "@/lib/storage/types";

const MUSCLE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];

export interface ExercisePickerScreenProps {
  title: string;
  subtitle?: string;
  equipment?: Equipment[] | null;
  excludedExerciseIds?: number[];
  initialMuscleFilters?: MuscleGroup[];
  showAllPill?: boolean;
  maxLimitReached?: boolean;
  maxLimitTitle?: string;
  maxLimitDescription?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onSelectExercise: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExercisePickerScreen({
  title,
  subtitle,
  equipment,
  excludedExerciseIds,
  initialMuscleFilters,
  showAllPill = false,
  maxLimitReached = false,
  maxLimitTitle,
  maxLimitDescription,
  emptyTitle,
  emptyDescription,
  onSelectExercise,
  onClose,
}: ExercisePickerScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedMuscleFilters, setSelectedMuscleFilters] = useState<MuscleGroup[]>([]);

  useEffect(() => {
    if (initialMuscleFilters && initialMuscleFilters.length > 0 && selectedMuscleFilters.length === 0) {
      setSelectedMuscleFilters(initialMuscleFilters);
    }
  }, [initialMuscleFilters, selectedMuscleFilters.length]);

  const availableExercises = useMemo(() => {
    if (maxLimitReached) return [];

    const allExercises = getAllExercises();

    const equipmentFiltered = equipment
      ? filterExercisesByEquipment(allExercises, equipment)
      : allExercises;

    let filtered = equipmentFiltered;
    if (selectedMuscleFilters.length > 0) {
      filtered = filterExercisesByMuscleGroups(filtered, selectedMuscleFilters);
    }

    if (excludedExerciseIds && excludedExerciseIds.length > 0) {
      const excludedSet = new Set(excludedExerciseIds);
      filtered = filtered.filter((exercise) => !excludedSet.has(exercise.id));
    }

    return filtered.sort((a, b) => {
      if (selectedMuscleFilters.length > 0) {
        const aPrimaryMatch = selectedMuscleFilters.includes(a.muscle_groups[0]);
        const bPrimaryMatch = selectedMuscleFilters.includes(b.muscle_groups[0]);

        if (aPrimaryMatch && !bPrimaryMatch) return -1;
        if (!aPrimaryMatch && bPrimaryMatch) return 1;
      }

      if (a.priority !== b.priority) return a.priority - b.priority;

      return a.name.localeCompare(b.name);
    });
  }, [equipment, excludedExerciseIds, selectedMuscleFilters, maxLimitReached]);

  const toggleMuscleFilter = (muscle: MuscleGroup) => {
    setSelectedMuscleFilters((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    );
  };

  const emptyTitleText = emptyTitle || "No exercises available with the selected filters.";
  const emptyDescriptionText = emptyDescription || "Try adjusting your filters or equipment selection.";

  return (
    <View className="flex-1 bg-background-dark w-full">
      <View
        className="bg-background-dark px-4 pb-4 border-b border-white/5 w-full"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">
              {title}
            </Text>
            {subtitle ? (
              <Text className="text-gray-400 mt-1">
                {subtitle}
              </Text>
            ) : null}
          </View>

          <CancelButton
            onPress={onClose}
            testID="close-button"
            accessibilityLabel="Close"
            label="Close"
          />
        </View>

        <View className="flex-row flex-wrap gap-2">
          {MUSCLE_GROUPS.map((muscle) => (
            <FilterPill
              key={muscle}
              label={muscle}
              selected={selectedMuscleFilters.includes(muscle)}
              onToggle={() => toggleMuscleFilter(muscle)}
            />
          ))}
          {showAllPill ? (
            <FilterPill
              label="All"
              selected={selectedMuscleFilters.length === 0}
              onToggle={() => setSelectedMuscleFilters([])}
            />
          ) : null}
        </View>
      </View>

      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {maxLimitReached ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="block" size={48} color="#6b8779" />
            <Text className="text-gray-400 text-center mt-4">
              {maxLimitTitle || "Maximum exercises reached."}
            </Text>
            {maxLimitDescription ? (
              <Text className="text-gray-500 text-center text-sm mt-2">
                {maxLimitDescription}
              </Text>
            ) : null}
          </View>
        ) : availableExercises.length === 0 ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="search-off" size={48} color="#6b8779" />
            <Text className="text-gray-400 text-center mt-4">
              {emptyTitleText}
            </Text>
            <Text className="text-gray-500 text-center text-sm mt-2">
              {emptyDescriptionText}
            </Text>
          </View>
        ) : (
          availableExercises.map((exercise) => (
            <ExercisePickerItem
              key={exercise.id}
              exercise={exercise}
              onPress={() => onSelectExercise(exercise)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
