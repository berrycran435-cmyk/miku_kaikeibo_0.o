// --- ELEMEN DOM ---
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const linkToRegister = document.getElementById('link-to-register');
const linkToLogin = document.getElementById('link-to-login');
const btnLogout = document.getElementById('btn-logout');

const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const type = document.getElementById('type');
const balanceEl = document.getElementById('balance');
const moneyPlusEl = document.getElementById('money-plus');
const moneyMinusEl = document.getElementById('money-minus');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit');
const editIdInput = document.getElementById('edit-id');
const welcomeUserEl = document.getElementById('welcome-user');

// --- VARIABEL GLOBAL ---
let currentUser = null;
let transactions = [];

// --- INIT (SAAT LOAD) ---
window.onload = () => {
    // Cek session login
    const savedUser = localStorage.getItem('miku_finance_user');
    if (savedUser) {
        currentUser = savedUser;
        loadUserData();
        showApp();
    }
};

// --- AUTHENTICATION SYSTEM ---
linkToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

linkToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// Register Logic
btnRegister.addEventListener('click', () => {
    const user = document.getElementById('reg-user').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();

    if (!user || !pass) return alert("Please fill ID and Password!");

    const usersDB = JSON.parse(localStorage.getItem('miku_users_db')) || {};
    
    if (usersDB[user]) {
        alert("ID already taken!");
    } else {
        usersDB[user] = pass; 
        localStorage.setItem('miku_users_db', JSON.stringify(usersDB));
        alert("Registration Success! Please Login.");
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }
});

// Login Logic
btnLogin.addEventListener('click', () => {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    const usersDB = JSON.parse(localStorage.getItem('miku_users_db')) || {};

    if (usersDB[user] && usersDB[user] === pass) {
        currentUser = user;
        localStorage.setItem('miku_finance_user', user);
        loadUserData();
        showApp();
    } else {
        alert("Wrong ID or Password!");
    }
});

// Logout Logic
btnLogout.addEventListener('click', () => {
    localStorage.removeItem('miku_finance_user');
    currentUser = null;
    transactions = [];
    appScreen.classList.remove('active');
    appScreen.classList.add('hidden');
    authScreen.classList.add('active');
    authScreen.classList.remove('hidden');
    
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
});

function showApp() {
    authScreen.classList.remove('active');
    authScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    setTimeout(() => appScreen.classList.add('active'), 50); // Fade in effect
    
    // Update welcome text with HTML inside
    welcomeUserEl.innerHTML = `User: <span class="highlight-text">${currentUser}</span>`;
}

// --- CORE FUNCTIONALITY (CRUD) ---

// 1. Load Data
function loadUserData() {
    const data = localStorage.getItem(`miku_data_${currentUser}`);
    transactions = data ? JSON.parse(data) : [];
    renderList();
}

// 2. Save Data
function saveData() {
    localStorage.setItem(`miku_data_${currentUser}`, JSON.stringify(transactions));
    renderList();
}

// 3. Add & Edit Transaction
form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (text.value.trim() === '' || amount.value.trim() === '') {
        alert('Please complete the data input');
        return;
    }

    const idToEdit = editIdInput.value;

    if (idToEdit) {
        // MODE EDIT
        const index = transactions.findIndex(t => t.id == idToEdit);
        if (index !== -1) {
            transactions[index].text = text.value;
            transactions[index].amount = +amount.value;
            transactions[index].type = type.value;
        }
    } else {
        // MODE NEW
        const transaction = {
            id: generateID(),
            text: text.value,
            amount: +amount.value,
            type: type.value,
            date: new Date().toISOString()
        };
        transactions.push(transaction);
    }

    saveData();
    resetForm();
});

function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// 4. Delete Transaction
window.removeTransaction = function(id) {
    if(confirm("Delete this data?")) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        saveData();
    }
}

// 5. Prepare Edit
window.prepareEdit = function(id) {
    const item = transactions.find(t => t.id === id);
    if (!item) return;

    text.value = item.text;
    amount.value = item.amount;
    type.value = item.type;
    editIdInput.value = item.id;

    submitBtn.innerText = "UPDATE DATA";
    submitBtn.classList.remove('btn-main');
    submitBtn.classList.add('btn-edit'); // Change visual
    cancelEditBtn.classList.remove('hidden');
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
    text.value = '';
    amount.value = '';
    type.value = 'income';
    editIdInput.value = '';
    
    submitBtn.innerText = "ADD TRANSACTION";
    submitBtn.classList.add('btn-main');
    submitBtn.classList.remove('btn-edit');
    cancelEditBtn.classList.add('hidden');
}

// --- RENDER UI ---
function renderList() {
    list.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
}

function addTransactionDOM(transaction) {
    const sign = transaction.type === 'expense' ? '-' : '+';
    const itemClass = transaction.type; // 'income' or 'expense'
    const dateFormatted = new Date(transaction.date || Date.now()).toLocaleDateString('ja-JP');

    const item = document.createElement('li');
    item.classList.add(itemClass);

    item.innerHTML = `
        <div class="trans-info">
            <span>${transaction.text}</span>
            <span class="trans-date">${dateFormatted}</span>
        </div>
        <div style="display:flex; align-items:center;">
            <span class="trans-amount">${sign}Rp ${formatMoney(transaction.amount)}</span>
            <div class="action-group">
                <button class="btn-edit" onclick="prepareEdit(${transaction.id})">EDIT</button>
                <button class="btn-del" onclick="removeTransaction(${transaction.id})">DEL</button>
            </div>
        </div>
    `;

    list.appendChild(item);
}

function updateValues() {
    const amounts = transactions.map(t => t.type === 'expense' ? -t.amount : t.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0);

    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => (acc += t.amount), 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => (acc += t.amount), 0);

    balanceEl.innerText = `Rp ${formatMoney(total)}`;
    moneyPlusEl.innerText = `+Rp ${formatMoney(income)}`;
    moneyMinusEl.innerText = `-Rp ${formatMoney(expense)}`;
}

function formatMoney(num) {
    return num.toFixed(0).replace(/\d(?=(\d{3})+$)/g, '$&.');
}
