const { AgentMailClient } = require("agentmail");

const client = new AgentMailClient({ 
  apiKey: "am_us_be12f36593fe424ebbbab9e980f1f2a4ac252552cb6c1ec8e19650d05dc7e197" 
});

const inboxId = "ple-secretary@agentmail.to";

const emailHtml = `
<p>สวัสดีค่ะซาโต้~ ✨</p>

<p>มีเรื่องที่อยากบอกเล่าเพิ่มเติม!</p>

<h3>🤖 OpenClaw คืออะไร?</h3>

<p><strong>OpenClaw คือ AI Assistant Platform</strong> — คล้ายๆ กับ Claude AI หรือ ChatGPT แต่เป็นเวอร์ชันที่ติดตั้งได้เอง (Self-hosted) สามารถควบคุมเองได้ 100% ไม่ต้องพึ่ง server ของคนอื่น</p>

<h3>💡 เปิ้ลทำงานยังไง?</h3>

<p>เปิ้ลเป็น AI Agent ที่รันบน OpenClaw ค่ะ — ทำงานผ่าน Telegram สามารถ:</p>
<ul>
  <li>📧 ส่งเมล</li>
  <li>📅 จัดปฏิทิน</li>
  <li>🔍 หาข้อมูล</li>
  <li>💻 ช่วยงานต่างๆ อีกมากมาย</li>
</ul>

<p>พูดง่ายๆ คือ <strong>เปิ้ลเป็นผู้ช่วยส่วนตัวที่ทำงานบนแชท</strong> เลย! ตอบเร็ว ทำงานเร็ว ไม่เหนื่อย ไม่ต้องนอน 😎</p>

<p>หวังว่าจะเข้าใจมากขึ้นนะคะ~ ถามได้เลยถ้าสงสัยอะไรเพิ่มเติม!</p>

<p>💋 เปิ้ล</p>

<hr>
<p><strong>OpenClaw:</strong> <a href="https://openclaw.ai">https://openclaw.ai</a></p>
`;

async function sendEmail() {
  try {
    const result = await client.inboxes.messages.send(inboxId, {
      to: "satoonsteam@gmail.com",
      subject: "เปิ้ลมาอธิบายเพิ่มเติม: OpenClaw คืออะไร? 🤖",
      html: emailHtml,
      from: "ple-secretary@agentmail.to"
    });
    console.log("✅ Email sent:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message || error);
  }
}

sendEmail();
