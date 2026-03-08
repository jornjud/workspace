# 🎯 Workspace README

## 📁 โครงสร้าง

```
workspace/
├── projects/          # โปรเจกต์ทั้งหมด
│   ├── qrmember-react/
│   └── qrmember-v2/
├── dashboard/         # Ple's Dashboard (HTML)
├── memory/           # หน่วยความจำ (notes, schedules)
├── avatars/          # รูปภาพ avatar
├── skills/           # Local skills (gog)
│
├── AGENTS.md         # กฎเกณฑ์ workspace
├── HEARTBEAT.md      # Dashboard + Active missions
├── IDENTITY.md       # ข้อมูลตัวเปิ้ล
├── SOUL.md           # บุคลิกภาพ
├── TOOLS.md          # Tools + Skills + Credentials
├── USER.md           # ข้อมูลพี่เหมา
└── .gitignore        # Git ignore rules
```

## 🚀 Quick Commands

| คำสั่ง | ความหมาย |
|--------|----------|
| `ขอ briefing` | สรุปวัน (Calendar + Weather + Todos) |
| `ขอข่าว` | สรุปข่าวล่าสุด |
| `backup` | Backup ไป GitHub |

## 📋 Active Missions

- Auto Backup: GitHub (ทุก 6 ชม.)

## 🆕 Installed Skills

- briefing, news-summary, social-media-scheduler, reminder, automation-workflows

## 💾 Backup & Restore

### ⚠️ ก่อน restore - ต้องทำขั้นตอนนี้ก่อน!

```
1. SSH เข้า VPS
2. cd เข้าโฟลเดอร์ workspace (ที่มี .git)
3. ตรวจสอบว่า remote ถูกต้อง:
   git remote -v
   → ควรเห็น origin เป็น URL ของ repo
```

ถ้ายังไม่มี repo ใน VPS → clone ก่อน:
```bash
git clone <repo-url>
cd <ชื่อโฟลเดอร์>
```

---

### 📤 สำรองข้อมูล (Backup)
```bash
git add -A
git commit -m "Backup: $(date -u +%Y-%m-%d_%H:%M UTC)"
git push origin master
```

### 📥 กู้คืน (Restore)
```bash
# 1. ดู status ก่อน
git status

# 2. กู้คืนไฟล์ทั้งหมดจาก remote
git restore .

# 3. กู้คืนไฟล์เฉพาะ (ถ้าต้องการ)
git restore <path-to-file>
```

**หมายเหตุ:** `git restore .` จะกู้จาก branch ปัจจุบันที่ local (เช่น master/main)

## 📅 Last Updated

2026-02-23
