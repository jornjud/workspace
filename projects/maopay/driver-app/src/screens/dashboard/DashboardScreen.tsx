import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { COLORS } from '../../shared/constants';

const MOCK_ORDERS = [
  {
    id: '12345',
    restaurantName: 'ก๋วยเตี๋ยวลุงชาติ',
    customerName: 'สมชาย',
    pickupAddress: '123 ถ.สะเดา',
    deliveryAddress: '456 ถ.เขาค่าย',
    earnings: 25,
    distance: 2.5,
  },
  {
    id: '12346',
    restaurantName: 'ข้าวมันไก่ป้าสมศรี',
    customerName: 'สมศักดิ์',
    pickupAddress: '789 ถ.สะเดา',
    deliveryAddress: '101 ถ.เขาค่าย',
    earnings: 30,
    distance: 3.0,
  },
];

export default function DashboardScreen({ navigation }: any) {
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>สวัสดีครับ</Text>
          <Text style={styles.driverName}>คนขับสมชาย</Text>
        </View>
        <View style={styles.availabilityToggle}>
          <Text style={styles.availabilityLabel}>
            {isAvailable ? 'พร้อมรับงาน' : 'ไม่พร้อม'}
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#ccc', true: COLORS.success }}
          />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>฿1,250</Text>
          <Text style={styles.statLabel}>รายได้วันนี้</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>ออเดอร์วันนี้</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>⭐ 4.9</Text>
          <Text style={styles.statLabel}>เรตติ้ง</Text>
        </View>
      </View>

      {/* New Orders */}
      <View style={styles.ordersSection}>
        <Text style={styles.sectionTitle}>📢 ออเดอร์ใหม่</Text>
        {isAvailable ? (
          MOCK_ORDERS.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.restaurantName}>{order.restaurantName}</Text>
                <Text style={styles.earnings}>฿{order.earnings}</Text>
              </View>
              <Text style={styles.orderAddress}>📍 {order.pickupAddress}</Text>
              <Text style={styles.orderAddress}>🏠 {order.deliveryAddress}</Text>
              <Text style={styles.distance}>📏 {order.distance} กม.</Text>
              <View style={styles.orderActions}>
                <TouchableOpacity 
                  style={styles.rejectButton}
                  onPress={() => {}}
                >
                  <Text style={styles.rejectButtonText}>ปฏิเสธ</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                >
                  <Text style={styles.acceptButtonText}>รับงาน</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.unavailableMessage}>
            <Text>คุณกำลังออฟไลน์อยู่</Text>
            <Text>เปิดสวิตช์ด้านบนเพื่อรับงาน</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.primary,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  driverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  availabilityToggle: {
    alignItems: 'center',
  },
  availabilityLabel: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  ordersSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  earnings: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  orderAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectButton: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  rejectButtonText: {
    color: COLORS.error,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  unavailableMessage: {
    alignItems: 'center',
    padding: 40,
    color: COLORS.textSecondary,
  },
});
