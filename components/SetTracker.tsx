/**
 * SetTracker Component
 * Tracks sets, reps, and weight for an exercise during workout
 * 
 * Note: Uses inline styles from setTrackerStyles instead of dynamic className
 * to avoid NativeWind/Reanimated timing issues on iOS. When state changes
 * trigger dynamic className updates, NativeWind's Reanimated integration
 * can cause navigation context errors. See lib/styles/setTracker.ts for details.
 */

import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { theme } from "@/constants/theme";
import { setTrackerStyles as styles } from "@/lib/styles/setTracker";

const weightToText = (weight: number | null) =>
  weight === null ? "" : weight.toString();
const decimalNumberPattern = /^\d*\.?\d*$/;
// Supports weight entries like 9999.99.
const maxWeightInputLength = 7;
const normalizeSets = (setsToNormalize: SetData[]) =>
  setsToNormalize.map((set) => ({
    ...set,
    weightText: set.weightText ?? weightToText(set.weight),
  }));
const createEmptySet = (setNumber: number): SetData => ({
  setNumber,
  weight: null,
  weightText: "",
  reps: null,
  isCompleted: false,
  isWarmup: false,
});
const createInitialSets = (
  targetSets: number,
  previousWeight?: number,
  previousReps?: number,
) =>
  Array.from({ length: targetSets }, (_, i) => ({
    setNumber: i + 1,
    weight: i === 0 ? (previousWeight ?? null) : null,
    weightText: i === 0 ? weightToText(previousWeight ?? null) : "",
    reps: i === 0 ? (previousReps ?? null) : null,
    isCompleted: false,
    isWarmup: false,
  }));
const buildSetsFromInitial = (
  initialSets: SetData[],
  targetSets: number,
  previousWeight?: number,
  previousReps?: number,
  shouldPrefillNextSet?: boolean,
) => {
  const normalized = normalizeSets(initialSets).sort(
    (a, b) => a.setNumber - b.setNumber,
  );
  const maxSetNumber = normalized.reduce(
    (max, set) => Math.max(max, set.setNumber),
    0,
  );
  const totalSets = Math.max(targetSets, maxSetNumber);
  const setsByNumber = new Map(normalized.map((set) => [set.setNumber, set]));
  const expanded = Array.from({ length: totalSets }, (_, i) => {
    const setNumber = i + 1;
    return setsByNumber.get(setNumber) ?? createEmptySet(setNumber);
  });

  if (!shouldPrefillNextSet) {
    return expanded;
  }

  const activeIndex = expanded.findIndex((set) => !set.isCompleted);
  if (activeIndex === -1) {
    return expanded;
  }

  const completedBefore = expanded
    .slice(0, activeIndex)
    .filter((set) => set.isCompleted);
  const lastCompleted = completedBefore[completedBefore.length - 1];
  const fallbackWeight = lastCompleted?.weight ?? previousWeight ?? null;
  const fallbackReps = lastCompleted?.reps ?? previousReps ?? null;
  const fallbackWeightText = lastCompleted
    ? lastCompleted.weightText ?? weightToText(lastCompleted.weight)
    : weightToText(previousWeight ?? null);

  return expanded.map((set, index) => {
    if (index !== activeIndex) {
      return set;
    }
    if (set.weight === null && fallbackWeight !== null) {
      return {
        ...set,
        weight: fallbackWeight,
        weightText: fallbackWeightText,
        reps: set.reps ?? fallbackReps,
      };
    }
    if (set.reps === null && fallbackReps !== null) {
      return {
        ...set,
        reps: fallbackReps,
      };
    }
    return set;
  });
};

export interface SetData {
  setNumber: number;
  weight: number | null;
  weightText?: string;
  reps: number | null;
  isCompleted: boolean;
  isWarmup?: boolean;
  completedAt?: string;
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
  /** When true, skip resume prefill behavior */
  isSessionFinished?: boolean;
  /** Allow editing of completed sets */
  allowEditingCompleted?: boolean;
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
  initialSets,
  isSessionFinished = false,
  allowEditingCompleted = false,
  onSetsChange,
  testID,
}: SetTrackerProps) {
  // Track the last sets we notified parent about to prevent sync loop
  const lastNotifiedSets = React.useRef<SetData[] | undefined>(undefined);

  // Initialize sets state - use initialSets if provided, otherwise create empty sets
  // First set gets prefilled with previous exercise values
  const [sets, setSets] = useState<SetData[]>(() =>
    initialSets && initialSets.length > 0
      ? buildSetsFromInitial(
          initialSets,
          targetSets,
          previousWeight,
          previousReps,
          !isSessionFinished,
        )
      : createInitialSets(targetSets, previousWeight, previousReps),
  );

  // Update sets when initialSets changes (when navigating between exercises)
  // Only sync if initialSets is a different reference than what we last sent to parent
  useEffect(() => {
    if (
      initialSets &&
      initialSets.length > 0 &&
      initialSets !== lastNotifiedSets.current
    ) {
      setSets(
        buildSetsFromInitial(
          initialSets,
          targetSets,
          previousWeight,
          previousReps,
          !isSessionFinished,
        ),
      );
    } else if (
      !initialSets ||
      (initialSets.length === 0 && initialSets !== lastNotifiedSets.current)
    ) {
      // Reset to empty sets for new exercise - first set gets prefilled with previous values
      setSets(createInitialSets(targetSets, previousWeight, previousReps));
    }
  }, [
    initialSets,
    targetSets,
    previousWeight,
    previousReps,
    isSessionFinished,
  ]);

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
    value: number | boolean | null | string,
  ) => {
    setSets((prev) =>
      prev.map((set, i) => {
        if (i !== index) {
          return set;
        }
        return { ...set, [field]: value };
      }),
    );
  };

  /**
   * Update weight data (supports decimals and partial input)
   */
  const updateWeight = (index: number, text: string) => {
    const normalizedText = text.replace(",", ".");
    if (normalizedText === "") {
      setSets((prev) =>
        prev.map((set, i) =>
          i === index ? { ...set, weight: null, weightText: "" } : set,
        ),
      );
      return;
    }

    if (!decimalNumberPattern.test(normalizedText)) {
      return;
    }

    const parsedWeight = parseFloat(normalizedText);
    setSets((prev) =>
      prev.map((set, i) =>
        i === index
          ? {
              ...set,
              weight: Number.isNaN(parsedWeight) ? null : parsedWeight,
              weightText: normalizedText,
            }
          : set,
      ),
    );
  };

  /**
   * Complete a set and prefill the next set with current values
   */
  const completeSet = (index: number) => {
    const completedAt = new Date().toISOString();
    setSets((prev) => {
      const currentSet = prev[index];
      if (currentSet.weight === null || currentSet.reps === null) {
        return prev;
      }

    const currentWeightText =
        currentSet.weightText ?? weightToText(currentSet.weight);
      return prev.map((set, i) => {
        if (i === index) {
          // Mark current set as completed
          return {
            ...set,
            isCompleted: true,
            completedAt: set.completedAt ?? completedAt,
          };
        } else if (i === index + 1 && !set.isCompleted) {
          // Prefill next set with current set's values (only if not already completed)
          const shouldPrefillWeight = set.weight === null;
          const nextWeight = shouldPrefillWeight ? currentSet.weight : set.weight;
          const nextWeightText = shouldPrefillWeight
            ? currentWeightText
            : set.weightText ?? weightToText(nextWeight);
          return {
            ...set,
            weight: nextWeight,
            weightText: nextWeightText,
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
          return {
            ...set,
            weight: newWeight,
            weightText: weightToText(newWeight),
          };
        }
        return set;
      }),
    );
  };

  /**
   * Adjust reps by delta (for +/- buttons)
   */
  const adjustReps = (index: number, delta: number) => {
    setSets((prev) =>
      prev.map((set, i) => {
        if (i === index) {
          const currentReps = set.reps ?? 0;
          const newReps = Math.max(0, currentReps + delta);
          return { ...set, reps: newReps };
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
        weightText: "",
        reps: null,
        isCompleted: false,
        isWarmup: false,
      },
    ]);
  };

  return (
    <View testID={testID} className="gap-2">
      {/* Header Row */}
      <View className="flex-row items-center gap-2 px-2 justify-center">
        <View style={{ width: 64 }}>
          <Text className="text-[10px] uppercase tracking-wider font-bold text-text-muted text-center">
            Adjust Wt
          </Text>
        </View>
        <View style={{ width: 60 }}>
          <Text className="text-[10px] uppercase tracking-wider font-bold text-text-muted text-center">
            kgs
          </Text>
        </View>
        <View style={{ width: 64 }}>
          <Text className="text-[10px] uppercase tracking-wider font-bold text-text-muted text-center">
            Adjust Reps
          </Text>
        </View>
        <View style={{ width: 40 }}>
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
        const isReadOnly = set.isCompleted && !allowEditingCompleted && !set.isWarmup;
        const isFuture = index > activeSetIndex && activeSetIndex !== -1;

        return (
          <View
            key={set.setNumber}
            className="flex-row items-center gap-2 rounded-lg p-3 justify-center"
            style={[
              styles.setRowDefault,
              isCompleted && styles.setRowCompleted,
              isActive && styles.setRowActive,
              isFuture && styles.setRowFuture,
            ]}
            testID={`set-row-${set.setNumber}`}
          >
            {/* +/- Weight Adjustment Buttons */}
            <View
              style={{ width: 64 }}
              className="flex-row items-center justify-center gap-1"
            >
              <Pressable
                onPress={() => adjustWeight(index, -2.5)}
                disabled={isReadOnly}
                testID={`weight-minus-${set.setNumber}`}
                className="h-8 w-8 rounded items-center justify-center"
                style={[
                  styles.button,
                  isCompleted && styles.buttonDisabled,
                  isActive ? styles.buttonActive : styles.buttonInactive,
                ]}
              >
                <MaterialIcons
                  name="remove"
                  size={18}
                  color={isActive ? theme.colors.text.secondary : theme.colors.text.muted}
                />
              </Pressable>
              <Pressable
                onPress={() => adjustWeight(index, 2.5)}
                disabled={isReadOnly}
                testID={`weight-plus-${set.setNumber}`}
                className="h-8 w-8 rounded items-center justify-center"
                style={[
                  styles.button,
                  isCompleted && styles.buttonDisabled,
                  isActive ? styles.buttonActive : styles.buttonInactive,
                ]}
              >
                <MaterialIcons
                  name="add"
                  size={18}
                  color={isActive ? theme.colors.text.secondary : theme.colors.text.muted}
                />
              </Pressable>
            </View>

            {/* Weight Input */}
            <View style={{ width: 60 }}>
              <TextInput
                value={set.weightText ?? weightToText(set.weight)}
                onChangeText={(text) => updateWeight(index, text)}
                placeholder="-"
                placeholderTextColor={isActive ? "#ffffff33" : "#ffffff20"}
                keyboardType="numeric"
                editable={!isReadOnly}
                testID={`weight-input-${set.setNumber}`}
                maxLength={maxWeightInputLength}
                className="rounded border text-center font-medium p-0"
                style={[
                  styles.input,
                  isCompleted && styles.inputCompleted,
                  isActive && styles.inputActive,
                  isFuture && styles.inputFuture,
                ]}
              />
            </View>

            {/* +/- Reps Adjustment Buttons */}
            <View
              style={{ width: 64 }}
              className="flex-row items-center justify-center gap-1"
            >
              <Pressable
                onPress={() => adjustReps(index, -1)}
                disabled={isReadOnly}
                testID={`reps-minus-${set.setNumber}`}
                className="h-8 w-8 rounded items-center justify-center"
                style={[
                  styles.button,
                  isCompleted && styles.buttonDisabled,
                  isActive ? styles.buttonActive : styles.buttonInactive,
                ]}
              >
                <MaterialIcons
                  name="remove"
                  size={18}
                  color={isActive ? theme.colors.text.secondary : theme.colors.text.muted}
                />
              </Pressable>
              <Pressable
                onPress={() => adjustReps(index, 1)}
                disabled={isReadOnly}
                testID={`reps-plus-${set.setNumber}`}
                className="h-8 w-8 rounded items-center justify-center"
                style={[
                  styles.button,
                  isCompleted && styles.buttonDisabled,
                  isActive ? styles.buttonActive : styles.buttonInactive,
                ]}
              >
                <MaterialIcons
                  name="add"
                  size={18}
                  color={isActive ? theme.colors.text.secondary : theme.colors.text.muted}
                />
              </Pressable>
            </View>

            {/* Reps Input */}
            <View style={{ width: 40 }}>
              <TextInput
                value={set.reps?.toString() || ""}
                onChangeText={(text) => {
                  const num = text ? parseInt(text, 10) : null;
                  updateSet(index, "reps", num);
                }}
                placeholder="-"
                placeholderTextColor={isActive ? "#ffffff33" : "#ffffff20"}
                keyboardType="number-pad"
                editable={!isReadOnly}
                testID={`reps-input-${set.setNumber}`}
                maxLength={2}
                className="rounded border text-center font-medium p-0"
                style={[
                  styles.input,
                  isCompleted && styles.inputCompleted,
                  isActive && styles.inputActive,
                  isFuture && styles.inputFuture,
                ]}
              />
            </View>

            {/* Completed Checkbox */}
            <View
              style={{ width: 50 }}
              className="flex items-center justify-center"
            >
              {isCompleted ? (
                <MaterialIcons name="check-circle" size={20} color={theme.colors.primary.DEFAULT} />
              ) : (
                <Pressable
                  onPress={() => completeSet(index)}
                  disabled={set.weight === null || set.reps === null}
                  testID={`complete-checkbox-${set.setNumber}`}
                  className="h-6 w-6 rounded border items-center justify-center"
                  style={[
                    isActive ? styles.checkboxActive : styles.checkboxInactive,
                    (set.weight === null || set.reps === null) && styles.checkboxDisabled,
                  ]}
                >
                  {set.weight !== null && set.reps !== null && (
                    <MaterialIcons name="check" size={16} color={theme.colors.primary.DEFAULT} />
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
        className="flex-row items-center justify-center gap-2 py-3 mt-2 rounded-lg border border-dashed"
        style={styles.addButton}
      >
        <MaterialIcons name="add" size={18} color={theme.colors.text.secondary} />
        <Text style={styles.addButtonText}>Add Set</Text>
      </Pressable>
    </View>
  );
}
