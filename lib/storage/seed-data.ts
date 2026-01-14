/**
 * Exercise library seed data
 * Contains 50+ exercises covering all major muscle groups
 */

import { insertExercise, getAllExercises } from "./storage";
import type { ExerciseInsert } from "./types";

export const EXERCISES: ExerciseInsert[] = [
  // ============================================================================
  // CHEST EXERCISES
  // ============================================================================
  {
    name: "Bench Press",
    muscle_group: "Chest",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Classic compound chest exercise performed lying on a flat bench",
  },
  {
    name: "Incline Bench Press",
    muscle_group: "Chest",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Bench press variation targeting upper chest",
  },
  {
    name: "Dumbbell Bench Press",
    muscle_group: "Chest",
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Chest press with dumbbells for greater range of motion",
  },
  {
    name: "Incline Dumbbell Press",
    muscle_group: "Chest",
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Dumbbell press on incline bench for upper chest emphasis",
  },
  {
    name: "Push-ups",
    muscle_group: "Chest",
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Bodyweight chest exercise that can be done anywhere",
  },
  {
    name: "Dumbbell Flyes",
    muscle_group: "Chest",
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Isolation exercise for chest stretch and contraction",
  },
  {
    name: "Cable Flyes",
    muscle_group: "Chest",
    equipment_required: "Cables",
    is_compound: false,
    description: "Cable variation of flyes for constant tension",
  },
  {
    name: "Chest Dips",
    muscle_group: "Chest",
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Bodyweight exercise emphasizing lower chest",
  },

  // ============================================================================
  // BACK EXERCISES
  // ============================================================================
  {
    name: "Deadlift",
    muscle_group: "Back",
    equipment_required: "Barbell",
    is_compound: true,
    description: "King of back exercises, works entire posterior chain",
  },
  {
    name: "Barbell Row",
    muscle_group: "Back",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Bent-over row for mid-back thickness",
  },
  {
    name: "Pull-ups",
    muscle_group: "Back",
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Bodyweight vertical pull for back width",
  },
  {
    name: "Chin-ups",
    muscle_group: "Back",
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Underhand grip pull-up variation",
  },
  {
    name: "Lat Pulldown",
    muscle_group: "Back",
    equipment_required: "Cables",
    is_compound: true,
    description: "Cable machine exercise for back width",
  },
  {
    name: "Dumbbell Row",
    muscle_group: "Back",
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Single-arm row for unilateral back development",
  },
  {
    name: "Seated Cable Row",
    muscle_group: "Back",
    equipment_required: "Cables",
    is_compound: true,
    description: "Horizontal cable pull for mid-back",
  },
  {
    name: "Face Pulls",
    muscle_group: "Back",
    equipment_required: "Cables",
    is_compound: false,
    description: "Cable exercise for rear delts and upper back",
  },
  {
    name: "T-Bar Row",
    muscle_group: "Back",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Compound row variation for back thickness",
  },

  // ============================================================================
  // LEG EXERCISES
  // ============================================================================
  {
    name: "Squat",
    muscle_group: "Legs",
    equipment_required: "Barbell",
    is_compound: true,
    description: "King of leg exercises, works entire lower body",
  },
  {
    name: "Front Squat",
    muscle_group: "Legs",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Squat variation with bar in front, emphasizes quads",
  },
  {
    name: "Romanian Deadlift",
    muscle_group: "Legs",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Hamstring-focused deadlift variation",
  },
  {
    name: "Leg Press",
    muscle_group: "Legs",
    equipment_required: "Machines",
    is_compound: true,
    description: "Machine-based compound leg exercise",
  },
  {
    name: "Lunges",
    muscle_group: "Legs",
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Unilateral leg exercise for balance and strength",
  },
  {
    name: "Bulgarian Split Squat",
    muscle_group: "Legs",
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Single-leg squat variation with rear foot elevated",
  },
  {
    name: "Leg Extension",
    muscle_group: "Legs",
    equipment_required: "Machines",
    is_compound: false,
    description: "Isolation exercise for quadriceps",
  },
  {
    name: "Leg Curl",
    muscle_group: "Legs",
    equipment_required: "Machines",
    is_compound: false,
    description: "Isolation exercise for hamstrings",
  },
  {
    name: "Calf Raises",
    muscle_group: "Legs",
    equipment_required: "Machines",
    is_compound: false,
    description: "Isolation exercise for calf development",
  },

  // ============================================================================
  // SHOULDER EXERCISES
  // ============================================================================
  {
    name: "Overhead Press",
    muscle_group: "Shoulders",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Standing barbell press for overall shoulder development",
  },
  {
    name: "Dumbbell Shoulder Press",
    muscle_group: "Shoulders",
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Seated or standing dumbbell press for shoulders",
  },
  {
    name: "Arnold Press",
    muscle_group: "Shoulders",
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Rotating dumbbell press hitting all three deltoid heads",
  },
  {
    name: "Lateral Raises",
    muscle_group: "Shoulders",
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Isolation exercise for side deltoids",
  },
  {
    name: "Front Raises",
    muscle_group: "Shoulders",
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Isolation exercise for front deltoids",
  },
  {
    name: "Rear Delt Flyes",
    muscle_group: "Shoulders",
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Isolation exercise for rear deltoids",
  },
  {
    name: "Upright Row",
    muscle_group: "Shoulders",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Compound exercise for shoulders and traps",
  },
  {
    name: "Pike Push-ups",
    muscle_group: "Shoulders",
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Bodyweight exercise targeting shoulders",
  },

  // ============================================================================
  // ARM EXERCISES
  // ============================================================================
  {
    name: "Barbell Curl",
    muscle_group: "Arms",
    equipment_required: "Barbell",
    is_compound: false,
    description: "Classic bicep exercise with barbell",
  },
  {
    name: "Dumbbell Curl",
    muscle_group: "Arms",
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Bicep curl with dumbbells for unilateral work",
  },
  {
    name: "Hammer Curl",
    muscle_group: "Arms",
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Neutral grip curl for biceps and brachialis",
  },
  {
    name: "Tricep Dips",
    muscle_group: "Arms",
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Bodyweight exercise for triceps",
  },
  {
    name: "Close-Grip Bench Press",
    muscle_group: "Arms",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Bench press variation emphasizing triceps",
  },
  {
    name: "Skull Crushers",
    muscle_group: "Arms",
    equipment_required: "Barbell",
    is_compound: false,
    description: "Lying tricep extension exercise",
  },
  {
    name: "Tricep Pushdown",
    muscle_group: "Arms",
    equipment_required: "Cables",
    is_compound: false,
    description: "Cable isolation exercise for triceps",
  },
  {
    name: "Overhead Tricep Extension",
    muscle_group: "Arms",
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Overhead extension for long head of triceps",
  },
  {
    name: "Preacher Curl",
    muscle_group: "Arms",
    equipment_required: "Barbell",
    is_compound: false,
    description: "Bicep curl on preacher bench for isolation",
  },

  // ============================================================================
  // CORE EXERCISES
  // ============================================================================
  {
    name: "Plank",
    muscle_group: "Core",
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Isometric core exercise for stability",
  },
  {
    name: "Crunches",
    muscle_group: "Core",
    equipment_required: "Bodyweight",
    is_compound: false,
    description: "Basic abdominal exercise",
  },
  {
    name: "Hanging Leg Raises",
    muscle_group: "Core",
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Advanced core exercise hanging from bar",
  },
  {
    name: "Russian Twists",
    muscle_group: "Core",
    equipment_required: "Bodyweight",
    is_compound: false,
    description: "Rotational core exercise for obliques",
  },
  {
    name: "Cable Crunches",
    muscle_group: "Core",
    equipment_required: "Cables",
    is_compound: false,
    description: "Cable machine crunch for progressive overload",
  },
  {
    name: "Ab Wheel Rollout",
    muscle_group: "Core",
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Advanced core exercise with ab wheel",
  },
  {
    name: "Mountain Climbers",
    muscle_group: "Core",
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Dynamic core exercise with cardio element",
  },
  {
    name: "Dead Bug",
    muscle_group: "Core",
    equipment_required: "Bodyweight",
    is_compound: false,
    description: "Core stability exercise performed on back",
  },
];

/**
 * Seed the exercises table with initial data
 * Only inserts exercises that don't already exist (based on name)
 */
export function seedExercises(): void {
  try {
    // Get existing exercises
    const existingExercises = getAllExercises() || [];
    const existingNames = new Set(existingExercises.map((ex) => ex.name));

    // Insert only new exercises
    let insertedCount = 0;
    for (const exercise of EXERCISES) {
      if (!existingNames.has(exercise.name)) {
        insertExercise(exercise);
        insertedCount++;
      }
    }

    if (insertedCount > 0) {
      console.log(`Seeded ${insertedCount} exercises into database`);
    } else {
      console.log("All exercises already exist in database");
    }
  } catch (error) {
    console.error("Failed to seed exercises:", error);
    throw error;
  }
}

/**
 * Get exercise count by muscle group for verification
 */
export function getExerciseCountByMuscleGroup(): Record<string, number> {
  const counts: Record<string, number> = {
    Chest: 0,
    Back: 0,
    Legs: 0,
    Shoulders: 0,
    Arms: 0,
    Core: 0,
  };

  for (const exercise of EXERCISES) {
    counts[exercise.muscle_group]++;
  }

  return counts;
}

/**
 * Get compound exercise count
 */
export function getCompoundExerciseCount(): number {
  return EXERCISES.filter((ex) => ex.is_compound).length;
}

/**
 * Seed a test workout plan for development/testing
 * Creates a simple 3-day plan with session ID 1 for testing
 */
export function seedTestWorkoutPlan(): void {
  try {
    const {
      getAllWorkoutPlans,
      insertWorkoutPlan,
      insertSessionTemplate,
      insertExerciseTemplate,
      getExercisesByMuscleGroup,
    } = require("./storage");

    // Check if test plan already exists
    const existingPlans = getAllWorkoutPlans();
    if (existingPlans.length > 0) {
      console.log("Test workout plan already exists, skipping seed");
      return;
    }

    // Create workout plan
    const planId = insertWorkoutPlan({
      name: "Test 3-Day Split",
      description: "Development test plan",
      weekly_frequency: 3,
      duration_weeks: 8,
      estimated_duration_minutes: 60,
      created_at: new Date().toISOString(),
      is_active: true,
    });

    // Get some exercises for each muscle group
    const chestExercises = getExercisesByMuscleGroup("Chest");
    const backExercises = getExercisesByMuscleGroup("Back");
    const legExercises = getExercisesByMuscleGroup("Legs");

    // Create Session 1: Upper Body A
    const session1Id = insertSessionTemplate({
      workout_plan_id: planId,
      sequence_order: 1,
      name: "Upper Body A",
      target_muscle_groups: '["Chest","Back"]',
      estimated_duration_minutes: 60,
    });

    // Add exercises to Session 1
    if (chestExercises[0]) {
      insertExerciseTemplate({
        session_template_id: session1Id,
        exercise_id: chestExercises[0].id,
        exercise_order: 1,
        sets: 3,
        reps: 10,
        is_warmup: false,
      });
    }

    if (backExercises[0]) {
      insertExerciseTemplate({
        session_template_id: session1Id,
        exercise_id: backExercises[0].id,
        exercise_order: 2,
        sets: 3,
        reps: 12,
        is_warmup: false,
      });
    }

    // Create Session 2: Lower Body
    const session2Id = insertSessionTemplate({
      workout_plan_id: planId,
      sequence_order: 2,
      name: "Lower Body",
      target_muscle_groups: '["Legs"]',
      estimated_duration_minutes: 60,
    });

    // Add exercises to Session 2
    if (legExercises[0]) {
      insertExerciseTemplate({
        session_template_id: session2Id,
        exercise_id: legExercises[0].id,
        exercise_order: 1,
        sets: 4,
        reps: 8,
        is_warmup: false,
      });
    }

    // Create Session 3: Upper Body B
    const session3Id = insertSessionTemplate({
      workout_plan_id: planId,
      sequence_order: 3,
      name: "Upper Body B",
      target_muscle_groups: '["Shoulders","Arms"]',
      estimated_duration_minutes: 60,
    });

    const shoulderExercises = getExercisesByMuscleGroup("Shoulders");
    const armExercises = getExercisesByMuscleGroup("Arms");

    if (shoulderExercises[0]) {
      insertExerciseTemplate({
        session_template_id: session3Id,
        exercise_id: shoulderExercises[0].id,
        exercise_order: 1,
        sets: 3,
        reps: 10,
        is_warmup: false,
      });
    }

    if (armExercises[0]) {
      insertExerciseTemplate({
        session_template_id: session3Id,
        exercise_id: armExercises[0].id,
        exercise_order: 2,
        sets: 3,
        reps: 12,
        is_warmup: false,
      });
    }

    console.log("Seeded test workout plan with 3 sessions");
  } catch (error) {
    console.error("Failed to seed test workout plan:", error);
    throw error;
  }
}

/**
 * Seed mock workout history for development/testing
 * Creates completed sessions with different progression patterns:
 * - Upward progression (getting stronger)
 * - Downward progression (losing strength/deload)
 * - Up-down trends (inconsistent)
 */
export function seedMockWorkoutHistory(): void {
  try {
    const {
      getAllWorkoutPlans,
      getSessionTemplatesByPlanId,
      getExerciseTemplatesBySessionId,
      insertCompletedSession,
      insertCompletedSet,
      getCompletedSessionsByPlanId,
    } = require("./storage");

    // Check if there are already completed sessions
    const plans = getAllWorkoutPlans();
    if (plans.length === 0) {
      console.log("No workout plans exist, skipping mock history seed");
      return;
    }

    const activePlan = plans[0];
    const existingSessions = getCompletedSessionsByPlanId(activePlan.id);
    if (existingSessions.length > 0) {
      console.log("Mock workout history already exists, skipping seed");
      return;
    }

    const sessions = getSessionTemplatesByPlanId(activePlan.id);
    if (sessions.length === 0) {
      console.log("No session templates exist, skipping mock history seed");
      return;
    }

    // Generate history for the past 8 weeks (simulating an 8-week program)
    const today = new Date();
    const weeksToGenerate = 8;

    // Pattern 1: Upward progression - Bench Press (Session 1, Exercise 1)
    // Starting at 135 lbs, increasing to 175 lbs over 8 weeks
    const upwardProgression = [135, 140, 145, 150, 155, 160, 165, 170, 175];

    // Pattern 2: Downward progression - Deadlift (Session 2, Exercise 1) - simulating deload
    // Starting at 315 lbs, decreasing to 275 lbs (intentional deload)
    const downwardProgression = [315, 310, 305, 300, 290, 285, 280, 275];

    // Pattern 3: Up-down trend - Pull-ups (Session 1, Exercise 2) - inconsistent
    // Fluctuating between good and bad days
    const upDownProgression = [50, 55, 52, 58, 54, 60, 56, 62, 58];

    // Generate 2-3 sessions per week for 8 weeks
    for (let week = 0; week < weeksToGenerate; week++) {
      // Session 1 (Upper Body A) - 2x per week
      for (let sessionInWeek = 0; sessionInWeek < 2; sessionInWeek++) {
        const daysAgo = (weeksToGenerate - week) * 7 - sessionInWeek * 3 - 1;
        const sessionDate = new Date(today);
        sessionDate.setDate(sessionDate.getDate() - daysAgo);
        sessionDate.setHours(10, 0, 0, 0);

        const session1 = sessions[0];
        const exercises1 = getExerciseTemplatesBySessionId(session1.id);

        const completedSessionId = insertCompletedSession({
          workout_plan_id: activePlan.id,
          session_template_id: session1.id,
          started_at: sessionDate.toISOString(),
          completed_at: new Date(sessionDate.getTime() + 60 * 60 * 1000).toISOString(),
          notes: null,
        });

        // Exercise 1 - Upward progression (Bench Press)
        if (exercises1[0]) {
          const weekIndex = week + sessionInWeek * 0.5;
          const weight = upwardProgression[Math.min(Math.floor(weekIndex), upwardProgression.length - 1)];

          for (let set = 1; set <= 3; set++) {
            insertCompletedSet({
              completed_session_id: completedSessionId,
              exercise_id: exercises1[0].exercise_id,
              set_number: set,
              weight: weight,
              reps: 8 + Math.floor(Math.random() * 3), // 8-10 reps
              is_warmup: false,
              completed_at: new Date(sessionDate.getTime() + set * 5 * 60 * 1000).toISOString(),
            });
          }
        }

        // Exercise 2 - Up-down progression (Back exercise)
        if (exercises1[1]) {
          const weekIndex = week + sessionInWeek * 0.5;
          const weight = upDownProgression[Math.min(Math.floor(weekIndex), upDownProgression.length - 1)];

          for (let set = 1; set <= 3; set++) {
            insertCompletedSet({
              completed_session_id: completedSessionId,
              exercise_id: exercises1[1].exercise_id,
              set_number: set,
              weight: weight,
              reps: 10 + Math.floor(Math.random() * 3), // 10-12 reps
              is_warmup: false,
              completed_at: new Date(sessionDate.getTime() + (3 + set) * 5 * 60 * 1000).toISOString(),
            });
          }
        }
      }

      // Session 2 (Lower Body) - 1x per week
      const daysAgoSession2 = (weeksToGenerate - week) * 7 - 3;
      const sessionDate2 = new Date(today);
      sessionDate2.setDate(sessionDate2.getDate() - daysAgoSession2);
      sessionDate2.setHours(14, 0, 0, 0);

      if (sessions[1]) {
        const session2 = sessions[1];
        const exercises2 = getExerciseTemplatesBySessionId(session2.id);

        const completedSessionId2 = insertCompletedSession({
          workout_plan_id: activePlan.id,
          session_template_id: session2.id,
          started_at: sessionDate2.toISOString(),
          completed_at: new Date(sessionDate2.getTime() + 70 * 60 * 1000).toISOString(),
          notes: null,
        });

        // Exercise 1 - Downward progression (Leg exercise - simulating deload)
        if (exercises2[0]) {
          const weight = downwardProgression[Math.min(week, downwardProgression.length - 1)];

          for (let set = 1; set <= 4; set++) {
            insertCompletedSet({
              completed_session_id: completedSessionId2,
              exercise_id: exercises2[0].exercise_id,
              set_number: set,
              weight: weight,
              reps: 6 + Math.floor(Math.random() * 3), // 6-8 reps
              is_warmup: false,
              completed_at: new Date(sessionDate2.getTime() + set * 6 * 60 * 1000).toISOString(),
            });
          }
        }
      }

      // Session 3 (Upper Body B) - 1x per week
      const daysAgoSession3 = (weeksToGenerate - week) * 7 - 5;
      const sessionDate3 = new Date(today);
      sessionDate3.setDate(sessionDate3.getDate() - daysAgoSession3);
      sessionDate3.setHours(16, 0, 0, 0);

      if (sessions[2]) {
        const session3 = sessions[2];
        const exercises3 = getExerciseTemplatesBySessionId(session3.id);

        const completedSessionId3 = insertCompletedSession({
          workout_plan_id: activePlan.id,
          session_template_id: session3.id,
          started_at: sessionDate3.toISOString(),
          completed_at: new Date(sessionDate3.getTime() + 55 * 60 * 1000).toISOString(),
          notes: null,
        });

        // Exercises with moderate progression
        exercises3.forEach((exerciseTemplate: any, idx: number) => {
          const baseWeight = 50 + idx * 10;
          const weight = baseWeight + week * 2; // Slow steady progression

          for (let set = 1; set <= 3; set++) {
            insertCompletedSet({
              completed_session_id: completedSessionId3,
              exercise_id: exerciseTemplate.exercise_id,
              set_number: set,
              weight: weight,
              reps: 10 + Math.floor(Math.random() * 3), // 10-12 reps
              is_warmup: false,
              completed_at: new Date(sessionDate3.getTime() + (idx * 3 + set) * 5 * 60 * 1000).toISOString(),
            });
          }
        });
      }
    }

    console.log("Seeded mock workout history with various progression patterns");
  } catch (error) {
    console.error("Failed to seed mock workout history:", error);
    throw error;
  }
}
