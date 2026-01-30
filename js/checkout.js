/* -------------------- AUTH GUARD -------------------- */

const token = localStorage.getItem('authToken');

if (!token) {
  localStorage.setItem('redirectAfterLogin', 'checkout.html');
  window.location.href = 'login.html';
  throw new Error("Not authenticated");
}

document.addEventListener("DOMContentLoaded", () => {

/* -------------------- AUTOFILL USER DETAILS -------------------- */

const user = JSON.parse(localStorage.getItem('user'));

if (user) {
  const setField = (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;

    if ('value' in el) {
      el.value = value || '';
      el.readOnly = true;
    } else {
      el.textContent = value || '';
    }
  };

  setField('name', user.name);
  setField('email', user.email);
  setField('phone', user.phone);
}

});

/* -------------------- CART & TOTAL -------------------- */

const cart = JSON.parse(localStorage.getItem('cart') || '[]');
const finalAmount = localStorage.getItem('finalAmount');

const cartItemsContainer = document.getElementById('cart-items');
const totalAmountEl = document.getElementById('total-amount');

cart.forEach(item => {
  const li = document.createElement('li');
  li.className = 'checkout-item';

li.innerHTML = `
  <div class="checkout-item-info">
    <strong>${item.name}</strong>

    <div class="checkout-line">
      Size: ${item.size} |
      Qty: ${item.quantity} |
      Price: $${item.price * item.quantity}
    </div>
  </div>
`;

  // 🔧 SHOW CUSTOM FIT (ONLY IF EXISTS)
  if (item.customFit?.note || item.customFit?.image) {
    const customDiv = document.createElement('div');
    customDiv.className = 'custom-fit-summary';

    if (item.customFit.note) {
      const note = document.createElement('p');
      note.innerHTML = `<strong>Custom Fit Note:</strong> ${item.customFit.note}`;
      customDiv.appendChild(note);
    }

if (item.customFit.image) {
  const img = document.createElement('img');
  img.src = item.customFit.image;
  img.alt = 'Custom Fit Reference';

  img.style.width = '48px';
  img.style.height = '48px';
  img.style.objectFit = 'cover';
  img.style.borderRadius = '4px';
  img.style.marginTop = '6px';
  img.style.cursor = 'pointer';

  img.onclick = () => {
    window.open(item.customFit.image, '_blank');
  };

  customDiv.appendChild(img);
}


    li.querySelector('.checkout-item-info').appendChild(customDiv);
  }

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
