import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { COLORS } from '../../shared/constants';
import { MenuItem } from '../../shared/types';

interface CartItem extends MenuItem {
  quantity: number;
}

export default function CartScreen({ route, navigation }: any) {
  const cartItems: CartItem[] = route.params?.cart || [];
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 15;
  const discount = appliedPromo ? subtotal * 0.1 : 0;
  const total = subtotal + deliveryFee - discount;

  const updateQuantity = (itemId: string, delta: number) => {
    // This would update the cart state in a real app
  };

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'MAOPAY10') {
      setAppliedPromo('MAOPAY10');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← กลับ</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ตะกร้าสินค้า</Text>
        <View style={{ width: 50 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyText}>ตะกร้าว่างเปล่า</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.shopButtonText}>ไปหาร้าน</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Cart Items */}
          <View style={styles.section}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>฿{item.price}</Text>
                </View>
                <View style={styles.quantityControl}>
                  <TouchableOpacity style={styles.qtyButton}>
                    <Text style={styles.qtyButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyButton}>
                    <Text style={styles.qtyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Promo Code */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>โค้ดส่วนลด</Text>
            <View style={styles.promoRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="ใส่โค้ด..."
                value={promoCode}
                onChangeText={setPromoCode}
                placeholderTextColor="#999"
              />
              <TouchableOpacity 
                style={styles.promoButton}
                onPress={applyPromo}
              >
                <Text style={styles.promoButtonText}>ใช้โค้ด</Text>
              </TouchableOpacity>
            </View>
            {appliedPromo && (
              <Text style={styles.appliedPromo}>✓ ใช้โค้ด {appliedPromo} ส่วนลด 10%</Text>
            )}
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>สรุปคำสั่งซื้อ</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>ราคาอาหาร</Text>
              <Text style={styles.summaryValue}>฿{subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>ค่าจัดส่ง</Text>
              <Text style={styles.summaryValue}>฿{deliveryFee}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ส่วนลด</Text>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                  -฿{discount}
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>รวมทั้งหมด</Text>
              <Text style={styles.totalValue}>฿{total}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Checkout Button */}
      {cartItems.length > 0 && (
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout', { cart: cartItems, total })}
        >
          <Text style={styles.checkoutButtonText}>สั่งซื้อ ฿{total}</Text>
        </TouchableOpacity>
      )}
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
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  shopButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: COLORS.text,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    fontSize: 18,
    color: COLORS.primary,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  promoRow: {
    flexDirection: 'row',
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  promoButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  promoButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  appliedPromo: {
    color: COLORS.success,
    marginTop: 8,
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
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
  checkoutButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
