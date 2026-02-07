import { getSetsRepsScheme, generateWorkoutProgramFromCustomExercises } from "@/lib/workout-generator/engine";
import * as storage from "@/lib/storage/storage";
import type { GenerationInput } from "@/lib/workout-generator/types";
import type { Exercise, MuscleGroup } from "@/lib/storage/types";
import { isCompoundPriority } from "@/lib/storage/types";

// Mock storage utilities
jest.mock("@/lib/storage/storage");

describe("Workout Generation Engine", () => {
  const mockExercises: Exercise[] = [
    {
      id: 1,
      name: "Bench Press",
      muscle_group: "Chest",
      muscle_groups: ["Chest", "Shoulders", "Arms"],
      equipment_required: "Barbell",
      priority: 1,
      description: "Compound chest exercise",
    },
    {
      id: 2,
      name: "Squat",
      muscle_group: "Legs",
      muscle_groups: ["Legs", "Core"],
      equipment_required: "Barbell",
      priority: 1,
      description: "Compound leg exercise",
    },
    {
      id: 3,
      name: "Deadlift",
      muscle_group: "Back",
      muscle_groups: ["Back", "Legs", "Core"],
      equipment_required: "Barbell",
      priority: 1,
      description: "Compound back exercise",
    },
    {
      id: 4,
      name: "Overhead Press",
      muscle_group: "Shoulders",
      muscle_groups: ["Shoulders", "Arms", "Core"],
      equipment_required: "Barbell",
      priority: 2,
      description: "Compound shoulder exercise",
    },
    {
      id: 5,
      name: "Bicep Curl",
      muscle_group: "Arms",
      muscle_groups: ["Arms"],
      equipment_required: "Dumbbell",
      priority: 4,
      description: "Isolation arm exercise",
    },
    {
      id: 6,
      name: "Push-up",
      muscle_group: "Chest",
      muscle_groups: ["Chest", "Shoulders", "Arms"],
      equipment_required: "Bodyweight",
      priority: 3,
      description: "Bodyweight chest exercise",
    },
    {
      id: 7,
      name: "Pull-up",
      muscle_group: "Back",
      muscle_groups: ["Back", "Arms"],
      equipment_required: "Bodyweight",
      priority: 2,
      description: "Bodyweight back exercise",
    },
    {
      id: 8,
      name: "Dumbbell Fly",
      muscle_group: "Chest",
      muscle_groups: ["Chest"],
      equipment_required: "Dumbbell",
      priority: 4,
      description: "Isolation chest exercise",
    },
    {
      id: 9,
      name: "Leg Press",
      muscle_group: "Legs",
      muscle_groups: ["Legs"],
      equipment_required: "Machines",
      priority: 3,
      description: "Machine leg exercise",
    },
    {
      id: 10,
      name: "Lat Pulldown",
      muscle_group: "Back",
      muscle_groups: ["Back", "Arms"],
      equipment_required: "Cables",
      priority: 3,
      description: "Cable back exercise",
    },
  ];

  beforeEach(() => {
    // Mock getAllExercises to return test data
    jest.spyOn(storage, "getAllExercises").mockReturnValue(mockExercises);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getSetsRepsScheme", () => {
    it("returns 3x8-12 for Balanced", () => {
      const scheme = getSetsRepsScheme("Balanced");
      expect(scheme.sets).toBe(3);
      expect(scheme.repsMin).toBe(8);
      expect(scheme.repsMax).toBe(12);
    });

    it("returns 5x3-5 for Strength", () => {
      const scheme = getSetsRepsScheme("Strength");
      expect(scheme.sets).toBe(5);
      expect(scheme.repsMin).toBe(3);
      expect(scheme.repsMax).toBe(5);
    });

    it("returns 3x15-20 for Endurance", () => {
      const scheme = getSetsRepsScheme("Endurance");
      expect(scheme.sets).toBe(3);
      expect(scheme.repsMin).toBe(15);
      expect(scheme.repsMax).toBe(20);
    });
  });


  describe("generateWorkoutProgramFromCustomExercises", () => {
    // Custom exercises for testing - flat array with muscle_groups
    const customExercises: Exercise[] = [
      { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest", "Shoulders", "Arms"], equipment_required: "Barbell", priority: 1, description: null },
      { id: 2, name: "Dumbbell Fly", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Dumbbell", priority: 4, description: null },
      { id: 3, name: "Deadlift", muscle_group: "Back", muscle_groups: ["Back", "Legs", "Core"], equipment_required: "Barbell", priority: 1, description: null },
      { id: 4, name: "Pull-up", muscle_group: "Back", muscle_groups: ["Back", "Arms"], equipment_required: "Bodyweight", priority: 2, description: null },
      { id: 5, name: "Squat", muscle_group: "Legs", muscle_groups: ["Legs", "Core"], equipment_required: "Barbell", priority: 1, description: null },
      { id: 6, name: "Leg Curl", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Machines", priority: 4, description: null },
      { id: 7, name: "Overhead Press", muscle_group: "Shoulders", muscle_groups: ["Shoulders", "Arms", "Core"], equipment_required: "Barbell", priority: 2, description: null },
      { id: 8, name: "Lateral Raise", muscle_group: "Shoulders", muscle_groups: ["Shoulders"], equipment_required: "Dumbbell", priority: 4, description: null },
      { id: 9, name: "Bicep Curl", muscle_group: "Arms", muscle_groups: ["Arms"], equipment_required: "Dumbbell", priority: 4, description: null },
      { id: 10, name: "Tricep Dips", muscle_group: "Arms", muscle_groups: ["Arms", "Chest"], equipment_required: "Bodyweight", priority: 3, description: null },
      { id: 11, name: "Plank", muscle_group: "Core", muscle_groups: ["Core", "Shoulders"], equipment_required: "Bodyweight", priority: 5, description: null },
    ];

    it("generates program with correct number of sessions for frequency 2", () => {
      const input: GenerationInput = {
        frequency: 2,
        equipment: ["Barbell", "Dumbbell", "Bodyweight"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, customExercises);

      expect(program.sessionsPerWeek).toBe(2);
      expect(program.sessions).toHaveLength(2);
    });

    it("generates program with correct number of sessions for frequency 4", () => {
      const input: GenerationInput = {
        frequency: 4,
        equipment: ["Barbell"],
        focus: "Strength",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, customExercises);

      expect(program.sessionsPerWeek).toBe(4);
      expect(program.sessions).toHaveLength(4);
    });

    it("only includes exercises from customExercises", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell", "Dumbbell", "Bodyweight"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, customExercises);
      const allExercises = program.sessions.flatMap((s) => s.exercises.map((e) => e.exercise));
      const customExerciseIds = customExercises.map((e) => e.id);

      allExercises.forEach((exercise) => {
        expect(customExerciseIds).toContain(exercise.id);
      });
    });

    it("assigns sets/reps based on focus", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell"],
        focus: "Strength",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, customExercises);
      const allExercises = program.sessions.flatMap((s) => s.exercises);

      allExercises.forEach((ex) => {
        expect(ex.sets).toBe(5);
        expect(ex.repsMin).toBe(3);
        expect(ex.repsMax).toBe(5);
      });
    });

    it("places priority exercises first in each session", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell", "Dumbbell", "Bodyweight"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, customExercises);

      program.sessions.forEach((session) => {
        if (session.exercises.length > 1) {
          const hasPriority = session.exercises.some((e) => e.exercise.priority <= 3);
          if (hasPriority) {
            expect(session.exercises[0].exercise.priority).toBeLessThanOrEqual(3);
          }
        }
      });
    });

    it("assigns sequential order numbers", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, customExercises);

      program.sessions.forEach((session) => {
        const orders = session.exercises.map((e) => e.order);
        expect(orders).toEqual([...Array(session.exercises.length)].map((_, i) => i + 1));
      });
    });

    it("includes exercises that work muscles targeted in each session", () => {
      const input: GenerationInput = {
        frequency: 4, // Upper/Lower split
        equipment: ["Barbell", "Dumbbell", "Bodyweight"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, customExercises);

      program.sessions.forEach((session) => {
        // Most exercises should work the session's target muscles
        // (but some might not if needed to meet minimum requirements)
        const matchingExercises = session.exercises.filter((programEx) =>
          programEx.exercise.muscle_groups.some((mg) =>
            session.primaryMuscles.includes(mg)
          )
        );

        // At least 75% of exercises should match target muscles
        const matchPercentage = matchingExercises.length / session.exercises.length;
        expect(matchPercentage).toBeGreaterThanOrEqual(0.75);
      });
    });

    it("generates correct program name with focus", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell"],
        focus: "Endurance",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, customExercises);

      expect(program.name).toContain("Endurance");
      expect(program.focus).toBe("Endurance");
    });

    it("handles limited exercise selection gracefully", () => {
      // Only 2 exercises - one chest, one legs
      const customWithLimited: Exercise[] = [
        { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest", "Shoulders", "Arms"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 2, name: "Squat", muscle_group: "Legs", muscle_groups: ["Legs", "Core"], equipment_required: "Barbell", priority: 1, description: null },
      ];

      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell"],
        focus: "Balanced",
      };

      // Should not throw
      const program = generateWorkoutProgramFromCustomExercises(input, customWithLimited);

      // Sessions should exist but might have limited exercises
      expect(program.sessions).toHaveLength(3);
    });

    it("distributes exercises across full body sessions", () => {
      const input: GenerationInput = {
        frequency: 3, // Full body split
        equipment: ["Barbell", "Dumbbell", "Bodyweight"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, customExercises);

      // Across all sessions, multiple muscle groups should be represented
      const allMuscleGroupsAcrossSessions = new Set<string>();
      program.sessions.forEach((session) => {
        session.exercises.forEach((e) => {
          allMuscleGroupsAcrossSessions.add(e.exercise.muscle_group);
        });
      });

      // Full body split should target multiple muscle groups across all sessions
      expect(allMuscleGroupsAcrossSessions.size).toBeGreaterThan(2);

      // Each session should have at least 1 exercise (since we limit to 6 per session,
      // it's acceptable for individual sessions to focus on fewer muscle groups)
      program.sessions.forEach((session) => {
        expect(session.exercises.length).toBeGreaterThan(0);
        expect(session.exercises.length).toBeLessThanOrEqual(6); // Max 6 exercises per session
      });
    });

    it("enforces minimum 4 exercises per session", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell", "Dumbbell", "Bodyweight"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, customExercises);

      program.sessions.forEach((session) => {
        expect(session.exercises.length).toBeGreaterThanOrEqual(4);
        expect(session.exercises.length).toBeLessThanOrEqual(6);
      });
    });

    it("repeats exercises when insufficient to meet minimum (9 exercises, 3 sessions)", () => {
      // 9 exercises with 3 sessions and min 4 per session = need 12 total
      // Should repeat 3 exercises across sessions
      const nineExercises: Exercise[] = [
        { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 2, name: "Squat", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 3, name: "Deadlift", muscle_group: "Back", muscle_groups: ["Back"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 4, name: "Overhead Press", muscle_group: "Shoulders", muscle_groups: ["Shoulders"], equipment_required: "Barbell", priority: 2, description: null },
        { id: 5, name: "Pull-up", muscle_group: "Back", muscle_groups: ["Back"], equipment_required: "Bodyweight", priority: 2, description: null },
        { id: 6, name: "Leg Press", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Machines", priority: 3, description: null },
        { id: 7, name: "Dumbbell Fly", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Dumbbell", priority: 4, description: null },
        { id: 8, name: "Bicep Curl", muscle_group: "Arms", muscle_groups: ["Arms"], equipment_required: "Dumbbell", priority: 4, description: null },
        { id: 9, name: "Lateral Raise", muscle_group: "Shoulders", muscle_groups: ["Shoulders"], equipment_required: "Dumbbell", priority: 4, description: null },
      ];

      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell", "Dumbbell", "Bodyweight", "Machines"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, nineExercises);

      // Each session should have at least 4 exercises
      program.sessions.forEach((session) => {
        expect(session.exercises.length).toBeGreaterThanOrEqual(4);
      });

      // Total exercises across sessions should be at least 12 (3 sessions * 4 min)
      const totalExercises = program.sessions.reduce(
        (sum, session) => sum + session.exercises.length,
        0
      );
      expect(totalExercises).toBeGreaterThanOrEqual(12);

      // Some exercises must appear in multiple sessions (repetition)
      const allExerciseIds = program.sessions.flatMap((s) =>
        s.exercises.map((e) => e.exercise.id)
      );
      const uniqueExerciseIds = new Set(allExerciseIds);
      expect(allExerciseIds.length).toBeGreaterThan(uniqueExerciseIds.size);
    });

    it("prioritizes compound exercises when repeating", () => {
      // Use exercises with mix of compound and isolation
      const mixedExercises: Exercise[] = [
        { id: 1, name: "Squat", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 2, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 3, name: "Deadlift", muscle_group: "Back", muscle_groups: ["Back"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 4, name: "Bicep Curl", muscle_group: "Arms", muscle_groups: ["Arms"], equipment_required: "Dumbbell", priority: 4, description: null },
        { id: 5, name: "Tricep Extension", muscle_group: "Arms", muscle_groups: ["Arms"], equipment_required: "Dumbbell", priority: 4, description: null },
        { id: 6, name: "Lateral Raise", muscle_group: "Shoulders", muscle_groups: ["Shoulders"], equipment_required: "Dumbbell", priority: 4, description: null },
        { id: 7, name: "Calf Raise", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Bodyweight", priority: 4, description: null },
        { id: 8, name: "Leg Curl", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Machines", priority: 4, description: null },
        { id: 9, name: "Leg Extension", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Machines", priority: 4, description: null },
      ];

      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell", "Dumbbell", "Bodyweight", "Machines"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, mixedExercises);

      // Find exercises that appear in multiple sessions (repeated exercises)
      const exerciseSessionCount = new Map<number, number>();
      program.sessions.forEach((session) => {
        session.exercises.forEach((e) => {
          const count = exerciseSessionCount.get(e.exercise.id) || 0;
          exerciseSessionCount.set(e.exercise.id, count + 1);
        });
      });

      const repeatedExerciseIds = Array.from(exerciseSessionCount.entries())
        .filter(([_, count]) => count > 1)
        .map(([id, _]) => id);

      // If there are repeated exercises, check that compounds are among them
      if (repeatedExerciseIds.length > 0) {
        const repeatedExercises = mixedExercises.filter((e) =>
          repeatedExerciseIds.includes(e.id)
        );
        const compoundRepeated = repeatedExercises.filter((e) => isCompoundPriority(e.priority));

        // At least one compound should be repeated
        expect(compoundRepeated.length).toBeGreaterThan(0);
      }
    });

    it("maintains balanced distribution [4,4,5] over [3,3,6]", () => {
      // 13 exercises should distribute as [4,4,5] or [4,5,4] or [5,4,4], not [3,3,7] or [3,6,4]
      const thirteenExercises: Exercise[] = [
        { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 2, name: "Squat", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 3, name: "Deadlift", muscle_group: "Back", muscle_groups: ["Back"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 4, name: "Overhead Press", muscle_group: "Shoulders", muscle_groups: ["Shoulders"], equipment_required: "Barbell", priority: 2, description: null },
        { id: 5, name: "Pull-up", muscle_group: "Back", muscle_groups: ["Back"], equipment_required: "Bodyweight", priority: 2, description: null },
        { id: 6, name: "Dip", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Bodyweight", priority: 3, description: null },
        { id: 7, name: "Row", muscle_group: "Back", muscle_groups: ["Back"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 8, name: "Lunge", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Bodyweight", priority: 3, description: null },
        { id: 9, name: "Bicep Curl", muscle_group: "Arms", muscle_groups: ["Arms"], equipment_required: "Dumbbell", priority: 4, description: null },
        { id: 10, name: "Tricep Extension", muscle_group: "Arms", muscle_groups: ["Arms"], equipment_required: "Dumbbell", priority: 4, description: null },
        { id: 11, name: "Lateral Raise", muscle_group: "Shoulders", muscle_groups: ["Shoulders"], equipment_required: "Dumbbell", priority: 4, description: null },
        { id: 12, name: "Calf Raise", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Bodyweight", priority: 4, description: null },
        { id: 13, name: "Plank", muscle_group: "Core", muscle_groups: ["Core"], equipment_required: "Bodyweight", priority: 5, description: null },
      ];

      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell", "Dumbbell", "Bodyweight"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, thirteenExercises);

      const counts = program.sessions.map((s) => s.exercises.length);
      const minCount = Math.min(...counts);
      const maxCount = Math.max(...counts);

      // Distribution should be balanced (difference of at most 1)
      expect(maxCount - minCount).toBeLessThanOrEqual(1);

      // All sessions should have at least 4 exercises
      expect(minCount).toBeGreaterThanOrEqual(4);
    });

    it("respects max 6 exercises even when repeating", () => {
      // Ensure that repetition logic doesn't violate max constraint
      const sevenExercises: Exercise[] = [
        { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 2, name: "Squat", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 3, name: "Deadlift", muscle_group: "Back", muscle_groups: ["Back"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 4, name: "Overhead Press", muscle_group: "Shoulders", muscle_groups: ["Shoulders"], equipment_required: "Barbell", priority: 2, description: null },
        { id: 5, name: "Pull-up", muscle_group: "Back", muscle_groups: ["Back"], equipment_required: "Bodyweight", priority: 2, description: null },
        { id: 6, name: "Dip", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Bodyweight", priority: 3, description: null },
        { id: 7, name: "Row", muscle_group: "Back", muscle_groups: ["Back"], equipment_required: "Barbell", priority: 1, description: null },
      ];

      const input: GenerationInput = {
        frequency: 2,
        equipment: ["Barbell", "Bodyweight"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, sevenExercises);

      program.sessions.forEach((session) => {
        expect(session.exercises.length).toBeLessThanOrEqual(6);
        expect(session.exercises.length).toBeGreaterThanOrEqual(4);
      });
    });
  });

  describe("High-recovery exercise spacing", () => {
    it("prevents same high-recovery exercise on consecutive days in 4-day split", () => {
      // Create a scenario with multiple high-recovery exercises (Priority 1 + Barbell)
      const exercises: Exercise[] = [
        { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest", "Shoulders", "Arms"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 2, name: "Squat", muscle_group: "Legs", muscle_groups: ["Legs", "Core"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 3, name: "Deadlift", muscle_group: "Back", muscle_groups: ["Back", "Legs", "Core"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 4, name: "Barbell Row", muscle_group: "Back", muscle_groups: ["Back", "Arms"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 5, name: "Pull-up", muscle_group: "Back", muscle_groups: ["Back", "Arms"], equipment_required: "Bodyweight", priority: 2, description: null },
        { id: 6, name: "Dumbbell Fly", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Dumbbell", priority: 4, description: null },
        { id: 7, name: "Leg Press", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Machines", priority: 3, description: null },
        { id: 8, name: "Lateral Raise", muscle_group: "Shoulders", muscle_groups: ["Shoulders"], equipment_required: "Dumbbell", priority: 4, description: null },
        { id: 9, name: "Bicep Curl", muscle_group: "Arms", muscle_groups: ["Arms"], equipment_required: "Dumbbell", priority: 4, description: null },
        { id: 10, name: "Tricep Extension", muscle_group: "Arms", muscle_groups: ["Arms"], equipment_required: "Dumbbell", priority: 4, description: null },
      ];

      const input: GenerationInput = {
        frequency: 4, // Upper/Lower split: Mon/Tue, Thu/Fri
        equipment: ["Barbell", "Dumbbell", "Bodyweight", "Machines"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, exercises);

      // Check each pair of consecutive days
      // 4-day Upper/Lower: Day 1 (Mon), Day 2 (Tue), Day 4 (Thu), Day 5 (Fri)
      const consecutivePairs = [
        [0, 1], // Monday-Tuesday
        [2, 3], // Thursday-Friday
      ];

      for (const [dayA, dayB] of consecutivePairs) {
        const sessionA = program.sessions[dayA];
        const sessionB = program.sessions[dayB];

        const highRecoveryA = sessionA.exercises.filter(
          (pe) => pe.exercise.priority === 1 && pe.exercise.equipment_required === "Barbell"
        );
        const highRecoveryB = sessionB.exercises.filter(
          (pe) => pe.exercise.priority === 1 && pe.exercise.equipment_required === "Barbell"
        );

        // Check that no SAME exercise appears on both consecutive days
        const exerciseIdsA = new Set(highRecoveryA.map((pe) => pe.exercise.id));
        const exerciseIdsB = new Set(highRecoveryB.map((pe) => pe.exercise.id));
        
        const duplicates = [...exerciseIdsA].filter((id) => exerciseIdsB.has(id));
        
        if (duplicates.length > 0) {
          const duplicateNames = duplicates.map(id => 
            highRecoveryA.find(pe => pe.exercise.id === id)?.exercise.name
          );
          console.log(`Session ${dayA + 1} (${sessionA.name}):`, highRecoveryA.map(pe => pe.exercise.name));
          console.log(`Session ${dayB + 1} (${sessionB.name}):`, highRecoveryB.map(pe => pe.exercise.name));
          console.log(`Duplicate high-recovery exercises:`, duplicateNames);
        }

        expect(duplicates.length).toBe(0);
      }
    });

    it("prevents same high-recovery exercise on consecutive days in 5-day split", () => {
      const exercises: Exercise[] = [
        { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest", "Shoulders", "Arms"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 2, name: "Squat", muscle_group: "Legs", muscle_groups: ["Legs", "Core"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 3, name: "Deadlift", muscle_group: "Back", muscle_groups: ["Back", "Legs", "Core"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 4, name: "Barbell Row", muscle_group: "Back", muscle_groups: ["Back", "Arms"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 5, name: "Pull-up", muscle_group: "Back", muscle_groups: ["Back", "Arms"], equipment_required: "Bodyweight", priority: 2, description: null },
        { id: 6, name: "Dumbbell Fly", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Dumbbell", priority: 4, description: null },
        { id: 7, name: "Leg Press", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Machines", priority: 3, description: null },
        { id: 8, name: "Lateral Raise", muscle_group: "Shoulders", muscle_groups: ["Shoulders"], equipment_required: "Dumbbell", priority: 4, description: null },
        { id: 9, name: "Leg Curl", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Machines", priority: 4, description: null },
        { id: 10, name: "Face Pull", muscle_group: "Back", muscle_groups: ["Back", "Shoulders"], equipment_required: "Cables", priority: 4, description: null },
        { id: 11, name: "Plank", muscle_group: "Core", muscle_groups: ["Core"], equipment_required: "Bodyweight", priority: 5, description: null },
      ];

      const input: GenerationInput = {
        frequency: 5, // PPL split: Mon/Tue/Wed, Fri/Sat
        equipment: ["Barbell", "Dumbbell", "Bodyweight", "Machines", "Cables"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, exercises);

      // Check consecutive day pairs in 5-day split
      // PPL: Day 1 (Mon), Day 2 (Tue), Day 3 (Wed), Day 5 (Fri), Day 6 (Sat)
      const consecutivePairs = [
        [0, 1], // Monday-Tuesday
        [1, 2], // Tuesday-Wednesday
        [3, 4], // Friday-Saturday
      ];

      for (const [dayA, dayB] of consecutivePairs) {
        const sessionA = program.sessions[dayA];
        const sessionB = program.sessions[dayB];

        const highRecoveryA = sessionA.exercises.filter(
          (pe) => pe.exercise.priority === 1 && pe.exercise.equipment_required === "Barbell"
        );
        const highRecoveryB = sessionB.exercises.filter(
          (pe) => pe.exercise.priority === 1 && pe.exercise.equipment_required === "Barbell"
        );

        // Check that no SAME exercise appears on both consecutive days
        const exerciseIdsA = new Set(highRecoveryA.map((pe) => pe.exercise.id));
        const exerciseIdsB = new Set(highRecoveryB.map((pe) => pe.exercise.id));
        
        const duplicates = [...exerciseIdsA].filter((id) => exerciseIdsB.has(id));

        if (duplicates.length > 0) {
          const duplicateNames = duplicates.map(id => 
            highRecoveryA.find(pe => pe.exercise.id === id)?.exercise.name
          );
          console.log(`Session ${dayA + 1} (${sessionA.name}):`, highRecoveryA.map(pe => pe.exercise.name));
          console.log(`Session ${dayB + 1} (${sessionB.name}):`, highRecoveryB.map(pe => pe.exercise.name));
          console.log(`Duplicate high-recovery exercises:`, duplicateNames);
        }

        expect(duplicates.length).toBe(0);
      }
    });

    it("allows different high-recovery exercises on consecutive days", () => {
      // It's OK to have Bench Press on Monday and Squat on Tuesday (different exercises)
      const exercises: Exercise[] = [
        { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest", "Shoulders", "Arms"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 2, name: "Squat", muscle_group: "Legs", muscle_groups: ["Legs", "Core"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 3, name: "Deadlift", muscle_group: "Back", muscle_groups: ["Back", "Legs", "Core"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 4, name: "Barbell Row", muscle_group: "Back", muscle_groups: ["Back", "Arms"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 5, name: "Pull-up", muscle_group: "Back", muscle_groups: ["Back", "Arms"], equipment_required: "Bodyweight", priority: 2, description: null },
        { id: 6, name: "Dumbbell Fly", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Dumbbell", priority: 4, description: null },
      ];

      const input: GenerationInput = {
        frequency: 4,
        equipment: ["Barbell", "Dumbbell", "Bodyweight"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, exercises);
      
      // Verify that we CAN have high-recovery exercises on consecutive days (just not the same one)
      let foundConsecutiveHighRecovery = false;
      const consecutivePairs = [[0, 1], [2, 3]];
      
      for (const [dayA, dayB] of consecutivePairs) {
        const sessionA = program.sessions[dayA];
        const sessionB = program.sessions[dayB];

        const highRecoveryA = sessionA.exercises.filter(
          (pe) => pe.exercise.priority === 1 && pe.exercise.equipment_required === "Barbell"
        );
        const highRecoveryB = sessionB.exercises.filter(
          (pe) => pe.exercise.priority === 1 && pe.exercise.equipment_required === "Barbell"
        );

        if (highRecoveryA.length > 0 && highRecoveryB.length > 0) {
          foundConsecutiveHighRecovery = true;
        }
      }

      // We should be able to have different high-recovery exercises on consecutive days
      expect(foundConsecutiveHighRecovery).toBe(true);
    });

    it("does not apply spacing logic to 2-day and 3-day splits", () => {
      // 2-day and 3-day splits naturally have rest days between sessions
      const exercises: Exercise[] = [
        { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest", "Shoulders", "Arms"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 2, name: "Squat", muscle_group: "Legs", muscle_groups: ["Legs", "Core"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 3, name: "Deadlift", muscle_group: "Back", muscle_groups: ["Back", "Legs", "Core"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 4, name: "Barbell Row", muscle_group: "Back", muscle_groups: ["Back", "Arms"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 5, name: "Pull-up", muscle_group: "Back", muscle_groups: ["Back", "Arms"], equipment_required: "Bodyweight", priority: 2, description: null },
        { id: 6, name: "Dumbbell Fly", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Dumbbell", priority: 4, description: null },
      ];

      // Test 2-day split
      const input2Day: GenerationInput = {
        frequency: 2,
        equipment: ["Barbell", "Dumbbell", "Bodyweight"],
        focus: "Balanced",
      };

      const program2Day = generateWorkoutProgramFromCustomExercises(input2Day, exercises);
      
      // Should successfully create program without errors
      expect(program2Day.sessions).toHaveLength(2);
      expect(program2Day.sessions[0].exercises.length).toBeGreaterThanOrEqual(4);

      // Test 3-day split
      const input3Day: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell", "Dumbbell", "Bodyweight"],
        focus: "Balanced",
      };

      const program3Day = generateWorkoutProgramFromCustomExercises(input3Day, exercises);
      
      expect(program3Day.sessions).toHaveLength(3);
      program3Day.sessions.forEach((session) => {
        expect(session.exercises.length).toBeGreaterThanOrEqual(4);
      });
    });

    it("only identifies Priority 1 + Barbell exercises as high-recovery", () => {
      const { isHighRecoveryExercise } = require("@/lib/workout-generator/engine");

      const benchPress: Exercise = { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Barbell", priority: 1, description: null };
      const overheadPress: Exercise = { id: 2, name: "Overhead Press", muscle_group: "Shoulders", muscle_groups: ["Shoulders"], equipment_required: "Barbell", priority: 2, description: null };
      const pullup: Exercise = { id: 3, name: "Pull-up", muscle_group: "Back", muscle_groups: ["Back"], equipment_required: "Bodyweight", priority: 2, description: null };
      const dumbbellPress: Exercise = { id: 4, name: "Dumbbell Press", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Dumbbell", priority: 3, description: null };

      // Priority 1 + Barbell = high recovery
      expect(isHighRecoveryExercise(benchPress)).toBe(true);

      // Priority 2 + Barbell = NOT high recovery
      expect(isHighRecoveryExercise(overheadPress)).toBe(false);

      // Priority 2 + Bodyweight = NOT high recovery
      expect(isHighRecoveryExercise(pullup)).toBe(false);

      // Priority 3 + Dumbbell = NOT high recovery
      expect(isHighRecoveryExercise(dumbbellPress)).toBe(false);
    });
  });
});
