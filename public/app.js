// گرفتن المنت‌های وضعیت API و پیام‌های UI
const apiStatus = document.getElementById('apiStatus');
const msg = document.getElementById('msg');

// گرفتن المنت‌های مربوط به نمایش اطلاعات کوئست امروز
const questDate = document.getElementById('questDate');
const questXp = document.getElementById('questXp');
const questStatus = document.getElementById('questStatus');
const questDesc = document.getElementById('questDesc');

// دکمه‌های اصلی صفحه (قبول کردن کوئست / رفرش کردن)
const btnAccept = document.getElementById('btnAccept');
const btnRefresh = document.getElementById('btnRefresh');

// تابع کمکی برای نمایش پیام به کاربر (با کلاس‌های ok/error)
function setMsg(text, type) {
  msg.textContent = text || '';
  msg.classList.remove('is-error', 'is-ok');
  if (type === 'error') msg.classList.add('is-error');
  if (type === 'ok') msg.classList.add('is-ok');
}

// یک wrapper برای fetch که:
// - JSON را (اگر موجود بود) parse می‌کند
// - اگر status غیر 2xx بود، یک Error با پیام مناسب می‌اندازد
async function request(url, options = {}) {
  // نکته: چون APIهای quests/streak الان محافظت‌شده‌اند و از cookie استفاده می‌کنند،
  // اگر صفحه را cross-origin باز کنی باید credentials: 'include' اضافه شود.
  // (در حالت فعلی که همه چیز از یک origin است، معمولاً مشکلی پیش نمی‌آید.)
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

// چک کردن health برای اینکه بفهمیم API بالا هست یا نه
async function checkHealth() {
  try {
    await request('/api/v1/health');
    apiStatus.textContent = 'API: online';
  } catch (e) {
    apiStatus.textContent = 'API: offline';
  }
}

// رندر کردن اطلاعات کوئست امروز روی UI
function renderToday(data) {
  // بک‌اند فعلی ما این‌ها رو داره: date, quest {title, xp}, accepted
  questDate.textContent = data?.date || '—';
  questXp.textContent = data?.quest?.xp != null ? `+${data.quest.xp}` : '—';

  // accepted یعنی کاربر کوئست امروز را شروع کرده یا نه
  const accepted = !!data?.accepted;
  questStatus.textContent = accepted ? 'Accepted' : 'Not accepted';

  // چون بک‌اند ما فعلاً desc نداره، title رو به عنوان متن اصلی نشون می‌دیم
  const title = data?.quest?.title || 'No quest';
  questDesc.textContent = title;

  // اگر accepted شده باشد، دکمه accept غیرفعال می‌شود
  btnAccept.disabled = accepted;
  btnAccept.textContent = accepted ? 'Accepted' : 'Accept quest';
}

// گرفتن اطلاعات کوئست امروز از API و رندر کردن آن
async function loadToday() {
  setMsg('');
  questDesc.textContent = 'Loading...';

  try {
    const data = await request('/api/v1/quests/today');
    renderToday(data);
  } catch (e) {
    // اگر کاربر لاگین نباشد (401) یا هر خطای دیگر، پیام نمایش داده می‌شود
    setMsg(e.message, 'error');
    questDesc.textContent = 'Could not load quest.';
  }
}

// کلیک روی دکمه Accept: درخواست accept به API زده می‌شود
btnAccept.addEventListener('click', async () => {
  setMsg('');

  try {
    await request('/api/v1/quests/today/accept', { method: 'POST' });
    setMsg('Quest accepted!', 'ok');
    await loadToday(); // بعد از accept، UI را دوباره با داده جدید آپدیت می‌کنیم
  } catch (e) {
    setMsg(e.message, 'error');
  }
});

// کلیک روی دکمه Refresh: فقط داده‌ها دوباره لود می‌شوند
btnRefresh.addEventListener('click', async () => {
  await loadToday();
});

// نقطه شروع صفحه: اول health، بعد loadToday
(async function init() {
  await checkHealth();
  await loadToday();
})();
