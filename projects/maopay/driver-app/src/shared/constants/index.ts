// App Configuration
export const APP_NAME = 'Maopay';
export const APP_SLOGAN = 'อาหารส่งถึงมือ ทุกมื้อสะดวก';

// Location - Khao Cha Kai, Sadao, Songkhla
export const DEFAULT_LOCATION = {
  latitude: 6.9088,
  longitude: 100.4294,
};

export const SERVICE_AREA = {
  radius: 10, // km
};

// Categories
export const FOOD_CATEGORIES = [
  'อาหารตามสั่ง',
  'ก๋วยเตี๋ยว',
  'ข้าวมันไก่',
  'น้ำปัง',
  'ขนม',
  'เครื่องดื่ม',
  'พิซซ่า',
  'อื่นๆ',
];

// Colors (from Brand Identity)
export const COLORS = {
  primary: '#FF6B35',
  secondary: '#2E4057',
  accent: '#F7C548',
  success: '#4CAF50',
  error: '#E74C3C',
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
};

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  CUSTOMERS: 'customers',
  DRIVERS: 'drivers',
  MERCHANTS: 'merchants',
  RESTAURANTS: 'restaurants',
  MENU_CATEGORIES: 'menuCategories',
  MENU_ITEMS: 'menuItems',
  ORDERS: 'orders',
  PAYMENTS: 'payments',
  REVIEWS: 'reviews',
};

// Order Status Labels
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'รอการยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  preparing: 'กำลังเตรียม',
  ready: 'พร้อมส่ง',
  picking_up: 'กำลังไปรับ',
  on_the_way: 'กำลังส่ง',
  arrived: 'ถึงแล้ว',
  completed: 'เสร็จสมบูรณ์',
  cancelled: 'ยกเลิก',
};

// Payment Methods
export const PAYMENT_METHODS = [
  { id: 'cash', label: 'เงินสด', icon: '💵' },
  { id: 'truemoney', label: 'TrueMoney', icon: '💳' },
  { id: 'promptpay', label: 'PromptPay', icon: '📱' },
];
