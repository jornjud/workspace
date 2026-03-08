import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, ORDER_STATUS_LABELS } from '../../shared/constants';

const MOCK_ORDERS = [
  { id: '001', time: '12:30', customer: 'สมชาย', items: 'ก๋วยเตี๋ยวเนื้อ x2', total: 100, status: 'pending' },
  { id: '002', time: '12:15', customer: 'สมศักดิ์', items: 'ข้าวมันไก่ x1', total: 45, status: 'preparing' },
  { id: '003', time: '12:00', customer: 'สมหมาย', items: 'ก๋วยเตี๋ยวไก่ x1', total: 45, status: 'ready' },
  { id: '004', time: '11:45', customer: 'สมศรี', items: 'น้ำเย็น x2', total: 20, status: 'completed' },
];

const STATUS_FILTERS = ['ทั้งหมด', 'ใหม่', 'กำลังทำ', 'พร้อม', 'เสร็จ'];

export default function OrdersScreen() {
  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{item.id}</Text>
        <Text style={styles.orderTime}>{item.time}</Text>
      </View>
      <Text style={styles.customerName}>{item.customer}</Text>
      <Text style={styles.orderItems}>{item.items}</Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>฿{item.total}</Text>
        {item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.rejectButton}>
              <Text style={styles.rejectText}>ปฏิเสธ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton}>
              <Text style={styles.acceptText}>รับออเดอร์</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.status === 'preparing' && (
          <TouchableOpacity style={styles.readyButton}>
            <Text style={styles.readyText}>เสร็จ</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ออเดอร์</Text>
      </View>

      <View style={styles.filters}>
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity key={filter} style={styles.filterChip}>
            <Text style={styles.filterText}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={MOCK_ORDERS}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
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
  filters: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
    color: COLORS.text,
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
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  orderTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderItems: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
  },
  rejectButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    marginRight: 8,
  },
  rejectText: {
    color: COLORS.error,
    fontWeight: '600',
  },
  acceptButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.success,
    borderRadius: 8,
  },
  acceptText: {
    color: '#fff',
    fontWeight: '600',
  },
  readyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  readyText: {
    color: '#fff',
    fontWeight: '600',
  },
});
