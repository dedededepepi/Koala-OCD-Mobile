import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { format } from 'date-fns';

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
                    backgroundColor: '#e2e8f0',
                  }
                ]} />
                <View style={[
                  styles.resistedBar,
                  {
                    height: resistedHeight,
                    backgroundColor: '#10b981',
                  }
                ]} />
              </View>
              
              <Text style={styles.dayLabel}>
                {format(new Date(day.date), 'EEE')}
              </Text>
              
              <Text style={styles.triggerCount}>
                {day.triggers}
              </Text>
            </View>
          );
        })}
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#e2e8f0' }]} />
          <Text style={styles.legendText}>Total Triggers</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Resisted</Text>
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
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  triggerCount: {
    fontSize: 10,
    color: '#94a3b8',
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
    color: '#64748b',
  },
});