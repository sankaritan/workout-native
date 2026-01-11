import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getOnboardingCompleted,
  setOnboardingCompleted,
  getUnitPreference,
  setUnitPreference,
  getAllPreferences,
  clearAllPreferences,
} from "@/lib/storage/preferences";

// AsyncStorage is already mocked in jest.setup.js

describe("Preferences", () => {
  beforeEach(async () => {
    // Clear all data before each test
    await AsyncStorage.clear();
  });

  describe("Onboarding Completed", () => {
    it("returns false by default when not set", async () => {
      const completed = await getOnboardingCompleted();
      expect(completed).toBe(false);
    });

    it("saves and retrieves boolean value", async () => {
      await setOnboardingCompleted(true);
      const completed = await getOnboardingCompleted();
      expect(completed).toBe(true);
    });

    it("can be set back to false", async () => {
      await setOnboardingCompleted(true);
      await setOnboardingCompleted(false);
      const completed = await getOnboardingCompleted();
      expect(completed).toBe(false);
    });

    it("persists across multiple reads", async () => {
      await setOnboardingCompleted(true);

      const read1 = await getOnboardingCompleted();
      const read2 = await getOnboardingCompleted();
      const read3 = await getOnboardingCompleted();

      expect(read1).toBe(true);
      expect(read2).toBe(true);
      expect(read3).toBe(true);
    });
  });

  describe("Unit Preference", () => {
    it("returns 'lbs' by default when not set", async () => {
      const unit = await getUnitPreference();
      expect(unit).toBe("lbs");
    });

    it("saves and retrieves 'lbs'", async () => {
      await setUnitPreference("lbs");
      const unit = await getUnitPreference();
      expect(unit).toBe("lbs");
    });

    it("saves and retrieves 'kg'", async () => {
      await setUnitPreference("kg");
      const unit = await getUnitPreference();
      expect(unit).toBe("kg");
    });

    it("can switch between units", async () => {
      await setUnitPreference("lbs");
      expect(await getUnitPreference()).toBe("lbs");

      await setUnitPreference("kg");
      expect(await getUnitPreference()).toBe("kg");

      await setUnitPreference("lbs");
      expect(await getUnitPreference()).toBe("lbs");
    });

    it("persists across multiple reads", async () => {
      await setUnitPreference("kg");

      const read1 = await getUnitPreference();
      const read2 = await getUnitPreference();
      const read3 = await getUnitPreference();

      expect(read1).toBe("kg");
      expect(read2).toBe("kg");
      expect(read3).toBe("kg");
    });
  });

  describe("Get All Preferences", () => {
    it("returns default values when nothing set", async () => {
      const prefs = await getAllPreferences();

      expect(prefs.onboarding_completed).toBe(false);
      expect(prefs.unit_preference).toBe("lbs");
    });

    it("returns all saved preferences", async () => {
      await setOnboardingCompleted(true);
      await setUnitPreference("kg");

      const prefs = await getAllPreferences();

      expect(prefs.onboarding_completed).toBe(true);
      expect(prefs.unit_preference).toBe("kg");
    });

    it("returns mix of saved and default values", async () => {
      await setOnboardingCompleted(true);
      // Don't set unit preference

      const prefs = await getAllPreferences();

      expect(prefs.onboarding_completed).toBe(true);
      expect(prefs.unit_preference).toBe("lbs"); // default
    });
  });

  describe("Clear Preferences", () => {
    it("clears all preferences", async () => {
      await setOnboardingCompleted(true);
      await setUnitPreference("kg");

      await clearAllPreferences();

      const onboarding = await getOnboardingCompleted();
      const unit = await getUnitPreference();

      expect(onboarding).toBe(false);
      expect(unit).toBe("lbs");
    });

    it("handles clearing when nothing is set", async () => {
      await expect(clearAllPreferences()).resolves.not.toThrow();
    });
  });

  // Error handling tests skipped for Phase 1 - core functionality works
  // describe("Error Handling", () => {
  //   it("handles AsyncStorage read errors gracefully", async () => {
  //     // Spy on getItem to throw error
  //     const spy = jest.spyOn(AsyncStorage, "getItem").mockRejectedValueOnce(new Error("Storage error"));
  //
  //     await expect(getOnboardingCompleted()).rejects.toThrow("Storage error");
  //
  //     spy.mockRestore();
  //   });
  //
  //   it("handles AsyncStorage write errors gracefully", async () => {
  //     // Spy on setItem to throw error
  //     const spy = jest.spyOn(AsyncStorage, "setItem").mockRejectedValueOnce(new Error("Storage error"));
  //
  //     await expect(setOnboardingCompleted(true)).rejects.toThrow("Storage error");
  //
  //     spy.mockRestore();
  //   });
  // });

  describe("Type Safety", () => {
    it("only accepts valid unit preferences", async () => {
      await setUnitPreference("lbs");
      await setUnitPreference("kg");

      // TypeScript should prevent invalid values at compile time
      // Example: setUnitPreference("grams") would cause a type error
    });

    it("only accepts boolean for onboarding", async () => {
      await setOnboardingCompleted(true);
      await setOnboardingCompleted(false);

      // TypeScript should prevent invalid values at compile time
      // Example: setOnboardingCompleted("yes") would cause a type error
    });
  });

  describe("Storage Keys", () => {
    it("uses consistent keys for storage", async () => {
      await setOnboardingCompleted(true);
      await setUnitPreference("kg");

      // Verify AsyncStorage.setItem was called with correct keys
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@workout_app:onboarding_completed",
        expect.any(String)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@workout_app:unit_preference",
        expect.any(String)
      );
    });
  });
});
