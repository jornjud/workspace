#!/bin/bash
# Arsenal Comprehensive Daily Briefing Script
# Sends detailed Arsenal news to user via Telegram

BOT_TOKEN="8455704218:AAHjpE_D4apMr_SgdSK--5uQ6kTJl6Tzirg"
CHAT_ID="692554068"

# Function to send message
send_message() {
    curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
        -d "chat_id=$CHAT_ID" \
        -d "text=$1" \
        -d "parse_mode=Markdown"
}

# ============ PART 1: Premier League Table ============
TABLE_MSG="🔴⚪ *ARSENAL DAILY BRIEFING* 🔴⚪
📅 $(date '+%d %b %Y')

━━━━━━━━━━━━━━━━━━━━━━

📊 *Premier League Table*
| # | Team | P | W | D | L | GD | Pts |
|---|------|---|---|---|---|-----|-----|
| *1* | *Arsenal* 🔴⚪ | 30 | 20 | 7 | 3 | +37 | *67* |
| 2 | Man City | 29 | 18 | 6 | 5 | +32 | 60 |
| 3 | Man United | 29 | 14 | 9 | 6 | +11 | 51 |
| 4 | Aston Villa | 29 | 15 | 6 | 8 | +5 | 51 |

📈 *Arsenal นำจ่าฝูง +7 แต้ม!*"

send_message "$TABLE_MSG"

# ============ PART 2: Fixtures ============
FIXTURES_MSG="━━━━━━━━━━━━━━━━━━━━━━

📅 *Upcoming Fixtures*
• 7 มี.ค. 19:15 - @ Mansfield Town (FA Cup)
• 11 มี.ค. 00:45 - @ Bayer Leverkusen (CL)
• 14 มี.ค. 20:30 - vs Everton (PL)
• 17 มี.ค. 03:00 - vs Bayer Leverkusen (CL)
• 22 มี.ค. 19:30 - vs Man City (Carabao Cup - Wembley)

📆 *Remaining PL:* 8 นัด"

send_message "$FIXTURES_MSG"

# ============ PART 3: Injury News ============
INJURY_MSG="━━━━━━━━━━━━━━━━━━━━━━

🏥 *Injury Update*
• Kai Havertz: กลับมาแล้ว ✅
• Declan Rice: พร้อมลงเล่น ✅
• Martin Odegaard: กลับมาซ้อมแล้ว
• Ben White: ยังไม่พร้อม"

send_message "$INJURY_MSG"

# ============ PART 4: Stats ============
STATS_MSG="━━━━━━━━━━━━━━━━━━━━━━

📈 *Key Stats 2025/26*
• Goals For: 59 (ที่ 2)
• Goals Against: 22 (ที่ 1 - ดีที่สุด!)
• Goal Diff: +37 (ดีที่สุด!)
• Clean Sheets: 14+
• Win Rate: 67%

🏅 *Top Scorers*
• Saka: 15+
• Havertz: 10+
• Martinelli: 8+"

send_message "$STATS_MSG"

# ============ PART 5: Match Analysis ============
ANALYSIS_MSG="━━━━━━━━━━━━━━━━━━━━━━

📝 *Last Match: Brighton 0-1 Arsenal*
✅ Saka ซัดประตูที่ 300!
✅ Clean sheet ที่ Amex Stadium
✅ กลับมานำจ่าฝูง +7 แต้ม

⚠️ *จุดปรับ:* ครองบอลช่วงที่ 2

━━━━━━━━━━━━━━━━━━━━━━

🔮 *Next Game: Mansfield Town (FA Cup)*
📊 League One - อันดับ 3
💪 *ต้องรุกตั้งแต่แรก!*

━━━━━━━━━━━━━━━━━━━━━━

🔴 *COYS! Up the Gunners!* 🔴⚪💪"

send_message "$ANALYSIS_MSG"

echo "Arsenal briefing sent at $(date)"
