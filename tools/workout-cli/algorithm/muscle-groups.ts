import type { MuscleGroup } from "../../../lib/storage/types";
import type { SplitType } from "./types";

export interface SessionTemplate {
  name: string;
  dayOfWeek: number;
  muscles: MuscleGroup[];
}

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

export function getMuscleGroupsForFrequency(frequency: number): MuscleGroup[] {
  const sessions = distributeMuscleGroups(frequency);
  const allMuscles = new Set<MuscleGroup>();

  sessions.forEach((session) => {
    session.muscles.forEach((muscle) => allMuscles.add(muscle));
  });

  const orderedMuscles: MuscleGroup[] = [
    "Chest",
    "Back",
    "Legs",
    "Shoulders",
    "Arms",
    "Core",
  ];
  return orderedMuscles.filter((m) => allMuscles.has(m));
}

function createFullBodySplit(frequency: number): SessionTemplate[] {
  const sessions: SessionTemplate[] = [];
  const allMuscles: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms"];

  for (let i = 0; i < frequency; i++) {
    sessions.push({
      name: `Full Body ${i + 1}`,
      dayOfWeek: getDayOfWeek(i, frequency),
      muscles: allMuscles,
    });
  }

  return sessions;
}

function createUpperLowerSplit(): SessionTemplate[] {
  return [
    {
      name: "Upper Body A",
      dayOfWeek: 1,
      muscles: ["Chest", "Back", "Shoulders"],
    },
    {
      name: "Lower Body A",
      dayOfWeek: 2,
      muscles: ["Legs"],
    },
    {
      name: "Upper Body B",
      dayOfWeek: 4,
      muscles: ["Chest", "Back", "Arms"],
    },
    {
      name: "Lower Body B",
      dayOfWeek: 5,
      muscles: ["Legs"],
    },
  ];
}

function createPushPullLegsSplit(): SessionTemplate[] {
  return [
    {
      name: "Push Day",
      dayOfWeek: 1,
      muscles: ["Chest", "Shoulders"],
    },
    {
      name: "Pull Day",
      dayOfWeek: 2,
      muscles: ["Back", "Arms"],
    },
    {
      name: "Leg Day",
      dayOfWeek: 3,
      muscles: ["Legs"],
    },
    {
      name: "Upper Day",
      dayOfWeek: 5,
      muscles: ["Chest", "Back", "Shoulders"],
    },
    {
      name: "Lower Day",
      dayOfWeek: 6,
      muscles: ["Legs", "Core"],
    },
  ];
}

function getDayOfWeek(sessionIndex: number, frequency: number): number {
  if (frequency === 2) {
    return sessionIndex === 0 ? 1 : 4;
  }
  if (frequency === 3) {
    return [1, 3, 5][sessionIndex];
  }
  return sessionIndex + 1;
}

/**
 * Get pairs of consecutive session indices based on dayOfWeek
 * Returns array of [dayA, dayB] where dayB is immediately after dayA
 * E.g., for Upper/Lower: [[0,1], [2,3]] (Mon/Tue, Thu/Fri)
 * E.g., for PPL: [[0,1], [1,2]] (Mon/Tue, Tue/Wed)
 */
export function getConsecutiveDayPairs(sessions: SessionTemplate[]): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < sessions.length - 1; i++) {
    if (sessions[i + 1].dayOfWeek - sessions[i].dayOfWeek === 1) {
      pairs.push([i, i + 1]);
    }
  }
  return pairs;
}
