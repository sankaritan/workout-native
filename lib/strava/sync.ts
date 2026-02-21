import {
  getStravaConnectionState,
  getStravaSyncEnabled,
  setStravaConnectionState,
} from "@/lib/storage/preferences";
import {
  getStravaSyncOutbox,
  enqueueStravaSyncOutbox,
  removeOutboxItemByIdempotencyKey,
} from "@/lib/strava/outbox";
import { postStravaSessionSync } from "@/lib/strava/client";
import {
  buildStravaIdempotencyKey,
  calculateStravaSessionTiming,
  formatWorkoutActivityName,
} from "@/lib/strava/time";
import type { StravaSyncPayload } from "@/lib/strava/types";

export async function syncCompletedSessionToStrava(input: {
  completedSessionId: number;
  completedAtIso: string;
  completedSetCount: number;
  activityType: "plan" | "single";
}): Promise<void> {
  const [syncEnabled, connection] = await Promise.all([
    getStravaSyncEnabled(),
    getStravaConnectionState(),
  ]);

  if (!syncEnabled || !connection.connected || !connection.install_id || !connection.sync_token) {
    return;
  }

  const timing = calculateStravaSessionTiming(input.completedAtIso, input.completedSetCount);
  const payload: StravaSyncPayload = {
    installId: connection.install_id,
    idempotencyKey: buildStravaIdempotencyKey(input.completedSessionId, input.completedAtIso),
    activityName: formatWorkoutActivityName(input.completedAtIso),
    sportType: "WeightTraining",
    activityType: input.activityType,
    startTimeIso: timing.startTimeIso,
    endTimeIso: timing.endTimeIso,
    elapsedSeconds: timing.elapsedSeconds,
  };

  try {
    await postStravaSessionSync(connection.sync_token, payload);
    await setStravaConnectionState({
      last_sync_at: new Date().toISOString(),
      last_sync_error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Strava sync error";
    await enqueueStravaSyncOutbox(payload, message);
    await setStravaConnectionState({
      last_sync_error: message,
    });
  }
}

export async function retryPendingStravaSyncs(): Promise<void> {
  const [syncEnabled, connection, pending] = await Promise.all([
    getStravaSyncEnabled(),
    getStravaConnectionState(),
    getStravaSyncOutbox(),
  ]);

  if (!syncEnabled || !connection.connected || !connection.sync_token || pending.length === 0) {
    return;
  }

  for (const item of pending) {
    try {
      await postStravaSessionSync(connection.sync_token, item.payload);
      await removeOutboxItemByIdempotencyKey(item.payload.idempotencyKey);
      await setStravaConnectionState({
        last_sync_at: new Date().toISOString(),
        last_sync_error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Strava sync error";
      await setStravaConnectionState({
        last_sync_error: message,
      });
    }
  }
}
