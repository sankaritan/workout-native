/**
 * SetTracker Component
 * Tracks sets, reps, and weight for an exercise during workout
 */

import { cn } from "@/lib/utils/cn";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState, memo } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { theme } from "@/constants/theme";

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
  /** Initial sets data (for returning to already-started exercise) */
  initialSets?: SetData[];
  /** Callback when set data changes */
  onSetsChange: (sets: SetData[]) => void;
  /** Test ID */
  testID?: string;
}

/**
 * SetTracker component - memoized to prevent unnecessary re-renders
 * Only re-renders when target values or initial sets change
 */
export const SetTracker = memo(function SetTracker({
  targetSets,
  targetReps,
  previousWeight,
  previousReps,
  initialSets,
  onSetsChange,
  testID,
}: SetTrackerProps) {
  // Track the last sets we notified parent about to prevent sync loop
  const lastNotifiedSets = React.useRef<SetData[] | undefined>(undefined);

  // Initialize sets state - use initialSets if provided, otherwise create empty sets
  // First set gets prefilled with previous exercise values
  const [sets, setSets] = useState<SetData[]>(() =>
    initialSets && initialSets.length > 0
      ? initialSets
      : Array.from({ length: targetSets }, (_, i) => ({
          setNumber: i + 1,
          weight: i === 0 ? (previousWeight ?? null) : null,
          reps: i === 0 ? (previousReps ?? null) : null,
          isCompleted: false,
          isWarmup: false,
        })),
  );

  // Update sets when initialSets changes (when navigating between exercises)
  // Only sync if initialSets is a different reference than what we last sent to parent
  useEffect(() => {
    if (
      initialSets &&
      initialSets.length > 0 &&
      initialSets !== lastNotifiedSets.current
    ) {
      setSets(initialSets);
    } else if (
      !initialSets ||
      (initialSets.length === 0 && initialSets !== lastNotifiedSets.current)
    ) {
      // Reset to empty sets for new exercise - first set gets prefilled with previous values
      setSets(
        Array.from({ length: targetSets }, (_, i) => ({
          setNumber: i + 1,
          weight: i === 0 ? (previousWeight ?? null) : null,
          reps: i === 0 ? (previousReps ?? null) : null,
          isCompleted: false,
          isWarmup: false,
        })),
      );
    }
  }, [initialSets, targetSets, previousWeight, previousReps]);

  // Notify parent of changes
  useEffect(() => {
    lastNotifiedSets.current = sets;
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
    value: number | boolean | null,
  ) => {
    setSets((prev) =>
      prev.map((set, i) => (i === index ? { ...set, [field]: value } : set)),
    );
  };

  /**
   * Complete a set and prefill the next set with current values
   */
  const completeSet = (index: number) => {
    setSets((prev) => {
      const currentSet = prev[index];
      if (currentSet.weight === null || currentSet.reps === null) {
        return prev;
      }

      return prev.map((set, i) => {
        if (i === index) {
          // Mark current set as completed
          return { ...set, isCompleted: true };
        } else if (i === index + 1 && !set.isCompleted) {
          // Prefill next set with current set's values (only if not already completed)
          return {
            ...set,
            weight: set.weight ?? currentSet.weight,
            reps: set.reps ?? currentSet.reps,
          };
        }
        return set;
      });
    });
  };

  /**
   * Adjust weight by delta (for +/- buttons)
   */
  const adjustWeight = (index: number, delta: number) => {
    setSets((prev) =>
      prev.map((set, i) => {
        if (i === index) {
          const currentWeight = set.weight ?? 0;
          const newWeight = Math.max(0, currentWeight + delta);
          return { ...set, weight: newWeight };
        }
        return set;
      }),
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
      <View className="flex-row items-center gap-2 px-2">
        <View style={{ width: 64 }}>
          <Text className="text-[10px] uppercase tracking-wider font-bold text-text-muted text-center">
            Adjust Wt
          </Text>
        </View>
        <View style={{ width: 80 }}>
          <Text className="text-[10px] uppercase tracking-wider font-bold text-text-muted text-center">
            lbs
          </Text>
        </View>
        <View style={{ width: 80 }}>
          <Text className="text-[10px] uppercase tracking-wider font-bold text-text-muted text-center">
            Reps
          </Text>
        </View>
        <View style={{ width: 50 }}>
          <Text className="text-[10px] uppercase tracking-wider font-bold text-text-muted text-center">
            Done
          </Text>
        </View>
      </View>

      {/* Set Rows */}
      {sets.map((set, index) => {
        const isActive = index === activeSetIndex;
        const isCompleted = set.isCompleted;
        const isFuture = index > activeSetIndex && activeSetIndex !== -1;

        return (
          <View
            key={set.setNumber}
            className={cn(
              "flex-row items-center gap-2 rounded-lg p-3",
              isCompleted && "bg-surface-dark/40 opacity-60",
              isActive && "bg-surface-dark border border-primary/40 shadow-lg",
              isFuture && "bg-surface-dark/20",
              !isActive && !isCompleted && !isFuture && "bg-surface-dark/20",
            )}
            testID={`set-row-${set.setNumber}`}
          >
            {/* +/- Weight Adjustment Buttons */}
            <View
              style={{ width: 64 }}
              className="flex-row items-center justify-center gap-1"
            >
              <Pressable
                onPress={() => adjustWeight(index, -5)}
                disabled={isCompleted}
                testID={`weight-minus-${set.setNumber}`}
                className={cn(
                  "h-8 w-8 rounded items-center justify-center",
                  isCompleted && "opacity-30",
                  isActive
                    ? "bg-surface-dark border border-border-light active:bg-primary/20"
                    : "bg-surface-dark/60 border border-border active:bg-surface-dark",
                )}
              >
                <MaterialIcons
                  name="remove"
                  size={18}
                  color={isActive ? theme.colors.text.secondary : theme.colors.text.muted}
                />
              </Pressable>
              <Pressable
                onPress={() => adjustWeight(index, 5)}
                disabled={isCompleted}
                testID={`weight-plus-${set.setNumber}`}
                className={cn(
                  "h-8 w-8 rounded items-center justify-center",
                  isCompleted && "opacity-30",
                  isActive
                    ? "bg-surface-dark border border-border-light active:bg-primary/20"
                    : "bg-surface-dark/60 border border-border active:bg-surface-dark",
                )}
              >
                <MaterialIcons
                  name="add"
                  size={18}
                  color={isActive ? theme.colors.text.secondary : theme.colors.text.muted}
                />
              </Pressable>
            </View>

            {/* Weight Input */}
            <View style={{ width: 80 }}>
              <TextInput
                value={set.weight?.toString() || ""}
                onChangeText={(text) => {
                  const num = text ? parseFloat(text) : null;
                  updateSet(index, "weight", num);
                }}
                placeholder="-"
                placeholderTextColor={isActive ? "#ffffff33" : "#ffffff20"}
                keyboardType="numeric"
                editable={!isCompleted}
                testID={`weight-input-${set.setNumber}`}
                className={cn(
                  "h-10 rounded border text-center font-medium text-base p-0",
                  isCompleted && "bg-[#111814] border-border text-white/50",
                  isActive &&
                    "h-12 bg-[#111814] border-border-light text-white font-bold text-lg",
                  isFuture && "bg-transparent border-border text-white/70",
                )}
              />
            </View>

            {/* Reps Input */}
            <View style={{ width: 80 }}>
              <TextInput
                value={set.reps?.toString() || ""}
                onChangeText={(text) => {
                  const num = text ? parseInt(text, 10) : null;
                  updateSet(index, "reps", num);
                }}
                placeholder="-"
                placeholderTextColor={isActive ? "#ffffff33" : "#ffffff20"}
                keyboardType="number-pad"
                editable={!isCompleted}
                testID={`reps-input-${set.setNumber}`}
                className={cn(
                  "h-10 rounded border text-center font-medium text-base p-0",
                  isCompleted && "bg-[#111814] border-border text-white/50",
                  isActive &&
                    "h-12 bg-[#111814] border-border-light text-white font-bold text-lg",
                  isFuture && "bg-transparent border-border text-white/70",
                )}
              />
            </View>

            {/* Completed Checkbox */}
            <View
              style={{ width: 50 }}
              className="flex items-center justify-center"
            >
              {isCompleted ? (
                <MaterialIcons name="check-circle" size={20} color={theme.colors.primary.DEFAULT } />
              ) : (
                <Pressable
                  onPress={() => completeSet(index)}
                  disabled={set.weight === null || set.reps === null}
                  testID={`complete-checkbox-${set.setNumber}`}
                  className={cn(
                    "h-6 w-6 rounded border items-center justify-center",
                    isActive ? "border-border-light" : "border-border",
                    set.weight === null || set.reps === null
                      ? "opacity-30"
                      : "opacity-100",
                  )}
                >
                  {set.weight !== null && set.reps !== null && (
                    <MaterialIcons name="check" size={16} color={theme.colors.primary.DEFAULT } />
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
        <MaterialIcons name="add" size={18} color={theme.colors.text.secondary } />
        <Text className="text-sm font-medium text-text-muted">Add Set</Text>
      </Pressable>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if these specific props change
  // Intentionally exclude onSetsChange callback from comparison
  return (
    prevProps.targetSets === nextProps.targetSets &&
    prevProps.targetReps === nextProps.targetReps &&
    prevProps.previousWeight === nextProps.previousWeight &&
    prevProps.previousReps === nextProps.previousReps &&
    prevProps.initialSets === nextProps.initialSets &&
    prevProps.testID === nextProps.testID
  );
});
