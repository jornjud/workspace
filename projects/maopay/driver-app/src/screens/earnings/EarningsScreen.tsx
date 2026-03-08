import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../shared/constants';

const WEEKLY_EARNINGS = [
  { day: 'จันทร์', amount: 450 },
  { day: 'อังคาร', amount: 380 },
  { day: 'พุธ', amount: 520 },
  { day: 'พฤหัส', amount: 410 },
  { day: 'ศุกร์', amount: 620 },
  { day: 'เสาร์', amount: 780 },
  { day: 'อาทิตย์', amount: 550 },
];

export default function EarningsScreen() {
  const todayEarnings = 1250;
  const weeklyTotal = WEEKLY_EARNINGS.reduce((sum, d) => sum + d.amount, 0);
  const monthlyTotal = weeklyTotal * 4;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>รายได้</Text>
      </View>

      {/* Today */}
      <View style={styles.todayCard}>
        <Text style={styles.todayLabel}>รายได้วันนี้</Text>
        <Text style={styles.todayAmount}>฿{todayEarnings}</Text>
      </View>

      {/* Weekly */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>สัปดาห์นี้</Text>
        <Text style={styles.cardAmount}>฿{weeklyTotal}</Text>
        <View style={styles.chart}>
          {WEEKLY_EARNINGS.map((day, index) => (
            <View key={index} style={styles.chartBar}>
              <View 
                style={[
                  styles.bar, 
                  { height: (day.amount / 800) * 100 }
                ]} 
              />
              <Text style={styles.barLabel}>{day.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Monthly */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>เดือนนี้</Text>
        <Text style={styles.cardAmount}>฿{monthlyTotal}</Text>
      </View>

      {/* Withdraw */}
      <TouchableOpacity style={styles.withdrawButton}>
        <Text style={styles.withdrawButtonText}>ถอนเงิน</Text>
      </TouchableOpacity>

      {/* History */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ประวัติการถอน</Text>
        <Text style={styles.emptyText}>ยังไม่มีประวัติการถอน</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  todayCard: {
    backgroundColor: COLORS.success,
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  todayLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  todayAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    marginTop: 16,
  },
  chartBar: {
    alignItems: 'center',
  },
  bar: {
    width: 30,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  withdrawButton: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
});
