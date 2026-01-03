/* ==================== AUTH GUARD ==================== */

const token = localStorage.getItem('authToken');

if (!token) {
  localStorage.setItem('redirectAfterLogin', 'profile.html');
  window.location.href = 'login.html';
  throw new Error('Not authenticated');
}

localStorage.removeItem('redirectAfterLogin');

/* ==================== ELEMENTS ==================== */

const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');

const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');
const messageBox = document.getElementById('formMessage');

const lockedText = document.querySelector('.locked-text');

const showMessage = (msg, type) => {
  messageBox.textContent = msg;
  messageBox.className = `form-message ${type}`;
  messageBox.style.display = 'block';
};

/* ==================== LOAD PROFILE ==================== */

async function loadProfile() {
  try {
    const res = await fetch(`${API_BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
      return;
    }

    const user = await res.json();

    nameInput.value = user.name || '';
    emailInput.value = user.email || '';
    phoneInput.value = user.phone || '';

    localStorage.setItem('user', JSON.stringify({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    }));

  } catch (err) {
    console.error(err);
    showMessage('Failed to load profile.', 'error');
  }
}

/* ==================== EDIT ==================== */

editBtn.addEventListener('click', () => {
  nameInput.disabled = false;
  phoneInput.disabled = false;

  lockedText.style.display = 'block';

  editBtn.style.display = 'none';
  saveBtn.style.display = 'inline-block';

  showMessage('You can now edit your profile details.', 'success');
});

/* ==================== SAVE ==================== */

saveBtn.addEventListener('click', async () => {
  const updatedData = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedData)
    });

    if (!res.ok) {
      showMessage('Failed to update profile.', 'error');
      return;
    }

    nameInput.disabled = true;
    phoneInput.disabled = true;

    lockedText.style.display = 'none';

    saveBtn.style.display = 'none';
    editBtn.style.display = 'inline-block';

    localStorage.setItem('user', JSON.stringify({
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim()
    }));

    showMessage('Profile updated successfully.', 'success');

  } catch (err) {
    console.error(err);
    showMessage('Something went wrong.', 'error');
  }
});

/* ==================== DELETE ACCOUNT ==================== */

deleteBtn.addEventListener('click', () => {
  showMessage(
    'Click DELETE again to permanently remove your account.',
    'error'
  );

  deleteBtn.textContent = 'CONFIRM DELETE';
  deleteBtn.style.background = '#c0392b';

  deleteBtn.onclick = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        showMessage('Failed to delete account.', 'error');
        return;
      }

      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      window.location.href = 'signup.html';

    } catch (err) {
      console.error(err);
      showMessage('Something went wrong.', 'error');
    }
  };
});
loadProfile();
