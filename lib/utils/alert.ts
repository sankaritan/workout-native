/**
 * Cross-platform Alert utility
 * Wraps React Native's Alert.alert with web support
 */

import { Alert, Platform } from "react-native";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

/**
 * Show an alert dialog that works on both mobile and web
 * On mobile: uses native Alert.alert
 * On web: uses window.confirm for buttons, window.alert for single button
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void {
  if (Platform.OS === "web") {
    // Web implementation using browser APIs
    if (!buttons || buttons.length === 0) {
      // Single alert
      window.alert(`${title}${message ? `\n\n${message}` : ""}`);
    } else if (buttons.length === 1) {
      // Alert with OK button
      window.alert(`${title}${message ? `\n\n${message}` : ""}`);
      buttons[0].onPress?.();
    } else {
      // Confirm dialog (Cancel + Action)
      const confirmed = window.confirm(`${title}${message ? `\n\n${message}` : ""}`);
      if (confirmed) {
        // Find and call the non-cancel button
        const actionButton = buttons.find((btn) => btn.style !== "cancel");
        actionButton?.onPress?.();
      } else {
        // Call cancel button if it exists
        const cancelButton = buttons.find((btn) => btn.style === "cancel");
        cancelButton?.onPress?.();
      }
    }
  } else {
    // Native implementation
    Alert.alert(title, message, buttons);
  }
}
