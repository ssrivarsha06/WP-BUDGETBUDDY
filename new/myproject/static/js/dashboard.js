// Data structure for storing transactions
let transactions = [];

// DOM Elements
const addTransactionBtn = document.getElementById('addTransactionBtn');
const transactionModal = document.getElementById('transactionModal');
const transactionForm = document.getElementById('transactionForm');
const cancelBtn = document.getElementById('cancelBtn');
const transactionsList = document.getElementById('transactionsList');

// Initialize the app
function init() {
    loadTransactions();
    updateUI();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    addTransactionBtn.addEventListener('click', () => {
        transactionModal.classList.add('active');
    });

    cancelBtn.addEventListener('click', () => {
        transactionModal.classList.remove('active');
        transactionForm.reset();
    });

    transactionForm.addEventListener('submit', handleTransactionSubmit);
}

// Handle form submission
function handleTransactionSubmit(e) {
    e.preventDefault();

    const transaction = {
        id: Math.random().toString(36).substr(2, 9),
        title: document.getElementById('title').value,
        amount: Number(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        type: document.getElementById('type').value,
        category: document.getElementById('category').value
    };

    transactions.push(transaction);
    saveTransactions();
    updateUI();
    
    transactionModal.classList.remove('active');
    transactionForm.reset();
}

// Update UI elements
function updateUI() {
    updateSummaryCards();
    updateTransactionsList();
    updateOverviewChart();
    updateGoalsList();
}

// Update summary cards
function updateSummaryCards() {
    const { monthlyExpense, monthlyIncome, netBalance, totalSavings } = calculateTotals();
    
    document.getElementById('netBalance').textContent = `$${netBalance}`;
    document.getElementById('monthlyExpense').textContent = `$${monthlyExpense}`;
    document.getElementById('monthlyIncome').textContent = `$${monthlyIncome}`;
    document.getElementById('totalSavings').textContent = `$${totalSavings}`;
}

// Calculate totals
function calculateTotals() {
    const monthlyExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);
    
    const monthlyIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);
    
    const netBalance = monthlyIncome - monthlyExpense;
    const totalSavings = netBalance;

    return { monthlyExpense, monthlyIncome, netBalance, totalSavings };
}

// Update transactions list
function updateTransactionsList() {
    transactionsList.innerHTML = transactions.map(transaction => `
        <div class="transaction-item animate-fadeIn">
            <div class="transaction-info">
                <span class="transaction-title">${transaction.title}</span>
                <span class="transaction-date">${transaction.date}</span>
            </div>
            <div class="transaction-actions">
                <span class="transaction-amount ${transaction.type === 'income' ? 'amount-income' : 'amount-expense'}">
                    ${transaction.type === 'income' ? '+' : '-'}$${Math.abs(transaction.amount)}
                </span>
                <button onclick="deleteTransaction('${transaction.id}')" class="btn-secondary">Delete</button>
            </div>
        </div>
    `).join('');
}

// Update overview chart
function updateOverviewChart() {
    const expensesOnly = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expensesOnly.reduce((acc, curr) => acc + curr.amount, 0);
    
    const categories = ['Food & Drinks', 'Travel', 'Health', 'Entertainment'];
    const overviewChart = document.getElementById('overviewChart');
    
    overviewChart.innerHTML = categories.map(category => {
        const categoryTotal = expensesOnly
            .filter(t => t.category === category)
            .reduce((acc, curr) => acc + curr.amount, 0);
        
        const percentage = totalExpenses === 0 ? 0 : Math.round((categoryTotal / totalExpenses) * 100);
        
        return `
            <div class="progress-container">
                <div class="progress-header">
                    <span>${category}</span>
                    <span>${percentage}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Update goals list
function updateGoalsList() {
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date === today);
    
    const todayIncome = todayTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);
    
    const todayExpenses = todayTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);
    
    const todaySavings = todayIncome - todayExpenses;
    
    const todayEntertainment = todayTransactions
        .filter(t => t.category === 'Entertainment' && t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);
    
    const todayHealthyFood = todayTransactions
        .filter(t => t.category === 'Food & Drinks' && t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const goals = [
        { 
            title: 'Save $20 Daily', 
            current: Math.max(0, todaySavings), 
            total: 20 
        },
        { 
            title: 'Spend Only $30 On Entertainment', 
            current: Math.min(todayEntertainment, 30), 
            total: 30 
        },
        { 
            title: 'Spend On Healthy Foods', 
            current: Math.min(todayHealthyFood, 30), 
            total: 30 
        }
    ];

    const goalsList = document.getElementById('goalsList');
    goalsList.innerHTML = goals.map(goal => `
        <div class="progress-container">
            <div class="progress-header">
                <span class="font-medium">${goal.title}</span>
                <span class="text-gray-500">$${goal.current}/$${goal.total}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(goal.current / goal.total) * 100}%"></div>
            </div>
        </div>
    `).join('');
}

// Delete transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateUI();
}

// Local Storage functions
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadTransactions() {
    const saved = localStorage.getItem('transactions');
    transactions = saved ? JSON.parse(saved) : [];
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', init);
function updateDateDisplay() {
    const dateDisplay = document.getElementById('currentDate');
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const today = new Date();
    dateDisplay.textContent = today.toLocaleDateString('en-US', options);
}

// Initialize the app
function init() {
    loadTransactions();
    updateUI();
    setupEventListeners();
    updateDateDisplay(); // Add date display update
}

// ... keep existing code

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', init);
