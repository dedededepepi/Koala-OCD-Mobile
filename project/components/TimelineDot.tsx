import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface TimelineDotProps {
  hasActivity: boolean;
  triggerCount: number;
  resistedCount: number;
}

export function TimelineDot({ hasActivity, triggerCount, resistedCount }: TimelineDotProps) {
  const { colors, isDark } = useTheme();
  if (!hasActivity) {
    return <View style={[styles.emptyDot, { backgroundColor: colors.infoMuted, borderColor: colors.cardBackground }]} />;
  }

  const resistanceRate = triggerCount > 0 ? resistedCount / triggerCount : 0;
  const dotColor = resistanceRate >= 0.7 ? colors.success : resistanceRate >= 0.4 ? colors.warning : colors.error;
  const size = Math.min(16 + (triggerCount * 2), 24);

  return (
    <View style={[
      styles.activeDot,
      {
        backgroundColor: dotColor,
        width: size,
        height: size,
        borderRadius: size / 2,
        borderColor: colors.cardBackground,
      }
    ]}>
      {triggerCount > 1 && (
        <View style={[
          styles.innerDot,
          { backgroundColor: resistanceRate > 0.5 ? colors.background : colors.overlay }
        ]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  activeDot: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  innerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});