document.addEventListener('DOMContentLoaded', () => {

  const container = document.getElementById('cart-container');
  const grandTotalEl = document.getElementById('grand-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  const couponInput = document.getElementById('coupon-input');
  const couponMessage = document.getElementById('coupon-message');
  const applyCouponBtn = document.getElementById('apply-coupon-btn');

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
      originalTotal += parseFloat(product.price);

      const item = document.createElement('div');
      item.className = 'cart-item';
      item.innerHTML = `
        <img src="${product.image_url}" />
        <div class="cart-details">
          <h3>${product.name}</h3>
          <p>₹${product.price}</p>
          <button class="remove-btn">Remove</button>
        </div>
      `;
      container.appendChild(item);
    });

    finalTotal = originalTotal;
    grandTotalEl.textContent = `Grand Total: ₹${originalTotal}`;
    checkoutBtn.style.display = 'block';
  }

  updateCartUI();

  /* REMOVE ITEM (UNCHANGED) */
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
      const index = [...container.children].indexOf(
        e.target.closest('.cart-item')
      );

      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartUI();
    }
  });

  /* APPLY COUPON (ONLY BASE URL CHANGED) */
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
      couponMessage.textContent = `Coupon Applied! You saved ₹${data.discount}`;

      grandTotalEl.textContent = `Grand Total: ₹${finalTotal}`;
    } catch (err) {
      couponMessage.style.color = 'red';
      couponMessage.textContent = 'Failed to apply coupon';
    }
  });

  /* CHECKOUT (UNCHANGED) */
  checkoutBtn.addEventListener('click', () => {
    localStorage.setItem('finalAmount', finalTotal);
    window.location.href = 'checkout.html';
  });

});
