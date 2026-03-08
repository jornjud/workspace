import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { COLORS } from '../../shared/constants';

const MOCK_MENU = [
  { id: '1', category: 'เมนูแนะนำ', items: [
    { id: 'm1', name: 'ก๋วยเตี๋ยวเนื้อ', price: 50, available: true },
    { id: 'm2', name: 'ก๋วยเตี๋ยวไก่', price: 45, available: true },
  ]},
  { id: '2', category: 'เครื่องดื่ม', items: [
    { id: 'm3', name: 'น้ำเย็น', price: 10, available: true },
    { id: 'm4', name: 'น้ำอุ่น', price: 15, available: false },
  ]},
];

export default function MenuScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>เมนู</Text>
      </View>

      <FlatList
        data={MOCK_MENU}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ เพิ่มหมวดหมู่</Text>
          </TouchableOpacity>
        }
        renderItem={({ item: category }) => (
          <View style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category.category}</Text>
              <TouchableOpacity>
                <Text style={styles.addItemText}>+ เพิ่มเมนู</Text>
              </TouchableOpacity>
            </View>
            {category.items.map((menuItem) => (
              <View key={menuItem.id} style={styles.menuItem}>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuName}>{menuItem.name}</Text>
                  <Text style={styles.menuPrice}>฿{menuItem.price}</Text>
                </View>
                <TouchableOpacity style={[
                  styles.toggleButton,
                  menuItem.available && styles.toggleOn,
                ]}>
                  <Text style={[
                    styles.toggleText,
                    menuItem.available && styles.toggleTextOn,
                  ]}>
                    {menuItem.available ? 'พร้อม' : 'ไม่พร้อม'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
  addButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  categorySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addItemText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  menuInfo: {},
  menuName: {
    fontSize: 16,
    color: COLORS.text,
  },
  menuPrice: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 16,
  },
  toggleOn: {
    backgroundColor: COLORS.success,
  },
  toggleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  toggleTextOn: {
    color: '#fff',
  },
});
