# CONFIG.md - Configuration & Settings

> ⚡ การตั้งค่าทั้งหมดของเปิ้ล

---

## 🌐 Timezone

| Context | Timezone |
|---------|----------|
| **Messages** | UTC |
| **Work** | ไทย (UTC+7) |
| **Premier League** | UTC → +7 = เวลาไทย **<-- จำให้ขึ้นใจ!** |

> ⚠️ ไทยไม่มี DST ตลอดปี
>
> **📌 กฎสำคัญ:** เวลา Premier League ที่ได้มาจากเว็บ = UTC เสมอ → ต้องบวก 7 ชม. = เวลาไทย

---

## ⏰ Cache Rules

| Type | Cache Time | เมื่อไหร่ใช้ |
|------|------------|--------------|
| Weather | 30 นาที | ถาม หรือ ตอนเช้า |
| Briefing | 30 นาที | ถาม หรือ ตอนเช้า |
| Calendar | 15 นาที | ถาม หรือ ตอนเช้า |
| News | ไม่ cache | ต้อง fresh |

> 💾 Cache: `/home/ple/.openclaw/workspace/.cache/cache.json`

---

## 🔗 URLs

| Service | URL |
|---------|-----|
| **Dashboard** | https://dashboard-pearl-zeta.vercel.app |
| **GitHub** | https://github.com/jornjud |
| **Gog (Google Workspace)** | /home/linuxbrew/.linuxbrew/bin/gog |

---

## 🎯 Quick Commands

| Command | คำสั่ง | หมายเหตุ |
|---------|-------|----------|
| Briefing | `ขอ briefing` | Calendar + Weather |
| News | `ขอข่าว` | สรุปข่าว |
| Reminder | `เตือนฉัน...` | ตั้ง reminder |

---

## 🌅 Morning Briefing Template

```
📅 วัน[ที่] [DD MMMM YYYY]

📆 Calendar วันนี้:
- [เวลา] [Event Name]
(หรือ "ไม่มี event")

🌤️ สภาพอากาศ ([สถานที่]):
| วัน      | อุณหภูมิ | สภาพอากาศ          |
| -------- | -------- | ------------------ |
| วันนี้   | 28-37°C  | ☀️ ท้องฟ้าแจ่มใส   |
| พรุ่งนี้ | 27-35°C  | ⛅ มีเมฆบางส่วน     |

🌅 Sunrise: 06:37 | 🌇 Sunset: 18:24

---
[ข้อความอื่นๆ]
```

---

## 🛠️ Tools

| Tool | Path |
|------|------|
| **gog** | /home/linuxbrew/.linuxbrew/bin/gog |
| **Firebase** | ~/.credentials/firebase-service-account.json |
| **GitHub** | @jornjud |

---

_Last updated: 2026-02-25_
