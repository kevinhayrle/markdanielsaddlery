const params = new URLSearchParams(window.location.search);
const email = params.get('email');
const type = params.get('type') || 'signup';
const form = document.getElementById('otpForm');
const resendBtn = document.getElementById('resendOtp');
const otpInput = document.getElementById('otp');
const messageBox = document.getElementById('formMessage');
const subtitle = document.getElementById('subtitleText');

if (type === 'reset' && subtitle) {
  subtitle.textContent =
    'Enter the OTP sent to your email to reset your password';
}

const showMessage = (message, variant = 'error') => {
  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `form-message ${variant}`;
  messageBox.style.display = 'block';
};

const saveAuthState = (data) => {
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }

  if (data.user) {
    localStorage.setItem(
      'user',
      JSON.stringify({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone
      })
    );
  }
};

const handlePostOTPRedirect = () => {
  if (type === 'reset') {
    window.location.href =
      `reset-password.html?email=${encodeURIComponent(email)}`;
    return;
  }

  const redirect = localStorage.getItem('redirectAfterLogin');

  if (redirect) {
    localStorage.removeItem('redirectAfterLogin');
    window.location.href = redirect;
  } else {
    window.location.href = 'profile.html';
  }
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const otp = otpInput.value.trim();

  if (!email) {
    showMessage('Invalid session. Please restart signup.', 'error');
    return;
  }

  if (!/^\d{6}$/.test(otp)) {
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

    saveAuthState(data);

    setTimeout(handlePostOTPRedirect, 900);

  } catch (err) {
    console.error('OTP verify error:', err);
    showMessage('Something went wrong. Please try again.', 'error');
  }
});

resendBtn.addEventListener('click', async () => {
  if (!email) {
    showMessage('Invalid session. Please restart signup.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type })
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || 'Failed to resend OTP', 'error');
      return;
    }

    showMessage(data.message || 'OTP resent successfully', 'success');

  } catch (err) {
    console.error('Resend OTP error:', err);
    showMessage('Failed to resend OTP', 'error');
  }
});
