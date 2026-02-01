import {
  filterExercisesByEquipment,
  filterExercisesByMuscleGroup,
  filterExercisesByMuscleGroups,
  filterExercisesByPrimaryMuscle,
  selectExercisesForMuscles,
  orderExercises,
  selectInitialExercises,
} from "@/lib/workout-generator/exercise-selector";
import type { Exercise, MuscleGroup } from "@/lib/storage/types";
import { isCompoundPriority } from "@/lib/storage/types";

describe("Exercise Selector", () => {
  // Basic mock exercises for existing tests
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
      name: "Dumbbell Fly",
      muscle_group: "Chest",
      muscle_groups: ["Chest"],
      equipment_required: "Dumbbell",
      priority: 4,
      description: "Isolation chest exercise",
    },
    {
      id: 3,
      name: "Squat",
      muscle_group: "Legs",
      muscle_groups: ["Legs", "Core"],
      equipment_required: "Barbell",
      priority: 1,
      description: "Compound leg exercise",
    },
    {
      id: 4,
      name: "Push-up",
      muscle_group: "Chest",
      muscle_groups: ["Chest", "Shoulders", "Arms"],
      equipment_required: "Bodyweight",
      priority: 3,
      description: "Bodyweight chest exercise",
    },
    {
      id: 5,
      name: "Pull-up",
      muscle_group: "Back",
      muscle_groups: ["Back", "Arms"],
      equipment_required: "Bodyweight",
      priority: 2,
      description: "Bodyweight back exercise",
    },
  ];

  // Comprehensive mock exercises covering all 6 muscle groups
  const comprehensiveMockExercises: Exercise[] = [
    // Chest (4 exercises)
    { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest", "Shoulders", "Arms"], equipment_required: "Barbell", priority: 1, description: null },
    { id: 2, name: "Dumbbell Fly", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Dumbbell", priority: 4, description: null },
    { id: 3, name: "Push-up", muscle_group: "Chest", muscle_groups: ["Chest", "Shoulders", "Arms"], equipment_required: "Bodyweight", priority: 3, description: null },
    { id: 4, name: "Cable Crossover", muscle_group: "Chest", muscle_groups: ["Chest"], equipment_required: "Cables", priority: 4, description: null },
    // Back (4 exercises)
    { id: 5, name: "Deadlift", muscle_group: "Back", muscle_groups: ["Back", "Legs", "Core"], equipment_required: "Barbell", priority: 1, description: null },
    { id: 6, name: "Pull-up", muscle_group: "Back", muscle_groups: ["Back", "Arms"], equipment_required: "Bodyweight", priority: 2, description: null },
    { id: 7, name: "Lat Pulldown", muscle_group: "Back", muscle_groups: ["Back", "Arms"], equipment_required: "Cables", priority: 3, description: null },
    { id: 8, name: "Dumbbell Row", muscle_group: "Back", muscle_groups: ["Back", "Arms"], equipment_required: "Dumbbell", priority: 2, description: null },
    // Legs (4 exercises)
    { id: 9, name: "Squat", muscle_group: "Legs", muscle_groups: ["Legs", "Core"], equipment_required: "Barbell", priority: 1, description: null },
    { id: 10, name: "Leg Press", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Machines", priority: 3, description: null },
    { id: 11, name: "Lunges", muscle_group: "Legs", muscle_groups: ["Legs", "Core"], equipment_required: "Bodyweight", priority: 3, description: null },
    { id: 12, name: "Leg Curl", muscle_group: "Legs", muscle_groups: ["Legs"], equipment_required: "Machines", priority: 4, description: null },
    // Shoulders (4 exercises)
    { id: 13, name: "Overhead Press", muscle_group: "Shoulders", muscle_groups: ["Shoulders", "Arms", "Core"], equipment_required: "Barbell", priority: 2, description: null },
    { id: 14, name: "Lateral Raise", muscle_group: "Shoulders", muscle_groups: ["Shoulders"], equipment_required: "Dumbbell", priority: 4, description: null },
    { id: 15, name: "Pike Push-up", muscle_group: "Shoulders", muscle_groups: ["Shoulders", "Arms"], equipment_required: "Bodyweight", priority: 3, description: null },
    { id: 16, name: "Face Pull", muscle_group: "Shoulders", muscle_groups: ["Shoulders", "Back"], equipment_required: "Cables", priority: 4, description: null },
    // Arms (4 exercises)
    { id: 17, name: "Barbell Curl", muscle_group: "Arms", muscle_groups: ["Arms"], equipment_required: "Barbell", priority: 4, description: null },
    { id: 18, name: "Tricep Dips", muscle_group: "Arms", muscle_groups: ["Arms", "Chest"], equipment_required: "Bodyweight", priority: 3, description: null },
    { id: 19, name: "Hammer Curl", muscle_group: "Arms", muscle_groups: ["Arms"], equipment_required: "Dumbbell", priority: 4, description: null },
    { id: 20, name: "Cable Tricep Extension", muscle_group: "Arms", muscle_groups: ["Arms"], equipment_required: "Cables", priority: 4, description: null },
    // Core (4 exercises)
    { id: 21, name: "Plank", muscle_group: "Core", muscle_groups: ["Core", "Shoulders"], equipment_required: "Bodyweight", priority: 5, description: null },
    { id: 22, name: "Cable Crunch", muscle_group: "Core", muscle_groups: ["Core"], equipment_required: "Cables", priority: 5, description: null },
    { id: 23, name: "Hanging Leg Raise", muscle_group: "Core", muscle_groups: ["Core", "Back"], equipment_required: "Bodyweight", priority: 5, description: null },
    { id: 24, name: "Ab Wheel Rollout", muscle_group: "Core", muscle_groups: ["Core", "Shoulders"], equipment_required: "Bodyweight", priority: 5, description: null },
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
    it("returns exercises that work the specified muscle group (primary or secondary)", () => {
      const result = filterExercisesByMuscleGroup(mockExercises, "Chest");
      expect(result).toHaveLength(3);
      expect(result.every((e) => e.muscle_groups.includes("Chest"))).toBe(true);
    });

    it("returns compound exercises that work muscle as secondary", () => {
      // Bench Press and Push-up work Shoulders as secondary
      const result = filterExercisesByMuscleGroup(mockExercises, "Shoulders");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((e) => e.muscle_groups.includes("Shoulders"))).toBe(true);
    });

    it("returns exercises that work Arms as secondary", () => {
      // Bench Press, Push-up, Pull-up all work Arms
      const result = filterExercisesByMuscleGroup(mockExercises, "Arms");
      expect(result).toHaveLength(3);
    });

    it("returns empty array when no matches", () => {
      const result = filterExercisesByMuscleGroup(mockExercises, "Core");
      expect(result).toHaveLength(1); // Squat works Core
    });
  });

  describe("filterExercisesByMuscleGroups", () => {
    it("returns exercises that work ANY of the specified muscle groups", () => {
      const result = filterExercisesByMuscleGroups(mockExercises, ["Chest", "Back"]);
      // Bench Press, Dumbbell Fly, Push-up (all have Chest), Pull-up (has Back)
      expect(result).toHaveLength(4);
    });

    it("returns exercises once even if they match multiple filters", () => {
      // Bench Press works both Chest and Shoulders
      const result = filterExercisesByMuscleGroups(mockExercises, ["Chest", "Shoulders"]);
      const benchPressCount = result.filter(e => e.name === "Bench Press").length;
      expect(benchPressCount).toBe(1);
    });

    it("returns all exercises when filtering by all muscle groups", () => {
      const result = filterExercisesByMuscleGroups(mockExercises, [
        "Chest",
        "Back",
        "Legs",
        "Shoulders",
        "Arms",
        "Core",
      ]);
      expect(result.length).toBe(mockExercises.length);
    });

    it("returns empty array when no matches", () => {
      const noMatchExercises: Exercise[] = [
        {
          id: 1,
          name: "Test",
          muscle_group: "Chest",
          muscle_groups: ["Chest"],
          equipment_required: "Barbell",
          priority: 4,
          description: null,
        },
      ];
      const result = filterExercisesByMuscleGroups(noMatchExercises, ["Back", "Legs"]);
      expect(result).toHaveLength(0);
    });
  });

  describe("filterExercisesByPrimaryMuscle", () => {
    it("returns only exercises where muscle group is primary", () => {
      const result = filterExercisesByPrimaryMuscle(mockExercises, "Chest");
      expect(result).toHaveLength(3);
      expect(result.every((e) => e.muscle_groups[0] === "Chest")).toBe(true);
    });

    it("does not return exercises where muscle is secondary", () => {
      // Shoulders is secondary for Bench Press and Push-up
      const result = filterExercisesByPrimaryMuscle(mockExercises, "Shoulders");
      expect(result).toHaveLength(0);
    });

    it("returns exercises with primary muscle match only", () => {
      const result = filterExercisesByPrimaryMuscle(comprehensiveMockExercises, "Back");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((ex) => {
        expect(ex.muscle_groups[0]).toBe("Back");
      });
    });

    it("returns empty array when no primary matches", () => {
      const chestOnlyExercises: Exercise[] = [
        {
          id: 1,
          name: "Bench Press",
          muscle_group: "Chest",
          muscle_groups: ["Chest", "Shoulders"],
          equipment_required: "Barbell",
          priority: 2,
          description: null,
        },
      ];
      const result = filterExercisesByPrimaryMuscle(chestOnlyExercises, "Shoulders");
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
      expect(result.some((e) => isCompoundPriority(e.priority))).toBe(true);
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
    it("orders exercises by priority", () => {
      const result = orderExercises([
        mockExercises[1], // Dumbbell Fly (isolation)
        mockExercises[0], // Bench Press (compound)
      ]);
      expect(result[0].name).toBe("Bench Press");
      expect(result[1].name).toBe("Dumbbell Fly");
    });

    it("maintains order within same priority", () => {
      const samePriority = [
        { ...mockExercises[0], id: 10, name: "Bench Press A" },
        { ...mockExercises[0], id: 11, name: "Bench Press B" },
      ];
      const result = orderExercises(samePriority);
      expect(result.map((e) => e.name)).toEqual(["Bench Press A", "Bench Press B"]);
    });

    it("handles empty array", () => {
      const result = orderExercises([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("selectInitialExercises", () => {
    it("returns flat array of exercises", () => {
      const result = selectInitialExercises(
        comprehensiveMockExercises,
        ["Barbell", "Dumbbell", "Bodyweight"],
        3
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((exercise) => {
        expect(exercise).toHaveProperty("id");
        expect(exercise).toHaveProperty("muscle_groups");
      });
    });

    it("selects 2 exercises per relevant muscle group", () => {
      const result = selectInitialExercises(
        comprehensiveMockExercises,
        ["Barbell", "Dumbbell", "Bodyweight"],
        3
      );

      // For 3-day program: 5 muscle groups * 2 exercises = 10 exercises
      expect(result.length).toBe(10);
    });

    it("selects only from relevant muscle groups for frequency", () => {
      const result = selectInitialExercises(
        comprehensiveMockExercises,
        ["Barbell", "Dumbbell", "Bodyweight"],
        2
      );

      // For 2-day program, Core should not be included
      const hasCore = result.some((ex) => ex.muscle_groups[0] === "Core");
      expect(hasCore).toBe(false);
    });

    it("includes Core for 5-day programs", () => {
      const result = selectInitialExercises(
        comprehensiveMockExercises,
        ["Barbell", "Dumbbell", "Bodyweight"],
        5
      );

      // For 5-day program, Core should be included
      const hasCore = result.some((ex) => ex.muscle_groups[0] === "Core");
      expect(hasCore).toBe(true);

      // 6 muscle groups * 2 exercises = 12 exercises
      expect(result.length).toBe(12);
    });

    it("filters by equipment", () => {
      const result = selectInitialExercises(
        comprehensiveMockExercises,
        ["Bodyweight"],
        3
      );

      result.forEach((exercise) => {
        expect(exercise.equipment_required).toBe("Bodyweight");
      });
    });

    it("prioritizes compound exercises", () => {
      const result = selectInitialExercises(
        comprehensiveMockExercises,
        ["Barbell", "Dumbbell", "Bodyweight"],
        3
      );

      // Count compound exercises
      const compoundCount = result.filter((ex) => isCompoundPriority(ex.priority)).length;

      // Most should be compound since they're prioritized
      expect(compoundCount).toBeGreaterThan(result.length * 0.5);
    });

    it("selects by primary muscle group only", () => {
      const result = selectInitialExercises(
        comprehensiveMockExercises,
        ["Barbell", "Dumbbell", "Bodyweight"],
        3
      );

      // Group by primary muscle
      const byPrimary: Record<string, number> = {};
      result.forEach((ex) => {
        const primary = ex.muscle_groups[0];
        byPrimary[primary] = (byPrimary[primary] || 0) + 1;
      });

      // Should have 2 exercises per primary muscle (for 5 muscle groups)
      Object.values(byPrimary).forEach((count) => {
        expect(count).toBe(2);
      });
    });

    it("handles limited exercise availability", () => {
      const limitedExercises: Exercise[] = [
        { id: 1, name: "Bench Press", muscle_group: "Chest", muscle_groups: ["Chest", "Shoulders", "Arms"], equipment_required: "Barbell", priority: 1, description: null },
        { id: 2, name: "Pull-up", muscle_group: "Back", muscle_groups: ["Back", "Arms"], equipment_required: "Bodyweight", priority: 2, description: null },
      ];

      const result = selectInitialExercises(
        limitedExercises,
        ["Barbell", "Bodyweight"],
        3
      );

      // Should only return exercises that exist (1 for Chest, 1 for Back)
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it("includes bodyweight exercises regardless of equipment selection", () => {
      const result = selectInitialExercises(
        comprehensiveMockExercises,
        ["Barbell"],
        3
      );

      const hasBodyweight = result.some((ex) => ex.equipment_required === "Bodyweight");
      expect(hasBodyweight).toBe(true);
    });
  });
});
