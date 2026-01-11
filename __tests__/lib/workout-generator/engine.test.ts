import { generateWorkoutProgram, getSetsRepsScheme } from "@/lib/workout-generator/engine";
import * as dbUtils from "@/lib/storage/db-utils";
import type { GenerationInput } from "@/lib/workout-generator/types";
import type { Exercise } from "@/lib/storage/types";

// Mock database utilities
jest.mock("@/lib/storage/db-utils");

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
    jest.spyOn(dbUtils, "getAllExercises").mockReturnValue(mockExercises);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getSetsRepsScheme", () => {
    it("returns 3x8-12 for Hypertrophy", () => {
      const scheme = getSetsRepsScheme("Hypertrophy");
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
        focus: "Hypertrophy",
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

    it("assigns correct sets/reps for Hypertrophy", () => {
      const input: GenerationInput = {
        frequency: 3,
        equipment: ["Barbell", "Dumbbell"],
        focus: "Hypertrophy",
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
        focus: "Hypertrophy",
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
        focus: "Hypertrophy",
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
        focus: "Hypertrophy",
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
        focus: "Hypertrophy",
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
        focus: "Hypertrophy",
      };

      const program = generateWorkoutProgram(input);

      program.sessions.forEach((session) => {
        expect(session.exercises.length).toBeGreaterThan(0);
      });
    });
  });
});
