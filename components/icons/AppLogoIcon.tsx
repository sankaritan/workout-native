import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

interface AppLogoIconProps {
  size?: number;
  color?: string;
}

export function AppLogoIcon({ size = 28, color = "#13ec80" }: AppLogoIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Path
        d="M75 25 H45 A10 10 0 0 0 35 35 V45 A10 10 0 0 1 25 55 H15"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M25 75 H55 A10 10 0 0 0 65 65 V55 A10 10 0 0 1 75 45 H85"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={75} y={18} width={10} height={14} rx={2} fill={color} />
      <Rect x={15} y={68} width={10} height={14} rx={2} fill={color} />
    </Svg>
  );
}
