import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface KoalaCelebrationProps {
  visible: boolean;
  onComplete?: () => void;
}

export function KoalaCelebration({ visible, onComplete }: KoalaCelebrationProps) {
  const { colors } = useTheme();
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;
  const bounceValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset values
      scaleValue.setValue(0);
      opacityValue.setValue(0);
      bounceValue.setValue(0);

      // Animation sequence
      Animated.sequence([
        // Fade in and scale up
        Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Bounce effect
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Scale back to normal
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Hold for a moment
        Animated.delay(1500),
        // Fade out
        Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onComplete?.();
      });
    }
  }, [visible, scaleValue, opacityValue, bounceValue, onComplete]);

  if (!visible) return null;

  const bounceTransform = bounceValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.overlay }] }>
      <Animated.View
        style={[
          styles.koalaContainer,
          {
            backgroundColor: colors.cardBackground,
            shadowColor: colors.shadow,
            transform: [
              { scale: scaleValue },
              { translateY: bounceTransform }
            ],
            opacity: opacityValue,
          },
        ]}
      >
        <Text style={styles.koala}>🐨</Text>
        <View style={styles.messageContainer}>
          <Text style={[styles.celebrationText, { color: colors.success }]}>Great job!</Text>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>You resisted! 🎉</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  koalaContainer: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
  },
  koala: {
    fontSize: 60,
    marginBottom: 16,
  },
  messageContainer: {
    alignItems: 'center',
  },
  celebrationText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subText: {
    fontSize: 16,
  },
});