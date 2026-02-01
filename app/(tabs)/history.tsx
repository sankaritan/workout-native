/**
 * History Screen
 * Shows workout history calendar with monthly view
 * Story 11 - History Calendar View
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CancelButton } from "@/components/CancelButton";
import { Calendar } from "@/components/Calendar";
import {
  initStorage,
  isStorageInitialized,
  getCompletedSessionsByDateRange,
  getSessionTemplateById,
  getCompletedSetsBySessionId,
  getExerciseById,
} from "@/lib/storage/storage";
import type {
  WorkoutSessionCompleted,
  WorkoutSessionTemplate,
} from "@/lib/storage/types";
import { cn } from "@/lib/utils/cn";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


interface SessionDetails extends WorkoutSessionCompleted {
  template: WorkoutSessionTemplate | null;
  exerciseCount: number;
  totalSets: number;
}

export default function HistoryScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completedSessions, setCompletedSessions] = useState<
    WorkoutSessionCompleted[]
  >([]);
  const [selectedDaySessions, setSelectedDaySessions] = useState<
    SessionDetails[]
  >([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Load completed sessions for current month
  useEffect(() => {
    loadCompletedSessions();
  }, [year, month]);

  async function loadCompletedSessions() {
    try {
      if (!isStorageInitialized()) {
        await initStorage();
      }

      // Get start and end of current month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      const sessions = getCompletedSessionsByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      );

      // Only include completed sessions (not in-progress)
      const completed = sessions.filter((s) => s.completed_at !== null);
      setCompletedSessions(completed);
    } catch (error) {
      console.error("Failed to load completed sessions:", error);
    } finally {
      setLoading(false);
    }
  }

  // Navigate to previous month
  function goToPreviousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  // Navigate to next month
  function goToNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  // Handle day press - show sessions for that day
  function handleDayPress(date: Date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Find all sessions for this day
    const daySessions = completedSessions.filter((session) => {
      const sessionDate = new Date(session.started_at);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });

    if (daySessions.length === 0) {
      return; // No sessions on this day
    }

    // Load details for each session
    const sessionsWithDetails: SessionDetails[] = daySessions.map(
      (session) => {
        const template = getSessionTemplateById(session.session_template_id);
        const sets = getCompletedSetsBySessionId(session.id);

        // Count unique exercises
        const uniqueExercises = new Set(sets.map((s) => s.exercise_id));

        return {
          ...session,
          template,
          exerciseCount: uniqueExercises.size,
          totalSets: sets.length,
        };
      }
    );

    setSelectedDaySessions(sessionsWithDetails);
    setShowSessionModal(true);
  }

  // Calculate workout stats for the month
  const workoutCount = completedSessions.length;

  // Get workout dates as ISO strings for calendar highlighting
  const workoutDates = completedSessions.map((s) => s.started_at);

  // Calculate streak (consecutive days with workouts)
  function calculateStreak(): number {
    if (completedSessions.length === 0) return 0;

    // Get unique dates with workouts (YYYY-MM-DD format)
    const workoutDatesSet = new Set<string>();
    completedSessions.forEach((session) => {
      const date = new Date(session.started_at);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      workoutDatesSet.add(dateKey);
    });

    const sortedDates = Array.from(workoutDatesSet).sort().reverse();

    // Start from today and count backwards
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    let streak = 0;
    let currentDate = new Date(today);

    // Check if today or yesterday has a workout (to start the streak)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (!workoutDatesSet.has(todayKey) && !workoutDatesSet.has(yesterdayKey)) {
      return 0; // Streak is broken
    }

    // Count consecutive days with workouts
    for (let i = 0; i < 365; i++) {
      const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

      if (workoutDatesSet.has(dateKey)) {
        streak++;
      } else if (i > 0) {
        // Allow today to not have a workout if we're continuing a streak from yesterday
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  const streak = calculateStreak();

  if (loading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec6d" />
      </View>
    );
  }

  // Empty state when no workouts completed
  if (completedSessions.length === 0) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center px-6">
        <MaterialIcons name="calendar-today" size={80} color="#9db9a8" />
        <Text className="text-2xl font-bold text-white mt-6 mb-2">
          No Workout History
        </Text>
        <Text className="text-text-muted text-center">
          Complete your first workout to start tracking your progress
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-dark">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-6 pb-2">
          <Text className="text-2xl font-bold text-white tracking-tight">
            History
          </Text>
        </View>

        {/* Month/Year toggle removed — unused */}

        {/* Month Navigation */}
        <View className="flex-row items-center justify-between px-6 py-2">
          <Pressable
            onPress={goToPreviousMonth}
            className="p-2 rounded-full active:bg-white/10"
          >
            <MaterialIcons name="chevron-left" size={24} color="#9db9a8" />
          </Pressable>
          <Text className="text-2xl font-bold text-white tracking-tight">
            {MONTH_NAMES[month]} {year}
          </Text>
          <Pressable
            onPress={goToNextMonth}
            className="p-2 rounded-full active:bg-white/10"
          >
            <MaterialIcons name="chevron-right" size={24} color="#9db9a8" />
          </Pressable>
        </View>

        {/* Calendar */}
        <Calendar
          year={year}
          month={month}
          workoutDates={workoutDates}
          onDayPress={handleDayPress}
          className="pb-4"
        />

        {/* Stats Cards */}
        <View className="px-4 pb-6">
          <View className="flex-row gap-3">
            {/* Workouts Count */}
            <View className="flex-1 rounded-2xl bg-surface-dark p-4 border border-[#2C4A3B]">
              <View className="flex-row items-start justify-between">
                <Text className="text-xs font-medium text-gray-400">
                  Workouts
                </Text>
                <MaterialIcons name="fitness-center" size={20} color="#13ec6d" />
              </View>
              <Text className="mt-2 text-2xl font-bold text-white tracking-tight">
                {workoutCount}
              </Text>
            </View>

            {/* Streak */}
            <View className="flex-1 rounded-2xl bg-surface-dark p-4 border border-[#2C4A3B]">
              <View className="flex-row items-start justify-between">
                <Text className="text-xs font-medium text-gray-400">
                  Streak
                </Text>
                <MaterialIcons name="local-fire-department" size={20} color="#13ec6d" />
              </View>
              <Text className="mt-2 text-2xl font-bold text-white tracking-tight">
                {streak}{" "}
                <Text className="text-sm font-normal text-gray-500">Days</Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Session Details Modal */}
      <Modal
        visible={showSessionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSessionModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowSessionModal(false)}
        >
          <Pressable
            className="bg-surface-dark rounded-t-3xl px-5 py-6 shadow-2xl min-h-[300px] max-h-[80%]"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1">
                {selectedDaySessions.length > 0 && (
                  <>
                    <Text className="text-lg font-bold text-white">
                      {new Date(
                        selectedDaySessions[0].started_at
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <Text className="text-sm text-gray-400">
                      {selectedDaySessions.length} workout
                      {selectedDaySessions.length !== 1 ? "s" : ""} completed
                    </Text>
                  </>
                )}
              </View>
              <CancelButton 
                onPress={() => setShowSessionModal(false)}
                label="Close"
              />
            </View>

            <ScrollView className="flex-1">
              <View className="gap-4">
                {selectedDaySessions.map((session, index) => {
                  const startTime = new Date(
                    session.started_at
                  ).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <View
                      key={session.id}
                      className="flex-row items-center gap-4 rounded-xl border border-[#2C4A3B] bg-background-dark p-4"
                    >
                      <View className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20">
                        <MaterialIcons
                          name="fitness-center"
                          size={24}
                          color="#13ec6d"
                        />
                      </View>
                      <View className="flex-1 min-w-0">
                        <View className="flex-row justify-between items-start">
                          <Text className="font-semibold text-base text-white flex-1 pr-2">
                            {session.template?.name || "Workout Session"}
                          </Text>
                          <Text className="text-xs font-medium text-gray-400">
                            {startTime}
                          </Text>
                        </View>
                        <View className="mt-1 flex-row items-center gap-3">
                          <Text className="text-xs text-gray-400">
                            {session.exerciseCount} exercises
                          </Text>
                          <View className="h-1 w-1 rounded-full bg-gray-400" />
                          <Text className="text-xs text-gray-400">
                            {session.totalSets} sets
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
