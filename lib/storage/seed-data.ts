/**
 * Exercise library seed data
 * Contains 50+ exercises covering all major muscle groups
 */

import { insertExercise, getAllExercises } from "./db-utils";
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
    const existingExercises = getAllExercises();
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
