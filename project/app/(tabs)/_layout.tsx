import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, router } from 'expo-router';
import { Alert } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { HomeIcon } from '@/components/HomeIcon';
import { JournalIcon } from '@/components/JournalIcon';
import { TimelineIcon } from '@/components/TimelineIcon';
import { StatsIcon } from '@/components/StatsIcon';
import { SettingsIcon } from '@/components/SettingsIcon';
import { UrgeSurfContext, UrgeSurfSession } from '@/hooks/useUrgeSurfSession';
import { UrgeSurfIndicator } from '@/components/UrgeSurfIndicator';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { colors } = useTheme();
  const [urgeSurfSession, setUrgeSurfSession] = useState<UrgeSurfSession>({
    active: false,
    timeLeft: 300,
    startTime: null,
  });
  const [navigationCallback, setNavigationCallback] = useState<(() => void) | null>(null);

  const startSession = () => {
    setUrgeSurfSession({
      active: true,
      timeLeft: 300,
      startTime: Date.now(),
    });
  };

  const stopSession = () => {
    setUrgeSurfSession({
      active: false,
      timeLeft: 300,
      startTime: null,
    });
  };

  const updateTimeLeft = (time: number) => {
    setUrgeSurfSession(prev => ({
      ...prev,
      timeLeft: time,
    }));
  };

  const registerOpenCallback = useCallback((callback: () => void) => {
    setNavigationCallback(() => callback);
  }, []);

  const openUrgeSurfToolbox = useCallback(() => {
    // Navigate to index tab and trigger coping toolbox
    router.navigate('/(tabs)');
    setTimeout(() => {
      if (navigationCallback) {
        navigationCallback();
      }
    }, 100); // Small delay to ensure navigation completes
  }, [navigationCallback]);

  // Timer effect
  useEffect(() => {
    if (!urgeSurfSession.active) return;

    const interval = setInterval(() => {
      setUrgeSurfSession(prev => {
        if (prev.timeLeft <= 1) {
          // Session completed - show celebration
          setTimeout(() => {
            Alert.alert('Great job!', 'You successfully rode the wave for 5 minutes! 🌊');
          }, 100);
          return {
            active: false,
            timeLeft: 300,
            startTime: null,
          };
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [urgeSurfSession.active]);

  const handleIndicatorPress = () => {
    openUrgeSurfToolbox();
  };

  return (
    <UrgeSurfContext.Provider value={{ 
      session: urgeSurfSession, 
      startSession, 
      stopSession, 
      updateTimeLeft,
      openUrgeSurfToolbox,
      registerOpenCallback
    }}>
      <>
        <UrgeSurfIndicator onPress={handleIndicatorPress} />
        <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
          paddingTop: 24,
          paddingBottom: 24,
          height: 96,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <HomeIcon size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <JournalIcon size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <TimelineIcon size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <StatsIcon size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <SettingsIcon size={28} color={color} />
          ),
        }}
      />
        </Tabs>
      </>
    </UrgeSurfContext.Provider>
  );
}