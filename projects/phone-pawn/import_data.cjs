const admin = require('firebase-admin');
const serviceAccount = require('/home/ple/.openclaw/workspace/.credentials/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const pawns = [
  {
    imei: "",
    ramRom: "4GB / 64GB",
    dueDate: "2026-03-07T17:00:00.000Z",
    principal: 1000,
    phoneModel: "oppo",
    createdAt: "2026-03-01T10:15:56.136Z",
    lastPaymentDate: "2026-02-28T17:00:00.000Z",
    customerName: "เดียร์",
    startDate: "2026-02-28T17:00:00.000Z",
    status: "active",
    refId: "REF-M43BYT",
    pin: "266060"
  },
  {
    phoneModel: "oppo A5i",
    principal: 1000,
    dueDate: "2026-03-06T17:00:00.000Z",
    createdAt: "2026-02-28T08:29:32.234Z",
    ramRom: "4GB / 64GB",
    imei: "",
    pin: "12369",
    refId: "REF-RZ6PMN",
    customerName: "ตุ๊ก",
    startDate: "2026-02-27T17:00:00.000Z",
    status: "active",
    lastPaymentDate: "2026-02-27T17:00:00.000Z"
  },
  {
    lastPaymentDate: "2026-02-24T17:00:00.000Z",
    refId: "REF-GLUELE",
    imei: "",
    principal: 1500,
    customerName: "หมู",
    status: "active",
    startDate: "2026-02-24T17:00:00.000Z",
    pin: "425417",
    ramRom: "8GB / 256GB",
    dueDate: "2026-03-03T17:00:00.000Z",
    phoneModel: "redmi note 13 ",
    createdAt: "2026-02-25T05:52:00.979Z"
  },
  {
    imei: "",
    ramRom: "4GB / 64GB",
    createdAt: "2026-02-24T09:26:47.184Z",
    dueDate: "2026-03-02T17:00:00.000Z",
    principal: 1000,
    phoneModel: "A3x",
    lastPaymentDate: "2026-02-23T17:00:00.000Z",
    status: "active",
    startDate: "2026-02-23T17:00:00.000Z",
    customerName: "ต้า",
    pin: "253305",
    refId: "REF-T6G6IN"
  },
  {
    createdAt: "2026-02-23T11:42:05.628Z",
    dueDate: "2026-03-01T17:00:00.000Z",
    principal: 1000,
    phoneModel: "oppo a18",
    imei: "",
    ramRom: "4GB / 64GB",
    pin: "",
    refId: "REF-ALAC5Y",
    lastPaymentDate: "2026-02-22T17:00:00.000Z",
    status: "active",
    startDate: "2026-02-22T17:00:00.000Z",
    customerName: "ตอง"
  },
  {
    refId: "REF-6Q6FGW",
    lastPaymentDate: "2026-02-21T17:00:00.000Z",
    principal: 1500,
    imei: "",
    pin: "",
    customerName: "ต้อม",
    startDate: "2026-02-21T17:00:00.000Z",
    status: "active",
    dueDate: "2026-02-28T17:00:00.000Z",
    phoneModel: "Vivo",
    createdAt: "2026-02-22T07:45:06.820Z",
    ramRom: "8GB / 128GB"
  },
  {
    lastPaymentDate: "2026-02-20T17:00:00.000Z",
    customerName: "เดียร์",
    status: "active",
    startDate: "2026-02-20T17:00:00.000Z",
    pin: "266060",
    refId: "REF-8ZL03X",
    imei: "",
    ramRom: "4GB / 64GB",
    createdAt: "2026-02-21T12:10:43.686Z",
    principal: 800,
    dueDate: "2026-02-27T17:00:00.000Z",
    phoneModel: "oppo a3x"
  },
  {
    phoneModel: "poco",
    dueDate: "2026-02-27T17:00:00.000Z",
    principal: 1500,
    createdAt: "2026-02-21T10:59:02.687Z",
    ramRom: "8GB / 256GB",
    imei: "",
    pin: "78963วาด",
    refId: "REF-6NRXIW",
    status: "active",
    startDate: "2026-02-20T17:00:00.000Z",
    customerName: "แอล",
    lastPaymentDate: "2026-02-20T17:00:00.000Z"
  },
  {
    dueDate: "2026-02-26T17:00:00.000Z",
    principal: 1000,
    phoneModel: "SS A165G",
    createdAt: "2026-02-20T06:39:26.826Z",
    imei: "",
    ramRom: "4GB / 128GB",
    refId: "REF-4Z13HR",
    pin: "D999",
    lastPaymentDate: "2026-02-19T17:00:00.000Z",
    customerName: "จ็อบ",
    status: "active",
    startDate: "2026-02-19T17:00:00.000Z"
  },
  {
    customerName: "อ๊อฟ",
    startDate: "2026-02-17T17:00:00.000Z",
    status: "active",
    lastPaymentDate: "2026-02-17T17:00:00.000Z",
    refId: "REF-EVCE25",
    pin: "",
    ramRom: "Other",
    imei: "",
    phoneModel: "redmi 14c",
    dueDate: "2026-02-24T17:00:00.000Z",
    principal: 1000,
    createdAt: "2026-02-20T05:27:07.713Z"
  },
  {
    pin: "",
    status: "active",
    startDate: "2026-01-28T17:00:00.000Z",
    customerName: "ส้ม",
    createdAt: "2026-02-20T05:23:42.185Z",
    phoneModel: "nubia",
    dueDate: "2026-02-04T17:00:00.000Z",
    ramRom: "Other",
    refId: "REF-RXAFWZ",
    lastPaymentDate: "2026-01-28T17:00:00.000Z",
    principal: 1000,
    imei: ""
  },
  {
    ramRom: "Other",
    phoneModel: "samsung",
    dueDate: "2025-12-28T17:00:00.000Z",
    createdAt: "2026-02-20T05:18:53.721Z",
    startDate: "2025-12-21T17:00:00.000Z",
    status: "expired",
    customerName: "อ้น",
    pin: "002527",
    imei: "",
    principal: 3000,
    lastPaymentDate: "2025-12-21T17:00:00.000Z",
    refId: "REF-G757QS"
  },
  {
    pin: "",
    customerName: "ตอง",
    startDate: "2026-01-25T17:00:00.000Z",
    status: "active",
    createdAt: "2026-02-20T05:17:33.409Z",
    phoneModel: "oppo a16",
    dueDate: "2026-02-08T17:00:00.000Z",
    ramRom: "Other",
    refId: "REF-LBGFUS",
    lastPaymentDate: "2026-02-01T17:00:00.000Z",
    principal: 1000,
    renewalHistory: [
      {
        newDueDate: "2026-02-08T17:00:00.000Z",
        previousDueDate: "2026-02-01T17:00:00.000Z",
        interestPaid: 140,
        renewalDate: "2026-02-23T11:43:44.676Z"
      }
    ],
    imei: ""
  },
  {
    pin: "182554",
    refId: "REF-2FY8R6",
    status: "active",
    startDate: "2025-12-28T17:00:00.000Z",
    customerName: "ตะวัน",
    lastPaymentDate: "2025-12-28T17:00:00.000Z",
    phoneModel: "realme",
    dueDate: "2026-01-04T17:00:00.000Z",
    principal: 1000,
    createdAt: "2026-02-20T05:05:19.145Z",
    ramRom: "Other",
    imei: ""
  },
  {
    ramRom: "Other",
    imei: "",
    phoneModel: "oppo A5pro",
    dueDate: "2026-01-27T17:00:00.000Z",
    principal: 1500,
    createdAt: "2026-02-20T04:47:02.969Z",
    customerName: "น้อย",
    status: "active",
    startDate: "2026-01-20T17:00:00.000Z",
    lastPaymentDate: "2026-01-20T17:00:00.000Z",
    refId: "REF-9TJCFD",
    pin: ""
  },
  {
    ramRom: "Other",
    createdAt: "2026-02-20T04:44:51.665Z",
    dueDate: "2026-01-24T17:00:00.000Z",
    phoneModel: "oppo A5pro ",
    customerName: "สายทอง",
    startDate: "2026-01-17T17:00:00.000Z",
    status: "active",
    pin: "258369",
    imei: "",
    principal: 1000,
    lastPaymentDate: "2026-01-17T17:00:00.000Z",
    refId: "REF-L5BPL2"
  },
  {
    ramRom: "4GB / 64GB",
    phoneModel: "oppo A17",
    dueDate: "2026-02-07T17:00:00.000Z",
    createdAt: "2026-02-20T04:41:11.273Z",
    status: "active",
    startDate: "2026-01-24T17:00:00.000Z",
    customerName: "ตุ๊ก",
    pin: "",
    imei: "",
    renewalHistory: [
      {
        newDueDate: "2026-02-07T17:00:00.000Z",
        previousDueDate: "2026-01-31T17:00:00.000Z",
        interestPaid: 140,
        renewalDate: "2026-02-22T06:23:36.934Z"
      }
    ],
    principal: 1000,
    lastPaymentDate: "2026-01-31T17:00:00.000Z",
    refId: "REF-FWWQIU"
  },
  {
    ramRom: "Other",
    imei: "",
    createdAt: "2026-02-20T04:33:27.049Z",
    phoneModel: "oppo A3pro5g",
    dueDate: "2025-12-31T17:00:00.000Z",
    principal: 1500,
    status: "active",
    startDate: "2025-12-24T17:00:00.000Z",
    customerName: "แหวน",
    lastPaymentDate: "2025-12-24T17:00:00.000Z",
    pin: "",
    refId: "REF-YH1VO0"
  },
  {
    lastPaymentDate: "2026-02-24T17:00:00.000Z",
    refId: "REF-ZVS5NI",
    imei: "",
    renewalHistory: [
      {
        newDueDate: "2026-02-24T17:00:00.000Z",
        previousDueDate: "2026-02-17T17:00:00.000Z",
        interestPaid: 140,
        renewalDate: "2026-03-01T10:37:16.259Z"
      },
      {
        newDueDate: "2026-03-03T17:00:00.000Z",
        previousDueDate: "2026-02-24T17:00:00.000Z",
        interestPaid: 140,
        renewalDate: "2026-03-01T10:37:28.027Z"
      }
    ],
    principal: 1000,
    startDate: "2026-02-10T17:00:00.000Z",
    status: "active",
    customerName: "มะตูม",
    pin: "",
    ramRom: "4GB / 64GB",
    phoneModel: "oppo A3X",
    dueDate: "2026-03-03T17:00:00.000Z",
    createdAt: "2026-02-20T04:25:41.713Z"
  }
];

async function importData() {
  const batch = db.batch();
  const collection = db.collection('pawns');
  
  for (const pawn of pawns) {
    const docRef = collection.doc(pawn.refId);
    batch.set(docRef, pawn);
  }
  
  await batch.commit();
  console.log(`✅ Imported ${pawns.length} records to Firestore!`);
}

importData().catch(console.error);
