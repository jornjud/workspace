const { initializeApp, getApps, getApp } = require("firebase/app");
const { getFirestore, collection, getDocs, updateDoc, doc, query, where } = require("firebase/firestore");

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
  // Find OPPO A18 Glowing Black 4/64GB in Firestore
  const q = query(
    collection(db, "phones"),
    where("model", "==", "OPPO A18"),
    where("storage", "==", "4/64GB"),
    where("color", "==", "Glowing Black")
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log("❌ ไม่เจอ OPPO A18 Glowing Black 4/64GB");
    return;
  }
  
  const newImagePath = "/phones/oppo-a18-black-new.jpg";
  
  snapshot.forEach(async (d) => {
    const phone = d.data();
    console.log(`\n✅ เจอแล้ว: ${phone.model} ${phone.storage} ${phone.color}`);
    console.log(`   รูปเดิม: ${phone.images}`);
    
    // Update to new image
    await updateDoc(doc(db, "phones", d.id), {
      images: [newImagePath]
    });
    console.log(`\n🎉 อัพเดทรูปใหม่แล้ว!`);
    console.log(`   รูปใหม่: ${newImagePath}`);
  });
}

main().catch(console.error);
