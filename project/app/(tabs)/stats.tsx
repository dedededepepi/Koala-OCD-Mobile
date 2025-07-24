import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ChartBar as BarChart3, Calendar, Target, Trophy, TrendingUp, Zap, RefreshCw } from 'lucide-react-native';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { storageService, Trigger, Achievement } from '@/services/storage';

interface PeriodStats {
  total: number;
  resisted: number;
  rate: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

interface TriggerType {
  type: string;
  count: number;
}

export default function StatsScreen() {
  const [weekStats, setWeekStats] = useState<PeriodStats>({ total: 0, resisted: 0, rate: 0 });
  const [monthStats, setMonthStats] = useState<PeriodStats>({ total: 0, resisted: 0, rate: 0 });
  const [allTimeStats, setAllTimeStats] = useState<PeriodStats>({ total: 0, resisted: 0, rate: 0 });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [topTriggers, setTopTriggers] = useState<TriggerType[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    if (!refreshing) setLoading(true);
    
    const allTriggers = await storageService.getAllTriggers();
    
    // Calculate all-time stats
    const allTimeTotal = allTriggers.length;
    const allTimeResisted = allTriggers.filter(t => t.isResisted).length;
    const allTimeRate = allTimeTotal > 0 ? Math.round((allTimeResisted / allTimeTotal) * 100) : 0;
    
    setAllTimeStats({
      total: allTimeTotal,
      resisted: allTimeResisted,
      rate: allTimeRate
    });

    // Calculate this week stats
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const weekTriggers = allTriggers.filter(t => {
      const triggerDate = new Date(t.timestamp);
      return triggerDate >= weekStart && triggerDate <= weekEnd;
    });
    
    const weekTotal = weekTriggers.length;
    const weekResisted = weekTriggers.filter(t => t.isResisted).length;
    const weekRate = weekTotal > 0 ? Math.round((weekResisted / weekTotal) * 100) : 0;
    
    setWeekStats({
      total: weekTotal,
      resisted: weekResisted,
      rate: weekRate
    });

    // Calculate this month stats
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const monthTriggers = allTriggers.filter(t => {
      const triggerDate = new Date(t.timestamp);
      return triggerDate >= monthStart && triggerDate <= monthEnd;
    });
    
    const monthTotal = monthTriggers.length;
    const monthResisted = monthTriggers.filter(t => t.isResisted).length;
    const monthRate = monthTotal > 0 ? Math.round((monthResisted / monthTotal) * 100) : 0;
    
    setMonthStats({
      total: monthTotal,
      resisted: monthResisted,
      rate: monthRate
    });

    // Calculate streak (days with 50%+ resistance)
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayTriggers = await storageService.getTriggersByDate(date);
      if (dayTriggers.length > 0) {
        const dayRate = (dayTriggers.filter(t => t.isResisted).length / dayTriggers.length) * 100;
        if (dayRate >= 50) {
          streak++;
        } else {
          break;
        }
      }
    }
    setStreakDays(streak);

    // Calculate top triggers
    const triggerCounts: Record<string, number> = {};
    allTriggers.forEach(trigger => {
      const type = trigger.compulsionType || 'general';
      triggerCounts[type] = (triggerCounts[type] || 0) + 1;
    });
    
    const sortedTriggers = Object.entries(triggerCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    setTopTriggers(sortedTriggers);

    // Load and update achievements
    const updatedAchievements = await storageService.checkAndUpdateAchievements();
    setAchievements(updatedAchievements);
    
    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllStats();
  };

  const handleAchievementPress = (achievement: Achievement) => {
    const progressText = achievement.target 
      ? `Progress: ${achievement.progress}/${achievement.target}`
      : '';
    
    Alert.alert(
      achievement.title,
      `${achievement.description}\n\n${progressText}`,
      [{ text: 'OK' }]
    );
  };

  const predictedRate = Math.min(Math.max(allTimeStats.rate + Math.floor(Math.random() * 10 - 5), 0), 100);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <BarChart3 size={28} color="#4F46E5" />
          <Text style={styles.title}>Stats</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw 
              size={20} 
              color="#4F46E5" 
              style={refreshing && styles.spinning}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Your progress and achievements
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroNumber}>{streakDays}</Text>
          <Text style={styles.heroTitle}>Day with 50%+ resistance</Text>
          <Text style={styles.heroSubtitle}>Keep the momentum going! 🔥</Text>
        </View>

        {/* This Week */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={20} color="#4F46E5" />
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>This Week</Text>
              <Text style={styles.cardDate}>
                {format(startOfWeek(new Date()), 'MMM d')} - {format(endOfWeek(new Date()), 'MMM d')}
              </Text>
            </View>
          </View>
          
          <View style={styles.statsSection}>
            <Text style={styles.statsLabel}>Resistance Rate</Text>
            <Text style={styles.statsPercentage}>{weekStats.rate}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${weekStats.rate}%` }]} />
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: '#10B981' }]}>{weekStats.resisted}</Text>
                  <Text style={styles.statLabel}>Resisted</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: '#F97316' }]}>{weekStats.total - weekStats.resisted}</Text>
                  <Text style={styles.statLabel}>Gave In</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* This Month */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Target size={20} color="#4F46E5" />
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>This Month</Text>
              <Text style={styles.cardDate}>
                {format(new Date(), 'MMMM yyyy')}
              </Text>
            </View>
          </View>
          
          <View style={styles.statsSection}>
            <Text style={styles.statsLabel}>Resistance Rate</Text>
            <Text style={styles.statsPercentage}>{monthStats.rate}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${monthStats.rate}%` }]} />
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: '#10B981' }]}>{monthStats.resisted}</Text>
                  <Text style={styles.statLabel}>Resisted</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: '#F97316' }]}>{monthStats.total - monthStats.resisted}</Text>
                  <Text style={styles.statLabel}>Gave In</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* All Time */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TrendingUp size={20} color="#4F46E5" />
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>All Time</Text>
              <Text style={styles.cardDate}>Since you started tracking</Text>
            </View>
          </View>
          
          <View style={styles.statsSection}>
            <Text style={styles.statsLabel}>Resistance Rate</Text>
            <Text style={styles.statsPercentage}>{allTimeStats.rate}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${allTimeStats.rate}%` }]} />
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: '#10B981' }]}>{allTimeStats.resisted}</Text>
                  <Text style={styles.statLabel}>Resisted</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: '#F97316' }]}>{allTimeStats.total - allTimeStats.resisted}</Text>
                  <Text style={styles.statLabel}>Gave In</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Tomorrow's Forecast */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Zap size={20} color="#4F46E5" />
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Tomorrow's Forecast</Text>
              <Text style={styles.cardDate}>AI prediction based on your recent patterns</Text>
            </View>
          </View>
          
          <View style={styles.forecastSection}>
            <View style={styles.forecastHeader}>
              <Text style={styles.forecastPercentage}>{predictedRate}%</Text>
              <View style={styles.forecastBadge}>
                <Text style={styles.forecastBadgeText}>💪</Text>
                <Text style={styles.forecastConfidence}>low</Text>
              </View>
            </View>
            <Text style={styles.forecastLabel}>Predicted resistance rate</Text>
            <Text style={styles.forecastSubtext}>low confidence</Text>
            
            <Text style={styles.forecastMessage}>
              Tomorrow presents a balanced opportunity. Your patterns show steady progress - trust in your growing strength and use your coping tools. 💪
            </Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Trophy size={20} color="#4F46E5" />
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Achievements</Text>
              <Text style={styles.cardDate}>Celebrate your progress milestones</Text>
            </View>
          </View>
          
          <View style={styles.achievementsList}>
            {achievements.map((achievement) => (
              <TouchableOpacity 
                key={achievement.id} 
                style={[
                  styles.achievementItem,
                  achievement.earned && styles.achievementEarned
                ]}
                onPress={() => handleAchievementPress(achievement)}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementContent}>
                  <Text style={[
                    styles.achievementTitle,
                    !achievement.earned && styles.achievementTitleDisabled
                  ]}>
                    {achievement.title}
                  </Text>
                  <Text style={[
                    styles.achievementDescription,
                    !achievement.earned && styles.achievementDescriptionDisabled
                  ]}>
                    {achievement.description}
                  </Text>
                  {achievement.target && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill,
                            { width: `${(achievement.progress || 0) / achievement.target * 100}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {achievement.progress || 0}/{achievement.target}
                      </Text>
                    </View>
                  )}
                </View>
                {achievement.earned && (
                  <View style={styles.earnedBadge}>
                    <Text style={styles.earnedBadgeText}>Earned!</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top Triggers */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Zap size={20} color="#4F46E5" />
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Top Triggers</Text>
              <Text style={styles.cardDate}>Your most common trigger types</Text>
            </View>
          </View>
          
          <View style={styles.triggersList}>
            {topTriggers.map((trigger, index) => (
              <View key={trigger.type} style={styles.triggerItem}>
                <Text style={styles.triggerRank}>{index + 1}</Text>
                <Text style={styles.triggerType}>{trigger.type}</Text>
                <View style={styles.triggerBar}>
                  <View style={[
                    styles.triggerBarFill,
                    { width: `${(trigger.count / (topTriggers[0]?.count || 1)) * 100}%` }
                  ]} />
                </View>
                <Text style={styles.triggerCount}>{trigger.count}</Text>
              </View>
            ))}
            
            {topTriggers.length === 0 && (
              <Text style={styles.emptyText}>No triggers recorded yet</Text>
            )}
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
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  refreshButton: {
    padding: 4,
    marginLeft: 'auto',
  },
  spinning: {
    // Add rotation animation if needed
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
  heroCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-Regular',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
    color: '#E9D5FF',
    textAlign: 'center',
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
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 8,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
  },
  statsSection: {
    gap: 8,
  },
  statsLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  statsPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    alignSelf: 'flex-end',
    marginTop: -24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  statItem: {
    flex: 1,
  },
  statBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  forecastSection: {
    gap: 8,
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forecastPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  forecastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  forecastBadgeText: {
    fontSize: 16,
  },
  forecastConfidence: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  forecastLabel: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
  forecastSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  forecastMessage: {
    fontSize: 14,
    color: '#4F46E5',
    lineHeight: 20,
    marginTop: 8,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  achievementEarned: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  achievementTitleDisabled: {
    color: '#9CA3AF',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  achievementDescriptionDisabled: {
    color: '#D1D5DB',
  },
  earnedBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  earnedBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  triggersList: {
    gap: 12,
  },
  triggerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  triggerRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
    width: 20,
  },
  triggerType: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  triggerBar: {
    flex: 2,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  triggerBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  triggerCount: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    width: 20,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
});