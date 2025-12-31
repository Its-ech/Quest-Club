const apiStatus = document.getElementById('apiStatus');
const msg = document.getElementById('msg');

const btnLogout = document.getElementById('btnLogout');
const btnLogout2 = document.getElementById('btnLogout2');

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

async function logout() {
  setMsg('');
  try {
    await request('/api/v1/auth/logout', { method: 'POST' });
    setMsg('Logged out. Redirecting...', 'ok');
    window.location.href = '/login.html';
  } catch (e) {
    setMsg(e.message, 'error');
  }
}

btnLogout?.addEventListener('click', logout);
btnLogout2?.addEventListener('click', logout);

(async function init() {
  await checkHealth();
})();
