/**
 * Test/Development Screen
 * Provides utilities for testing and development
 */

import { exportBackup } from "@/lib/backup/export";
import { importBackup } from "@/lib/backup/import";
import { seedExercises, seedMockWorkoutHistory, seedTestWorkoutPlan } from "@/lib/storage/seed-data";
import { getAllWorkoutPlans, resetStorage } from "@/lib/storage/storage";
import { showAlert } from "@/lib/utils/alert";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TestScreen() {
  const insets = useSafeAreaInsets();
  const [isProcessing, setIsProcessing] = useState(false);
  const [planCount, setPlanCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load current data stats
  const loadDataStats = () => {
    try {
      const plans = getAllWorkoutPlans();
      setPlanCount(plans.length);
    } catch (error) {
      console.error("Failed to load data stats:", error);
    }
  };

  useEffect(() => {
    loadDataStats();
  }, []);

  // Reload stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDataStats();
    }, [])
  );

  const handleSeedData = async () => {
    console.log("Seed Data button pressed");
    setSuccessMessage(null);
    
    try {
      setIsProcessing(true);
      console.log("Starting seed data process...");
      
      // First clear existing data
      await resetStorage();
      console.log("Storage reset complete");
      
      // Then seed with fresh data
      seedExercises();
      console.log("Exercises seeded");
      
      seedTestWorkoutPlan();
      console.log("Test workout plan seeded");
      
      seedMockWorkoutHistory();
      console.log("Mock history seeded");
      
      // Reload stats
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
    
    try {
      setIsProcessing(true);
      console.log("Starting clear data process...");
      
      await resetStorage();
      console.log("Storage reset complete");
      
      // Seed exercises back (we always need the exercise library)
      seedExercises();
      console.log("Exercises re-seeded");
      
      // Reload stats
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
      Alert.alert("Error", `Failed to export backup: ${error}`);
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
              
              // Reload stats
              loadDataStats();
              console.log("Stats reloaded");
              
              const date = new Date(backup.exportedAt).toLocaleString();
              setSuccessMessage(`✓ Backup imported successfully! Data from ${date} has been restored.`);
            } catch (error) {
              console.error("Failed to import backup:", error);
              const errorMessage = error instanceof Error ? error.message : String(error);
              Alert.alert("Import Failed", errorMessage);
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
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-white mb-2">
            Test & Development
          </Text>
          <Text className="text-gray-400">
            Tools for testing app features and states
          </Text>
        </View>

        {/* Success Message Banner */}
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

        {/* Current Data Status */}
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

        {/* Warning Banner - Show if data exists */}
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

        {/* Development Tools Banner */}
        <View className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4 mb-8 flex-row items-start gap-3">
          <MaterialIcons name="code" size={24} color="#9ca3af" />
          <View className="flex-1">
            <Text className="text-gray-400 font-bold mb-1">
              Development Tools
            </Text>
            <Text className="text-gray-500 text-sm">
              These features are for testing and development only. Use with caution.
            </Text>
          </View>
        </View>

        {/* Data Management Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-4">
            Data Management
          </Text>

          {/* Seed Data Card */}
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

          {/* Clear Data Card */}
          <View className="bg-surface-dark rounded-2xl p-6 border border-white/5">
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

        {/* Backup & Restore Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-4">
            Backup & Restore
          </Text>

          {/* Export Data Card */}
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

          {/* Import Data Card */}
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
        </View>

        {/* Info Section */}
        <View className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
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
    </ScrollView>
  );
}
