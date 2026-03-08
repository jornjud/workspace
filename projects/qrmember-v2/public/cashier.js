// 1. ส่วนการนำเข้าโมดูล (Imports)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    query,
    getDocs,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// NEW: Import jsQR for QR Scanning
// 👇 แก้ไข: ใช้ * as เพื่อให้เข้าถึงฟังก์ชันหลักด้วย .default ได้
import * as jsQR from "https://cdn.jsdelivr.net/npm/jsqr@1.1.0/dist/jsQR.js";

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
const TRANSACTION_COLLECTION = "transactions";
const POINTS_PER_BAHT = 1 / 100;
const MAX_TABS_LIMIT = 4; // NEW: จำกัดจำนวนแท็บสูงสุดสำหรับ Tablet

let currentStaff = null;
let allCustomersCache = [];
let generalCustomer = null;

// --- ▼▼▼ NEW TAB STATE MANAGEMENT ▼▼▼ ---
let tabs = [];
let activeTabId = null;
let nextTabId = 1;
// --- ▲▲▲ NEW TAB STATE MANAGEMENT ▲▲▲ ---

// --- ▼▼▼ (นี่คือ "สมอง" ของเครื่องคิดเลข) ▼▼▼ ---
let currentCalcString = ""; // สตริงที่มึงพิมพ์ (เช่น "50 + 20")
// --- ▲▲▲

// 5. ส่วนเลือกองค์ประกอบ DOM (DOM Selectors)
const cashierView = document.getElementById('cashier-view');
const loadingView = document.getElementById('loading-view');
const customerIdentifierInput = document.getElementById('customer-identifier');
const liveSearchResultsContainer = document.getElementById('live-search-results');
const selectedCustomerNameEl = document.getElementById('customer-name');
const selectedCustomerPointsEl = document.getElementById('customer-points');
const clearCustomerBtn = document.getElementById('clear-customer-btn');
const addPointsBtn = document.getElementById('add-points-btn');
const cancelButton = document.getElementById('cancel-btn');
const modal = document.getElementById('app-modal');
const tabsContainer = document.getElementById('cashier-tabs-container');

// --- ▼▼▼ Selectors for Manual Entry ▼▼▼ ---
const amountDueEl = document.getElementById('amount-due'); // The big green display
// (ลบ manualAmountInput ทิ้ง)
const cashTenderedInput = document.getElementById('cash-tendered-input');
const changeDueEl = document.getElementById('change-due');
// --- ▲▲▲ ---

// --- ▼▼▼ Selector ของเครื่องคิดเลขจิ๋ว ▼▼▼
const miniCalcHistoryEl = document.getElementById('mini-calc-history'); // นี่คือ <div> จอแนวนอน
const miniCalcPad = document.getElementById('mini-calc-pad');
// --- ▲▲▲

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

const showView = (view) => {
    loadingView.classList.add('hidden');
    cashierView.classList.add('hidden');
    view.classList.remove('hidden');
};

const showModal = (title, message, isSuccess = true, buttonContainer = null) => {
    modal.querySelector('#modal-title').textContent = title;
    modal.querySelector('#modal-message').innerHTML = message;
    modal.querySelector('#modal-icon').textContent = isSuccess ? '✅' : '❌';
    
    const modalContent = modal.querySelector('.modal-content');
    const originalCloseButton = modal.querySelector('#modal-close-btn');

    const existingCustomContainer = modalContent.querySelector('.custom-button-container');
    if (existingCustomContainer) {
        modalContent.removeChild(existingCustomContainer);
    }
    
    originalCloseButton.style.display = 'block';

    if (buttonContainer) {
        originalCloseButton.style.display = 'none';
        buttonContainer.classList.add('custom-button-container');
        modalContent.appendChild(buttonContainer);
    }

    modal.classList.remove('hidden');
};

const hideModal = () => {
    modal.classList.add('hidden');
    const modalContent = modal.querySelector('.modal-content');
    const existingCustomContainer = modalContent.querySelector('.custom-button-container');
    if (existingCustomContainer) {
        modalContent.removeChild(existingCustomContainer);
    }
    modal.querySelector('#modal-close-btn').style.display = 'block';
};

const showError = (message) => { document.getElementById('cashier-error').textContent = message; };
const hideError = () => { document.getElementById('cashier-error').textContent = ''; };

// NEW: Debounce function for performance optimization
const debounce = (fn, delay) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; };

// 7. ส่วนจัดการการยืนยันตัวตน (Authentication)
onAuthStateChanged(auth, user => {
    if (user && user.email) {
        currentStaff = user;
        initializeCashier();
    } else {
        // Redirection to login screen (staff.html) if not logged in
        window.location.href = 'staff.html';
    }
});

// 8. ส่วนเริ่มต้นการทำงานของหน้า (Initialization)
const initializeCashier = async () => {
    showView(loadingView);
    await fetchInitialCustomerCache();
    generalCustomer = allCustomersCache.find(c => c.tel === '0000000000');
    addTab(); // Start with one default tab
    
    // NEW: Add listener for QR scan
    document.getElementById('scan-qr-btn').addEventListener('click', scanQRForCustomer);
    
    showView(cashierView);
    customerIdentifierInput.addEventListener('input', handleLiveSearchInput);
    customerIdentifierInput.focus(); // NEW: Auto-focus search for quick use
};

const fetchInitialCustomerCache = async () => {
    showProgressBar(30);
    try {
        const q = query(collection(db, CUSTOMER_COLLECTION));
        const querySnapshot = await getDocs(q);
        allCustomersCache = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        showProgressBar(100);
    } catch (error) {
        console.error("Could not pre-fetch customers:", error);
        showError("ไม่สามารถโหลดรายชื่อลูกค้าได้");
        showProgressBar(100);
    }
};

// --- ▼▼▼ NEW TAB FUNCTIONS (Simplified State) ▼▼▼ ---

const createNewTab = (customer = null) => {
    const newTab = {
        id: nextTabId++,
        name: customer ? customer.name : `ลูกค้า ${tabs.length + 1}`,
        customer: customer || generalCustomer,
        // --- ✨ MODIFIED: Simplified State ---
        calculatorState: {
            amountDue: 0,
        },
        paymentState: {
            cashTendered: '',
        }
    };
    return newTab;
};

const addTab = () => {
    if (tabs.length >= MAX_TABS_LIMIT) { // NEW: Limit check
        showModal('ขีดจำกัด', `เปิดแท็บได้สูงสุด ${MAX_TABS_LIMIT} แท็บ`, false);
        return;
    }
    const newTab = createNewTab();
    tabs.push(newTab);
    switchTab(newTab.id);
};

const closeTab = (tabIdToClose) => {
    if (tabs.length <= 1) {
        showModal('ปิดไม่ได้', 'ต้องมีอย่างน้อย 1 แท็บเสมอ', false);
        return;
    }
    
    const onConfirm = () => {
        tabs = tabs.filter(tab => tab.id !== tabIdToClose);
        
        if (activeTabId === tabIdToClose) {
            // If we closed the active tab, switch to the first available one
            switchTab(tabs[0].id);
        } else {
            // If we closed an inactive tab, just re-render
            debouncedRenderTabs();
        }
    };

    const tabToClose = tabs.find(t => t.id === tabIdToClose);
    showModal(
        'ยืนยันการปิด',
        `คุณต้องการปิดแท็บ "${tabToClose.name}" ใช่หรือไม่?`,
        true,
        createConfirmButtons(onConfirm, 'ยืนยัน', 'btn--danger')
    );
};

const switchTab = (tabId) => {
    activeTabId = tabId;
    loadTabState(getActiveTab());
    debouncedRenderTabs();
};

const getActiveTab = () => {
    return tabs.find(tab => tab.id === activeTabId);
};

// --- ✨ (แก้ Logic การโหลด State) ---
const loadTabState = (tab) => {
    if (!tab) return;
    // Load customer
    updateSelectedCustomerUI(tab.customer);
    
    // --- (นี่คือ Logic ใหม่) ---
    // Load amount
    const amount = tab.calculatorState.amountDue;
    currentCalcString = amount > 0 ? amount.toString() : ''; // เอาค่ายอดรวมมาเป็นสตริงเริ่มต้น
    miniCalcHistoryEl.textContent = currentCalcString; // ยัดใส่จอแนวนอน
    scrollToMiniCalcEnd(); // เลื่อนจอไปขวาสุด
    // --- (จบ Logic ใหม่) ---
    
    // Load payment
    cashTenderedInput.value = tab.paymentState.cashTendered;
    // Update displays
    updateDisplay(tab);
    calculateChange();
};

const renderTabs = () => {
    tabsContainer.innerHTML = '';
    tabs.forEach((tab, index) => { // Use index for tab name if no customer selected
        
        if (!tab || !tab.customer) {
            console.error(`Tab or customer is null at index ${index}. Resetting to general customer.`);
            tab.customer = generalCustomer;
        }

        const tabEl = document.createElement('div');
        tabEl.className = 'cashier-tab';
        tabEl.dataset.tabId = tab.id;
        if (tab.id === activeTabId) {
            tabEl.classList.add('active');
        }
        
        // Update tab name if it's still generic
        if (tab.customer.tel === '0000000000') {
             tab.name = `ลูกค้า ${index + 1}`;
        } else {
             tab.name = tab.customer.name.split(' ')[0]; // Show first name only
        }

        tabEl.innerHTML = `
            <span class="cashier-tab-name">${tab.name}</span>
            <button class="cashier-tab-close" data-tab-id="${tab.id}">×</button>
        `;
        
        tabEl.querySelector('.cashier-tab-name').addEventListener('click', () => switchTab(tab.id));
        tabEl.querySelector('.cashier-tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tab.id);
        });

        tabsContainer.appendChild(tabEl);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn cashier-tab-add';
    addBtn.textContent = '+';
    addBtn.title = 'เพิ่มลูกค้าใหม่';
    addBtn.addEventListener('click', addTab);
    tabsContainer.appendChild(addBtn);
};

const debouncedRenderTabs = debounce(renderTabs, 100);

// --- ▲▲▲ NEW TAB FUNCTIONS ▲▲▲ ---

// NEW: QR Code Scanning Logic
const scanQRForCustomer = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
         showModal('ไม่รองรับ', 'เบราว์เซอร์นี้ไม่รองรับการเข้าถึงกล้อง (getUserMedia)', false);
         return;
    }
    
    // Create necessary elements for scanning
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const scanContainer = document.createElement('div');
    scanContainer.className = 'qr-scan-modal-content';
    scanContainer.innerHTML = `<video id="qr-video" class="w-full h-full object-cover"></video><div class="scan-area"></div><p class="mt-2 text-center text-sm text-white">กำลังสแกน...</p>`;
    
    const customButtonContainer = document.createElement('div');
    customButtonContainer.className = 'flex justify-center mt-6';
    const stopScanBtn = document.createElement('button');
    stopScanBtn.className = 'btn btn--danger';
    stopScanBtn.textContent = 'หยุดสแกน';
    customButtonContainer.appendChild(stopScanBtn);
    
    showModal('สแกน QR Code', '', true, customButtonContainer);
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.insertBefore(scanContainer, customButtonContainer);
    
    const qrVideo = document.getElementById('qr-video');
    let stream;
    let scanning = true;

    const tick = () => {
        if (!scanning) return;
        if (qrVideo.readyState === qrVideo.HAVE_ENOUGH_DATA) {
            canvas.height = qrVideo.videoHeight;
            canvas.width = qrVideo.videoWidth;
            context.drawImage(qrVideo, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            // 👇 แก้ไข: เรียกใช้ jsQR.default() แทน jsQR()
            const code = jsQR.default(imageData.data, imageData.width, imageData.height); 

            if (code) {
                console.log("Found QR code", code.data);
                stopScan();
                selectCustomer(code.data); // QR code data is the customer ID
                showModal('สแกนสำเร็จ!', `พบลูกค้า ID: **${code.data}**`, true);
                return;
            }
        }
        requestAnimationFrame(tick);
    }
    
    const stopScan = () => {
        scanning = false;
        stream.getTracks().forEach(track => track.stop());
        modalContent.removeChild(scanContainer);
        hideModal();
    };
    
    stopScanBtn.onclick = stopScan;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
            stream = s;
            qrVideo.srcObject = stream;
            qrVideo.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
            qrVideo.play();
            requestAnimationFrame(tick);
        })
        .catch(err => {
            stopScan();
            showModal('ข้อผิดพลาด', 'ไม่สามารถเข้าถึงกล้องได้: ' + err.message, false);
        });
};


// 9. ส่วนจัดการลูกค้า (Customer Logic)
const handleLiveSearchInput = () => {
    const searchTerm = customerIdentifierInput.value.toLowerCase();
    if (searchTerm.length < 2) {
        liveSearchResultsContainer.innerHTML = '';
        liveSearchResultsContainer.style.display = 'none';
        return;
    }
    const filtered = allCustomersCache.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.tel.includes(searchTerm)
    );
    renderLiveSearchResults(filtered);
};

const renderLiveSearchResults = (customers) => {
    liveSearchResultsContainer.innerHTML = '';
    if (customers.length === 0) {
        liveSearchResultsContainer.style.display = 'none';
        return;
    }
    customers.slice(0, 5).forEach(customer => {
        const item = document.createElement('div');
        item.className = 'live-search-item';
        item.addEventListener('click', () => selectCustomer(customer.id));
        item.innerHTML = `<p class="name">${customer.name}</p><p class="tel">${customer.tel}</p>`;
        liveSearchResultsContainer.appendChild(item);
    });
    liveSearchResultsContainer.style.display = 'block';
};

const selectCustomer = (customerId) => {
    const customer = allCustomersCache.find(c => c.id === customerId);
    if (customer) {
        const activeTab = getActiveTab();
        activeTab.customer = customer;
        activeTab.name = customer.name; // Update tab name
        updateSelectedCustomerUI(customer);
        debouncedRenderTabs(); // Re-render tabs to show new name
        customerIdentifierInput.value = '';
        liveSearchResultsContainer.style.display = 'none';
    }
};

const updateSelectedCustomerUI = (customer) => {
    if (customer) {
        selectedCustomerNameEl.textContent = customer.name;
        selectedCustomerPointsEl.textContent = customer.total_points.toLocaleString();
        if(customer.tel !== '0000000000'){
             clearCustomerBtn.classList.remove('hidden');
        } else {
             clearCustomerBtn.classList.add('hidden');
        }
    } else { // Should not happen with default general customer
        selectedCustomerNameEl.textContent = 'ลูกค้าทั่วไป';
        selectedCustomerPointsEl.textContent = 'N/A';
        clearCustomerBtn.classList.add('hidden');
    }
};

// 10. ส่วนจัดการเครื่องคิดเลข (Calculator Logic) - (Simplified)

// --- ▼▼▼ 🔥 (ฟังก์ชันใหม่ เอาไว้อัปเดตยอดรวม) 🔥 ▼▼▼ ---
const updateAmountDue = (newValue) => {
    const tab = getActiveTab();
    if (!tab) return;
    
    const amount = parseFloat(newValue) || 0;
    
    // 1. อัปเดต State ของ Tab
    tab.calculatorState.amountDue = amount;
    
    // 2. อัปเดตจอเขียวใหญ่
    updateDisplay(); // (ฟังก์ชันนี้มันจะไปอ่านจาก State ของ Tab เอง)
    
    // 3. อัปเดตเงินทอน
    calculateChange();
};

// --- ✨ (ฟังก์ชันนี้ยังอยู่ แต่ Logic น้อยลง) ---
const updateDisplay = (tab = getActiveTab()) => {
    if (!tab) return;
    const state = tab.calculatorState;
    amountDueEl.textContent = state.amountDue.toLocaleString('th-TH', { minimumFractionDigits: 2 });
};

// --- ✨ (แก้ Logic การเคลียร์ State) ---
const clearCalculatorState = (clearCustomer = false) => {
    const tab = getActiveTab();
    if (!tab) return;
    
    // --- (นี่คือ Logic ใหม่) ---
    currentCalcString = ""; // เคลียร์สตริง
    miniCalcHistoryEl.textContent = ""; // เคลียร์จอแนวนอน
    // --- (จบ Logic ใหม่) ---
    
    tab.calculatorState = {
        amountDue: 0,
    };
    tab.paymentState.cashTendered = '';
    
    cashTenderedInput.value = '';
    cancelButton.classList.add('hidden');
    
    if (clearCustomer) {
        tab.customer = generalCustomer;
        tab.name = `ลูกค้า ${tabs.findIndex(t => t.id === tab.id) + 1}`;
        updateSelectedCustomerUI(tab.customer);
        debouncedRenderTabs();
    }
    
    updateDisplay();
    calculateChange();
};

const calculateChange = () => {
    const tab = getActiveTab();
    if (!tab) return;
    const tendered = parseFloat(cashTenderedInput.value) || 0;
    tab.paymentState.cashTendered = cashTenderedInput.value;
    
    changeDueEl.classList.remove('text-red-600', 'text-success-color');
    
    const amountDue = tab.calculatorState.amountDue; // Get amount from state
    
    if (amountDue > 0) {
        if (tendered >= amountDue) {
            let change = tendered - amountDue;
            changeDueEl.textContent = change.toLocaleString('th-TH', {minimumFractionDigits: 2});
            changeDueEl.classList.add('text-success-color');
        } else {
            let shortage = amountDue - tendered;
            changeDueEl.textContent = `ขาด ${shortage.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
            changeDueEl.classList.add('text-red-600');
        }
    } else {
        changeDueEl.textContent = '0.00';
    }
};

// --- ✨ (กูรื้อฟังก์ชันนี้... เหลือแค่นี้) ---
const setupCalculatorListeners = () => {
    // Keep cash tendered listener
    cashTenderedInput.addEventListener('input', calculateChange);
    
    // ===================================
    //   👇👇👇 เอากลับมาแล้ว 👇👇👇
    // ===================================
    document.querySelectorAll('.quick-cash-btn').forEach(button => {
        button.addEventListener('click', () => {
            const activeTab = getActiveTab();
            const amountStr = button.dataset.amount;
            const currentTendered = parseFloat(cashTenderedInput.value) || 0;
            const amountDue = activeTab.calculatorState.amountDue;

            if (amountStr === 'exact') {
                cashTenderedInput.value = amountDue > 0 ? amountDue : '';
            } else {
                const amountToAdd = parseFloat(amountStr);
                cashTenderedInput.value = currentTendered + amountToAdd;
            }
            calculateChange();
            cashTenderedInput.focus();
        });
    });
    // ===================================
    //   👆👆👆 เอากลับมาแล้ว 👆👆👆
    // ===================================
};

// --- ▼▼▼ (ฟังก์ชันใหม่... เลื่อนจอแนวนอน) ▼▼▼ ---
const scrollToMiniCalcEnd = () => {
    if (miniCalcHistoryEl) {
        miniCalcHistoryEl.scrollLeft = miniCalcHistoryEl.scrollWidth;
    }
};

// --- ▼▼▼ 🔥 (ฟังก์ชันใหม่... คำนวณสตริง) 🔥 ▼▼▼ ---
// (ฟังก์ชันนี้กูเขียนใหม่เกือบหมด ให้มันฉลาดพอ)
const evaluateCalcString = (calcString) => {
    // 1. ถ้าว่างเปล่า, คืน 0
    if (!calcString || calcString.trim() === "") {
        return 0;
    }
    
    // 2. แปลงสัญลักษณ์ (ใช้ตัวแปรใหม่)
    let evalStr = calcString.replace(/−/g, '-')
                              .replace(/×/g, '*')
                              .replace(/÷/g, '/');
    
    // 3. ลบ operator ที่ห้อยท้าย (เช่น "50 + ")
    if (/ [\+\-\*\/] $/.test(evalStr)) {
        evalStr = evalStr.slice(0, -3); // ลบ 3 ตัว (' + ')
    }
    
    // 4. ตรวจสอบความปลอดภัย (อนุญาตแค่ตัวเลข, จุด, space, และ ops)
    if (!/^[\d\.\s\+\-\*\/]+$/.test(evalStr)) {
        console.error("Invalid calculation string detected:", calcString);
        return 0; // ไม่คำนวณถ้ามีตัวอักษรแปลกๆ
    }
    
    // 5. คำนวณโดยใช้ Function constructor (ปลอดภัยใน context นี้)
    // มันจะจัดการเรื่อง Order of Operations (คูณหารก่อนบวกลบ) ให้เอง
    try {
        const result = new Function('return ' + evalStr)();
        if (typeof result !== 'number' || !isFinite(result)) {
            return 0; // กันผลลัพธ์แปลกๆ (like Infinity)
        }
        return parseFloat(result.toFixed(10)); // ปัดเศษทศนิยม
    } catch (e) {
        // นี่คือกรณีที่ string พัง เช่น "50 + * 2"
        // หรือ "5 *" (ซึ่งถูกตัดไปแล้วในข้อ 3)
        // ถ้ามันพัง, ให้คืน 0
        console.warn("Incomplete or invalid expression:", calcString, "->", evalStr);
        // พยายามคืนค่าสุดท้ายที่คำนวณได้
        const parts = evalStr.split(' ');
        const lastPart = parts[parts.length - 1];
        if (parts.length > 1 && !isNaN(parseFloat(lastPart))) {
            // ถ้ามี "50 +" (ซึ่งไม่ควรเกิด) มันจะพัง
            // แต่ถ้ามันคำนวณไม่ได้จริงๆ ก็คืน 0
            return 0;
        }
        return 0;
    }
};


// --- ▼▼▼ 🔥 (นี่คือ "สมอง" ใหม่... รื้อทั้งหมด!) 🔥 ▼▼▼ ---

// 🔊🔊🔊 ฟังก์ชันเสียงพูด (Speak Helper) 🔊🔊🔊
const speak = (text) => {
    // เช็คก่อนว่าบราวเซอร์รองรับมั้ย (เดี๋ยวนี้ได้เกือบหมดละ)
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // หยุดเสียงเก่าก่อน (ถ้ามี)
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'th-TH'; // พูดไทยชัดแจ๋ว
        msg.rate = 1.5; // พูดเร็วๆ หน่อย วัยรุ่นใจร้อน
        window.speechSynthesis.speak(msg);
    }
};

const setupMiniCalcListeners = () => {
    if (!miniCalcPad) return; // ถ้าไม่มีแผงปุ่ม ก็ไม่ต้องทำ

    miniCalcPad.addEventListener('click', (e) => {
        const target = e.target.closest('button.calc-key');
        if (!target) return;

        const key = target.dataset.key;
        
        // 🔥🔥🔥 ใส่เสียงตรงนี้แหละอีเจ๊! 🔥🔥🔥
        let textToSpeak = '';
        switch(key) {
            case '0': textToSpeak = 'ศูนย์'; break;
            case '1': textToSpeak = 'หนึ่ง'; break;
            case '2': textToSpeak = 'สอง'; break;
            case '3': textToSpeak = 'สาม'; break;
            case '4': textToSpeak = 'สี่'; break;
            case '5': textToSpeak = 'ห้า'; break;
            case '6': textToSpeak = 'หก'; break;
            case '7': textToSpeak = 'เจ็ด'; break;
            case '8': textToSpeak = 'แปด'; break;
            case '9': textToSpeak = 'เก้า'; break;
            case '+': textToSpeak = 'บวก'; break;
            case '-': textToSpeak = 'ลบ'; break;
            case '*': textToSpeak = 'คูณ'; break;
            case '/': textToSpeak = 'หาร'; break;
            case '=': textToSpeak = 'เท่ากับ'; break;
            case '.': textToSpeak = 'จุด'; break;
            case 'C': textToSpeak = 'เคลียร์'; break;
            case 'backspace': textToSpeak = 'ลบ'; break; // 
        }
        if(textToSpeak) speak(textToSpeak);
        // 🔥🔥🔥 จบส่วนเสียง 🔥🔥🔥

        // --- 1. จัดการปุ่มกด (ยกเว้น =) ---
        
        if (key === '=') {
            // --- 2. ถ้ากด = (ปุ่มสรุป) ---
            const result = evaluateCalcString(currentCalcString);
            updateAmountDue(result); // 🔥 ยิงผลลัพธ์เข้าจอเขียว!
            // พูดยอดเงิน
            if (result > 0) speakAmount(result);
            // ถ้าผลลัพธ์เป็น 0 ก็เคลียร์ไปเลย, ถ้าไม่ก็ให้เป็นสตริงผลลัพธ์
            currentCalcString = result === 0 ? "" : result.toString();
        
        } else {
            // --- 3. ถ้ากดปุ่มอื่นๆ (0-9, C, ⌫, +, -, *, /) ---
            
            // 3.1: ถ้ากดตัวเลข
            if (key >= '0' && key <= '9') {
                currentCalcString += key;
            } 
            // 3.2: ถ้ากดจุด
            else if (key === '.') {
                const parts = currentCalcString.split(/ [\+\-\*\/] /); // Split by ANY operator
                const lastPart = parts[parts.length - 1];
                
                if (lastPart.trim() === "") { // ถ้าเพิ่งกด "50 + "
                    currentCalcString += '0.'; // เริ่มด้วย "0."
                } else if (!lastPart.includes('.')) { // ถ้ายังไม่มีจุด
                    currentCalcString += '.';
                }
            } 
            // 3.3: ถ้ากด C (Clear)
            else if (key === 'C') {
                currentCalcString = "";
            } 
            // 3.4: ถ้ากด Backspace
            else if (key === 'backspace') {
                if (/ [\+\-\*\/] $/.test(currentCalcString)) {
                    currentCalcString = currentCalcString.slice(0, -3); // ลบ 3 ตัว (' + ', ' - ', ' * ', ' / ')
                } else {
                    currentCalcString = currentCalcString.slice(0, -1); // ลบตัวเดียว
                }
            } 
            // 3.5: ถ้ากด Operator (+, -, *, /)
            else if (['+', '-', '*', '/'].includes(key)) {
                // (ใช้สัญลักษณ์สวยๆ บนจอ)
                const displayOp = {
                    '+': '+',
                    '-': '−',
                    '*': '×',
                    '/': '÷'
                }[key];
                
                const opWithSpace = ` ${displayOp} `;
                
                // ถ้า string ว่างเปล่า, ไม่ต้องทำอะไร (กันการกด " + " เป็นตัวแรก)
                if (currentCalcString.trim() === "") {
                    // อนุญาตให้กด - เป็นตัวแรก (สำหรับเลขติดลบ... แต่คงไม่ใช้)
                    // if (key === '-') currentCalcString = '−'; 
                    return; // ป้องกันการกด operator เป็นตัวแรก
                }
                
                // ถ้าตัวสุดท้ายเป็น operator แล้ว, ให้ "เปลี่ยน" operator
                if (/ [\+\-\*\/] $/.test(currentCalcString)) {
                    currentCalcString = currentCalcString.slice(0, -3) + opWithSpace;
                } 
                // ถ้าไม่ใช่, ก็ "เพิ่ม" operator
                else {
                    currentCalcString += opWithSpace;
                }
            }
            
            // --- (นี่คือหัวใจ!) ---
            // 4. คำนวณยอดเรียลไทม์ "ทุกครั้ง" ที่กดปุ่ม
            const realtimeResult = evaluateCalcString(currentCalcString);
            updateAmountDue(realtimeResult); // 🔥 อัปเดตจอเขียวทันที!
        }
        
        // --- 5. อัปเดตจอแนวนอน (ทุกครั้งที่กด) ---
        miniCalcHistoryEl.textContent = currentCalcString;
        scrollToMiniCalcEnd(); // เลื่อนจอไปขวาสุด
    });
};
// ▲▲▲


// 11. ส่วนบันทึกแต้ม (Add Points Logic)
const addPoints = async () => {
    addPointsBtn.classList.add('is-loading');
    addPointsBtn.disabled = true;

    const activeTab = getActiveTab();
    const state = activeTab.calculatorState;
    const selectedCustomer = activeTab.customer; // แก้ไข: ดึง customer จาก activeTab
    
    // --- ✨ MODIFIED: No compute() needed, just read from state ---
    const amount = state.amountDue; 
    const tendered = parseFloat(activeTab.paymentState.cashTendered) || 0;

    if (!selectedCustomer) {
        showModal('ข้อมูลไม่ถูกต้อง', 'กรุณาเลือกลูกค้าก่อน', false);
        addPointsBtn.classList.remove('is-loading'); addPointsBtn.disabled = false; return;
    }
    // --- ✨ MODIFIED: Check if amount was entered ---
    if (amount <= 0 || isNaN(amount)) {
        showModal('ข้อมูลไม่ถูกต้อง', 'กรุณาระบุยอดรวมที่ต้องชำระก่อน', false);
        // manualAmountInput.focus(); // (ลบอันนี้ออก)
        addPointsBtn.classList.remove('is-loading'); addPointsBtn.disabled = false; return;
    }
    
    // --- ✨ NEW: Show cancel button ---
    cancelButton.classList.remove('hidden');

    const onConfirm = async () => {
        let pointsToAdd = 0;
        try {
            await runTransaction(db, async (transaction) => {
                const customerRef = doc(db, CUSTOMER_COLLECTION, selectedCustomer.id);
                const customerDoc = await transaction.get(customerRef);
                if (!customerDoc.exists()) throw new Error("ไม่พบข้อมูลลูกค้า");

                const currentData = customerDoc.data();
                const currentRemainder = currentData.purchase_remainder || 0;
                const totalValueForPoints = amount + currentRemainder;
                pointsToAdd = Math.floor(totalValueForPoints * POINTS_PER_BAHT);
                const newRemainder = parseFloat((totalValueForPoints % 100).toFixed(2));
                
                const newTotalPoints = (currentData.total_points || 0) + pointsToAdd;
                const newLifetimePoints = (currentData.lifetime_points || 0) + pointsToAdd;

                transaction.update(customerRef, {
                    total_points: newTotalPoints,
                    lifetime_points: newLifetimePoints,
                    purchase_remainder: newRemainder
                });

                const transactionRef = doc(collection(db, TRANSACTION_COLLECTION));
                transaction.set(transactionRef, {
                    customerId: selectedCustomer.id, customerName: selectedCustomer.name,
                    staffId: currentStaff.uid, staffEmail: currentStaff.email,
                    type: 'add_points', points_change: pointsToAdd,
                    purchase_amount: amount, timestamp: serverTimestamp()
                });
            });

            showModal('บันทึกสำเร็จ!', `เพิ่ม **${pointsToAdd} แต้ม** ให้คุณ ${selectedCustomer.name} เรียบร้อยแล้ว`);
            clearCalculatorState(true); // Clear state and reset customer
            updateDisplay();
            
            // Update local cache
            const index = allCustomersCache.findIndex(c => c.id === selectedCustomer.id);
            if(index > -1) {
                const updatedCustomerDoc = await getDoc(doc(db, CUSTOMER_COLLECTION, selectedCustomer.id));
                 if (updatedCustomerDoc.exists()) {
                    allCustomersCache[index] = {id: updatedCustomerDoc.id, ...updatedCustomerDoc.data()};
                    updateSelectedCustomerUI(getActiveTab().customer); // Refresh UI with latest data
                 }
            }
        } catch (error) {
            showModal('เกิดข้อผิดพลาด', `ไม่สามารถบันทึกแต้มได้: ${error.message}`, false);
        } finally {
            addPointsBtn.classList.remove('is-loading'); addPointsBtn.disabled = false;
        }
    };
    
    const formattedAmount = amount.toLocaleString('th-TH',{style:'currency', currency:'THB'});
    const changeAmount = (tendered - amount);
    
    if (tendered < amount && tendered > 0) { // Only show if some money was tendered
        // NEW: Option to proceed anyway if money is short
        const shortage = (amount - tendered).toLocaleString('th-TH', {minimumFractionDigits: 2});
        showModal(
            `รับเงินไม่พอ!`,
            `ลูกค้าจ่ายเงินขาด **${shortage} บาท**<br>คุณต้องการ **บันทึกแต้ม** ยอด **${formattedAmount}** บาทนี้เลยไหม?`,
            false,
            createConfirmButtons(onConfirm, 'ดำเนินการต่อ', 'btn--warning')
        );
        return;
    }
    
    showModal(
        `ยอดรวม: ${formattedAmount}`,
        `รับเงินมา: ${tendered > 0 ? tendered.toLocaleString('th-TH', {minimumFractionDigits: 2}) : '0.00'} บาท<br>เงินทอน: ${changeAmount > 0 ? changeAmount.toLocaleString('th-TH', {minimumFractionDigits: 2}) : '0.00'} บาท<br><br>ต้องการบันทึกยอดนี้ให้คุณ "${selectedCustomer.name}" ใช่หรือไม่?`,
        true,
        createConfirmButtons(onConfirm, 'ยืนยัน', 'btn--success')
    );
};

const createConfirmButtons = (onConfirm, confirmText = 'ยืนยัน', btnClass = 'btn--success') => {
    const container = document.createElement('div');
    container.className = 'flex gap-3 mt-6';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn--tertiary flex-1';
    cancelBtn.textContent = 'ยกเลิก';
    cancelBtn.onclick = () => {
        hideModal();
        addPointsBtn.classList.remove('is-loading');
        addPointsBtn.disabled = false;
    };
    const confirmBtn = document.createElement('button');
    confirmBtn.className = `btn ${btnClass} flex-1`;
    confirmBtn.textContent = confirmText;
    confirmBtn.onclick = () => {
        onConfirm();
        hideModal(); 
    };
    container.appendChild(cancelBtn);
    container.appendChild(confirmBtn);
    return container;
};

// 12. Event Listeners อื่นๆ
document.addEventListener('DOMContentLoaded', () => {
    setupCalculatorListeners(); // (ฟังก์ชันที่โดนรื้อ)
    
    // ▼▼▼ เรียกใช้ฟังก์ชัน Numpad ▼▼▼
    setupMiniCalcListeners(); 
    // ▲▲▲
    
	clearCustomerBtn.addEventListener('click', () => {
        const activeTab = getActiveTab();
        activeTab.customer = generalCustomer;
        activeTab.name = `ลูกค้า ${tabs.findIndex(t => t.id === activeTab.id) + 1}`;
        debouncedRenderTabs();
        updateSelectedCustomerUI(generalCustomer);
    });
    addPointsBtn.addEventListener('click', addPoints);
    cancelButton.addEventListener('click', () => {
        clearCalculatorState();
        updateDisplay();
    });
    modal.querySelector('#modal-close-btn').addEventListener('click', hideModal);
    
});
// --- Keyboard Shortcuts for Cashier ---
document.addEventListener('keydown', (e) => {
    // Enter = Confirm points
    if (e.key === 'Enter' && !addPointsBtn.disabled) {
        e.preventDefault();
        addPoints();
    }
    
    // Escape = Clear/Cancel
    if (e.key === 'Escape') {
        e.preventDefault();
        clearCalculatorState();
        updateDisplay();
    }
    
    // F5 = Refresh page
    if (e.key === 'F5') {
        e.preventDefault();
        location.reload();
    }
});

// Auto-focus on amount field when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const miniCalc = document.getElementById('mini-calc-history');
        if (miniCalc) miniCalc.focus();
    }, 500);
});

// --- Thai Text to Speech ---
const numberToThai = (num) => {
    const ones = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    
    if (num === 0) return 'ศูนย์บาท';
    
    let result = '';
    let numStr = Math.floor(num).toString();
    let len = numStr.length;
    
    // Simple conversion for numbers 0-99
    if (len === 1) {
        return ones[parseInt(numStr[0])] + 'บาท';
    }
    
    if (len === 2) {
        const tens = parseInt(numStr[0]);
        const ones_digit = parseInt(numStr[1]);
        
        if (tens === 1) {
            if (ones_digit === 0) return 'สิบบาท';
            return 'สิบ' + (ones_digit === 1 ? 'เอ็ด' : ones[ones_digit]) + 'บาท';
        } else if (tens === 2) {
            if (ones_digit === 0) return 'ยี่สิบบาท';
            return 'ยี่สิบ' + (ones_digit === 1 ? 'เอ็ด' : ones[ones_digit]) + 'บาท';
        } else {
            if (ones_digit === 0) return ones[tens] + 'สิบบาท';
            return ones[tens] + 'สิบ' + (ones_digit === 1 ? 'เอ็ด' : ones[ones_digit]) + 'บาท';
        }
    }
    
    // For 100+, use the original logic
    const scales = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
    
    for (let i = 0; i < len; i++) {
        let digit = parseInt(numStr[i]);
        let pos = len - i - 1;
        
        if (digit !== 0) {
            if (pos === 1 && digit === 1) {
                result += '';
            } else if (pos === 1 && digit === 2) {
                result += 'ยี่';
            } else if (pos === 0 && digit === 1 && len > 1) {
                result += 'เอ็ด';
            } else {
                result += ones[digit];
            }
            
            result += scales[pos];
        }
    }
    
    return result.trim() + 'บาท';
};

const speakAmount = (amount) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = 'เท่ากับ ' + numberToThai(amount);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
};
