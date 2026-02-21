export type StravaSportType = "Workout" | "WeightTraining";

export interface StravaSessionTiming {
  startTimeIso: string;
  endTimeIso: string;
  elapsedSeconds: number;
}

export interface StravaSyncSessionInput {
  completedSessionId: number;
  completedAtIso: string;
  completedSetCount: number;
}

export interface StravaSyncPayload extends StravaSessionTiming {
  installId: string;
  idempotencyKey: string;
  activityName: string;
  sportType: StravaSportType;
  activityType: "plan" | "single";
}

export interface RegisterInstallResponse {
  connect_url: string;
  sync_token: string;
}

export interface StravaConnectionStatusResponse {
  connected: boolean;
}
