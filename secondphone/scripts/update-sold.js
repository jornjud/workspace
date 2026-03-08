const { initializeApp, getApps, getApp } = require("firebase/app");
const { 
  getFirestore, collection, getDocs, updateDoc, doc 
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAzZjdxoAJYI0q_ai7gIa-G4qFqKB7st3s",
  authDomain: "secondphone-fe9a9.firebaseapp.com",
  projectId: "secondphone-fe9a9",
  storageBucket: "secondphone-fe9a9.firebasestorage.app",
  messagingSenderId: "619983782470",
  appId: "1:619983782470:web:d2394c5658fdf3abae8047"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function main() {
  // Find Realme 11 5G (case-insensitive search by getting all)
  const snapshot = await getDocs(collection(db, "phones"));
  
  let found = null;
  snapshot.forEach(d => {
    const p = d.data();
    if (p.model && p.model.toLowerCase().includes("realme 11 5g")) {
      found = { id: d.id, ...p };
    }
  });
  
  if (!found) {
    console.log("❌ ไม่เจอ Realme 11 5G");
    return;
  }
  
  console.log(`\n✅ เจอแล้ว: ${found.model} (${found.storage})`);
  console.log(`   Status: ${found.status || 'ว่าง'}`);
  console.log(`   Hidden: ${found.hidden || false}`);
  console.log(`   ID: ${found.id}`);
  
  // Update to sold
  await updateDoc(doc(db, "phones", found.id), {
    status: "sold",
    hidden: true
  });
  console.log(`\n🎉 อัพเดทสถานะเป็น "sold" และซ่อนแล้ว!`);
}

main().catch(console.error);
