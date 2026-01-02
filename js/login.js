const form = document.getElementById('loginForm');
const messageBox = document.getElementById('formMessage');

const showMessage = (msg, type) => {
  messageBox.textContent = msg;
  messageBox.className = `form-message ${type}`;
  messageBox.style.display = 'block';
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showMessage('Please enter email and password', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || 'Login failed', 'error');
      return;
    }

    localStorage.setItem('authToken', data.token);
    showMessage('Login successful', 'success');

    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 800);

  } catch (err) {
    console.error(err);
    showMessage('Something went wrong. Please try again.', 'error');
  }
});
