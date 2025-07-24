import React from 'react';
import { View, StyleSheet } from 'react-native';

interface TimelineDotProps {
  hasActivity: boolean;
  triggerCount: number;
  resistedCount: number;
}

export function TimelineDot({ hasActivity, triggerCount, resistedCount }: TimelineDotProps) {
  if (!hasActivity) {
    return <View style={styles.emptyDot} />;
  }

  const resistanceRate = triggerCount > 0 ? resistedCount / triggerCount : 0;
  const dotColor = resistanceRate >= 0.7 ? '#10b981' : resistanceRate >= 0.4 ? '#f59e0b' : '#ef4444';
  const size = Math.min(16 + (triggerCount * 2), 24);

  return (
    <View style={[
      styles.activeDot,
      {
        backgroundColor: dotColor,
        width: size,
        height: size,
        borderRadius: size / 2,
      }
    ]}>
      {triggerCount > 1 && (
        <View style={[
          styles.innerDot,
          { backgroundColor: resistanceRate > 0.5 ? '#ffffff' : 'rgba(255,255,255,0.8)' }
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
    backgroundColor: '#e2e8f0',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  activeDot: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
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