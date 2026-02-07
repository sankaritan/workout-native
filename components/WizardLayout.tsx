/**
 * WizardLayout
 * Shared layout for wizard steps
 */

import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "@/components/BackButton";

export interface WizardLayoutProps {
  step: number;
  totalSteps: number;
  title?: string;
  subtitle?: string;
  onBack: () => void;
  bottomAction?: React.ReactNode;
  children: React.ReactNode;
}

export function WizardLayout({
  step,
  totalSteps,
  title,
  subtitle,
  onBack,
  bottomAction,
  children,
}: WizardLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background-dark w-full">
      <View
        className="bg-background-dark/80 px-4 pb-2 w-full"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <BackButton onPress={onBack} />
          <Text className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Step {step} of {totalSteps}
          </Text>
          <View className="size-10" />
        </View>

        <View className="flex-row gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <View
              key={`progress-${idx + 1}`}
              testID={idx === totalSteps - 1 ? "progress-bar" : undefined}
              className={`flex-1 h-1.5 rounded-full ${idx < step ? "bg-primary" : "bg-white/10"}`}
            />
          ))}
        </View>

        {(title || subtitle) ? (
          <View className="mt-4">
            {title ? (
              <Text className="text-2xl font-bold text-white">
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text className="text-sm text-gray-400">
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: title || subtitle ? 16 : 24,
          paddingBottom: 120 + insets.bottom,
        }}
      >
        {children}
      </ScrollView>

      {bottomAction ? (
        <View
          className="absolute bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-lg border-t border-white/5 p-4 w-full"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          {bottomAction}
        </View>
      ) : null}
    </View>
  );
}
