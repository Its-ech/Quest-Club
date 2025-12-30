const apiStatus = document.getElementById('apiStatus');
const msg = document.getElementById('msg');

const questDate = document.getElementById('questDate');
const questXp = document.getElementById('questXp');
const questStatus = document.getElementById('questStatus');
const questDesc = document.getElementById('questDesc');

const btnAccept = document.getElementById('btnAccept');
const btnRefresh = document.getElementById('btnRefresh');

function setMsg(text, type) {
  msg.textContent = text || '';
  msg.classList.remove('is-error', 'is-ok');
  if (type === 'error') msg.classList.add('is-error');
  if (type === 'ok') msg.classList.add('is-ok');
}

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

async function checkHealth() {
  try {
    await request('/api/v1/health');
    apiStatus.textContent = 'API: online';
  } catch (e) {
    apiStatus.textContent = 'API: offline';
  }
}

function renderToday(data) {
  // بک‌اند فعلی ما این‌ها رو داره: date, quest {title, xp}, accepted
  questDate.textContent = data?.date || '—';
  questXp.textContent = data?.quest?.xp != null ? `+${data.quest.xp}` : '—';

  const accepted = !!data?.accepted;
  questStatus.textContent = accepted ? 'Accepted' : 'Not accepted';

  // چون بک‌اند ما فعلاً desc نداره، title رو به عنوان متن اصلی نشون می‌دیم
  const title = data?.quest?.title || 'No quest';
  questDesc.textContent = title;

  btnAccept.disabled = accepted;
  btnAccept.textContent = accepted ? 'Accepted' : 'Accept quest';
}

async function loadToday() {
  setMsg('');
  questDesc.textContent = 'Loading...';

  try {
    const data = await request('/api/v1/quests/today');
    renderToday(data);
  } catch (e) {
    setMsg(e.message, 'error');
    questDesc.textContent = 'Could not load quest.';
  }
}

btnAccept.addEventListener('click', async () => {
  setMsg('');

  try {
    await request('/api/v1/quests/today/accept', { method: 'POST' });
    setMsg('Quest accepted!', 'ok');
    await loadToday();
  } catch (e) {
    setMsg(e.message, 'error');
  }
});

btnRefresh.addEventListener('click', async () => {
  await loadToday();
});

(async function init() {
  await checkHealth();
  await loadToday();
})();
