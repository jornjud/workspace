const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../firebase-service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const dataPath = path.join(__dirname, '..', 'data', 'phones.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

async function importPhones() {
  console.log('🚀 Starting import to Firestore...');
  
  const collectionRef = db.collection('phones');
  
  for (const phone of data.phones) {
    const phoneId = phone.id || collectionRef.doc().id;
    const { id, ...phoneData } = phone;
    
    await collectionRef.doc(phoneId).set(phoneData);
    console.log(`✅ Imported: ${phone.model} (${phoneId})`);
  }
  
  console.log(`\n🎉 Done! Imported ${data.phones.length} phones to Firestore`);
}

importPhones().catch(console.error);
