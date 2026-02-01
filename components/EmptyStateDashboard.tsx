/**
 * Empty State Dashboard
 * Shown when user has no workout plans yet
 * Based on design asset from design-assets/stitch_workout_frequency_selection/app_dashboard/code.html
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";

export default function EmptyStateDashboard() {
  const insets = useSafeAreaInsets();

  const handleGeneratePlan = () => {
    router.push("/wizard/frequency");
  };

  return (
    <View
      className="flex-1 bg-background-dark items-center justify-center px-6 w-full"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Decorative Icon/Illustration */}
      <View className="relative w-64 h-64 mb-6 flex items-center justify-center">
        {/* Pulsing glow background */}
        <View className="absolute inset-0 bg-primary/20 rounded-full" style={{ 
          shadowColor: '#13ec6d',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 50,
        }} />
        
        {/* SVG Illustration */}
        <View className="relative z-10">
          <Svg width={200} height={200} viewBox="0 0 200 200">
            {/* Outer circle background */}
            <Path
              d="M100 0C155.228 0 200 44.7715 200 100C200 155.228 155.228 200 100 200C44.7715 200 0 155.228 0 100C0 44.7715 44.7715 0 100 0Z"
              fill="#13ec6d"
              fillOpacity={0.05}
            />
            
            {/* Dashed circle */}
            <Path
              d="M100 20C144.183 20 180 55.8172 180 100C180 144.183 144.183 180 100 180C55.8172 180 20 144.183 20 100C20 55.8172 55.8172 20 100 20Z"
              stroke="#13ec6d"
              strokeWidth={2}
              strokeDasharray="8 8"
              strokeOpacity={0.3}
              fill="none"
            />
            
            {/* Center circle */}
            <Circle
              cx={100}
              cy={100}
              r={40}
              fill="#13ec6d"
              fillOpacity={0.1}
            />
            
            {/* Plus sign in center */}
            <Path
              d="M100 60V140M60 100H140"
              stroke="#13ec6d"
              strokeWidth={4}
              strokeLinecap="round"
            />
            
            {/* Decorative dots */}
            <Circle cx={160} cy={60} r={8} fill="#13ec6d" fillOpacity={0.6} />
            <Circle cx={40} cy={140} r={6} fill="#13ec6d" fillOpacity={0.4} />
            <Circle cx={150} cy={150} r={4} fill="#13ec6d" fillOpacity={0.8} />
            <Circle cx={50} cy={50} r={5} fill="#13ec6d" fillOpacity={0.5} />
          </Svg>
        </View>
      </View>

      {/* Content */}
      <View className="w-full max-w-sm mx-auto">
        {/* Heading */}
        <View className="mb-6">
          <View className="flex items-center mb-2">
            <MaterialIcons name="science" size={40} color="#13ec6d" />
          </View>
          <Text className="text-2xl font-bold tracking-tight text-white text-center">
            Design workouts based on science
          </Text>
        </View>

        {/* Info Card */}
        <View className="bg-[#15201b] border border-surface-dark-highlight rounded-2xl p-6 mb-8 shadow-lg relative overflow-hidden">
          {/* Decorative glow effect */}
          <View 
            className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full"
            style={{
              shadowColor: '#13ec6d',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 30,
            }}
          />
          
          <View className="relative z-10 gap-5">
            {/* Step 1 */}
            <View className="flex-row gap-4 items-start">
              <View className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Text className="text-sm font-bold text-primary">1</Text>
              </View>
              <Text className="text-base text-gray-300 flex-1 pt-0.5">
                Share your workout needs
              </Text>
            </View>

            {/* Step 2 */}
            <View className="flex-row gap-4 items-start">
              <View className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Text className="text-sm font-bold text-primary">2</Text>
              </View>
              <Text className="text-base text-gray-300 flex-1 pt-0.5 leading-snug">
                We do the math - make sure your workout is balanced, optimize recovery and works for your schedule
              </Text>
            </View>

            {/* Step 3 */}
            <View className="flex-row gap-4 items-start">
              <View className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Text className="text-sm font-bold text-primary">3</Text>
              </View>
              <Text className="text-base text-gray-300 flex-1 pt-0.5">
                Start your new workout, uniquely designed just for you!
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <Pressable
          onPress={handleGeneratePlan}
          className="w-full rounded-xl bg-primary py-4 px-6 active:scale-[0.98] transition-all"
          style={{
            shadowColor: '#13ec6d',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 8,
          }}
          accessibilityRole="button"
          accessibilityLabel="Generate your first workout plan"
          testID="generate-plan-button"
        >
          <View className="flex-row items-center justify-center gap-3">
            <MaterialIcons name="add-circle" size={24} color="#102218" />
            <Text className="text-background-dark text-lg font-bold">
              Generate Your First Plan
            </Text>
          </View>
        </Pressable>

        {/* Subtext */}
        <Text className="mt-4 text-xs text-gray-500 text-center">
          Takes about 2 minutes to set up
        </Text>
      </View>
    </View>
  );
}
