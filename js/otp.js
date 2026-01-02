const params = new URLSearchParams(window.location.search);
const email = params.get('email');
const type = params.get('type') || 'signup';

const form = document.getElementById('otpForm');
const resendBtn = document.getElementById('resendOtp');
const otpInput = document.getElementById('otp');
const messageBox = document.getElementById('formMessage');
const subtitle = document.getElementById('subtitleText');

if (type === 'reset') {
  subtitle.textContent =
    'Enter the OTP sent to your email to reset your password';
}

const showMessage = (msg, type) => {
  messageBox.textContent = msg;
  messageBox.className = `form-message ${type}`;
  messageBox.style.display = 'block';
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const otp = otpInput.value.trim();

  if (otp.length !== 6) {
    showMessage('Please enter a valid 6-digit OTP', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, type })
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || 'OTP verification failed', 'error');
      return;
    }

    showMessage('OTP verified successfully', 'success');

    setTimeout(() => {
      if (type === 'reset') {
        window.location.href =
          `reset-password.html?email=${encodeURIComponent(email)}`;
      } else {
        window.location.href = 'login.html';
      }
    }, 900);

  } catch (err) {
    console.error(err);
    showMessage('Something went wrong. Please try again.', 'error');
  }
});

resendBtn.addEventListener('click', async () => {
  try {
    const endpoint =
      type === 'reset'
        ? `${API_BASE}/users/forgot-password`
        : `${API_BASE}/users/register`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    showMessage(data.message || 'OTP resent', 'success');

  } catch (err) {
    console.error(err);
    showMessage('Failed to resend OTP', 'error');
  }
});
