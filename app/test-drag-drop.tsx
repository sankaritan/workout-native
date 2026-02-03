/**
 * Test Screen for Drag-and-Drop Library Verification
 * 
 * Tests platform-specific drag-and-drop implementations:
 * - Web: @dnd-kit/sortable
 * - iOS/Android: react-native-draggable-flatlist
 * 
 * Test instructions:
 * 1. Navigate to this screen on each platform
 * 2. Try dragging the exercises using the drag handle (≡ icon)
 * 3. Verify smooth animations and correct reordering
 * 4. Check console for any errors
 * 
 * Once verified on all platforms, this file can be deleted.
 */

import React, { useState } from "react";
import { View, Text, Pressable, Platform, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { SortableList } from "@/components/SortableList";

interface TestExercise {
  id: string;
  name: string;
  sets: string;
  muscle: string;
}

const INITIAL_EXERCISES: TestExercise[] = [
  { id: "1", name: "Bench Press", sets: "3×8-12", muscle: "Chest" },
  { id: "2", name: "Barbell Row", sets: "3×8-12", muscle: "Back" },
  { id: "3", name: "Overhead Press", sets: "3×8-10", muscle: "Shoulders" },
  { id: "4", name: "Pull-ups", sets: "3×6-10", muscle: "Back" },
  { id: "5", name: "Squats", sets: "4×8-12", muscle: "Legs" },
];

export default function TestDragDropScreen() {
  const insets = useSafeAreaInsets();
  const [exercises, setExercises] = useState(INITIAL_EXERCISES);

  const handleReorder = (newData: TestExercise[]) => {
    console.log("Reordered exercises:", newData.map(e => e.name));
    setExercises(newData);
  };

  const renderExercise = (item: TestExercise, index: number, drag?: () => void, isActive?: boolean) => {
    return (
      <View 
        className={`flex-row items-center bg-surface-dark rounded-xl p-4 border mb-3 ${
          isActive ? 'border-primary' : 'border-white/10'
        }`}
        style={{ opacity: isActive ? 0.8 : 1 }}
      >
        {/* Drag Handle - press and hold to drag */}
        <TouchableOpacity 
          style={styles.dragHandle}
          onLongPress={drag}
          delayLongPress={100}
          activeOpacity={0.7}
        >
          <MaterialIcons name="drag-indicator" size={24} color="#6b8779" />
        </TouchableOpacity>

        {/* Exercise Info */}
        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold text-base">
            {item.name}
          </Text>
          <Text className="text-gray-400 text-sm">{item.muscle}</Text>
        </View>

        {/* Sets Badge */}
        <View className="bg-primary/10 rounded-lg px-3 py-1.5">
          <Text className="text-primary font-bold text-sm">{item.sets}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container} className="flex-1 bg-background-dark">
        {/* Header */}
        <View
          className="bg-background-dark px-4 pb-4 border-b border-white/10"
          style={{ paddingTop: insets.top + 16 }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Pressable onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
            </Pressable>
            <Text className="text-xl font-bold text-white flex-1 ml-2">
              Drag & Drop Test
            </Text>
          </View>

          <View className="bg-surface-dark rounded-xl p-4 border border-white/10">
            <Text className="text-white font-semibold mb-2">
              Platform: {Platform.OS}{" "}
              {Platform.OS === "web" ? "(Web)" : "(Native)"}
            </Text>
            <Text className="text-gray-400 text-sm">
              Press and hold the ≡ icon briefly to drag exercises. Check console for logs.
            </Text>
          </View>
        </View>

        {/* Sortable List */}
        <View className="flex-1 px-4 pt-4">
          <SortableList
            data={exercises}
            renderItem={renderExercise}
            onReorder={handleReorder}
            keyExtractor={(item) => item.id}
            style={styles.sortableList}
          />
        </View>

        {/* Test Status */}
        <View
          className="bg-background-dark/95 border-t border-white/5 p-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="bg-surface-dark rounded-xl p-4 border border-white/10">
            <Text className="text-white font-semibold mb-2">
              ✓ Test Checklist:
            </Text>
            <Text className="text-gray-400 text-sm mb-1">
              • Can you drag exercises using the ≡ icon?
            </Text>
            <Text className="text-gray-400 text-sm mb-1">
              • Do they smoothly animate when dragging?
            </Text>
            <Text className="text-gray-400 text-sm mb-1">
              • Does reordering work correctly?
            </Text>
            <Text className="text-gray-400 text-sm">
              • Check console for "Reordered exercises" logs
            </Text>
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sortableList: {
    flex: 1,
  },
  dragHandle: {
    padding: 4,
  },
});
