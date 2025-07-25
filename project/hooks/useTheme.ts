import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryMuted: string;
  
  // Status colors
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  error: string;
  errorMuted: string;
  info: string;
  infoMuted: string;
  
  // UI elements
  border: string;
  borderMuted: string;
  shadow: string;
  separator: string;
  overlay: string;
  
  // Interactive elements
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  buttonMuted: string;
  buttonMutedText: string;
  
  // Cards and surfaces
  cardBackground: string;
  cardBorder: string;
  
  // Form elements
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  placeholderText: string;
  
  // Tab bar
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  
  // Special
  accent: string;
  accentMuted: string;
  purple: string;
  purpleMuted: string;
  pink: string;
  pinkMuted: string;
}

export const lightTheme: ThemeColors = {
  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  surfaceElevated: '#FFFFFF',
  
  // Text
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Primary colors
  primary: '#4F46E5',
  primaryLight: '#6366F1',
  primaryDark: '#3730A3',
  primaryMuted: '#EEF2FF',
  
  // Status colors
  success: '#10B981',
  successMuted: '#ECFDF5',
  warning: '#F59E0B',
  warningMuted: '#FFFBEB',
  error: '#EF4444',
  errorMuted: '#FEF2F2',
  info: '#3B82F6',
  infoMuted: '#EFF6FF',
  
  // UI elements
  border: '#E5E7EB',
  borderMuted: '#F3F4F6',
  shadow: '#000000',
  separator: '#F1F5F9',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Interactive elements
  buttonPrimary: '#4F46E5',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#F3F4F6',
  buttonSecondaryText: '#374151',
  buttonMuted: '#F9FAFB',
  buttonMutedText: '#6B7280',
  
  // Cards and surfaces
  cardBackground: '#FFFFFF',
  cardBorder: '#F3F4F6',
  
  // Form elements
  inputBackground: '#FFFFFF',
  inputBorder: '#D1D5DB',
  inputText: '#1F2937',
  placeholderText: '#9CA3AF',
  
  // Tab bar
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#F1F5F9',
  tabBarActive: '#4F46E5',
  tabBarInactive: '#64748B',
  
  // Special
  accent: '#EC4899',
  accentMuted: '#FDF2F8',
  purple: '#8B5CF6',
  purpleMuted: '#F3E8FF',
  pink: '#EC4899',
  pinkMuted: '#FDF2F8',
};

export const darkTheme: ThemeColors = {
  // Backgrounds
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  surfaceElevated: '#475569',
  
  // Text
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textInverse: '#0F172A',
  
  // Primary colors
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4338CA',
  primaryMuted: '#1E1B4B',
  
  // Status colors
  success: '#22C55E',
  successMuted: '#052E16',
  warning: '#EAB308',
  warningMuted: '#451A03',
  error: '#EF4444',
  errorMuted: '#450A0A',
  info: '#60A5FA',
  infoMuted: '#0C1E3F',
  
  // UI elements
  border: '#475569',
  borderMuted: '#334155',
  shadow: '#000000',
  separator: '#334155',
  overlay: 'rgba(0, 0, 0, 0.8)',
  
  // Interactive elements
  buttonPrimary: '#6366F1',
  buttonPrimaryText: '#F8FAFC',
  buttonSecondary: '#334155',
  buttonSecondaryText: '#CBD5E1',
  buttonMuted: '#475569',
  buttonMutedText: '#94A3B8',
  
  // Cards and surfaces
  cardBackground: '#1E293B',
  cardBorder: '#334155',
  
  // Form elements
  inputBackground: '#334155',
  inputBorder: '#475569',
  inputText: '#F8FAFC',
  placeholderText: '#94A3B8',
  
  // Tab bar
  tabBarBackground: '#1E293B',
  tabBarBorder: '#334155',
  tabBarActive: '#6366F1',
  tabBarInactive: '#94A3B8',
  
  // Special
  accent: '#F472B6',
  accentMuted: '#4C1D95',
  purple: '#A78BFA',
  purpleMuted: '#1E1B4B',
  pink: '#F472B6',
  pinkMuted: '#4C1D95',
};

export interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  systemTheme: 'light' | 'dark';
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};