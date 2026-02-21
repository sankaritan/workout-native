/**
 * Type-safe AsyncStorage wrapper for user preferences
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Preferences } from "./types";

// Storage keys with namespace prefix
const KEYS = {
  ONBOARDING_COMPLETED: "@workout_app:onboarding_completed",
  UNIT_PREFERENCE: "@workout_app:unit_preference",
  STRAVA_SYNC_ENABLED: "@workout_app:strava_sync_enabled",
  STRAVA_CONNECTED: "@workout_app:strava_connected",
  STRAVA_INSTALL_ID: "@workout_app:strava_install_id",
  STRAVA_SYNC_TOKEN: "@workout_app:strava_sync_token",
  STRAVA_LAST_SYNC_AT: "@workout_app:strava_last_sync_at",
  STRAVA_LAST_SYNC_ERROR: "@workout_app:strava_last_sync_error",
} as const;

// Default values
const DEFAULTS: Preferences = {
  onboarding_completed: false,
  unit_preference: "lbs",
  strava_sync_enabled: false,
  strava_connected: false,
  strava_install_id: null,
  strava_sync_token: null,
  strava_last_sync_at: null,
  strava_last_sync_error: null,
};

// ============================================================================
// Onboarding Completed
// ============================================================================

/**
 * Get onboarding completion status
 * @returns true if onboarding completed, false otherwise
 */
export async function getOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
    if (value === null) {
      return DEFAULTS.onboarding_completed;
    }
    return value === "true";
  } catch (error) {
    console.error("Failed to get onboarding completed:", error);
    throw error;
  }
}

/**
 * Set onboarding completion status
 * @param completed - true if onboarding completed
 */
export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(
      KEYS.ONBOARDING_COMPLETED,
      completed.toString()
    );
  } catch (error) {
    console.error("Failed to set onboarding completed:", error);
    throw error;
  }
}

// ============================================================================
// Unit Preference
// ============================================================================

/**
 * Get unit preference for weight measurements
 * @returns 'lbs' or 'kg'
 */
export async function getUnitPreference(): Promise<"lbs" | "kg"> {
  try {
    const value = await AsyncStorage.getItem(KEYS.UNIT_PREFERENCE);
    if (value === null) {
      return DEFAULTS.unit_preference;
    }
    // Validate the value is one of the expected types
    if (value === "lbs" || value === "kg") {
      return value;
    }
    console.warn(`Invalid unit preference value: ${value}, returning default`);
    return DEFAULTS.unit_preference;
  } catch (error) {
    console.error("Failed to get unit preference:", error);
    throw error;
  }
}

/**
 * Set unit preference for weight measurements
 * @param unit - 'lbs' or 'kg'
 */
export async function setUnitPreference(unit: "lbs" | "kg"): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.UNIT_PREFERENCE, unit);
  } catch (error) {
    console.error("Failed to set unit preference:", error);
    throw error;
  }
}

// ============================================================================
// Strava Sync
// ============================================================================

/**
 * Get Strava sync enabled flag
 * @returns true if auto sync is enabled
 */
export async function getStravaSyncEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEYS.STRAVA_SYNC_ENABLED);
    if (value === null) {
      return DEFAULTS.strava_sync_enabled;
    }
    return value === "true";
  } catch (error) {
    console.error("Failed to get strava sync enabled:", error);
    throw error;
  }
}

/**
 * Set Strava sync enabled flag
 * @param enabled - true to enable sync
 */
export async function setStravaSyncEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.STRAVA_SYNC_ENABLED, enabled.toString());
  } catch (error) {
    console.error("Failed to set strava sync enabled:", error);
    throw error;
  }
}

export interface StravaConnectionState {
  connected: boolean;
  install_id: string | null;
  sync_token: string | null;
  last_sync_at: string | null;
  last_sync_error: string | null;
}

/**
 * Get Strava connection state
 */
export async function getStravaConnectionState(): Promise<StravaConnectionState> {
  try {
    const [connectedValue, installId, syncToken, lastSyncAt, lastSyncError] = await AsyncStorage.multiGet([
      KEYS.STRAVA_CONNECTED,
      KEYS.STRAVA_INSTALL_ID,
      KEYS.STRAVA_SYNC_TOKEN,
      KEYS.STRAVA_LAST_SYNC_AT,
      KEYS.STRAVA_LAST_SYNC_ERROR,
    ]);

    return {
      connected: connectedValue[1] === null ? DEFAULTS.strava_connected : connectedValue[1] === "true",
      install_id: installId[1] ?? DEFAULTS.strava_install_id,
      sync_token: syncToken[1] ?? DEFAULTS.strava_sync_token,
      last_sync_at: lastSyncAt[1] ?? DEFAULTS.strava_last_sync_at,
      last_sync_error: lastSyncError[1] ?? DEFAULTS.strava_last_sync_error,
    };
  } catch (error) {
    console.error("Failed to get strava connection state:", error);
    throw error;
  }
}

/**
 * Set Strava connection credentials/state
 */
export async function setStravaConnectionState(
  state: Partial<StravaConnectionState>
): Promise<void> {
  try {
    const entries: [string, string][] = [];

    if (state.connected !== undefined) {
      entries.push([KEYS.STRAVA_CONNECTED, state.connected.toString()]);
    }
    if (state.install_id !== undefined) {
      if (state.install_id === null) {
        await AsyncStorage.removeItem(KEYS.STRAVA_INSTALL_ID);
      } else {
        entries.push([KEYS.STRAVA_INSTALL_ID, state.install_id]);
      }
    }
    if (state.sync_token !== undefined) {
      if (state.sync_token === null) {
        await AsyncStorage.removeItem(KEYS.STRAVA_SYNC_TOKEN);
      } else {
        entries.push([KEYS.STRAVA_SYNC_TOKEN, state.sync_token]);
      }
    }
    if (state.last_sync_at !== undefined) {
      if (state.last_sync_at === null) {
        await AsyncStorage.removeItem(KEYS.STRAVA_LAST_SYNC_AT);
      } else {
        entries.push([KEYS.STRAVA_LAST_SYNC_AT, state.last_sync_at]);
      }
    }
    if (state.last_sync_error !== undefined) {
      if (state.last_sync_error === null) {
        await AsyncStorage.removeItem(KEYS.STRAVA_LAST_SYNC_ERROR);
      } else {
        entries.push([KEYS.STRAVA_LAST_SYNC_ERROR, state.last_sync_error]);
      }
    }

    if (entries.length > 0) {
      await AsyncStorage.multiSet(entries);
    }
  } catch (error) {
    console.error("Failed to set strava connection state:", error);
    throw error;
  }
}

/**
 * Clear Strava connection state and credentials
 */
export async function clearStravaConnectionState(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.STRAVA_CONNECTED,
      KEYS.STRAVA_INSTALL_ID,
      KEYS.STRAVA_SYNC_TOKEN,
      KEYS.STRAVA_LAST_SYNC_AT,
      KEYS.STRAVA_LAST_SYNC_ERROR,
    ]);
  } catch (error) {
    console.error("Failed to clear strava connection state:", error);
    throw error;
  }
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Get all preferences at once
 * @returns Object containing all preference values
 */
export async function getAllPreferences(): Promise<Preferences> {
  try {
    const [onboarding_completed, unit_preference, strava_sync_enabled, stravaConnection] = await Promise.all([
      getOnboardingCompleted(),
      getUnitPreference(),
      getStravaSyncEnabled(),
      getStravaConnectionState(),
    ]);

    return {
      onboarding_completed,
      unit_preference,
      strava_sync_enabled,
      strava_connected: stravaConnection.connected,
      strava_install_id: stravaConnection.install_id,
      strava_sync_token: stravaConnection.sync_token,
      strava_last_sync_at: stravaConnection.last_sync_at,
      strava_last_sync_error: stravaConnection.last_sync_error,
    };
  } catch (error) {
    console.error("Failed to get all preferences:", error);
    throw error;
  }
}

/**
 * Clear all preferences (reset to defaults)
 * WARNING: This will delete all stored preferences
 */
export async function clearAllPreferences(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.ONBOARDING_COMPLETED,
      KEYS.UNIT_PREFERENCE,
      KEYS.STRAVA_SYNC_ENABLED,
      KEYS.STRAVA_CONNECTED,
      KEYS.STRAVA_INSTALL_ID,
      KEYS.STRAVA_SYNC_TOKEN,
      KEYS.STRAVA_LAST_SYNC_AT,
      KEYS.STRAVA_LAST_SYNC_ERROR,
    ]);
    console.log("All preferences cleared");
  } catch (error) {
    console.error("Failed to clear preferences:", error);
    throw error;
  }
}
