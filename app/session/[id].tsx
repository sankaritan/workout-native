/**
 * Active Workout Session Screen
 * Tracks sets, reps, and weight during workout
 */

import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "@/components/BackButton";
import { SetTracker, type SetData } from "@/components/SetTracker";
import { showAlert } from "@/lib/utils/alert";
import {
  getSessionWithExercises,
  getLastCompletedSetForExercise,
  insertCompletedSession,
  updateCompletedSession,
  insertCompletedSet,
  deleteCompletedSetsBySessionId,
  getInProgressSessionByTemplateId,
  getCompletedSetsBySessionId,
  getCompletedSessionsByPlanId,
  getCompletedSessionForTemplateWeek,
  getCompletionCountForTemplate,
  getWorkoutPlanById,
  type SessionWithExercises,
} from "@/lib/storage/storage";
import { cn } from "@/lib/utils/cn";

export default function WorkoutSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionTemplateId = id ? parseInt(id, 10) : null;
  const insets = useSafeAreaInsets();

  // Session state
  const [session, setSession] = useState<SessionWithExercises | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedSessionId, setCompletedSessionId] = useState<number | null>(null);
  const [exerciseSets, setExerciseSets] = useState<Map<number, SetData[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [workoutPlanId, setWorkoutPlanId] = useState<number | null>(null);
  const [isViewingCompletedSession, setIsViewingCompletedSession] = useState(false);

  // Get current exercise data (with fallback)
  const currentExercise = session?.exercises[currentExerciseIndex];
  const isFirstExercise = currentExerciseIndex === 0;
  const isLastExercise = session ? currentExerciseIndex === session.exercises.length - 1 : false;

  // Get previous performance for current exercise
  const previousSet = currentExercise
    ? getLastCompletedSetForExercise(
        currentExercise.exercise_id,
        isViewingCompletedSession ? completedSessionId ?? undefined : undefined
      )
    : null;

  /**
   * Handle sets change for current exercise
   */
  const handleSetsChange = useCallback(
    (sets: SetData[]) => {
      if (!currentExercise) return;
      setExerciseSets((prev) => {
        const newMap = new Map(prev);
        newMap.set(currentExercise.exercise_id, sets);
        return newMap;
      });
    },
    [currentExercise]
  );

  /**
   * Navigate to previous exercise
   */
  const handlePreviousExercise = useCallback(() => {
    if (!isFirstExercise) {
      setCurrentExerciseIndex((prev) => prev - 1);
    }
  }, [isFirstExercise]);

  /**
   * Navigate to next exercise
   */
  const handleNextExercise = useCallback(() => {
    if (!isLastExercise) {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  }, [isLastExercise]);

  /**
   * Handle back/pause - exit without finishing
   */
  const handleBack = useCallback(() => {
    if (isViewingCompletedSession) {
      if (workoutPlanId) {
        router.replace(`/workout/${workoutPlanId}`);
      } else {
        router.replace("/(tabs)");
      }
      return;
    }
    showAlert(
      "Pause Workout",
      "Your progress will be saved and you can resume later.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Pause",
          style: "default",
          onPress: () => {
            try {
              // Delete existing sets and save current progress
              if (completedSessionId) {
                deleteCompletedSetsBySessionId(completedSessionId);

                // Save current sets to database (even incomplete ones)
                const now = new Date().toISOString();
                exerciseSets.forEach((sets, exerciseId) => {
                  sets.forEach((set) => {
                    if (set.isCompleted && set.weight !== null && set.reps !== null) {
                      insertCompletedSet({
                        completed_session_id: completedSessionId,
                        exercise_id: exerciseId,
                        set_number: set.setNumber,
                        weight: set.weight,
                        reps: set.reps,
                        is_warmup: set.isWarmup || false,
                        completed_at: set.completedAt ?? now,
                      });
                    }
                  });
                });
              }

              // Navigate back to the workout plan view
              if (workoutPlanId) {
                router.replace(`/workout/${workoutPlanId}`);
              } else {
                router.replace("/(tabs)");
              }
            } catch (error) {
              console.error("Failed to save progress:", error);
              // Navigate back anyway
              if (workoutPlanId) {
                router.replace(`/workout/${workoutPlanId}`);
              } else {
                router.replace("/(tabs)");
              }
            }
          },
        },
      ]
    );
  }, [
    exerciseSets,
    completedSessionId,
    workoutPlanId,
    isViewingCompletedSession,
  ]);

  /**
   * Finish workout and save all data
   */
  const handleFinish = useCallback(() => {
    if (isViewingCompletedSession) {
      return;
    }
    showAlert(
      "Finish Workout",
      "Are you sure you want to finish this workout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Finish",
          style: "default",
          onPress: () => {
            try {
              // Delete existing sets (in case we're continuing a session)
              if (completedSessionId) {
                deleteCompletedSetsBySessionId(completedSessionId);
              }

              // Save all completed sets to database
               const now = new Date().toISOString();

               exerciseSets.forEach((sets, exerciseId) => {
                 sets.forEach((set) => {
                    if (set.isCompleted && set.weight !== null && set.reps !== null) {
                     insertCompletedSet({
                       completed_session_id: completedSessionId!,
                       exercise_id: exerciseId,
                       set_number: set.setNumber,
                       weight: set.weight,
                       reps: set.reps,
                       is_warmup: set.isWarmup || false,
                       completed_at: set.completedAt ?? now,
                     });
                   }
                 });
               });

              // Mark session as completed
               if (completedSessionId) {
                 updateCompletedSession(completedSessionId, now);
               }

              // Navigate back to the workout plan view
              if (workoutPlanId) {
                router.replace(`/workout/${workoutPlanId}`);
              } else {
                router.replace("/(tabs)");
              }
            } catch (error) {
              console.error("Failed to save workout:", error);
              showAlert("Error", "Failed to save workout");
            }
          },
        },
      ]
    );
  }, [exerciseSets, completedSessionId, workoutPlanId, isViewingCompletedSession]);

  // Load session data
  useEffect(() => {
    if (!sessionTemplateId) return;

    try {
      const sessionData = getSessionWithExercises(sessionTemplateId);
      if (!sessionData) {
        showAlert("Error", "Session not found");
        router.back();
        return;
      }

      setSession(sessionData);
      setWorkoutPlanId(sessionData.workout_plan_id);

      // Check if there's an in-progress session for this template
      const existingSession = getInProgressSessionByTemplateId(sessionTemplateId);

      let sessionId: number;
      let viewingCompletedSession = false;
      if (existingSession) {
        // Continue existing session
        sessionId = existingSession.id;
        // Load existing sets from the in-progress session
        const existingSets = getCompletedSetsBySessionId(sessionId);
        if (existingSets.length > 0) {
          // Group sets by exercise_id
          const setsByExercise = new Map<number, SetData[]>();
          existingSets.forEach((set) => {
            if (!setsByExercise.has(set.exercise_id)) {
              setsByExercise.set(set.exercise_id, []);
            }
            const exerciseSet = setsByExercise.get(set.exercise_id)!;
            exerciseSet.push({
              setNumber: set.set_number,
              weight: set.weight,
              reps: set.reps,
              isCompleted: true,
              isWarmup: set.is_warmup,
              completedAt: set.completed_at,
            });
          });
          setsByExercise.forEach((sets) => {
            sets.sort((a, b) => a.setNumber - b.setNumber);
          });
          setExerciseSets(setsByExercise);
        }
      } else {
        const planId = sessionData.workout_plan_id;
        const planCompletedSessions = getCompletedSessionsByPlanId(planId);
        const completedCount = planCompletedSessions.filter(
          (s) => s.completed_at !== null
        ).length;
        const plan = getWorkoutPlanById(planId);
        const weeklyFrequency = plan?.weekly_frequency ?? 1;
        const durationWeeks = plan?.duration_weeks ?? 1;
        const calculatedWeek = Math.floor(completedCount / weeklyFrequency) + 1;
        const currentWeek = Math.min(calculatedWeek, durationWeeks);

        const templateCompletionCount = getCompletionCountForTemplate(sessionTemplateId);
        const completedThisWeek = templateCompletionCount >= currentWeek;

        if (completedThisWeek) {
          const completedSessionForWeek = getCompletedSessionForTemplateWeek(
            sessionTemplateId,
            currentWeek
          );
          if (completedSessionForWeek) {
            sessionId = completedSessionForWeek.id;
            viewingCompletedSession = true;

            const existingSets = getCompletedSetsBySessionId(sessionId);
            if (existingSets.length > 0) {
              const setsByExercise = new Map<number, SetData[]>();
              existingSets.forEach((set) => {
                if (!setsByExercise.has(set.exercise_id)) {
                  setsByExercise.set(set.exercise_id, []);
                }
                const exerciseSet = setsByExercise.get(set.exercise_id)!;
                exerciseSet.push({
                  setNumber: set.set_number,
                  weight: set.weight,
                  reps: set.reps,
                  isCompleted: true,
                  isWarmup: set.is_warmup,
                  completedAt: set.completed_at,
                });
              });
              setsByExercise.forEach((sets) => {
                sets.sort((a, b) => a.setNumber - b.setNumber);
              });
              setExerciseSets(setsByExercise);
            }
          } else {
            const now = new Date().toISOString();
            sessionId = insertCompletedSession({
              workout_plan_id: planId,
              session_template_id: sessionTemplateId,
              started_at: now,
              completed_at: null,
              notes: null,
            });
          }
        } else {
          // Create new completed session record for the current week
          const now = new Date().toISOString();
          sessionId = insertCompletedSession({
            workout_plan_id: planId,
            session_template_id: sessionTemplateId,
            started_at: now,
            completed_at: null,
            notes: null,
          });
        }
      }

      setCompletedSessionId(sessionId);
      setIsViewingCompletedSession(viewingCompletedSession);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load session:", error);
      showAlert("Error", "Failed to load session");
      router.back();
    }
  }, [sessionTemplateId]);

  // Loading state
  if (isLoading || !session) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center w-full">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  // No exercises state
  if (!currentExercise) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center w-full">
        <Text className="text-white">No exercises in session</Text>
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
          <BackButton 
            onPress={handleBack}
            accessibilityLabel="Go back and pause workout"
          />

          <View className="flex-col">
            <Text className="text-sm font-medium text-text-muted uppercase tracking-wider">
              {session.name}
            </Text>
          </View>

          <Pressable
            onPress={handleFinish}
            disabled={isViewingCompletedSession}
            testID="finish-button"
            accessibilityRole="button"
            accessibilityLabel="Finish workout"
            className={cn(
              "px-4 py-2 rounded-lg",
              isViewingCompletedSession
                ? "bg-white/5"
                : "bg-primary/10 active:bg-primary/20"
            )}
          >
            <Text
              className={cn(
                "text-sm font-bold",
                isViewingCompletedSession ? "text-text-muted" : "text-primary"
              )}
            >
              Finish
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{
          padding: 16,
          gap: 24,
          paddingBottom: insets.bottom + 16,
        }}
      >
        {/* Exercise Navigation */}
        <View className="flex-col gap-2">
          <View className="flex-row items-center justify-between gap-2">
            {/* Previous Button */}
            <Pressable
              onPress={handlePreviousExercise}
              disabled={isFirstExercise}
              testID="previous-exercise-button"
              accessibilityRole="button"
              accessibilityLabel="Previous exercise"
              className={cn(
                "size-10 flex items-center justify-center rounded-full",
                isFirstExercise ? "opacity-30" : "active:bg-surface-dark"
              )}
            >
              <MaterialIcons
                name="chevron-left"
                size={24}
                color={isFirstExercise ? "#6b8779" : "#9db9a8"}
              />
            </Pressable>

            {/* Exercise Name */}
            <Pressable
              className="flex-1 items-center active:opacity-70"
              onPress={() => router.push(`/exercise/${currentExercise.exercise_id}/history` as any)}
              testID="exercise-name-button"
              accessibilityRole="button"
              accessibilityLabel={`View ${currentExercise.exercise.name} history`}
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight text-center">
                  {currentExercise.exercise.name}
                </Text>
                <MaterialIcons name="show-chart" size={20} color="#13ec6d" />
              </View>
              <Text className="text-xs text-text-muted mt-1">
                Target: {currentExercise.sets} × {currentExercise.reps} reps
              </Text>
            </Pressable>

            {/* Next Button */}
            <Pressable
              onPress={handleNextExercise}
              disabled={isLastExercise}
              testID="next-exercise-button"
              accessibilityRole="button"
              accessibilityLabel="Next exercise"
              className={cn(
                "size-10 flex items-center justify-center rounded-full",
                isLastExercise ? "opacity-30" : "active:bg-surface-dark"
              )}
            >
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={isLastExercise ? "#6b8779" : "#13ec6d"}
              />
            </Pressable>
          </View>

          {/* Last Time Section (expandable) */}
          {previousSet && (
            <View className="mt-2 bg-surface-dark rounded-lg overflow-hidden">
              <View className="flex-row items-center justify-between px-4 py-3">
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="history" size={20} color="#9db9a8" />
                  <Text className="text-sm font-medium text-white/90">
                    Last Time: {previousSet.weight}kgs × {previousSet.reps} reps
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Set Tracker */}
        <SetTracker
          targetSets={currentExercise.sets}
          targetReps={currentExercise.reps}
          previousWeight={previousSet?.weight}
          previousReps={previousSet?.reps}
          initialSets={exerciseSets.get(currentExercise.exercise_id)}
          onSetsChange={handleSetsChange}
          testID="set-tracker"
        />
      </ScrollView>
    </View>
  );
}
