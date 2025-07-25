import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  Platform,
  Vibration,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon,
  Smartphone,
  Download, 
  Upload, 
  Trash2, 
  Info, 
  Heart,
  Wrench,
  Bell,
  Target,
  Check
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { storageService, UserSettings } from '@/services/storage';
import { useTheme, ThemeMode } from '@/hooks/useTheme';

export default function SettingsScreen() {
  const { colors, isDark, themeMode, setThemeMode, systemTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const userSettings = await storageService.getSettings();
    setSettings(userSettings);
    setNotifications(userSettings.notifications);
    setHaptics(userSettings.haptics);
  };

  const triggerHapticForToggle = () => {
    if (Platform.OS !== 'web' && haptics) {
      // Use selection feedback for toggles - feels more natural like iOS switches
      Haptics.selectionAsync();
    }
  };

  const testHapticForce = () => {
    console.log('Force testing haptic - ignoring settings');
    if (Platform.OS !== 'web') {
      console.log('Testing all haptic types for Expo Go compatibility...');
      
      // Test 1: Selection feedback (often works in Expo Go)
      Haptics.selectionAsync()
        .then(() => console.log('Selection haptic success'))
        .catch(err => console.log('Selection haptic error:', err));
      
      setTimeout(() => {
        // Test 2: Warning notification
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          .then(() => console.log('Warning haptic success'))
          .catch(err => console.log('Warning haptic error:', err));
      }, 300);
      
      setTimeout(() => {
        // Test 3: Error notification  
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
          .then(() => console.log('Error haptic success'))
          .catch(err => console.log('Error haptic error:', err));
      }, 600);
      
      setTimeout(() => {
        // Test 4: React Native Vibration API (works better in Expo Go)
        console.log('Testing React Native Vibration API...');
        try {
          Vibration.vibrate(200); // 200ms vibration
          console.log('RN Vibration success');
        } catch (err) {
          console.log('RN Vibration error:', err);
        }
      }, 900);
    } else {
      console.log('Cannot test haptic - running on web');
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (Platform.OS !== 'web' && haptics) {
      Haptics.selectionAsync(); // iOS-style settings feedback
    }
    
    await storageService.updateSettings({ [key]: value });
    await loadSettings();
  };

  const handleExportData = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const dataString = await storageService.exportData();
      
      if (Platform.OS !== 'web') {
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Removed for testing
        
        // Use Share API on mobile
        await Share.share({
          message: dataString,
          title: 'OCD Tracker Data Export',
        });
      } else {
        // Web download
        const blob = new Blob([dataString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocd-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      Alert.alert(
        'Export Successful',
        'Your data has been exported successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = () => {
    if (Platform.OS !== 'web' && haptics) { Haptics.selectionAsync(); }
    
    Alert.alert(
      'Import Data',
      'This feature allows you to import previously exported data. Please ensure the file is a valid OCD Tracker export.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            // In a real app, you would use document picker
            Alert.alert('Info', 'File picker would open here in a production app');
          }
        }
      ]
    );
  };

  const handleClearData = () => {
    if (Platform.OS !== 'web' && haptics) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }
    
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your tracking data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await storageService.clearAllData();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleOpenQueue = () => {
    if (Platform.OS !== 'web' && haptics) { Haptics.selectionAsync(); }
    
    Alert.alert(
      'Developer Tools',
      'Quirk Fixer Queue - Report UI bugs and annoyances with pre-filled prompts',
      [{ text: 'OK' }]
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <SettingsIcon size={28} color={colors.primary} />
          <Text style={styles.title}>Settings</Text>
        </View>
        <Text style={styles.subtitle}>
          Manage your data and app preferences
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Sun size={20} color={colors.warning} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Appearance</Text>
          </View>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Customize the app's visual appearance
          </Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowThemeModal(true)}
          >
            <View style={styles.settingLeft}>
              {themeMode === 'system' ? (
                <Smartphone size={20} color={colors.primary} />
              ) : themeMode === 'dark' ? (
                <Moon size={20} color={colors.primary} />
              ) : (
                <Sun size={20} color={colors.primary} />
              )}
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Theme</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {themeMode === 'system' ? `Auto (${systemTheme})` : 
                   themeMode === 'dark' ? 'Dark' : 'Light'}
                </Text>
              </View>
            </View>
            <Text style={[styles.settingValue, { color: colors.primary }]}>
              {themeMode === 'system' ? 'Auto' : themeMode === 'dark' ? 'Dark' : 'Light'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={colors.warning} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Notifications</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Receive reminders and encouragement
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={(value) => {
                setNotifications(value);
                updateSetting('notifications', value);
              }}
              trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
              thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Wrench size={20} color={colors.warning} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Haptic Feedback</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Feel subtle vibrations on button presses
                </Text>
              </View>
            </View>
            <Switch
              value={haptics}
              onValueChange={(value) => {
                // Test haptic feedback when toggling the haptic setting itself
                triggerHapticForToggle();
                setHaptics(value);
                updateSetting('haptics', value);
              }}
              trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
              thumbColor={haptics ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Target size={20} color={colors.warning} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Daily Target</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Current target: {settings?.dailyTarget || 15} compulsions
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.targetButton}
              onPress={() => {
                Alert.alert(
                  'Set Daily Target',
                  'Choose your daily compulsion target',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: '10', onPress: () => updateSetting('dailyTarget', 10) },
                    { text: '15', onPress: () => updateSetting('dailyTarget', 15) },
                    { text: '20', onPress: () => updateSetting('dailyTarget', 20) },
                  ]
                );
              }}
            >
              <Text style={styles.targetButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Download size={20} color="#4F46E5" />
            <Text style={styles.cardTitle}>Data Management</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Export, import, or clear your tracking data
          </Text>
          
          <View style={styles.dataActions}>
            <View style={styles.dataAction}>
              <View style={styles.dataActionLeft}>
                <Text style={styles.dataActionTitle}>Export Data</Text>
                <Text style={styles.dataActionDescription}>
                  Download your data as a JSON file
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#4F46E5' }]}
                onPress={handleExportData}
                disabled={loading}
              >
                <Download size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {loading ? 'Exporting...' : 'Export'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dataAction}>
              <View style={styles.dataActionLeft}>
                <Text style={styles.dataActionTitle}>Import Data</Text>
                <Text style={styles.dataActionDescription}>
                  Upload a previously exported JSON file
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                onPress={handleImportData}
                disabled={loading}
              >
                <Upload size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Import</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dataAction}>
              <View style={styles.dataActionLeft}>
                <Text style={styles.dataActionTitle}>Clear All Data</Text>
                <Text style={styles.dataActionDescription}>
                  Permanently delete all tracking data
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                onPress={handleClearData}
                disabled={loading}
              >
                <Trash2 size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {loading ? 'Clearing...' : 'Clear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* About OCD Tracker */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Info size={20} color="#4F46E5" />
            <Text style={styles.cardTitle}>About OCD Tracker</Text>
          </View>
          
          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>Privacy First</Text>
            <Text style={styles.aboutText}>
              All your data is stored locally on your device. Nothing is sent to external 
              servers, ensuring complete privacy and control over your personal information.
            </Text>
          </View>

          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>Evidence-Based Approach</Text>
            <Text style={styles.aboutText}>
              The therapeutic strategies provided are based on Cognitive Behavioral Therapy 
              (CBT) and Exposure and Response Prevention (ERP) techniques, proven 
              effective for OCD management.
            </Text>
          </View>

          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>Professional Support</Text>
            <Text style={styles.aboutText}>
              This app is a tool to support your journey, but it's not a replacement for 
              professional therapy. Consider working with a mental health professional for 
              comprehensive care.
            </Text>
          </View>
        </View>

        {/* You're Not Alone */}
        <View style={styles.supportCard}>
          <Heart size={24} color="#EC4899" />
          <Text style={styles.supportTitle}>You're Not Alone</Text>
          <Text style={styles.supportText}>
            Recovery is a journey, not a destination. Every step you take, every trigger you resist, 
            and every moment of self-compassion matters. You have the strength to overcome this. 💙
          </Text>
        </View>

        {/* Developer Tools */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Wrench size={20} color="#6B7280" />
            <Text style={styles.cardTitle}>Developer Tools</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Internal tools for development and debugging
          </Text>
          
          <View style={styles.developerSection}>
            <View style={styles.developerLeft}>
              <Text style={styles.developerTitle}>Test Haptic Feedback</Text>
              <Text style={styles.developerDescription}>
                Force test haptic vibration (ignores settings)
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.developerButton}
              onPress={testHapticForce}
            >
              <Wrench size={16} color="#FFFFFF" />
              <Text style={styles.developerButtonText}>Test Haptic</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.developerSection}>
            <View style={styles.developerLeft}>
              <Text style={styles.developerTitle}>Quirk Fixer Queue</Text>
              <Text style={styles.developerDescription}>
                Report UI bugs and annoyances with pre-filled prompts
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.developerButton}
              onPress={handleOpenQueue}
            >
              <Wrench size={16} color="#FFFFFF" />
              <Text style={styles.developerButtonText}>Open Queue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="fade"
        presentationStyle="overFullScreen"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.themeModal, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Theme</Text>
            
            {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.themeOption,
                  themeMode === mode && { backgroundColor: colors.primaryMuted }
                ]}
                onPress={() => {
                  setThemeMode(mode);
                  setShowThemeModal(false);
                }}
              >
                <View style={styles.themeOptionLeft}>
                  {mode === 'system' ? (
                    <Smartphone size={24} color={colors.primary} />
                  ) : mode === 'dark' ? (
                    <Moon size={24} color={colors.primary} />
                  ) : (
                    <Sun size={24} color={colors.primary} />
                  )}
                  <View style={styles.themeOptionContent}>
                    <Text style={[styles.themeOptionTitle, { color: colors.text }]}>
                      {mode === 'system' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light'}
                    </Text>
                    <Text style={[styles.themeOptionDescription, { color: colors.textSecondary }]}>
                      {mode === 'system' ? `Matches system (${systemTheme})` :
                       mode === 'dark' ? 'Dark theme with deep colors' :
                       'Light theme with bright colors'}
                    </Text>
                  </View>
                </View>
                {themeMode === mode && (
                  <Check size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: colors.buttonSecondary }]}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={[styles.modalCloseButtonText, { color: colors.buttonSecondaryText }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  contentContainer: {
    paddingBottom: 120, // Extra space above tab bar
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
  },
  targetButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  targetButtonText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  dataActions: {
    gap: 20,
  },
  dataAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dataActionLeft: {
    flex: 1,
  },
  dataActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  dataActionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  aboutSection: {
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  supportCard: {
    backgroundColor: '#FDF2F8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F9A8D4',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#BE185D',
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  supportText: {
    fontSize: 14,
    color: '#BE185D',
    textAlign: 'center',
    lineHeight: 20,
  },
  developerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  developerLeft: {
    flex: 1,
  },
  developerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  developerDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  developerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  developerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  themeModal: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  themeOptionContent: {
    flex: 1,
  },
  themeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'NotoSansJP-SemiBold',
    marginBottom: 2,
  },
  themeOptionDescription: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
  },
  modalCloseButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'NotoSansJP-SemiBold',
  },
});