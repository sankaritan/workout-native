/**
 * SelectionCard Component
 * Reusable card component for wizard selections
 * Based on frequency selection mockup design
 */

import React from "react";
import { Pressable, View, Text, type PressableProps } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "@/lib/utils/cn";

export interface SelectionCardProps extends Omit<PressableProps, "children"> {
  /** Label text (e.g., "Regular", "Casual") */
  label: string;
  /** Main value to display (e.g., "3", "2") */
  value: string;
  /** Subtitle text (e.g., "Days / Week") */
  subtitle: string;
  /** Icon name from MaterialIcons */
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Whether the card is selected */
  selected: boolean;
  /** Callback when card is pressed */
  onPress: () => void;
  /** Optional testID for testing */
  testID?: string;
  /** Whether the card is disabled */
  disabled?: boolean;
}

/**
 * SelectionCard Component
 * Displays a selectable card with icon, label, value, and subtitle
 */
export function SelectionCard({
  label,
  value,
  subtitle,
  icon,
  selected,
  onPress,
  testID,
  disabled = false,
  ...props
}: SelectionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${label} ${value} ${subtitle}`}
      testID={testID}
      className={cn(
        // Base styles
        "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-6 min-h-[176px]",
        "transition-all duration-200",
        // Border and background
        "border-slate-200 dark:border-surface-dark",
        "bg-white dark:bg-surface-dark",
        // Hover state
        "active:opacity-80",
        // Selected state
        selected && [
          "border-primary",
          "bg-primary/5 dark:bg-primary/10",
          "shadow-[0_0_20px_rgba(19,236,109,0.15)]",
        ],
        // Disabled state
        disabled && "opacity-50"
      )}
      {...props}
    >
      {/* Check icon (top right) */}
      {selected && (
        <View className="absolute top-3 right-3">
          <MaterialIcons name="check-circle" size={24} color="#13ec6d" />
        </View>
      )}

      {/* Icon */}
      {icon && (
        <View
          className={cn(
            "rounded-full p-3 mb-1 transition-colors",
            "bg-slate-100 dark:bg-surface-dark-highlight",
            selected && "bg-primary/20"
          )}
        >
          <MaterialIcons
            name={icon}
            size={28}
            color={selected ? "#13ec6d" : "#94a3b8"}
            className={cn(
              "text-slate-400 dark:text-gray-400",
              selected && "text-primary"
            )}
          />
        </View>
      )}

      {/* Text content */}
      <View className="items-center">
        {/* Label */}
        <Text
          className={cn(
            "text-sm font-semibold mb-1 transition-colors",
            "text-slate-500 dark:text-slate-400",
            selected && "text-primary"
          )}
        >
          {label}
        </Text>

        {/* Value */}
        <Text
          className={cn(
            "text-4xl font-bold mb-1 transition-colors",
            "text-slate-900 dark:text-white",
            selected && "text-primary"
          )}
        >
          {value}
        </Text>

        {/* Subtitle */}
        <Text className="text-xs font-medium text-slate-400 dark:text-gray-500 uppercase tracking-wide">
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}
