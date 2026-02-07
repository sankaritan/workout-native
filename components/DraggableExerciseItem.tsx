/**
 * DraggableExerciseItem Component
 * Displays a draggable exercise item with drag handle and swap button
 * Used in Step 5 (Review) for reordering and editing exercises
 */

import React from "react";
import { View, Text, Pressable, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { ProgramExercise } from "@/lib/workout-generator/types";
import { theme } from "@/constants/theme";
import { cn } from "@/lib/utils/cn";
import { ExerciseInfoRow } from "@/components/ui/ExerciseInfoRow";
import { SetsRepsBadge } from "@/components/ui/SetsRepsBadge";

export interface DraggableExerciseItemProps {
  /** The exercise to display */
  exercise: ProgramExercise;
  /** Callback when swap button is pressed */
  onSwap: () => void;
  /** Drag callback from SortableList (native only) */
  drag?: () => void;
  /** Whether the item is currently being dragged */
  isActive?: boolean;
  /** Drag handle props from @dnd-kit (web only) */
  dragHandleProps?: any;
}

/**
 * DraggableExerciseItem Component
 * Shows exercise with drag handle, name, sets/reps, and swap button
 */
export function DraggableExerciseItem({
  exercise,
  onSwap,
  drag,
  isActive = false,
  dragHandleProps,
}: DraggableExerciseItemProps) {
  return (
    <View
      className={cn(
        "flex-row items-center bg-white/5 rounded-lg p-3 border mb-2",
        isActive ? "border-primary" : "border-transparent"
      )}
      style={{ opacity: isActive ? 0.8 : 1 }}
    >
      {/* Drag Handle - Left Side */}
      {Platform.OS === 'web' ? (
        // Web: Apply drag listeners to handle only
        <div style={styles.dragHandle} {...dragHandleProps}>
          <MaterialIcons name="drag-indicator" size={24} color={theme.colors.primary.DEFAULT} />
        </div>
      ) : (
        // Native: Use TouchableOpacity with long press
        <TouchableOpacity
          style={styles.dragHandle}
          onLongPress={drag}
          delayLongPress={100}
          activeOpacity={0.7}
          accessibilityLabel="Drag to reorder exercise"
          accessibilityRole="button"
        >
          <MaterialIcons name="drag-indicator" size={24} color={theme.colors.primary.DEFAULT} />
        </TouchableOpacity>
      )}

      {/* Exercise Info - Center */}
      <ExerciseInfoRow className="flex-1 ml-3 mr-3" exercise={exercise.exercise} />

      {/* Sets × Reps Badge */}
      <SetsRepsBadge className="mr-2" sets={exercise.sets} repsMin={exercise.repsMin} repsMax={exercise.repsMax} />

      {/* Swap Button - Right Side */}
      <Pressable
        onPress={onSwap}
        hitSlop={8}
        accessibilityLabel="Swap exercise"
        accessibilityRole="button"
        className="p-2 rounded-lg active:bg-white/10"
      >
        <MaterialIcons name="swap-horiz" size={22} color={theme.colors.text.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dragHandle: {
    padding: 4,
  },
});
