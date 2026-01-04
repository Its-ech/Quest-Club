// گرفتن المنت‌های وضعیت API و پیام‌های UI
const apiStatus = document.getElementById('apiStatus');
const msg = document.getElementById('msg');

// گرفتن ورودی‌های فرم ثبت‌نام
const email = document.getElementById('email');
const password = document.getElementById('password');
const btnRegister = document.getElementById('btnRegister');

// تابع کمکی برای نمایش پیام (ok/error) در UI
function setMsg(text, type) {
  msg.textContent = text || '';
  msg.classList.remove('is-error', 'is-ok');
  if (type === 'error') msg.classList.add('is-error');
  if (type === 'ok') msg.classList.add('is-ok');
}

// wrapper برای fetch که:
// - cookieها را هم مدیریت می‌کند (credentials: 'include')
// - اگر پاسخ JSON بود parse می‌کند
// - اگر status غیر 2xx بود، خطا با پیام مناسب می‌دهد
async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include', // برای ارسال/دریافت cookie های auth در درخواست‌ها [web:22]
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

// چک کردن health برای نمایش آنلاین/آفلاین بودن API
async function checkHealth() {
  try {
    await request('/api/v1/health');
    apiStatus.textContent = 'API: online';
  } catch {
    apiStatus.textContent = 'API: offline';
  }
}

// کلیک روی دکمه Register: ارسال درخواست ساخت اکانت به API
btnRegister.addEventListener('click', async () => {
  setMsg('');

  // آماده‌سازی payload ثبت‌نام
  const payload = {
    email: (email.value || '').trim(),
    password: password.value || ''
  };

  // اعتبارسنجی ساده سمت کلاینت (برای UX بهتر)
  if (!payload.email || !payload.password) {
    setMsg('Email and password are required.', 'error');
    return;
  }
  if (payload.password.length < 6) {
    setMsg('Password must be at least 6 characters.', 'error');
    return;
  }

  // جلوگیری از چند بار کلیک کردن
  btnRegister.disabled = true;
  btnRegister.textContent = 'Creating...';

  try {
    // ارسال درخواست ثبت‌نام
    await request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // بعد از ساخت اکانت، کاربر را به صفحه لاگین منتقل می‌کنیم
    setMsg('Account created. Redirecting to login...', 'ok');
    window.location.href = '/login.html';
  } catch (e) {
    // نمایش خطا (مثل Email already registered)
    setMsg(e.message, 'error');
  } finally {
    // برگرداندن حالت دکمه به حالت عادی
    btnRegister.disabled = false;
    btnRegister.textContent = 'Create account';
  }
});

// init: فقط health را چک می‌کنیم
(async function init() {
  await checkHealth();
})();
