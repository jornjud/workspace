import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../../shared/constants';

export default function OrderDetailScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  
  const order = {
    id: orderId,
    restaurantName: 'ก๋วยเตี๋ยวลุงชาติ',
    restaurantAddress: '123 ถ.สะเดา',
    customerName: 'สมชาย',
    customerAddress: '456 ถ.เขาค่าย',
    items: [
      { name: 'ก๋วยเตี๋ยวเนื้อ', quantity: 2 },
      { name: 'น้ำเย็น', quantity: 2 },
    ],
    earnings: 25,
    status: 'pending', // pending, picked_up, delivering
  };

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text>🗺️ แผนที่</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 ข้อมูลออเดอร์</Text>
          <Text style={styles.orderId}>#{order.id}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ร้าน:</Text>
            <Text style={styles.infoValue}>{order.restaurantName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ที่อยู่ร้าน:</Text>
            <Text style={styles.infoValue}>{order.restaurantAddress}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 ข้อมูลลูกค้า</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ชื่อ:</Text>
            <Text style={styles.infoValue}>{order.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ที่อยู่:</Text>
            <Text style={styles.infoValue}>{order.customerAddress}</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍜 รายการอาหาร</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text>{item.quantity}x {item.name}</Text>
            </View>
          ))}
        </View>

        {/* Earnings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 รายได้</Text>
          <Text style={styles.earnings}>฿{order.earnings}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.callButton}>
            <Text>📞 โทรหาร้าน</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chatButton}>
            <Text>💬 ข้อความ</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.replace('Main')}
        >
          <Text style={styles.actionButtonText}>กลับหน้าหลัก</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    color: COLORS.textSecondary,
  },
  infoValue: {
    flex: 1,
    color: COLORS.text,
  },
  itemRow: {
    marginBottom: 4,
  },
  earnings: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
  },
  callButton: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  chatButton: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
