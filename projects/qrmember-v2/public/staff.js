// 1. ส่วนการนำเข้าโมดูล (Imports)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    updatePassword
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    addDoc,
    deleteDoc,
    collection,
    query,
    orderBy,
    getDocs,
    onSnapshot,
    runTransaction,
    serverTimestamp,
    Timestamp, // <-- ✨ เติมบรรทัดนี้เข้าไป
    updateDoc,
    where
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import {
    getFunctions,
    httpsCallable
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-functions.js";

// 2. ส่วนกำหนดค่า Firebase (Firebase Configuration)
const firebaseConfig = {
    apiKey: "AIzaSyAGaOq5byN-wcNYCovCA2ZGu395FUjHJGU",
    authDomain: "qrmember.firebaseapp.com",
    projectId: "qrmember",
    storageBucket: "qrmember.firebasestorage.app",
    messagingSenderId: "988370950677",
    appId: "1:988370950677:web:db4fd2c93f80cbb0ef0c1c"
};

// 3. ส่วนเริ่มต้น Firebase (Firebase Initialization)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, 'asia-southeast1');

// 4. ส่วนเรียกใช้ Cloud Functions (Callable Functions)
const deleteCustomerCallable = httpsCallable(functions, 'deleteCustomer');
const changePasswordCallable = httpsCallable(functions, 'changePassword');
const cleanupOldTransactionsCallable = httpsCallable(functions, 'cleanupOldTransactions');
const getSalesAnalyticsCallable = httpsCallable(functions, 'getSalesAnalytics');
const undoTransactionCallable = httpsCallable(functions, 'undoTransaction');
const exportSalesDataCallable = httpsCallable(functions, 'exportAllSales');
const backfillTransactionsToSheetCallable = httpsCallable(functions, 'backfillTransactionsToSheet');
const adjustPurchaseCallable = httpsCallable(functions, 'adjustPurchase');

// 5. ค่าคงที่และตัวแปรส่วนกลาง (Constants & Global State)
const CUSTOMER_COLLECTION = "customers";
const REWARDS_COLLECTION = "rewards";
const TRANSACTION_COLLECTION = "transactions";
const POINTS_PER_BAHT = 1 / 100;

let currentStaff = null;
let activeCustomer = null;
let rewardsCache = [];
let allCustomersCache = [];
let rewardsListener = null;
let qrCodeScanner = null;
let confirmCallback = null;

// ✨ NEW ✨: State for pagination
let customerListPage = 1;
const customerListItemsPerPage = 10;
let redeemListPage = 1;
const redeemListItemsPerPage = 5;
let rewardsAdminPage = 1;
const rewardsAdminItemsPerPage = 5;


// 6. ส่วนเลือกองค์ประกอบ DOM (DOM Selectors)
const views = {
    loading: document.getElementById('loading-view'),
    login: document.getElementById('staff-login-view'),
    dashboard: document.getElementById('staff-dashboard-view'),
    rewards: document.getElementById('staff-rewards-view'),
    customerList: document.getElementById('staff-customer-list-view'),
    analytics: document.getElementById('staff-analytics-view'),
    history: document.getElementById('staff-history-view')
};
const modal = document.getElementById('app-modal');
const rewardFormModal = document.getElementById('reward-form-modal');
const editCustomerModal = document.getElementById('edit-customer-modal');
const changePasswordModal = document.getElementById('change-password-modal');
const confirmModal = document.getElementById('confirm-modal');
const calculationBreakdownEl = document.getElementById('points-calculation-breakdown');
const staffLoginBtn = document.getElementById('staff-login-btn');
const saveRewardBtn = document.getElementById('save-reward-btn');
const saveCustomerBtn = document.getElementById('save-customer-btn');
const saveNewPasswordBtn = document.getElementById('save-new-password-btn');
const saveNewCustomerBtn = document.getElementById('save-new-customer-btn');
const addPointsBtn = document.getElementById('add-points-btn');
const adjustPointsBtn = document.getElementById('adjust-points-btn');
const adjustPurchaseBtn = document.getElementById('adjust-purchase-btn');
const pointsActionTabsContainer = document.getElementById('points-action-tabs');


// 7. ฟังก์ชันช่วยเหลือเกี่ยวกับ UI (UI Helper Functions)
const showProgressBar = (percent) => {
    const container = document.getElementById('global-progress-container');
    const bar = document.getElementById('global-progress-bar');
    if (container && bar) {
        container.classList.remove('hidden');
        bar.style.width = percent + '%';
        if (percent >= 100) {
            setTimeout(() => {
                container.classList.add('hidden');
                bar.style.width = '0%';
            }, 500);
        }
    }
};

const changeView = (viewName) => {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    if (views[viewName]) {
        views[viewName].classList.remove('hidden');
    }
};

const showModal = (title, message, isSuccess = true) => {
    modal.querySelector('#modal-title').textContent = title;
    modal.querySelector('#modal-message').textContent = message;
    modal.querySelector('#modal-icon').textContent = isSuccess ? '✅' : '❌';
    modal.classList.remove('hidden');
};
const hideModal = () => modal.classList.add('hidden');

const showConfirmModal = (title, message, onConfirm, icon = '🤔', confirmText = 'ยืนยัน') => {
    confirmModal.querySelector('#confirm-modal-title').textContent = title;
    confirmModal.querySelector('#confirm-modal-message').textContent = message;
    confirmModal.querySelector('#confirm-modal-icon').textContent = icon;
    const confirmBtn = confirmModal.querySelector('#confirm-modal-confirm-btn');
    confirmBtn.textContent = confirmText;

    confirmBtn.className = 'btn flex-1'; // Reset classes
    if (confirmText.includes('ลบ') || confirmText.includes('ยกเลิก')) {
        confirmBtn.classList.add('btn--danger');
    } else {
        confirmBtn.classList.add('btn--primary');
    }

    confirmCallback = onConfirm;
    confirmModal.classList.remove('hidden');
};
const hideConfirmModal = () => {
    confirmCallback = null;
    confirmModal.classList.add('hidden');
};

const showError = (elementId, message) => { document.getElementById(elementId).textContent = message; };
const hideError = (elementId) => { document.getElementById(elementId).textContent = ''; };

// ✨ NEW ✨: Generic Pagination Renderer
const renderPagination = (container, currentPage, totalItems, itemsPerPage, onPageClick) => {
    container.innerHTML = '';
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return;

    const createButton = (page, text, isActive = false, isDisabled = false) => {
        const button = document.createElement('button');
        button.className = 'pagination-btn';
        if (isActive) button.classList.add('active');
        button.textContent = text || page;
        button.disabled = isDisabled;
        button.onclick = () => onPageClick(page);
        return button;
    };

    // Previous button
    container.appendChild(createButton(currentPage - 1, '«', false, currentPage === 1));

    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        container.appendChild(createButton(i, i, i === currentPage));
    }

    // Next button
    container.appendChild(createButton(currentPage + 1, '»', false, currentPage === totalPages));
};


// 8. ส่วนดึงข้อมูลเริ่มต้น (Initial Data Fetching)
const fetchInitialCustomerCache = async () => {
    showProgressBar(30);
    try {
        const q = query(collection(db, CUSTOMER_COLLECTION));
        const querySnapshot = await getDocs(q);
        allCustomersCache = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        showProgressBar(100);
    } catch (error) {
        console.error("Could not pre-fetch customers:", error);
        showProgressBar(100);
    }
};

// 9. ส่วนจัดการการยืนยันตัวตน (Authentication)
onAuthStateChanged(auth, async user => {
    currentStaff = user;
    if (user && user.email) {
        document.getElementById('staff-email-display').textContent = user.email;
        changeView('dashboard');
        listenToRewards();
        await fetchInitialCustomerCache();
        selectGeneralCustomerByDefault(); // <--- SET DEFAULT CUSTOMER
    } else {
        changeView('login');
        stopScanner();
        if (rewardsListener) rewardsListener();
    }
});

const staffLogin = async () => {
    staffLoginBtn.classList.add('is-loading');
    staffLoginBtn.disabled = true;

    const email = document.getElementById('staff-email').value;
    const password = document.getElementById('staff-password').value;
    hideError('staff-login-error');
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch(error) {
        showError('staff-login-error', "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        changeView('login');
    } finally {
        staffLoginBtn.classList.remove('is-loading');
        staffLoginBtn.disabled = false;
    }
};

const staffLogout = async () => {
    await signOut(auth);
};

// 10. ส่วนจัดการ QR Code Scanner (QR Scanner Logic)
const startScanner = () => {
    if (qrCodeScanner?.isScanning) return;
    document.getElementById('scanner-container').classList.remove('hidden');
    document.getElementById('scanner-status').textContent = "กำลังเปิดกล้อง...";
    const onScanSuccess = (decodedText, decodedResult) => {
        document.getElementById('customer-identifier').value = decodedText;
        searchCustomerById(decodedText);
        stopScanner();
    };
    qrCodeScanner = new Html5Qrcode("qr-reader");
    qrCodeScanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, (err) => {})
    .then(() => { document.getElementById('scanner-status').textContent = "วาง QR Code ในกรอบ"; })
    .catch(err => { document.getElementById('scanner-status').textContent = "ไม่สามารถเข้าถึงกล้องได้"; });
};

const stopScanner = () => {
    document.getElementById('scanner-container').classList.add('hidden');
    if (qrCodeScanner?.isScanning) {
        qrCodeScanner.stop().catch(err => {});
    }
    qrCodeScanner = null;
};

// 11. ส่วนการค้นหาลูกค้าแบบสด (Live Search)
const handleLiveSearchInput = () => {
    const searchTerm = document.getElementById('customer-identifier').value.toLowerCase();
    const resultsContainer = document.getElementById('live-search-results');
    if (searchTerm.length < 2) {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
        return;
    }
    const filtered = allCustomersCache.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.tel.includes(searchTerm)
    );
    renderLiveSearchResults(filtered);
};

const renderLiveSearchResults = (customers) => {
    const resultsContainer = document.getElementById('live-search-results');
    resultsContainer.innerHTML = '';
    if (customers.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }
    customers.slice(0, 10).forEach(customer => {
        const item = document.createElement('div');
        item.className = 'live-search-item';
        item.dataset.customerId = customer.id;
        item.innerHTML = `
            <p class="name">${customer.name}</p>
            <p class="tel">${customer.tel}</p>
        `;
        item.addEventListener('click', () => {
            selectCustomerFromSearch(customer.id);
        });
        resultsContainer.appendChild(item);
    });
    resultsContainer.style.display = 'block';
};

const selectCustomerFromSearch = (customerId) => {
    const customer = allCustomersCache.find(c => c.id === customerId);
    if (customer) {
        activeCustomer = customer;
        updateCustomerDetailsUI();
        document.getElementById('customer-identifier').value = '';
        document.getElementById('live-search-results').style.display = 'none';
    }
};

// 12. ส่วนจัดการข้อมูลลูกค้า (Customer Data Logic)
const selectGeneralCustomerByDefault = () => {
    const generalCustomer = allCustomersCache.find(c => c.tel === '0000000000');
    if (generalCustomer) {
        activeCustomer = generalCustomer;
        updateCustomerDetailsUI();
    } else {
        resetCustomerDetails();
        showError('staff-message', 'ไม่พบบัญชี "ลูกค้าทั่วไป" ในระบบ');
    }
};

const searchCustomerById = async (customerId) => {
    if (!customerId) return;
    hideError('staff-message');
    resetCustomerDetails();
    changeView('loading');

    try {
        const docRef = doc(db, CUSTOMER_COLLECTION, customerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            activeCustomer = { id: docSnap.id, ...docSnap.data() };
            updateCustomerDetailsUI();
        } else {
            showError('staff-message', 'ไม่พบข้อมูลลูกค้า (ID ไม่ถูกต้อง)');
        }
    } catch (error) {
        showError('staff-message', 'เกิดข้อผิดพลาดในการค้นหา');
    }
    changeView('dashboard');
};

const refreshActiveCustomerData = async () => {
    if (!activeCustomer || !activeCustomer.id) return;
    try {
        const customerRef = doc(db, CUSTOMER_COLLECTION, activeCustomer.id);
        const customerDoc = await getDoc(customerRef);
        if (customerDoc.exists()) {
            activeCustomer = { id: customerDoc.id, ...customerDoc.data() };
            updateCustomerDetailsUI();
        } else {
            resetCustomerDetails();
            showError('staff-message', 'ไม่พบข้อมูลลูกค้าคนปัจจุบันแล้ว');
        }
    } catch (error) {
        showError('staff-message', 'เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้าล่าสุด');
    }
};

// 13. ส่วนแสดงประวัติการทำรายการของลูกค้า (Customer Transaction History)
const fetchAndDisplayCustomerTransactions = async () => {
    if (!activeCustomer) return;
    changeView('loading');
    const container = document.getElementById('transaction-list-container');
    container.innerHTML = '<div class="loader"></div>';
    document.getElementById('history-customer-name').textContent = `ประวัติของ: ${activeCustomer.name}`;

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    try {
        const q = query(
            collection(db, TRANSACTION_COLLECTION),
            where("customerId", "==", activeCustomer.id),
            // where("timestamp", ">=", ninetyDaysAgo), // Show more history for undo
            orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        renderTransactions(transactions);
        changeView('history');
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p class="error-message" style="display:block;">ไม่สามารถโหลดประวัติได้</p>`;
        changeView('history');
    }
};

const handleUndoTransaction = async (transactionId) => {
    showConfirmModal(
        'ยืนยันการยกเลิกรายการ?',
        'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกรายการนี้? การกระทำนี้จะคืนแต้ม/สต็อกสินค้า และไม่สามารถทำซ้ำได้',
        async () => {
            changeView('loading');
            try {
                const result = await undoTransactionCallable({ transactionId });
                showModal('สำเร็จ!', result.data.message);
            } catch (error) {
                showModal('เกิดข้อผิดพลาด', `ไม่สามารถยกเลิกรายการได้: ${error.message}`, false);
            } finally {
                // Refresh data after undo
                await fetchAndDisplayCustomerTransactions();
                await refreshActiveCustomerData();
            }
        },
        '↩️',
        'ยืนยันการยกเลิก'
    );
};


const renderTransactions = (transactions) => {
    const container = document.getElementById('transaction-list-container');
    container.innerHTML = '';
    if (transactions.length === 0) {
        container.innerHTML = `<div class="empty-state" data-emoji="🧾"><p><strong>ยังไม่มีรายการ</strong></p><p>ลูกค้ายังไม่มีการเคลื่อนไหวแต้ม</p></div>`;
        return;
    }

    transactions.forEach(tx => {
        const item = document.createElement('div');
        item.className = 'transaction-item';

        const date = tx.timestamp.toDate().toLocaleDateString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        let title = '';
        let details = '';
        let pointsText = '';
        let undoButton = '';
        
        const isUndone = tx.status === 'undone';
        
        if (isUndone) {
            item.style.opacity = '0.5';
            item.style.background = '#f1f5f9';
        }

        if (tx.type === 'add_points' || tx.type === 'redeem' || tx.type === 'manual_adjustment') {
             if (!isUndone) {
                undoButton = `<button class="btn btn--danger btn--sm undo-btn" data-tx-id="${tx.id}">ย้อนกลับ</button>`;
             } else {
                undoButton = `<span class="undone-badge">ยกเลิกแล้ว</span>`
             }
        }
        
        if (tx.type === 'undo') {
             title = '↩️ ยกเลิกรายการ';
             details = `ยกเลิกรายการประเภท "${tx.undoneTransactionType}"`;
             pointsText = tx.points_change >= 0 
                ? `<span class="transaction-item__points transaction-item__points--gain">+${tx.points_change}</span>`
                : `<span class="transaction-item__points transaction-item__points--loss">${tx.points_change}</span>`;

        } else if (tx.type === 'add_points') {
            item.style.borderColor = 'var(--success-color)';
            title = 'ได้รับแต้มจากการซื้อ';
            details = `ยอดซื้อ: ${tx.purchase_amount.toLocaleString()} บาท`;
            pointsText = `<span class="transaction-item__points transaction-item__points--gain">+${tx.points_change}</span>`;
        } else if (tx.type === 'redeem') {
            item.style.borderColor = 'var(--danger-color)';
            title = 'แลกของรางวัล';
            details = `ของรางวัล: ${tx.rewardName}`;
            pointsText = `<span class="transaction-item__points transaction-item__points--loss">${tx.points_change}</span>`;
        } else if (tx.type === 'manual_adjustment') {
            item.style.borderColor = tx.points_change >= 0 ? 'var(--primary-color)' : 'var(--secondary-color)';
            title = 'พนักงานปรับแต้ม';
            details = `เหตุผล: ${tx.reason || 'ไม่ระบุ'}`;
            pointsText = tx.points_change >= 0 
                ? `<span class="transaction-item__points transaction-item__points--gain">+${tx.points_change}</span>`
                : `<span class="transaction-item__points transaction-item__points--loss">${tx.points_change}</span>`;
        }
        
        item.innerHTML = `
            <div class="transaction-item__info">
                <p class="title">${title}</p>
                <p class="details">${details}</p>
                <p class="date">${date}</p>
            </div>
            <div class="transaction-item__actions">
                ${pointsText}
                ${undoButton}
            </div>
        `;
        
        const undoBtnEl = item.querySelector('.undo-btn');
        if (undoBtnEl) {
            undoBtnEl.addEventListener('click', () => handleUndoTransaction(undoBtnEl.dataset.txId));
        }

        container.appendChild(item);
    });
};



// 14. ส่วนจัดการรายชื่อลูกค้า (Customer List Management)
const showCustomerListView = async () => {
    changeView('customerList');
    showProgressBar(20);
    const container = document.getElementById('customer-list-container');
    container.innerHTML = '<tr><td colspan="5"><div class="loader" style="margin: 2rem auto;"></div></td></tr>';

    if (allCustomersCache.length === 0) {
        await fetchInitialCustomerCache();
    }
    showProgressBar(70);

    customerListPage = 1; // Reset to first page
    filterAndSortCustomers();
    showProgressBar(100);
};

const filterAndSortCustomers = () => {
    const searchTerm = document.getElementById('customer-search-input').value.toLowerCase();
    const sortValue = document.getElementById('sort-select').value;
    let filtered = [...allCustomersCache];

    if (searchTerm) {
        filtered = filtered.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.tel.includes(searchTerm)
        );
    }

    switch (sortValue) {
        case 'date_asc':
            filtered.sort((a, b) => (a.join_date?.seconds || 0) - (b.join_date?.seconds || 0));
            break;
        case 'points_desc':
            filtered.sort((a, b) => b.total_points - a.total_points);
            break;
        case 'points_asc':
            filtered.sort((a, b) => a.total_points - b.total_points);
            break;
        case 'date_desc':
        default:
             filtered.sort((a, b) => (b.join_date?.seconds || 0) - (a.join_date?.seconds || 0));
            break;
    }

    const paginatedCustomers = filtered.slice(
        (customerListPage - 1) * customerListItemsPerPage,
        customerListPage * customerListItemsPerPage
    );

    renderCustomerList(paginatedCustomers);
    renderPagination(
        document.getElementById('customer-list-pagination'),
        customerListPage,
        filtered.length,
        customerListItemsPerPage,
        (page) => {
            customerListPage = page;
            filterAndSortCustomers();
        }
    );
};

const renderCustomerList = (customers) => {
    const container = document.getElementById('customer-list-container');
    container.innerHTML = '';

    if (customers.length === 0) {
        const emptyRow = `<tr><td colspan="5"><div class="empty-state" data-emoji="👤"><p><strong>ไม่พบข้อมูลลูกค้า</strong></p><p>ยังไม่มีลูกค้าที่ตรงกับการค้นหาของคุณ</p></div></td></tr>`;
        container.innerHTML = emptyRow;
        return;
    }

    customers.forEach(customer => {
        const row = document.createElement('tr');
        const joinDate = customer.join_date?.seconds
            ? new Date(customer.join_date.seconds * 1000).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'N/A';
        
        row.innerHTML = `
            <td data-label="ชื่อ-นามสกุล">${customer.name}</td>
            <td data-label="เบอร์โทร">${customer.tel}</td>
            <td data-label="แต้ม">${customer.total_points.toLocaleString()}</td>
            <td data-label="วันที่สมัคร">${joinDate}</td>
            <td data-label="จัดการ">
                <div class="flex gap-2 justify-end">
                    <button class="btn btn--tertiary btn--sm edit-btn" aria-label="แก้ไขข้อมูลคุณ ${customer.name}">✏️</button>
                    <button class="btn btn--secondary btn--sm change-password-btn" aria-label="เปลี่ยนรหัสผ่านคุณ ${customer.name}">🔑</button>
                    <button class="btn btn--danger btn--sm delete-customer-btn" aria-label="ลบบัญชีคุณ ${customer.name}">🗑️</button>
                </div>
            </td>
        `;
        row.querySelector('.edit-btn').addEventListener('click', () => showEditCustomerModal(customer));
        row.querySelector('.change-password-btn').addEventListener('click', () => showChangePasswordModal(customer));
        row.querySelector('.delete-customer-btn').addEventListener('click', () => deleteCustomer(customer));
        
        container.appendChild(row);
    });
};

const showEditCustomerModal = (customer) => {
    if (!customer) return;
    document.getElementById('edit-customer-id').value = customer.id;
    document.getElementById('edit-customer-name').value = customer.name;
    document.getElementById('edit-customer-tel').value = customer.tel;
    document.getElementById('edit-customer-points').value = customer.total_points;
    document.getElementById('edit-customer-remainder').value = (customer.purchase_remainder || 0).toFixed(2);
    editCustomerModal.classList.remove('hidden');
};

const saveCustomerDetails = async () => {
    saveCustomerBtn.classList.add('is-loading');
    saveCustomerBtn.disabled = true;

    const customerId = document.getElementById('edit-customer-id').value;
    const name = document.getElementById('edit-customer-name').value.trim();
    const tel = document.getElementById('edit-customer-tel').value.trim();
    const points = parseInt(document.getElementById('edit-customer-points').value, 10);
    const remainder = parseFloat(document.getElementById('edit-customer-remainder').value);

    if (!customerId || !name || !tel || isNaN(points) || isNaN(remainder) || remainder < 0) {
        showModal('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกข้อมูลลูกค้าให้ครบถ้วนและถูกต้อง', false);
        saveCustomerBtn.classList.remove('is-loading');
        saveCustomerBtn.disabled = false;
        return;
    }

    try {
        const customerRef = doc(db, CUSTOMER_COLLECTION, customerId);
        await updateDoc(customerRef, { name, tel, total_points: points, purchase_remainder: remainder });
        showModal('สำเร็จ', 'อัปเดตข้อมูลลูกค้าเรียบร้อยแล้ว');
        editCustomerModal.classList.add('hidden');

        const index = allCustomersCache.findIndex(c => c.id === customerId);
        if (index > -1) {
            allCustomersCache[index] = { ...allCustomersCache[index], name, tel, total_points: points, purchase_remainder: remainder };
        }
        filterAndSortCustomers(); // Re-render the list

        if (activeCustomer && activeCustomer.id === customerId) {
            await refreshActiveCustomerData();
        }

    } catch (error) {
        showModal('เกิดข้อผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลลูกค้าได้', false);
    } finally {
        saveCustomerBtn.classList.remove('is-loading');
        saveCustomerBtn.disabled = false;
    }
};

const showChangePasswordModal = (customer) => {
    if (!customer) return;
    document.getElementById('change-password-customer-id').value = customer.id;
    document.getElementById('change-password-title').textContent = `🔑 เปลี่ยนรหัสผ่านสำหรับ ${customer.name}`;
    document.getElementById('new-password').value = '';
    hideError('change-password-error');
    changePasswordModal.classList.remove('hidden');
};

const saveNewPassword = async () => {
    saveNewPasswordBtn.classList.add('is-loading');
    saveNewPasswordBtn.disabled = true;

    const customerId = document.getElementById('change-password-customer-id').value;
    const newPassword = document.getElementById('new-password').value.trim();
    const errorEl = 'change-password-error';
    hideError(errorEl);

    if (newPassword.length < 6 || newPassword.length > 16) {
        showError(errorEl, 'รหัสผ่านต้องมีความยาว 6-16 ตัวอักษร');
        saveNewPasswordBtn.classList.remove('is-loading');
        saveNewPasswordBtn.disabled = false;
        return;
    }
    
    try {
        await changePasswordCallable({ uid: customerId, newPassword: newPassword });

        const index = allCustomersCache.findIndex(c => c.id === customerId);
        if (index > -1) {
            allCustomersCache[index].password = newPassword;
        }

        showModal('สำเร็จ!', `รหัสผ่านของลูกค้าถูกเปลี่ยนเรียบร้อยแล้ว`);
        changePasswordModal.classList.add('hidden');

    } catch (error) {
        showError(errorEl, 'เกิดข้อผิดพลาด: ' + error.message);
    } finally {
        saveNewPasswordBtn.classList.remove('is-loading');
        saveNewPasswordBtn.disabled = false;
    }
};

const deleteCustomer = (customer) => {
    if (!customer) return;

    const onConfirm = async () => {
        changeView('loading');
        try {
            await deleteCustomerCallable({ uid: customer.id });
            
            allCustomersCache = allCustomersCache.filter(c => c.id !== customer.id);
            
            showModal('ลบสำเร็จ', `บัญชีของ ${customer.name} ถูกลบออกจากระบบทั้งหมดแล้ว`);
        
        } catch (error) {
             showModal('เกิดข้อผิดพลาด', `ไม่สามารถลบบัญชีได้: ${error.message}`, false);
        } finally {
            showCustomerListView(); // Go back to the list view
        }
    };

    showConfirmModal(
        'ยืนยันการลบ?',
        `คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีของ "${customer.name}"? การกระทำนี้จะลบบัญชีออกจากระบบล็อกอินและข้อมูลแต้มทั้งหมด ไม่สามารถย้อนกลับได้`,
        onConfirm,
        '🗑️',
        'ยืนยันการลบ'
    );
};

// 15. ส่วนการลงทะเบียนลูกค้าใหม่โดยพนักงาน (New Customer Registration)
const showAddCustomerModal = () => {
    document.getElementById('add-customer-name').value = '';
    document.getElementById('add-customer-tel').value = '';
    document.getElementById('add-customer-password').value = '';
    hideError('add-customer-error');
    document.getElementById('add-customer-modal').classList.remove('hidden');
};

const hideAddCustomerModal = () => {
    document.getElementById('add-customer-modal').classList.add('hidden');
};

const registerNewCustomer = async () => {
    saveNewCustomerBtn.classList.add('is-loading');
    saveNewCustomerBtn.disabled = true;

    const name = document.getElementById('add-customer-name').value.trim();
    const tel = document.getElementById('add-customer-tel').value.trim();
    const password = document.getElementById('add-customer-password').value.trim();
    const errorEl = 'add-customer-error';
    hideError(errorEl);

    if (!name || tel.length < 10 || password.length < 6 || password.length > 16) {
        showError(errorEl, 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง (รหัสผ่าน 6-16 ตัว)');
        saveNewCustomerBtn.classList.remove('is-loading');
        saveNewCustomerBtn.disabled = false;
        return;
    }
    
    try {
        // Use a temporary auth instance to avoid logging out the staff member
        const { getAuth: getTempAuth, createUserWithEmailAndPassword: tempCreateUser } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
        const tempApp = initializeApp(firebaseConfig, `temp-app-${Date.now()}`);
        const tempAuth = getTempAuth(tempApp);
        const email = `${tel}@qrmember.com`;
        
        const userCredential = await tempCreateUser(tempAuth, email, password);
        const user = userCredential.user;

        const newCustomerData = {
            name: name,
            tel: tel,
            password: password,
            total_points: 0,
            lifetime_points: 0,
            purchase_remainder: 0,
            join_date: serverTimestamp()
        };
        await setDoc(doc(db, CUSTOMER_COLLECTION, user.uid), newCustomerData);

        allCustomersCache.push({ id: user.uid, ...newCustomerData, join_date: { seconds: Date.now() / 1000 } });
        filterAndSortCustomers();

        showModal('สมัครสำเร็จ!', `ลูกค้า ${name} เป็นสมาชิกเรียบร้อยแล้ว แจ้งรหัสผ่านให้ลูกค้าได้เลย`);
        hideAddCustomerModal();

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            showError(errorEl, 'เบอร์โทรศัพท์นี้ถูกใช้งานในระบบแล้ว');
        } else {
            showError(errorEl, 'เกิดข้อผิดพลาด: ' + error.message);
        }
    } finally {
        saveNewCustomerBtn.classList.remove('is-loading');
        saveNewCustomerBtn.disabled = false;
    }
};


// 16. ส่วนจัดการแต้มและของรางวัล (Points & Rewards Logic)
const updatePointsCalculationUI = () => {
    const amount = parseFloat(document.getElementById('purchase-amount').value) || 0;
    if (!activeCustomer || amount <= 0) {
        calculationBreakdownEl.classList.add('hidden');
        return;
    };

    const currentRemainder = activeCustomer.purchase_remainder || 0;
    const totalValueForPoints = amount + currentRemainder;
    const pointsToAdd = Math.floor(totalValueForPoints * POINTS_PER_BAHT);
    const newRemainder = totalValueForPoints % 100;

    document.getElementById('calc-remainder').textContent = currentRemainder.toFixed(2);
    document.getElementById('calc-total').textContent = totalValueForPoints.toFixed(2);
    document.getElementById('points-to-add').textContent = pointsToAdd.toLocaleString();
    document.getElementById('calc-new-remainder').textContent = newRemainder.toFixed(2);

    calculationBreakdownEl.classList.remove('hidden');
};

// 16. ส่วนจัดการแต้มและของรางวัล (Points & Rewards Logic)
// ... (โค้ดอื่น ๆ) ...

// (อยู่ในไฟล์ staff.js)
// 16. ส่วนจัดการแต้มและของรางวัล (Points & Rewards Logic)
// ... (โค้ดอื่น ๆ) ...

const addPoints = async () => {
    // 🛑 หยุด! อย่าเพิ่งรัน transaction
    // addPointsBtn.classList.add('is-loading'); // 👈 เอานี่ออกก่อน
    // addPointsBtn.disabled = true; // 👈 เอานี่ออกก่อน

    const amountInput = document.getElementById('purchase-amount');
    const amount = parseFloat(amountInput.value);
    
    const backdateInput = document.getElementById('backdate-timestamp').value;
    let transactionTimestamp;

    if (backdateInput) {
        try {
            const dateParts = backdateInput.split('-');
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[2]);
            const transactionDate = new Date(year, month, day, 12, 0, 0); 
            
            if (isNaN(transactionDate.getTime())) {
                 throw new Error("วันที่ไม่ถูกต้อง");
            }
            transactionTimestamp = Timestamp.fromDate(transactionDate);
        } catch(e) {
             showModal('วันที่ผิดพลาด', 'รูปแบบวันที่ย้อนหลังไม่ถูกต้อง', false);
             // 💥 ไม่ต้องคืนค่าปุ่ม loading ที่นี่ เพราะยังไม่ได้กด
             return;
        }
    } else {
        transactionTimestamp = serverTimestamp();
    }

    if (!activeCustomer || isNaN(amount) || amount <= 0) {
        showModal('ข้อมูลไม่ถูกต้อง', 'กรุณาเลือกลูกค้าและกรอกยอดซื้อให้ถูกต้อง', false);
        // 💥 ไม่ต้องคืนค่าปุ่ม loading ที่นี่
        return;
    }

    // ================== 👇 จุดที่กูเพิ่มให้มึง 👇 ==================
    // คำนวณแต้มที่จะได้โชว์ก่อน (ก๊อปมาจาก logic ใน transaction)
    const currentRemainder = activeCustomer.purchase_remainder || 0;
    const totalValueForPoints = amount + currentRemainder;
    const pointsToAdd = Math.floor(totalValueForPoints * POINTS_PER_BAHT);
    const customerNameBeforeReset = activeCustomer.name; // 🔥 เก็บชื่อไว้ก่อน

    const onConfirm = async () => {
        // พอกดยืนยันใน modal ค่อยให้ปุ่มมัน loading
        addPointsBtn.classList.add('is-loading');
        addPointsBtn.disabled = true;

        try {
            await runTransaction(db, async (transaction) => {
                const customerRef = doc(db, CUSTOMER_COLLECTION, activeCustomer.id);
                const customerDoc = await transaction.get(customerRef);
                if (!customerDoc.exists()) throw "Customer does not exist.";

                const currentData = customerDoc.data();
                // คำนวณอีกรอบใน transaction เพื่อความชัวร์ (เผื่อข้อมูลเปลี่ยน)
                const freshRemainder = currentData.purchase_remainder || 0;
                const freshTotalValue = amount + freshRemainder;
                const freshPointsToAdd = Math.floor(freshTotalValue * POINTS_PER_BAHT);
                const newRemainder = freshTotalValue % 100;

                const newTotalPoints = (currentData.total_points || 0) + freshPointsToAdd;
                const newLifetimePoints = (currentData.lifetime_points || 0) + freshPointsToAdd;

                transaction.update(customerRef, {
                    total_points: newTotalPoints,
                    lifetime_points: newLifetimePoints,
                    purchase_remainder: newRemainder
                });
                const transactionRef = doc(collection(db, TRANSACTION_COLLECTION));
                
                transaction.set(transactionRef, {
                    customerId: activeCustomer.id, customerName: activeCustomer.name, staffId: currentStaff.uid, staffEmail: currentStaff.email,
                    type: 'add_points', points_change: freshPointsToAdd, purchase_amount: amount, 
                    timestamp: transactionTimestamp 
                });
            });
            
            // 🔥🔥 [จุดที่แก้ไข] 🔥🔥
            showModal('สำเร็จ', `บันทึกแต้มให้คุณ ${customerNameBeforeReset} เรียบร้อยแล้ว`);
            selectGeneralCustomerByDefault(); // <-- (แทนที่ await refreshActiveCustomerData())
            amountInput.value = '';
            document.getElementById('backdate-timestamp').value = ''; 
            calculationBreakdownEl.classList.add('hidden');
            // 🔥🔥 [จบจุดที่แก้ไข] 🔥🔥
            
        } catch (error) {
            showModal('เกิดข้อผิดพลาด', `ไม่สามารถบันทึกแต้มได้: ${error}`, false);
        } finally {
            // คืนค่าปุ่มไม่ว่าจะสำเร็จหรือล้มเหลว
            addPointsBtn.classList.remove('is-loading');
            addPointsBtn.disabled = false;
        }
    };

    // นี่ไง! พระเอกของเรา!
    showConfirmModal(
        'ยืนยันการเพิ่มแต้ม?',
        `คุณกำลังจะเพิ่ม ${pointsToAdd} แต้ม (จากยอดซื้อ ${amount} บ.) ให้กับลูกค้า:
        
        👤 **${activeCustomer.name}**
        
        ถูกต้องหรือไม่?`,
        onConfirm, // ฟังก์ชันที่จะรันเมื่อกดยืนยัน
        '💰',
        'ยืนยัน'
    );
    // ================== 👆 สิ้นสุดจุดที่กูเพิ่ม 👆 ==================
};

const manuallyAdjustPoints = async () => {
    if (!activeCustomer) return;

    const pointsInput = document.getElementById('adjustment-points');
    const reasonInput = document.getElementById('adjustment-reason');
    const pointsToAdjust = parseInt(pointsInput.value, 10);
    const reason = reasonInput.value.trim();

    if (isNaN(pointsToAdjust) || pointsToAdjust === 0 || !reason) {
        showModal('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกแต้ม (ต้องไม่ใช่ 0) และเหตุผล', false);
        return;
    }

    const onConfirm = async () => {
        adjustPointsBtn.classList.add('is-loading');
        adjustPointsBtn.disabled = true;
        try {
            await runTransaction(db, async (transaction) => {
                const customerRef = doc(db, CUSTOMER_COLLECTION, activeCustomer.id);
                const customerDoc = await transaction.get(customerRef);
                if (!customerDoc.exists()) throw "Customer does not exist.";

                const currentPoints = customerDoc.data().total_points || 0;
                const newTotalPoints = currentPoints + pointsToAdjust;

                if (newTotalPoints < 0) {
                    throw "แต้มคงเหลือไม่สามารถติดลบได้";
                }

                transaction.update(customerRef, { total_points: newTotalPoints });
                const transactionRef = doc(collection(db, TRANSACTION_COLLECTION));
                transaction.set(transactionRef, {
                    customerId: activeCustomer.id, customerName: activeCustomer.name, staffId: currentStaff.uid,
                    type: 'manual_adjustment', points_change: pointsToAdjust, reason: reason, timestamp: serverTimestamp()
                });
            });
            showModal('สำเร็จ', `ปรับแต้มของคุณ ${activeCustomer.name} จำนวน ${pointsToAdjust} แต้มเรียบร้อยแล้ว`);
            await refreshActiveCustomerData();
            pointsInput.value = '';
            reasonInput.value = '';
        } catch (error) {
            showModal('เกิดข้อผิดพลาด', `การปรับแต้มล้มเหลว: ${error}`, false);
        } finally {
             adjustPointsBtn.classList.remove('is-loading');
             adjustPointsBtn.disabled = false;
        }
    };

    showConfirmModal(
        'ยืนยันการปรับแต้ม?',
        `คุณต้องการปรับแต้ม ${pointsToAdjust} แต้ม ให้กับ ${activeCustomer.name} ใช่หรือไม่?`,
        onConfirm,
        '✏️'
    );
};

//  👇👇👇 [เพิ่มฟังก์ชันนี้ทั้งก้อนเข้าไป] 👇👇👇
const adjustPurchaseAmount = async () => {
    if (!activeCustomer) return;

    const amountInput = document.getElementById('purchase-adjustment-amount');
    const reasonInput = document.getElementById('purchase-adjustment-reason');
    const amount = parseFloat(amountInput.value);
    const reason = reasonInput.value.trim();

    if (isNaN(amount) || amount === 0 || !reason) {
        showModal('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกยอดเงิน (ต้องไม่ใช่ 0) และเหตุผลให้ครบถ้วน', false);
        return;
    }

    const onConfirm = async () => {
        adjustPurchaseBtn.classList.add('is-loading');
        adjustPurchaseBtn.disabled = true;
        try {
            const result = await adjustPurchaseCallable({ 
                customerId: activeCustomer.id, 
                customerName: activeCustomer.name,
                amount: amount, 
                reason: reason 
            });
            
            showModal('สำเร็จ!', result.data.message);
            await refreshActiveCustomerData();
            amountInput.value = '';
            reasonInput.value = '';

        } catch (error) {
            showModal('เกิดข้อผิดพลาด', `การปรับยอดล้มเหลว: ${error.message}`, false);
        } finally {
            adjustPurchaseBtn.classList.remove('is-loading');
            adjustPurchaseBtn.disabled = false;
        }
    };

    const actionText = amount > 0 ? "เพิ่มยอด" : "ลดยอด (คืนเงิน)";
    showConfirmModal(
        `ยืนยันการปรับยอด?`,
        `คุณกำลังจะ **${actionText} ${amount.toLocaleString()} บาท**
        สำหรับลูกค้า: **${activeCustomer.name}**
        ด้วยเหตุผล: "${reason}"
        
        การกระทำนี้จะมีผลต่อแต้มสะสมและรายงานยอดขายทันที`,
        onConfirm,
        '💰',
        'ยืนยัน'
    );
};
//  👆👆👆 [เพิ่มฟังก์ชันนี้ทั้งก้อนเข้าไป] 👆👆👆

const redeemReward = async (rewardId, buttonElement) => {
    const reward = rewardsCache.find(r => r.id === rewardId);
    if (!activeCustomer || !reward) return;

    const onConfirm = async () => {
        buttonElement.classList.add('is-loading');
        buttonElement.disabled = true;

        try {
            await runTransaction(db, async (transaction) => {
                const customerRef = doc(db, CUSTOMER_COLLECTION, activeCustomer.id);
                const rewardRef = doc(db, REWARDS_COLLECTION, reward.id);
                const [customerDoc, rewardDoc] = await Promise.all([transaction.get(customerRef), transaction.get(rewardRef)]);

                if (!customerDoc.exists() || !rewardDoc.exists()) throw "Customer or Reward not found.";
                const currentPoints = customerDoc.data().total_points;
                const currentStock = rewardDoc.data().stock;

                if (currentPoints < reward.points_required) throw "Not enough points.";
                if (currentStock <= 0) throw "Out of stock.";

                transaction.update(customerRef, { total_points: currentPoints - reward.points_required });
                transaction.update(rewardRef, { stock: currentStock - 1 });
                transaction.set(doc(collection(db, TRANSACTION_COLLECTION)), {
                    customerId: activeCustomer.id, customerName: activeCustomer.name, staffId: currentStaff.uid,
                    type: 'redeem', points_change: -reward.points_required, rewardId: reward.id, rewardName: reward.name, timestamp: serverTimestamp()
                });
            });
            showModal('แลกสำเร็จ!', `คุณ ${activeCustomer.name} แลก ${reward.name} เรียบร้อยแล้ว`);
            await refreshActiveCustomerData();
        } catch (error) {
            showModal('เกิดข้อผิดพลาด', `การแลกล้มเหลว: ${error}`, false);
        } finally {
            // ไม่ว่าจะสำเร็จหรือล้มเหลว ก็ให้ปุ่มกลับมาเป็นปกติเสมอ
            buttonElement.classList.remove('is-loading');
            buttonElement.disabled = false;
        }
    };

    showConfirmModal(
        'ยืนยันการแลกรางวัล?',
        `แลก "${reward.name}" ให้คุณ ${activeCustomer.name}?
จะใช้ ${reward.points_required.toLocaleString()} แต้ม`,
        onConfirm,
        '🎁'
    );
};


// 17. ส่วนจัดการของรางวัล (สำหรับพนักงาน) (Rewards Management)
const listenToRewards = () => {
    if (rewardsListener) rewardsListener();
    rewardsListener = onSnapshot(collection(db, REWARDS_COLLECTION), (snapshot) => {
        rewardsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (!views.rewards.classList.contains('hidden')) renderRewardsAdminList();
        if(activeCustomer) updateStaffRedeemList();
    });
};

const saveReward = async () => {
    saveRewardBtn.classList.add('is-loading');
    saveRewardBtn.disabled = true;

    const rewardId = document.getElementById('reward-id').value;
    const name = document.getElementById('reward-name').value.trim();
    const points = parseInt(document.getElementById('reward-points').value, 10);
    const stock = parseInt(document.getElementById('reward-stock').value, 10);

    if (!name || isNaN(points) || isNaN(stock) || points < 0 || stock < 0) {
        showModal('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน', false);
        saveRewardBtn.classList.remove('is-loading');
        saveRewardBtn.disabled = false;
        return;
    }
    const rewardData = { name, points_required: points, stock };

    try {
        if (rewardId) {
            await setDoc(doc(db, REWARDS_COLLECTION, rewardId), rewardData);
        } else {
            await addDoc(collection(db, REWARDS_COLLECTION), rewardData);
        }
        showModal('บันทึกสำเร็จ', 'ข้อมูลของรางวัลถูกอัปเดตแล้ว');
        rewardFormModal.classList.add('hidden');
    } catch (error) {
        showModal('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', false);
    } finally {
        saveRewardBtn.classList.remove('is-loading');
        saveRewardBtn.disabled = false;
    }
};

const deleteReward = async (rewardId) => {
    const rewardToDelete = rewardsCache.find(r => r.id === rewardId);
    const onConfirm = async () => {
        try {
            await deleteDoc(doc(db, REWARDS_COLLECTION, rewardId));
            showModal('ลบสำเร็จ', 'ของรางวัลถูกลบออกจากระบบแล้ว');
        } catch (error) {
            showModal('เกิดข้อผิดพลาด', 'ไม่สามารถลบของรางวัลได้', false);
        }
    };
    showConfirmModal(
        'ยืนยันการลบ?',
        `คุณแน่ใจหรือไม่ว่าต้องการลบของรางวัล "${rewardToDelete.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`,
        onConfirm,
        '🗑️',
        'ยืนยันการลบ'
    );
};

// 18. ✨ UPDATED ✨ ส่วนแสดงผลสรุปข้อมูล (Analytics Dashboard)
const generateAnalytics = async () => {
    changeView('analytics');
    showProgressBar(10);
    const salesContainer = document.getElementById('sales-summary-content');
    const memberTab = document.getElementById('member-analytics-tab');
    
    salesContainer.innerHTML = '<div class="loader" style="margin: 2rem auto;"></div>';
    memberTab.innerHTML = '<div class="loader" style="margin: 2rem auto;"></div>';

    // Reset date picker
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';

    try {
        showProgressBar(30);
        // Fetch default sales data
        const salesResult = await getSalesAnalyticsCallable({});
        showProgressBar(60);
        const { salesToday, salesThisWeek, salesThisMonth, salesThisYear } = salesResult.data;
        salesContainer.innerHTML = `
            <div class="analytics-grid">
                <div class="stat-card">
                    <div class="stat-icon">📅</div>
                    <div class="stat-value">${salesToday.toLocaleString('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 })}</div>
                    <div class="stat-label">ยอดขายวันนี้</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-value">${salesThisWeek.toLocaleString('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 })}</div>
                    <div class="stat-label">ยอดขายสัปดาห์นี้</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${salesThisMonth.toLocaleString('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 })}</div>
                    <div class="stat-label">ยอดขายเดือนนี้</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-value">${salesThisYear.toLocaleString('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 })}</div>
                    <div class="stat-label">ยอดขายปีนี้</div>
                </div>
            </div>`;

        // Fetch member data
        const [customersSnapshot, transactionsSnapshot] = await Promise.all([
            getDocs(collection(db, CUSTOMER_COLLECTION)),
            getDocs(collection(db, TRANSACTION_COLLECTION))
        ]);

        const totalCustomers = customersSnapshot.size;
        const allCustomers = customersSnapshot.docs.map(doc => doc.data());

        let totalPointsGiven = 0;
        let totalPointsRedeemed = 0;
        const redemptionCounts = {};

        transactionsSnapshot.forEach(doc => {
            const tx = doc.data();
            if (tx.type === 'add_points' || (tx.type === 'manual_adjustment' && tx.points_change > 0)) {
                totalPointsGiven += tx.points_change;
            }
            if (tx.type === 'redeem') {
                totalPointsRedeemed += Math.abs(tx.points_change);
                redemptionCounts[tx.rewardId] = (redemptionCounts[tx.rewardId] || 0) + 1;
            }
        });

        const topCustomers = allCustomers.sort((a, b) => b.total_points - a.total_points).slice(0, 5);
        const topRewards = Object.entries(redemptionCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([rewardId, count]) => {
                const reward = rewardsCache.find(r => r.id === rewardId);
                return { name: reward ? reward.name : 'ของรางวัลที่ถูกลบ', count: count };
            });
        
        memberTab.innerHTML = `
            <div class="analytics-grid" style="margin-top: 1.5rem;">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-value">${totalCustomers.toLocaleString()}</div>
                    <div class="stat-label">ลูกค้าทั้งหมด</div>
                </div>
                <div class="stat-card stat-card--success">
                    <div class="stat-icon">✨</div>
                    <div class="stat-value">${totalPointsGiven.toLocaleString()}</div>
                    <div class="stat-label">แต้มที่แจกไปทั้งหมด</div>
                </div>
                <div class="stat-card stat-card--danger">
                    <div class="stat-icon">🎁</div>
                    <div class="stat-value">${totalPointsRedeemed.toLocaleString()}</div>
                    <div class="stat-label">แต้มที่แลกไปทั้งหมด</div>
                </div>
            </div>
            <div class="analytics-grid" style="grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
                <div class="list-card">
                    <h3>🏆 5 อันดับลูกค้าแต้มสูงสุด</h3>
                    <ol>${topCustomers.length > 0 ? topCustomers.map(c => `<li>${c.name} - <strong>${c.total_points.toLocaleString()}</strong> แต้ม</li>`).join('') : '<li data-emoji="🤷‍♀️">ยังไม่มีข้อมูล</li>'}</ol>
                </div>
                <div class="list-card">
                    <h3>🎁 5 ของรางวัลยอดนิยม</h3>
                    <ol>${topRewards.length > 0 ? topRewards.map(r => `<li>${r.name} - <strong>${r.count.toLocaleString()}</strong> ครั้ง</li>`).join('') : '<li data-emoji="🛍️">ยังไม่มีข้อมูล</li>'}</ol>
                </div>
            </div>`;
        showProgressBar(100);
    } catch (error) {
        const errorMessage = `<p class="error-message" style="display:block;">ไม่สามารถโหลดข้อมูลสรุปได้: ${error.message}</p>`;
        salesContainer.innerHTML = errorMessage;
        memberTab.innerHTML = errorMessage;
        showProgressBar(100);
    }
};

const searchSalesByDateRange = async () => {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (!startDate || !endDate) {
        showModal('ข้อมูลไม่ครบ', 'กรุณาเลือกทั้งวันที่เริ่มต้นและสิ้นสุด', false);
        return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        showModal('วันที่ไม่ถูกต้อง', 'วันที่เริ่มต้นต้องมาก่อนวันที่สิ้นสุด', false);
        return;
    }

    const salesContainer = document.getElementById('sales-summary-content');
    salesContainer.innerHTML = '<div class="loader" style="margin: 2rem auto;"></div>';

    showProgressBar(30);
    try {
        const result = await getSalesAnalyticsCallable({ startDate, endDate });
        showProgressBar(80);
        const { salesInRange } = result.data;
        const formattedStartDate = new Date(startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric'});
        const formattedEndDate = new Date(endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric'});

        salesContainer.innerHTML = `
             <div class="analytics-grid" style="margin-top: 1.5rem;">
                <div class="stat-card" style="grid-column: 1 / -1;">
                    <div class="stat-value text-purple-600">${salesInRange.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</div>
                    <div class="stat-label">ยอดขายรวมจากวันที่ ${formattedStartDate} ถึง ${formattedEndDate}</div>
                </div>
            </div>
        `;
        showProgressBar(100);
    } catch (error) {
         salesContainer.innerHTML = `<p class="error-message" style="display:block;">ไม่สามารถโหลดข้อมูลได้: ${error.message}</p>`;
         showProgressBar(100);
    }
};


// 19. ส่วนอัปเดต UI และการแสดงผล (สำหรับพนักงาน) (UI Update Functions)
const resetCustomerDetails = () => {
    activeCustomer = null;
    document.getElementById('staff-customer-detail').classList.add('hidden');
    document.getElementById('staff-action-area').classList.add('hidden');
    document.getElementById('customer-identifier').value = '';
    document.getElementById('purchase-amount').value = '';
    calculationBreakdownEl.classList.add('hidden');
    hideError('staff-message');
};

const updateCustomerDetailsUI = () => {
    if (!activeCustomer) return;
    document.getElementById('staff-detail-name').textContent = activeCustomer.name;
    document.getElementById('staff-detail-points').textContent = activeCustomer.total_points.toLocaleString();
    const remainder = activeCustomer.purchase_remainder || 0;
    document.getElementById('staff-detail-remainder').textContent = remainder.toFixed(2);

    const passwordSpan = document.getElementById('staff-detail-password');
    passwordSpan.textContent = '******';
    passwordSpan.dataset.password = activeCustomer.password || '';

    const toggleBtn = document.getElementById('toggle-password-visibility');
    toggleBtn.textContent = '👁️';
    toggleBtn.setAttribute('aria-label', 'แสดงรหัสผ่าน');
    
    document.getElementById('staff-customer-detail').classList.remove('hidden');
    document.getElementById('staff-action-area').classList.remove('hidden');
    updateStaffRedeemList();
};

const updateStaffRedeemList = () => {
    const listEl = document.getElementById('staff-rewards-list');
    const sortValue = document.getElementById('staff-redeem-sort-select').value;
    const searchTerm = document.getElementById('redeem-search-input').value.toLowerCase();
    listEl.innerHTML = '';
    
    if (rewardsCache.length === 0) {
        listEl.innerHTML = `<div class="empty-state" data-emoji="🎁"><p><strong>ยังไม่มีของรางวัล</strong></p><p>ไปที่หน้า 'จัดการของรางวัล' เพื่อเพิ่ม</p></div>`;
        return;
    }
    const currentPoints = activeCustomer?.total_points || 0;

    let filteredRewards = [...rewardsCache];
    if (searchTerm) {
        filteredRewards = filteredRewards.filter(r => r.name.toLowerCase().includes(searchTerm));
    }

    if (sortValue === 'points_desc') {
        filteredRewards.sort((a, b) => b.points_required - a.points_required);
    } else if (sortValue === 'name_asc') {
        filteredRewards.sort((a, b) => a.name.localeCompare(b.name, 'th'));
    } else {
        filteredRewards.sort((a, b) => a.points_required - b.points_required);
    }

    const paginatedRewards = filteredRewards.slice(
        (redeemListPage - 1) * redeemListItemsPerPage,
        redeemListPage * redeemListItemsPerPage
    );

    paginatedRewards.forEach(reward => {
        const canAfford = currentPoints >= reward.points_required;
        const outOfStock = reward.stock <= 0;
        const itemEl = document.createElement('div');
        itemEl.className = `reward-item flex justify-between items-center ${canAfford && !outOfStock ? 'affordable' : 'unaffordable'}`;
        itemEl.innerHTML = `
            <div>
                <p class="font-semibold text-slate-800">${reward.name}</p>
                <p class="text-sm font-bold ${canAfford && !outOfStock ? 'text-green-600' : 'text-red-500'}">
                ${reward.points_required.toLocaleString()} แต้ม (เหลือ ${reward.stock})
                </p>
            </div>
            <button class="btn btn--secondary btn--sm btn--auto" data-id="${reward.id}" ${!canAfford || outOfStock ? 'disabled' : ''}><span class="btn-text">แลก</span></button>
        `;
        const redeemBtn = itemEl.querySelector('button');
        redeemBtn.onclick = () => redeemReward(reward.id, redeemBtn);
        listEl.appendChild(itemEl);
    });

    renderPagination(
        document.getElementById('redeem-pagination'),
        redeemListPage,
        filteredRewards.length,
        redeemListItemsPerPage,
        (page) => {
            redeemListPage = page;
            updateStaffRedeemList();
        }
    );
};

const renderRewardsAdminList = () => {
    const listEl = document.getElementById('rewards-admin-list');
    const sortValue = document.getElementById('rewards-admin-sort-select').value;
    const searchTerm = document.getElementById('rewards-admin-search-input').value.toLowerCase();
    listEl.innerHTML = '';
    
    if (rewardsCache.length === 0) {
        listEl.innerHTML = `<div class="empty-state" data-emoji="🎁"><p><strong>ยังไม่มีของรางวัลในระบบ</strong></p><p>กดปุ่ม 'เพิ่มของรางวัลใหม่' เพื่อเริ่มต้น</p></div>`;
        return;
    }
    
    let filteredRewards = [...rewardsCache];
    if (searchTerm) {
        filteredRewards = filteredRewards.filter(r => r.name.toLowerCase().includes(searchTerm));
    }

    if (sortValue === 'points_desc') {
        filteredRewards.sort((a, b) => b.points_required - a.points_required);
    } else if (sortValue === 'name_asc') {
        filteredRewards.sort((a, b) => a.name.localeCompare(b.name, 'th'));
    } else {
        filteredRewards.sort((a, b) => a.points_required - b.points_required);
    }

    const paginatedRewards = filteredRewards.slice(
        (rewardsAdminPage - 1) * rewardsAdminItemsPerPage,
        rewardsAdminPage * rewardsAdminItemsPerPage
    );
    
    listEl.innerHTML = paginatedRewards.map(r => `
        <div class="flex justify-between items-center p-3 border rounded-xl bg-slate-50">
            <div>
                <p class="font-semibold text-lg">${r.name}</p>
                <p class="text-sm text-slate-600">
                    <span class="font-bold" style="color: var(--primary-color);">${r.points_required.toLocaleString()} แต้ม</span> |
                    <span>คงเหลือ: ${r.stock} ชิ้น</span>
                </p>
            </div>
            <div class="flex space-x-2">
                <button class="btn btn--icon edit-reward-btn" data-id="${r.id}" aria-label="แก้ไขของรางวัล">✏️</button>
                <button class="btn btn--icon delete-reward-btn" data-id="${r.id}" aria-label="ลบของรางวัล">🗑️</button>
            </div>
        </div>
    `).join('');

    renderPagination(
        document.getElementById('rewards-admin-pagination'),
        rewardsAdminPage,
        filteredRewards.length,
        rewardsAdminItemsPerPage,
        (page) => {
            rewardsAdminPage = page;
            renderRewardsAdminList();
        }
    );
};

const showRewardForm = (reward) => {
    document.getElementById('modal-reward-title').textContent = reward ? 'แก้ไขของรางวัล' : 'เพิ่มของรางวัล';
    document.getElementById('reward-id').value = reward?.id || '';
    document.getElementById('reward-name').value = reward?.name || '';
    document.getElementById('reward-points').value = reward?.points_required || '';
    document.getElementById('reward-stock').value = reward?.stock || '';
    rewardFormModal.classList.remove('hidden');
};


const downloadCSV = (csvContent, fileName) => {
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const handleExportSales = async () => {
    const exportBtn = document.getElementById('export-sales-btn');
    exportBtn.classList.add('is-loading');
    exportBtn.disabled = true;
    try {
        showModal('กำลังสร้างรายงาน...', 'ระบบกำลังรวบรวมข้อมูลยอดขายทั้งหมด อาจใช้เวลาสักครู่', true);
        const result = await exportSalesDataCallable();
        const csvData = result.data.csv;
        const today = new Date().toISOString().split('T')[0];
        downloadCSV(csvData, `jsushop-sales-report-${today}.csv`);
        hideModal();
        showModal('สำเร็จ!', 'รายงานยอดขายถูกดาวน์โหลดเรียบร้อยแล้ว', true);
    } catch (error) {
        hideModal();
        showModal('เกิดข้อผิดพลาด', `ไม่สามารถสร้างรายงานได้: ${error.message}`, false);
    } finally {
        exportBtn.classList.remove('is-loading');
        exportBtn.disabled = false;
    }
};

// 20. ส่วนจัดการ Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const versionElement = document.getElementById('app-version');
    if (versionElement && window.APP_VERSION) {
        versionElement.textContent = 'v' + window.APP_VERSION;
    }

    document.getElementById('staff-password').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            staffLoginBtn.click();
        }
    });

    document.getElementById('toggle-password-visibility').addEventListener('click', (e) => {
        const passwordSpan = document.getElementById('staff-detail-password');
        const button = e.currentTarget;
        if (passwordSpan.textContent === '******') {
            passwordSpan.textContent = passwordSpan.dataset.password || 'N/A';
            button.textContent = '🙈';
        } else {
            passwordSpan.textContent = '******';
            button.textContent = '👁️';
        }
    });
	
	document.getElementById('export-sales-btn').addEventListener('click', handleExportSales);
    document.getElementById('backfill-sheet-btn').addEventListener('click', () => {
         showConfirmModal(
            'ยืนยันการส่งข้อมูลเก่า?',
            'ระบบจะทำการคัดลอกประวัติธุรกรรมทั้งหมดที่มีอยู่ไปยัง Google Sheet การกระทำนี้ควรทำแค่ครั้งเดียวเท่านั้น และอาจใช้เวลาสักครู่',
            async () => {
                const backfillBtn = document.getElementById('backfill-sheet-btn');
                backfillBtn.classList.add('is-loading');
                backfillBtn.disabled = true;
                try {
                    const result = await backfillTransactionsToSheetCallable();
                    showModal('สำเร็จ!', result.data.message);
                } catch (error) {
                    showModal('เกิดข้อผิดพลาด', 'ไม่สามารถส่งข้อมูลได้: ' + error.message, false);
                } finally {
                    backfillBtn.classList.remove('is-loading');
                    backfillBtn.disabled = false;
                }
            },
            '🌀',
            'ยืนยันการส่งข้อมูล'
        );
    });
	
	// Main Dashboard Listeners
    document.getElementById('staff-logout-btn')?.addEventListener('click', staffLogout);
    staffLoginBtn.addEventListener('click', staffLogin);
    document.getElementById('start-scan-btn').addEventListener('click', startScanner);
    document.getElementById('stop-scan-btn').addEventListener('click', stopScanner);
    document.getElementById('clear-customer-btn').addEventListener('click', selectGeneralCustomerByDefault);
    addPointsBtn.addEventListener('click', addPoints);
    adjustPointsBtn.addEventListener('click', manuallyAdjustPoints);
	adjustPurchaseBtn.addEventListener('click', adjustPurchaseAmount);
    document.getElementById('purchase-amount').addEventListener('input', updatePointsCalculationUI);
    document.getElementById('edit-customer-btn').addEventListener('click', () => showEditCustomerModal(activeCustomer));
    document.getElementById('view-history-btn').addEventListener('click', fetchAndDisplayCustomerTransactions);
    document.getElementById('history-back-button').addEventListener('click', () => changeView('dashboard'));
	
	// ✨ เพิ่มโค้ดนี้เข้าไป
    document.getElementById('clear-backdate-btn').addEventListener('click', () => {
        document.getElementById('backdate-timestamp').value = '';
    });
	
	
    // Live Search
    document.getElementById('customer-identifier').addEventListener('input', handleLiveSearchInput);

    // Edit & Change Password Modals
    saveCustomerBtn.addEventListener('click', saveCustomerDetails);
    document.getElementById('cancel-edit-customer-btn').addEventListener('click', () => editCustomerModal.classList.add('hidden'));
    saveNewPasswordBtn.addEventListener('click', saveNewPassword);
    document.getElementById('cancel-change-password-btn').addEventListener('click', () => changePasswordModal.classList.add('hidden'));

    // Confirm Modal
    document.getElementById('confirm-modal-confirm-btn').addEventListener('click', () => {
        if(typeof confirmCallback === 'function') {
            confirmCallback();
        }
        hideConfirmModal();
    });
    document.getElementById('confirm-modal-cancel-btn').addEventListener('click', hideConfirmModal);

    // Tab buttons
    if (pointsActionTabsContainer) {
        pointsActionTabsContainer.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.tab-btn');
            if (!tabBtn) return;
            
            const tabId = tabBtn.dataset.tab;
            if (!tabId) return;

            pointsActionTabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            tabBtn.classList.add('active');

            const actionArea = document.getElementById('staff-action-area');
            if (actionArea) {
                actionArea.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
                
                if (tabId === 'redeem-points-tab') {
                    redeemListPage = 1;
                    updateStaffRedeemList();
                }
            }
        });
    }

    document.querySelector('nav.action-tabs')?.addEventListener('click', (e) => {
         const tabBtn = e.target.closest('.analytics-tab-btn');
         if (!tabBtn) return;

         const tabId = tabBtn.getAttribute('aria-controls');

         document.querySelectorAll('.analytics-tab-btn').forEach(btn => btn.classList.remove('active'));
         tabBtn.classList.add('active');

         const analyticsContent = document.getElementById('analytics-content');
         if(analyticsContent) {
            analyticsContent.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
         }

         const tabContent = document.getElementById(tabId);
         if (tabContent) {
            tabContent.classList.add('active');
         }
    });

    document.getElementById('search-date-range-btn').addEventListener('click', searchSalesByDateRange);

    // Page Navigation
    document.getElementById('manage-customers-btn').addEventListener('click', showCustomerListView);
    document.getElementById('customers-back-to-main-btn').addEventListener('click', () => changeView('dashboard'));
    document.getElementById('customers-back-to-main-btn-bottom').addEventListener('click', () => changeView('dashboard'));
    document.getElementById('manage-rewards-btn').addEventListener('click', () => { rewardsAdminPage = 1; renderRewardsAdminList(); changeView('rewards'); });
    document.getElementById('rewards-back-to-scanner-btn').addEventListener('click', () => changeView('dashboard'));
    document.getElementById('rewards-back-to-scanner-btn-bottom').addEventListener('click', () => changeView('dashboard'));
    document.getElementById('manage-analytics-btn').addEventListener('click', generateAnalytics);
    document.getElementById('analytics-back-to-main-btn').addEventListener('click', () => changeView('dashboard'));
    document.getElementById('analytics-back-to-main-btn-bottom').addEventListener('click', () => changeView('dashboard'));
    document.getElementById('history-back-button-bottom').addEventListener('click', () => changeView('dashboard'));


    // Cleanup History Button
    document.getElementById('cleanup-history-btn').addEventListener('click', () => {
        showConfirmModal(
            'ยืนยันการลบประวัติ?',
            'คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการทำรายการทั้งหมดที่เก่ากว่า 90 วัน? การกระทำนี้ไม่สามารถย้อนกลับได้',
            async () => {
                const cleanupBtn = document.getElementById('cleanup-history-btn');
                cleanupBtn.classList.add('is-loading');
                cleanupBtn.disabled = true;
                try {
                    const result = await cleanupOldTransactionsCallable();
                    showModal('สำเร็จ!', result.data.message);
                } catch (error) {
                    showModal('เกิดข้อผิดพลาด', 'ไม่สามารถลบประวัติได้: ' + error.message, false);
                } finally {
                    cleanupBtn.classList.remove('is-loading');
                    cleanupBtn.disabled = false;
                }
            },
            '🗑️',
            'ยืนยันการลบ'
        );
    });

    // Rewards Admin
    document.getElementById('add-reward-btn').addEventListener('click', () => showRewardForm(null));
    document.getElementById('rewards-admin-list').addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return;
        const reward = rewardsCache.find(r => r.id === button.dataset.id);
        if (button.classList.contains('edit-reward-btn')) showRewardForm(reward);
        if (button.classList.contains('delete-reward-btn')) deleteReward(button.dataset.id);
    });
    saveRewardBtn.addEventListener('click', saveReward);
    document.getElementById('cancel-reward-btn').addEventListener('click', () => rewardFormModal.classList.add('hidden'));
    document.getElementById('rewards-admin-search-input').addEventListener('input', () => { rewardsAdminPage = 1; renderRewardsAdminList(); });
    document.getElementById('rewards-admin-sort-select').addEventListener('change', () => { rewardsAdminPage = 1; renderRewardsAdminList(); });


    // General Modals
    document.getElementById('modal-close-btn').addEventListener('click', hideModal);

    // Customer List Page Controls
    document.getElementById('customer-search-input').addEventListener('input', () => { customerListPage = 1; filterAndSortCustomers(); });
    document.getElementById('sort-select').addEventListener('change', () => { customerListPage = 1; filterAndSortCustomers(); });

    // Redeem Tab Controls
    document.getElementById('redeem-search-input').addEventListener('input', () => { redeemListPage = 1; updateStaffRedeemList(); });
    document.getElementById('staff-redeem-sort-select').addEventListener('change', () => { redeemListPage = 1; updateStaffRedeemList(); });

    // New Customer Modal
    document.getElementById('add-new-customer-btn').addEventListener('click', showAddCustomerModal);
    document.getElementById('cancel-add-customer-btn').addEventListener('click', hideAddCustomerModal);
    saveNewCustomerBtn.addEventListener('click', registerNewCustomer);

    document.getElementById('toggle-add-password').addEventListener('click', () => {
        const passwordInput = document.getElementById('add-customer-password');
        const eyeIcon = document.getElementById('eye-icon-add');
        const eyeSlashIcon = document.getElementById('eye-slash-icon-add');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.classList.add('hidden');
            eyeSlashIcon.classList.remove('hidden');
        } else {
            passwordInput.type = 'password';
            eyeIcon.classList.remove('hidden');
            eyeSlashIcon.classList.add('hidden');
        }
    });

    changeView('loading');
});