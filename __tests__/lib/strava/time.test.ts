import {
  SECONDS_PER_COMPLETED_SET,
  buildStravaIdempotencyKey,
  calculateStravaSessionTiming,
  formatWorkoutActivityName,
} from "@/lib/strava/time";

describe("strava time helpers", () => {
  it("uses 4 minutes per completed set", () => {
    expect(SECONDS_PER_COMPLETED_SET).toBe(240);
  });

  it("calculates start and elapsed from completed sets", () => {
    const completedAtIso = "2026-02-21T14:00:00.000Z";
    const timing = calculateStravaSessionTiming(completedAtIso, 3);

    expect(timing.endTimeIso).toBe("2026-02-21T14:00:00.000Z");
    expect(timing.startTimeIso).toBe("2026-02-21T13:48:00.000Z");
    expect(timing.elapsedSeconds).toBe(720);
  });

  it("formats activity names as Workout MM-DD", () => {
    expect(formatWorkoutActivityName("2026-07-04T10:00:00.000Z")).toBe("Workout 07-04");
  });

  it("builds deterministic idempotency key", () => {
    expect(buildStravaIdempotencyKey(7, "2026-02-21T14:00:00.000Z")).toBe(
      "session-7-2026-02-21T14:00:00.000Z"
    );
  });
});
