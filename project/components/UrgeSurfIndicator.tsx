import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useUrgeSurfSession } from '@/hooks/useUrgeSurfSession';
import { useTheme } from '@/hooks/useTheme';

interface UrgeSurfIndicatorProps {
  onPress: () => void;
}

export function UrgeSurfIndicator({ onPress }: UrgeSurfIndicatorProps) {
  const { session } = useUrgeSurfSession();
  const { colors } = useTheme();
  const [progressAnimation] = useState(new Animated.Value(0));

  // Update progress animation based on time remaining
  useEffect(() => {
    if (session.active) {
      const progress = (300 - session.timeLeft) / 300; // 0 to 1
      Animated.timing(progressAnimation, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [session.timeLeft, session.active, progressAnimation]);

  if (!session.active) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Main indicator content */}
      <TouchableOpacity 
        style={[styles.indicator, { backgroundColor: colors.info, shadowColor: colors.shadow }]} 
        onPress={onPress} 
        activeOpacity={0.8}
      >
        <Text style={styles.emoji}>🏄‍♂️</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.buttonPrimaryText }]}>Urge Surf</Text>
          <Text style={[styles.time, { color: colors.buttonPrimaryText }]}>{formatTime(session.timeLeft)} remaining</Text>
        </View>
      </TouchableOpacity>
      
      {/* Progress bar at bottom */}
      <View style={[styles.progressBackground, { backgroundColor: colors.infoMuted }] }>
        <Animated.View 
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.primary,
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 96, // Just above the tab bar (now 96px tall)
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  indicator: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 6, // Much thinner - reduced from 12 to 6
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  emoji: {
    fontSize: 16, // Slightly smaller
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12, // Smaller text
    fontWeight: '600',
    fontFamily: 'NotoSansJP-SemiBold',
  },
  time: {
    fontSize: 10, // Smaller text
    opacity: 0.9,
    fontFamily: 'NotoSansJP-Regular',
  },
  progressBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
});