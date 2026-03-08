# 🎨 Maopay - Phase 2: ออกแบบ (Design)

> **พื้นที่:** ตำบลเขาค่าย อำเภอสะเดา จ.สงขลา

---

## 📱 Apps ที่ต้องออกแบบ

| # | App | Users | Platform |
|---|-----|-------|----------|
| 1 | **Customer App** | ลูกค้าสั่งอาหาร | Mobile (iOS/Android) |
| 2 | **Driver App** | คนขับรถส่งอาหาร | Mobile (iOS/Android) |
| 3 | **Merchant App** | ร้านอาหาร | Mobile / Web |
| 4 | **Admin Panel** | เจ้าของแอป | Web |

---

## 🎨 Brand Identity

### Color Palette

| Color | Hex | ใช้งาน |
|-------|-----|--------|
| **Primary** | #FF6B35 |, Acc Buttonsents (ส้มสดใส, ความหิว) |
| **Secondary** | #2E4057 | Text, Headers (เทาเข้ม, มืออาชีพ) |
| **Accent** | #F7C548 | Highlights, Badges (ทอง, ความพิเศษ) |
| **Success** | #4CAF50 | Success states (เขียว, สำเร็จ) |
| **Error** | #E74C3C | Error states (แดง, ผิดพลาด) |
| **Background** | #FFFFFF / #F5F5F5 | Light mode |
| **Text** | #1A1A1A / #666666 | Primary / Secondary text |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| **Headings** | Prompt | 24-32px | 700 |
| **Body** | Prompt | 14-16px | 400 |
| **Button** | Prompt | 14-16px | 600 |
| **Caption** | Prompt | 12px | 400 |

### Logo Concept

```
[Icon: จานอาหาร + รถส่งของ / เคลื่อนไหว]
Text: "Maopay" (เหมาจ่าย)
Slogan: "อาหารส่งถึงมือ ทุกมื้อสะดวก"
```

---

## 📐 Wireframes - Customer App

### 1. Splash Screen
- Logo Maopay
- Tagline: "อาหารส่งถึงมือ ทุกมื้อสะดวก"

### 2. Onboarding (3 screens)
- Screen 1: สั่งอาหารง่าย
- Screen 2: ติดตามออเดอร์เรียลไทม์
- Screen 3: รับอาหารที่หน้าบ้าน

### 3. Login/Register
- Phone number input (OTP)
- Google Sign-in
- Terms & Conditions

### 4. Home Screen
- **Header:** Location (ตำบลเขาค่าย), Search bar
- **Categories:** อาหารตามสั่ง, ก๋วยเตี๋ยว, ข้าวมันไก่, น้ำปัง, ขนม, เครื่องดื่ม
- **Promotions:** Banner carousel
- **Recommended:** ร้านแนะนำ
- **Nearby:** ร้านใกล้คุณ
- **Bottom Nav:** Home, Search, Orders, Profile

### 5. Restaurant Detail
- Restaurant banner + Rating
- Name, Distance, Delivery time
- Menu categories (tabs)
- Menu items (image, name, price, Add button)
- Cart floating button

### 6. Cart
- List of items + quantity
- Special instructions
- Apply coupon
- Delivery fee
- Total price
- Checkout button

### 7. Checkout
- Delivery address (map picker)
- Payment method (Cash, TrueMoney, PromptPay)
- Order summary
- Confirm button

### 8. Order Tracking
- Map with driver location
- Order status: Preparing → Picking up → On the way → Arrived
- Driver info (name, photo, phone)
- Call/Chat driver buttons

### 9. Order History
- List of past orders
- Status: Completed, Cancelled
- Reorder button

### 10. Profile
- User info
- Addresses
- Payment methods
- Favorite restaurants
- Help & Support
- Settings

---

## 📐 Wireframes - Driver App

### 1. Login
- Phone number + OTP

### 2. Dashboard (Main)
- Earnings today
- Available/Offline toggle
- New order requests (accept/reject)
- Today's orders

### 3. Order Details
- Pickup location (map)
- Customer location (map)
- Customer info
- Item list
- Call/Chat buttons
- Complete pickup
- Complete delivery

### 4. Earnings
- Today's earnings
- Weekly/Monthly summary
- Withdraw button

### 5. Profile
- Driver info
- Vehicle info
- Ratings
- Settings

---

## 📐 Wireframes - Merchant App

### 1. Login
- Phone number + OTP

### 2. Dashboard
- Today's orders
- Revenue today
- Active menu items

### 3. Order Management
- New orders (accept/reject)
- In progress
- Ready for pickup
- Completed

### 4. Menu Management
- Categories (add/edit/delete)
- Items (add/edit/delete, toggle availability)
- Prices
- Images
- Options/Add-ons

### 5. Restaurant Settings
- Restaurant info
- Opening hours
- Delivery settings
- Minimum order

### 6. Analytics
- Sales today/week/month
- Popular items
- Customer ratings

---

## 📐 Wireframes - Admin Panel

### 1. Dashboard
- Total orders
- Total revenue
- Active users (customers, drivers, merchants)
- Recent orders

### 2. User Management
- Customer list
- Driver list
- Merchant list
- Approve/Block users

### 3. Order Management
- All orders
- Filter by status
- View details

### 4. Menu/Restaurant Management
- All restaurants
- Approve new restaurants
- Edit/Delete

### 5. Promotions
- Create coupons
- Banner management

### 6. Reports & Analytics
- Revenue reports
- User growth
- Order statistics

### 7. Settings
- App settings
- Commission rates
- Delivery zones

---

## 🖌️ UI Components

### Common Components

| Component | Description |
|-----------|-------------|
| **Button** | Primary (orange), Secondary (gray), Outline |
| **Input** | Text, Phone, Search, Password |
| **Card** | Restaurant, Menu Item, Order |
| **Badge** | Promotion, New, Popular |
| **Bottom Sheet** | Filters, Payment options |
| **Modal** | Confirmations, Alerts |
| **Toast** | Success, Error, Info |
| **Skeleton** | Loading states |
| **Map** | Location picker, Tracking |

### Icons (Using Material Icons / Phosphor)

- Home, Search, Cart, Profile
- Restaurant, Food, Drink
- Location, Map, Navigation
- Phone, Chat, Camera
- Clock, Timer
- Star, Heart, Bookmark
- Plus, Minus, Delete, Edit
- Check, Close, Arrow

---

## 📱 Screen Flow Diagram

```
Customer App:
Splash → Onboarding → Login → Home → Restaurant → Cart → Checkout → Tracking → Profile

Driver App:
Login → Dashboard → Order → Pickup → Delivery → Complete → Dashboard

Merchant App:
Login → Dashboard → Orders → Menu → Settings

Admin Panel:
Login → Dashboard → Users/Orders/Merchants → Reports
```

---

## ✅ Phase 2 Checklist

| # | Task | Status |
|---|------|--------|
| 2.1 | ✅ Brand Identity (Colors, Fonts, Logo) | ✅ เสร็จ |
| 2.2 | ✅ Customer App Wireframes (10 screens) | ✅ เสร็จ |
| 2.3 | ✅ Driver App Wireframes (7 screens) | ✅ เสร็จ |
| 2.4 | ✅ Merchant App Wireframes (7 screens) | ✅ เสร็จ |
| 2.5 | ✅ Admin Panel Wireframes (8 screens) | ✅ เสร็จ |
| 2.6 | ✅ UI Components Library | ✅ เสร็จ |
| 2.7 | ✅ Screen Flow Diagram | ✅ เสร็จ |

---

## 📋 Phase 3: Tech Stack

| # | หมวด | เลือก | เหตุผล |
|---|------|-------|----------|
| 3.1 | **Frontend** | React Native (Expo) | Cross-platform (iOS/Android), เริ่มง่าย |
| 3.2 | **Backend** | Firebase Cloud Functions | Serverless, Auto-scale |
| 3.3 | **Database** | Firebase Firestore | Real-time, Free tier |
| 3.4 | **Authentication** | Firebase Auth | Phone OTP, Google, Apple |
| 3.5 | **Maps** | Google Maps SDK | แม่นยำ, ครอบคลุม |
| 3.6 | **Payments** | TrueMoney + Cash on Delivery | คนไทยคุ้นเคย |
| 3.7 | **Notifications** | Firebase Cloud Messaging | Free, Real-time |
| 3.8 | **Storage** | Firebase Storage | เก็บรูปภาพ |
| 3.9 | **Hosting** | Firebase Hosting | Free tier, SSL |
| 3.10 | **Analytics** | Firebase Analytics | ฟรี |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        MAOPAY ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │   Customer App     │
                    │  (React Native)   │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │   Driver App       │
                    │  (React Native)   │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │   Merchant App     │
                    │  (React Native)   │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │   Admin Web        │
                    │  (React + Vercel) │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  Firebase Services  │
                    │  ┌───────────────┐  │
                    │  │ Cloud Funcs   │  │
                    │  │ (Backend)     │  │
                    │  └───────┬───────┘  │
                    │          │          │
                    │  ┌──────▼──────┐   │
                    │  │  Firestore   │   │
                    │  │ (Database)   │   │
                    │  └──────┬──────┘   │
                    │          │          │
                    │  ┌──────▼──────┐   │
                    │  │   Storage   │   │
                    │  │  (Images)   │   │
                    │  └─────────────┘   │
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
     ┌────────▼────┐  ┌──────▼──────┐  ┌─────▼─────┐
     │ TrueMoney   │  │   Google    │  │   Email   │
     │  Payment    │  │    Maps     │  │  (SendGrid)│
     └─────────────┘  └─────────────┘  └───────────┘
```

### Project Structure

```
maopay/
├── apps/
│   ├── customer-app/      # React Native (Expo)
│   ├── driver-app/        # React Native (Expo)
│   ├── merchant-app/     # React Native (Expo)
│   └── admin-web/        # React + Vercel
│
├── functions/             # Firebase Cloud Functions
│   ├── src/
│   │   ├── orders/       # Order management
│   │   ├── users/        # User management
│   │   ├── payments/     # Payment processing
│   │   └── notifications/
│   │
├── shared/
│   ├── types/           # TypeScript types
│   ├── constants/       # App constants
│   └── utils/           # Utility functions
│
└── docs/
    ├── PLAN.md
    ├── wireframes-*.md
    ├── ui-components.md
    └── screen-flow.md
```

### Phase 3 Checklist

| # | Task | Status |
|---|------|--------|
| 3.1 | ✅ Frontend: React Native (Expo) | ✅ เลือกแล้ว |
| 3.2 | ✅ Backend: Firebase Cloud Functions | ✅ เลือกแล้ว |
| 3.3 | ✅ Database: Firestore | ✅ เลือกแล้ว |
| 3.4 | ✅ Auth: Firebase Auth | ✅ เลือกแล้ว |
| 3.5 | ✅ Maps: Google Maps | ✅ เลือกแล้ว |
| 3.6 | ✅ Payments: TrueMoney + COD | ✅ เลือกแล้ว |
| 3.7 | ✅ Notifications: FCM | ✅ เลือกแล้ว |
| 3.8 | ✅ Storage: Firebase Storage | ✅ เลือกแล้ว |
| 3.9 | ✅ Hosting: Firebase Hosting | ✅ เลือกแล้ว |
| 3.10 | ✅ Analytics: Firebase Analytics | ✅ เลือกแล้ว |

---

## ✅ Sprint 2: Customer App Core - เสร็จสมบูรณ์!

| # | Task | Status |
|---|------|--------|
| 4.7 | ✅ Home screen (restaurant list) | ✅ เสร็จ |
| 4.8 | ✅ Restaurant detail screen | ✅ เสร็จ |
| 4.9 | ✅ Menu & Cart functionality | ✅ เสร็จ |
| 4.10 | ✅ Checkout & Payment | ✅ เสร็จ |
| 4.11 | ✅ Order tracking | ✅ เสร็จ |

---

## 📋 Sprint 3-4: Driver App

| # | Task | Status |
|---|------|--------|
| 4.12 | ✅ Driver dashboard | ✅ เสร็จ |
| 4.13 | ✅ Order request handling | ✅ เสร็จ |
| 4.14 | ✅ Map & navigation | ✅ เสร็จ |
| 4.15 | ✅ Earnings & wallet | ✅ เสร็จ |

---

## 📋 Sprint 5-6: Merchant App

| # | Task | Status |
|---|------|--------|
| 4.16 | ✅ Merchant dashboard | ✅ เสร็จ |
| 4.17 | ✅ Order management | ✅ เสร็จ |
| 4.18 | ✅ Menu management | ✅ เสร็จ |
| 4.19 | ✅ Restaurant settings | ✅ เสร็จ |

---

## ✅ Sprint 7-8: Admin Panel - เสร็จสมบูรณ์!

| # | Task | Status |
|---|------|--------|
| 4.20 | ✅ Admin dashboard | ✅ เสร็จ |
| 4.21 | ✅ User management | ✅ เสร็จ |
| 4.22 | ✅ Order management | ✅ เสร็จ |
| 4.23 | ✅ Merchant/Driver management | ✅ เสร็จ |
| 4.24 | ✅ Settings | ✅ เสร็จ |

---

## 📋 Sprint 9-10: Backend & APIs

| # | Task | Status |
|---|------|--------|
| 4.25 | ✅ Cloud Functions (APIs) | ✅ เสร็จ |
| 4.26 | ✅ Push notifications (FCM) | ✅ เสร็จ |
| 4.27 | ✅ Payment integration | ✅ เสร็จ |

---

## ✅ Sprint 11-12: Testing & Launch Prep - เสร็จสมบูรณ์!

| # | Task | Status |
|---|------|--------|
| 4.28 | ✅ Testing Plan | ✅ เสร็จ |
| 4.29 | ✅ App Config (app.json) | ✅ เสร็จ |
| 4.30 | ✅ Deployment Scripts | ✅ เสร็จ |

---

## 🎉 Maopay - Ready for Launch!

---

## 📝 Notes

- **Created:** 2026-02-21
- **Location:** ตำบลเขาค่าย อำเภอสะเดา จ.สงขลา
- **Target:** คนในพื้นที่ + ร้านอาหารท้องถิ่น

---

> 💋 "ออกแบบดี สำเร็จครึ่งเดียว!"
