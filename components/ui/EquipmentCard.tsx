/**
 * EquipmentCard Component
 * Multi-select card for equipment selection in wizard
 * Different layout from SelectionCard (left-aligned, checkbox style)
 */

import React from "react";
import { Pressable, View, Text, type PressableProps } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "@/lib/utils/cn";
import { theme } from "@/constants/theme";

export interface EquipmentCardProps extends Omit<PressableProps, "children"> {
  /** Equipment name */
  name: string;
  /** Description text */
  description: string;
  /** Icon name from MaterialIcons or a custom React component */
  icon: keyof typeof MaterialIcons.glyphMap | React.ComponentType<{ size?: number; color?: string }>;
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
        // Border and background (dark theme)
        "border",
        selected
          ? [
              "border-primary bg-primary/10",
              "ring-1 ring-primary/20",
            ]
          : [
              "border-transparent bg-surface-dark",
            ],
        // Disabled state
        disabled && "opacity-50"
      )}
      {...props}
    >
      {/* Checkmark (top right) - only show when selected */}
      {selected && (
        <View className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary">
          <MaterialIcons name="check" size={16} color={theme.colors.surface.dark } />
        </View>
      )}

      {/* Icon */}
      <View
        className={cn(
          "rounded-full p-2.5 transition-colors",
          selected
            ? "bg-primary/20"
            : "bg-white/5"
        )}
      >
        {typeof icon === 'string' ? (
          <MaterialIcons
            name={icon}
            size={28}
            color={selected ? theme.colors.primary.DEFAULT : theme.colors.text.primary}
          />
        ) : (
          React.createElement(icon, {
            size: 28,
            color: selected ? theme.colors.primary.DEFAULT : theme.colors.text.primary,
          })
        )}
      </View>

      {/* Text content */}
      <View>
        <Text className="text-base font-bold text-white">
          {name}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          {description}
        </Text>
      </View>
    </Pressable>
  );
}
