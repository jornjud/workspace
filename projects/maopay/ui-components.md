# Maopay - UI Components Library

## 🎨 Design Tokens

### Colors
```css
:root {
  /* Primary */
  --color-primary: #FF6B35;
  --color-primary-light: #FF8F66;
  --color-primary-dark: #E55520;
  
  /* Secondary */
  --color-secondary: #2E4057;
  --color-secondary-light: #4A6278;
  --color-secondary-dark: #1A2533;
  
  /* Accent */
  --color-accent: #F7C548;
  --color-accent-light: #FFD666;
  --color-accent-dark: #D4A530;
  
  /* Status */
  --color-success: #4CAF50;
  --color-success-light: #81C784;
  --color-error: #E74C3C;
  --color-error-light: #EF9A9A;
  --color-warning: #FFC107;
  --color-info: #2196F3;
  
  /* Neutral */
  --color-white: #FFFFFF;
  --color-gray-50: #F5F5F5;
  --color-gray-100: #EEEEEE;
  --color-gray-200: #E0E0E0;
  --color-gray-300: #BDBDBD;
  --color-gray-400: #9E9E9E;
  --color-gray-500: #757575;
  --color-gray-600: #616161;
  --color-gray-700: #424242;
  --color-gray-800: #212121;
  --color-black: #1A1A1A;
  
  /* Text */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #666666;
  --color-text-disabled: #9E9E9E;
  --color-text-inverse: #FFFFFF;
  
  /* Background */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F5F5F5;
  --color-bg-overlay: rgba(0, 0, 0, 0.5);
}
```

### Typography
```css
/* Font Family */
--font-family: 'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Sizes */
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 28px;
--font-size-4xl: 32px;

/* Font Weights */
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Line Heights */
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Spacing
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;
--spacing-2xl: 24px;
--spacing-3xl: 32px;
--spacing-4xl: 40px;
--spacing-5xl: 48px;
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 20px;
--radius-full: 9999px;
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
--shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);
```

---

## 🧩 Components

### 1. Buttons

```
┌─────────────────────────────────────┐
│ Primary Button                      │
│ [      สั่งอาหาร      ]           │
│ bg: #FF6B35, text: white           │
│ hover: #E55520                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Secondary Button                     │
│ [      ยกเลิก       ]              │
│ bg: #F5F5F5, text: #2E4057         │
│ border: 1px solid #E0E0E0           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Outline Button                      │
│ [      เพิ่มเติม     ]            │
│ bg: transparent, border: #FF6B35    │
│ text: #FF6B35                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Icon Button                         │
│  [+ ]  [ 🔍 ]  [ 🗑️ ]            │
│  40x40px, radius: 8px              │
└─────────────────────────────────────┘
```

### 2. Input Fields

```
┌─────────────────────────────────────┐
│ Text Input                          │
│ เบอร์โทรศัพท์                      │
│ ┌─────────────────────────┐         │
│ │ 0xx-xxx-xxxx          │         │
│ └─────────────────────────┘         │
│ border: 1px solid #E0E0E0          │
│ focus: border #FF6B35              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Search Input                        │
│ ┌─────────────────────────┐         │
│ │ 🔍 ค้นหาร้านอาหาร...  │         │
│ └─────────────────────────┘         │
│ bg: #F5F5F5, radius: 8px          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Textarea                           │
│ ┌─────────────────────────┐         │
│ │ หมายเหตุ...           │         │
│ │                        │         │
│ └─────────────────────────┘         │
│ min-height: 80px                    │
└─────────────────────────────────────┘
```

### 3. Cards

```
┌─────────────────────────────────────┐
│ Restaurant Card                     │
│ ┌─────┐                            │
│ │ 📷  │  ชื่อร้าน                  │
│ │     │  ⭐4.5 · 2.5กม · 25นาที   │
│ └─────┘  ประเภท · ราคา             │
│ ─────────────────────────────────  │
│ ✓ Available, 120 orders            │
└─────────────────────────────────────┘
│ radius: 12px, shadow: md           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Menu Item Card                      │
│ ┌─────┐                            │
│ │ 📷  │  ชื่อเมนู                  │
│ │     │  ฿40                       │
│ └─────┘  [+]                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Order Card                          │
│ #MAO12345 · 10:30 น.               │
│ ร้านก๋วยเตี๋ยวลุง                 │
│ ฿120 · ✅ สำเร็จ                  │
└─────────────────────────────────────┘
```

### 4. Badges & Tags

```
┌─────────────────────────────────────┐
│ Status Badges                       │
│                                     │
│  ✅ สำเร็จ      🟢 ปกติ            │
│  🔥 กำลังปรุง  🟡 รอ               │
│  ❌ ยกเลิก    🔴 ปิด               │
│                                     │
│ Tag Badges                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ │
│  │ 🎉โปร│ │ ⭐ดัง│ │ 🆕ใหม่│ │
│  └────────┘ └────────┘ └────────┘ │
└─────────────────────────────────────┘
```

### 5. Bottom Navigation

```
┌─────────────────────────────────────┐
│                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│  │🏠 │ │🔍 │ │🛒 │ │👤 │    │
│  │Home│ │Search│ │Cart│ │Profile││
│  └────┘ └────┘ └────┘ └────┘    │
│                                     │
│  Active: color: #FF6B35            │
│  Inactive: color: #9E9E9E          │
└─────────────────────────────────────┘
```

### 6. Bottom Sheet

```
┌─────────────────────────────────────┐
│ ═══════════════ (drag handle)       │
│                                     │
│  📋 ตัวเลือก                       │
│  ─────────────────────────          │
│  ○ ตัวเลือก 1                      │
│  ○ ตัวเลือก 2                      │
│  ○ ตัวเลือก 3                      │
│                                     │
│  [    ยืนยัน    ]                   │
└─────────────────────────────────────┘
│ bg: white, radius: 20px top        │
└─────────────────────────────────────┘
```

### 7. Modal

```
┌─────────────────────────────────────┐
│         ╳ (close)                  │
│                                     │
│     ⚠️ ยืนยันการทำ               │
│                                     │
│   คุณต้องการยืนยัน                 │
│   การสั่งซื้อนี้ใช่หรือไม่?        │
│                                     │
│  [❌ ยกเลิก]    [✅ ยืนยัน]         │
└─────────────────────────────────────┘
│ overlay: rgba(0,0,0,0.5)           │
└─────────────────────────────────────┘
```

### 8. Toast / Snackbar

```
┌─────────────────────────────────────┐
│ ✓ สั่งอาหารสำเร็จ!                 │
│ คำสั่งซื้อ #MAO12345               │
└─────────────────────────────────────┘
│ Success: #4CAF50, 3s auto-dismiss  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ⚠️ กรุณาเลือกที่อยู่จัดส่ง       │
└─────────────────────────────────────┘
│ Warning: #FFC107                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ❌ เกิดข้อผิดพลาด                 │
│ กรุณาลองใหม่อีกครั้ง              │
└─────────────────────────────────────┘
│ Error: #E74C3C                     │
└─────────────────────────────────────┘
```

### 9. Loading States

```
┌─────────────────────────────────────┐
│ Skeleton Loading                    │
│ ┌────┐ ┌────────────────────┐       │
│ │ ▒▒▒│ │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│       │
│ └────┘ └────────────────────┘       │
│ ┌────┐ ┌────────────────────┐       │
│ │ ▒▒▒│ │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│       │
│ └────┘ └────────────────────┘       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Spinner                             │
│            ◐                       │
│         Loading...                  │
└─────────────────────────────────────┘
│ color: #FF6B35                     │
└─────────────────────────────────────┘
```

### 10. Map Components

```
┌─────────────────────────────────────┐
│ [Map View]                         │
│                                     │
│    📍                              │
│    🚗 ──────── → 📍               │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 📍 ต.เขาค่าย, สะเดา        │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 📏 Spacing System

```
xs: 4px    █
sm: 8px    ██
md: 12px   ███
lg: 16px   ████
xl: 20px   █████
2xl: 24px  ██████
3xl: 32px  █████████
```

---

## 🧪 States

### Button States
```
Default    Hover    Active    Disabled
───────    ─────    ─────    ─────────
[Button]   [Button] [Button] [Button]
bg:#FF6B35 bg:#E55520 bg:#CC4D1A bg:#F5F5F5
```

### Input States
```
Default       Focus         Error         Disabled
─────────    ─────────    ──────────   ──────────
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│         │ │         │ │         │ │         │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
border:#E0E0E0 border:#FF6B35 border:#E74C3C bg:#F5F5F5
```

---

## ✅ Checklist

- [x] Colors
- [x] Typography
- [x] Spacing
- [x] Border Radius
- [x] Shadows
- [x] Buttons
- [x] Inputs
- [x] Cards
- [x] Badges
- [x] Navigation
- [x] Bottom Sheet
- [x] Modal
- [x] Toast
- [x] Loading
- [x] Map
