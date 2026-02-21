import {
  syncCompletedSessionToStrava,
  retryPendingStravaSyncs,
} from "@/lib/strava/sync";
import {
  getStravaConnectionState,
  getStravaSyncEnabled,
  setStravaConnectionState,
} from "@/lib/storage/preferences";
import { postStravaSessionSync } from "@/lib/strava/client";
import {
  enqueueStravaSyncOutbox,
  getStravaSyncOutbox,
  removeOutboxItemByIdempotencyKey,
} from "@/lib/strava/outbox";

jest.mock("@/lib/storage/preferences", () => ({
  getStravaConnectionState: jest.fn(),
  getStravaSyncEnabled: jest.fn(),
  setStravaConnectionState: jest.fn(),
}));

jest.mock("@/lib/strava/client", () => ({
  postStravaSessionSync: jest.fn(),
}));

jest.mock("@/lib/strava/outbox", () => ({
  enqueueStravaSyncOutbox: jest.fn(),
  getStravaSyncOutbox: jest.fn(),
  removeOutboxItemByIdempotencyKey: jest.fn(),
}));

describe("strava sync orchestration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getStravaSyncEnabled as jest.Mock).mockResolvedValue(true);
    (getStravaConnectionState as jest.Mock).mockResolvedValue({
      connected: true,
      install_id: "install-1",
      sync_token: "token-1",
      last_sync_at: null,
      last_sync_error: null,
    });
    (getStravaSyncOutbox as jest.Mock).mockResolvedValue([]);
    (postStravaSessionSync as jest.Mock).mockResolvedValue(undefined);
  });

  it("does not sync when disabled", async () => {
    (getStravaSyncEnabled as jest.Mock).mockResolvedValue(false);

    await syncCompletedSessionToStrava({
      completedSessionId: 10,
      completedAtIso: "2026-02-21T14:00:00.000Z",
      completedSetCount: 3,
      activityType: "plan",
    });

    expect(postStravaSessionSync).not.toHaveBeenCalled();
  });

  it("synces when enabled and connected", async () => {
    await syncCompletedSessionToStrava({
      completedSessionId: 10,
      completedAtIso: "2026-02-21T14:00:00.000Z",
      completedSetCount: 3,
      activityType: "plan",
    });

    expect(postStravaSessionSync).toHaveBeenCalledWith(
      "token-1",
      expect.objectContaining({
        installId: "install-1",
        activityName: "Workout 02-21",
        sportType: "WeightTraining",
        elapsedSeconds: 720,
        startTimeIso: "2026-02-21T13:48:00.000Z",
        endTimeIso: "2026-02-21T14:00:00.000Z",
      })
    );
    expect(setStravaConnectionState).toHaveBeenCalledWith(
      expect.objectContaining({
        last_sync_error: null,
      })
    );
  });

  it("queues outbox item when sync request fails", async () => {
    (postStravaSessionSync as jest.Mock).mockRejectedValue(new Error("network down"));

    await syncCompletedSessionToStrava({
      completedSessionId: 11,
      completedAtIso: "2026-02-21T14:00:00.000Z",
      completedSetCount: 2,
      activityType: "single",
    });

    expect(enqueueStravaSyncOutbox).toHaveBeenCalledWith(
      expect.objectContaining({
        activityType: "single",
      }),
      "network down"
    );
  });

  it("retries pending outbox items and removes on success", async () => {
    (getStravaSyncOutbox as jest.Mock).mockResolvedValue([
      {
        payload: {
          installId: "install-1",
          idempotencyKey: "session-5-2026",
          activityName: "Workout 02-21",
          sportType: "WeightTraining",
          activityType: "plan",
          startTimeIso: "2026-02-21T13:48:00.000Z",
          endTimeIso: "2026-02-21T14:00:00.000Z",
          elapsedSeconds: 720,
        },
      },
    ]);

    await retryPendingStravaSyncs();

    expect(postStravaSessionSync).toHaveBeenCalledTimes(1);
    expect(removeOutboxItemByIdempotencyKey).toHaveBeenCalledWith("session-5-2026");
  });
});
