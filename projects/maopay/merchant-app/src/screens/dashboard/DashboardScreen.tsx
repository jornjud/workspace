import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../shared/constants';

const MOCK_STATS = {
  todayOrders: 25,
  todayRevenue: 4500,
  pendingOrders: 3,
  avgRating: 4.8,
};

const RECENT_ORDERS = [
  { id: '001', time: '12:30', items: 'ก๋วยเตี๋ยวเนื้อ x2', status: 'new' },
  { id: '002', time: '12:15', items: 'ข้าวมันไก่ x1', status: 'preparing' },
  { id: '003', time: '12:00', items: 'ก๋วยเตี๋ยวไก่ x1', status: 'ready' },
];

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.restaurantName}>ก๋วยเตี๋ยวลุงชาติ</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{MOCK_STATS.todayOrders}</Text>
          <Text style={styles.statLabel}>ออเดอร์วันนี้</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>฿{MOCK_STATS.todayRevenue}</Text>
          <Text style={styles.statLabel}>รายได้วันนี้</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.accent }]}>
            {MOCK_STATS.pendingOrders}
          </Text>
          <Text style={styles.statLabel}>รอดำเนินการ</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>⭐ {MOCK_STATS.avgRating}</Text>
          <Text style={styles.statLabel}>เรตติ้ง</Text>
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 ออเดอร์ล่าสุด</Text>
        {RECENT_ORDERS.map((order) => (
          <TouchableOpacity key={order.id} style={styles.orderCard}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>#{order.id}</Text>
              <Text style={styles.orderTime}>{order.time}</Text>
            </View>
            <Text style={styles.orderItems}>{order.items}</Text>
            <View style={styles.orderStatus}>
              <Text style={[
                styles.statusBadge,
                order.status === 'new' && styles.statusNew,
                order.status === 'preparing' && styles.statusPreparing,
                order.status === 'ready' && styles.statusReady,
              ]}>
                {order.status === 'new' && 'ใหม่'}
                {order.status === 'preparing' && 'กำลังทำ'}
                {order.status === 'ready' && 'พร้อม'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
  },
  headerTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statCardInner: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    textAlign: 'center',
    overflow: 'hidden',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    backgroundColor: '#fff',
    paddingBottom: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderInfo: {
    width: 60,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  orderTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  orderItems: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  orderStatus: {},
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  statusNew: {
    backgroundColor: COLORS.accent,
    color: COLORS.secondary,
  },
  statusPreparing: {
    backgroundColor: COLORS.primary,
    color: '#fff',
  },
  statusReady: {
    backgroundColor: COLORS.success,
    color: '#fff',
  },
});
