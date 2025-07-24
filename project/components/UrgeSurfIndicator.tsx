import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useUrgeSurfSession } from '@/hooks/useUrgeSurfSession';

const { width: screenWidth } = Dimensions.get('window');

interface UrgeSurfIndicatorProps {
  onPress: () => void;
}

export function UrgeSurfIndicator({ onPress }: UrgeSurfIndicatorProps) {
  const { session } = useUrgeSurfSession();
  const [isMinimized, setIsMinimized] = useState(false);
  const [slideAnimation] = useState(new Animated.Value(0));
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

  const handleSwipeGesture = (event: any) => {
    const { nativeEvent } = event;
    
    if (nativeEvent.state === State.END) {
      // If user swiped down more than 30 pixels
      if (nativeEvent.translationY > 30) {
        setIsMinimized(true);
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
      // If user swiped up while minimized
      else if (nativeEvent.translationY < -30 && isMinimized) {
        setIsMinimized(false);
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <PanGestureHandler onHandlerStateChange={handleSwipeGesture}>
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{
              translateY: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 40], // Slide down to hide behind tab bar, leaving only progress line visible
              })
            }]
          }
        ]}
      >
        {/* Progress bar background - at top of indicator */}
        <View style={styles.progressBackground}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]}
          />
        </View>
        
        {/* Main indicator content */}
        <TouchableOpacity 
          style={styles.indicator} 
          onPress={onPress} 
          activeOpacity={0.8}
        >
          <Text style={styles.emoji}>🏄‍♂️</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Urge Surf</Text>
            <Text style={styles.time}>{formatTime(session.timeLeft)} remaining</Text>
          </View>
          <Text style={styles.swipeHint}>⬇</Text>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 64, // Just above the tab bar (tab bar height is 64)
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  progressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(56, 189, 248, 0.3)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1E40AF', // Darker blue
    borderRadius: 1.5,
  },
  indicator: {
    backgroundColor: '#38BDF8',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  emoji: {
    fontSize: 20,
    marginRight: 12,
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
  swipeHint: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.7,
    marginLeft: 8,
  },
});