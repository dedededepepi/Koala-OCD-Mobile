import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Alert } from 'react-native';
import { BookOpen, Calendar, ChartBar as BarChart3, Settings } from 'lucide-react-native';
import { HomeIcon } from '@/components/HomeIcon';
import { JournalIcon } from '@/components/JournalIcon';
import { UrgeSurfContext, UrgeSurfSession } from '@/hooks/useUrgeSurfSession';
import { UrgeSurfIndicator } from '@/components/UrgeSurfIndicator';

export default function TabLayout() {
  const [urgeSurfSession, setUrgeSurfSession] = useState<UrgeSurfSession>({
    active: false,
    timeLeft: 300,
    startTime: null,
  });

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
    // TODO: Navigate back to coping toolbox with urge surf open
    console.log('Navigate to Urge Surf session');
  };

  return (
    <UrgeSurfContext.Provider value={{ 
      session: urgeSurfSession, 
      startSession, 
      stopSession, 
      updateTimeLeft 
    }}>
      <UrgeSurfIndicator onPress={handleIndicatorPress} />
      {/* Tabs component */}
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        tabBarActiveTintColor: '#14B8A6',
        tabBarInactiveTintColor: '#64748b',
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
            <HomeIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <JournalIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </UrgeSurfContext.Provider>
  );
}