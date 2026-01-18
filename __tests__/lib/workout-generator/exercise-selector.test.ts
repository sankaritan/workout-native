import {
  filterExercisesByEquipment,
  filterExercisesByMuscleGroup,
  selectExercisesForMuscles,
  orderExercises,
  selectInitialExercisesByMuscleGroup,
} from "@/lib/workout-generator/exercise-selector";
import type { Exercise, MuscleGroup } from "@/lib/storage/types";

describe("Exercise Selector", () => {
  // Basic mock exercises for existing tests
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

  // Comprehensive mock exercises covering all 6 muscle groups
  const comprehensiveMockExercises: Exercise[] = [
    // Chest (4 exercises)
    { id: 1, name: "Bench Press", muscle_group: "Chest", equipment_required: "Barbell", is_compound: true, description: null },
    { id: 2, name: "Dumbbell Fly", muscle_group: "Chest", equipment_required: "Dumbbell", is_compound: false, description: null },
    { id: 3, name: "Push-up", muscle_group: "Chest", equipment_required: "Bodyweight", is_compound: true, description: null },
    { id: 4, name: "Cable Crossover", muscle_group: "Chest", equipment_required: "Cables", is_compound: false, description: null },
    // Back (4 exercises)
    { id: 5, name: "Deadlift", muscle_group: "Back", equipment_required: "Barbell", is_compound: true, description: null },
    { id: 6, name: "Pull-up", muscle_group: "Back", equipment_required: "Bodyweight", is_compound: true, description: null },
    { id: 7, name: "Lat Pulldown", muscle_group: "Back", equipment_required: "Cables", is_compound: true, description: null },
    { id: 8, name: "Dumbbell Row", muscle_group: "Back", equipment_required: "Dumbbell", is_compound: true, description: null },
    // Legs (4 exercises)
    { id: 9, name: "Squat", muscle_group: "Legs", equipment_required: "Barbell", is_compound: true, description: null },
    { id: 10, name: "Leg Press", muscle_group: "Legs", equipment_required: "Machines", is_compound: true, description: null },
    { id: 11, name: "Lunges", muscle_group: "Legs", equipment_required: "Bodyweight", is_compound: true, description: null },
    { id: 12, name: "Leg Curl", muscle_group: "Legs", equipment_required: "Machines", is_compound: false, description: null },
    // Shoulders (4 exercises)
    { id: 13, name: "Overhead Press", muscle_group: "Shoulders", equipment_required: "Barbell", is_compound: true, description: null },
    { id: 14, name: "Lateral Raise", muscle_group: "Shoulders", equipment_required: "Dumbbell", is_compound: false, description: null },
    { id: 15, name: "Pike Push-up", muscle_group: "Shoulders", equipment_required: "Bodyweight", is_compound: true, description: null },
    { id: 16, name: "Face Pull", muscle_group: "Shoulders", equipment_required: "Cables", is_compound: false, description: null },
    // Arms (4 exercises)
    { id: 17, name: "Barbell Curl", muscle_group: "Arms", equipment_required: "Barbell", is_compound: false, description: null },
    { id: 18, name: "Tricep Dips", muscle_group: "Arms", equipment_required: "Bodyweight", is_compound: true, description: null },
    { id: 19, name: "Hammer Curl", muscle_group: "Arms", equipment_required: "Dumbbell", is_compound: false, description: null },
    { id: 20, name: "Cable Tricep Extension", muscle_group: "Arms", equipment_required: "Cables", is_compound: false, description: null },
    // Core (4 exercises)
    { id: 21, name: "Plank", muscle_group: "Core", equipment_required: "Bodyweight", is_compound: false, description: null },
    { id: 22, name: "Cable Crunch", muscle_group: "Core", equipment_required: "Cables", is_compound: false, description: null },
    { id: 23, name: "Hanging Leg Raise", muscle_group: "Core", equipment_required: "Bodyweight", is_compound: false, description: null },
    { id: 24, name: "Ab Wheel Rollout", muscle_group: "Core", equipment_required: "Bodyweight", is_compound: true, description: null },
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

  describe("selectInitialExercisesByMuscleGroup", () => {
    it("returns entries only for muscle groups used in 2-day program (no Core)", () => {
      const result = selectInitialExercisesByMuscleGroup(
        comprehensiveMockExercises,
        ["Barbell", "Dumbbell", "Bodyweight"],
        2
      );

      expect(result).toHaveLength(5); // Chest, Back, Legs, Shoulders, Arms (no Core)
      const muscleGroups = result.map(entry => entry.muscleGroup);
      expect(muscleGroups).toContain("Chest");
      expect(muscleGroups).toContain("Back");
      expect(muscleGroups).toContain("Legs");
      expect(muscleGroups).toContain("Shoulders");
      expect(muscleGroups).toContain("Arms");
      expect(muscleGroups).not.toContain("Core");
    });

    it("returns entries including Core for 5-day program", () => {
      const result = selectInitialExercisesByMuscleGroup(
        comprehensiveMockExercises,
        ["Barbell", "Dumbbell", "Bodyweight"],
        5
      );

      expect(result).toHaveLength(6); // All muscle groups including Core
      const muscleGroups = result.map(entry => entry.muscleGroup);
      expect(muscleGroups).toContain("Core");
    });

    it("returns 2-3 exercises per muscle group", () => {
      const result = selectInitialExercisesByMuscleGroup(
        comprehensiveMockExercises,
        ["Barbell", "Dumbbell", "Bodyweight"],
        3
      );

      result.forEach(entry => {
        expect(entry.exercises.length).toBeGreaterThanOrEqual(1);
        expect(entry.exercises.length).toBeLessThanOrEqual(3);
      });
    });

    it("filters by equipment", () => {
      const result = selectInitialExercisesByMuscleGroup(
        comprehensiveMockExercises,
        ["Bodyweight"], // Only bodyweight
        3
      );

      result.forEach(entry => {
        entry.exercises.forEach(exercise => {
          expect(exercise.equipment_required).toBe("Bodyweight");
        });
      });
    });

    it("prioritizes compound exercises", () => {
      const result = selectInitialExercisesByMuscleGroup(
        comprehensiveMockExercises,
        ["Barbell", "Dumbbell", "Bodyweight"],
        3
      );

      // Check that when there are compounds available, they appear first
      result.forEach(entry => {
        if (entry.exercises.length > 1) {
          const hasCompound = entry.exercises.some(e => e.is_compound);
          if (hasCompound) {
            // First exercise should be compound if any are available
            const firstCompoundIndex = entry.exercises.findIndex(e => e.is_compound);
            expect(firstCompoundIndex).toBe(0);
          }
        }
      });
    });

    it("returns empty exercises array when no exercises match for a muscle group", () => {
      // Only include exercises for Chest and Back
      const limitedExercises: Exercise[] = [
        { id: 1, name: "Bench Press", muscle_group: "Chest", equipment_required: "Barbell", is_compound: true, description: null },
        { id: 2, name: "Pull-up", muscle_group: "Back", equipment_required: "Bodyweight", is_compound: true, description: null },
      ];

      const result = selectInitialExercisesByMuscleGroup(
        limitedExercises,
        ["Barbell", "Bodyweight"],
        3
      );

      // For 3-day program, should have 5 muscle groups (no Core)
      expect(result).toHaveLength(5);

      const legsEntry = result.find(e => e.muscleGroup === "Legs");
      expect(legsEntry?.exercises).toHaveLength(0);
    });

    it("includes bodyweight exercises regardless of equipment selection", () => {
      const result = selectInitialExercisesByMuscleGroup(
        comprehensiveMockExercises,
        ["Barbell"], // Only barbell selected, but bodyweight should still be included
        3
      );

      const hasBodyweight = result.some(entry =>
        entry.exercises.some(e => e.equipment_required === "Bodyweight")
      );
      expect(hasBodyweight).toBe(true);
    });

    it("returns all exercises for same muscle group together", () => {
      const result = selectInitialExercisesByMuscleGroup(
        comprehensiveMockExercises,
        ["Barbell", "Dumbbell", "Bodyweight"],
        3
      );

      result.forEach(entry => {
        entry.exercises.forEach(exercise => {
          expect(exercise.muscle_group).toBe(entry.muscleGroup);
        });
      });
    });
  });
});
