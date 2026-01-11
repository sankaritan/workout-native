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
        // Border and background (dark theme)
        "border-surface-dark",
        "bg-surface-dark",
        // Selected state
        selected && [
          "border-primary",
          "bg-primary/10",
        ],
      )}
      style={{
        opacity: disabled ? 0.5 : 1,
        ...(selected && {
          shadowColor: "#13ec6d",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 8,
        }),
      }}
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
            "bg-surface-dark-highlight",
            selected && "bg-primary/20"
          )}
        >
          <MaterialIcons
            name={icon}
            size={28}
            color={selected ? "#13ec6d" : "#6b8779"}
          />
        </View>
      )}

      {/* Text content */}
      <View className="items-center">
        {/* Label */}
        <Text
          className={cn(
            "text-sm font-semibold mb-1 transition-colors",
            "text-gray-400",
            selected && "text-primary"
          )}
        >
          {label}
        </Text>

        {/* Value */}
        <Text
          className={cn(
            "text-4xl font-bold mb-1 transition-colors",
            "text-white",
            selected && "text-primary"
          )}
        >
          {value}
        </Text>

        {/* Subtitle */}
        <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}
