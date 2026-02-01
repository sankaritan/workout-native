import { EXERCISES, seedExercises } from "@/lib/storage/seed-data";
import {
  initStorage,
  getAllExercises,
  getExercisesByMuscleGroup,
  getCompoundExercises,
  resetStorage,
} from "@/lib/storage/storage";
import type { MuscleGroup } from "@/lib/storage/types";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  multiGet: jest.fn(() => Promise.resolve([
    ["workout_exercises", null],
    ["workout_plans", null],
    ["workout_session_templates", null],
    ["workout_exercise_templates", null],
    ["workout_completed_sessions", null],
    ["workout_completed_sets", null],
    ["workout_id_counters", null],
  ])),
  multiSet: jest.fn(() => Promise.resolve()),
}));

describe("Seed Data", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await initStorage();
  });

  afterEach(async () => {
    await resetStorage();
  });

  describe("Exercise Data", () => {
    it("contains at least 40 exercises", () => {
      expect(EXERCISES.length).toBeGreaterThanOrEqual(40);
    });

    it("covers all major muscle groups", () => {
      const muscleGroups: MuscleGroup[] = [
        "Chest",
        "Back",
        "Legs",
        "Shoulders",
        "Arms",
        "Core",
      ];

      for (const group of muscleGroups) {
        const exercisesInGroup = EXERCISES.filter(
          (ex) => ex.muscle_group === group
        );
        expect(exercisesInGroup.length).toBeGreaterThanOrEqual(5);
      }
    });

    it("has at least 15 priority compound exercises", () => {
      const compoundExercises = EXERCISES.filter((ex) => ex.priority <= 3);
      expect(compoundExercises.length).toBeGreaterThanOrEqual(15);
    });

    it("includes various equipment types", () => {
      const equipmentTypes = new Set(
        EXERCISES.map((ex) => ex.equipment_required).filter(Boolean)
      );

      expect(equipmentTypes.has("Barbell")).toBe(true);
      expect(equipmentTypes.has("Dumbbell")).toBe(true);
      expect(equipmentTypes.has("Bodyweight")).toBe(true);
    });

    it("has exercises with descriptions", () => {
      const exercisesWithDescriptions = EXERCISES.filter(
        (ex) => ex.description && ex.description.length > 0
      );
      expect(exercisesWithDescriptions.length).toBeGreaterThan(0);
    });

    it("includes common exercises from mockups", () => {
      const exerciseNames = EXERCISES.map((ex) => ex.name.toLowerCase());

      // Common exercises that should be in the database
      expect(exerciseNames).toContain("bench press");
      expect(exerciseNames).toContain("squat");
      expect(exerciseNames).toContain("deadlift");
    });
  });

  describe("seedExercises", () => {
    it("inserts all exercises into storage", () => {
      seedExercises();

      const exercises = getAllExercises();
      expect(exercises.length).toBe(EXERCISES.length);
    });

    it("exercises have correct properties", () => {
      seedExercises();

      const exercises = getAllExercises();
      const benchPress = exercises.find((ex) => ex.name === "Bench Press");

      expect(benchPress).toBeDefined();
      expect(benchPress?.muscle_group).toBe("Chest");
      expect(benchPress?.priority).toBeLessThanOrEqual(3);
      expect(benchPress?.equipment_required).toBe("Barbell");
    });

    it("does not insert duplicates on subsequent calls", () => {
      seedExercises();
      const countAfterFirst = getAllExercises().length;

      seedExercises();
      const countAfterSecond = getAllExercises().length;

      expect(countAfterSecond).toBe(countAfterFirst);
    });
  });

  describe("Query Functions with Seeded Data", () => {
    beforeEach(() => {
      seedExercises();
    });

    it("can query exercises by muscle group", () => {
      const chestExercises = getExercisesByMuscleGroup("Chest");
      expect(chestExercises.length).toBeGreaterThan(0);
      expect(chestExercises.every((ex) => ex.muscle_group === "Chest")).toBe(
        true
      );
    });

    it("can query compound exercises", () => {
      const compound = getCompoundExercises();
      expect(compound.length).toBeGreaterThanOrEqual(15);
      expect(compound.every((ex) => ex.priority <= 3)).toBe(true);
    });

    it("returns all exercises sorted by name", () => {
      const exercises = getAllExercises();
      expect(exercises.length).toBe(EXERCISES.length);

      // Check sorting
      for (let i = 1; i < exercises.length; i++) {
        expect(exercises[i].name.localeCompare(exercises[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("Muscle Group Distribution", () => {
    it("has balanced distribution across muscle groups", () => {
      const distribution: Record<string, number> = {};

      for (const exercise of EXERCISES) {
        distribution[exercise.muscle_group] =
          (distribution[exercise.muscle_group] || 0) + 1;
      }

      // Each muscle group should have at least 5 exercises
      for (const [group, count] of Object.entries(distribution)) {
        expect(count).toBeGreaterThanOrEqual(5);
      }
    });

    it("has compound exercises for major muscle groups", () => {
      const compoundByGroup: Record<string, number> = {};

      for (const exercise of EXERCISES) {
        if (exercise.priority <= 3) {
          compoundByGroup[exercise.muscle_group] =
            (compoundByGroup[exercise.muscle_group] || 0) + 1;
        }
      }

      // Major muscle groups should have compound exercises
      expect(compoundByGroup["Chest"]).toBeGreaterThan(0);
      expect(compoundByGroup["Back"]).toBeGreaterThan(0);
      expect(compoundByGroup["Legs"]).toBeGreaterThan(0);
    });
  });

  describe("Multi-Muscle Group Support", () => {
    it("all exercises have muscle_groups array", () => {
      for (const exercise of EXERCISES) {
        expect(exercise.muscle_groups).toBeDefined();
        expect(Array.isArray(exercise.muscle_groups)).toBe(true);
        expect(exercise.muscle_groups.length).toBeGreaterThan(0);
      }
    });

    it("muscle_groups[0] matches muscle_group for backward compatibility", () => {
      for (const exercise of EXERCISES) {
        expect(exercise.muscle_groups[0]).toBe(exercise.muscle_group);
      }
    });

    it("compound exercises have appropriate multi-muscle mappings", () => {
      const compoundExercises = EXERCISES.filter((ex) => ex.priority <= 3);

      // At least 30% of compound exercises should work multiple muscle groups
      const multiMuscleCompounds = compoundExercises.filter(
        (ex) => ex.muscle_groups.length > 1
      );
      expect(multiMuscleCompounds.length).toBeGreaterThan(
        compoundExercises.length * 0.3
      );
    });

    it("key compound exercises have correct muscle group mappings", () => {
      const deadlift = EXERCISES.find((ex) => ex.name === "Deadlift");
      expect(deadlift?.muscle_groups).toEqual(["Back", "Legs", "Core"]);

      const benchPress = EXERCISES.find((ex) => ex.name === "Bench Press");
      expect(benchPress?.muscle_groups).toEqual(["Chest", "Shoulders", "Arms"]);

      const squat = EXERCISES.find((ex) => ex.name === "Squat");
      expect(squat?.muscle_groups).toEqual(["Legs", "Core"]);

      const pullups = EXERCISES.find((ex) => ex.name === "Pull-ups");
      expect(pullups?.muscle_groups).toEqual(["Back", "Arms"]);

      const overheadPress = EXERCISES.find((ex) => ex.name === "Overhead Press");
      expect(overheadPress?.muscle_groups).toEqual([
        "Shoulders",
        "Arms",
        "Core",
      ]);
    });

    it("isolation exercises have single muscle group", () => {
      const isolationExercises = EXERCISES.filter(
        (ex) => ex.priority >= 4 && ex.muscle_group !== "Core"
      );

      // Most isolation exercises should target a single muscle group
      const singleMuscleIsolation = isolationExercises.filter(
        (ex) => ex.muscle_groups.length === 1
      );

      // At least 80% of isolation exercises should be single muscle
      expect(singleMuscleIsolation.length).toBeGreaterThan(
        isolationExercises.length * 0.8
      );
    });

    it("muscle_groups contain valid muscle group values", () => {
      const validMuscleGroups: MuscleGroup[] = [
        "Chest",
        "Back",
        "Legs",
        "Shoulders",
        "Arms",
        "Core",
      ];

      for (const exercise of EXERCISES) {
        for (const muscleGroup of exercise.muscle_groups) {
          expect(validMuscleGroups).toContain(muscleGroup);
        }
      }
    });

    it("muscle_groups arrays have no duplicates", () => {
      for (const exercise of EXERCISES) {
        const uniqueMuscles = new Set(exercise.muscle_groups);
        expect(uniqueMuscles.size).toBe(exercise.muscle_groups.length);
      }
    });

    it("muscle_groups arrays are limited to 3 or fewer muscles", () => {
      for (const exercise of EXERCISES) {
        expect(exercise.muscle_groups.length).toBeLessThanOrEqual(3);
      }
    });
  });
});
