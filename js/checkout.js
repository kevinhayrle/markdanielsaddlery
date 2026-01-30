/* -------------------- AUTH GUARD -------------------- */

const token = localStorage.getItem('authToken');

if (!token) {
  localStorage.setItem('redirectAfterLogin', 'checkout.html');
  window.location.href = 'login.html';
  throw new Error('Not authenticated');
}

/* -------------------- DOM READY -------------------- */

document.addEventListener('DOMContentLoaded', () => {

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

  /* -------------------- CART & TOTAL -------------------- */

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const finalAmount = localStorage.getItem('finalAmount');

  const cartItemsContainer = document.getElementById('cart-items');
  const totalAmountEl = document.getElementById('total-amount');

  cartItemsContainer.innerHTML = '';

  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'checkout-item';

    li.innerHTML = `
      <div class="checkout-item-info">
        <strong>${item.name}</strong>

        <div class="checkout-line">
          Size: ${item.size || '-'} |
          Qty: ${item.quantity || 1} |
          Price: $${item.price * (item.quantity || 1)}
        </div>
      </div>
    `;
/* ---------- CUSTOM FIT ---------- */

if (item.customFit?.note || item.customFit?.image) {
  const customDiv = document.createElement('div');
  customDiv.className = 'custom-fit-summary';

  // NOTE
  if (item.customFit.note) {
    const note = document.createElement('p');
    note.innerHTML = `<strong>Custom Fit Note:</strong> ${item.customFit.note}`;
    customDiv.appendChild(note);
  }

  // IMAGE
  if (item.customFit.image) {
    const img = document.createElement('img');
    img.src = item.customFit.image;
    img.alt = 'Custom Fit Reference';

    /* 🔑 ANDROID SAFE */
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.loading = 'lazy';

    img.style.width = '48px';
    img.style.height = '48px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '6px';
    img.style.marginTop = '6px';
    img.style.cursor = 'zoom-in';

    img.addEventListener('click', () => {
      openImageOverlay(item.customFit.image);
    });

    img.onerror = () => {
      img.style.display = 'none';

      const fallback = document.createElement('span');
      fallback.textContent = 'Custom fit image attached';
      fallback.style.fontSize = '12px';
      fallback.style.color = '#666';

      customDiv.appendChild(fallback);
    };

    customDiv.appendChild(img);
  }

  li.querySelector('.checkout-item-info').appendChild(customDiv);
}

  /* -------------------- TOTAL -------------------- */

  let total;
  if (finalAmount) {
    total = Number(finalAmount);
  } else {
    total = cart.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
  }

  totalAmountEl.textContent = total.toFixed(2);

  /* -------------------- PAYPAL -------------------- */

  paypal.Buttons({

    createOrder: async () => {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const address = document.getElementById('address').value.trim();

      if (!name || !email || !phone || !address) {
        alert('Please fill all details before payment');
        throw new Error('Form validation failed');
      }

      const res = await fetch(
        `${API_BASE}/checkout/paypal/create-order`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

      const res = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalOrder)
      });

      if (res.ok) {
        localStorage.removeItem('cart');
        localStorage.removeItem('finalAmount');
        window.location.href = 'order-success.html';
      } else {
        alert('Payment succeeded but order save failed');
      }
    },

    onError: (err) => {
      console.error(err);
      alert('Payment failed. Please try again.');
    }

  }).render('#paypal-button-container');

});

/* -------------------- IMAGE OVERLAY -------------------- */

function openImageOverlay(src) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;

  const img = document.createElement('img');
  img.src = src;
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  img.style.borderRadius = '8px';

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', () => overlay.remove());
}
