/**
 * Equipment Selection Screen
 * Step 2 of 5 in workout wizard
 */

import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { EquipmentCard } from "@/components/ui/EquipmentCard";
import { WizardContinueButton } from "@/components/ui/WizardContinueButton";
import { WizardLayout } from "@/components/WizardLayout";
import { useWizard } from "@/lib/wizard-context";
import { BarbellIcon } from "@/components/icons";
import type { Equipment } from "@/lib/storage/types";

// Equipment options based on mockup and database types
const EQUIPMENT_OPTIONS: Array<{
  value: Equipment;
  name: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap | React.ComponentType<{ size?: number; color?: string }>;
}> = [
  {
    value: "Barbell",
    name: "Barbell",
    description: "Standard bar",
    icon: BarbellIcon,
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
    <WizardLayout
      step={2}
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
        <Text className="text-3xl font-bold leading-tight tracking-tight text-white mb-2">
          What's in your gym?
        </Text>
        <Text className="text-gray-400 text-base font-normal leading-relaxed">
          Select all equipment you have access to right now. This helps us
          tailor your workout.
        </Text>
      </View>

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
    </WizardLayout>
  );
}
