/**
 * Workout Design Info Component
 * Explains the intelligence behind workout generation
 */

import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";

export function WorkoutDesignInfo() {
  return (
    <View className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4">
      {/* Header with Icon */}
      <View className="flex-row items-center mb-3">
        <View className="bg-primary/20 rounded-full size-8 items-center justify-center mr-2">
          <MaterialIcons name="lightbulb" size={18} color={theme.colors.primary.DEFAULT} />
        </View>
        <Text className="text-lg font-bold text-white">
          Designed With Intention
        </Text>
      </View>

      {/* Feature List */}
      <View className="gap-2">
        {/* Feature 1 */}
        <View className="flex-row items-start">
          <View className="bg-primary rounded-full size-5 items-center justify-center mr-2 mt-0">
            <MaterialIcons name="check" size={14} color="#102218" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm">Optimal split for maximum recovery</Text>
          </View>
        </View>

        {/* Feature 2 */}
        <View className="flex-row items-start">
          <View className="bg-primary rounded-full size-5 items-center justify-center mr-2 mt-0">
            <MaterialIcons name="check" size={14} color="#102218" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm">Prioritizes multi-muscle movements</Text>
          </View>
        </View>

        {/* Feature 3 */}
        <View className="flex-row items-start">
          <View className="bg-primary rounded-full size-5 items-center justify-center mr-2 mt-0">
            <MaterialIcons name="check" size={14} color="#102218" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm">Heavy lifts strategically spaced</Text>
          </View>
        </View>

        <View className="flex-row items-start">
          <View className="bg-primary rounded-full size-5 items-center justify-center mr-2 mt-0">
            <MaterialIcons name="check" size={14} color="#102218" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm">All major muscle groups covered</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
