// گرفتن المنت‌های وضعیت API و پیام‌های UI
const apiStatus = document.getElementById('apiStatus');
const msg = document.getElementById('msg');

// گرفتن ورودی‌های فرم لاگین
const email = document.getElementById('email');
const password = document.getElementById('password');
const btnLogin = document.getElementById('btnLogin');

// تابع کمکی برای نمایش پیام به کاربر (با کلاس‌های ok/error)
function setMsg(text, type) {
  msg.textContent = text || '';
  msg.classList.remove('is-error', 'is-ok');
  if (type === 'error') msg.classList.add('is-error');
  if (type === 'ok') msg.classList.add('is-ok');
}

// یک wrapper برای fetch که:
// - cookie را همراه درخواست می‌فرستد (credentials: 'include')
// - اگر پاسخ JSON بود parse می‌کند
// - اگر status غیر 2xx بود، Error با پیام مناسب می‌اندازد
async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include', // برای ارسال/دریافت cookie های احراز هویت
    ...options
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : null;

  // اگر پاسخ ok نبود، پیام خطا را از بک‌اند می‌گیریم
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
  } catch {
    apiStatus.textContent = 'API: offline';
  }
}

// کلیک روی دکمه Login: اطلاعات فرم ارسال می‌شود و در صورت موفقیت به پنل می‌رویم
btnLogin.addEventListener('click', async () => {
  setMsg('');

  // آماده‌سازی payload برای ارسال به API
  const payload = {
    email: (email.value || '').trim(),
    password: password.value || ''
  };

  // اعتبارسنجی ساده سمت کلاینت (برای UX بهتر)
  if (!payload.email || !payload.password) {
    setMsg('Email and password are required.', 'error');
    return;
  }

  // جلوگیری از چند بار کلیک کردن
  btnLogin.disabled = true;
  btnLogin.textContent = 'Logging in...';

  try {
    // ارسال درخواست لاگین (بک‌اند cookie qc_token را ست می‌کند)
    await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // در صورت موفقیت: رفتن به پنل
    setMsg('Login successful. Redirecting...', 'ok');
    window.location.href = '/panel.html';
  } catch (e) {
    // نمایش خطا (مثل Invalid credentials)
    setMsg(e.message, 'error');
  } finally {
    // برگرداندن حالت دکمه به حالت عادی
    btnLogin.disabled = false;
    btnLogin.textContent = 'Login';
  }
});

// init: فقط health را چک می‌کنیم
(async function init() {
  await checkHealth();
})();
