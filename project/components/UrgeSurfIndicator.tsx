import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useUrgeSurfSession } from '@/hooks/useUrgeSurfSession';

interface UrgeSurfIndicatorProps {
  onPress: () => void;
}

export function UrgeSurfIndicator({ onPress }: UrgeSurfIndicatorProps) {
  const { session } = useUrgeSurfSession();

  if (!session.active) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.indicator}>
        <Text style={styles.emoji}>🏄‍♂️</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Urge Surf</Text>
          <Text style={styles.time}>{formatTime(session.timeLeft)} remaining</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  indicator: {
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'NotoSansJP-SemiBold',
  },
  time: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
    fontFamily: 'NotoSansJP-Regular',
  },
});