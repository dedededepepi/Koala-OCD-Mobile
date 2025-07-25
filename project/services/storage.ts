import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Trigger {
  id: string;
  timestamp: string;
  isResisted: boolean;
  compulsionType?: string;
  notes?: string;
  mood?: number; // 1-5 scale
  intensity?: number; // 1-10 scale
}

export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  dailyTarget: number;
  reminderTime?: string;
  themeMode?: 'light' | 'dark' | 'system';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  target?: number;
}

const STORAGE_KEY = 'ocd_tracker_triggers';
const SETTINGS_KEY = 'ocd_tracker_settings';
const ACHIEVEMENTS_KEY = 'ocd_tracker_achievements';

class StorageService {
  async getAllTriggers(): Promise<Trigger[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading triggers:', error);
      return [];
    }
  }

  async addTrigger(trigger: Trigger): Promise<void> {
    try {
      const triggers = await this.getAllTriggers();
      triggers.push(trigger);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(triggers));
    } catch (error) {
      console.error('Error saving trigger:', error);
    }
  }

  async getTriggersByDate(date: string): Promise<Trigger[]> {
    try {
      const triggers = await this.getAllTriggers();
      return triggers.filter(trigger => {
        const triggerDate = new Date(trigger.timestamp).toISOString().split('T')[0];
        return triggerDate === date;
      });
    } catch (error) {
      console.error('Error filtering triggers by date:', error);
      return [];
    }
  }

  async updateTrigger(id: string, updates: Partial<Trigger>): Promise<void> {
    try {
      const triggers = await this.getAllTriggers();
      const index = triggers.findIndex(t => t.id === id);
      if (index !== -1) {
        triggers[index] = { ...triggers[index], ...updates };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(triggers));
      }
    } catch (error) {
      console.error('Error updating trigger:', error);
    }
  }

  async deleteTrigger(id: string): Promise<void> {
    try {
      const triggers = await this.getAllTriggers();
      const filteredTriggers = triggers.filter(t => t.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTriggers));
    } catch (error) {
      console.error('Error deleting trigger:', error);
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  async getSettings(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      const parsed = data ? JSON.parse(data) : {
        darkMode: false,
        notifications: true,
        dailyTarget: 15,
        themeMode: 'system',
      };
      if (!parsed.themeMode) parsed.themeMode = 'system';
      return parsed;
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        darkMode: false,
        notifications: true,
        dailyTarget: 15,
        themeMode: 'system',
      };
    }
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }

  async getAchievements(): Promise<Achievement[]> {
    try {
      const data = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      return data ? JSON.parse(data) : this.getDefaultAchievements();
    } catch (error) {
      console.error('Error loading achievements:', error);
      return this.getDefaultAchievements();
    }
  }

  async updateAchievement(id: string, updates: Partial<Achievement>): Promise<void> {
    try {
      const achievements = await this.getAchievements();
      const index = achievements.findIndex(a => a.id === id);
      if (index !== -1) {
        achievements[index] = { ...achievements[index], ...updates };
        await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
      }
    } catch (error) {
      console.error('Error updating achievement:', error);
    }
  }

  private getDefaultAchievements(): Achievement[] {
    return [
      {
        id: 'first_resistance',
        title: 'First Resistance',
        description: 'Resisted your first trigger',
        icon: '🌱',
        earned: false,
        progress: 0,
        target: 1,
      },
      {
        id: 'perfect_day',
        title: 'Perfect Day',
        description: '100% resistance rate for a day',
        icon: '⭐',
        earned: false,
        progress: 0,
        target: 1,
      },
      {
        id: 'week_warrior',
        title: 'Week Warrior',
        description: '75%+ resistance rate for a week',
        icon: '💪',
        earned: false,
        progress: 0,
        target: 1,
      },
      {
        id: 'consistency_champion',
        title: 'Consistency Champion',
        description: '3+ day resistance streak',
        icon: '🏆',
        earned: false,
        progress: 0,
        target: 3,
      },
      {
        id: 'milestone_10',
        title: '10 Resistances',
        description: 'Resisted 10 compulsions total',
        icon: '🎯',
        earned: false,
        progress: 0,
        target: 10,
      },
      {
        id: 'milestone_50',
        title: '50 Resistances',
        description: 'Resisted 50 compulsions total',
        icon: '🚀',
        earned: false,
        progress: 0,
        target: 50,
      },
    ];
  }

  async checkAndUpdateAchievements(): Promise<Achievement[]> {
    try {
      const triggers = await this.getAllTriggers();
      const achievements = await this.getAchievements();
      const totalResisted = triggers.filter(t => t.isResisted).length;
      
      // Check First Resistance
      if (!achievements[0].earned && totalResisted > 0) {
        achievements[0].earned = true;
        achievements[0].earnedDate = new Date().toISOString();
        achievements[0].progress = 1;
      }
      
      // Check 10 Resistances
      const milestone10 = achievements.find(a => a.id === 'milestone_10');
      if (milestone10) {
        milestone10.progress = Math.min(totalResisted, 10);
        if (!milestone10.earned && totalResisted >= 10) {
          milestone10.earned = true;
          milestone10.earnedDate = new Date().toISOString();
        }
      }
      
      // Check 50 Resistances
      const milestone50 = achievements.find(a => a.id === 'milestone_50');
      if (milestone50) {
        milestone50.progress = Math.min(totalResisted, 50);
        if (!milestone50.earned && totalResisted >= 50) {
          milestone50.earned = true;
          milestone50.earnedDate = new Date().toISOString();
        }
      }
      
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
      return achievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return await this.getAchievements();
    }
  }

  async exportData(): Promise<string> {
    try {
      const triggers = await this.getAllTriggers();
      const settings = await this.getSettings();
      const achievements = await this.getAchievements();
      
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        triggers,
        settings,
        achievements,
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      // Validate triggers
      if (data.triggers && Array.isArray(data.triggers)) {
        const validTriggers = data.triggers.filter((t: any) =>
          typeof t.id === 'string' &&
          typeof t.timestamp === 'string' &&
          typeof t.isResisted === 'boolean'
        );
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validTriggers));
      }
      // Validate settings
      if (data.settings && typeof data.settings === 'object') {
        const s = data.settings;
        const validSettings = {
          darkMode: typeof s.darkMode === 'boolean' ? s.darkMode : false,
          notifications: typeof s.notifications === 'boolean' ? s.notifications : true,
          dailyTarget: typeof s.dailyTarget === 'number' ? s.dailyTarget : 15,
          reminderTime: typeof s.reminderTime === 'string' ? s.reminderTime : undefined,
          themeMode: s.themeMode === 'dark' || s.themeMode === 'light' || s.themeMode === 'system' ? s.themeMode : 'system',
        };
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(validSettings));
      }
      // Validate achievements
      if (data.achievements && Array.isArray(data.achievements)) {
        const validAchievements = data.achievements.filter((a: any) =>
          typeof a.id === 'string' &&
          typeof a.title === 'string' &&
          typeof a.description === 'string' &&
          typeof a.icon === 'string' &&
          typeof a.earned === 'boolean'
        );
        await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(validAchievements));
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data - invalid format');
    }
  }
}

export const storageService = new StorageService();