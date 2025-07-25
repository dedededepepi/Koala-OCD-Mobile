import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '@/hooks/useTheme';

interface DraggableUrgeSurfFABProps {
  active: boolean;
  timeLeft: number;
  onPress: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function DraggableUrgeSurfFAB({ active, timeLeft, onPress }: DraggableUrgeSurfFABProps) {
  const { colors } = useTheme();
  if (!active) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simplified version - just show a fixed FAB first to test
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.info, shadowColor: colors.shadow }]} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.emoji}>🏄‍♂️</Text>
        <Text style={[styles.time, { color: colors.buttonPrimaryText }]}>{formatTime(timeLeft)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    zIndex: 1000,
  },
  fab: {
    borderRadius: 30,
    width: 100,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  emoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  time: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'NotoSansJP-SemiBold',
  },
});