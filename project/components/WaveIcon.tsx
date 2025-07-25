import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface WaveIconProps {
  size?: number;
  color?: string;
}

export const WaveIcon = ({ size = 24, color }: WaveIconProps) => {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 -960 960 960" fill={color || colors.primary}>
      <Path d="M60-100v-120q46 0 80.5-15.5T214-281q33 27 68 43.5t65 16.5q29 0 65.5-16t68.5-46q37 32 70.5 47t63.5 15q29 0 60.5-14t73.5-45q43 33 77.5 46.5T900-220v120q-45 0-82.5-8.5T749-133q-33 18-66.5 25.5T615-100q-32 0-67-8t-67-25q-30 17-64.5 25t-69.5 8q-35 0-68.5-7.5T213-133q-32 16-71 24.5T60-100Zm0-198v-100q0-101 39-188.5T206-739q68-65 159-102.5T560-879q35 0 76 5.5t81 15.5q-27 41-42 80t-15 67q0 47 25.5 72t72.5 25h142v121H758q-97 0-157.5-60.5T540-711q0-7 .5-14t.5-15q-55 23-88 71.5T420-558q0 33 9 59t20 42q7-4 15.5-9.5T481-479q34 28 70.5 43.5T615-420q27 0 64-16t70-43q35 26 71 43t80 17v121q-45 0-82.5-9T749-332q-33 18-65.5 26t-68.5 8q-35 0-70.5-9.5T481-332q-31 17-65.5 25.5T347-298q-33 0-68.5-9T213-332q-32 16-71 25t-82 9Z"/>
    </Svg>
  );
};