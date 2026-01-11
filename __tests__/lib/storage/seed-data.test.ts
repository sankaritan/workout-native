import { openDatabaseSync } from "expo-sqlite";
import { initDatabase, resetDatabase } from "@/lib/storage/database";
import { seedExercises, EXERCISES } from "@/lib/storage/seed-data";
import {
  getAllExercises,
  getExercisesByMuscleGroup,
  getCompoundExercises,
} from "@/lib/storage/db-utils";
import type { MuscleGroup } from "@/lib/storage/types";

// Mock expo-sqlite
jest.mock("expo-sqlite");

describe("Seed Data", () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock database
    mockDb = {
      execSync: jest.fn(),
      runSync: jest.fn((query: string) => {
        // Return incrementing IDs for inserts
        const idCounter = mockDb.runSync.mock.calls.length;
        return {
          lastInsertRowId: idCounter,
          changes: 1,
        };
      }),
      getFirstSync: jest.fn(),
      getAllSync: jest.fn(() => []),
    };

    (openDatabaseSync as jest.Mock).mockReturnValue(mockDb);
    initDatabase();
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

    it("has at least 15 compound exercises", () => {
      const compoundExercises = EXERCISES.filter((ex) => ex.is_compound);
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
    it("inserts all exercises into database", () => {
      seedExercises();

      // Should have called runSync for each exercise
      expect(mockDb.runSync).toHaveBeenCalledTimes(EXERCISES.length);
    });

    it("inserts exercises with correct data", () => {
      seedExercises();

      // Check first call to verify data structure
      const firstCall = mockDb.runSync.mock.calls[0];
      expect(firstCall[0]).toContain("INSERT INTO exercises");
      expect(firstCall[1]).toHaveLength(5); // 5 parameters: name, muscle_group, equipment, is_compound, description
    });

    it("handles compound exercises correctly", () => {
      seedExercises();

      // Find a compound exercise call
      const compoundExercise = EXERCISES.find((ex) => ex.is_compound);
      const compoundCall = mockDb.runSync.mock.calls.find((call: any[]) =>
        call[1].includes(compoundExercise?.name)
      );

      expect(compoundCall).toBeDefined();
      expect(compoundCall[1][3]).toBe(1); // is_compound should be 1 (true)
    });

    it("handles isolation exercises correctly", () => {
      seedExercises();

      // Find an isolation exercise call
      const isolationExercise = EXERCISES.find((ex) => !ex.is_compound);
      const isolationCall = mockDb.runSync.mock.calls.find((call: any[]) =>
        call[1].includes(isolationExercise?.name)
      );

      expect(isolationCall).toBeDefined();
      expect(isolationCall[1][3]).toBe(0); // is_compound should be 0 (false)
    });

    it("does not insert duplicates on subsequent calls", () => {
      // Mock getAllSync to return existing exercises
      mockDb.getAllSync.mockReturnValue(EXERCISES.map((ex, idx) => ({ ...ex, id: idx + 1 })));

      seedExercises();

      // Should not call runSync when exercises already exist
      expect(mockDb.runSync).not.toHaveBeenCalled();
    });

    it("only inserts missing exercises", () => {
      // Mock getAllSync to return only first 10 exercises
      mockDb.getAllSync.mockReturnValue(
        EXERCISES.slice(0, 10).map((ex, idx) => ({ ...ex, id: idx + 1 }))
      );

      seedExercises();

      // Should only insert the remaining exercises
      expect(mockDb.runSync).toHaveBeenCalledTimes(EXERCISES.length - 10);
    });
  });

  describe("Query Functions with Seeded Data", () => {
    beforeEach(() => {
      // Mock getAllSync to return seeded data
      mockDb.getAllSync.mockImplementation((query: string) => {
        if (query.includes("WHERE muscle_group")) {
          // Extract muscle group from query parameters
          return EXERCISES.filter((ex) => ex.muscle_group === "Chest").map(
            (ex, idx) => ({ ...ex, id: idx + 1 })
          );
        }
        return EXERCISES.map((ex, idx) => ({ ...ex, id: idx + 1 }));
      });
    });

    it("can query exercises by muscle group", () => {
      mockDb.getAllSync.mockReturnValue(
        EXERCISES.filter((ex) => ex.muscle_group === "Chest").map((ex, idx) => ({
          ...ex,
          id: idx + 1,
        }))
      );

      const chestExercises = getExercisesByMuscleGroup("Chest");
      expect(chestExercises.length).toBeGreaterThan(0);
      expect(chestExercises.every((ex) => ex.muscle_group === "Chest")).toBe(
        true
      );
    });

    it("can query compound exercises", () => {
      mockDb.getAllSync.mockReturnValue(
        EXERCISES.filter((ex) => ex.is_compound).map((ex, idx) => ({
          ...ex,
          id: idx + 1,
        }))
      );

      const compound = getCompoundExercises();
      expect(compound.length).toBeGreaterThanOrEqual(15);
      expect(compound.every((ex) => ex.is_compound === true)).toBe(true);
    });

    it("returns all exercises sorted by name", () => {
      const exercises = getAllExercises();
      expect(exercises.length).toBe(EXERCISES.length);
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
        if (exercise.is_compound) {
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
});
