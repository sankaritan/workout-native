/**
 * SetTracker Styles
 * 
 * Extracted to avoid NativeWind/Reanimated timing issues on iOS.
 * Uses theme constants to maintain design system consistency.
 * 
 * See: https://github.com/nativewind/nativewind/issues/...
 * When dynamic className changes trigger Reanimated's useAnimatedStyle,
 * it can cause navigation context errors on iOS during state updates.
 */

import { StyleSheet } from "react-native";
import { theme } from "@/constants/theme";

// Helper to create rgba colors with opacity
const rgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const setTrackerStyles = StyleSheet.create({
  // Set Row States
  setRowDefault: {
    backgroundColor: rgba(theme.colors.surface.dark, 0.2),
  },
  setRowCompleted: {
    backgroundColor: rgba(theme.colors.surface.dark, 0.4),
    opacity: 0.6,
  },
  setRowActive: {
    backgroundColor: theme.colors.surface.dark,
    borderColor: rgba(theme.colors.primary.DEFAULT, 0.4),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  setRowFuture: {
    backgroundColor: rgba(theme.colors.surface.dark, 0.2),
  },

  // Button States (weight adjustment)
  button: {
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonActive: {
    backgroundColor: theme.colors.surface.dark,
    borderColor: theme.colors.border.light,
  },
  buttonInactive: {
    backgroundColor: rgba(theme.colors.surface.dark, 0.6),
    borderColor: theme.colors.border.DEFAULT,
  },

  // Input States
  input: {
    height: 40,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
  },
  inputCompleted: {
    backgroundColor: '#111814',
    borderColor: theme.colors.border.DEFAULT,
    color: rgba(theme.colors.text.primary, 0.5),
  },
  inputActive: {
    height: 48,
    backgroundColor: '#111814',
    borderColor: theme.colors.border.light,
    fontWeight: 'bold' as const,
    fontSize: 18,
  },
  inputFuture: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border.DEFAULT,
    color: rgba(theme.colors.text.primary, 0.7),
  },

  // Checkbox States
  checkboxActive: {
    borderColor: theme.colors.border.light,
  },
  checkboxInactive: {
    borderColor: theme.colors.border.DEFAULT,
  },
  checkboxDisabled: {
    opacity: 0.3,
  },

  // Add Button
  addButton: {
    borderColor: theme.colors.border.light,
    borderWidth: 1,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.colors.text.secondary,
  },
});
