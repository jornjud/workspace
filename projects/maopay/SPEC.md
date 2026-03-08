# Maopay - Technical Specification

> **Version:** 1.0.0  
> **Last Updated:** 2026-02-22  
> **Location:** ต.เขาค่าย, อ.สะเดา, จ.สงขลา

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Details |
|-------|------------|---------|
| **Mobile Apps** | React Native (Expo) | Customer, Driver, Merchant |
| **Admin Web** | React + Vercel | Management dashboard |
| **Backend** | Firebase Cloud Functions | Serverless APIs |
| **Database** | Firebase Firestore | Real-time NoSQL |
| **Auth** | Firebase Auth | Phone OTP, Google |
| **Storage** | Firebase Storage | Images, files |
| **Maps** | Google Maps SDK | Location services |
| **Payments** | TrueMoney + COD | Payment methods |
| **Notifications** | FCM | Push notifications |
| **Analytics** | Firebase Analytics | Tracking |

---

## 📊 Database Schema (Firestore)

### Collections

```
users/
├── {userId}
│   ├── phone: string
│   ├── name: string
│   ├── email: string?
│   ├── photoURL: string?
│   ├── role: "customer" | "driver" | "merchant" | "admin"
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── [role-specific fields]
│
orders/
├── {orderId}
│   ├── orderNumber: string (MAO-XXXXX)
│   ├── customerId: string
│   ├── customerName: string
│   ├── customerPhone: string
│   ├── customerAddress: geopoint
│   ├── merchantId: string
│   ├── merchantName: string
│   ├── driverId: string?
│   ├── driverName: string?
│   ├── items: array
│   │   ├── menuItemId: string
│   │   ├── name: string
│   │   ├── quantity: number
│   │   ├── price: number
│   │   ├── options: array
│   │   └── note: string?
│   ├── subtotal: number
│   ├── deliveryFee: number
│   ├── serviceFee: number
│   ├── discount: number
│   ├── total: number
│   ├── paymentMethod: "cash" | "truename" | "promptpay"
│   ├── paymentStatus: "pending" | "paid" | "failed" | "refunded"
│   ├── status: "pending" | "accepted" | "preparing" | "ready" | "picked_up" | "on_the_way" | "delivered" | "cancelled"
│   ├── statusHistory: array
│   │   ├── status: string
│   │   ├── timestamp: timestamp
│   │   └── note: string?
│   ├── deliveryAddress: string
│   ├── deliveryLocation: geopoint
│   ├── estimatedDeliveryTime: timestamp?
│   ├── actualDeliveryTime: timestamp?
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── cancelledAt: timestamp?
│   └── cancellationReason: string?
│
merchants/
├── {merchantId}
│   ├── name: string
│   ├── description: string?
│   ├── phone: string
│   ├── email: string?
│   ├── logo: string (URL)
│   ├── images: array
│   ├── address: string
│   ├── location: geopoint
│   ├── openingHours: object
│   │   ├── monday: { open: "08:00", close: "20:00" }
│   │   └── ...
│   ├── categories: array
│   │   └── { categoryId, name, ... }
│   ├── menu: array
│   │   └── { itemId, name, description, price, image, available, ... }
│   ├── minimumOrder: number
│   ├── deliveryFee: number
│   ├── deliveryRadius: number (km)
│   ├── commissionRate: number (%)
│   ├── rating: number
│   ├── totalOrders: number
│   ├── isActive: boolean
│   ├── isOpen: boolean
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
│
drivers/
├── {driverId}
│   ├── name: string
│   ├── phone: string
│   ├── photoURL: string?
│   ├── vehicleType: "motorcycle" | "car" | "bicycle"
│   ├── vehiclePlate: string
│   ├── vehicleBrand: string?
│   ├── vehicleColor: string?
│   ├── rating: number
│   ├── totalDeliveries: number
│   ├── earnings: number
│   ├── balance: number
│   ├── isOnline: boolean
│   ├── currentLocation: geopoint?
│   ├── isAvailable: boolean
│   ├── zones: array (service areas)
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
│
zones/
├── {zoneId}
│   ├── name: string
│   ├── boundaries: array (geopoints)
│   ├── baseDeliveryFee: number
│   ├── feePerKm: number
│   └── isActive: boolean
│
promotions/
├── {promotionId}
│   ├── code: string
│   ├── type: "percentage" | "fixed" | "free_delivery"
│   ├── value: number
│   ├── minimumOrder: number
│   ├── maxDiscount: number?
│   ├── usageLimit: number?
│   ├── usageCount: number
│   ├── targetUsers: array? ("all" | specific userIds)
│   ├── startDate: timestamp
│   ├── endDate: timestamp
│   ├── isActive: boolean
│   └── createdAt: timestamp
│
settings/
├── {settingId}
│   ├── appName: "Maopay"
│   ├── commissionRate: 15 (%)
│   ├── minimumDeliveryFee: 20 (฿)
│   ├── serviceFee: 3 (฿)
│   ├── maxDeliveryRadius: 10 (km)
│   ├── supportPhone: string
│   ├── supportEmail: string
│   └── ...
```

---

## 🔌 API Endpoints (Cloud Functions)

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create new order |
| GET | `/orders/{orderId}` | Get order details |
| PATCH | `/orders/{orderId}` | Update order |
| POST | `/orders/{orderId}/cancel` | Cancel order |
| POST | `/orders/{orderId}/accept` | Accept order (merchant) |
| POST | `/orders/{orderId}/ready` | Mark as ready |
| POST | `/orders/{orderId}/pickup` | Driver picked up |
| POST | `/orders/{orderId}/delivered` | Mark as delivered |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/profile` | Update profile |
| GET | `/users/{userId}` | Get user details |
| PATCH | `/users/{userId}/location` | Update location (driver) |

### Merchants

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/merchants/register` | Register new merchant |
| GET | `/merchants/{merchantId}` | Get merchant details |
| PATCH | `/merchants/{merchantId}` | Update merchant |
| POST | `/merchants/{merchantId}/menu` | Add menu item |
| PATCH | `/merchants/{merchantId}/menu/{itemId}` | Update menu item |
| DELETE | `/merchants/{merchantId}/menu/{itemId}` | Delete menu item |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/create-link` | Create TrueMoney payment link |
| POST | `/payments/webhook` | Payment callback |
| POST | `/payments/refund` | Refund payment |

### Drivers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/drivers/register` | Register as driver |
| GET | `/drivers/available` | Get available drivers |
| POST | `/drivers/{driverId}/accept` | Accept order |
| POST | `/drivers/{driverId}/earnings` | Get earnings |

---

## 🔐 Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Merchants can read/write own data
    match /merchants/{merchantId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == merchantId;
    }
    
    // Drivers can read/write own data
    match /drivers/{driverId} {
      allow read, write: if request.auth != null && request.auth.uid == driverId;
    }
    
    // Orders - complex rules
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.customerId ||
         request.auth.uid == resource.data.merchantId ||
         request.auth.uid == resource.data.driverId ||
         getUserRole(request.auth.uid) == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Public read for active merchants
    match /merchants/{merchantId} {
      allow read: if resource.data.isActive == true;
    }
  }
}
```

---

## 📱 App Configuration

### Customer App

- **Bundle ID:** com.maopay.customer
- **Name:** Maopay
- **Min SDK:** Android 21 / iOS 13

### Driver App

- **Bundle ID:** com.maopay.driver
- **Name:** Maopay Driver
- **Min SDK:** Android 21 / iOS 13

### Merchant App

- **Bundle ID:** com.maopay.merchant
- **Name:** Maopay Merchant
- **Min SDK:** Android 21 / iOS 13

---

## 🎨 Assets Required

### Icons (SVG/PNG)
- App icon (all sizes)
- Restaurant placeholder
- Food placeholder
- User placeholder
- Navigation icons
- Status icons

### Images
- Onboarding screens (3)
- Splash screen
- Empty states
- Error states

### Fonts
- Prompt (Thai language)

---

## 🧪 Testing Plan

### Unit Tests
- Utility functions
- Data transformations
- Validation

### Integration Tests
- Auth flow
- Order creation
- Payment flow

### E2E Tests
- Complete order flow
- Driver acceptance flow
- Merchant order management

---

## 📦 Build & Deploy

### Mobile Apps (Expo)
```bash
eas build -p android --profile preview
eas build -p ios --profile preview
```

### Admin Web (Vercel)
```bash
vercel --prod
```

### Firebase
```bash
firebase deploy --only functions
firebase deploy --only hosting
```

---

## 📅 Timeline

| Phase | Weeks | Deliverables |
|-------|-------|---------------|
| Phase 1 | 1-2 | Research & Planning |
| Phase 2 | 3-4 | Design (Wireframes, UI) |
| Phase 3 | 4-5 | Tech Stack Setup |
| Phase 4 | 5-10 | Development |
| Phase 5 | 11-12 | Testing |
| Phase 6 | 13-14 | Launch |

---

## 💰 Cost Estimation (Monthly)

| Service | Free Tier | Est. Cost (Scale) |
|---------|-----------|------------------|
| Firebase Auth | 10K/month | $0 |
| Firestore | 1GB | $0-50 |
| Firebase Storage | 5GB | $0-20 |
| Cloud Functions | 125K invocations | $0-50 |
| FCM | Unlimited | $0 |
| Google Maps | $200 credit/month | $0-50 |
| Vercel (Admin) | 100GB | $0-20 |
| **Total** | | **$0-190/month** |

---

## ✅ Checklist

- [x] Architecture defined
- [x] Database schema designed
- [x] API endpoints planned
- [x] Security rules outlined
- [x] App configuration set
- [x] Assets listed
- [x] Testing plan created
- [x] Cost estimation done
