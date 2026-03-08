import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, ORDER_STATUS_LABELS } from '../../shared/constants';

const MOCK_ORDERS = [
  {
    id: '12345',
    restaurantName: 'ก๋วยเตี๋ยวลุงชาติ',
    date: '22 ก.พ. 2569',
    total: 120,
    status: 'completed',
  },
  {
    id: '12344',
    restaurantName: 'ข้าวมันไก่ป้าสมศรี',
    date: '20 ก.พ. 2569',
    total: 85,
    status: 'completed',
  },
];

export default function OrdersScreen({ navigation }: any) {
  const renderOrder = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.restaurantName}>{item.restaurantName}</Text>
        <Text style={styles.status}>{ORDER_STATUS_LABELS[item.status]}</Text>
      </View>
      <View style={styles.orderInfo}>
        <Text style={styles.orderDate}>{item.date}</Text>
        <Text style={styles.orderTotal}>฿{item.total}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ประวัติการสั่งซื้อ</Text>
      </View>

      <FlatList
        data={MOCK_ORDERS}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>ยังไม่มีออเดอร์</Text>
          </View>
        }
      />
    </View>
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
  listContainer: {
    padding: 16,
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
  status: {
    fontSize: 14,
    color: COLORS.success,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
