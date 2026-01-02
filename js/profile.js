const token = localStorage.getItem('authToken');
if (!token) window.location.href = 'login.html';

const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');

const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');
const messageBox = document.getElementById('formMessage');

const showMessage = (msg, type) => {
  messageBox.textContent = msg;
  messageBox.className = `form-message ${type}`;
  messageBox.style.display = 'block';
};

async function loadProfile() {
  const res = await fetch(`${API_BASE}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
    return;
  }

  const user = await res.json();
  nameInput.value = user.name || '';
  emailInput.value = user.email || '';
  phoneInput.value = user.phone || '';
}

editBtn.addEventListener('click', () => {
  nameInput.disabled = false;
  phoneInput.disabled = false;

  document.querySelector('.locked-text').style.display = 'block';

  editBtn.style.display = 'none';
  saveBtn.style.display = 'inline-block';

  showMessage('You can now edit your profile details.', 'success');
});

saveBtn.addEventListener('click', async () => {
  const updatedData = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim()
  };

  const res = await fetch(`${API_BASE}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updatedData)
  });

  if (!res.ok) {
    showMessage('Failed to update profile', 'error');
    return;
  }

  nameInput.disabled = true;
  phoneInput.disabled = true;

  document.querySelector('.locked-text').style.display = 'none';

  saveBtn.style.display = 'none';
  editBtn.style.display = 'inline-block';

  showMessage('Profile updated successfully.', 'success');
});

deleteBtn.addEventListener('click', async () => {
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
        showMessage('Failed to delete account. Try again.', 'error');
        return;
      }

      localStorage.removeItem('authToken');
      window.location.href = 'signup.html';

    } catch (err) {
      console.error(err);
      showMessage('Something went wrong.', 'error');
    }
  };
});

loadProfile();
