import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface HomeIconProps {
  size?: number;
  color?: string;
}

export function HomeIcon({ size = 24, color }: HomeIconProps) {
  const { colors } = useTheme();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill={color || colors.primary}
    >
      <Path d="M117-76v-545l363-273 363 272.67V-76H572v-332H388v332H117Z" />
    </Svg>
  );
}