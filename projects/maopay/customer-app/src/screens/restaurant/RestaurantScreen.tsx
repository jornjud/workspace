import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { COLORS } from '../../shared/constants';
import { MenuItem, MenuCategory } from '../../shared/types';

// Mock data
const MOCK_CATEGORIES: MenuCategory[] = [
  { id: 'c1', restaurantId: '1', name: 'เมนูแนะนำ', sortOrder: 1 },
  { id: 'c2', restaurantId: '1', name: 'ก๋วยเตี๋ยว', sortOrder: 2 },
  { id: 'c3', restaurantId: '1', name: 'เครื่องดื่ม', sortOrder: 3 },
];

const MOCK_MENU_ITEMS: MenuItem[] = [
  { id: 'm1', restaurantId: '1', categoryId: 'c1', name: 'ก๋วยเตี๋ยวเนื้อ', description: 'เนื้อนุ่ม ซุปเข้มข้น', price: 50, isAvailable: true },
  { id: 'm2', restaurantId: '1', categoryId: 'c1', name: 'ก๋วยเตี๋ยวไก่', description: 'ไก่สดใหม่', price: 45, isAvailable: true },
  { id: 'm3', restaurantId: '1', categoryId: 'c2', name: 'ก๋วยเตี๋ยวเนื้อต้ม', price: 50, isAvailable: true },
  { id: 'm4', restaurantId: '1', categoryId: 'c2', name: 'ก๋วยเตี๋ยวเนื้อแห้ง', price: 55, isAvailable: true },
  { id: 'm5', restaurantId: '1', categoryId: 'c3', name: 'น้ำเย็น', price: 10, isAvailable: true },
  { id: 'm6', restaurantId: '1', categoryId: 'c3', name: 'น้ำอุ่น', price: 15, isAvailable: true },
];

interface CartItem extends MenuItem {
  quantity: number;
}

export default function RestaurantScreen({ route, navigation }: any) {
  const { restaurantId } = route.params;
  const [selectedCategory, setSelectedCategory] = useState(MOCK_CATEGORIES[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);

  const menuItems = MOCK_MENU_ITEMS.filter((item) => item.categoryId === selectedCategory);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.id !== itemId);
    });
  };

  return (
    <View style={styles.container}>
      {/* Restaurant Header */}
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/400x200' }} 
          style={styles.headerImage}
        />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Restaurant Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.restaurantName}>ก๋วยเตี๋ยวลุงชาติ</Text>
        <Text style={styles.restaurantDesc}>ก๋วยเตี๋ยวเนื้อนุ่มๆ ต้นตำรับ</Text>
        <View style={styles.metaRow}>
          <Text>⭐ 4.5 (120 รีวิว)</Text>
          <Text>🚴 20 นาที</Text>
          <Text>💰 ฿15</Text>
        </View>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {MOCK_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive,
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Menu Items */}
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.menuList}
        renderItem={({ item }) => (
          <View style={styles.menuItem}>
            <View style={styles.menuInfo}>
              <Text style={styles.menuName}>{item.name}</Text>
              <Text style={styles.menuDesc}>{item.description}</Text>
              <Text style={styles.menuPrice}>฿{item.price}</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => addToCart(item)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Cart Floating Button */}
      {cartCount > 0 && (
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart', { cart })}
        >
          <View style={styles.cartCount}>
            <Text style={styles.cartCountText}>{cartCount}</Text>
          </View>
          <Text style={styles.cartButtonText}>ดูตะกร้า</Text>
          <Text style={styles.cartTotal}>฿{cartTotal}</Text>
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
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  restaurantDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    color: COLORS.textSecondary,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.text,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  menuList: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
  },
  cartCount: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartTotal: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
