/**
 * Settings Screen
 * Provides utilities for backup/restore and development
 */

import { exportBackup } from "@/lib/backup/export";
import { importBackup } from "@/lib/backup/import";
import {
  disconnectStravaInstall,
  getStravaConnectionStatus,
  getStravaSyncApiBaseUrl,
  registerStravaInstall,
} from "@/lib/strava/client";
import {
  retryPendingStravaSyncs,
  syncAllCompletedSessionsToStravaWithProgress,
} from "@/lib/strava/sync";
import {
  clearStravaConnectionState,
  getStravaConnectionState,
  getStravaSyncEnabled,
  setStravaConnectionState,
  setStravaSyncEnabled,
} from "@/lib/storage/preferences";
import { seedExercises, seedMockWorkoutHistory, seedTestWorkoutPlan } from "@/lib/storage/seed-data";
import { getAllWorkoutPlans, resetStorage } from "@/lib/storage/storage";
import { showAlert } from "@/lib/utils/alert";
import { MaterialIcons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [isProcessing, setIsProcessing] = useState(false);
  const [planCount, setPlanCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [stravaEnabled, setStravaEnabled] = useState(false);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [stravaInstallId, setStravaInstallId] = useState<string | null>(null);
  const [stravaSyncToken, setStravaSyncToken] = useState<string | null>(null);
  const [stravaLastSyncAt, setStravaLastSyncAt] = useState<string | null>(null);
  const [stravaLastSyncError, setStravaLastSyncError] = useState<string | null>(null);
  const [isStravaBusy, setIsStravaBusy] = useState(false);
  const [syncAllProgress, setSyncAllProgress] = useState<{
    processed: number;
    total: number;
    succeeded: number;
  } | null>(null);

  const loadDataStats = () => {
    try {
      const plans = getAllWorkoutPlans();
      setPlanCount(plans.length);
    } catch (error) {
      console.error("Failed to load data stats:", error);
    }
  };

  const loadStravaSettings = async (): Promise<{
    enabled: boolean;
    connection: Awaited<ReturnType<typeof getStravaConnectionState>>;
  } | null> => {
    try {
      const [enabled, connection] = await Promise.all([
        getStravaSyncEnabled(),
        getStravaConnectionState(),
      ]);
      setStravaEnabled(enabled);
      setStravaConnected(connection.connected);
      setStravaInstallId(connection.install_id);
      setStravaSyncToken(connection.sync_token);
      setStravaLastSyncAt(connection.last_sync_at);
      setStravaLastSyncError(connection.last_sync_error);
      return { enabled, connection };
    } catch (error) {
      console.error("Failed to load strava settings:", error);
      return null;
    }
  };

  const reconcileStravaConnectionStatus = async (
    installIdOverride?: string | null,
    syncTokenOverride?: string | null
  ): Promise<boolean> => {
    const installId = installIdOverride ?? stravaInstallId;
    const syncToken = syncTokenOverride ?? stravaSyncToken;
    if (!installId || !syncToken) {
      return false;
    }

    try {
      const status = await getStravaConnectionStatus(installId, syncToken);
      await setStravaConnectionState({ connected: status.connected });
      setStravaConnected(status.connected);
      return status.connected;
    } catch (error) {
      console.error("Failed to refresh Strava connection status:", error);
      return false;
    }
  };

  const generateInstallId = (): string => {
    return `install-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  };

  useEffect(() => {
    loadDataStats();
    void loadStravaSettings().then((data) => {
      void reconcileStravaConnectionStatus(
        data?.connection.install_id ?? null,
        data?.connection.sync_token ?? null
      );
    });
    void retryPendingStravaSyncs();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadDataStats();
      void loadStravaSettings().then((data) => {
        void reconcileStravaConnectionStatus(
          data?.connection.install_id ?? null,
          data?.connection.sync_token ?? null
        );
      });
      void retryPendingStravaSyncs();
    }, [])
  );

  const handleToggleStravaSync = async () => {
    const nextValue = !stravaEnabled;
    try {
      setIsStravaBusy(true);
      await setStravaSyncEnabled(nextValue);
      setStravaEnabled(nextValue);
      setSuccessMessage(nextValue ? "✓ Strava auto-sync enabled" : "✓ Strava auto-sync disabled");
    } catch (error) {
      console.error("Failed to toggle Strava sync:", error);
      showAlert("Error", "Failed to update Strava sync setting.");
    } finally {
      setIsStravaBusy(false);
    }
  };

  const handleConnectStrava = async () => {
    try {
      setIsStravaBusy(true);
      const baseUrl = getStravaSyncApiBaseUrl();
      if (!baseUrl) {
        showAlert(
          "Strava Sync Not Configured",
          "Set EXPO_PUBLIC_STRAVA_SYNC_API_BASE_URL before connecting Strava."
        );
        return;
      }

      const installId = stravaInstallId ?? generateInstallId();
      const registration = await registerStravaInstall(installId);
      await setStravaConnectionState({
        connected: false,
        install_id: installId,
        sync_token: registration.sync_token,
      });
      setStravaInstallId(installId);
      setStravaSyncToken(registration.sync_token);

      if (Platform.OS === "web" && typeof window !== "undefined") {
        setSuccessMessage("Redirecting to Strava...");
        window.location.assign(registration.connect_url);
        return;
      }

      await WebBrowser.openBrowserAsync(registration.connect_url);
      const connected = await reconcileStravaConnectionStatus(installId, registration.sync_token);
      if (connected) {
        setSuccessMessage("✓ Strava connected successfully.");
      } else {
        setSuccessMessage("Strava connection is pending. Return to this screen after completing OAuth.");
      }
    } catch (error) {
      console.error("Failed to connect Strava:", error);
      showAlert("Error", "Failed to connect to Strava.");
    } finally {
      setIsStravaBusy(false);
      await loadStravaSettings();
    }
  };

  const handleDisconnectStrava = async () => {
    try {
      setIsStravaBusy(true);
      if (stravaInstallId && stravaSyncToken) {
        await disconnectStravaInstall(stravaInstallId, stravaSyncToken);
      }

      await clearStravaConnectionState();
      await setStravaSyncEnabled(false);
      setStravaConnected(false);
      setStravaEnabled(false);
      setStravaInstallId(null);
      setStravaSyncToken(null);
      setStravaLastSyncAt(null);
      setStravaLastSyncError(null);
      setSuccessMessage("✓ Strava disconnected.");
    } catch (error) {
      console.error("Failed to disconnect Strava:", error);
      showAlert("Error", "Failed to disconnect Strava.");
    } finally {
      setIsStravaBusy(false);
    }
  };

  const handleSyncAllHistory = async () => {
    try {
      setIsStravaBusy(true);
      setSyncAllProgress({ processed: 0, total: 0, succeeded: 0 });
      const result = await syncAllCompletedSessionsToStravaWithProgress((progress) => {
        setSyncAllProgress(progress);
      });
      if (result.attempted === 0) {
        setSuccessMessage("No completed sessions to sync or Strava is not connected.");
      } else {
        setSuccessMessage(`✓ Synced ${result.succeeded}/${result.attempted} sessions to Strava.`);
      }
      await loadStravaSettings();
    } catch (error) {
      console.error("Failed to sync all Strava history:", error);
      showAlert("Error", "Failed to sync workout history to Strava.");
    } finally {
      setIsStravaBusy(false);
      setSyncAllProgress(null);
    }
  };

  const handleSeedData = async () => {
    console.log("Seed Data button pressed");
    setSuccessMessage(null);

    try {
      setIsProcessing(true);
      console.log("Starting seed data process...");

      await resetStorage();
      console.log("Storage reset complete");

      seedExercises();
      console.log("Exercises seeded");

      seedTestWorkoutPlan();
      console.log("Test workout plan seeded");

      seedMockWorkoutHistory();
      console.log("Mock history seeded");

      loadDataStats();
      console.log("Stats reloaded");

      setSuccessMessage("✓ Sample data seeded successfully! Go to Home to see it.");
    } catch (error) {
      console.error("Failed to seed data:", error);
      Alert.alert("Error", `Failed to seed data: ${error}`);
    } finally {
      setIsProcessing(false);
      console.log("Seed data process finished");
    }
  };

  const handleClearData = async () => {
    console.log("Clear Data button pressed");
    setSuccessMessage(null);

    showAlert(
      "Clear All Data",
      "This will permanently delete all your workout plans, sessions, and history. Consider exporting a backup first. This action cannot be undone. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            try {
              setIsProcessing(true);
              console.log("Starting clear data process...");

              await resetStorage();
              console.log("Storage reset complete");

              seedExercises();
              console.log("Exercises re-seeded");

              loadDataStats();
              console.log("Stats reloaded");

              setSuccessMessage("✓ All workout data cleared!");
            } catch (error) {
              console.error("Failed to clear data:", error);
              Alert.alert("Error", `Failed to clear data: ${error}`);
            } finally {
              setIsProcessing(false);
              console.log("Clear data process finished");
            }
          },
        },
      ]
    );
  };

  const handleExportBackup = async () => {
    console.log("Export Backup button pressed");
    setSuccessMessage(null);

    try {
      setIsProcessing(true);
      console.log("Starting export process...");

      await exportBackup();
      console.log("Export complete");

      setSuccessMessage("✓ Backup exported successfully!");
    } catch (error) {
      console.error("Failed to export backup:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (!errorMessage.includes("cancelled") && !errorMessage.includes("canceled")) {
        Alert.alert("Error", `Failed to export backup: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
      console.log("Export process finished");
    }
  };

  const handleImportBackup = async () => {
    console.log("Import Backup button pressed");
    setSuccessMessage(null);

    showAlert(
      "Import Backup",
      "This will replace all your current workout data with the data from the backup file. This action cannot be undone. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Import",
          style: "destructive",
          onPress: async () => {
            try {
              setIsProcessing(true);
              console.log("Starting import process...");

              const backup = await importBackup();
              console.log("Import complete", backup);

              loadDataStats();
              console.log("Stats reloaded");

              const date = new Date(backup.exportedAt).toLocaleString();
              setSuccessMessage(`✓ Backup imported successfully! Data from ${date} has been restored.`);
            } catch (error) {
              console.error("Failed to import backup:", error);
              const errorMessage = error instanceof Error ? error.message : String(error);

              if (!errorMessage.includes("cancelled") && !errorMessage.includes("canceled")) {
                Alert.alert("Import Failed", errorMessage);
              }
            } finally {
              setIsProcessing(false);
              console.log("Import process finished");
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-background-dark w-full"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 32,
      }}
    >
      <View>
        <View className="mb-6">
          <Text className="text-3xl font-bold text-white mb-2">
            Settings
          </Text>
          <Text className="text-gray-400">
            Manage your data and developer tools
          </Text>
        </View>

        {successMessage && (
          <View className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4 flex-row items-start gap-3">
            <MaterialIcons name="check-circle" size={24} color="#22c55e" />
            <View className="flex-1">
              <Text className="text-green-500 font-bold">
                {successMessage}
              </Text>
            </View>
          </View>
        )}

        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-4">
            Backup & Restore
          </Text>

          <View className="bg-surface-dark rounded-2xl p-6 mb-4 border border-white/5">
            <View className="flex-row items-start gap-4 mb-4">
              <View className="bg-blue-500/10 p-3 rounded-xl">
                <MaterialIcons name="cloud-upload" size={28} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg mb-1">
                  Export Data
                </Text>
                <Text className="text-gray-400 text-sm leading-relaxed">
                  Download all your workout data as a JSON file. Save this file somewhere safe
                  to restore your data later if needed.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleExportBackup}
              disabled={isProcessing}
              className="bg-blue-500/20 border border-blue-500/30 rounded-xl py-3 px-6 active:scale-[0.98]"
              accessibilityRole="button"
              accessibilityLabel="Export workout data"
            >
              <View className="flex-row items-center justify-center gap-2">
                <MaterialIcons name="save-alt" size={20} color="#3b82f6" />
                <Text className="text-blue-400 font-bold">
                  {isProcessing ? "Exporting..." : "Export Data"}
                </Text>
              </View>
            </Pressable>
          </View>

          <View className="bg-surface-dark rounded-2xl p-6 border border-white/5">
            <View className="flex-row items-start gap-4 mb-4">
              <View className="bg-purple-500/10 p-3 rounded-xl">
                <MaterialIcons name="cloud-download" size={28} color="#a855f7" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg mb-1">
                  Import Data
                </Text>
                <Text className="text-gray-400 text-sm leading-relaxed">
                  Restore workout data from a previously exported backup file.
                  This will replace all your current data.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleImportBackup}
              disabled={isProcessing}
              className="bg-purple-500/20 border border-purple-500/30 rounded-xl py-3 px-6 active:scale-[0.98]"
              accessibilityRole="button"
              accessibilityLabel="Import workout data"
            >
              <View className="flex-row items-center justify-center gap-2">
                <MaterialIcons name="restore" size={20} color="#a855f7" />
                <Text className="text-purple-400 font-bold">
                  {isProcessing ? "Importing..." : "Import Data"}
                </Text>
              </View>
            </Pressable>
          </View>

          <View className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">
            <View className="flex-row items-start gap-3">
              <MaterialIcons name="info-outline" size={20} color="#3b82f6" />
              <View className="flex-1">
                <Text className="text-blue-400 text-sm leading-relaxed">
                  <Text className="font-bold">Tip:</Text> Use "Export Data" to create backups
                  before testing destructive operations. You can restore your data anytime
                  using "Import Data".
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-4">
            Strava Sync
          </Text>

          <View className="bg-surface-dark rounded-2xl p-6 border border-white/5">
            <View className="flex-row items-start gap-4 mb-4">
              <View className="bg-orange-500/10 p-3 rounded-xl">
                <MaterialIcons name="fitness-center" size={28} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg mb-1">
                  Sync Finished Workouts
                </Text>
                <Text className="text-gray-400 text-sm leading-relaxed">
                  Sends completed sessions to Strava as "WeightTraining" activities.
                  Duration is calculated as 4 minutes per completed set.
                </Text>
              </View>
            </View>

            <View className="bg-black/20 rounded-xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-300">Auto Sync</Text>
                <Pressable
                  onPress={handleToggleStravaSync}
                  disabled={isStravaBusy}
                  className={`px-3 py-1 rounded-full ${stravaEnabled ? "bg-primary/20" : "bg-white/10"}`}
                >
                  <Text className={stravaEnabled ? "text-primary font-bold" : "text-gray-300 font-bold"}>
                    {stravaEnabled ? "ON" : "OFF"}
                  </Text>
                </Pressable>
              </View>
              <Text className="text-xs text-gray-500">
                {stravaConnected ? "Connected to Strava" : "Not connected to Strava"}
              </Text>
              {stravaLastSyncAt && (
                <Text className="text-xs text-gray-500 mt-1">
                  Last sync: {new Date(stravaLastSyncAt).toLocaleString()}
                </Text>
              )}
              {stravaLastSyncError && (
                <Text className="text-xs text-red-400 mt-1">
                  Last sync error: {stravaLastSyncError}
                </Text>
              )}
              {syncAllProgress && syncAllProgress.total > 0 && (
                <Text className="text-xs text-blue-300 mt-1">
                  Syncing history: {syncAllProgress.processed}/{syncAllProgress.total} (success: {syncAllProgress.succeeded})
                </Text>
              )}
            </View>

            {!stravaConnected ? (
              <Pressable
                onPress={handleConnectStrava}
                disabled={isStravaBusy}
                className="bg-orange-500/20 border border-orange-500/30 rounded-xl py-3 px-6 active:scale-[0.98]"
                accessibilityRole="button"
                accessibilityLabel="Connect to Strava"
              >
                <View className="flex-row items-center justify-center gap-2">
                  <MaterialIcons name="link" size={20} color="#f97316" />
                  <Text className="text-orange-400 font-bold">
                    {isStravaBusy ? "Connecting..." : "Connect Strava"}
                  </Text>
                </View>
              </Pressable>
            ) : (
              <View className="gap-3">
                <Pressable
                  onPress={handleSyncAllHistory}
                  disabled={isStravaBusy}
                  className="bg-blue-500/20 border border-blue-500/30 rounded-xl py-3 px-6 active:scale-[0.98]"
                  accessibilityRole="button"
                  accessibilityLabel="Sync all history to Strava"
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <MaterialIcons name="history" size={20} color="#3b82f6" />
                    <Text className="text-blue-400 font-bold">
                      {isStravaBusy ? "Syncing..." : "Sync All History"}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={handleDisconnectStrava}
                  disabled={isStravaBusy}
                  className="bg-red-500/20 border border-red-500/30 rounded-xl py-3 px-6 active:scale-[0.98]"
                  accessibilityRole="button"
                  accessibilityLabel="Disconnect Strava"
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <MaterialIcons name="link-off" size={20} color="#ef4444" />
                    <Text className="text-red-400 font-bold">
                      {isStravaBusy ? "Disconnecting..." : "Disconnect Strava"}
                    </Text>
                  </View>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-4">
            Developer Tools
          </Text>

          <View className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4 mb-4 flex-row items-start gap-3">
            <MaterialIcons name="code" size={24} color="#9ca3af" />
            <View className="flex-1">
              <Text className="text-gray-400 font-bold mb-1">
                For Development & Testing
              </Text>
              <Text className="text-gray-500 text-sm">
                These features are for testing and development only. Use with caution.
              </Text>
            </View>
          </View>

          <View className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-blue-400 font-bold">Current Data Status</Text>
              <Pressable onPress={loadDataStats} className="p-1">
                <MaterialIcons name="refresh" size={20} color="#3b82f6" />
              </Pressable>
            </View>
            <View className="flex-row items-center gap-4">
              <View className="flex-1">
                <Text className="text-blue-300 text-sm">Workout Plans</Text>
                <Text className="text-white font-bold text-2xl">{planCount}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-blue-300 text-sm">Status</Text>
                <Text className="text-white font-bold text-lg">
                  {planCount === 0 ? "Empty ✓" : "Has Data"}
                </Text>
              </View>
            </View>
          </View>

          {planCount > 0 && (
            <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4 flex-row items-start gap-3">
              <MaterialIcons name="info" size={24} color="#eab308" />
              <View className="flex-1">
                <Text className="text-yellow-500 font-bold mb-1">
                  Old Data Detected
                </Text>
                <Text className="text-yellow-500/80 text-sm">
                  You have existing workout data from a previous app run. Use "Clear Data" below to test the empty state.
                </Text>
              </View>
            </View>
          )}

          <View className="bg-surface-dark rounded-2xl p-6 mb-4 border border-white/5">
            <View className="flex-row items-start gap-4 mb-4">
              <View className="bg-primary/10 p-3 rounded-xl">
                <MaterialIcons name="add-circle" size={28} color="#13ec6d" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg mb-1">
                  Seed Sample Data
                </Text>
                <Text className="text-gray-400 text-sm leading-relaxed">
                  Populates the app with pre-generated sample workouts, exercises, and history.
                  Useful for testing features with data.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleSeedData}
              disabled={isProcessing}
              className="bg-primary rounded-xl py-3 px-6 active:scale-[0.98]"
              accessibilityRole="button"
              accessibilityLabel="Seed sample data"
            >
              <View className="flex-row items-center justify-center gap-2">
                <MaterialIcons name="cloud-download" size={20} color="#102218" />
                <Text className="text-background-dark font-bold">
                  {isProcessing ? "Processing..." : "Seed Data"}
                </Text>
              </View>
            </Pressable>
          </View>

          <View className="bg-surface-dark rounded-2xl p-6 mb-4 border border-white/5">
            <View className="flex-row items-start gap-4 mb-4">
              <View className="bg-red-500/10 p-3 rounded-xl">
                <MaterialIcons name="delete-outline" size={28} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg mb-1">
                  Clear All Data
                </Text>
                <Text className="text-gray-400 text-sm leading-relaxed">
                  Removes all workout plans, sessions, and history from the app.
                  Useful for testing the empty state dashboard.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleClearData}
              disabled={isProcessing}
              className="bg-red-500/20 border border-red-500/30 rounded-xl py-3 px-6 active:scale-[0.98]"
              accessibilityRole="button"
              accessibilityLabel="Clear all data"
            >
              <View className="flex-row items-center justify-center gap-2">
                <MaterialIcons name="delete-forever" size={20} color="#ef4444" />
                <Text className="text-red-500 font-bold">
                  {isProcessing ? "Processing..." : "Clear Data"}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
