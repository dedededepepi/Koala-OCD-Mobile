import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface SettingsIconProps {
  size?: number;
  color?: string;
}

export const SettingsIcon = ({ size = 24, color }: SettingsIconProps) => {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 -960 960 960" fill={color || colors.primary}>
      <Path d="m332-34-19-141q-3-2-6.5-4t-6.5-4l-133 56L19-388l112-85q0-2 .5-4t.5-4q0-2-.5-3.5t-.5-3.5L19-573l148-258 133 54q4-1 7.5-3t6.5-4l18-143h296l18 143 8 4 8 4 131-55 148 258-114 85v8q0 2-.5 4t-.5 4l114 84-150 261-132-56q-3 1-6 3.5t-5 3.5L628-34H332Zm146-296q63 0 107-44t44-107q0-62-44-106.5T478-632q-63 0-107 44.5T327-481q0 63 44 107t107 44Z"/>
    </Svg>
  );
}