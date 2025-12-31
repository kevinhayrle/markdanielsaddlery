const form = document.getElementById('signupForm');
    const resendBtn = document.getElementById('resendOtp');
    const messageBox = document.getElementById('formMessage');

    const showMessage = (msg, type) => {
      messageBox.textContent = msg;
      messageBox.className = `form-message ${type}`;
      messageBox.style.display = 'block';
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (!name || !email || !phone || !password) {
        showMessage('All fields are required', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password })
        });

        const data = await res.json();

        if (!res.ok) {
          showMessage(data.message || 'Signup failed', 'error');
          return;
        }

        showMessage('Signup successful. OTP sent to your email.', 'success');

        setTimeout(() => {
          window.location.href = `otp.html?email=${encodeURIComponent(email)}`;
        }, 900);

      } catch (err) {
        console.error(err);
        showMessage('Something went wrong. Please try again.', 'error');
      }
    });

    resendBtn.addEventListener('click', async () => {
      const email = document.getElementById('email').value.trim();

      if (!email) {
        showMessage('Please enter your email first', 'error');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/users/register`, {
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