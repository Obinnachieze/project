// 1. Select all UI elements
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from-currency");
const toSelect = document.getElementById("to-currency");
const swapBtn = document.getElementById("swap-btn");
const rateInfo = document.getElementById("rate-info");
const resultDisplay = document.getElementById("converted-amount");

// 2. Main function to fetch data and update UI
async function convertCurrency() {
  const amount = amountInput.value;

  // The Fawaz Ahmed API requires lowercase currency codes (usd, ngn)
  const from = fromSelect.value.toLowerCase();
  const to = toSelect.value.toLowerCase();

  // Prevent empty inputs or zeros
  if (amount === "" || amount <= 0) {
    resultDisplay.innerText = "0.00";
    return;
  }

  try {
    // Updated API URL (v1 is more stable for this provider)
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`;

    const response = await fetch(url);

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    // LOGIC FIX: The API structure is data[from][to]
    // Example: data["usd"]["ngn"]
    const rate = data[from][to];
    const convertedValue = amount * rate;

    // 3. Update the Display
    // Use toLocaleString for pretty commas (e.g., 1,500.00)
    resultDisplay.innerText = `${convertedValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${to.toUpperCase()}`;

    // Show the individual exchange rate below the main result
    rateInfo.innerText = `1 ${from.toUpperCase()} = ${rate.toFixed(
      4
    )} ${to.toUpperCase()}`;

    // 4. Save preferences to Chrome Storage (if running as extension)
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

// 5. Swap Button Logic
swapBtn.addEventListener("click", () => {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  convertCurrency();
});

// 6. Automatic Listeners (Real-time updates)
amountInput.addEventListener("input", convertCurrency);
fromSelect.addEventListener("change", convertCurrency);
toSelect.addEventListener("change", convertCurrency);

// 7. Initial Load: Retrieve saved settings from Chrome Storage
if (typeof chrome !== "undefined" && chrome.storage) {
  chrome.storage.local.get(["from", "to", "amount"], (data) => {
    if (data.from) fromSelect.value = data.from;
    if (data.to) toSelect.value = data.to;
    if (data.amount) amountInput.value = data.amount;
    convertCurrency();
  });
} else {
  // Run once on load if storage isn't available
  convertCurrency();
}
