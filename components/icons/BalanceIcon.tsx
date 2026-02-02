/**
 * Custom Balance Icon
 * Yin-yang style icon representing balance and harmony
 */

import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

interface BalanceIconProps {
  size?: number;
  color?: string;
}

export function BalanceIcon({ size = 24, color = "#13ec6d" }: BalanceIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer circle */}
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
      
      {/* Yin-yang dividing curve - S-shaped path */}
      <Path
        d="M 12 2 A 5 5 0 0 1 12 12 A 5 5 0 0 0 12 22"
        fill={color}
        fillOpacity="0.3"
      />
      
      {/* Small dot in upper half (opposite color area) */}
      <Circle cx="12" cy="7" r="1.5" fill={color} />
      
      {/* Small dot in lower half (in filled area) */}
      <Circle cx="12" cy="17" r="1.5" fill="none" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}
