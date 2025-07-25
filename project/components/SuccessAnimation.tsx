import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { CircleCheck as CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface SuccessAnimationProps {
  visible: boolean;
  onComplete?: () => void;
}

export function SuccessAnimation({ visible, onComplete }: SuccessAnimationProps) {
  const { colors } = useTheme();
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onComplete?.();
      });
    }
  }, [visible, scaleValue, opacityValue, onComplete]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animation,
          {
            backgroundColor: colors.cardBackground,
            shadowColor: colors.shadow,
            transform: [{ scale: scaleValue }],
            opacity: opacityValue,
          },
        ]}
      >
        <CheckCircle size={60} color={colors.success} />
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
  animation: {
    borderRadius: 50,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});