/**
 * EquipmentCard Component
 * Multi-select card for equipment selection in wizard
 * Different layout from SelectionCard (left-aligned, checkbox style)
 */

import React from "react";
import { Pressable, View, Text, type PressableProps } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "@/lib/utils/cn";

export interface EquipmentCardProps extends Omit<PressableProps, "children"> {
  /** Equipment name */
  name: string;
  /** Description text */
  description: string;
  /** Icon name from MaterialIcons */
  icon: keyof typeof MaterialIcons.glyphMap;
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
 * EquipmentCard Component
 * Multi-select card with checkbox-style selection
 */
export function EquipmentCard({
  name,
  description,
  icon,
  selected,
  onPress,
  testID,
  disabled = false,
  ...props
}: EquipmentCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${name}, ${description}`}
      testID={testID}
      className={cn(
        // Base styles
        "relative flex flex-col items-start gap-3 rounded-xl p-4 text-left transition-all",
        "shadow-sm",
        // Hover/Active states
        "active:scale-[0.98]",
        // Border and background
        "border",
        selected
          ? [
              "border-primary bg-primary/5 dark:bg-primary/10",
              "ring-1 ring-primary/20",
            ]
          : [
              "border-transparent bg-white dark:bg-surface-dark",
            ],
        // Disabled state
        disabled && "opacity-50"
      )}
      {...props}
    >
      {/* Checkmark (top right) - only show when selected */}
      {selected && (
        <View className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary">
          <MaterialIcons name="check" size={16} color="#000000" />
        </View>
      )}

      {/* Icon */}
      <View
        className={cn(
          "rounded-full p-2.5 transition-colors",
          selected
            ? "bg-primary/20"
            : "bg-slate-100 dark:bg-white/5"
        )}
      >
        <MaterialIcons
          name={icon}
          size={28}
          color={selected ? "#13ec6d" : undefined}
          className={cn(
            selected
              ? "text-primary-dark dark:text-primary"
              : "text-slate-900 dark:text-white"
          )}
        />
      </View>

      {/* Text content */}
      <View>
        <Text className="text-base font-bold text-slate-900 dark:text-white">
          {name}
        </Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {description}
        </Text>
      </View>
    </Pressable>
  );
}
