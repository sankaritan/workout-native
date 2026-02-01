/**
 * Equipment Selection Screen
 * Step 2 of 5 in workout wizard
 */

import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EquipmentCard } from "@/components/ui/EquipmentCard";
import { BackButton } from "@/components/BackButton";
import { WizardContinueButton } from "@/components/ui/WizardContinueButton";
import { useWizard } from "@/lib/wizard-context";
import type { Equipment } from "@/lib/storage/types";

// Equipment options based on mockup and database types
const EQUIPMENT_OPTIONS: Array<{
  value: Equipment;
  name: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}> = [
  {
    value: "Barbell",
    name: "Barbell",
    description: "Standard bar",
    icon: "horizontal-rule",
  },
  {
    value: "Dumbbell",
    name: "Dumbbell",
    description: "Pairs or single",
    icon: "fitness-center",
  },
  {
    value: "Bodyweight",
    name: "Bodyweight",
    description: "No equipment",
    icon: "accessibility",
  },
  {
    value: "Cables",
    name: "Cables",
    description: "Cable machine",
    icon: "linear-scale",
  },
  {
    value: "Machines",
    name: "Machines",
    description: "Weight machines",
    icon: "settings",
  },
  {
    value: "Bands",
    name: "Bands",
    description: "Elastic resistance",
    icon: "waves",
  },
];

export default function EquipmentScreen() {
  const insets = useSafeAreaInsets();
  const { state, updateState } = useWizard();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>(
    state.equipment || []
  );

  /**
   * Handle equipment selection (toggle)
   */
  const handleToggle = (equipment: Equipment) => {
    const newSelection = selectedEquipment.includes(equipment)
      ? selectedEquipment.filter((e) => e !== equipment)
      : [...selectedEquipment, equipment];

    setSelectedEquipment(newSelection);
    updateState({ equipment: newSelection });
  };

  /**
   * Handle continue button press
   */
  const handleContinue = () => {
    if (selectedEquipment.length > 0) {
      router.push("/wizard/focus");
    }
  };

  /**
   * Handle back button press
   */
  const handleBack = () => {
    router.back();
  };

  const isContinueDisabled = selectedEquipment.length === 0;

  return (
    <View className="flex-1 bg-background-dark w-full">
      {/* Header */}
      <View className="bg-background-dark/80 px-4 pb-2 w-full" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center justify-between mb-4">
          {/* Back button */}
          <BackButton onPress={handleBack} />

          {/* Step indicator */}
          <Text className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Step 2 of 5
          </Text>

          {/* Empty space for balance */}
          <View className="size-10" />
        </View>

        {/* Progress Bar - 2 of 5 filled */}
        <View className="flex-row gap-2">
          <View className="flex-1 h-1.5 rounded-full bg-primary" />
          <View className="flex-1 h-1.5 rounded-full bg-primary" />
          <View className="flex-1 h-1.5 rounded-full bg-white/10" />
          <View className="flex-1 h-1.5 rounded-full bg-white/10" />
          <View
            testID="progress-bar"
            className="flex-1 h-1.5 rounded-full bg-white/10"
          />
        </View>
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
          <Text className="text-3xl font-bold leading-tight tracking-tight text-white mb-2">
            What's in your gym?
          </Text>
          <Text className="text-gray-400 text-base font-normal leading-relaxed">
            Select all equipment you have access to right now. This helps us
            tailor your workout.
          </Text>
        </View>

        {/* Equipment Options Grid */}
        <View className="flex-row flex-wrap gap-3 pb-4">
          {EQUIPMENT_OPTIONS.map((option) => (
            <View key={option.value} style={{ width: "48%" }}>
              <EquipmentCard
                name={option.name}
                description={option.description}
                icon={option.icon}
                selected={selectedEquipment.includes(option.value)}
                onPress={() => handleToggle(option.value)}
                testID={`equipment-${option.value.toLowerCase()}`}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button (Fixed at bottom) */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-lg border-t border-white/5 p-4 w-full"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <WizardContinueButton
          onPress={handleContinue}
          disabled={isContinueDisabled}
        />
      </View>
    </View>
  );
}
