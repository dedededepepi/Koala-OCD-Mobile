import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Appearance, ColorSchemeName, Animated } from 'react-native';
import { storageService } from '@/services/storage';
import { ThemeColors, ThemeContextType, ThemeContext, ThemeMode, lightTheme, darkTheme } from '@/hooks/useTheme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const transitionValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadThemePreference();
    
    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });

    // Get initial system theme
    const initialColorScheme = Appearance.getColorScheme();
    setSystemTheme(initialColorScheme === 'dark' ? 'dark' : 'light');

    return () => subscription?.remove();
  }, []);

  const loadThemePreference = async () => {
    const settings = await storageService.getSettings();
    setThemeModeState(settings.themeMode);
  };

  const setThemeMode = async (mode: ThemeMode) => {
    // Animate theme transition
    Animated.timing(transitionValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setThemeModeState(mode);
      Animated.timing(transitionValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
    
    await storageService.updateSettings({ 
      themeMode: mode,
      darkMode: mode === 'dark' || (mode === 'system' && systemTheme === 'dark')
    });
  };

  const toggleTheme = async () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    await setThemeMode(newMode);
  };

  // Determine if dark mode should be active
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemTheme === 'dark');
  const colors = isDark ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    colors,
    isDark,
    themeMode,
    setThemeMode,
    toggleTheme,
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
};