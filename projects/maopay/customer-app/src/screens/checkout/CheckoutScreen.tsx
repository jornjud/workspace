import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { COLORS, PAYMENT_METHODS, DEFAULT_LOCATION } from '../../shared/constants';
import { Address } from '../../shared/types';

export default function CheckoutScreen({ route, navigation }: any) {
  const { cart, total } = route.params;
  
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    id: '1',
    label: 'บ้าน',
    detail: '123 หมู่ 5 ต.เขาค่าย อ.สะเดา จ.สงขลา',
    location: DEFAULT_LOCATION,
    isDefault: true,
  });
  const [note, setNote] = useState('');

  const handleCheckout = () => {
    // TODO: Create order in Firebase
    // Navigate to order tracking
    navigation.replace('OrderTracking', { orderId: 'new-order-id' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← กลับ</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ชำระเงิน</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 ที่อยู่จัดส่ง</Text>
          <TouchableOpacity style={styles.addressCard}>
            <View>
              <Text style={styles.addressLabel}>{deliveryAddress.label}</Text>
              <Text style={styles.addressDetail}>{deliveryAddress.detail}</Text>
            </View>
            <Text style={styles.changeText}>เปลี่ยน</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 วิธีการชำระเงิน</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                selectedPayment === method.id && styles.paymentOptionActive,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <Text style={styles.paymentIcon}>{method.icon}</Text>
              <Text style={styles.paymentLabel}>{method.label}</Text>
              <View style={[
                styles.radio,
                selectedPayment === method.id && styles.radioActive,
              ]}>
                {selectedPayment === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 หมายเหตุ</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="เพิ่มหมายเหตุให้ร้าน..."
            value={note}
            onChangeText={setNote}
            multiline
            placeholderTextColor="#999"
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 สรุปคำสั่งซื้อ</Text>
          {cart.map((item: any) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.itemQty}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>฿{item.price * item.quantity}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text>ราคาอาคาร</Text>
            <Text>฿{total - 15}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>ค่าจัดส่ง</Text>
            <Text>฿15</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>รวม</Text>
            <Text style={styles.totalValue}>฿{total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleCheckout}>
        <Text style={styles.confirmButtonText}>ยืนยันคำสั่งซื้อ ฿{total}</Text>
      </TouchableOpacity>
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  addressDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  changeText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255,107,53,0.1)',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  itemQty: {
    width: 30,
    color: COLORS.textSecondary,
  },
  itemName: {
    flex: 1,
    color: COLORS.text,
  },
  itemPrice: {
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
