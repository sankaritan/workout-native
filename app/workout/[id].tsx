/**
 * Workout Plan Detail Screen
 * Shows detailed view of a specific workout plan with progress, sessions, and actions
 */

import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "@/components/BackButton";
import {
  getWorkoutPlanById,
  getSessionTemplatesByPlanId,
  getCompletedSessionsByPlanId,
  getSingleSessionsByPlanId,
  getInProgressSessionByPlanId,
  hasAnyCompletedSets,
  getExerciseById,
  isStorageInitialized,
} from "@/lib/storage/storage";
import type { WorkoutPlan, WorkoutSessionTemplate, WorkoutSessionCompleted } from "@/lib/storage/types";
import { cn } from "@/lib/utils/cn";

export default function WorkoutDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [sessions, setSessions] = useState<WorkoutSessionTemplate[]>([]);
  const [completedSessions, setCompletedSessions] = useState<WorkoutSessionCompleted[]>([]);
  const [singleSessions, setSingleSessions] = useState<WorkoutSessionCompleted[]>([]);
  const [inProgressSession, setInProgressSession] = useState<WorkoutSessionCompleted | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"plan" | "single">("plan");

  useEffect(() => {
    loadWorkoutData();
  }, [id]);

  // Reload data when screen comes into focus (e.g., after finishing a workout)
  useFocusEffect(
    React.useCallback(() => {
      loadWorkoutData();
    }, [id])
  );

  useEffect(() => {
    if (singleSessions.length === 0 && activeTab === "single") {
      setActiveTab("plan");
    }
  }, [singleSessions, activeTab]);

  const loadWorkoutData = () => {
    try {
      // Check if storage is ready
      if (!isStorageInitialized()) {
        console.log("Storage not initialized yet");
        setIsLoading(false);
        return;
      }

      if (!id) {
        console.log("No plan ID provided");
        setIsLoading(false);
        return;
      }

      // Get the workout plan
      const workoutPlan = getWorkoutPlanById(parseInt(id, 10));
      setPlan(workoutPlan);

      if (workoutPlan) {
        // Get sessions for this plan
        const planSessions = getSessionTemplatesByPlanId(workoutPlan.id);
        setSessions(planSessions);

        // Get completed sessions
        const completed = getCompletedSessionsByPlanId(workoutPlan.id, "plan");
        setCompletedSessions(completed);

        // Get single (ad hoc) sessions
        const singles = getSingleSessionsByPlanId(workoutPlan.id);
        setSingleSessions(singles);

        // Get in-progress session (started but not finished)
        const inProgress = getInProgressSessionByPlanId(workoutPlan.id, "plan");
        setInProgressSession(inProgress);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load workout data:", error);
      setIsLoading(false);
    }
  };

  const handleStartSession = (sessionId: number) => {
    router.push(`/session/${sessionId}`);
  };

  const handleStartSingleWorkout = () => {
    if (!plan) return;
    router.push(`/workout/${plan.id}/single`);
  };

  const handleOpenSingleSession = (sessionId: number) => {
    router.push(`/single-session/${sessionId}`);
  };

  const handleBack = () => {
    // Navigate to home instead of using router.back() to avoid
    // going back to wizard review page with reset state
    router.push("/");
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!plan || sessions.length === 0) return 0;

    // Calculate total expected sessions (sessions per week * duration weeks)
    const totalExpectedSessions = plan.weekly_frequency * plan.duration_weeks;

    // Count completed sessions
    const completedCount = completedSessions.filter(s => s.completed_at !== null).length;

    return Math.round((completedCount / totalExpectedSessions) * 100);
  };

  // Calculate current week
  const getCurrentWeek = (): number => {
    if (!plan || completedSessions.length === 0) return 1;

    // Simple calculation: completed sessions / sessions per week
    const completedCount = completedSessions.filter(s => s.completed_at !== null).length;
    const currentWeek = Math.floor(completedCount / plan.weekly_frequency) + 1;

    return Math.min(currentWeek, plan.duration_weeks);
  };

  const getTemplateCompletionCount = (sessionTemplateId: number): number => {
    return completedSessions.filter(
      s => s.session_template_id === sessionTemplateId && s.completed_at !== null
    ).length;
  };

  // Check if a session has been completed for the current week
  const isSessionCompleted = (sessionId: number): boolean => {
    const currentWeek = getCurrentWeek();
    return getTemplateCompletionCount(sessionId) >= currentWeek;
  };

  // Determine next session to do
  const getNextSession = (): WorkoutSessionTemplate | null => {
    if (sessions.length === 0) return null;

    // If there's an in-progress session, return that session template
    if (inProgressSession) {
      const inProgressTemplate = sessions.find(s => s.id === inProgressSession.session_template_id);
      if (inProgressTemplate) return inProgressTemplate;
    }

    const currentWeek = getCurrentWeek();
    const sortedSessions = [...sessions].sort((a, b) => a.sequence_order - b.sequence_order);

    // Find first session that hasn't been completed for the current week
    const nextSession = sortedSessions.find(
      (s) => getTemplateCompletionCount(s.id) < currentWeek
    );

    // If all sessions completed for the week, return first session (cycle through)
    return nextSession || sortedSessions[0];
  };

  // Get workout stats for this month
  const getMonthlyStats = (): number => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allSessions = [...completedSessions, ...singleSessions];

    return allSessions.filter(s => {
      if (!s.completed_at) return false;
      const completedDate = new Date(s.completed_at);
      return completedDate >= firstDayOfMonth;
    }).length;
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center w-full">
        <ActivityIndicator size="large" color="#13ec6d" />
      </View>
    );
  }

  // Plan not found
  if (!plan) {
    return (
      <View
        className="flex-1 bg-background-dark items-center justify-center px-6 w-full"
        style={{ paddingTop: insets.top }}
      >
        <MaterialIcons name="error-outline" size={64} color="#ef4444" />
        <Text className="text-xl font-bold text-white mt-4 text-center">
          Workout Plan Not Found
        </Text>
        <Text className="text-gray-400 mt-2 text-center">
          This workout plan doesn't exist or has been deleted.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 bg-primary rounded-xl py-3 px-6 active:scale-[0.98]"
          accessibilityRole="button"
        >
          <Text className="text-background-dark font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const nextSession = getNextSession();
  const progress = calculateProgress();
  const currentWeek = getCurrentWeek();
  const monthlyWorkouts = getMonthlyStats();
  const hasSingleSessions = singleSessions.length > 0;

  return (
    <ScrollView
      className="flex-1 bg-background-dark w-full"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 128,
      }}
    >
      <View>
        {/* Header with Back Button */}
        <View className="flex-row items-center justify-between mb-6">
          {/* Back button */}
          <BackButton onPress={handleBack} />
          
          <View className="flex-1 ml-4">
            <Text className="text-3xl font-bold text-white mb-2">
              Your Workout Plan
            </Text>
            <Text className="text-gray-400">
              {monthlyWorkouts} {monthlyWorkouts === 1 ? 'workout' : 'workouts'} this month
            </Text>
          </View>
        </View>

        {/* Active Plan Card */}
        <View className="bg-surface-dark rounded-2xl p-6 mb-6 border border-white/5">
          {/* Plan Name and Progress */}
          <View className="mb-4">
            <Text className="text-2xl font-bold text-white mb-2">
              {plan.name}
            </Text>
            <Text className="text-text-muted mb-4">
              Week {currentWeek} of {plan.duration_weeks} • {plan.weekly_frequency}x per week
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
                    <Text className="text-primary text-xs">Done this week</Text>
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

          <View className="border-t border-white/5 pt-4 mt-2">
            <Text className="text-text-muted text-sm mb-3">
              Start an ad hoc workout from this plan
            </Text>
            <Pressable
              onPress={handleStartSingleWorkout}
              className="rounded-xl py-3 px-6 border border-primary/40 bg-primary/5 active:scale-[0.98] self-start"
              accessibilityRole="button"
              accessibilityLabel="Start a quick workout"
            >
              <View className="flex-row items-center justify-center gap-2">
                <MaterialIcons name="bolt" size={20} color="#13ec6d" />
                <Text className="text-primary font-bold">
                  Quick workout
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Sessions List */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-3">
            Sessions
          </Text>

          <View className="flex-row bg-surface-dark rounded-2xl border border-white/5 p-1 mb-4">
            <Pressable
              onPress={() => setActiveTab("plan")}
              className={cn(
                "flex-1 py-3 rounded-xl items-center",
                activeTab === "plan" ? "bg-primary" : "bg-transparent"
              )}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === "plan" }}
            >
              <Text
                className={cn(
                  "font-bold",
                  activeTab === "plan" ? "text-background-dark" : "text-white"
                )}
              >
                Plan sessions
              </Text>
            </Pressable>

            <Pressable
              onPress={() => hasSingleSessions && setActiveTab("single")}
              disabled={!hasSingleSessions}
              className={cn(
                "flex-1 py-3 rounded-xl items-center",
                activeTab === "single" ? "bg-primary" : "bg-transparent",
                !hasSingleSessions && "opacity-40"
              )}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === "single", disabled: !hasSingleSessions }}
            >
              <Text
                className={cn(
                  "font-bold",
                  activeTab === "single" ? "text-background-dark" : "text-white"
                )}
              >
                Quick workouts
              </Text>
            </Pressable>
          </View>

          {activeTab === "plan" ? (
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
                          {isCompleted && (
                            <View className="flex-row items-center gap-1 mt-1">
                              <MaterialIcons name="check-circle" size={16} color="#13ec6d" />
                              <Text className="text-primary text-xs">Done this week</Text>
                            </View>
                          )}
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
          ) : (
            <View className="gap-3">
              {!hasSingleSessions && (
                <Text className="text-text-muted text-sm">
                  No quick workouts yet. Start one to see it here.
                </Text>
              )}
              {singleSessions.map((session) => {
                const exercise =
                  session.exercise_id !== undefined && session.exercise_id !== null
                    ? getExerciseById(session.exercise_id)
                    : null;
                const title = session.name || exercise?.name || "Quick workout";
                const status = session.completed_at ? "Finished" : "Not started";
                const timestamp = new Date(session.completed_at ?? session.started_at).toLocaleString(
                  "en-US",
                  { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
                );

                return (
                  <Pressable
                    key={session.id}
                    onPress={() => handleOpenSingleSession(session.id)}
                    className="bg-surface-dark rounded-xl p-4 border border-white/5 active:scale-[0.98]"
                    accessibilityRole="button"
                    accessibilityLabel={`${title} ${status}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-3">
                        <View className="flex-row items-center gap-2 mb-1">
                          <MaterialIcons name="bolt" size={18} color="#13ec6d" />
                          <Text className="text-white font-bold text-lg" numberOfLines={1}>
                            {title}
                          </Text>
                        </View>
                        <Text className="text-text-muted text-sm" numberOfLines={1}>
                          {(exercise?.equipment_required || "Bodyweight") + " • " + status}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-1">{timestamp}</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={22} color="#9db9a8" />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>


      </View>
    </ScrollView>
  );
}
