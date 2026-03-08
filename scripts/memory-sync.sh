#!/bin/bash
# Memory Auto-sync Script
# ช่วยอัปเดต memory อัตโนมัติ

MEMORY_DIR="$HOME/.openclaw/workspace/memory"
TODAY=$(date +%Y-%m-%d)

# Create today's memory file if not exists
if [ ! -f "$MEMORY_DIR/$TODAY.md" ]; then
    echo "# $TODAY - Daily Notes" > "$MEMORY_DIR/$TODAY.md"
    echo "---" >> "$MEMORY_DIR/$TODAY.md"
    echo "## 📝 Today" >> "$MEMORY_DIR/$TODAY.md"
    echo "" >> "$MEMORY_DIR/$TODAY.md"
    echo "## 🎯 Tasks" >> "$MEMORY_DIR/$TODAY.md"
    echo "" >> "$MEMORY_DIR/$TODAY.md"
    echo "## 💡 Notes" >> "$MEMORY_DIR/$TODAY.md"
    echo "✅ Created: $TODAY.md"
else
    echo "📂 Today's memory already exists: $TODAY.md"
fi

# Show recent memories
echo ""
echo "--- Recent Memories ---"
ls -lt "$MEMORY_DIR"/*.md | head -5

echo ""
echo "✅ Memory sync complete!"
