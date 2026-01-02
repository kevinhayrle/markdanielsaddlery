const email = new URLSearchParams(window.location.search).get('email');
const form = document.getElementById('resetForm');
const messageBox = document.getElementById('formMessage');

const showMessage = (msg, type) => {
  messageBox.textContent = msg;
  messageBox.className = `form-message ${type}`;
  messageBox.style.display = 'block';
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!password || !confirmPassword) {
    showMessage('All fields are required.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showMessage('Passwords do not match.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || 'Failed to reset password.', 'error');
      return;
    }

    showMessage(
      'Password updated successfully. Redirecting to login...',
      'success'
    );

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);

  } catch (err) {
    console.error(err);
    showMessage('Something went wrong. Please try again.', 'error');
  }
});
