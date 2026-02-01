import React from "react";
import { Pressable, Text, type PressableProps } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "@/lib/utils/cn";

export interface WizardContinueButtonProps extends Omit<PressableProps, "children"> {
  /** Button label text */
  label?: string;
  /** Icon to display */
  icon?: keyof typeof MaterialIcons.glyphMap;
}

/**
 * Reusable continue button for wizard screens.
 * Displays bright green when enabled, dimmed when disabled.
 * Uses flex-row to keep icon and text on same line.
 */
export function WizardContinueButton({
  label = "Continue",
  icon = "arrow-forward",
  disabled,
  className,
  testID = "continue-button",
  accessibilityLabel = "Continue to next step",
  ...props
}: WizardContinueButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
      className={cn(
        "w-full rounded-xl py-4 px-6 shadow-lg flex-row items-center justify-center gap-2",
        "transition-all",
        disabled
          ? "bg-surface-dark opacity-50"
          : "bg-primary active:scale-[0.98] active:bg-[#10d460]",
        className
      )}
      {...props}
    >
      <Text
        className={cn(
          "text-base font-bold",
          disabled ? "text-gray-400" : "text-background-dark"
        )}
      >
        {label}
      </Text>
      <MaterialIcons
        name={icon}
        size={20}
        color={disabled ? "#6b8779" : "#102218"}
      />
    </Pressable>
  );
}
