/**
 * History Screen
 * Shows workout history calendar (Story 11 - to be implemented)
 */

import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function HistoryScreen() {
  return (
    <View className="flex-1 bg-background-dark items-center justify-center px-6">
      <MaterialIcons name="calendar-today" size={80} color="#9db9a8" />
      <Text className="text-2xl font-bold text-white mt-6 mb-2">
        History Coming Soon
      </Text>
      <Text className="text-text-muted text-center">
        Your workout history and calendar view will be available in Story 11
      </Text>
    </View>
  );
}
