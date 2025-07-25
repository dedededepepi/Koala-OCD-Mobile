import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface StatsIconProps {
  size?: number;
  color?: string;
}

export const StatsIcon = ({ size = 24, color }: StatsIconProps) => {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 -960 960 960" fill={color || colors.primary}>
      <Path d="M36-73v-136h888v136H36Zm38-204v-289h176v289H74Zm211 0v-489h176v489H285Zm212 0v-369h176v369H497Zm213 0v-609h176v609H710Z"/>
    </Svg>
  );
}