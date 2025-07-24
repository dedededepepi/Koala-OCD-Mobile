import { useState, useEffect } from 'react';
import { storageService, Achievement } from '@/services/storage';

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAchievements = async () => {
    try {
      const data = await storageService.getAchievements();
      setAchievements(data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    try {
      const updated = await storageService.checkAndUpdateAchievements();
      setAchievements(updated);
      
      // Return newly earned achievements
      const newlyEarned = updated.filter(a => 
        a.earned && !achievements.find(old => old.id === a.id)?.earned
      );
      
      return newlyEarned;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  return {
    achievements,
    loading,
    loadAchievements,
    checkAchievements,
  };
}