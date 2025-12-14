class FinanceTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.currentFilter = 'all';
        
        this.initElements();
        this.initEvents();
        this.setDefaultDate();
        this.render();
    }

    initElements() {
        // Форма
        this.inputAmount = document.getElementById('inputAmount');
        this.selectType = document.getElementById('selectType');
        this.selectCategory = document.getElementById('selectCategory');
        this.inputNote = document.getElementById('inputNote');
        this.inputDate = document.getElementById('inputDate');
        this.btnAdd = document.getElementById('btnAdd');
        
        // Отображение
        this.totalBalance = document.getElementById('totalBalance');
        this.totalIncome = document.getElementById('totalIncome');
        this.totalExpense = document.getElementById('totalExpense');
        this.transactionsList = document.getElementById('transactionsList');
        
        // Фильтры
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        // Статистика
        this.btnStats = document.getElementById('btnStats');
        this.btnCloseStats = document.getElementById('btnCloseStats');
        this.statsModal = document.getElementById('statsModal');
        this.chartContainer = document.getElementById('chartContainer');
    }

    initEvents() {
        // Добавление операции
        this.btnAdd.addEventListener('click', () => this.addTransaction());
        
        // Также добавляем по Enter в поле суммы
        this.inputAmount.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTransaction();
        });
        
        // Фильтры
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        
        // Статистика
        this.btnStats.addEventListener('click', () => this.showStats());
        this.btnCloseStats.addEventListener('click', () => this.hideStats());
        
        // Закрытие модального окна по клику вне его
        this.statsModal.addEventListener('click', (e) => {
            if (e.target === this.statsModal) this.hideStats();
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        this.inputDate.value = today;
    }

    addTransaction() {
        const amount = parseFloat(this.inputAmount.value);
        const type = this.selectType.value;
        const category = this.selectCategory.value;
        const note = this.inputNote.value.trim();
        const date = this.inputDate.value;
        
        // Валидация
        if (!amount || amount <= 0) {
            alert('Введите корректную сумму!');
            this.inputAmount.focus();
            return;
        }
        
        if (!category) {
            alert('Выберите категорию!');
            this.selectCategory.focus();
            return;
        }
        
        // Создаем транзакцию
        const transaction = {
            id: Date.now(),
            amount: type === 'expense' ? amount : amount,
            type: type,
            category: category,
            note: note,
            date: date,
            timestamp: new Date(date).getTime()
        };
        
        // Добавляем в массив
        this.transactions.unshift(transaction); // Добавляем в начало
        
        // Сохраняем
        this.saveToLocalStorage();
        
        // Очищаем форму
        this.inputAmount.value = '';
        this.inputNote.value = '';
        this.selectCategory.value = '';
        this.inputAmount.focus();
        
        // Обновляем интерфейс
        this.render();
        
        // Показываем анимацию
        this.showSuccessAnimation();
    }

    deleteTransaction(id) {
        if (confirm('Удалить эту операцию?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Обновляем активную кнопку
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    calculateTotals() {
        let income = 0;
        let expense = 0;
        
        this.transactions.forEach(t => {
            if (t.type === 'income') {
                income += t.amount;
            } else {
                expense += t.amount;
            }
        });
        
        const balance = income - expense;
        
        return { income, expense, balance };
    }

    getFilteredTransactions() {
        if (this.currentFilter === 'all') {
            return this.transactions;
        }
        return this.transactions.filter(t => t.type === this.currentFilter);
    }

    formatCurrency(amount) {
        return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ') + ' ₽';
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Сегодня';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Вчера';
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    }

    render() {
        const { income, expense, balance } = this.calculateTotals();
        const filteredTransactions = this.getFilteredTransactions();
        
        // Обновляем баланс
        this.totalBalance.textContent = this.formatCurrency(balance);
        this.totalIncome.textContent = '+' + this.formatCurrency(income);
        this.totalExpense.textContent = '-' + this.formatCurrency(expense);
        
        // Обновляем список операций
        if (filteredTransactions.length === 0) {
            this.transactionsList.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">receipt_long</span>
                    <p>Операций пока нет</p>
                    <p>Добавьте первую операцию!</p>
                </div>
            `;
            return;
        }
        
        this.transactionsList.innerHTML = filteredTransactions.map(transaction => `
            <div class="transaction-item ${transaction.type}">
                <div class="transaction-info">
                    <div class="transaction-category">
                        ${this.getCategoryIcon(transaction.category)} ${transaction.category}
                    </div>
                    ${transaction.note ? `<div class="transaction-note">${transaction.note}</div>` : ''}
                    <div class="transaction-date">${this.formatDate(transaction.date)}</div>
                </div>
                <div class="transaction-right">
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </div>
                    <button class="delete-btn" onclick="financeTracker.deleteTransaction(${transaction.id})">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getCategoryIcon(category) {
        const icons = {
            'Еда': '🍕',
            'Транспорт': '🚗',
            'Развлечения': '🎬',
            'Жилье': '🏠',
            'Одежда': '👕',
            'Зарплата': '💼',
            'Фриланс': '💻',
            'Инвестиции': '📈',
            'Подарок': '🎁'
        };
        return icons[category] || '💰';
    }

    showStats() {
        this.statsModal.style.display = 'flex';
        this.renderChart();
    }

    hideStats() {
        this.statsModal.style.display = 'none';
    }

    renderChart() {
        // Простой текстовый отчет (можно заменить на Chart.js)
        const { income, expense } = this.calculateTotals();
        const categories = {};
        
        this.transactions.forEach(t => {
            if (!categories[t.category]) {
                categories[t.category] = { income: 0, expense: 0 };
            }
            categories[t.category][t.type] += t.amount;
        });
        
        let chartHTML = `
            <div style="text-align: center; padding: 20px;">
                <h3>Общая статистика</h3>
                <p>Всего доходов: <strong>+${this.formatCurrency(income)}</strong></p>
                <p>Всего расходов: <strong>-${this.formatCurrency(expense)}</strong></p>
                <p>Баланс: <strong>${this.formatCurrency(income - expense)}</strong></p>
                
                <h4 style="margin-top: 20px;">По категориям:</h4>
        `;
        
        for (const [category, data] of Object.entries(categories)) {
            if (data.income > 0 || data.expense > 0) {
                chartHTML += `
                    <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                        <strong>${category}</strong><br>
                        ${data.income > 0 ? `Доходы: +${this.formatCurrency(data.income)}` : ''}
                        ${data.expense > 0 ? `Расходы: -${this.formatCurrency(data.expense)}` : ''}
                    </div>
                `;
            }
        }
        
        chartHTML += '</div>';
        this.chartContainer.innerHTML = chartHTML;
    }

    showSuccessAnimation() {
        const btn = this.btnAdd;
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<span class="material-icons">check</span> Добавлено!';
        btn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
        }, 1500);
    }

    saveToLocalStorage() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }
}

// Инициализация приложения
let financeTracker;

document.addEventListener('DOMContentLoaded', () => {
    financeTracker = new FinanceTracker();
    
    // Добавляем тестовые данные, если нет своих
    if (financeTracker.transactions.length === 0) {
        const testTransactions = [
            {
                id: 1,
                amount: 50000,
                type: 'income',
                category: 'Зарплата',
                note: 'Аванс',
                date: new Date().toISOString().split('T')[0],
                timestamp: Date.now() - 86400000
            },
            {
                id: 2,
                amount: 1500,
                type: 'expense',
                category: 'Еда',
                note: 'Обед в кафе',
                date: new Date().toISOString().split('T')[0],
                timestamp: Date.now() - 43200000
            },
            {
                id: 3,
                amount: 500,
                type: 'expense',
                category: 'Транспорт',
                note: 'Такси',
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                timestamp: Date.now() - 86400000 * 2
            }
        ];
        
        financeTracker.transactions = testTransactions;
        financeTracker.saveToLocalStorage();
        financeTracker.render();
    }
});