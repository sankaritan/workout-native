/**
 * Type-safe AsyncStorage wrapper for user preferences
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Preferences } from "./types";

// Storage keys with namespace prefix
const KEYS = {
  ONBOARDING_COMPLETED: "@workout_app:onboarding_completed",
  UNIT_PREFERENCE: "@workout_app:unit_preference",
} as const;

// Default values
const DEFAULTS: Preferences = {
  onboarding_completed: false,
  unit_preference: "lbs",
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
// Batch Operations
// ============================================================================

/**
 * Get all preferences at once
 * @returns Object containing all preference values
 */
export async function getAllPreferences(): Promise<Preferences> {
  try {
    const [onboarding_completed, unit_preference] = await Promise.all([
      getOnboardingCompleted(),
      getUnitPreference(),
    ]);

    return {
      onboarding_completed,
      unit_preference,
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
    ]);
    console.log("All preferences cleared");
  } catch (error) {
    console.error("Failed to clear preferences:", error);
    throw error;
  }
}
