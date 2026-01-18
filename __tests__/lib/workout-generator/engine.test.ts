import { generateWorkoutProgram, getSetsRepsScheme, generateWorkoutProgramFromCustomExercises } from "@/lib/workout-generator/engine";
import * as storage from "@/lib/storage/storage";
import type { GenerationInput, MuscleGroupExercises } from "@/lib/workout-generator/types";
import type { Exercise, MuscleGroup } from "@/lib/storage/types";

// Mock storage utilities
jest.mock("@/lib/storage/storage");

describe("Workout Generation Engine", () => {
  const mockExercises: Exercise[] = [
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
      name: "Squat",
      muscle_group: "Legs",
      equipment_required: "Barbell",
      is_compound: true,
      description: "Compound leg exercise",
    },
    {
      id: 3,
      name: "Deadlift",
      muscle_group: "Back",
      equipment_required: "Barbell",
      is_compound: true,
      description: "Compound back exercise",
    },
    {
      id: 4,
      name: "Overhead Press",
      muscle_group: "Shoulders",
      equipment_required: "Barbell",
      is_compound: true,
      description: "Compound shoulder exercise",
    },
    {
      id: 5,
      name: "Bicep Curl",
      muscle_group: "Arms",
      equipment_required: "Dumbbell",
      is_compound: false,
      description: "Isolation arm exercise",
    },
    {
      id: 6,
      name: "Push-up",
      muscle_group: "Chest",
      equipment_required: "Bodyweight",
      is_compound: true,
      description: "Bodyweight chest exercise",
    },
    {
      id: 7,
      name: "Pull-up",
      muscle_group: "Back",
      equipment_required: "Bodyweight",
      is_compound: true,
      description: "Bodyweight back exercise",
    },
    {
      id: 8,
      name: "Dumbbell Fly",
      muscle_group: "Chest",
      equipment_required: "Dumbbell",
      is_compound: false,
      description: "Isolation chest exercise",
    },
    {
      id: 9,
      name: "Leg Press",
      muscle_group: "Legs",
      equipment_required: "Machines",
      is_compound: true,
      description: "Machine leg exercise",
    },
    {
      id: 10,
      name: "Lat Pulldown",
      muscle_group: "Back",
      equipment_required: "Cables",
      is_compound: true,
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

  describe("generateWorkoutProgram", () => {
    it("generates 2-day program", () => {
      const input: GenerationInput = {
        frequency: 2,
        equipment: ["Barbell", "Dumbbell"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgram(input);

      expect(program.sessionsPerWeek).toBe(2);
      expect(program.sessions).toHaveLength(2);
    });

    it("generates 4-day program", () => {
      const input: GenerationInput = {
        frequency: 4,
        equipment: ["Barbell"],
        focus: "Strength",
      };

      const program = generateWorkoutProgram(input);

      expect(program.sessionsPerWeek).toBe(4);
      expect(program.sessions).toHaveLength(4);
    });

    it("assigns correct sets/reps for Balanced", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell", "Dumbbell"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgram(input);
      const allExercises = program.sessions.flatMap((s) => s.exercises);

      allExercises.forEach((ex) => {
        expect(ex.sets).toBe(3);
        expect(ex.repsMin).toBe(8);
        expect(ex.repsMax).toBe(12);
      });
    });

    it("assigns correct sets/reps for Strength", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell"],
        focus: "Strength",
      };

      const program = generateWorkoutProgram(input);
      const allExercises = program.sessions.flatMap((s) => s.exercises);

      allExercises.forEach((ex) => {
        expect(ex.sets).toBe(5);
        expect(ex.repsMin).toBe(3);
        expect(ex.repsMax).toBe(5);
      });
    });

    it("respects max 5 exercises per session", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell", "Dumbbell", "Bodyweight"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgram(input);

      program.sessions.forEach((session) => {
        expect(session.exercises.length).toBeLessThanOrEqual(5);
      });
    });

    it("places compound exercises first in each session", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell", "Dumbbell"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgram(input);

      program.sessions.forEach((session) => {
        if (session.exercises.length > 1) {
          const firstExercise = session.exercises[0];
          expect(firstExercise.exercise.is_compound).toBe(true);
        }
      });
    });

    it("assigns sequential order numbers to exercises", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgram(input);

      program.sessions.forEach((session) => {
        const orders = session.exercises.map((e) => e.order);
        expect(orders).toEqual([...Array(session.exercises.length)].map((_, i) => i + 1));
      });
    });

    it("includes exercises matching available equipment", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgram(input);
      const allExercises = program.sessions.flatMap((s) => s.exercises);

      allExercises.forEach((programEx) => {
        const equipment = programEx.exercise.equipment_required;
        expect(
          equipment === "Barbell" ||
            equipment === "Bodyweight" ||
            equipment === null
        ).toBe(true);
      });
    });

    it("generates program name with focus type", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell"],
        focus: "Strength",
      };

      const program = generateWorkoutProgram(input);
      expect(program.name).toContain("Strength");
    });

    it("sets correct focus in program", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell"],
        focus: "Endurance",
      };

      const program = generateWorkoutProgram(input);
      expect(program.focus).toBe("Endurance");
    });

    it("generates each session with at least one exercise", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Bodyweight"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgram(input);

      program.sessions.forEach((session) => {
        expect(session.exercises.length).toBeGreaterThan(0);
      });
    });
  });

  describe("generateWorkoutProgramFromCustomExercises", () => {
    // Custom exercises for testing - one per muscle group
    const customExercises: MuscleGroupExercises[] = [
      {
        muscleGroup: "Chest",
        exercises: [
          { id: 1, name: "Bench Press", muscle_group: "Chest", equipment_required: "Barbell", is_compound: true, description: null },
          { id: 2, name: "Dumbbell Fly", muscle_group: "Chest", equipment_required: "Dumbbell", is_compound: false, description: null },
        ],
      },
      {
        muscleGroup: "Back",
        exercises: [
          { id: 3, name: "Deadlift", muscle_group: "Back", equipment_required: "Barbell", is_compound: true, description: null },
          { id: 4, name: "Pull-up", muscle_group: "Back", equipment_required: "Bodyweight", is_compound: true, description: null },
        ],
      },
      {
        muscleGroup: "Legs",
        exercises: [
          { id: 5, name: "Squat", muscle_group: "Legs", equipment_required: "Barbell", is_compound: true, description: null },
          { id: 6, name: "Leg Curl", muscle_group: "Legs", equipment_required: "Machines", is_compound: false, description: null },
        ],
      },
      {
        muscleGroup: "Shoulders",
        exercises: [
          { id: 7, name: "Overhead Press", muscle_group: "Shoulders", equipment_required: "Barbell", is_compound: true, description: null },
          { id: 8, name: "Lateral Raise", muscle_group: "Shoulders", equipment_required: "Dumbbell", is_compound: false, description: null },
        ],
      },
      {
        muscleGroup: "Arms",
        exercises: [
          { id: 9, name: "Bicep Curl", muscle_group: "Arms", equipment_required: "Dumbbell", is_compound: false, description: null },
          { id: 10, name: "Tricep Dips", muscle_group: "Arms", equipment_required: "Bodyweight", is_compound: true, description: null },
        ],
      },
      {
        muscleGroup: "Core",
        exercises: [
          { id: 11, name: "Plank", muscle_group: "Core", equipment_required: "Bodyweight", is_compound: false, description: null },
        ],
      },
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
      const customExerciseIds = customExercises.flatMap((ce) => ce.exercises.map((e) => e.id));

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

    it("places compound exercises first in each session", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell", "Dumbbell", "Bodyweight"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, customExercises);

      program.sessions.forEach((session) => {
        if (session.exercises.length > 1) {
          // Check if any compound exists
          const hasCompound = session.exercises.some((e) => e.exercise.is_compound);
          if (hasCompound) {
            // First exercise should be compound
            expect(session.exercises[0].exercise.is_compound).toBe(true);
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

    it("includes exercises only for muscles targeted in each session", () => {
      const input: GenerationInput = {
        frequency: 4, // Upper/Lower split
        equipment: ["Barbell", "Dumbbell", "Bodyweight"],
        focus: "Balanced",
      };

      const program = generateWorkoutProgramFromCustomExercises(input, customExercises);

      program.sessions.forEach((session) => {
        session.exercises.forEach((programEx) => {
          // Exercise muscle group should be in session's primary muscles
          expect(session.primaryMuscles).toContain(programEx.exercise.muscle_group);
        });
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

    it("handles empty exercises for a muscle group gracefully", () => {
      const customWithEmpty: MuscleGroupExercises[] = [
        { muscleGroup: "Chest", exercises: [{ id: 1, name: "Bench Press", muscle_group: "Chest", equipment_required: "Barbell", is_compound: true, description: null }] },
        { muscleGroup: "Back", exercises: [] }, // Empty
        { muscleGroup: "Legs", exercises: [{ id: 2, name: "Squat", muscle_group: "Legs", equipment_required: "Barbell", is_compound: true, description: null }] },
        { muscleGroup: "Shoulders", exercises: [] }, // Empty
        { muscleGroup: "Arms", exercises: [] }, // Empty
        { muscleGroup: "Core", exercises: [] }, // Empty
      ];

      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell"],
        focus: "Balanced",
      };

      // Should not throw
      const program = generateWorkoutProgramFromCustomExercises(input, customWithEmpty);

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

      // Each full body session should have exercises from multiple muscle groups
      program.sessions.forEach((session) => {
        const muscleGroupsInSession = [...new Set(
          session.exercises.map((e) => e.exercise.muscle_group)
        )];
        expect(muscleGroupsInSession.length).toBeGreaterThan(1);
      });
    });
  });
});
