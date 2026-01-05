// 1. Select all UI elements
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from-currency");
const toSelect = document.getElementById("to-currency");
const swapBtn = document.getElementById("swap-btn");
const rateInfo = document.getElementById("rate-info");
const resultDisplay = document.getElementById("converted-amount");

// 2. Map currency codes to their symbols
const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
  JPY: "¥",
  CAD: "$",
  AUD: "$",
};

// 3. Main function to fetch data and update UI
async function convertCurrency() {
  const amount = amountInput.value;

  // Get values from dropdowns (Use uppercase for labels/symbols, lowercase for API)
  const fromCode = fromSelect.value.toUpperCase();
  const toCode = toSelect.value.toUpperCase();
  const from = fromCode.toLowerCase();
  const to = toCode.toLowerCase();

  if (amount === "" || amount <= 0) {
    resultDisplay.innerText = "0.00";
    return;
  }

  try {
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    // API logic: data[from][to]
    const rate = data[from][to];
    const convertedValue = amount * rate;

    // 4. Update the Display Dynamically
    const symbol = currencySymbols[toCode] || ""; // Get symbol (¥, ₦, etc.)

    // Show: Symbol + Formatted Number + Code (e.g., ¥ 150.00 JPY)
    resultDisplay.innerText = `${symbol} ${convertedValue.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )} ${toCode}`;

    // Update the smaller rate text (e.g., 1 USD = 150.00 JPY)
    rateInfo.innerText = `1 ${fromCode} = ${rate.toFixed(4)} ${toCode}`;

    // 5. Save preferences to Chrome Storage
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({
        from: fromSelect.value,
        to: toSelect.value,
        amount,
      });
    }
  } catch (error) {
    console.error("API Error:", error);
    resultDisplay.innerText = "Error";
    rateInfo.innerText = "Check your connection or currency codes.";
  }
}

// 6. Swap Button Logic
swapBtn.addEventListener("click", () => {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  convertCurrency();
});

// 7. Automatic Listeners
amountInput.addEventListener("input", convertCurrency);
fromSelect.addEventListener("change", convertCurrency);
toSelect.addEventListener("change", convertCurrency);

// 8. Initial Load
if (typeof chrome !== "undefined" && chrome.storage) {
  chrome.storage.local.get(["from", "to", "amount"], (data) => {
    if (data.from) fromSelect.value = data.from;
    if (data.to) toSelect.value = data.to;
    if (data.amount) amountInput.value = data.amount;
    convertCurrency();
  });
} else {
  convertCurrency();
}
