/**
 * Shared test utilities for wizard screens
 */

import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WizardProvider } from "@/lib/wizard-context";

/**
 * Mock expo-router for wizard screen tests
 * Call this in your test file before importing components
 */
export function mockExpoRouter() {
  jest.mock("expo-router", () => ({
    router: {
      push: jest.fn(),
      back: jest.fn(),
    },
    useRouter: () => ({
      push: jest.fn(),
      back: jest.fn(),
    }),
    Stack: {
      Screen: () => null,
    },
  }));
}

/**
 * Mock MaterialIcons from @expo/vector-icons
 * Call this in your test file before importing components
 */
export function mockMaterialIcons() {
  jest.mock("@expo/vector-icons", () => ({
    MaterialIcons: "MaterialIcons",
  }));
}

/**
 * Safe area initial metrics for testing
 * Simulates iPhone 12 Pro dimensions
 */
export const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/**
 * Custom render function that wraps components with common providers
 * for wizard screen tests (SafeAreaProvider + WizardProvider)
 */
interface WizardRenderOptions extends Omit<RenderOptions, "wrapper"> {
  /**
   * Custom initial metrics for SafeAreaProvider
   * Defaults to iPhone 12 Pro dimensions
   */
  safeAreaMetrics?: typeof initialMetrics;
}

export function renderWithWizard(
  ui: ReactElement,
  options?: WizardRenderOptions
) {
  const { safeAreaMetrics = initialMetrics, ...renderOptions } = options || {};

  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <WizardProvider>{ui}</WizardProvider>
    </SafeAreaProvider>,
    renderOptions
  );
}

/**
 * Setup common mocks for wizard screen tests
 * Call this at the beginning of your test file
 */
export function setupWizardMocks() {
  mockExpoRouter();
  mockMaterialIcons();
}
