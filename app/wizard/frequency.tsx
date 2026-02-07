/**
 * Workout Frequency Selection Screen
 * Step 1 of 5 in workout wizard
 */

import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { WizardContinueButton } from "@/components/ui/WizardContinueButton";
import { WizardLayout } from "@/components/WizardLayout";
import { useWizard } from "@/lib/wizard-context";

// Frequency options based on mockup
const FREQUENCY_OPTIONS = [
  { value: 2, label: "Casual", icon: "calendar-view-week" as const },
  { value: 3, label: "Regular", icon: "bolt" as const },
  { value: 4, label: "Dedicated", icon: "fitness-center" as const },
  { value: 5, label: "Serious", icon: "local-fire-department" as const },
];

export default function FrequencyScreen() {
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
    <WizardLayout
      step={1}
      totalSteps={5}
      onBack={handleBack}
      bottomAction={(
        <WizardContinueButton
          onPress={handleContinue}
          disabled={isContinueDisabled}
        />
      )}
    >
      <View className="mb-8">
        <Text className="text-3xl font-bold leading-tight tracking-tight mb-2 text-white">
          How often do you want to workout?
        </Text>
        <Text className="text-base text-gray-400 font-normal leading-relaxed">
          Choose a weekly goal that fits your schedule.
        </Text>
      </View>

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
    </WizardLayout>
  );
}
