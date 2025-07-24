import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TrendingUp, ChartBar as BarChart3, Calendar } from 'lucide-react-native';
import { TimelineIcon } from '@/components/TimelineIcon';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { storageService, Trigger } from '@/services/storage';

const { width } = Dimensions.get('window');

interface DayStats {
  date: string;
  triggers: number;
  resisted: number;
  rate: number;
}

interface HourlyData {
  hour: number;
  triggers: number;
  resisted: number;
}

export default function TimelineScreen() {
  const [weeklyStats, setWeeklyStats] = useState<DayStats[]>([]);
  const [todayHourly, setTodayHourly] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimelineData();
  }, []);

  const loadTimelineData = async () => {
    setLoading(true);
    
    // Load data for the past 7 days
    const weekStats: DayStats[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const triggers = await storageService.getTriggersByDate(dateStr);
      
      const dayTriggers = triggers.length;
      const dayResisted = triggers.filter(t => t.isResisted).length;
      const rate = dayTriggers > 0 ? (dayResisted / dayTriggers) * 100 : 0;

      weekStats.push({
        date: dateStr,
        triggers: dayTriggers,
        resisted: dayResisted,
        rate,
      });
    }

    // Load today's hourly data
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayTriggers = await storageService.getTriggersByDate(today);
    
    // Group by hour
    const hourlyMap: Record<number, { triggers: number; resisted: number }> = {};
    todayTriggers.forEach(trigger => {
      const hour = new Date(trigger.timestamp).getHours();
      if (!hourlyMap[hour]) {
        hourlyMap[hour] = { triggers: 0, resisted: 0 };
      }
      hourlyMap[hour].triggers++;
      if (trigger.isResisted) {
        hourlyMap[hour].resisted++;
      }
    });

    const hourlyData: HourlyData[] = Object.entries(hourlyMap).map(([hour, data]) => ({
      hour: parseInt(hour),
      triggers: data.triggers,
      resisted: data.resisted,
    }));

    setWeeklyStats(weekStats);
    setTodayHourly(hourlyData);
    setLoading(false);
  };

  const totalWeekTriggers = weeklyStats.reduce((sum, day) => sum + day.triggers, 0);
  const totalWeekResisted = weeklyStats.reduce((sum, day) => sum + day.resisted, 0);
  const weeklyRate = totalWeekTriggers > 0 ? Math.round((totalWeekResisted / totalWeekTriggers) * 100) : 0;

  const mostChallengingDay = weeklyStats.reduce((max, day) => 
    day.triggers > max.triggers ? day : max, weeklyStats[0] || { triggers: 0, date: '', rate: 0 }
  );

  const bestResistanceDay = weeklyStats.reduce((best, day) => 
    day.rate > best.rate ? day : best, weeklyStats[0] || { rate: 0, date: '' }
  );

  const topHour = todayHourly.reduce((max, hour) => 
    hour.triggers > max.triggers ? hour : max, todayHourly[0] || { hour: 7, triggers: 0, resisted: 0 }
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TimelineIcon size={28} color="#4F46E5" />
          <Text style={styles.title}>Timeline</Text>
        </View>
        <Text style={styles.subtitle}>
          Visualize your compulsion patterns over time
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Last 7 Days */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <BarChart3 size={20} color="#4F46E5" />
            <Text style={styles.cardTitle}>Last 7 Days</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            When compulsions occur most frequently throughout your day
          </Text>
          
          <View style={styles.weeklyChart}>
            <>
            <View style={styles.chartContainer}>
              {weeklyStats.map((day, index) => {
                const maxHeight = 60;
                const maxTriggers = Math.max(...weeklyStats.map(d => d.triggers), 1);
                const totalHeight = (day.triggers / maxTriggers) * maxHeight;
                const resistedHeight = (day.resisted / maxTriggers) * maxHeight;
                
                return (
                 <React.Fragment key={day.date}>
                  <View key={day.date} style={styles.dayColumn}>
                    <View style={[styles.dayBar, { height: maxHeight }]}>
                      {day.triggers > 0 && (
                        <>
                          <View style={[
                            styles.totalBar,
                            { 
                              height: totalHeight,
                              backgroundColor: '#F97316'
                            }
                          ]} />
                          <View style={[
                            styles.resistedBar,
                            { 
                              height: resistedHeight,
                              backgroundColor: '#10B981'
                            }
                          ]} />
                        </>
                      )}
                    </View>
                    <Text style={styles.dayLabel}>
                      {format(new Date(day.date), 'EEE')}
                    </Text>
                  </View>
                  {index === 6 && day.triggers > 0 && (
                    <Text style={styles.todayPercentageText}>{Math.round(day.rate)}%</Text>
                  )}
                 </React.Fragment>
                );
              })}
            </View>
            
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Resisted</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
                <Text style={styles.legendText}>Gave In</Text>
              </View>
            </View>
            </>
          </View>
        </View>

        {/* Today's Hourly Pattern */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <BarChart3 size={20} color="#4F46E5" />
            <Text style={styles.cardTitle}>Today's Hourly Pattern</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            When triggers occur most frequently throughout your day
          </Text>
          
          {todayHourly.length > 0 ? (
            <View style={styles.hourlyPattern}>
              {todayHourly.map((hour) => (
                <View key={hour.hour} style={styles.hourlyItem}>
                  <Text style={styles.hourLabel}>
                    {hour.hour === 0 ? '12 AM' : hour.hour <= 12 ? `${hour.hour} AM` : `${hour.hour - 12} PM`}
                  </Text>
                  <View style={styles.hourlyBar}>
                    <View style={[
                      styles.hourlyResisted,
                      { flex: hour.resisted }
                    ]} />
                    <View style={[
                      styles.hourlyGaveIn,
                      { flex: hour.triggers - hour.resisted }
                    ]} />
                  </View>
                  <Text style={styles.hourlyTotal}>{hour.triggers} total</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyHourly}>
              <Text style={styles.emptyText}>No triggers recorded today</Text>
            </View>
          )}
        </View>

        {/* Weekly Insights */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TrendingUp size={20} color="#4F46E5" />
            <Text style={styles.cardTitle}>Weekly Insights</Text>
          </View>
          
          <View style={styles.insights}>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Most challenging day:</Text>
              <Text style={styles.insightValue}>
                {mostChallengingDay.triggers > 0 
                  ? `${format(new Date(mostChallengingDay.date), 'EEEE')} with ${mostChallengingDay.triggers} compulsions`
                  : 'No challenging days this week'
                }
              </Text>
            </View>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Best resistance day:</Text>
              <Text style={styles.insightValue}>
                {bestResistanceDay.rate > 0
                  ? `${format(new Date(bestResistanceDay.date), 'EEEE')} with ${Math.round(bestResistanceDay.rate)}% resistance`
                  : 'Keep working on resistance'
                }
              </Text>
            </View>
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Total compulsions this week:</Text>
              <Text style={styles.insightValue}>
                {totalWeekTriggers} ({totalWeekResisted} resisted)
              </Text>
            </View>
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
  weeklyChart: {
    marginTop: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: 16,
    position: 'relative',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  dayBar: {
    width: '80%',
    justifyContent: 'flex-end',
    position: 'relative',
    marginBottom: 8,
  },
  totalBar: {
    width: '100%',
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
  },
  resistedBar: {
    width: '100%',
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
  },
  dayLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  todayIndicator: {
    position: 'absolute',
    right: -40,
    top: 0,
    alignItems: 'center',
  },
  todayBar: {
    width: 20,
    height: 40,
    backgroundColor: '#10B981',
    borderRadius: 2,
    marginBottom: 8,
  },
  todayLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  todayPercentageText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  hourlyPattern: {
    gap: 12,
  },
  hourlyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hourLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    width: 50,
  },
  hourlyBar: {
    flex: 1,
    height: 20,
    borderRadius: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  hourlyResisted: {
    backgroundColor: '#10B981',
  },
  hourlyGaveIn: {
    backgroundColor: '#F97316',
  },
  hourlyTotal: {
    fontSize: 12,
    color: '#6B7280',
    width: 50,
    textAlign: 'right',
  },
  emptyHourly: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  insights: {
    gap: 16,
  },
  insightItem: {
    gap: 4,
  },
  insightLabel: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  insightValue: {
    fontSize: 14,
    color: '#1F2937',
  },
});