/**
 * Custom Barbell Icon
 * A more representative icon showing a barbell with weight plates
 */

import React from "react";
import Svg, { Rect, Circle } from "react-native-svg";

interface BarbellIconProps {
  size?: number;
  color?: string;
}

export function BarbellIcon({ size = 24, color = "#13ec6d" }: BarbellIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Left weight plate */}
      <Rect x="2" y="8" width="3" height="8" rx="0.5" fill={color} />
      
      {/* Left collar */}
      <Rect x="5" y="9.5" width="1" height="5" rx="0.3" fill={color} />
      
      {/* Bar */}
      <Rect x="6" y="11" width="12" height="2" rx="0.5" fill={color} />
      
      {/* Right collar */}
      <Rect x="18" y="9.5" width="1" height="5" rx="0.3" fill={color} />
      
      {/* Right weight plate */}
      <Rect x="19" y="8" width="3" height="8" rx="0.5" fill={color} />
    </Svg>
  );
}
