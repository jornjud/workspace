// 1. ส่วนการนำเข้าโมดูล (Imports)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    onSnapshot,
    query,
    where,
    orderBy,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm';

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

// 4. ค่าคงที่และตัวแปรส่วนกลาง (Constants & Global State)
const CUSTOMER_COLLECTION = "customers";
const REWARDS_COLLECTION = "rewards";
const TRANSACTION_COLLECTION = "transactions";
let currentUser = null;
let customerData = null;
let rewardsCache = [];
let unsubscribeListeners = [];

// ✨ NEW ✨: State for pagination
let redeemPage = 1;
const redeemItemsPerPage = 10;

// 5. ส่วนเลือกองค์ประกอบ DOM (DOM Selectors)
const views = {
    loading: document.getElementById('loading-view'),
    auth: document.getElementById('auth-view'),
    dashboard: document.getElementById('customer-dashboard-view'),
    redeem: document.getElementById('redeem-view'),
    history: document.getElementById('history-view')
};
const appModal = document.getElementById('app-modal');
const conditionsModal = document.getElementById('conditions-modal');
const forgotPasswordModal = document.getElementById('forgot-password-modal');
const editNameModal = document.getElementById('edit-name-modal');
const loginBtn = document.getElementById('login-btn');
const saveNameBtn = document.getElementById('save-name-btn');


// 6. ฟังก์ชันช่วยเหลือเกี่ยวกับ UI (UI Helper Functions)
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

const showError = (elementId, message) => {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = message;
    errorEl.style.display = 'block';
};

const hideError = (elementId) => {
    const errorEl = document.getElementById(elementId);
    if(errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    }
};

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

    container.appendChild(createButton(currentPage - 1, '«', false, currentPage === 1));
    for (let i = 1; i <= totalPages; i++) {
        container.appendChild(createButton(i, i, i === currentPage));
    }
    container.appendChild(createButton(currentPage + 1, '»', false, currentPage === totalPages));
};

// 7. ส่วนจัดการการยืนยันตัวตน (Authentication)
const phoneToEmail = (phone) => `${phone}@qrmember.com`;

const customerLogin = async () => {
    loginBtn.classList.add('is-loading');
    loginBtn.disabled = true;

    const tel = document.getElementById('login-tel').value.trim();
    const password = document.getElementById('login-password').value.trim();
    hideError('login-error');

    if (tel.length < 10 || password.length < 6 || password.length > 16) {
        showError('login-error', 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง');
        loginBtn.classList.remove('is-loading');
        loginBtn.disabled = false;
        return;
    }

    try {
        const email = phoneToEmail(tel);
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        let message = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
        if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(error.code)) {
            message = 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง';
        }
        showError('login-error', message);
        changeView('auth');
    } finally {
        loginBtn.classList.remove('is-loading');
        loginBtn.disabled = false;
    }
};

const userLogout = async () => {
    await signOut(auth);
};

// 8. ส่วนจัดการข้อมูลและสถานะ (Data & State Management)
onAuthStateChanged(auth, async (user) => {
    cleanupListeners();
    currentUser = user;
    if (user) {
        changeView('loading');
        listenToCustomerData(user.uid);
        listenToRewards();
    } else {
        customerData = null;
        changeView('auth');
    }
});

const cleanupListeners = () => {
    unsubscribeListeners.forEach(unsubscribe => unsubscribe());
    unsubscribeListeners = [];
};

const listenToCustomerData = (uid) => {
    showProgressBar(30);
    const customerListener = onSnapshot(doc(db, CUSTOMER_COLLECTION, uid), (docSnap) => {
        if (docSnap.exists()) {
            customerData = { id: docSnap.id, ...docSnap.data() };
            updateDashboardUI();
            changeView('dashboard'); // Ensure dashboard is shown after data loads
            showProgressBar(100);
        } else {
            // This case might happen if the user is deleted from the backend
            userLogout();
            showProgressBar(100);
        }
    });
    unsubscribeListeners.push(customerListener);
};

const listenToRewards = () => {
    showProgressBar(20);
    const rewardsListener = onSnapshot(collection(db, REWARDS_COLLECTION), (snapshot) => {
        rewardsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (!views.redeem.classList.contains('hidden')) {
            updateRedeemUI();
        }
        showProgressBar(100);
    });
    unsubscribeListeners.push(rewardsListener);
};

// 9. ส่วนจัดการระดับสมาชิก (Membership Tiers)
const getMembershipTier = (lifetimePoints) => {
    if (lifetimePoints >= 500) {
        return { name: 'Gold Member', icon: '🥇', color: '#d4af37' };
    }
    if (lifetimePoints >= 100) {
        return { name: 'Silver Member', icon: '🥈', color: '#c0c0c0' };
    }
    return { name: 'Bronze Member', icon: '🥉', color: '#cd7f32' };
};

// 10. ส่วนอัปเดต UI และการแสดงผล (UI Updates & Rendering)
const updateDashboardUI = () => {
    if (!customerData || !currentUser) return;

    document.getElementById('customer-name-display').textContent = customerData.name;
    document.getElementById('customer-tel-display').textContent = `เบอร์โทร: ${customerData.tel}`;
    document.getElementById('current-points').textContent = customerData.total_points.toLocaleString();

    const remainder = customerData.purchase_remainder || 0;
    document.getElementById('purchase-remainder-display').textContent = `ยอดสะสม: ${remainder.toFixed(2)} บ.`;

    const tier = getMembershipTier(customerData.lifetime_points || 0);
    const tierEl = document.getElementById('customer-tier-display');
    tierEl.textContent = `${tier.icon} ${tier.name}`;
    tierEl.style.backgroundColor = tier.color;

    QRCode.toCanvas(document.getElementById('qr-canvas'), currentUser.uid, { width: 190, errorCorrectionLevel: 'H' });
};

const updateRedeemUI = () => {
    const rewardsListEl = document.getElementById('rewards-list');
    const currentPoints = customerData?.total_points || 0;
    const sortValue = document.getElementById('redeem-sort-select').value;
    const searchTerm = document.getElementById('redeem-search-input').value.toLowerCase();

    document.getElementById('redeem-current-points').textContent = currentPoints.toLocaleString();
    rewardsListEl.innerHTML = '';

    if (rewardsCache.length === 0) {
        rewardsListEl.innerHTML = `<div class="empty-state">🎁<p><strong>ยังไม่มีของรางวัล</strong></p><p>อดใจรออีกนิดนะ!</p></div>`;
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
    } else { // default to points_asc
        filteredRewards.sort((a, b) => a.points_required - b.points_required);
    }

    const paginatedRewards = filteredRewards.slice(
        (redeemPage - 1) * redeemItemsPerPage,
        redeemPage * redeemItemsPerPage
    );

    paginatedRewards.forEach(reward => {
            const canAfford = currentPoints >= reward.points_required;
            const outOfStock = reward.stock <= 0;
            const rewardDiv = document.createElement('div');
            rewardDiv.className = `reward-item ${canAfford && !outOfStock ? 'affordable' : 'unaffordable'}`;

            let stockInfo = `คงเหลือ: ${reward.stock}`;
            if (outOfStock) stockInfo = 'สินค้าหมด';

            rewardDiv.innerHTML = `
                <div>
                    <p class="font-semibold text-lg text-slate-800">${reward.name}</p>
                    <p class="text-sm font-bold ${canAfford ? 'text-green-600' : 'text-red-500'}">
                        ${reward.points_required.toLocaleString()} แต้ม
                        <span class="font-normal text-slate-500 text-xs">(${stockInfo})</span>
                    </p>
                </div>
            `;

            rewardsListEl.appendChild(rewardDiv);
        });

    renderPagination(
        document.getElementById('redeem-pagination'),
        redeemPage,
        filteredRewards.length,
        redeemItemsPerPage,
        (page) => {
            redeemPage = page;
            updateRedeemUI();
        }
    );
};

// 11. ส่วนประวัติการทำรายการ (Transaction History)
const fetchAndDisplayTransactions = async () => {
    if (!currentUser) return;
    changeView('loading');
    showProgressBar(20);
    const container = document.getElementById('transaction-list-container');
    container.innerHTML = '<div class="loader"></div>';

    try {
        // แก้ไข: ดึงแค่ 7 รายการล่าสุดแทน 60 วัน
        const q = query(
            collection(db, TRANSACTION_COLLECTION),
            where("customerId", "==", currentUser.uid),
            orderBy("timestamp", "desc"),
            limit(7)
        );
        showProgressBar(60);
        const querySnapshot = await getDocs(q);
        const transactions = querySnapshot.docs.map(doc => doc.data());

        renderTransactions(transactions);
        changeView('history');
        showProgressBar(100);
    } catch (error) {
        container.innerHTML = `<p class="error-message" style="display:block;">ไม่สามารถโหลดประวัติได้</p>`;
        changeView('history');
        showProgressBar(100);
    }
};

const renderTransactions = (transactions) => {
    const container = document.getElementById('transaction-list-container');
    container.innerHTML = '';
    if (transactions.length === 0) {
        container.innerHTML = `<div class="empty-state">🧾<p><strong>ยังไม่มีรายการ</strong></p><p>เมื่อคุณสะสมแต้มหรือแลกของรางวัล รายการจะแสดงที่นี่</p></div>`;
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

        if (tx.type === 'add_points') {
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
            ${pointsText}
        `;
        container.appendChild(item);
    });
};

// 12. ส่วนแก้ไขชื่อ (Edit Name Logic)
const showEditNameModal = () => {
    if (!customerData) return;
    document.getElementById('edit-customer-name-input').value = customerData.name;
    hideError('edit-name-error');
    editNameModal.classList.remove('hidden');
};

const updateCustomerName = async () => {
    const newName = document.getElementById('edit-customer-name-input').value.trim();
    if (!newName) {
        showError('edit-name-error', 'กรุณาใส่ชื่อ');
        return;
    }
    if (!currentUser) return;

    saveNameBtn.classList.add('is-loading');
    saveNameBtn.disabled = true;

    try {
        const customerRef = doc(db, CUSTOMER_COLLECTION, currentUser.uid);
        await updateDoc(customerRef, { name: newName });
        editNameModal.classList.add('hidden');
    } catch (error) {
        showError('edit-name-error', 'เกิดข้อผิดพลาด ไม่สามารถบันทึกได้');
    } finally {
        saveNameBtn.classList.remove('is-loading');
        saveNameBtn.disabled = false;
    }
};

// 13. ส่วนจัดการ Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    changeView('loading');

    // Authentication
    loginBtn.addEventListener('click', customerLogin);
    document.getElementById('customer-logout-btn').addEventListener('click', userLogout);

    document.getElementById('login-password').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            loginBtn.click();
        }
    });

    // Password Toggle
    document.getElementById('toggle-login-password').addEventListener('click', () => {
        const passwordInput = document.getElementById('login-password');
        const eyeIcon = document.getElementById('eye-icon-login');
        const eyeSlashIcon = document.getElementById('eye-slash-icon-login');

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

    // Navigation
    document.getElementById('go-to-redeem-btn').addEventListener('click', () => {
        redeemPage = 1; // Reset to page 1
        updateRedeemUI();
        changeView('redeem');
    });
    document.getElementById('redeem-back-button').addEventListener('click', () => changeView('dashboard'));
    document.getElementById('go-to-history-btn').addEventListener('click', fetchAndDisplayTransactions);
    document.getElementById('history-back-button').addEventListener('click', () => changeView('dashboard'));
    
    // Redeem page controls
    document.getElementById('redeem-search-input').addEventListener('input', () => {
        redeemPage = 1;
        updateRedeemUI();
    });
    document.getElementById('redeem-sort-select').addEventListener('change', () => {
        redeemPage = 1;
        updateRedeemUI();
    });

    // Modals
    document.getElementById('modal-close-btn').addEventListener('click', () => appModal.classList.add('hidden'));
    document.getElementById('show-conditions-btn').addEventListener('click', () => conditionsModal.classList.remove('hidden'));
    document.getElementById('close-conditions-btn').addEventListener('click', () => conditionsModal.classList.add('hidden'));
    document.getElementById('forgot-password-btn').addEventListener('click', () => forgotPasswordModal.classList.remove('hidden'));
    document.getElementById('close-forgot-password-btn').addEventListener('click', () => forgotPasswordModal.classList.add('hidden'));

    // Edit Name Modal
    document.getElementById('edit-name-btn').addEventListener('click', showEditNameModal);
    document.getElementById('cancel-edit-name-btn').addEventListener('click', () => editNameModal.classList.add('hidden'));
    saveNameBtn.addEventListener('click', updateCustomerName);
});