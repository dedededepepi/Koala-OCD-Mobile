import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

interface DraggableUrgeSurfFABProps {
  active: boolean;
  timeLeft: number;
  onPress: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function DraggableUrgeSurfFAB({ active, timeLeft, onPress }: DraggableUrgeSurfFABProps) {
  const translateX = useRef(new Animated.Value(20)).current; // Start at bottom left
  const translateY = useRef(new Animated.Value(screenHeight - 200)).current;

  if (!active) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      // Snap to edges or keep current position
      const { translationX: finalX, translationY: finalY } = event.nativeEvent;
      
      // Constrain to screen bounds
      const boundedX = Math.max(0, Math.min(screenWidth - 120, finalX));
      const boundedY = Math.max(50, Math.min(screenHeight - 200, finalY));
      
      // Animate to final position
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: boundedX,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: boundedY,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={handleGestureEvent}
      onHandlerStateChange={handleHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateX },
              { translateY },
            ],
          },
        ]}
      >
        <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.emoji}>🏄‍♂️</Text>
          <Text style={styles.time}>{formatTime(timeLeft)}</Text>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  fab: {
    backgroundColor: '#38BDF8',
    borderRadius: 30,
    width: 100,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
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
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'NotoSansJP-SemiBold',
  },
});