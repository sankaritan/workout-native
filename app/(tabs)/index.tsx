/**
 * Dashboard Home Screen
 * Shows active workout plan or empty state
 */

import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import {
  getActiveWorkoutPlan,
  getSessionTemplatesByPlanId,
  getCompletedSessionsByPlanId,
  getInProgressSessionByPlanId,
  hasAnyCompletedSets,
  isStorageInitialized,
} from "@/lib/storage/storage";
import type { WorkoutPlan, WorkoutSessionTemplate, WorkoutSessionCompleted } from "@/lib/storage/types";
import { cn } from "@/lib/utils/cn";

export default function HomeScreen() {
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [sessions, setSessions] = useState<WorkoutSessionTemplate[]>([]);
  const [completedSessions, setCompletedSessions] = useState<WorkoutSessionCompleted[]>([]);
  const [inProgressSession, setInProgressSession] = useState<WorkoutSessionCompleted | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload data when screen comes into focus (e.g., after finishing a workout)
  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = () => {
    try {
      // Check if storage is ready
      if (!isStorageInitialized()) {
        console.log("Storage not initialized yet");
        setIsLoading(false);
        return;
      }

      // Get active plan
      const plan = getActiveWorkoutPlan();
      setActivePlan(plan);

      if (plan) {
        // Get sessions for this plan
        const planSessions = getSessionTemplatesByPlanId(plan.id);
        setSessions(planSessions);

        // Get completed sessions
        const completed = getCompletedSessionsByPlanId(plan.id);
        setCompletedSessions(completed);

        // Get in-progress session (started but not finished)
        const inProgress = getInProgressSessionByPlanId(plan.id);
        setInProgressSession(inProgress);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setIsLoading(false);
    }
  };

  const handleGeneratePlan = () => {
    router.push("/wizard/frequency");
  };

  const handleStartSession = (sessionId: number) => {
    router.push(`/session/${sessionId}`);
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!activePlan || sessions.length === 0) return 0;

    // Calculate total expected sessions (sessions per week * duration weeks)
    const totalExpectedSessions = activePlan.weekly_frequency * activePlan.duration_weeks;

    // Count completed sessions
    const completedCount = completedSessions.filter(s => s.completed_at !== null).length;

    return Math.round((completedCount / totalExpectedSessions) * 100);
  };

  // Determine next session to do
  const getNextSession = (): WorkoutSessionTemplate | null => {
    if (sessions.length === 0) return null;

    // If there's an in-progress session, return that session template
    if (inProgressSession) {
      const inProgressTemplate = sessions.find(s => s.id === inProgressSession.session_template_id);
      if (inProgressTemplate) return inProgressTemplate;
    }

    // Get completed session template IDs (only truly completed ones)
    const completedTemplateIds = new Set(
      completedSessions
        .filter(s => s.completed_at !== null)
        .map(s => s.session_template_id)
    );

    // Find first session that hasn't been completed yet (in sequence order)
    const nextSession = sessions
      .sort((a, b) => a.sequence_order - b.sequence_order)
      .find(s => !completedTemplateIds.has(s.id));

    // If all sessions completed at least once, return first session (cycle through)
    return nextSession || sessions[0];
  };

  // Check if a session has been completed
  const isSessionCompleted = (sessionId: number): boolean => {
    return completedSessions.some(
      s => s.session_template_id === sessionId && s.completed_at !== null
    );
  };

  // Calculate current week
  const getCurrentWeek = (): number => {
    if (!activePlan || completedSessions.length === 0) return 1;

    // Simple calculation: completed sessions / sessions per week
    const completedCount = completedSessions.filter(s => s.completed_at !== null).length;
    const currentWeek = Math.floor(completedCount / activePlan.weekly_frequency) + 1;

    return Math.min(currentWeek, activePlan.duration_weeks);
  };

  // Get workout stats for this month
  const getMonthlyStats = (): number => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return completedSessions.filter(s => {
      if (!s.completed_at) return false;
      const completedDate = new Date(s.completed_at);
      return completedDate >= firstDayOfMonth;
    }).length;
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec6d" />
      </View>
    );
  }

  // Empty state - no active plan
  if (!activePlan) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center px-6">
        {/* Icon placeholder */}
        <View className="relative w-64 h-64 mb-10 flex items-center justify-center">
          <View className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <View className="relative z-10">
            <MaterialIcons name="fitness-center" size={120} color="#13ec6d" />
          </View>
        </View>

        {/* Text content */}
        <View className="max-w-xs mx-auto space-y-4 items-center">
          <Text className="text-3xl font-bold tracking-tight text-white text-center">
            Welcome to your new routine
          </Text>
          <Text className="text-gray-400 leading-relaxed text-center">
            It looks like you don't have a workout plan yet. Let's build a custom
            schedule tailored to your goals.
          </Text>
        </View>

        {/* Generate Plan Button */}
        <View className="mt-10 w-full max-w-sm">
          <Pressable
            onPress={handleGeneratePlan}
            className="w-full rounded-xl bg-primary py-4 px-6 shadow-lg active:scale-[0.98] transition-all"
            accessibilityRole="button"
            accessibilityLabel="Generate your first workout plan"
            testID="generate-plan-button"
          >
            <View className="flex-row items-center justify-center gap-3">
              <MaterialIcons name="add-circle" size={24} color="#102218" />
              <Text className="text-background-dark text-lg font-bold">
                Generate Your First Plan
              </Text>
            </View>
          </Pressable>
          <Text className="mt-4 text-xs text-gray-500 text-center">
            Takes about 2 minutes to set up
          </Text>
        </View>
      </View>
    );
  }

  // Active plan state
  const nextSession = getNextSession();
  const progress = calculateProgress();
  const currentWeek = getCurrentWeek();
  const monthlyWorkouts = getMonthlyStats();

  return (
    <ScrollView className="flex-1 bg-background-dark">
      <View className="px-4 pt-6 pb-32">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-white mb-2">
            Your Workout Plan
          </Text>
          <Text className="text-gray-400">
            {monthlyWorkouts} {monthlyWorkouts === 1 ? 'workout' : 'workouts'} this month
          </Text>
        </View>

        {/* Active Plan Card */}
        <View className="bg-surface-dark rounded-2xl p-6 mb-6 border border-white/5">
          {/* Plan Name and Progress */}
          <View className="mb-4">
            <Text className="text-2xl font-bold text-white mb-2">
              {activePlan.name}
            </Text>
            <Text className="text-text-muted mb-4">
              Week {currentWeek} of {activePlan.duration_weeks} • {activePlan.weekly_frequency}x per week
            </Text>

            {/* Progress Bar */}
            <View className="bg-white/5 h-3 rounded-full overflow-hidden">
              <View
                className="bg-primary h-full rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
            <Text className="text-text-muted text-sm mt-2">
              {progress}% complete
            </Text>
          </View>

          {/* Next Session Highlight */}
          {nextSession && (
            <View className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="fitness-center" size={20} color="#13ec6d" />
                  <Text className="text-white font-bold">
                    {inProgressSession && hasAnyCompletedSets(inProgressSession.id)
                      ? "In Progress"
                      : "Next Up"}
                  </Text>
                </View>
                {isSessionCompleted(nextSession.id) && !inProgressSession && (
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="check-circle" size={16} color="#13ec6d" />
                    <Text className="text-primary text-xs">Done before</Text>
                  </View>
                )}
              </View>

              <Text className="text-xl font-bold text-white mb-2">
                {nextSession.name}
              </Text>
              <Text className="text-text-muted text-sm mb-4">
                {nextSession.estimated_duration_minutes} minutes • Session {nextSession.sequence_order}
              </Text>

              <Pressable
                onPress={() => handleStartSession(nextSession.id)}
                className="bg-primary rounded-xl py-3 px-6 active:scale-[0.98]"
                accessibilityRole="button"
                accessibilityLabel={`${inProgressSession ? "Continue" : "Start"} ${nextSession.name}`}
                testID="start-session-button"
              >
                <View className="flex-row items-center justify-center gap-2">
                  <MaterialIcons name="play-arrow" size={20} color="#102218" />
                  <Text className="text-background-dark font-bold">
                    {inProgressSession ? "Continue Session" : "Start Session"}
                  </Text>
                </View>
              </Pressable>
            </View>
          )}
        </View>

        {/* All Sessions List */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-4">
            All Sessions
          </Text>
          <View className="gap-3">
            {sessions
              .sort((a, b) => a.sequence_order - b.sequence_order)
              .map((session) => {
                const isCompleted = isSessionCompleted(session.id);
                const isNext = nextSession?.id === session.id;

                return (
                  <Pressable
                    key={session.id}
                    onPress={() => handleStartSession(session.id)}
                    className={cn(
                      "bg-surface-dark rounded-xl p-4 border active:scale-[0.98]",
                      isNext ? "border-primary/30" : "border-white/5"
                    )}
                    accessibilityRole="button"
                    accessibilityLabel={`${session.name} ${isCompleted ? 'completed' : ''}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-white font-bold text-lg">
                            {session.name}
                          </Text>
                          {isCompleted && (
                            <MaterialIcons name="check-circle" size={20} color="#13ec6d" />
                          )}
                          {isNext && !isCompleted && (
                            <View className="bg-primary/20 px-2 py-1 rounded">
                              <Text className="text-primary text-xs font-bold">
                                NEXT
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-text-muted text-sm">
                          Session {session.sequence_order} • {session.estimated_duration_minutes} min
                        </Text>
                      </View>
                      <MaterialIcons
                        name="chevron-right"
                        size={24}
                        color={isNext ? "#13ec6d" : "#9db9a8"}
                      />
                    </View>
                  </Pressable>
                );
              })}
          </View>
        </View>

        {/* Generate New Plan Button */}
        <Pressable
          onPress={handleGeneratePlan}
          className="bg-white/5 border border-white/10 rounded-xl py-4 px-6 active:scale-[0.98]"
          accessibilityRole="button"
          accessibilityLabel="Generate a new workout plan"
        >
          <View className="flex-row items-center justify-center gap-2">
            <MaterialIcons name="add-circle-outline" size={20} color="#9db9a8" />
            <Text className="text-white font-bold">
              Generate New Plan
            </Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}
