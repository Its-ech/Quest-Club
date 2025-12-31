const apiStatus = document.getElementById('apiStatus');
const msg = document.getElementById('msg');

const email = document.getElementById('email');
const password = document.getElementById('password');
const btnRegister = document.getElementById('btnRegister');

function setMsg(text, type) {
  msg.textContent = text || '';
  msg.classList.remove('is-error', 'is-ok');
  if (type === 'error') msg.classList.add('is-error');
  if (type === 'ok') msg.classList.add('is-ok');
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    ...options
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const errorMessage = data?.error || `HTTP ${res.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

async function checkHealth() {
  try {
    await request('/api/v1/health');
    apiStatus.textContent = 'API: online';
  } catch {
    apiStatus.textContent = 'API: offline';
  }
}

btnRegister.addEventListener('click', async () => {
  setMsg('');

  const payload = {
    email: (email.value || '').trim(),
    password: password.value || ''
  };

  if (!payload.email || !payload.password) {
    setMsg('Email and password are required.', 'error');
    return;
  }
  if (payload.password.length < 6) {
    setMsg('Password must be at least 6 characters.', 'error');
    return;
  }

  btnRegister.disabled = true;
  btnRegister.textContent = 'Creating...';

  try {
    await request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setMsg('Account created. Redirecting to login...', 'ok');
    window.location.href = '/login.html';
  } catch (e) {
    setMsg(e.message, 'error');
  } finally {
    btnRegister.disabled = false;
    btnRegister.textContent = 'Create account';
  }
});

(async function init() {
  await checkHealth();
})();
