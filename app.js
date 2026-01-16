class FinanceTracker {
  constructor() {
    this.transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    this.initElements();
    this.initEvents();
    this.render();
  }

  initElements() {
    this.descriptionInput = document.getElementById("description");
    this.amountInput = document.getElementById("amount");
    this.typeSelect = document.getElementById("type");
    this.addBtn = document.getElementById("addBtn");

    this.transactionList = document.getElementById("transactionList");
    this.balanceEl = document.getElementById("balance");
  }

  initEvents() {
    this.addBtn.addEventListener("click", () => this.addTransaction());
  }

  addTransaction() {
    const description = this.descriptionInput.value.trim();
    const amount = parseFloat(this.amountInput.value);
    const type = this.typeSelect.value;

    if (!description || isNaN(amount) || amount <= 0) {
      return;
    }

    const transaction = {
      id: Date.now(),
      description,
      amount,
      type,
      date: new Date().toISOString()
    };

    this.transactions.push(transaction);
    this.save();
    this.clearForm();
    this.render();
  }

  clearForm() {
    this.descriptionInput.value = "";
    this.amountInput.value = "";
    this.typeSelect.value = "income";
  }

  save() {
    localStorage.setItem("transactions", JSON.stringify(this.transactions));
  }

  calculateBalance() {
    return this.transactions.reduce((total, t) => {
      return t.type === "income"
        ? total + t.amount
        : total - t.amount;
    }, 0);
  }

  renderBalance() {
    const balance = this.calculateBalance();
    this.balanceEl.textContent = `${balance.toLocaleString()} ₽`;
  }

  renderTransactions() {
    this.transactionList.innerHTML = "";

    [...this.transactions].reverse().forEach(t => {
      const li = document.createElement("li");
      li.className = "transaction";

      li.innerHTML = `
        <div class="transaction-info">
          <span class="transaction-desc">${t.description}</span>
          <span class="transaction-type">
            ${t.type === "income" ? "Доход" : "Расход"}
          </span>
        </div>
        <span class="transaction-amount ${t.type}">
          ${t.type === "income" ? "+" : "-"}${t.amount} ₽
        </span>
      `;

      this.transactionList.appendChild(li);
    });
  }

  render() {
    this.renderBalance();
    this.renderTransactions();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FinanceTracker();
});
