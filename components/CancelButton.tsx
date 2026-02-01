/**
 * CancelButton Component
 * Reusable cancel button following the Session Tracking Finish button pattern
 * Design: Similar to Finish button but grey instead of green
 * Position: Typically top-right corner or in action areas
 */

import React from "react";
import { Pressable, Text } from "react-native";

interface CancelButtonProps {
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
  label?: string;
}

export function CancelButton({ 
  onPress, 
  testID = "cancel-button",
  accessibilityLabel = "Cancel",
  label = "Cancel"
}: CancelButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="bg-white/5 active:bg-white/10 px-4 py-2 rounded-lg"
    >
      <Text className="text-text-muted text-sm font-bold">{label}</Text>
    </Pressable>
  );
}
