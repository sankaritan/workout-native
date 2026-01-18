/**
 * Exercise library seed data
 * Contains comprehensive exercises covering all major muscle groups for all equipment types
 * Minimum 3 exercises per muscle group per equipment type (6 muscle groups × 6 equipment types × 3 = 108+ exercises)
 */

import { insertExercise, getAllExercises } from "./storage";
import type { ExerciseInsert } from "./types";

export const EXERCISES: ExerciseInsert[] = [
  // ============================================================================
  // CHEST EXERCISES
  // ============================================================================

  // Chest - Barbell (3)
  {
    name: "Bench Press",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Shoulders", "Arms"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Classic compound chest exercise performed lying on a flat bench",
  },
  {
    name: "Incline Bench Press",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Shoulders", "Arms"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Bench press variation targeting upper chest",
  },
  {
    name: "Decline Bench Press",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Shoulders", "Arms"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Bench press variation targeting lower chest",
  },

  // Chest - Dumbbell (4)
  {
    name: "Dumbbell Bench Press",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Shoulders", "Arms"],
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Chest press with dumbbells for greater range of motion",
  },
  {
    name: "Incline Dumbbell Press",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Shoulders", "Arms"],
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Dumbbell press on incline bench for upper chest emphasis",
  },
  {
    name: "Dumbbell Flyes",
    muscle_group: "Chest",
    muscle_groups: ["Chest"],
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Isolation exercise for chest stretch and contraction",
  },
  {
    name: "Dumbbell Pullover",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Back"],
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Pullover movement targeting chest and lats",
  },

  // Chest - Bodyweight (3)
  {
    name: "Push-ups",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Shoulders", "Arms"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Bodyweight chest exercise that can be done anywhere",
  },
  {
    name: "Chest Dips",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Arms"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Bodyweight exercise emphasizing lower chest with forward lean",
  },
  {
    name: "Diamond Push-ups",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Arms"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Push-up variation with hands close together for inner chest",
  },

  // Chest - Cables (3)
  {
    name: "Cable Flyes",
    muscle_group: "Chest",
    muscle_groups: ["Chest"],
    equipment_required: "Cables",
    is_compound: false,
    description: "Cable variation of flyes for constant tension",
  },
  {
    name: "Cable Crossover",
    muscle_group: "Chest",
    muscle_groups: ["Chest"],
    equipment_required: "Cables",
    is_compound: false,
    description: "High-to-low cable movement for lower chest definition",
  },
  {
    name: "Low Cable Flyes",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Shoulders"],
    equipment_required: "Cables",
    is_compound: false,
    description: "Low-to-high cable movement targeting upper chest",
  },

  // Chest - Machines (3)
  {
    name: "Chest Press Machine",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Shoulders", "Arms"],
    equipment_required: "Machines",
    is_compound: true,
    description: "Machine-based chest press for controlled movement",
  },
  {
    name: "Pec Deck Machine",
    muscle_group: "Chest",
    muscle_groups: ["Chest"],
    equipment_required: "Machines",
    is_compound: false,
    description: "Machine fly for chest isolation and squeeze",
  },
  {
    name: "Smith Machine Bench Press",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Shoulders", "Arms"],
    equipment_required: "Machines",
    is_compound: true,
    description: "Guided barbell press for stable chest work",
  },

  // Chest - Bands (3)
  {
    name: "Banded Push-ups",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Shoulders", "Arms"],
    equipment_required: "Bands",
    is_compound: true,
    description: "Push-ups with band resistance across back",
  },
  {
    name: "Banded Chest Press",
    muscle_group: "Chest",
    muscle_groups: ["Chest", "Shoulders", "Arms"],
    equipment_required: "Bands",
    is_compound: true,
    description: "Standing chest press using resistance band",
  },
  {
    name: "Banded Chest Flyes",
    muscle_group: "Chest",
    muscle_groups: ["Chest"],
    equipment_required: "Bands",
    is_compound: false,
    description: "Fly movement with bands anchored behind",
  },

  // ============================================================================
  // BACK EXERCISES
  // ============================================================================

  // Back - Barbell (4)
  {
    name: "Deadlift",
    muscle_group: "Back",
    muscle_groups: ["Back", "Legs", "Core"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "King of back exercises, works entire posterior chain",
  },
  {
    name: "Barbell Row",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Bent-over row for mid-back thickness",
  },
  {
    name: "T-Bar Row",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Compound row variation for back thickness",
  },
  {
    name: "Pendlay Row",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Explosive row from dead stop for power and thickness",
  },

  // Back - Dumbbell (3)
  {
    name: "Dumbbell Row",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Single-arm row for unilateral back development",
  },
  {
    name: "Dumbbell Pullover",
    muscle_group: "Back",
    muscle_groups: ["Back", "Chest"],
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Pullover emphasizing lat stretch and contraction",
  },
  {
    name: "Chest-Supported Dumbbell Row",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Row with chest on incline bench to isolate back",
  },

  // Back - Bodyweight (3)
  {
    name: "Pull-ups",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Bodyweight vertical pull for back width",
  },
  {
    name: "Chin-ups",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Underhand grip pull-up variation with bicep emphasis",
  },
  {
    name: "Inverted Row",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Horizontal pull using body weight on low bar",
  },

  // Back - Cables (4)
  {
    name: "Lat Pulldown",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Cables",
    is_compound: true,
    description: "Cable machine exercise for back width",
  },
  {
    name: "Seated Cable Row",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Cables",
    is_compound: true,
    description: "Horizontal cable pull for mid-back thickness",
  },
  {
    name: "Face Pulls",
    muscle_group: "Back",
    muscle_groups: ["Back", "Shoulders"],
    equipment_required: "Cables",
    is_compound: false,
    description: "Cable exercise for rear delts and upper back health",
  },
  {
    name: "Straight Arm Pulldown",
    muscle_group: "Back",
    muscle_groups: ["Back"],
    equipment_required: "Cables",
    is_compound: false,
    description: "Isolation exercise for lat engagement",
  },

  // Back - Machines (3)
  {
    name: "Lat Pulldown Machine",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Machines",
    is_compound: true,
    description: "Machine-based pulldown for consistent lat work",
  },
  {
    name: "Seated Row Machine",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Machines",
    is_compound: true,
    description: "Machine row for controlled back development",
  },
  {
    name: "Assisted Pull-up Machine",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Machines",
    is_compound: true,
    description: "Counterweight machine for pull-up progression",
  },

  // Back - Bands (3)
  {
    name: "Banded Lat Pulldown",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Bands",
    is_compound: true,
    description: "Pulldown movement with band anchored overhead",
  },
  {
    name: "Banded Row",
    muscle_group: "Back",
    muscle_groups: ["Back", "Arms"],
    equipment_required: "Bands",
    is_compound: true,
    description: "Seated or standing row with resistance band",
  },
  {
    name: "Banded Face Pull",
    muscle_group: "Back",
    muscle_groups: ["Back", "Shoulders"],
    equipment_required: "Bands",
    is_compound: false,
    description: "Face pull using band for rear delt and upper back",
  },

  // ============================================================================
  // LEG EXERCISES
  // ============================================================================

  // Legs - Barbell (4)
  {
    name: "Squat",
    muscle_group: "Legs",
    muscle_groups: ["Legs", "Core"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "King of leg exercises, works entire lower body",
  },
  {
    name: "Front Squat",
    muscle_group: "Legs",
    muscle_groups: ["Legs", "Core"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Squat variation with bar in front, emphasizes quads",
  },
  {
    name: "Romanian Deadlift",
    muscle_group: "Legs",
    muscle_groups: ["Legs", "Back"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Hamstring-focused deadlift variation",
  },
  {
    name: "Barbell Hip Thrust",
    muscle_group: "Legs",
    muscle_groups: ["Legs", "Core"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Glute-focused hip extension with barbell",
  },

  // Legs - Dumbbell (3)
  {
    name: "Dumbbell Lunges",
    muscle_group: "Legs",
    muscle_groups: ["Legs", "Core"],
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Unilateral leg exercise for balance and strength",
  },
  {
    name: "Bulgarian Split Squat",
    muscle_group: "Legs",
    muscle_groups: ["Legs", "Core"],
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Single-leg squat variation with rear foot elevated",
  },
  {
    name: "Dumbbell Romanian Deadlift",
    muscle_group: "Legs",
    muscle_groups: ["Legs", "Back"],
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Dumbbell RDL for hamstring development",
  },

  // Legs - Bodyweight (3)
  {
    name: "Bodyweight Squat",
    muscle_group: "Legs",
    muscle_groups: ["Legs", "Core"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Foundational squat pattern without weights",
  },
  {
    name: "Walking Lunges",
    muscle_group: "Legs",
    muscle_groups: ["Legs", "Core"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Dynamic lunge variation for leg strength and balance",
  },
  {
    name: "Glute Bridge",
    muscle_group: "Legs",
    muscle_groups: ["Legs", "Core"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Hip extension exercise for glutes",
  },

  // Legs - Cables (3)
  {
    name: "Cable Pull-Through",
    muscle_group: "Legs",
    muscle_groups: ["Legs", "Core"],
    equipment_required: "Cables",
    is_compound: true,
    description: "Hip hinge movement for glutes and hamstrings",
  },
  {
    name: "Cable Kickback",
    muscle_group: "Legs",
    muscle_groups: ["Legs"],
    equipment_required: "Cables",
    is_compound: false,
    description: "Isolated glute exercise with ankle strap",
  },
  {
    name: "Cable Romanian Deadlift",
    muscle_group: "Legs",
    muscle_groups: ["Legs", "Back"],
    equipment_required: "Cables",
    is_compound: true,
    description: "RDL variation with cable for constant tension",
  },

  // Legs - Machines (5)
  {
    name: "Leg Press",
    muscle_group: "Legs",
    muscle_groups: ["Legs"],
    equipment_required: "Machines",
    is_compound: true,
    description: "Machine-based compound leg exercise",
  },
  {
    name: "Leg Extension",
    muscle_group: "Legs",
    muscle_groups: ["Legs"],
    equipment_required: "Machines",
    is_compound: false,
    description: "Isolation exercise for quadriceps",
  },
  {
    name: "Leg Curl",
    muscle_group: "Legs",
    muscle_groups: ["Legs"],
    equipment_required: "Machines",
    is_compound: false,
    description: "Isolation exercise for hamstrings",
  },
  {
    name: "Calf Raises",
    muscle_group: "Legs",
    muscle_groups: ["Legs"],
    equipment_required: "Machines",
    is_compound: false,
    description: "Isolation exercise for calf development",
  },
  {
    name: "Hack Squat",
    muscle_group: "Legs",
    muscle_groups: ["Legs"],
    equipment_required: "Machines",
    is_compound: true,
    description: "Machine squat for quad-focused leg development",
  },

  // Legs - Bands (3)
  {
    name: "Banded Squat",
    muscle_group: "Legs",
    muscle_groups: ["Legs", "Core"],
    equipment_required: "Bands",
    is_compound: true,
    description: "Squat with band around thighs for glute activation",
  },
  {
    name: "Banded Glute Bridge",
    muscle_group: "Legs",
    muscle_groups: ["Legs", "Core"],
    equipment_required: "Bands",
    is_compound: true,
    description: "Hip bridge with band above knees for glute work",
  },
  {
    name: "Banded Lateral Walk",
    muscle_group: "Legs",
    muscle_groups: ["Legs"],
    equipment_required: "Bands",
    is_compound: true,
    description: "Side steps with band for hip abductor strength",
  },

  // ============================================================================
  // SHOULDER EXERCISES
  // ============================================================================

  // Shoulders - Barbell (3)
  {
    name: "Overhead Press",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders", "Arms", "Core"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Standing barbell press for overall shoulder development",
  },
  {
    name: "Push Press",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders", "Arms", "Legs"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Explosive overhead press with leg drive",
  },
  {
    name: "Barbell Upright Row",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders", "Back"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Compound exercise for shoulders and traps",
  },

  // Shoulders - Dumbbell (5)
  {
    name: "Dumbbell Shoulder Press",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders", "Arms"],
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Seated or standing dumbbell press for shoulders",
  },
  {
    name: "Arnold Press",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders", "Arms"],
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Rotating dumbbell press hitting all three deltoid heads",
  },
  {
    name: "Lateral Raises",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders"],
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Isolation exercise for side deltoids",
  },
  {
    name: "Front Raises",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders"],
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Isolation exercise for front deltoids",
  },
  {
    name: "Rear Delt Flyes",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders"],
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Isolation exercise for rear deltoids",
  },

  // Shoulders - Bodyweight (3)
  {
    name: "Pike Push-ups",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders", "Arms"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Bodyweight exercise targeting shoulders",
  },
  {
    name: "Handstand Push-ups",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders", "Arms", "Core"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Advanced bodyweight shoulder press against wall",
  },
  {
    name: "Wall Walks",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders", "Core"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Walking hands up wall for shoulder strength",
  },

  // Shoulders - Cables (3)
  {
    name: "Cable Lateral Raise",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders"],
    equipment_required: "Cables",
    is_compound: false,
    description: "Lateral raise with cable for constant tension",
  },
  {
    name: "Cable Front Raise",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders"],
    equipment_required: "Cables",
    is_compound: false,
    description: "Front deltoid raise using cable",
  },
  {
    name: "Cable Upright Row",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders", "Back"],
    equipment_required: "Cables",
    is_compound: true,
    description: "Upright row with cable for smooth resistance",
  },

  // Shoulders - Machines (3)
  {
    name: "Shoulder Press Machine",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders", "Arms"],
    equipment_required: "Machines",
    is_compound: true,
    description: "Machine-based overhead press for shoulders",
  },
  {
    name: "Lateral Raise Machine",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders"],
    equipment_required: "Machines",
    is_compound: false,
    description: "Machine for isolated lateral deltoid work",
  },
  {
    name: "Reverse Pec Deck",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders", "Back"],
    equipment_required: "Machines",
    is_compound: false,
    description: "Reverse fly machine for rear deltoids",
  },

  // Shoulders - Bands (3)
  {
    name: "Banded Shoulder Press",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders", "Arms"],
    equipment_required: "Bands",
    is_compound: true,
    description: "Overhead press with resistance band",
  },
  {
    name: "Banded Lateral Raise",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders"],
    equipment_required: "Bands",
    is_compound: false,
    description: "Lateral raise using band stepped under feet",
  },
  {
    name: "Banded Pull-Apart",
    muscle_group: "Shoulders",
    muscle_groups: ["Shoulders", "Back"],
    equipment_required: "Bands",
    is_compound: false,
    description: "Band pulled apart at chest level for rear delts",
  },

  // ============================================================================
  // ARM EXERCISES
  // ============================================================================

  // Arms - Barbell (4)
  {
    name: "Barbell Curl",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Barbell",
    is_compound: false,
    description: "Classic bicep exercise with barbell",
  },
  {
    name: "Close-Grip Bench Press",
    muscle_group: "Arms",
    muscle_groups: ["Arms", "Chest"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Bench press variation emphasizing triceps",
  },
  {
    name: "Skull Crushers",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Barbell",
    is_compound: false,
    description: "Lying tricep extension exercise",
  },
  {
    name: "Preacher Curl",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Barbell",
    is_compound: false,
    description: "Bicep curl on preacher bench for isolation",
  },

  // Arms - Dumbbell (4)
  {
    name: "Dumbbell Curl",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Bicep curl with dumbbells for unilateral work",
  },
  {
    name: "Hammer Curl",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Neutral grip curl for biceps and brachialis",
  },
  {
    name: "Overhead Tricep Extension",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Overhead extension for long head of triceps",
  },
  {
    name: "Dumbbell Kickback",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Tricep isolation with arm extended behind",
  },

  // Arms - Bodyweight (3)
  {
    name: "Tricep Dips",
    muscle_group: "Arms",
    muscle_groups: ["Arms", "Chest"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Bodyweight exercise for triceps on parallel bars",
  },
  {
    name: "Bench Dips",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Tricep dips using a bench for support",
  },
  {
    name: "Close-Grip Push-ups",
    muscle_group: "Arms",
    muscle_groups: ["Arms", "Chest"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Push-ups with narrow hand placement for triceps",
  },

  // Arms - Cables (4)
  {
    name: "Tricep Pushdown",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Cables",
    is_compound: false,
    description: "Cable isolation exercise for triceps",
  },
  {
    name: "Cable Curl",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Cables",
    is_compound: false,
    description: "Bicep curl with cable for constant tension",
  },
  {
    name: "Overhead Cable Extension",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Cables",
    is_compound: false,
    description: "Tricep extension with cable behind head",
  },
  {
    name: "Rope Hammer Curl",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Cables",
    is_compound: false,
    description: "Cable curl with rope for neutral grip",
  },

  // Arms - Machines (3)
  {
    name: "Preacher Curl Machine",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Machines",
    is_compound: false,
    description: "Machine-based bicep curl for isolation",
  },
  {
    name: "Tricep Extension Machine",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Machines",
    is_compound: false,
    description: "Machine for isolated tricep work",
  },
  {
    name: "Assisted Dip Machine",
    muscle_group: "Arms",
    muscle_groups: ["Arms", "Chest"],
    equipment_required: "Machines",
    is_compound: true,
    description: "Counterweight machine for dip progression",
  },

  // Arms - Bands (3)
  {
    name: "Banded Bicep Curl",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Bands",
    is_compound: false,
    description: "Bicep curl with resistance band",
  },
  {
    name: "Banded Tricep Pushdown",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Bands",
    is_compound: false,
    description: "Tricep pushdown with band anchored above",
  },
  {
    name: "Banded Overhead Extension",
    muscle_group: "Arms",
    muscle_groups: ["Arms"],
    equipment_required: "Bands",
    is_compound: false,
    description: "Overhead tricep extension with band",
  },

  // ============================================================================
  // CORE EXERCISES
  // ============================================================================

  // Core - Barbell (3)
  {
    name: "Barbell Rollout",
    muscle_group: "Core",
    muscle_groups: ["Core", "Shoulders"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Ab rollout using barbell for core stability",
  },
  {
    name: "Landmine Rotation",
    muscle_group: "Core",
    muscle_groups: ["Core", "Shoulders"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Rotational exercise with barbell in landmine",
  },
  {
    name: "Barbell Good Morning",
    muscle_group: "Core",
    muscle_groups: ["Core", "Back", "Legs"],
    equipment_required: "Barbell",
    is_compound: true,
    description: "Hip hinge with barbell for posterior chain and core",
  },

  // Core - Dumbbell (3)
  {
    name: "Dumbbell Side Bend",
    muscle_group: "Core",
    muscle_groups: ["Core"],
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Lateral flexion for oblique development",
  },
  {
    name: "Dumbbell Woodchop",
    muscle_group: "Core",
    muscle_groups: ["Core", "Shoulders"],
    equipment_required: "Dumbbell",
    is_compound: true,
    description: "Rotational movement pattern for core strength",
  },
  {
    name: "Weighted Crunch",
    muscle_group: "Core",
    muscle_groups: ["Core"],
    equipment_required: "Dumbbell",
    is_compound: false,
    description: "Crunch holding dumbbell for added resistance",
  },

  // Core - Bodyweight (7)
  {
    name: "Plank",
    muscle_group: "Core",
    muscle_groups: ["Core", "Shoulders"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Isometric core exercise for stability",
  },
  {
    name: "Crunches",
    muscle_group: "Core",
    muscle_groups: ["Core"],
    equipment_required: "Bodyweight",
    is_compound: false,
    description: "Basic abdominal exercise",
  },
  {
    name: "Hanging Leg Raises",
    muscle_group: "Core",
    muscle_groups: ["Core", "Back"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Advanced core exercise hanging from bar",
  },
  {
    name: "Russian Twists",
    muscle_group: "Core",
    muscle_groups: ["Core"],
    equipment_required: "Bodyweight",
    is_compound: false,
    description: "Rotational core exercise for obliques",
  },
  {
    name: "Ab Wheel Rollout",
    muscle_group: "Core",
    muscle_groups: ["Core", "Shoulders"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Advanced core exercise with ab wheel",
  },
  {
    name: "Mountain Climbers",
    muscle_group: "Core",
    muscle_groups: ["Core", "Shoulders"],
    equipment_required: "Bodyweight",
    is_compound: true,
    description: "Dynamic core exercise with cardio element",
  },
  {
    name: "Dead Bug",
    muscle_group: "Core",
    muscle_groups: ["Core"],
    equipment_required: "Bodyweight",
    is_compound: false,
    description: "Core stability exercise performed on back",
  },

  // Core - Cables (3)
  {
    name: "Cable Crunches",
    muscle_group: "Core",
    muscle_groups: ["Core"],
    equipment_required: "Cables",
    is_compound: false,
    description: "Cable machine crunch for progressive overload",
  },
  {
    name: "Cable Woodchop",
    muscle_group: "Core",
    muscle_groups: ["Core", "Shoulders"],
    equipment_required: "Cables",
    is_compound: true,
    description: "Rotational cable movement for obliques",
  },
  {
    name: "Cable Pallof Press",
    muscle_group: "Core",
    muscle_groups: ["Core"],
    equipment_required: "Cables",
    is_compound: false,
    description: "Anti-rotation exercise for core stability",
  },

  // Core - Machines (3)
  {
    name: "Ab Crunch Machine",
    muscle_group: "Core",
    muscle_groups: ["Core"],
    equipment_required: "Machines",
    is_compound: false,
    description: "Machine for weighted ab crunches",
  },
  {
    name: "Torso Rotation Machine",
    muscle_group: "Core",
    muscle_groups: ["Core"],
    equipment_required: "Machines",
    is_compound: false,
    description: "Machine for rotational oblique work",
  },
  {
    name: "Captain's Chair Leg Raise",
    muscle_group: "Core",
    muscle_groups: ["Core"],
    equipment_required: "Machines",
    is_compound: false,
    description: "Leg raise supported by arm rests",
  },

  // Core - Bands (3)
  {
    name: "Banded Pallof Press",
    muscle_group: "Core",
    muscle_groups: ["Core"],
    equipment_required: "Bands",
    is_compound: false,
    description: "Anti-rotation press with resistance band",
  },
  {
    name: "Banded Woodchop",
    muscle_group: "Core",
    muscle_groups: ["Core", "Shoulders"],
    equipment_required: "Bands",
    is_compound: true,
    description: "Rotational chop pattern with band",
  },
  {
    name: "Banded Dead Bug",
    muscle_group: "Core",
    muscle_groups: ["Core"],
    equipment_required: "Bands",
    is_compound: false,
    description: "Dead bug with band resistance for added challenge",
  },
];

/**
 * Migrate existing exercises to add muscle_groups field
 * This ensures backward compatibility with exercises stored before the multi-muscle group update
 */
export function migrateExerciseMuscleGroups(): void {
  try {
    const { updateExercise } = require("./storage");
    const existingExercises = getAllExercises() || [];

    let updatedCount = 0;

    for (const existingEx of existingExercises) {
      // Skip if already has muscle_groups
      if (existingEx.muscle_groups && existingEx.muscle_groups.length > 0) {
        continue;
      }

      // Find matching exercise in seed data to get muscle_groups
      const seedEx = EXERCISES.find((ex) => ex.name === existingEx.name);

      if (seedEx && seedEx.muscle_groups) {
        // Update with muscle_groups from seed data
        updateExercise(existingEx.id, {
          ...existingEx,
          muscle_groups: seedEx.muscle_groups,
        });
        updatedCount++;
      } else {
        // Fallback: create muscle_groups from muscle_group
        updateExercise(existingEx.id, {
          ...existingEx,
          muscle_groups: [existingEx.muscle_group],
        });
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`Migrated ${updatedCount} exercises to multi-muscle group system`);
    }
  } catch (error) {
    console.error("Failed to migrate exercises:", error);
    // Don't throw - migration is optional
  }
}

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

    // Run migration to add muscle_groups to existing exercises
    migrateExerciseMuscleGroups();
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
 * Get exercise count by equipment type for verification
 */
export function getExerciseCountByEquipment(): Record<string, number> {
  const counts: Record<string, number> = {
    Barbell: 0,
    Dumbbell: 0,
    Bodyweight: 0,
    Cables: 0,
    Machines: 0,
    Bands: 0,
  };

  for (const exercise of EXERCISES) {
    if (exercise.equipment_required) {
      counts[exercise.equipment_required]++;
    }
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
