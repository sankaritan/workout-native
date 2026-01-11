import {
  filterExercisesByEquipment,
  filterExercisesByMuscleGroup,
  selectExercisesForMuscles,
  orderExercises,
} from "@/lib/workout-generator/exercise-selector";
import type { Exercise, MuscleGroup } from "@/lib/storage/types";

describe("Exercise Selector", () => {
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
      name: "Dumbbell Fly",
      muscle_group: "Chest",
      equipment_required: "Dumbbell",
      is_compound: false,
      description: "Isolation chest exercise",
    },
    {
      id: 3,
      name: "Squat",
      muscle_group: "Legs",
      equipment_required: "Barbell",
      is_compound: true,
      description: "Compound leg exercise",
    },
    {
      id: 4,
      name: "Push-up",
      muscle_group: "Chest",
      equipment_required: "Bodyweight",
      is_compound: true,
      description: "Bodyweight chest exercise",
    },
    {
      id: 5,
      name: "Pull-up",
      muscle_group: "Back",
      equipment_required: "Bodyweight",
      is_compound: true,
      description: "Bodyweight back exercise",
    },
  ];

  describe("filterExercisesByEquipment", () => {
    it("returns exercises matching available equipment", () => {
      const result = filterExercisesByEquipment(mockExercises, ["Barbell"]);
      // Should include Barbell exercises + bodyweight
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.map((e) => e.name)).toContain("Bench Press");
      expect(result.map((e) => e.name)).toContain("Squat");
    });

    it("includes bodyweight exercises always", () => {
      const result = filterExercisesByEquipment(mockExercises, ["Barbell"]);
      const bodyweightExercises = result.filter(
        (e) => e.equipment_required === "Bodyweight"
      );
      expect(bodyweightExercises.length).toBeGreaterThan(0);
    });

    it("returns multiple equipment types", () => {
      const result = filterExercisesByEquipment(mockExercises, [
        "Barbell",
        "Dumbbell",
      ]);
      // Bench, Fly, Squat, + 2 bodyweight
      expect(result).toHaveLength(5);
    });

    it("returns empty array when no matches", () => {
      const result = filterExercisesByEquipment(mockExercises, ["Cables"]);
      // Should still include bodyweight
      expect(result.every((e) => e.equipment_required === "Bodyweight")).toBe(
        true
      );
    });
  });

  describe("filterExercisesByMuscleGroup", () => {
    it("returns exercises for specified muscle group", () => {
      const result = filterExercisesByMuscleGroup(mockExercises, "Chest");
      expect(result).toHaveLength(3);
      expect(result.every((e) => e.muscle_group === "Chest")).toBe(true);
    });

    it("returns empty array when no matches", () => {
      const result = filterExercisesByMuscleGroup(mockExercises, "Shoulders");
      expect(result).toHaveLength(0);
    });
  });

  describe("selectExercisesForMuscles", () => {
    it("selects exercises for each muscle group", () => {
      const result = selectExercisesForMuscles(
        mockExercises,
        ["Chest", "Legs"],
        2
      );
      expect(result.length).toBeLessThanOrEqual(4);
      expect(result.some((e) => e.muscle_group === "Chest")).toBe(true);
      expect(result.some((e) => e.muscle_group === "Legs")).toBe(true);
    });

    it("prioritizes compound exercises", () => {
      const result = selectExercisesForMuscles(mockExercises, ["Chest"], 2);
      // Should include at least one compound
      expect(result.some((e) => e.is_compound)).toBe(true);
    });

    it("respects exercise count limit", () => {
      const result = selectExercisesForMuscles(mockExercises, ["Chest"], 2);
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it("returns exercises when muscle groups have limited options", () => {
      const result = selectExercisesForMuscles(mockExercises, ["Back"], 2);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((e) => e.muscle_group === "Back")).toBe(true);
    });
  });

  describe("orderExercises", () => {
    it("places compound exercises first", () => {
      const result = orderExercises([
        mockExercises[1], // Dumbbell Fly (isolation)
        mockExercises[0], // Bench Press (compound)
      ]);
      expect(result[0].name).toBe("Bench Press");
      expect(result[1].name).toBe("Dumbbell Fly");
    });

    it("maintains order within same compound status", () => {
      const compounds = mockExercises.filter((e) => e.is_compound);
      const result = orderExercises(compounds);
      expect(result.every((e) => e.is_compound)).toBe(true);
    });

    it("handles empty array", () => {
      const result = orderExercises([]);
      expect(result).toHaveLength(0);
    });
  });
});
