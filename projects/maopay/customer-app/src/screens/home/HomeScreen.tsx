import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Image, ScrollView } from 'react-native';
import { COLORS, FOOD_CATEGORIES, DEFAULT_LOCATION } from '../../shared/constants';
import { Restaurant } from '../../shared/types';

// Mock data - จะแทนที่ด้วย Firebase จริงๆ ภายหลัง
const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    merchantId: 'm1',
    name: 'ก๋วยเตี๋ยวลุงชาติ',
    description: 'ก๋วยเตี๋ยวเนื้อนุ่มๆ',
    imageUrl: 'https://via.placeholder.com/300x200',
    location: DEFAULT_LOCATION,
    address: 'ต.เขาค่าย อ.สะเดา',
    rating: 4.5,
    reviewCount: 120,
    deliveryFee: 15,
    deliveryTime: 20,
    minimumOrder: 50,
    categories: ['ก๋วยเตี๋ยว'],
    isOpen: true,
  },
  {
    id: '2',
    merchantId: 'm2',
    name: 'ข้าวมันไก่ป้าสมศรี',
    description: 'ข้าวมันไก่ต้นตำรับ',
    imageUrl: 'https://via.placeholder.com/300x200',
    location: DEFAULT_LOCATION,
    address: 'ต.เขาค่าย อ.สะเดา',
    rating: 4.8,
    reviewCount: 250,
    deliveryFee: 10,
    deliveryTime: 15,
    minimumOrder: 40,
    categories: ['ข้าวมันไก่'],
    isOpen: true,
  },
  {
    id: '3',
    merchantId: 'm3',
    name: 'น้ำปังเจ๊แป๋ม',
    description: 'น้ำปังสดใหม่ทุกวัน',
    imageUrl: 'https://via.placeholder.com/300x200',
    location: DEFAULT_LOCATION,
    address: 'ต.เขาค่าย อ.สะเดา',
    rating: 4.3,
    reviewCount: 80,
    deliveryFee: 20,
    deliveryTime: 25,
    minimumOrder: 60,
    categories: ['น้ำปัง', 'เครื่องดื่ม'],
    isOpen: true,
  },
];

export default function HomeScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>(MOCK_RESTAURANTS);

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || r.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory && r.isOpen;
  });

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity 
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('Restaurant', { restaurantId: item.id })}
    >
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/300x200' }} 
        style={styles.restaurantImage}
      />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantDesc} numberOfLines={1}>{item.description}</Text>
        <View style={styles.restaurantMeta}>
          <Text>⭐ {item.rating} ({item.reviewCount})</Text>
          <Text>🚴 {item.deliveryTime} นาที</Text>
          <Text>💰 ฿{item.deliveryFee}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.locationLabel}>📍 ตำบลเขาค่าย</Text>
          <Text style={styles.locationSub}>อำเภอสะเดา จ.สงขลา</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาร้านอาหาร..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {FOOD_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(
              selectedCategory === category ? null : category
            )}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive,
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Promotions Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>🎉 ส่งฟรี! สั่งวันนี้</Text>
      </View>

      {/* Restaurant List */}
      <Text style={styles.sectionTitle}>ร้านแนะนำ</Text>
      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />
    </ScrollView>
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
    backgroundColor: COLORS.primary,
  },
  locationLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  locationSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: COLORS.primary,
    paddingTop: 0,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.text,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  banner: {
    margin: 16,
    padding: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
  },
  bannerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 12,
    color: COLORS.text,
  },
  listContainer: {
    paddingBottom: 20,
  },
  restaurantCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#eee',
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  restaurantDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
