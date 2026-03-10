#!/bin/bash
# Arsenal Daily Briefing - Optimized with RSS + State Tracking
# Only sends when there's genuinely new news

BOT_TOKEN="8455704218:AAHjpE_D4apMr_SgdSK--5uQ6kTJl6Tzirg"
CHAT_ID="692554068"
STATE_FILE="/tmp/arsenal-state.json"
RSS_URL="https://feeds.bbci.co.uk/sport/football/teams/arsenal/rss.xml"

# Function to send message
send_message() {
    curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
        -d "chat_id=$CHAT_ID" \
        -d "text=$1" \
        -d "parse_mode=Markdown"
}

# Fetch latest news from RSS
RSS_DATA=$(curl -s "$RSS_URL" 2>/dev/null)

# Extract latest 3 news titles (skip first which is channel title)
NEWS_TITLES=$(echo "$RSS_DATA" | grep -oP '(?<=<title><!\[CDATA\[)[^]]+(?=\]\]></title>)' | tail -n +2 | head -3)

NEWS_1=$(echo "$NEWS_TITLES" | sed -n '1p')
NEWS_2=$(echo "$NEWS_TITLES" | sed -n '2p')
NEWS_3=$(echo "$NEWS_TITLES" | sed -n '3p')

# Get today's date string
TODAY_STR=$(date '+%Y-%m-%d')

# ============ LOAD PREVIOUS STATE ============
if [ -f "$STATE_FILE" ]; then
    LAST_DATE=$(jq -r '.lastDate' "$STATE_FILE" 2>/dev/null)
    LAST_NEWS_1=$(jq -r '.lastNews1' "$STATE_FILE" 2>/dev/null)
else
    LAST_DATE=""
    LAST_NEWS_1=""
fi

# ============ DETERMINE WHAT TO SEND ============

# If first run ever
if [ -z "$LAST_DATE" ]; then
    MSG="🔴⚪ *ARSENAL DAILY* $(date '+%d %b')

━━━━━━━━━━━━━━━━━━━━━━

📰 *ข่าวล่าสุด*
• $NEWS_1
• $NEWS_2

📊 *PL Table:* Arsenal 67pts (1st)

📅 *แมตช์ถัดไป:* Today vs Brighton

━━━━━━━━━━━━━━━━━━━━━━

🔴 *COYS!* 🔴⚪"
    
    send_message "$MSG"
    echo "{\"lastDate\":\"$TODAY_STR\",\"lastNews1\":\"$NEWS_1\"}" > "$STATE_FILE"
    echo "First run - sent initial briefing"
    exit 0
fi

# If already sent today - check if headline news actually changed
if [ "$LAST_DATE" = "$TODAY_STR" ]; then
    if [ "$NEWS_1" != "$LAST_NEWS_1" ]; then
        # News headline changed - send quick update
        MSG="🔴⚪ *ARSENAL UPDATE* $(date '+%d %b')

━━━━━━━━━━━━━━━━━━━━━━

📰 *ข่าวใหม่*
• $NEWS_1

━━━━━━━━━━━━━━━━━━━━━━

🔴 *COYS!* 🔴⚪"
        send_message "$MSG"
        echo "{\"lastDate\":\"$TODAY_STR\",\"lastNews1\":\"$NEWS_1\"}" > "$STATE_FILE"
        echo "New headline - sent update"
    else
        echo "No new Arsenal news today ($(date)) - same headline"
    fi
    exit 0
fi

# New day - send daily briefing
MSG="🔴⚪ *ARSENAL DAILY* $(date '+%d %b')

━━━━━━━━━━━━━━━━━━━━━━

📰 *ข่าววันนี้*
• $NEWS_1
• $NEWS_2
• $NEWS_3

📊 *PL Table:* Arsenal 67pts (1st) | +7 จ่าฝูง

📅 *แมตช์ถัดไป:* Today vs Brighton

━━━━━━━━━━━━━━━━━━━━━━

🔴 *COYS!* 🔴⚪"

send_message "$MSG"

# Update state
echo "{\"lastDate\":\"$TODAY_STR\",\"lastNews1\":\"$NEWS_1\"}" > "$STATE_FILE"

echo "Arsenal daily sent: $TODAY_STR"
