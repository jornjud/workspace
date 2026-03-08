// 1. ส่วนการนำเข้าโมดูล (Imports)
const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const { google } = require("googleapis");
const { FieldValue } = require("firebase-admin/firestore");

// 2. ส่วนเริ่มต้น Firebase Admin (Admin Initialization)
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// 3. การตั้งค่าส่วนกลางสำหรับ Functions (Global Settings)
setGlobalOptions({
    region: "asia-southeast1",
    memory: "256MiB",
    cors: ["https://qrmember.web.app", "https://*.firebaseapp.com"]
});

// --- Google Sheets Config ---
const SERVICE_ACCOUNT_FILE = "./service-account.json";
const SHEET_ID = "1Np7DPlfuIjvn1fxDWtroCd2nAuFPyNo94EXgV3VA3Lo";
const SHEET_NAME = "ชีต1";

const formatBkkDate = (date) => {
    const bkkDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    const day = String(bkkDate.getUTCDate()).padStart(2, '0');
    const month = String(bkkDate.getUTCMonth() + 1).padStart(2, '0');
    const year = bkkDate.getUTCFullYear();
    const hours = String(bkkDate.getUTCHours()).padStart(2, '0');
    const minutes = String(bkkDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(bkkDate.getUTCSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

// 4. ✨ MODIFIED ✨ Cloud Function: logTransactionToSheet with DETAILED LOGGING
// โค้ดเวอร์ชัน "แทรกบนสุด" (Insert & Update)
exports.logTransactionToSheet = onDocumentCreated(
    {
        document: "transactions/{transactionId}",
        location: "asia-southeast1"
    },
    async (event) => {
    const transactionId = event.params.transactionId;
    const txData = event.data.data();

    console.log(`[${transactionId}] Function triggered for type: ${txData.type}`);

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_FILE,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const sheets = google.sheets({ version: "v4", auth });

        // --- 1. หา Sheet ID ตัวเลขของ 'ชีต1' ---
        const spreadsheetData = await sheets.spreadsheets.get({
            spreadsheetId: SHEET_ID,
            fields: 'sheets.properties.sheetId,sheets.properties.title',
        });

        const sheet = spreadsheetData.data.sheets.find(s => s.properties.title === SHEET_NAME);
        if (!sheet) {
            throw new Error(`Sheet with name "${SHEET_NAME}" not found.`);
        }
        const sheetId = sheet.properties.sheetId;
        // ------------------------------------

        // --- 2. สั่งแทรกแถวว่าง 1 แถวที่ตำแหน่งบนสุด (แถวที่ 2) ---
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SHEET_ID,
            resource: {
                requests: [
                    {
                        insertDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: "ROWS",
                                startIndex: 1, // เริ่มหลังแถวหัวข้อ (index 0)
                                endIndex: 2,   // แทรก 1 แถว
                            },
                            inheritFromBefore: false,
                        },
                    },
                ],
            },
        });
        console.log(`[${transactionId}] Successfully inserted a new row at row 2.`);
        // -----------------------------------------------------------------

        const formattedDate = formatBkkDate(txData.timestamp.toDate());
        const row = [
            transactionId,
            formattedDate,
            txData.type || "N/A",
            txData.customerName || "N/A",
            txData.purchase_amount !== undefined ? txData.purchase_amount : "N/A",
            txData.points_change || 0,
            txData.staffEmail || "N/A",
        ];

        // --- 3. เขียนข้อมูลใหม่ลงไปในแถวที่เพิ่งสร้าง ---
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!A2:G2`, // ระบุเป้าหมายชัดเจนที่แถว 2
            valueInputOption: "USER_ENTERED",
            resource: { values: [row] },
        });
        // ----------------------------------------------------

        console.log(`[${transactionId}] Successfully wrote data to the new top row.`);

    } catch (error) {
        console.error(`[${transactionId}] 🔥🔥🔥 CRITICAL ERROR 🔥🔥🔥: Failed to log to Google Sheet:`, error);
        throw new HttpsError('internal', `Failed to write to sheet for transaction ${transactionId}. Reason: ${error.message}`);
    }
});

// (The rest of your functions remain the same)

exports.backfillTransactionsToSheet = onCall(async (request) => {
    if (!request.auth || !request.auth.token.staff) { throw new HttpsError("permission-denied", "คุณไม่มีสิทธิ์ดำเนินการนี้"); }
    try {
        const auth = new google.auth.GoogleAuth({ keyFile: SERVICE_ACCOUNT_FILE, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
        const sheets = google.sheets({ version: "v4", auth });
        await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: `${SHEET_NAME}!A2:G` });
        const snapshot = await db.collection("transactions").orderBy("timestamp", "asc").get();
        if (snapshot.empty) { return { success: true, message: "ไม่พบข้อมูลธุรกรรมเก่าให้ส่ง" }; }
        const rows = snapshot.docs.map(doc => {
            const txData = doc.data(); const formattedDate = formatBkkDate(txData.timestamp.toDate());
            return [doc.id, formattedDate, txData.type || "N/A", txData.customerName || "N/A", txData.purchase_amount !== undefined ? txData.purchase_amount : "N/A", txData.points_change || 0, txData.staffEmail || "N/A"];
        });
        await sheets.spreadsheets.values.append({ spreadsheetId: SHEET_ID, range: `${SHEET_NAME}!A2`, valueInputOption: "USER_ENTERED", resource: { values: rows } });
        return { success: true, message: `ส่งข้อมูลเก่าจำนวน ${snapshot.size} รายการไปยัง Google Sheet สำเร็จแล้ว!` };
    } catch (error) { console.error("Error during backfill:", error.message); throw new HttpsError("internal", "เกิดข้อผิดพลาดขณะส่งข้อมูลเก่า"); }
});

//  👇👇👇 [เพิ่มฟังก์ชันนี้ทั้งก้อนเข้าไป] 👇👇👇
exports.adjustPurchase = onCall(async (request) => {
    if (!request.auth || !request.auth.token.staff) {
        throw new HttpsError("permission-denied", "คุณไม่มีสิทธิ์ดำเนินการนี้");
    }

    const { customerId, customerName, amount, reason } = request.data;
    const staffId = request.auth.uid;
    const staffEmail = request.auth.token.email;

    if (!customerId || !customerName || !amount || isNaN(amount) || amount === 0 || !reason) {
        throw new HttpsError("invalid-argument", "ข้อมูลไม่ครบถ้วน (customerId, amount, reason) หรือยอดเงินเป็น 0");
    }

    const customerRef = db.collection("customers").doc(customerId);

    try {
        let pointsToChange = 0;

        await db.runTransaction(async (transaction) => {
            const customerDoc = await transaction.get(customerRef);
            if (!customerDoc.exists) {
                throw new HttpsError("not-found", "ไม่พบข้อมูลลูกค้า");
            }

            const currentData = customerDoc.data();
            const currentRemainder = currentData.purchase_remainder || 0;

            // --- CORE LOGIC ---
            const totalValueForPoints = amount + currentRemainder;
            pointsToChange = Math.floor(totalValueForPoints * (1 / 100)); // 1/100 คือ POINTS_PER_BAHT
            const newRemainder = parseFloat((totalValueForPoints % 100).toFixed(2));
            const newTotalPoints = (currentData.total_points || 0) + pointsToChange;
            const newLifetimePoints = (currentData.lifetime_points || 0) + pointsToChange;
            // ------------------

            if (newTotalPoints < 0) {
                throw new HttpsError("failed-precondition", `แต้มของลูกค้าจะติดลบ (${newTotalPoints}) กรุณาตรวจสอบยอดเงิน`);
            }

            // 1. Update Customer
            transaction.update(customerRef, {
                total_points: newTotalPoints,
                lifetime_points: newLifetimePoints,
                purchase_remainder: newRemainder
            });

            // 2. Create new Transaction log
            const transactionRef = db.collection("transactions").doc();
            transaction.set(transactionRef, {
                customerId: customerId,
                customerName: customerName,
                staffId: staffId,
                staffEmail: staffEmail,
                type: 'purchase_adjustment', // <-- New Type
                points_change: pointsToChange,
                purchase_amount: amount, // <-- The amount to be summed in analytics
                reason: reason,
                timestamp: FieldValue.serverTimestamp()
            });
        });

        return { 
            success: true, 
            message: `ปรับยอดซื้อ ${amount} บาท และแต้ม ${pointsToChange} แต้ม ให้คุณ ${customerName} เรียบร้อยแล้ว` 
        };

    } catch (error) {
        console.error("Error adjusting purchase:", error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message);
    }
});
//  👆👆👆 [เพิ่มฟังก์ชันนี้ทั้งก้อนเข้าไป] 👆👆👆

exports.exportAllSales = onCall(async (request) => {
    if (!request.auth || !request.auth.token.staff) { throw new HttpsError("permission-denied", "คุณไม่มีสิทธิ์ดำเนินการนี้"); }
    try {
        const transactionsRef = db.collection("transactions");
        const querySnapshot = await transactionsRef.where("type", "in", ["add_points", "purchase_adjustment"]).orderBy("timestamp", "asc").get();
        if (querySnapshot.empty) { return { csv: "Date,Total Sales\n" }; }
        const salesByDay = {};
        querySnapshot.forEach(doc => {
            const tx = doc.data();
            if (tx.status === 'undone') return;
            const bkkDate = new Date(tx.timestamp.toDate().getTime() + (7 * 60 * 60 * 1000));
            const dateString = bkkDate.toISOString().split('T')[0];
            if (!salesByDay[dateString]) { salesByDay[dateString] = 0; }
            salesByDay[dateString] += tx.purchase_amount;
        });
        let csv = "Date,Total Sales\n";
        for (const date in salesByDay) { csv += `${date},${salesByDay[date].toFixed(2)}\n`; }
        return { csv };
    } catch (error) { console.error("Error exporting sales data:", error); throw new HttpsError("internal", "เกิดข้อผิดพลาดในการสร้างรายงาน: " + error.message); }
});

exports.undoTransaction = onCall(async (request) => {
  if (!request.auth || !request.auth.token.staff) { throw new HttpsError("permission-denied", "คุณไม่มีสิทธิ์ดำเนินการนี้"); }
  const { transactionId } = request.data; if (!transactionId) { throw new HttpsError("invalid-argument", "ไม่ได้ระบุ ID ของรายการ"); }
  const transactionRef = db.collection("transactions").doc(transactionId);
  try {
    const result = await db.runTransaction(async (t) => {
      const txDoc = await t.get(transactionRef); if (!txDoc.exists) { throw new HttpsError("not-found", "ไม่พบรายการที่ต้องการยกเลิก"); }
      if (txDoc.data().status === "undone") { throw new HttpsError("already-exists", "รายการนี้ถูกยกเลิกไปแล้ว"); }
      const txData = txDoc.data(); const customerRef = db.collection("customers").doc(txData.customerId);
      const customerDoc = await t.get(customerRef); if (!customerDoc.exists) { throw new HttpsError("not-found", "ไม่พบข้อมูลลูกค้าของรายการนี้"); }
      const customerData = customerDoc.data();
      if (txData.type === "add_points" || txData.type === "purchase_adjustment") {
        const newTotalPoints = customerData.total_points - txData.points_change; const newLifetimePoints = customerData.lifetime_points - txData.points_change;
        const currentRemainder = customerData.purchase_remainder || 0; const purchaseAmountMod = txData.purchase_amount % 100;
        let previousRemainder = (currentRemainder - purchaseAmountMod + 100) % 100;
        if (Math.abs(previousRemainder - Math.round(previousRemainder)) < 0.001) { previousRemainder = Math.round(previousRemainder); }
        t.update(customerRef, { total_points: newTotalPoints < 0 ? 0 : newTotalPoints, lifetime_points: newLifetimePoints < 0 ? 0 : newLifetimePoints, purchase_remainder: previousRemainder });
      } else if (txData.type === "redeem") {
        const newTotalPoints = customerData.total_points - txData.points_change; t.update(customerRef, { total_points: newTotalPoints });
        if (txData.rewardId) { const rewardRef = db.collection("rewards").doc(txData.rewardId); t.update(rewardRef, { stock: FieldValue.increment(1) }); }
      } else { throw new HttpsError("invalid-argument", `ไม่สามารถยกเลิกรายการประเภท: ${txData.type}`); }
      t.update(transactionRef, { status: "undone" }); const undoLogRef = db.collection("transactions").doc();
      t.set(undoLogRef, { type: "undo", customerId: txData.customerId, customerName: txData.customerName, staffId: request.auth.uid, staffEmail: request.auth.token.email, undoneTransactionId: transactionId, undoneTransactionType: txData.type, points_change: -txData.points_change, timestamp: FieldValue.serverTimestamp() });
      return { customerName: txData.customerName, type: txData.type };
    });
    console.log(`Successfully undid transaction ${transactionId} for ${result.customerName}`);
    return { success: true, message: `ยกเลิกรายการ "${result.type}" ของคุณ ${result.customerName} สำเร็จแล้ว` };
  } catch (error) { console.error(`Failed to undo transaction ${transactionId}:`, error); if (error instanceof HttpsError) { throw error; } throw new HttpsError("internal", "เกิดข้อผิดพลาดร้ายแรงขณะยกเลิกรายการ"); }
});

exports.deleteCustomer = onCall(async (request) => {
  if (!request.auth) { throw new Error("คุณไม่มีสิทธิ์ดำเนินการนี้ (Unauthenticated)"); }
  const customerUid = request.data.uid; if (!customerUid) { throw new Error("ไม่ได้ระบุ UID ของลูกค้า (Invalid Argument)"); }
  try {
    await auth.deleteUser(customerUid); console.log(`Successfully deleted user with UID: ${customerUid} from Auth.`);
    const customerDocRef = db.collection("customers").doc(customerUid); await customerDocRef.delete();
    console.log(`Successfully deleted customer data for UID: ${customerUid} from Firestore.`);
    return { success: true, message: `ลบบัญชีลูกค้า ${customerUid} เรียบร้อยแล้ว` };
  } catch (error) { console.error("Error deleting customer:", error); throw new Error("เกิดข้อผิดพลาดในการลบบัญชี: " + error.message); }
});

exports.changePassword = onCall(async (request) => {
  if (!request.auth) { throw new Error("คุณไม่มีสิทธิ์ดำเนินการนี้ (Unauthenticated)"); }
  const { uid, newPassword } = request.data; if (!uid || !newPassword) { throw new Error("กรุณาระบุ UID และรหัสผ่านใหม่ (Invalid Argument)"); }
  if (newPassword.length < 6 || newPassword.length > 16) { throw new Error("รหัสผ่านต้องมีความยาวระหว่าง 6 ถึง 16 ตัวอักษร (Invalid Argument)"); }
  try {
    await auth.updateUser(uid, { password: newPassword }); console.log(`Successfully updated password for UID: ${uid} in Auth.`);
    const customerDocRef = db.collection("customers").doc(uid); await customerDocRef.update({ password: newPassword });
    console.log(`Successfully updated password in Firestore for UID: ${uid}.`);
    return { success: true, message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" };
  } catch (error) { console.error("Error changing password:", error); throw new Error("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน: " + error.message); }
});

exports.cleanupOldTransactions = onCall(async (request) => {
  if (!request.auth || !request.auth.token.staff) { throw new Error("คุณไม่มีสิทธิ์ดำเนินการนี้ (Unauthenticated)"); }
  const ninetyDaysAgo = new Date(); ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const oldTransactionsQuery = db.collection("transactions").where("timestamp", "<", ninetyDaysAgo);
  try {
    const snapshot = await oldTransactionsQuery.get(); if (snapshot.empty) { return { success: true, message: "ไม่พบประวัติที่เก่ากว่า 90 วันให้ลบ" }; }
    const batchArray = []; batchArray.push(db.batch()); let operationCounter = 0; let batchIndex = 0;
    snapshot.docs.forEach(doc => {
      batchArray[batchIndex].delete(doc.ref); operationCounter++;
      if (operationCounter === 499) { batchArray.push(db.batch()); batchIndex++; operationCounter = 0; }
    });
    await Promise.all(batchArray.map(batch => batch.commit()));
    return { success: true, message: `ลบประวัติที่เก่ากว่า 90 วันสำเร็จแล้ว (${snapshot.size} รายการ)` };
  } catch (error) { console.error("Error cleaning up old transactions:", error); throw new Error("เกิดข้อผิดพลาดในการลบประวัติ: " + error.message); }
});

exports.getSalesAnalytics = onCall(async (request) => {
    if (!request.auth || !request.auth.token.staff) {
        throw new HttpsError("permission-denied", "คุณไม่มีสิทธิ์ดำเนินการนี้");
    }
    const { startDate, endDate } = request.data;
    const transactionsRef = db.collection("transactions");
    const calculateTotal = async (query) => {
        const snapshot = await query.get();
        let total = 0;
        snapshot.forEach(doc => {
            if (doc.data().status !== 'undone') {
                total += doc.data().purchase_amount || 0;
            }
        });
        return total;
    };
    if (startDate && endDate) {
        try {
            const start = new Date(startDate); const end = new Date(endDate); end.setHours(23, 59, 59, 999);
            const rangeQuery = transactionsRef.where("type", "in", ["add_points", "purchase_adjustment"]).where("timestamp", ">=", start).where("timestamp", "<=", end);
            const total = await calculateTotal(rangeQuery);
            return { salesInRange: total };
        } catch (error) { console.error("Error fetching sales analytics for date range:", error); throw new HttpsError("internal", "เกิดข้อผิดพลาดในการดึงข้อมูลยอดขายตามช่วงวัน"); }
    }
    try {
        const now = new Date();
        const bangkokTimeOffset = 7 * 60 * 60 * 1000;
        const nowInBKK = new Date(now.getTime() + bangkokTimeOffset);
        const startOfDay = new Date(nowInBKK); startOfDay.setUTCHours(0, 0, 0, 0);
        const startOfWeek = new Date(nowInBKK);
        const dayOfWeek = startOfWeek.getUTCDay(); const diff = startOfWeek.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startOfWeek.setUTCDate(diff); startOfWeek.setUTCHours(0, 0, 0, 0);
        const startOfMonth = new Date(nowInBKK); startOfMonth.setUTCDate(1); startOfMonth.setUTCHours(0, 0, 0, 0);
        const startOfYear = new Date(nowInBKK); startOfYear.setUTCMonth(0, 1); startOfYear.setUTCHours(0, 0, 0, 0);
        const startOfDayUTC = new Date(startOfDay.getTime() - bangkokTimeOffset);
        const startOfWeekUTC = new Date(startOfWeek.getTime() - bangkokTimeOffset);
        const startOfMonthUTC = new Date(startOfMonth.getTime() - bangkokTimeOffset);
        const startOfYearUTC = new Date(startOfYear.getTime() - bangkokTimeOffset);
        const todayQuery = transactionsRef.where("type", "in", ["add_points", "purchase_adjustment"]).where("timestamp", ">=", startOfDayUTC);
        const weekQuery = transactionsRef.where("type", "in", ["add_points", "purchase_adjustment"]).where("timestamp", ">=", startOfWeekUTC);
        const monthQuery = transactionsRef.where("type", "in", ["add_points", "purchase_adjustment"]).where("timestamp", ">=", startOfMonthUTC);
        const yearQuery = transactionsRef.where("type", "in", ["add_points", "purchase_adjustment"]).where("timestamp", ">=", startOfYearUTC);
        const [salesToday, salesThisWeek, salesThisMonth, salesThisYear] = await Promise.all([
            calculateTotal(todayQuery), calculateTotal(weekQuery), calculateTotal(monthQuery), calculateTotal(yearQuery),
        ]);
        return { salesToday, salesThisWeek, salesThisMonth, salesThisYear };
    } catch (error) { console.error("Error fetching default sales analytics:", error); throw new HttpsError("internal", "เกิดข้อผิดพลาดในการดึงข้อมูลยอดขาย: " + error.message); }
});