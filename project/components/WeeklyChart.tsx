import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/useTheme';

const { width } = Dimensions.get('window');
const chartWidth = width - 48; // Account for padding
const barWidth = (chartWidth - 60) / 7; // 7 days with spacing

interface DayStats {
  date: string;
  triggers: number;
  resisted: number;
  rate: number;
}

interface WeeklyChartProps {
  data: DayStats[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const { colors } = useTheme();
  const maxTriggers = Math.max(...data.map(d => d.triggers), 1);
  const chartHeight = 120;

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {data.map((day, index) => {
          const barHeight = (day.triggers / maxTriggers) * chartHeight;
          const resistedHeight = (day.resisted / maxTriggers) * chartHeight;
          
          return (
            <View key={day.date} style={styles.barContainer}>
              <View style={[styles.barBackground, { height: chartHeight }]}>
                <View style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: colors.infoMuted,
                  }
                ]} />
                <View style={[
                  styles.resistedBar,
                  {
                    height: resistedHeight,
                    backgroundColor: colors.success,
                  }
                ]} />
              </View>
              
              <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                {format(new Date(day.date), 'EEE')}
              </Text>
              
              <Text style={[styles.triggerCount, { color: colors.textTertiary }]}>
                {day.triggers}
              </Text>
            </View>
          );
        })}
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.infoMuted }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Total Triggers</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Resisted</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingBottom: 40,
  },
  barContainer: {
    alignItems: 'center',
    width: barWidth,
  },
  barBackground: {
    width: '80%',
    position: 'relative',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  resistedBar: {
    width: '100%',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  triggerCount: {
    fontSize: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
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
  },
});