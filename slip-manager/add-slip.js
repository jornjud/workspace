const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./firebase-service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const slip = {
  id: 'SLIP' + Date.now(),
  amount: 400,
  date: '2026-03-10',
  time: '06:50',
  bank: 'GSB',
  senderName: 'นาย ขจร ตรียุทธ',
  senderAccount: '0203xxxx9379',
  receiverName: 'นางสาว อมรรัตน์ สมจิตร',
  receiverPhone: 'xxx-xxx-1608',
  reference: '606906984602I000013B9790',
  status: 'approved',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

db.collection('slips').add(slip)
  .then(docRef => {
    console.log('Slip added with ID:', docRef.id);
    console.log(JSON.stringify(slip, null, 2));
  })
  .catch(error => {
    console.error('Error adding slip:', error);
  });
