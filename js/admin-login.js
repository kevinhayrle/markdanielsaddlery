document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMsg = document.getElementById('error-msg');

  errorMsg.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminLoginTime', Date.now()); // ✅ REQUIRED
      window.location.href = 'admin-dashboard.html';
    } else {
      errorMsg.textContent = data.message || 'Invalid credentials';
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = 'Server error. Please try again.';
  }
});
