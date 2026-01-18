/**
 * Muscle Group Distribution Logic
 * Handles training splits and volume distribution
 */

import type { MuscleGroup } from "@/lib/storage/types";
import type { SplitType } from "./types";

/**
 * Session template for distribution
 */
export interface SessionTemplate {
  name: string;
  dayOfWeek: number;
  muscles: MuscleGroup[];
}

/**
 * Determine training split type based on frequency
 */
export function getSplitType(frequency: number): SplitType {
  switch (frequency) {
    case 2:
    case 3:
      return "Full Body";
    case 4:
      return "Upper/Lower";
    case 5:
      return "Push/Pull/Legs";
    default:
      return "Full Body";
  }
}

/**
 * Distribute muscle groups across training days
 * Returns array of sessions with assigned muscle groups
 */
export function distributeMuscleGroups(frequency: number): SessionTemplate[] {
  const splitType = getSplitType(frequency);

  switch (splitType) {
    case "Full Body":
      return createFullBodySplit(frequency);
    case "Upper/Lower":
      return createUpperLowerSplit();
    case "Push/Pull/Legs":
      return createPushPullLegsSplit();
    default:
      return createFullBodySplit(frequency);
  }
}

/**
 * Get all unique muscle groups that will be trained based on frequency
 * Used to determine which muscle groups to show in exercise selection
 */
export function getMuscleGroupsForFrequency(frequency: number): MuscleGroup[] {
  const sessions = distributeMuscleGroups(frequency);
  const allMuscles = new Set<MuscleGroup>();

  sessions.forEach((session) => {
    session.muscles.forEach((muscle) => allMuscles.add(muscle));
  });

  // Return in consistent order
  const orderedMuscles: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
  return orderedMuscles.filter((m) => allMuscles.has(m));
}

/**
 * Create full body split (2-3 days)
 * Each session trains all major muscle groups
 */
function createFullBodySplit(frequency: number): SessionTemplate[] {
  const sessions: SessionTemplate[] = [];
  const allMuscles: MuscleGroup[] = [
    "Chest",
    "Back",
    "Legs",
    "Shoulders",
    "Arms",
  ];

  for (let i = 0; i < frequency; i++) {
    sessions.push({
      name: `Full Body ${i + 1}`,
      dayOfWeek: getDayOfWeek(i, frequency),
      muscles: allMuscles,
    });
  }

  return sessions;
}

/**
 * Create upper/lower split (4 days)
 * Alternates between upper and lower body
 */
function createUpperLowerSplit(): SessionTemplate[] {
  return [
    {
      name: "Upper Body A",
      dayOfWeek: 1, // Monday
      muscles: ["Chest", "Back", "Shoulders"],
    },
    {
      name: "Lower Body A",
      dayOfWeek: 2, // Tuesday
      muscles: ["Legs"],
    },
    {
      name: "Upper Body B",
      dayOfWeek: 4, // Thursday
      muscles: ["Chest", "Back", "Arms"],
    },
    {
      name: "Lower Body B",
      dayOfWeek: 5, // Friday
      muscles: ["Legs"],
    },
  ];
}

/**
 * Create push/pull/legs split (5 days)
 * Push: Chest, Shoulders, Triceps
 * Pull: Back, Biceps
 * Legs: Legs
 */
function createPushPullLegsSplit(): SessionTemplate[] {
  return [
    {
      name: "Push Day",
      dayOfWeek: 1, // Monday
      muscles: ["Chest", "Shoulders"],
    },
    {
      name: "Pull Day",
      dayOfWeek: 2, // Tuesday
      muscles: ["Back", "Arms"],
    },
    {
      name: "Leg Day",
      dayOfWeek: 3, // Wednesday
      muscles: ["Legs"],
    },
    {
      name: "Upper Day",
      dayOfWeek: 5, // Friday
      muscles: ["Chest", "Back", "Shoulders"],
    },
    {
      name: "Lower Day",
      dayOfWeek: 6, // Saturday
      muscles: ["Legs", "Core"],
    },
  ];
}

/**
 * Calculate day of week based on session index and frequency
 * Spreads sessions across the week
 */
function getDayOfWeek(sessionIndex: number, frequency: number): number {
  if (frequency === 2) {
    return sessionIndex === 0 ? 1 : 4; // Mon, Thu
  }
  if (frequency === 3) {
    return [1, 3, 5][sessionIndex]; // Mon, Wed, Fri
  }
  return sessionIndex + 1; // Default: consecutive days
}

/**
 * Calculate volume (sets) per muscle per session
 * Returns array of sets for each session
 */
export function calculateSessionVolume(
  focus: "Balanced" | "Strength" | "Endurance",
  sessionsPerWeek: number
): number[] {
  // Weekly volume targets per muscle (9-20 sets)
  let weeklyVolume: number;

  switch (focus) {
    case "Balanced":
      weeklyVolume = 16; // Mid-high volume
      break;
    case "Strength":
      weeklyVolume = 12; // Moderate volume, higher intensity
      break;
    case "Endurance":
      weeklyVolume = 14; // Moderate-high volume
      break;
  }

  // Distribute volume across sessions
  const baseVolume = Math.floor(weeklyVolume / sessionsPerWeek);
  const remainder = weeklyVolume % sessionsPerWeek;

  const sessionVolumes: number[] = [];
  for (let i = 0; i < sessionsPerWeek; i++) {
    // Add extra set to first sessions if there's a remainder
    sessionVolumes.push(baseVolume + (i < remainder ? 1 : 0));
  }

  return sessionVolumes;
}
