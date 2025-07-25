import { storageService } from '@/services/storage';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

export interface AnalyticsData {
  totalTriggers: number;
  totalResisted: number;
  resistanceRate: number;
  streakDays: number;
  averageTriggersPerDay: number;
  mostCommonTrigger: string;
  bestDay: string;
  worstDay: string;
  weeklyTrend: 'improving' | 'declining' | 'stable';
}

export class AnalyticsService {
  static async getAnalytics(): Promise<AnalyticsData> {
    const triggers = await storageService.getAllTriggers();
    
    if (triggers.length === 0) {
      return {
        totalTriggers: 0,
        totalResisted: 0,
        resistanceRate: 0,
        streakDays: 0,
        averageTriggersPerDay: 0,
        mostCommonTrigger: 'None',
        bestDay: 'None',
        worstDay: 'None',
        weeklyTrend: 'stable',
      };
    }

    // Ensure triggers are sorted by timestamp ascending
    triggers.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const totalTriggers = triggers.length;
    const totalResisted = triggers.filter(t => t.isResisted).length;
    const resistanceRate = Math.round((totalResisted / totalTriggers) * 100);

    // Calculate streak (optimized)
    const streakDays = await this.calculateStreakOptimized(triggers);

    // Calculate average triggers per day
    const firstTrigger = new Date(triggers[0].timestamp);
    const daysSinceFirst = Math.max(1, Math.ceil((Date.now() - firstTrigger.getTime()) / (1000 * 60 * 60 * 24)));
    const averageTriggersPerDay = Math.round(totalTriggers / daysSinceFirst);

    // Most common trigger
    const triggerCounts: Record<string, number> = {};
    triggers.forEach(t => {
      const type = t.compulsionType || 'Unknown';
      triggerCounts[type] = (triggerCounts[type] || 0) + 1;
    });
    const mostCommonTrigger = Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    // Best and worst days
    const dailyStats = await this.getDailyStats();
    const bestDay = dailyStats.reduce((best, day) => 
      day.rate > best.rate ? day : best, dailyStats[0] || { date: 'None', rate: 0 }
    ).date;
    const worstDay = dailyStats.reduce((worst, day) => 
      day.rate < worst.rate ? day : worst, dailyStats[0] || { date: 'None', rate: 100 }
    ).date;

    // Weekly trend
    const weeklyTrend = await this.getWeeklyTrend();

    return {
      totalTriggers,
      totalResisted,
      resistanceRate,
      streakDays,
      averageTriggersPerDay,
      mostCommonTrigger,
      bestDay: bestDay !== 'None' ? format(new Date(bestDay), 'EEEE') : 'None',
      worstDay: worstDay !== 'None' ? format(new Date(worstDay), 'EEEE') : 'None',
      weeklyTrend,
    };
  }

  // Optimized streak calculation using all triggers
  private static async calculateStreakOptimized(triggers: any[]): Promise<number> {
    // Group triggers by date string
    const dateMap: Record<string, any[]> = {};
    triggers.forEach(t => {
      const dateStr = t.timestamp.split('T')[0];
      if (!dateMap[dateStr]) dateMap[dateStr] = [];
      dateMap[dateStr].push(t);
    });
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayTriggers = dateMap[date] || [];
      if (dayTriggers.length > 0) {
        const dayRate = (dayTriggers.filter(t => t.isResisted).length / dayTriggers.length) * 100;
        if (dayRate >= 50) {
          streak++;
        } else {
          break;
        }
      }
    }
    return streak;
  }

  private static async getDailyStats() {
    const stats = [];
    for (let i = 0; i < 7; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayTriggers = await storageService.getTriggersByDate(date);
      const rate = dayTriggers.length > 0 
        ? (dayTriggers.filter(t => t.isResisted).length / dayTriggers.length) * 100
        : 0;
      stats.push({ date, rate, triggers: dayTriggers.length });
    }
    return stats;
  }

  private static async getWeeklyTrend(): Promise<'improving' | 'declining' | 'stable'> {
    const thisWeekStart = startOfWeek(new Date());
    const thisWeekEnd = endOfWeek(new Date());
    const lastWeekStart = startOfWeek(subDays(new Date(), 7));
    const lastWeekEnd = endOfWeek(subDays(new Date(), 7));

    const allTriggers = await storageService.getAllTriggers();
    
    const thisWeekTriggers = allTriggers.filter(t => {
      const date = new Date(t.timestamp);
      return date >= thisWeekStart && date <= thisWeekEnd;
    });
    
    const lastWeekTriggers = allTriggers.filter(t => {
      const date = new Date(t.timestamp);
      return date >= lastWeekStart && date <= lastWeekEnd;
    });

    const thisWeekRate = thisWeekTriggers.length > 0 
      ? (thisWeekTriggers.filter(t => t.isResisted).length / thisWeekTriggers.length) * 100
      : 0;
    
    const lastWeekRate = lastWeekTriggers.length > 0 
      ? (lastWeekTriggers.filter(t => t.isResisted).length / lastWeekTriggers.length) * 100
      : 0;

    const difference = thisWeekRate - lastWeekRate;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }
}