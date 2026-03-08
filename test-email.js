const { AgentMailClient } = require("agentmail");

const client = new AgentMailClient({ 
  apiKey: "am_us_be12f36593fe424ebbbab9e980f1f2a4ac252552cb6c1ec8e19650d05dc7e197" 
});

async function main() {
  // ดู inbox list
  const inboxes = await client.inboxes.list();
  console.log("📥 Inboxes:", JSON.stringify(inboxes, null, 2));
}

main().catch(console.error);
