/**
 * SetTracker Component
 * Tracks sets, reps, and weight for an exercise during workout
 */

import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "@/lib/utils/cn";

export interface SetData {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  isCompleted: boolean;
  isWarmup?: boolean;
}

export interface SetTrackerProps {
  /** Target number of sets from template */
  targetSets: number;
  /** Target reps from template */
  targetReps: number;
  /** Previous performance data for placeholders */
  previousWeight?: number;
  previousReps?: number;
  /** Callback when set data changes */
  onSetsChange: (sets: SetData[]) => void;
  /** Test ID */
  testID?: string;
}

export function SetTracker({
  targetSets,
  targetReps,
  previousWeight,
  previousReps,
  onSetsChange,
  testID,
}: SetTrackerProps) {
  // Initialize sets state
  const [sets, setSets] = useState<SetData[]>(() =>
    Array.from({ length: targetSets }, (_, i) => ({
      setNumber: i + 1,
      weight: null,
      reps: null,
      isCompleted: false,
      isWarmup: false,
    }))
  );

  // Notify parent of changes
  useEffect(() => {
    onSetsChange(sets);
  }, [sets, onSetsChange]);

  // Find current active set (first incomplete)
  const activeSetIndex = sets.findIndex((s) => !s.isCompleted);

  /**
   * Update set data
   */
  const updateSet = (
    index: number,
    field: keyof SetData,
    value: number | boolean | null
  ) => {
    setSets((prev) =>
      prev.map((set, i) =>
        i === index ? { ...set, [field]: value } : set
      )
    );
  };

  /**
   * Add a new set
   */
  const addSet = () => {
    setSets((prev) => [
      ...prev,
      {
        setNumber: prev.length + 1,
        weight: null,
        reps: null,
        isCompleted: false,
        isWarmup: false,
      },
    ]);
  };

  return (
    <View testID={testID} className="gap-2">
      {/* Header Row */}
      <View className="grid grid-cols-[50px_1fr_80px_80px_50px] gap-3 px-2">
        <Text className="text-[10px] uppercase tracking-wider font-bold text-text-muted text-center">
          Set
        </Text>
        <Text className="text-[10px] uppercase tracking-wider font-bold text-text-muted text-left pl-2">
          Previous
        </Text>
        <Text className="text-[10px] uppercase tracking-wider font-bold text-text-muted text-center">
          lbs
        </Text>
        <Text className="text-[10px] uppercase tracking-wider font-bold text-text-muted text-center">
          Reps
        </Text>
        <Text className="text-[10px] uppercase tracking-wider font-bold text-text-muted text-center">
          Done
        </Text>
      </View>

      {/* Set Rows */}
      {sets.map((set, index) => {
        const isActive = index === activeSetIndex;
        const isCompleted = set.isCompleted;
        const isFuture = index > activeSetIndex && activeSetIndex !== -1;

        // Format previous performance text
        const prevText =
          previousWeight && previousReps
            ? `${previousWeight} × ${previousReps}`
            : "—";

        return (
          <View
            key={set.setNumber}
            className={cn(
              "grid grid-cols-[50px_1fr_80px_80px_50px] gap-3 rounded-lg p-3 items-center",
              isCompleted && "bg-surface-dark/40 opacity-60",
              isActive && "bg-surface-dark border border-primary/40 shadow-lg",
              isFuture && "bg-surface-dark/20",
              !isActive && !isCompleted && !isFuture && "bg-surface-dark/20"
            )}
            testID={`set-row-${set.setNumber}`}
          >
            {/* Set Number */}
            <View className="flex flex-col items-center justify-center">
              <Text
                className={cn(
                  "font-bold",
                  isActive && "text-lg text-white",
                  isCompleted && "text-sm text-white/50",
                  isFuture && "text-sm text-white/70"
                )}
              >
                {set.setNumber}
              </Text>
              {set.isWarmup && (
                <Text className="text-[9px] text-primary uppercase">Warm</Text>
              )}
            </View>

            {/* Previous Performance */}
            <Text
              className={cn(
                "text-sm pl-2",
                isCompleted && "text-white/50",
                isActive && "text-text-muted font-medium",
                isFuture && "text-white/50"
              )}
            >
              {prevText}
            </Text>

            {/* Weight Input */}
            <TextInput
              value={set.weight?.toString() || ""}
              onChangeText={(text) => {
                const num = text ? parseFloat(text) : null;
                updateSet(index, "weight", num);
              }}
              placeholder={previousWeight?.toString() || "-"}
              placeholderTextColor={isActive ? "#ffffff33" : "#ffffff20"}
              keyboardType="numeric"
              editable={!isCompleted}
              testID={`weight-input-${set.setNumber}`}
              className={cn(
                "h-10 rounded border text-center font-medium text-base p-0",
                isCompleted && "bg-[#111814] border-border text-white/50",
                isActive && "h-12 bg-[#111814] border-border-light text-white font-bold text-lg",
                isFuture && "bg-transparent border-border text-white/70"
              )}
            />

            {/* Reps Input */}
            <TextInput
              value={set.reps?.toString() || ""}
              onChangeText={(text) => {
                const num = text ? parseInt(text, 10) : null;
                updateSet(index, "reps", num);
              }}
              placeholder={previousReps?.toString() || "-"}
              placeholderTextColor={isActive ? "#ffffff33" : "#ffffff20"}
              keyboardType="number-pad"
              editable={!isCompleted}
              testID={`reps-input-${set.setNumber}`}
              className={cn(
                "h-10 rounded border text-center font-medium text-base p-0",
                isCompleted && "bg-[#111814] border-border text-white/50",
                isActive && "h-12 bg-[#111814] border-border-light text-white font-bold text-lg",
                isFuture && "bg-transparent border-border text-white/70"
              )}
            />

            {/* Completed Checkbox */}
            <View className="flex items-center justify-center">
              {isCompleted ? (
                <MaterialIcons name="check-circle" size={20} color="#13ec6d" />
              ) : (
                <Pressable
                  onPress={() => {
                    if (set.weight !== null && set.reps !== null) {
                      updateSet(index, "isCompleted", true);
                    }
                  }}
                  disabled={set.weight === null || set.reps === null}
                  testID={`complete-checkbox-${set.setNumber}`}
                  className={cn(
                    "h-6 w-6 rounded border items-center justify-center",
                    isActive ? "border-border-light" : "border-border",
                    set.weight === null || set.reps === null ? "opacity-30" : "opacity-100"
                  )}
                >
                  {set.weight !== null && set.reps !== null && (
                    <MaterialIcons name="check" size={16} color="#13ec6d" />
                  )}
                </Pressable>
              )}
            </View>
          </View>
        );
      })}

      {/* Add Set Button */}
      <Pressable
        onPress={addSet}
        testID="add-set-button"
        className="flex-row items-center justify-center gap-2 py-3 mt-2 rounded-lg border border-dashed border-border-light text-text-muted active:text-white active:border-primary/50 active:bg-surface-dark"
      >
        <MaterialIcons name="add" size={18} color="#9db9a8" />
        <Text className="text-sm font-medium text-text-muted">Add Set</Text>
      </Pressable>
    </View>
  );
}
