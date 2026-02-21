import type { StravaSessionTiming } from "@/lib/strava/types";

export const SECONDS_PER_COMPLETED_SET = 4 * 60;

function toTwoDigits(value: number): string {
  return value.toString().padStart(2, "0");
}

export function calculateStravaSessionTiming(
  completedAtIso: string,
  completedSetCount: number
): StravaSessionTiming {
  const end = new Date(completedAtIso);
  const safeSetCount = Math.max(0, completedSetCount);
  const elapsedSeconds = safeSetCount * SECONDS_PER_COMPLETED_SET;
  const start = new Date(end.getTime() - elapsedSeconds * 1000);

  return {
    startTimeIso: start.toISOString(),
    endTimeIso: end.toISOString(),
    elapsedSeconds,
  };
}

export function formatWorkoutActivityName(completedAtIso: string): string {
  const date = new Date(completedAtIso);
  const month = toTwoDigits(date.getMonth() + 1);
  const day = toTwoDigits(date.getDate());
  return `Training ${month}-${day}`;
}

export function buildStravaIdempotencyKey(
  completedSessionId: number,
  completedAtIso: string
): string {
  return `session-${completedSessionId}-${completedAtIso}`;
}
