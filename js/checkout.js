/* -------------------- CART & TOTAL -------------------- */
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
const finalAmount = localStorage.getItem('finalAmount');

const cartItemsContainer = document.getElementById('cart-items');
const totalAmountEl = document.getElementById('total-amount');

cart.forEach(item => {
  const li = document.createElement('li');
  li.textContent = `${item.name} | Qty: ${item.quantity} | $${item.price * item.quantity}`;
  cartItemsContainer.appendChild(li);
});

let total;
if (finalAmount) {
  total = Number(finalAmount);
} else {
  total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

totalAmountEl.textContent = total.toFixed(2);

/* -------------------- PAYPAL INTEGRATION -------------------- */
paypal.Buttons({

  /* STEP 1: CREATE ORDER */
  createOrder: async () => {

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!name || !email || !phone || !address) {
      alert("Please fill all details before payment");
      throw new Error("Form validation failed");
    }

    const res = await fetch(
      `${API_BASE}/checkout/paypal/create-order`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total })
      }
    );

    const data = await res.json();
    return data.orderID;
  },

  /* STEP 2: CAPTURE PAYMENT */
  onApprove: async (data) => {

    const captureRes = await fetch(
      `${API_BASE}/checkout/paypal/capture-order`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: data.orderID })
      }
    );

    const captureData = await captureRes.json();

    /* STEP 3: SAVE ORDER IN DB */
    const finalOrder = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      cart,
      payment: captureData.captureId,
      total_amount: total
    };

    const res = await fetch(
      `${API_BASE}/checkout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalOrder)
      }
    );

    if (res.ok) {
      localStorage.removeItem("cart");
      localStorage.removeItem("finalAmount");
      window.location.href = "order-success.html";
    } else {
      alert("Payment succeeded but order save failed");
    }
  },

  onError: (err) => {
    console.error(err);
    alert("Payment failed. Please try again.");
  }

}).render('#paypal-button-container');
