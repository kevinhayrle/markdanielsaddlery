document.addEventListener('DOMContentLoaded', () => {

  const preloader = document.getElementById('preloader');
  if (preloader) preloader.style.display = 'none';

  const container = document.getElementById('cart-container');
  const grandTotalEl = document.getElementById('grand-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const couponInput = document.getElementById('coupon-input');
  const couponMessage = document.getElementById('coupon-message');
  const applyCouponBtn = document.getElementById('apply-coupon-btn');

  const availableCouponsWrapper =
    document.getElementById('available-coupons');

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let originalTotal = 0;
  let finalTotal = 0;

  function updateCartUI() {
    container.innerHTML = '';
    originalTotal = 0;

    if (cart.length === 0) {
      container.innerHTML = '<p>Your cart is empty.</p>';
      grandTotalEl.textContent = '';
      checkoutBtn.style.display = 'none';
      return;
    }

    cart.forEach(product => {
      const qty = product.quantity || 1;
      const price = parseFloat(product.price);

      originalTotal += price * qty;

      const item = document.createElement('div');
      item.className = 'cart-item';
      item.dataset.id = product.id;

      item.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}">
        <div class="cart-details">
          <h3>${product.name}</h3>
          <p>Size: ${product.size || '-'}</p>
          <p>Qty: ${qty}</p>
          <p>$${(price * qty).toLocaleString()}</p>
          <button class="remove-btn">Remove</button>
        </div>
      `;

      container.appendChild(item);
    });

    finalTotal = originalTotal;
    grandTotalEl.textContent =
      `Grand Total: $${originalTotal.toLocaleString()}`;
    checkoutBtn.style.display = 'block';
  }

  async function loadAvailableCoupons() {
    if (!availableCouponsWrapper) return;

    try {
      const res = await fetch(`${API_BASE}/coupons`);
      const coupons = await res.json();

      availableCouponsWrapper.innerHTML = '';
      if (!Array.isArray(coupons) || coupons.length === 0) return;

      const today = new Date();

      coupons.forEach(c => {
        if (!c.isActive) return;
        if (c.expiryDate && new Date(c.expiryDate) < today) return;

        const chip = document.createElement('div');
        chip.className = 'coupon-chip';
        chip.textContent = c.couponCode;

        chip.onclick = () => {
          couponInput.value = c.couponCode;
          applyCouponBtn.click(); 
        };

        availableCouponsWrapper.appendChild(chip);
      });

    } catch (err) {
      console.error('Failed to load coupons', err);
    }
  }

  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
      const itemEl = e.target.closest('.cart-item');
      const id = itemEl.dataset.id;

      cart = cart.filter(item => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(cart));

      updateCartUI();
    }
  });

  applyCouponBtn.addEventListener('click', async () => {
    const code = couponInput.value.trim();
    if (!code) return;

    try {
      const res = await fetch(`${API_BASE}/coupons/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupon_code: code,
          cart_total: originalTotal
        })
      });

      const data = await res.json();

      if (!res.ok) {
        couponMessage.style.color = 'red';
        couponMessage.textContent = data.error;
        return;
      }

      finalTotal = data.final_total;

      couponMessage.style.color = 'green';
      couponMessage.textContent =
        `Coupon applied! You saved $${data.discount}`;

      grandTotalEl.textContent =
        `Grand Total: $${finalTotal.toLocaleString()}`;

      localStorage.setItem('appliedCoupon', code);
      localStorage.setItem('finalAmount', finalTotal);

    } catch (err) {
      couponMessage.style.color = 'red';
      couponMessage.textContent = 'Failed to apply coupon';
    }
  });

checkoutBtn.addEventListener('click', () => {

  const userToken = localStorage.getItem('authToken');

  localStorage.setItem('finalAmount', finalTotal);

  if (!userToken) {
    localStorage.setItem('redirectAfterLogin', 'checkout.html');
    window.location.href = 'signup.html';
    return;
  }

  window.location.href = 'checkout.html';
});

  updateCartUI();
  loadAvailableCoupons();

});
