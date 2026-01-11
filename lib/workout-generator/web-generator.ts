/**
 * Web-specific workout generator
 * Uses mock exercise data since database is not available on web
 */

import { distributeMuscleGroups } from "./muscle-groups";
import {
  filterExercisesByEquipment,
  selectExercisesForMuscles,
  orderExercises,
} from "./exercise-selector";
import { getSetsRepsScheme } from "./engine";
import type {
  GenerationInput,
  WorkoutProgram,
  ProgramSession,
  ProgramExercise,
} from "./types";
import type { Exercise } from "@/lib/storage/types";

// Mock exercise data for web testing
const MOCK_EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "Bench Press",
    muscle_group: "Chest",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Compound chest exercise",
  },
  {
    id: 2,
    name: "Incline Dumbbell Press",
    muscle_group: "Chest",
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Upper chest exercise",
  },
  {
    id: 3,
    name: "Push-up",
    muscle_group: "Chest",
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Bodyweight chest exercise",
  },
  {
    id: 4,
    name: "Cable Fly",
    muscle_group: "Chest",
    equipment_required: "Cables",
    is_compound: false,
    description: "Chest isolation",
  },
  {
    id: 5,
    name: "Squat",
    muscle_group: "Legs",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Compound leg exercise",
  },
  {
    id: 6,
    name: "Romanian Deadlift",
    muscle_group: "Legs",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Hamstring exercise",
  },
  {
    id: 7,
    name: "Leg Press",
    muscle_group: "Legs",
    equipment_required: "Machines",
    is_compound: true,
    description: "Machine leg exercise",
  },
  {
    id: 8,
    name: "Lunges",
    muscle_group: "Legs",
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Bodyweight leg exercise",
  },
  {
    id: 9,
    name: "Deadlift",
    muscle_group: "Back",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Compound back exercise",
  },
  {
    id: 10,
    name: "Pull-up",
    muscle_group: "Back",
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Bodyweight back exercise",
  },
  {
    id: 11,
    name: "Barbell Row",
    muscle_group: "Back",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Compound rowing exercise",
  },
  {
    id: 12,
    name: "Lat Pulldown",
    muscle_group: "Back",
    equipment_required: "Cables",
    is_compound: true,
    description: "Cable back exercise",
  },
  {
    id: 13,
    name: "Cable Row",
    muscle_group: "Back",
    equipment_required: "Cables",
    is_compound: true,
    description: "Cable rowing exercise",
  },
  {
    id: 14,
    name: "Overhead Press",
    muscle_group: "Shoulders",
    equipment_required: "Barbell",
    is_compound: true,
    description: "Compound shoulder exercise",
  },
  {
    id: 15,
    name: "Dumbbell Shoulder Press",
    muscle_group: "Shoulders",
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Dumbbell shoulder press",
  },
  {
    id: 16,
    name: "Lateral Raise",
    muscle_group: "Shoulders",
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Shoulder isolation",
  },
  {
    id: 17,
    name: "Face Pulls",
    muscle_group: "Shoulders",
    equipment_required: "Cables",
    is_compound: false,
    description: "Rear delt exercise",
  },
  {
    id: 18,
    name: "Barbell Curl",
    muscle_group: "Arms",
    equipment_required: "Barbell",
    is_compound: false,
    description: "Bicep exercise",
  },
  {
    id: 19,
    name: "Dumbbell Curl",
    muscle_group: "Arms",
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Bicep exercise",
  },
  {
    id: 20,
    name: "Tricep Dips",
    muscle_group: "Arms",
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Bodyweight tricep exercise",
  },
  {
    id: 21,
    name: "Cable Tricep Extension",
    muscle_group: "Arms",
    equipment_required: "Cables",
    is_compound: false,
    description: "Tricep isolation",
  },
  {
    id: 22,
    name: "Plank",
    muscle_group: "Core",
    equipment_required: "Bodyweight",
    is_compound: false,
    description: "Core stability",
  },
  {
    id: 23,
    name: "Cable Crunch",
    muscle_group: "Core",
    equipment_required: "Cables",
    is_compound: false,
    description: "Ab exercise",
  },
  {
    id: 24,
    name: "Hanging Leg Raise",
    muscle_group: "Core",
    equipment_required: "Bodyweight",
    is_compound: false,
    description: "Advanced core exercise",
  },
  {
    id: 25,
    name: "Resistance Band Squat",
    muscle_group: "Legs",
    equipment_required: "Bands",
    is_compound: true,
    description: "Band leg exercise",
  },
  {
    id: 26,
    name: "Band Pull-Apart",
    muscle_group: "Back",
    equipment_required: "Bands",
    is_compound: false,
    description: "Band back exercise",
  },
  {
    id: 27,
    name: "Band Chest Press",
    muscle_group: "Chest",
    equipment_required: "Bands",
    is_compound: true,
    description: "Band chest exercise",
  },
];

/**
 * Generate workout program using mock data (for web platform)
 */
export function generateWorkoutProgramWithMockData(
  input: GenerationInput
): WorkoutProgram {
  const { frequency, equipment, focus } = input;

  // Filter exercises by available equipment
  const availableExercises = filterExercisesByEquipment(MOCK_EXERCISES, equipment);

  console.log(`Mock exercises available: ${availableExercises.length}`);

  // Get training split and muscle distribution
  const sessionTemplates = distributeMuscleGroups(frequency);

  // Get sets/reps scheme
  const scheme = getSetsRepsScheme(focus);

  // Generate sessions
  const sessions: ProgramSession[] = sessionTemplates.map((template) => {
    // Select exercises for this session's muscle groups
    const maxExercisesPerSession = 5;
    const selectedExercises = selectExercisesForMuscles(
      availableExercises,
      template.muscles,
      maxExercisesPerSession
    );

    // Order exercises (compound first)
    const orderedExercises = orderExercises(selectedExercises);

    // Create program exercises with sets/reps
    const programExercises: ProgramExercise[] = orderedExercises.map(
      (exercise, index) => ({
        exercise,
        sets: scheme.sets,
        repsMin: scheme.repsMin,
        repsMax: scheme.repsMax,
        order: index + 1,
      })
    );

    return {
      name: template.name,
      dayOfWeek: template.dayOfWeek,
      exercises: programExercises,
      primaryMuscles: template.muscles,
    };
  });

  // Create program name
  const programName = `${focus} Program (${frequency}x/week)`;

  return {
    name: programName,
    focus,
    durationWeeks: 8,
    sessionsPerWeek: frequency,
    sessions,
  };
}
