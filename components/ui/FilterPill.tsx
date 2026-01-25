/**
 * FilterPill Component
 * Reusable filter chip for muscle group and exercise filtering
 */

import React from "react";
import { Pressable, Text } from "react-native";
import { cn } from "@/lib/utils/cn";

interface FilterPillProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function FilterPill({ label, selected, onToggle }: FilterPillProps) {
  return (
    <Pressable
      onPress={onToggle}
      className={cn(
        "px-4 py-2 rounded-full mr-2",
        selected
          ? "bg-primary"
          : "bg-surface-dark border border-gray-600"
      )}
    >
      <Text
        className={cn(
          "text-sm font-semibold",
          selected ? "text-background-dark" : "text-gray-400"
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
