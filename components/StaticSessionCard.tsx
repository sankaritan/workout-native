/**
 * Static Session Card Component
 * Non-collapsible card showing workout session with draggable exercises
 * Used in Step 5 (Review) for drag-and-drop reordering
 */

import React from "react";
import { View, Text } from "react-native";
import { DraggableExerciseItem } from "./DraggableExerciseItem";
import type { ProgramSession, ProgramExercise } from "@/lib/workout-generator/types";

export interface StaticSessionCardProps {
  /** The session to display */
  session: ProgramSession;
  /** Optional ascending day number (1, 2, 3, etc.) */
  dayNumber?: number;
  /** Session index for navigation to swap screen */
  sessionIndex: number;
  /** Callback when swap button is pressed for an exercise */
  onSwapExercise: (sessionIndex: number, exerciseIndex: number) => void;
  /** Render item function that receives drag callbacks from SortableList */
  renderExercise?: (
    exercise: ProgramExercise,
    exerciseIndex: number,
    drag?: () => void,
    isActive?: boolean
  ) => React.ReactNode;
}

/**
 * StaticSessionCard Component
 * Always shows exercises (no expand/collapse)
 * Supports drag-and-drop reordering via renderExercise prop
 */
export function StaticSessionCard({
  session,
  dayNumber,
  sessionIndex,
  onSwapExercise,
  renderExercise,
}: StaticSessionCardProps) {
  const exerciseCount = session.exercises.length;
  const exerciseText = exerciseCount === 1 ? "exercise" : "exercises";

  // Use dayNumber if provided, otherwise fall back to dayOfWeek
  const displayDay = dayNumber ?? session.dayOfWeek;

  return (
    <View className="mb-4">
      <View className="bg-surface-dark rounded-2xl p-4 border border-white/10">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <View className="bg-primary/20 rounded-full px-3 py-1 mr-3">
              <Text className="text-primary font-bold text-xs">
                Day {displayDay}
              </Text>
            </View>
            <Text className="text-lg font-bold text-white flex-1">
              {session.name}
            </Text>
          </View>
        </View>

        {/* Exercise Count */}
        <Text className="text-sm text-gray-400 mb-4">
          {exerciseCount} {exerciseText}
        </Text>

        {/* Exercise List - Always Visible */}
        <View>
          {session.exercises.map((exercise, idx) => {
            // If custom renderExercise provided (for drag-drop), use it
            if (renderExercise) {
              return (
                <View key={idx}>
                  {renderExercise(exercise, idx)}
                </View>
              );
            }

            // Otherwise use default DraggableExerciseItem
            return (
              <DraggableExerciseItem
                key={idx}
                exercise={exercise}
                onSwap={() => onSwapExercise(sessionIndex, idx)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}
