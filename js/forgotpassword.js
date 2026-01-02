const form = document.getElementById('forgotForm');
const emailInput = document.getElementById('email');
const messageBox = document.getElementById('formMessage');

const showMessage = (msg, type) => {
  messageBox.textContent = msg;
  messageBox.className = `form-message ${type}`;
  messageBox.style.display = 'block';
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();

  if (!email) {
    showMessage('Please enter your email address.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || 'Failed to send OTP.', 'error');
      return;
    }

    showMessage('OTP sent to your email. Please check your inbox.', 'success');

    setTimeout(() => {
      window.location.href =
        `otp.html?email=${encodeURIComponent(email)}&type=reset`;
    }, 1200);

  } catch (err) {
    console.error(err);
    showMessage('Something went wrong. Please try again.', 'error');
  }
});
