import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { COLORS } from '../../shared/constants';

const MENU_ITEMS = [
  { icon: '🏪', label: 'ข้อมูลร้าน' },
  { icon: '🕐', label: 'เวลาเปิด-ปิด' },
  { icon: '🚴', label: 'การจัดส่ง' },
  { icon: '💰', label: 'ค่าจัดส่งขั้นต่ำ' },
  { icon: '🔔', label: 'การแจ้งเตือน' },
  { icon: '❓', label: 'ช่วยเหลือ' },
];

export default function SettingsScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>การตั้งค่า</Text>
      </View>

      {/* Restaurant Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>ก</Text>
        </View>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>ก๋วยเตี๋ยวลุงชาติ</Text>
          <Text style={styles.restaurantAddress}>123 ถ.สะเดา ต.เขาค่าย</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text>แก้ไข</Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>สถานะร้าน</Text>
        <Switch
          value={true}
          trackColor={{ false: '#ccc', true: COLORS.success }}
        />
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => navigation.replace('Login')}
      >
        <Text style={styles.logoutText}>ออกจากระบบ</Text>
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
    backgroundColor: COLORS.primary,
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  restaurantAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  editButton: {
    padding: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  menuSection: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  menuArrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '600',
  },
});
