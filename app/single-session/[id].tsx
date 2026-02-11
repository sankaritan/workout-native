import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "@/components/BackButton";
import { SetTracker, type SetData } from "@/components/SetTracker";
import { showAlert } from "@/lib/utils/alert";
import {
  deleteCompletedSession,
  deleteCompletedSetsBySessionId,
  getCompletedSetsBySessionId,
  getExerciseById,
  getExerciseTemplatesBySessionId,
  getLastCompletedSetForExercise,
  getSessionTemplatesByPlanId,
  getSingleSessionById,
  insertCompletedSet,
  initStorage,
  isStorageInitialized,
  updateCompletedSession,
} from "@/lib/storage/storage";
import type { Exercise, WorkoutSessionCompleted, SessionExerciseTemplate } from "@/lib/storage/types";
import { cn } from "@/lib/utils/cn";

const DEFAULT_TARGET_SETS = 3;
const DEFAULT_TARGET_REPS = 10;

function getPlanExerciseTemplate(
  planId: number,
  exerciseId: number | null
): SessionExerciseTemplate | null {
  if (!exerciseId) return null;
  const sessions = getSessionTemplatesByPlanId(planId).sort(
    (a, b) => a.sequence_order - b.sequence_order
  );

  for (const session of sessions) {
    const exercises = getExerciseTemplatesBySessionId(session.id);
    const match = exercises.find((exercise) => exercise.exercise_id === exerciseId);
    if (match) {
      return match;
    }
  }

  return null;
}

export default function SingleSessionScreen() {
  const { id, planId } = useLocalSearchParams<{ id: string; planId?: string }>();
  const sessionId = id ? parseInt(id, 10) : null;
  const insets = useSafeAreaInsets();

  const [session, setSession] = useState<WorkoutSessionCompleted | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [exerciseSets, setExerciseSets] = useState<SetData[]>([]);
  const [targetSets, setTargetSets] = useState(DEFAULT_TARGET_SETS);
  const [targetReps, setTargetReps] = useState(DEFAULT_TARGET_REPS);
  const [isViewingCompletedSession, setIsViewingCompletedSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    try {
      if (!isStorageInitialized()) {
        await initStorage();
      }

      const existingSession = getSingleSessionById(sessionId);
      if (!existingSession) {
        showAlert("Error", "Session not found");
        router.replace("/");
        return;
      }

      setSession(existingSession);
      setIsViewingCompletedSession(Boolean(existingSession.completed_at));

      const exerciseData =
        existingSession.exercise_id !== undefined && existingSession.exercise_id !== null
          ? getExerciseById(existingSession.exercise_id)
          : null;
      setExercise(exerciseData);

      const template = getPlanExerciseTemplate(
        existingSession.workout_plan_id,
        existingSession.exercise_id ?? null
      );
      if (template) {
        setTargetSets(template.sets);
        setTargetReps(template.reps);
      } else {
        setTargetSets(DEFAULT_TARGET_SETS);
        setTargetReps(DEFAULT_TARGET_REPS);
      }

      const existingSets = getCompletedSetsBySessionId(existingSession.id);
      if (existingSets.length > 0) {
        const mappedSets = existingSets
          .sort((a, b) => a.set_number - b.set_number)
          .map((set) => ({
            setNumber: set.set_number,
            weight: set.weight,
            reps: set.reps,
            isCompleted: true,
            isWarmup: set.is_warmup,
            completedAt: set.completed_at,
          }));
        setExerciseSets(mappedSets);
      } else {
        setExerciseSets([]);
      }
    } catch (error) {
      console.error("Failed to load single session:", error);
      showAlert("Error", "Failed to load session");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const previousSet = useMemo(() => {
    if (!exercise) return null;
    return getLastCompletedSetForExercise(exercise.id, sessionId ?? undefined);
  }, [exercise, sessionId]);

  const hasCompletedSets = useMemo(
    () =>
      exerciseSets.some(
        (set) =>
          set.isCompleted &&
          set.weight !== null &&
          set.reps !== null
      ),
    [exerciseSets]
  );

  const persistSets = useCallback(
    (markComplete: boolean) => {
      if (!session) return;

      deleteCompletedSetsBySessionId(session.id);
      const now = new Date().toISOString();
      const exerciseId = session.exercise_id ?? exercise?.id ?? 0;

      exerciseSets.forEach((set) => {
        if (!set.isCompleted || set.weight === null || set.reps === null) {
          return;
        }

        insertCompletedSet({
          completed_session_id: session.id,
          exercise_id: exerciseId,
          set_number: set.setNumber,
          weight: set.weight,
          reps: set.reps,
          is_warmup: set.isWarmup || false,
          completed_at: set.completedAt ?? now,
        });
      });

      if (markComplete) {
        updateCompletedSession(session.id, now);
        setSession({ ...session, completed_at: now });
        setIsViewingCompletedSession(true);
      }
    },
    [exercise, exerciseSets, session]
  );

  const goBack = useCallback(
    (fallbackPlanId?: number) => {
      if (router.canGoBack()) {
        router.back();
        return;
      }
      if (fallbackPlanId) {
        router.replace(`/workout/${fallbackPlanId}/single`);
        return;
      }
      router.replace("/");
    },
    []
  );

  const handleBack = useCallback(() => {
    if (!session) {
      goBack();
      return;
    }

    if (isViewingCompletedSession) {
      goBack(session.workout_plan_id);
      return;
    }

    if (!hasCompletedSets) {
      deleteCompletedSession(session.id);
    } else {
      persistSets(false);
    }

    goBack(session.workout_plan_id);
  }, [goBack, hasCompletedSets, isViewingCompletedSession, persistSets, session]);

  const handleFinish = useCallback(() => {
    if (isViewingCompletedSession) {
      return;
    }

    if (!hasCompletedSets) {
      showAlert("Add Sets", "Mark at least one set as done before finishing.");
      return;
    }

    persistSets(true);
    if (session) {
      router.replace(`/workout/${session.workout_plan_id}`);
    } else {
      router.replace("/");
    }
  }, [hasCompletedSets, isViewingCompletedSession, persistSets, session]);

  const handleSetsChange = useCallback((sets: SetData[]) => {
    setExerciseSets(sets);
  }, []);

  if (isLoading || !session || !exercise) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center w-full">
        <Text className="text-white">Loading...</Text>
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
            accessibilityLabel="Go back to exercise list"
          />

          <View className="flex-col flex-1 items-center">
            <Text className="text-sm font-medium text-text-muted uppercase tracking-wider">
              Quick Workout
            </Text>
            <Text className="text-lg font-bold text-white" numberOfLines={1}>
              {session.name || exercise.name}
            </Text>
          </View>

          <Pressable
            onPress={handleFinish}
            disabled={isViewingCompletedSession}
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

      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <View className="bg-surface-dark rounded-xl p-4 border border-white/5">
          <View className="flex-row items-center gap-2 mb-2">
            <MaterialIcons name="fitness-center" size={20} color="#13ec6d" />
            <Text className="text-white font-bold text-lg" numberOfLines={1}>
              {exercise.name}
            </Text>
          </View>
          <Text className="text-text-muted text-sm">
            {exercise.equipment_required || "Bodyweight"} • Target: {targetSets} sets × {targetReps} reps
          </Text>
        </View>

        <SetTracker
          targetSets={targetSets}
          targetReps={targetReps}
          previousWeight={previousSet?.weight ?? undefined}
          previousReps={previousSet?.reps ?? undefined}
          initialSets={exerciseSets}
          isSessionFinished={isViewingCompletedSession}
          onSetsChange={handleSetsChange}
          testID="single-set-tracker"
        />
      </ScrollView>
    </View>
  );
}
