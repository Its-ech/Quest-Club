const btnLoad = document.getElementById('btnLoad');
const btnAccept = document.getElementById('btnAccept');
const btnComplete = document.getElementById('btnComplete');

const output = document.getElementById('output');
const msg = document.getElementById('msg');

async function request(url, options = {}) {
  const res = await fetch(url, options);

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const errorMessage = data?.error || `HTTP ${res.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

async function loadToday() {
  msg.textContent = '';
  output.textContent = 'Loading...';

  try {
    const data = await request('/api/v1/quests/today');
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    msg.textContent = err.message;
    output.textContent = '';
  }
}

btnLoad.addEventListener('click', async () => {
  await loadToday();
});

btnAccept.addEventListener('click', async () => {
  msg.textContent = '';

  try {
    await request('/api/v1/quests/today/accept', { method: 'POST' });
    await loadToday();
  } catch (err) {
    msg.textContent = err.message;
  }
});

btnComplete.addEventListener('click', async () => {
  msg.textContent = '';

  try {
    await request('/api/v1/quests/today/complete', { method: 'POST' });
    await loadToday();
  } catch (err) {
    msg.textContent = err.message;
  }
});
