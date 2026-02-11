import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useFocusEffect, useLocalSearchParams, router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "@/components/BackButton";
import { ExerciseCardWithActions } from "@/components/ExerciseCardWithActions";
import {
  getInProgressSingleSessionByExercise,
  getPlanExercises,
  getWorkoutPlanById,
  getExerciseById,
  insertCompletedSession,
  initStorage,
  isStorageInitialized,
} from "@/lib/storage/storage";
import type { Exercise, WorkoutPlan } from "@/lib/storage/types";

export default function SingleWorkoutListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const planId = id ? parseInt(id, 10) : null;
  const insets = useSafeAreaInsets();

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!planId) {
      setIsLoading(false);
      return;
    }

    try {
      if (!isStorageInitialized()) {
        await initStorage();
      }

      const workoutPlan = getWorkoutPlanById(planId);
      setPlan(workoutPlan);

      if (workoutPlan) {
        const planExercises = getPlanExercises(workoutPlan.id);
        setExercises(planExercises);
      }
    } catch (error) {
      console.error("Failed to load quick workout data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleExercisePress = (exerciseId: number) => {
    if (!planId) return;

    const existingSession = getInProgressSingleSessionByExercise(planId, exerciseId);
    const exercise = getExerciseById(exerciseId);
    const now = new Date().toISOString();

    const sessionId =
      existingSession?.id ??
      insertCompletedSession({
        workout_plan_id: planId,
        session_template_id: -1,
        started_at: now,
        completed_at: null,
        notes: null,
        session_type: "single",
        exercise_id: exerciseId,
        name: exercise?.name ?? "Quick workout",
      });

    router.push({
      pathname: "/single-session/[id]",
      params: { id: String(sessionId), planId: String(planId) },
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#13ec6d" />
      </View>
    );
  }

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

  return (
    <View className="flex-1 bg-background-dark w-full">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
          gap: 16,
        }}
      >
        <View className="flex-row items-center justify-between">
          <BackButton onPress={() => router.back()} />
          <View className="flex-1 ml-4">
            <Text className="text-lg font-semibold text-text-muted">
              {plan.name}
            </Text>
            <Text className="text-2xl font-bold text-white">
              Quick Workout
            </Text>
          </View>
        </View>

        <View className="bg-surface-dark rounded-2xl p-4 border border-white/5">
          <Text className="text-white font-semibold text-lg mb-2">
            Choose an exercise
          </Text>
          <Text className="text-text-muted text-sm">
            Pick any exercise from this plan to start an ad hoc session.
          </Text>
        </View>

        {exercises.length === 0 ? (
          <View className="bg-surface-dark rounded-2xl p-5 border border-white/5">
            <Text className="text-white font-semibold text-lg mb-2">
              No exercises found
            </Text>
            <Text className="text-text-muted">
              Add exercises to this plan to start a quick workout.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {exercises.map((exercise) => (
              <Pressable
                key={exercise.id}
                onPress={() => handleExercisePress(exercise.id)}
                className="active:scale-[0.99]"
                accessibilityRole="button"
                accessibilityLabel={`Start quick workout with ${exercise.name}`}
              >
                <ExerciseCardWithActions
                  exercise={exercise}
                  onSwap={() => {}}
                  onRemove={() => {}}
                  canRemove={false}
                  showMuscleGroupBadges
                  showActions={false}
                />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
