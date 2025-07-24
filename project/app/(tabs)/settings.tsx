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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Download, 
  Upload, 
  Trash2, 
  Info, 
  Heart,
  Wrench,
  Bell,
  Target
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { storageService, UserSettings } from '@/services/storage';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const userSettings = await storageService.getSettings();
    setSettings(userSettings);
    setDarkMode(userSettings.darkMode);
    setNotifications(userSettings.notifications);
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
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
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
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
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
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
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Alert.alert(
      'Developer Tools',
      'Quirk Fixer Queue - Report UI bugs and annoyances with pre-filled prompts',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <SettingsIcon size={28} color="#4F46E5" />
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
            <Sun size={20} color="#F59E0B" />
            <Text style={styles.cardTitle}>Appearance</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Customize the app's visual appearance
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Sun size={20} color="#F59E0B" />
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  Switch between light and dark themes
                </Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(value) => {
                setDarkMode(value);
                updateSetting('darkMode', value);
              }}
              trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
              thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color="#F59E0B" />
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingDescription}>
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
              <Target size={20} color="#F59E0B" />
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Daily Target</Text>
                <Text style={styles.settingDescription}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#F3F4F6',
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
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
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
});