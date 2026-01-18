/**
 * Wizard state management context
 * Manages workout plan generation wizard flow
 */

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Equipment } from "./storage/types";
import type { WorkoutProgram } from "./workout-generator/types";

// Wizard state interface
export interface WizardState {
  frequency?: number; // 2-5 days per week
  equipment?: Equipment[]; // Array of equipment types
  focus?: "Balanced" | "Strength" | "Endurance"; // Training focus
  duration?: 4 | 6 | 8 | 12; // Duration in weeks
  generatedProgram?: WorkoutProgram; // Generated workout program
}

// Context value interface
interface WizardContextValue {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  resetState: () => void;
}

// Create context
const WizardContext = createContext<WizardContextValue | undefined>(undefined);

// Initial state
const initialState: WizardState = {
  frequency: undefined,
  equipment: undefined,
  focus: undefined,
  duration: undefined,
};

// Provider props
interface WizardProviderProps {
  children: ReactNode;
}

/**
 * Wizard Provider Component
 * Wraps wizard screens to provide shared state
 */
export function WizardProvider({ children }: WizardProviderProps) {
  const [state, setState] = useState<WizardState>(initialState);

  /**
   * Update wizard state (merge with existing)
   */
  const updateState = (updates: Partial<WizardState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  /**
   * Reset wizard state to initial values
   */
  const resetState = () => {
    setState(initialState);
  };

  const value: WizardContextValue = {
    state,
    updateState,
    resetState,
  };

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

/**
 * Hook to access wizard context
 * @throws Error if used outside WizardProvider
 */
export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
