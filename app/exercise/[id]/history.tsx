/**
 * Exercise History & Progress Screen
 * Shows strength progression over time with charts and historical data
 * Story 12 - Exercise History & Progress Chart
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProgressChart, type ChartDataPoint } from "@/components/ProgressChart";
import {
  initStorage,
  isStorageInitialized,
  getExerciseById,
  getCompletedSetsByExerciseId,
} from "@/lib/storage/storage";
import type { Exercise, ExerciseSetCompleted } from "@/lib/storage/types";
import { cn } from "@/lib/utils/cn";

interface SetWithSession extends ExerciseSetCompleted {
  sessionDate: string;
}

interface SessionGroup {
  date: string;
  sets: ExerciseSetCompleted[];
  maxWeight: number;
  totalVolume: number;
}

export default function ExerciseHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exerciseId = id ? parseInt(id, 10) : null;
  const insets = useSafeAreaInsets();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [completedSets, setCompletedSets] = useState<ExerciseSetCompleted[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Load exercise and historical data
  useEffect(() => {
    loadExerciseHistory();
  }, [exerciseId]);

  async function loadExerciseHistory() {
    if (!exerciseId) {
      setLoading(false);
      return;
    }

    try {
      if (!isStorageInitialized()) {
        await initStorage();
      }

      const exerciseData = getExerciseById(exerciseId);
      if (!exerciseData) {
        console.error("Exercise not found");
        setLoading(false);
        return;
      }

      const sets = getCompletedSetsByExerciseId(exerciseId);

      setExercise(exerciseData);
      setCompletedSets(sets);
    } catch (error) {
      console.error("Failed to load exercise history:", error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate personal record (max weight)
  const personalRecord = completedSets
    .filter((s) => !s.is_warmup)
    .reduce<{ weight: number; reps: number } | null>((max, set) => {
      if (!max || set.weight > max.weight) {
        return { weight: set.weight, reps: set.reps };
      }
      return max;
    }, null);

  // Group sets by session (by date)
  const sessionGroups: SessionGroup[] = React.useMemo(() => {
    // Group by completed_session_id first
    const sessionMap = new Map<number, ExerciseSetCompleted[]>();

    completedSets
      .filter((s) => !s.is_warmup)
      .forEach((set) => {
        if (!sessionMap.has(set.completed_session_id)) {
          sessionMap.set(set.completed_session_id, []);
        }
        sessionMap.get(set.completed_session_id)!.push(set);
      });

    // Convert to session groups with stats
    const groups: SessionGroup[] = Array.from(sessionMap.entries()).map(
      ([sessionId, sets]) => {
        const date = sets[0].completed_at;
        const maxWeight = Math.max(...sets.map((s) => s.weight));
        const totalVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);

        return {
          date,
          sets,
          maxWeight,
          totalVolume,
        };
      }
    );

    // Sort by date (newest first)
    return groups.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [completedSets]);

  // Prepare chart data (max weight per session)
  const chartData: ChartDataPoint[] = React.useMemo(() => {
    return sessionGroups
      .map((group) => ({
        date: group.date,
        weight: group.maxWeight,
      }))
      .reverse(); // Chart should show oldest to newest
  }, [sessionGroups]);

  // Count unique sessions
  const totalSessions = sessionGroups.length;

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec6d" />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center px-6">
        <MaterialIcons name="error-outline" size={80} color="#9db9a8" />
        <Text className="text-2xl font-bold text-white mt-6 mb-2">
          Exercise Not Found
        </Text>
        <Text className="text-text-muted text-center">
          Unable to load exercise details
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-dark w-full">
      {/* Header */}
      <View
        className="bg-background-dark/95 border-b border-white/5 px-4 pb-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center justify-between w-full">
          <Pressable
            onPress={() => router.back()}
            testID="back-button"
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <MaterialIcons name="arrow-back" size={24} color="#9db9a8" />
            <Text className="text-text-muted text-sm font-medium">Back</Text>
          </Pressable>

          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-white">{exercise.name}</Text>
            <Text className="text-xs text-text-muted">
              {exercise.muscle_group}
            </Text>
          </View>

          <View style={{ width: 60 }} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: insets.bottom + 16,
        }}
      >
        {/* Stats Cards */}
        <View className="flex-row gap-3">
          {/* Total Sessions */}
          <View className="flex-1 rounded-2xl bg-surface-dark p-4 border border-[#2C4A3B]">
            <View className="flex-row items-start justify-between">
              <Text className="text-xs font-medium text-gray-400">
                Sessions
              </Text>
              <MaterialIcons name="fitness-center" size={20} color="#13ec6d" />
            </View>
            <Text className="mt-2 text-2xl font-bold text-white tracking-tight">
              {totalSessions}
            </Text>
          </View>

          {/* Personal Record */}
          {personalRecord && (
            <View className="flex-1 rounded-2xl bg-surface-dark p-4 border border-[#2C4A3B]">
              <View className="flex-row items-start justify-between">
                <Text className="text-xs font-medium text-gray-400">PR</Text>
                <MaterialIcons name="emoji-events" size={20} color="#13ec6d" />
              </View>
              <Text className="mt-2 text-2xl font-bold text-white tracking-tight">
                {personalRecord.weight}
                <Text className="text-sm font-normal text-gray-500"> lbs</Text>
              </Text>
              <Text className="text-xs text-gray-500">
                {personalRecord.reps} reps
              </Text>
            </View>
          )}
        </View>

        {/* Empty State */}
        {completedSets.length === 0 ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="show-chart" size={80} color="#9db9a8" />
            <Text className="text-xl font-bold text-white mt-6 mb-2">
              No History Yet
            </Text>
            <Text className="text-text-muted text-center">
              Complete a workout with {exercise.name} to see your progress
            </Text>
          </View>
        ) : (
          <>
            {/* Progress Chart */}
            <View>
              <Text className="text-lg font-bold text-white mb-3">
                Progress
              </Text>
              <ProgressChart data={chartData} />
            </View>

            {/* Historical Data */}
            <View>
              <Text className="text-lg font-bold text-white mb-3">
                History
              </Text>
              <View className="gap-3">
                {sessionGroups.map((group, sessionIndex) => (
                  <View
                    key={`session-${sessionIndex}`}
                    className="rounded-xl bg-surface-dark border border-[#2C4A3B] overflow-hidden"
                  >
                    {/* Session Header */}
                    <View className="px-4 py-3 border-b border-white/5">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-semibold text-white">
                          {formatDate(group.date)}
                        </Text>
                        <Text className="text-xs text-gray-400">
                          {formatTime(group.date)}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-3 mt-1">
                        <Text className="text-xs text-gray-400">
                          {group.sets.length} sets
                        </Text>
                        <View className="h-1 w-1 rounded-full bg-gray-400" />
                        <Text className="text-xs text-gray-400">
                          Max: {group.maxWeight} lbs
                        </Text>
                        <View className="h-1 w-1 rounded-full bg-gray-400" />
                        <Text className="text-xs text-gray-400">
                          Volume: {group.totalVolume} lbs
                        </Text>
                      </View>
                    </View>

                    {/* Sets List */}
                    <View className="px-4 py-3 gap-2">
                      {group.sets.map((set, setIndex) => (
                        <View
                          key={`set-${set.id}`}
                          className="flex-row items-center justify-between"
                        >
                          <Text className="text-sm text-gray-400">
                            Set {set.set_number}
                          </Text>
                          <Text className="text-sm font-medium text-white">
                            {set.weight} lbs × {set.reps} reps
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
