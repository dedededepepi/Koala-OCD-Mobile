import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface JournalIconProps {
  size?: number;
  color?: string;
}

export function JournalIcon({ size = 24, color }: JournalIconProps) {
  const { colors } = useTheme();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill={color || colors.primary}
    >
      <Path d="M316-99q-57 0-96.5-39.5T180-235v-141h135v-83q-30-8-58.5-22.5T206-521v-37h-39L23-704q46-48 102-71.5T239-799q19 0 37 2.5t39 7.5v-73h571v599q0 68-48.5 116T722-99H316Zm135-277h243v113q0 12 7.5 20t20.5 8q12 0 20-8t8-20v-463H451v18l211 212v74h-74l-94-94 1-1q-10 11-21 19t-23 13v109ZM211-663h100v91q8 4 19 7t21 3q20 0 37-7t28-19l2-2-46-47q-28-28-61.5-42.5T239-694q-14 0-26.5 1.5T187-688l24 25Z" />
    </Svg>
  );
}