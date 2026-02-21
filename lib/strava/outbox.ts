import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StravaSyncPayload } from "@/lib/strava/types";

const OUTBOX_KEY = "@workout_app:strava_sync_outbox";

export interface StravaSyncOutboxItem {
  payload: StravaSyncPayload;
  createdAtIso: string;
  lastError: string;
}

async function readOutbox(): Promise<StravaSyncOutboxItem[]> {
  const raw = await AsyncStorage.getItem(OUTBOX_KEY);
  if (!raw) {
    return [];
  }

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((item): item is StravaSyncOutboxItem => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const maybe = item as StravaSyncOutboxItem;
    return (
      typeof maybe.createdAtIso === "string" &&
      typeof maybe.lastError === "string" &&
      typeof maybe.payload === "object" &&
      maybe.payload !== null
    );
  });
}

async function writeOutbox(items: StravaSyncOutboxItem[]): Promise<void> {
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
}

export async function getStravaSyncOutbox(): Promise<StravaSyncOutboxItem[]> {
  return readOutbox();
}

export async function enqueueStravaSyncOutbox(
  payload: StravaSyncPayload,
  lastError: string
): Promise<void> {
  const existing = await readOutbox();
  const deduped = existing.filter(
    (item) => item.payload.idempotencyKey !== payload.idempotencyKey
  );
  deduped.push({
    payload,
    createdAtIso: new Date().toISOString(),
    lastError,
  });
  await writeOutbox(deduped);
}

export async function removeOutboxItemByIdempotencyKey(idempotencyKey: string): Promise<void> {
  const existing = await readOutbox();
  const filtered = existing.filter(
    (item) => item.payload.idempotencyKey !== idempotencyKey
  );
  await writeOutbox(filtered);
}
