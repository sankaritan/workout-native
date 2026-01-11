import {
  getSplitType,
  distributeMuscleGroups,
  calculateSessionVolume,
} from "@/lib/workout-generator/muscle-groups";

describe("Muscle Groups Distribution", () => {
  describe("getSplitType", () => {
    it("returns Full Body for 2 days", () => {
      expect(getSplitType(2)).toBe("Full Body");
    });

    it("returns Full Body for 3 days", () => {
      expect(getSplitType(3)).toBe("Full Body");
    });

    it("returns Upper/Lower for 4 days", () => {
      expect(getSplitType(4)).toBe("Upper/Lower");
    });

    it("returns Push/Pull/Legs for 5 days", () => {
      expect(getSplitType(5)).toBe("Push/Pull/Legs");
    });

    it("defaults to Full Body for invalid frequency", () => {
      expect(getSplitType(1)).toBe("Full Body");
      expect(getSplitType(6)).toBe("Full Body");
    });
  });

  describe("distributeMuscleGroups", () => {
    it("creates 2 sessions for 2-day frequency", () => {
      const result = distributeMuscleGroups(2);
      expect(result).toHaveLength(2);
    });

    it("creates 3 sessions for 3-day frequency", () => {
      const result = distributeMuscleGroups(3);
      expect(result).toHaveLength(3);
    });

    it("creates 4 sessions for 4-day frequency", () => {
      const result = distributeMuscleGroups(4);
      expect(result).toHaveLength(4);
    });

    it("creates 5 sessions for 5-day frequency", () => {
      const result = distributeMuscleGroups(5);
      expect(result).toHaveLength(5);
    });

    it("includes all major muscle groups across week", () => {
      const result = distributeMuscleGroups(4);
      const allMuscles = result.flatMap((session) => session.muscles);

      expect(allMuscles).toContain("Chest");
      expect(allMuscles).toContain("Back");
      expect(allMuscles).toContain("Legs");
      expect(allMuscles).toContain("Shoulders");
    });

    it("assigns unique day numbers", () => {
      const result = distributeMuscleGroups(4);
      const days = result.map((s) => s.dayOfWeek);
      const uniqueDays = new Set(days);
      expect(uniqueDays.size).toBe(result.length);
    });

    it("provides descriptive session names", () => {
      const result = distributeMuscleGroups(4);
      expect(result.every((s) => s.name.length > 0)).toBe(true);
    });
  });

  describe("calculateSessionVolume", () => {
    it("distributes 9-20 sets per muscle per week", () => {
      const result = calculateSessionVolume("Hypertrophy", 3);
      const totalSetsPerMuscle = result.reduce((sum, sets) => sum + sets, 0);

      expect(totalSetsPerMuscle).toBeGreaterThanOrEqual(9);
      expect(totalSetsPerMuscle).toBeLessThanOrEqual(20);
    });

    it("returns array matching session count", () => {
      const result = calculateSessionVolume("Hypertrophy", 4);
      expect(result).toHaveLength(4);
    });

    it("adjusts volume for Strength focus", () => {
      const hypertrophyVolume = calculateSessionVolume("Hypertrophy", 3);
      const strengthVolume = calculateSessionVolume("Strength", 3);

      const totalHypertrophy = hypertrophyVolume.reduce((a, b) => a + b, 0);
      const totalStrength = strengthVolume.reduce((a, b) => a + b, 0);

      // Strength typically has slightly lower volume
      expect(totalStrength).toBeLessThanOrEqual(totalHypertrophy);
    });

    it("adjusts volume for Endurance focus", () => {
      const result = calculateSessionVolume("Endurance", 3);
      const total = result.reduce((a, b) => a + b, 0);

      // Endurance should still be in valid range
      expect(total).toBeGreaterThanOrEqual(9);
      expect(total).toBeLessThanOrEqual(20);
    });
  });
});
