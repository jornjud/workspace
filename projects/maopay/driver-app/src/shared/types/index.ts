// User Types
export type UserRole = 'customer' | 'driver' | 'merchant' | 'admin';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer extends User {
  role: 'customer';
  name?: string;
  addresses?: Address[];
  favoriteRestaurants?: string[];
}

export interface Driver extends User {
  role: 'driver';
  name: string;
  vehicleInfo?: VehicleInfo;
  isAvailable?: boolean;
  rating?: number;
}

export interface Merchant extends User {
  role: 'merchant';
  restaurantName: string;
  address?: string;
  location?: GeoPoint;
  openingHours?: OpeningHours;
  categories?: string[];
}

export interface Admin extends User {
  role: 'admin';
}

// Location Types
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Address {
  id: string;
  label: string;
  detail: string;
  location: GeoPoint;
  isDefault?: boolean;
}

export interface VehicleInfo {
  type: 'motorcycle' | 'car';
  plateNumber: string;
  color?: string;
}

export interface OpeningHours {
  [key: string]: { open: string; close: string } | null; // day: monday-sunday
}

// Restaurant & Menu Types
export interface Restaurant {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  location: GeoPoint;
  address: string;
  rating?: number;
  reviewCount?: number;
  deliveryFee: number;
  deliveryTime: number; // minutes
  minimumOrder: number;
  categories: string[];
  isOpen: boolean;
  openingHours?: OpeningHours;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  options?: MenuOption[];
}

export interface MenuOption {
  id: string;
  name: string;
  choices: { name: string; price: number }[];
  required: boolean;
  multiSelect: boolean;
}

// Order Types
export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picking_up'
  | 'on_the_way'
  | 'arrived'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'truemoney' | 'promptpay';

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
  options?: { name: string; choice: string; price: number }[];
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  driverId?: string;
  
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number
  discount: number;
  total: number;
  
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  
  deliveryAddress: Address;
  restaurantAddress: string;
  
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  pickedUpAt?: Date;
  arrivedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
}

// Payment Types
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  completedAt?: Date;
}

// Review Types
export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  restaurantId?: string;
  driverId?: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}
