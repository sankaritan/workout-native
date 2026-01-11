/**
 * Workout Frequency Selection Screen
 * Step 1 of 4 in workout wizard
 */

import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { useWizard } from "@/lib/wizard-context";
import { cn } from "@/lib/utils/cn";

// Frequency options based on mockup
const FREQUENCY_OPTIONS = [
  { value: 2, label: "Casual", icon: "calendar-view-week" as const },
  { value: 3, label: "Regular", icon: "bolt" as const },
  { value: 4, label: "Dedicated", icon: "fitness-center" as const },
  { value: 5, label: "Serious", icon: "local-fire-department" as const },
];

export default function FrequencyScreen() {
  const insets = useSafeAreaInsets();
  const { state, updateState } = useWizard();
  const [selectedFrequency, setSelectedFrequency] = useState<number | undefined>(
    state.frequency
  );

  /**
   * Handle frequency selection
   */
  const handleSelect = (frequency: number) => {
    setSelectedFrequency(frequency);
    updateState({ frequency });
  };

  /**
   * Handle continue button press
   */
  const handleContinue = () => {
    if (selectedFrequency) {
      router.push("/wizard/equipment");
    }
  };

  /**
   * Handle back button press
   */
  const handleBack = () => {
    router.back();
  };

  const isContinueDisabled = !selectedFrequency;

  return (
    <View className="flex-1 bg-background-dark w-full">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pb-4 bg-background-dark/95 w-full"
        style={{ paddingTop: insets.top + 16 }}
      >
        {/* Back button */}
        <Pressable
          onPress={handleBack}
          className="flex items-center justify-center size-10 rounded-full active:bg-white/10"
          testID="back-button"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialIcons
            name="arrow-back-ios-new"
            size={24}
            color="#ffffff"
          />
        </Pressable>

        {/* Step indicator */}
        <View className="flex-1 items-center">
          <Text className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Step 1 of 4
          </Text>
        </View>

        {/* Empty space for balance */}
        <View className="size-10" />
      </View>

      {/* Progress Bar */}
      <View className="flex-row items-center justify-center gap-2 px-6 pb-2">
        <View
          testID="progress-step-1"
          className="h-1.5 flex-1 rounded-full bg-primary shadow-[0_0_10px_rgba(19,236,109,0.5)]"
        />
        <View
          testID="progress-step-2"
          className="h-1.5 flex-1 rounded-full bg-surface-dark"
        />
        <View
          testID="progress-step-3"
          className="h-1.5 flex-1 rounded-full bg-surface-dark"
        />
        <View
          testID="progress-step-4"
          className="h-1.5 flex-1 rounded-full bg-surface-dark"
        />
      </View>

      {/* Main Content */}
      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 120 + insets.bottom,
        }}
      >
        {/* Title and Subtitle */}
        <View className="mb-8">
          <Text className="text-3xl font-bold leading-tight tracking-tight mb-2 text-white">
            How often do you want to workout?
          </Text>
          <Text className="text-base text-gray-400 font-normal leading-relaxed">
            Choose a weekly goal that fits your schedule.
          </Text>
        </View>

        {/* Frequency Options Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {FREQUENCY_OPTIONS.map((option) => (
            <View key={option.value} style={{ width: "48%" }}>
              <SelectionCard
                label={option.label}
                value={option.value.toString()}
                subtitle="Days / Week"
                icon={option.icon}
                selected={selectedFrequency === option.value}
                onPress={() => handleSelect(option.value)}
                testID={`frequency-${option.value}`}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button (Fixed at bottom) */}
      <View
        className="absolute bottom-0 left-0 right-0 px-4 bg-background-dark/95 pt-12 w-full"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <Pressable
          onPress={handleContinue}
          disabled={isContinueDisabled}
          accessibilityRole="button"
          accessibilityLabel="Continue to next step"
          accessibilityState={{ disabled: isContinueDisabled }}
          testID="continue-button"
          className={cn(
            "w-full rounded-xl py-4 px-6 text-lg font-bold shadow-lg flex-row items-center justify-center gap-2",
            "transition-all",
            isContinueDisabled
              ? "bg-surface-dark opacity-50"
              : "bg-primary active:scale-[0.98] active:bg-[#10d460]"
          )}
        >
          <Text
            className={cn(
              "text-lg font-bold",
              isContinueDisabled
                ? "text-gray-400"
                : "text-background-dark"
            )}
          >
            Continue
          </Text>
          <MaterialIcons
            name="arrow-forward"
            size={20}
            color={isContinueDisabled ? "#6b8779" : "#102218"}
          />
        </Pressable>
      </View>
    </View>
  );
}
