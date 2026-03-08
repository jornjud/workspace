import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, ORDER_STATUS_LABELS } from '../../shared/constants';

const ORDER_STEPS = [
  { key: 'confirmed', label: 'ยืนยันแล้ว', icon: '✓' },
  { key: 'preparing', label: 'กำลังเตรียม', icon: '👨‍🍳' },
  { key: 'picking_up', label: 'กำลังไปรับ', icon: '🚴' },
  { key: 'on_the_way', label: 'กำลังส่ง', icon: '🚗' },
  { key: 'arrived', label: 'ถึงแล้ว', icon: '📍' },
];

export default function OrderTrackingScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  
  // Mock current status - ในจริงจะดึงจาก Firebase
  const currentStatus = 'preparing';
  const currentStepIndex = ORDER_STEPS.findIndex(s => s.key === currentStatus);

  const restaurantName = 'ก๋วยเตี๋ยวลุงชาติ';
  const orderItems = [
    { name: 'ก๋วยเตี๋ยวเนื้อ', quantity: 2, price: 100 },
    { name: 'น้ำเย็น', quantity: 2, price: 20 },
  ];
  const total = 120;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ติดตามออเดอร์</Text>
        <Text style={styles.orderId}>#{orderId || '12345'}</Text>
      </View>

      {/* Status Timeline */}
      <View style={styles.timeline}>
        <Text style={styles.sectionTitle}>สถานะออเดอร์</Text>
        <View style={styles.stepsContainer}>
          {ORDER_STEPS.map((step, index) => (
            <View key={step.key} style={styles.step}>
              <View style={[
                styles.stepCircle,
                index <= currentStepIndex && styles.stepCircleActive,
              ]}>
                <Text style={[
                  styles.stepIcon,
                  index <= currentStepIndex && styles.stepIconActive,
                ]}>
                  {step.icon}
                </Text>
              </View>
              <Text style={[
                styles.stepLabel,
                index <= currentStepIndex && styles.stepLabelActive,
              ]}>
                {step.label}
              </Text>
              {index < ORDER_STEPS.length - 1 && (
                <View style={[
                  styles.stepLine,
                  index < currentStepIndex && styles.stepLineActive,
                ]} />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Order Info */}
      <View style={styles.infoCard}>
        <Text style={styles.restaurantName}>{restaurantName}</Text>
        <View style={styles.divider} />
        {orderItems.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text>{item.quantity}x {item.name}</Text>
            <Text>฿{item.price}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>รวมทั้งหมด</Text>
          <Text style={styles.totalValue}>฿{total}</Text>
        </View>
      </View>

      {/* Driver Info (if applicable) */}
      {currentStatus === 'on_the_way' && (
        <View style={styles.driverCard}>
          <Text style={styles.sectionTitle}>🚴 คนขับ</Text>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>สมชาย</Text>
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>สมชาย มีน้ำใจ</Text>
              <Text>⭐ 4.9</Text>
            </View>
          </View>
          <View style={styles.driverActions}>
            <TouchableOpacity style={styles.contactButton}>
              <Text>📞 โทร</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton}>
              <Text>💬 ข้อความ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => navigation.replace('Main')}
        >
          <Text style={styles.homeButtonText}>กลับหน้าหลัก</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.supportButton}
        >
          <Text style={styles.supportButtonText}>ติดต่อฝ่ายสนับสนุน</Text>
        </TouchableOpacity>
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
    backgroundColor: COLORS.primary,
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  orderId: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  timeline: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
  },
  stepIcon: {
    fontSize: 16,
    opacity: 0.5,
  },
  stepIconActive: {
    opacity: 1,
  },
  stepLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  stepLine: {
    position: 'absolute',
    top: 20,
    left: '60%',
    width: '80%',
    height: 2,
    backgroundColor: COLORS.backgroundSecondary,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  driverCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  driverDetails: {
    marginLeft: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  driverActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contactButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
  },
  actions: {
    padding: 16,
  },
  homeButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  supportButtonText: {
    color: COLORS.primary,
    fontSize: 16,
  },
});
