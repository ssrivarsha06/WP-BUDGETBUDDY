let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let expenseChart = null;  // Initialize chart variables globally
let trendChart = null;

const updateDashboard = () => {
    const currentTimeRange = getCurrentTimeRange();
    const currentDate = new Date();
    
    // Filter transactions based on time range
    const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        switch(currentTimeRange) {
            case 'daily':
                return transactionDate.toDateString() === currentDate.toDateString();
            case 'monthly':
                return transactionDate.getMonth() === currentDate.getMonth() && 
                       transactionDate.getFullYear() === currentDate.getFullYear();
            case 'yearly':
                return transactionDate.getFullYear() === currentDate.getFullYear();
            default:
                return true;
        }
    });

    // Calculate totals
    const totals = filteredTransactions.reduce((acc, transaction) => {
        if (transaction.amount > 0) {
            acc.income += transaction.amount;
        } else {
            acc.expenses += Math.abs(transaction.amount);
        }
        acc.balance = acc.income - acc.expenses;
        acc.savings = acc.income * 0.2; // Assuming 20% savings rate
        return acc;
    }, { income: 0, expenses: 0, balance: 0, savings: 0 });

    // Update stat cards
    document.getElementById('savingsValue').textContent = `$${totals.savings.toFixed(2)}`;
    document.getElementById('balanceValue').textContent = `$${totals.balance.toFixed(2)}`;
    document.getElementById('expensesValue').textContent = `$${totals.expenses.toFixed(2)}`;
    document.getElementById('incomeValue').textContent = `$${totals.income.toFixed(2)}`;

    // Calculate expense breakdown for pie chart
    const expensesByCategory = filteredTransactions
        .filter(t => t.amount < 0)
        .reduce((acc, transaction) => {
            acc[transaction.category] = (acc[transaction.category] || 0) + Math.abs(transaction.amount);
            return acc;
        }, {});

    // Update expense chart
    const expenseData = Object.entries(expensesByCategory).map(([name, value]) => ({
        name,
        value: (value / totals.expenses) * 100
    }));

    // Update trend chart data
    const trendData = getTrendData(currentTimeRange, filteredTransactions);

    // Update charts
    updateCharts(expenseData, trendData);

    // Update transactions table
    updateTransactionsTable(filteredTransactions);
};

const getTrendData = (timeRange, transactions) => {
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    
    switch(timeRange) {
        case 'daily':
            // Last 7 days
            for(let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
                
                const dayTransactions = transactions.filter(t => 
                    new Date(t.date).toDateString() === date.toDateString()
                );
                
                incomeData.push(dayTransactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0));
                expenseData.push(dayTransactions.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0));
            }
            break;
        case 'monthly':
            // Last 6 months
            for(let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
                
                const monthTransactions = transactions.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate.getMonth() === date.getMonth() && 
                           tDate.getFullYear() === date.getFullYear();
                });
                
                incomeData.push(monthTransactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0));
                expenseData.push(monthTransactions.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0));
            }
            break;
        case 'yearly':
            // Last 5 years
            for(let i = 4; i >= 0; i--) {
                const date = new Date();
                date.setFullYear(date.getFullYear() - i);
                labels.push(date.getFullYear().toString());
                
                const yearTransactions = transactions.filter(t => 
                    new Date(t.date).getFullYear() === date.getFullYear()
                );
                
                incomeData.push(yearTransactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0));
                expenseData.push(yearTransactions.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0));
            }
            break;
    }
    
    return {
        labels,
        income: incomeData,
        expenses: expenseData
    };
};

const updateCharts = (expenseData, trendData) => {
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    const trendCtx = document.getElementById('trendChart').getContext('2d');

    // Destroy existing charts if they exist
    if (expenseChart instanceof Chart) {
        expenseChart.destroy();
    }
    if (trendChart instanceof Chart) {
        trendChart.destroy();
    }

    // Create new Expense Chart
    expenseChart = new Chart(expenseCtx, {
        type: 'doughnut',
        data: {
            labels: expenseData.map(item => item.name),
            datasets: [{
                data: expenseData.map(item => item.value),
                backgroundColor: ['#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Create new Trend Chart
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: [
                {
                    label: 'Income',
                    data: trendData.income,
                    borderColor: '#10B981',
                    tension: 0.1
                },
                {
                    label: 'Expenses',
                    data: trendData.expenses,
                    borderColor: '#EF4444',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
};

const updateTransactionsTable = (filteredTransactions) => {
    const tbody = document.getElementById('transactionsBody');
    tbody.innerHTML = '';
    
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.description}</td>
                <td>${transaction.category}</td>
                <td class="${transaction.amount >= 0 ? 'positive' : 'negative'}">
                    $${Math.abs(transaction.amount).toFixed(2)}
                </td>
            `;
            tbody.appendChild(row);
        });
};

// Form handling functions
function handleExpenseSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const amount = parseFloat(form.elements[0].value);
    const description = form.elements[1].value;
    const category = form.elements[2].value;

    const transaction = {
        date: new Date().toISOString().split('T')[0],
        description,
        amount: -amount,
        category
    };

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateDashboard();
    closeModal('expenseModal');
    form.reset();
}

function handleIncomeSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const amount = parseFloat(form.elements[0].value);
    const description = form.elements[1].value;
    const category = form.elements[2].value;

    const transaction = {
        date: new Date().toISOString().split('T')[0],
        description,
        amount: amount,
        category
    };

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateDashboard();
    closeModal('incomeModal');
    form.reset();
}

function handleTransactionSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const type = form.elements[0].value;
    const amount = parseFloat(form.elements[1].value);
    const description = form.elements[2].value;
    const date = form.elements[3].value;
    const category = form.elements[4].value;

    const transaction = {
        date,
        description,
        amount: type === 'income' ? amount : -amount,
        category
    };

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateDashboard();
    closeModal('transactionModal');
    form.reset();
}

// Modal handling
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    if (modalId === 'transactionModal') {
        setupTransactionCategoryDropdown();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function setupTransactionCategoryDropdown() {
    const typeSelect = document.getElementById('transactionType');
    const categorySelect = document.getElementById('transactionCategory');
    const type = typeSelect.value;

    const categories = type === 'income' 
        ? ['Salary', 'Freelance', 'Investment', 'Other']
        : ['Food', 'Transport', 'Shopping', 'Entertainment'];

    categorySelect.innerHTML = '<option value="">Select Category</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// Data management enhancement
function addTransaction(transaction) {
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function getCurrentTimeRange() {
    const activeButton = document.querySelector('.time-btn.active');
    return activeButton ? activeButton.dataset.range : 'daily';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    
    // Time range buttons
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(button => {
        button.addEventListener('click', () => {
            timeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateDashboard();
        });
    });

    // Transaction type change handler
    document.getElementById('transactionType').addEventListener('change', function() {
        setupTransactionCategoryDropdown();
    });

    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
});