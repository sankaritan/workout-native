/**
 * BackButton Component
 * Reusable back button following the Session Tracking design pattern
 * Position: Top-left corner
 * Design: Arrow icon + "Back" text in muted color
 */

import React from "react";
import { Pressable, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface BackButtonProps {
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
}

export function BackButton({ 
  onPress, 
  testID = "back-button",
  accessibilityLabel = "Go back"
}: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="flex-row items-center gap-1 active:opacity-70"
    >
      <MaterialIcons name="arrow-back" size={24} color="#9db9a8" />
      <Text className="text-text-muted text-sm font-medium">Back</Text>
    </Pressable>
  );
}
