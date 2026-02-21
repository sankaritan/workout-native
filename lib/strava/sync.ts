import {
  getStravaConnectionState,
  getStravaSyncEnabled,
  setStravaConnectionState,
} from "@/lib/storage/preferences";
import {
  getAllCompletedSessions,
  getCompletedSetsBySessionId,
} from "@/lib/storage/storage";
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

interface SyncCompletedSessionInput {
  completedSessionId: number;
  completedAtIso: string;
  completedSetCount: number;
  activityType: "plan" | "single";
}

async function canUseStravaConnection(
  requireAutoSyncEnabled: boolean
): Promise<{
  syncToken: string;
  installId: string;
} | null> {
  const [syncEnabled, connection] = await Promise.all([
    getStravaSyncEnabled(),
    getStravaConnectionState(),
  ]);

  if (requireAutoSyncEnabled && !syncEnabled) {
    return null;
  }
  if (!connection.connected || !connection.install_id || !connection.sync_token) {
    return null;
  }

  return {
    syncToken: connection.sync_token,
    installId: connection.install_id,
  };
}

async function syncSessionPayload(
  input: SyncCompletedSessionInput,
  credentials: { syncToken: string; installId: string }
): Promise<boolean> {
  const timing = calculateStravaSessionTiming(input.completedAtIso, input.completedSetCount);
  const payload: StravaSyncPayload = {
    installId: credentials.installId,
    idempotencyKey: buildStravaIdempotencyKey(input.completedSessionId, input.completedAtIso),
    activityName: formatWorkoutActivityName(input.completedAtIso),
    sportType: "WeightTraining",
    activityType: input.activityType,
    startTimeIso: timing.startTimeIso,
    endTimeIso: timing.endTimeIso,
    elapsedSeconds: timing.elapsedSeconds,
  };

  try {
    await postStravaSessionSync(credentials.syncToken, payload);
    await setStravaConnectionState({
      last_sync_at: new Date().toISOString(),
      last_sync_error: null,
    });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Strava sync error";
    await enqueueStravaSyncOutbox(payload, message);
    await setStravaConnectionState({
      last_sync_error: message,
    });
    return false;
  }
}

export async function syncCompletedSessionToStrava(input: SyncCompletedSessionInput): Promise<void> {
  const credentials = await canUseStravaConnection(true);
  if (!credentials) {
    return;
  }
  await syncSessionPayload(input, credentials);
}

export async function syncAllCompletedSessionsToStrava(): Promise<{
  attempted: number;
  succeeded: number;
}> {
  return syncAllCompletedSessionsToStravaWithProgress();
}

export async function syncAllCompletedSessionsToStravaWithProgress(
  onProgress?: (progress: { processed: number; total: number; succeeded: number }) => void
): Promise<{
  attempted: number;
  succeeded: number;
}> {
  const credentials = await canUseStravaConnection(false);
  if (!credentials) {
    return { attempted: 0, succeeded: 0 };
  }

  const completedSessions = getAllCompletedSessions().filter((session) => session.completed_at !== null);
  const total = completedSessions.length;
  let attempted = 0;
  let succeeded = 0;

  for (const session of completedSessions) {
    const completedAtIso = session.completed_at;
    if (!completedAtIso) {
      continue;
    }

    const completedSetCount = getCompletedSetsBySessionId(session.id).length;
    const wasSuccessful = await syncSessionPayload(
      {
        completedSessionId: session.id,
        completedAtIso,
        completedSetCount,
        activityType: (session.session_type ?? "plan") === "single" ? "single" : "plan",
      },
      credentials
    );
    attempted += 1;
    if (wasSuccessful) {
      succeeded += 1;
    }
    onProgress?.({
      processed: attempted,
      total,
      succeeded,
    });
  }

  return { attempted, succeeded };
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
