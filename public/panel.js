// ================================
// Panel (Goals) - عناصر اصلی صفحه
// ================================

// گرفتن المنت‌های وضعیت API و پیام‌های UI
const apiStatus = document.getElementById('apiStatus');
const msg = document.getElementById('msg');

// دکمه‌های لاگ‌اوت (در هدر و در بخش CTA)
const btnLogout = document.getElementById('btnLogout');
const btnLogout2 = document.getElementById('btnLogout2');

// ================================
// UI جدید پنل: دکمه‌ها و لیست Goals
// ================================

// دکمه باز/بسته کردن فرم ساخت Goal
const btnToggleGoalForm = document.getElementById('btnToggleGoalForm');

// کارت فرم ساخت Goal (collapsible)
const goalFormCard = document.getElementById('goalFormCard');

// لیست اهداف ذخیره‌شده و شمارنده
const goalsList = document.getElementById('goalsList');
const goalsCount = document.getElementById('goalsCount');

// ================================
// عناصر فرم ساخت Goal
// ================================

// فیلدهای اصلی Goal
const goalType = document.getElementById('goalType');
const goalCategory = document.getElementById('goalCategory');
const goalTime = document.getElementById('goalTime');
const goalTitle = document.getElementById('goalTitle');
const goalDesc = document.getElementById('goalDesc');

// آپلود تصویر + پیش‌نمایش (فقط روی فرانت و داخل localStorage)
const goalImage = document.getElementById('goalImage');
const imagePreviewWrap = document.getElementById('imagePreviewWrap');
const imagePreview = document.getElementById('imagePreview');

// تنظیمات یادآور (Reminders)
const enableReminders = document.getElementById('enableReminders');
const reminderMode = document.getElementById('reminderMode');
const reminderFixed = document.getElementById('reminderFixed');
const reminderInterval = document.getElementById('reminderInterval');
const reminderIntervalLabel = document.getElementById('reminderIntervalLabel');

// نمایش پیشرفت (برای گروهی با توجه به تعداد task های done)
const goalProgress = document.getElementById('goalProgress');
const goalProgressText = document.getElementById('goalProgressText');

// بخش تسک‌های گروهی
const groupTasksWrap = document.getElementById('groupTasksWrap');
const taskTitle = document.getElementById('taskTitle');
const taskTime = document.getElementById('taskTime');
const btnAddTask = document.getElementById('btnAddTask');
const tasksList = document.getElementById('tasksList');

// دکمه‌های فرم
const btnSaveGoal = document.getElementById('btnSaveGoal');
const btnShareGoal = document.getElementById('btnShareGoal');

// ================================
// تنظیمات ذخیره‌سازی لوکال
// ================================

// کلید ذخیره Goals در localStorage (موقت تا زمان اتصال به بک‌اند)
const LS_GOALS = 'qc_goals_v1';

// تایمر یادآور فعال (برای اینکه چند تایمر همزمان نسازیم)
let reminderTimerId = null;

// ================================
// پیام‌های UI
// ================================

// نمایش پیام به کاربر (ok/error)
function setMsg(text, type) {
  msg.textContent = text || '';
  msg.classList.remove('is-error', 'is-ok');
  if (type === 'error') msg.classList.add('is-error');
  if (type === 'ok') msg.classList.add('is-ok');
}

// ================================
// درخواست به API (fetch wrapper)
// ================================

// wrapper برای fetch که:
// - cookie را همراه درخواست می‌فرستد (credentials: 'include')
// - پاسخ JSON را parse می‌کند
// - اگر status غیر 2xx بود خطا می‌اندازد
async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include', // برای ارسال cookie های احراز هویت
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

// ================================
// وضعیت API و احراز هویت
// ================================

// چک کردن health برای نمایش آنلاین/آفلاین بودن API
async function checkHealth() {
  try {
    await request('/api/v1/health');
    apiStatus.textContent = 'API: online';
  } catch {
    apiStatus.textContent = 'API: offline';
  }
}

// اطمینان از اینکه کاربر لاگین است، در غیر اینصورت redirect به login
async function requireAuth() {
  try {
    await request('/api/v1/auth/me');
    return true;
  } catch {
    window.location.href = '/login.html';
    return false;
  }
}

// خروج از حساب کاربری و انتقال به صفحه login
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

// اتصال رویداد کلیک لاگ‌اوت به هر دو دکمه (اگر وجود داشته باشند)
btnLogout?.addEventListener('click', logout);
btnLogout2?.addEventListener('click', logout);

// ================================
// کار با localStorage (Goals)
// ================================

// خواندن لیست Goals از localStorage
function readGoals() {
  try {
    const raw = localStorage.getItem(LS_GOALS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ذخیره لیست Goals در localStorage
function saveGoals(goals) {
  localStorage.setItem(LS_GOALS, JSON.stringify(goals));
}

// ساخت یک Goal خالی (draft) برای فرم
function emptyDraftGoal() {
  return {
    id: `g_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    type: 'single', // single | group
    category: '',
    dueAt: '',
    title: '',
    desc: '',
    imageDataUrl: '',
    reminders: {
      enabled: false,
      mode: 'fixed',
      fixedTimes: '09:00, 14:00, 20:00',
      intervalMinutes: 60
    },
    tasks: [],
    createdAt: new Date().toISOString()
  };
}

// draft فعلی فرم (قبل از ذخیره شدن در localStorage)
let draftGoal = emptyDraftGoal();

// ================================
// ابزارهای کمکی (HTML escape و Progress)
// ================================

// جلوگیری از XSS در رندر کردن متن‌ها داخل innerHTML
function escapeHtml(str) {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// ست کردن درصد progress در UI
function setProgressPercent(pct) {
  const safe = Math.max(0, Math.min(100, Math.round(pct)));
  goalProgress.value = safe;
  goalProgressText.textContent = `${safe}%`;
}

// محاسبه progress:
// - single: فعلاً 0
// - group: تعداد done / تعداد کل
function computeProgress(goal) {
  if (goal.type === 'single') return 0;

  const total = goal.tasks.length;
  if (total === 0) return 0;
  const done = goal.tasks.filter(t => t.done).length;
  return (done / total) * 100;
}

// ================================
// UI حالت Reminder (fixed/interval)
// ================================

// نمایش/مخفی کردن inputهای مربوط به reminder mode
function syncReminderModeUI() {
  const mode = reminderMode.value;
  if (mode === 'interval') {
    reminderFixed.style.display = 'none';
    reminderInterval.style.display = 'inline-block';
    reminderIntervalLabel.style.display = 'inline';
  } else {
    reminderFixed.style.display = 'inline-block';
    reminderInterval.style.display = 'none';
    reminderIntervalLabel.style.display = 'none';
  }
}

// توقف تایمر یادآور قبلی (برای جلوگیری از چند تایمر)
function stopReminders() {
  if (reminderTimerId) clearInterval(reminderTimerId);
  reminderTimerId = null;
}

// شروع یادآور برای draft فعلی (صرفاً در همین صفحه)
function startReminders(goal) {
  stopReminders();

  // اگر reminders خاموش باشد، کاری نمی‌کنیم
  if (!goal.reminders?.enabled) return;

  const mode = goal.reminders?.mode || 'fixed';

  // حالت interval: هر X دقیقه پیام بده
  if (mode === 'interval') {
    const minutes = Math.max(1, Number(goal.reminders?.intervalMinutes || 60));
    reminderTimerId = setInterval(() => {
      setMsg(`Reminder: keep going on "${goal.title}"`, 'ok');
    }, minutes * 60 * 1000);

    setMsg(`Reminders enabled: every ${minutes} minutes.`, 'ok');
    return;
  }

  // حالت fixed: در زمان‌های مشخص پیام بده (مثلاً 09:00)
  const times = (goal.reminders?.fixedTimes || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  reminderTimerId = setInterval(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const hm = `${hh}:${mm}`;

    if (times.includes(hm)) {
      setMsg(`Reminder (${hm}): "${goal.title}"`, 'ok');
    }
  }, 60 * 1000);

  setMsg(`Reminders enabled: ${times.length ? times.join(', ') : 'No times set'}.`, 'ok');
}

// ================================
// رندر کردن Task های گروهی
// ================================

// نمایش لیست task ها داخل فرم (برای goal type = group)
function renderTasks(goal) {
  tasksList.innerHTML = '';

  // اگر گروهی نیست، چیزی نشان نمی‌دهیم
  if (goal.type !== 'group') return;

  // اگر task نداریم پیام ساده نمایش بده
  if (goal.tasks.length === 0) {
    tasksList.innerHTML = `<p class="hero__note" style="margin: 6px 0 0;">No tasks yet. Add your first task.</p>`;
    return;
  }

  // ساخت ردیف برای هر task
  goal.tasks.forEach((t) => {
    const row = document.createElement('div');
    row.className = 'metaItem';
    row.style.marginTop = '10px';

    row.innerHTML = `
      <span class="metaItem__icon" aria-hidden="true">✅</span>
      <div style="width:100%;">
        <div class="metaItem__label">${escapeHtml(t.dueAt ? new Date(t.dueAt).toLocaleString() : 'No time')}</div>
        <div class="metaItem__value" style="display:flex; gap:10px; align-items:center; justify-content:space-between;">
          <label style="display:flex; gap:10px; align-items:center; flex:1;">
            <input type="checkbox" ${t.done ? 'checked' : ''} data-task-id="${t.id}" />
            <span style="font-weight:800;">${escapeHtml(t.title || 'Untitled task')}</span>
          </label>
          <button class="btn btn--ghost" type="button" data-del-id="${t.id}">Remove</button>
        </div>
      </div>
    `;

    tasksList.appendChild(row);
  });
}

// ================================
// رندر و خواندن draft فرم
// ================================

// پر کردن فرم از روی draftGoal
function renderDraftGoal(goal) {
  goalType.value = goal.type;
  goalCategory.value = goal.category || '';
  goalTime.value = goal.dueAt || '';
  goalTitle.value = goal.title || '';
  goalDesc.value = goal.desc || '';

  // reminders
  enableReminders.checked = !!goal.reminders?.enabled;
  reminderMode.value = goal.reminders?.mode || 'fixed';
  reminderFixed.value = goal.reminders?.fixedTimes || '09:00, 14:00, 20:00';
  reminderInterval.value = goal.reminders?.intervalMinutes ?? 60;

  // تصویر
  if (goal.imageDataUrl) {
    imagePreview.src = goal.imageDataUrl;
    imagePreviewWrap.style.display = 'block';
  } else {
    imagePreview.src = '';
    imagePreviewWrap.style.display = 'none';
  }

  // نمایش task های گروهی فقط اگر type=group باشد
  const isGroup = goal.type === 'group';
  groupTasksWrap.style.display = isGroup ? 'block' : 'none';

  syncReminderModeUI();
  renderTasks(goal);
  setProgressPercent(computeProgress(goal));

  // یادآور را بر اساس draft فعلی تنظیم می‌کنیم
  startReminders(goal);
}

// خواندن مقدارهای فرم و ساخت یک object جدید برای draft
function readDraftFromUI() {
  const g = { ...draftGoal };

  g.type = goalType.value === 'group' ? 'group' : 'single';
  g.category = (goalCategory.value || '').trim();
  g.dueAt = goalTime.value || '';
  g.title = (goalTitle.value || '').trim();
  g.desc = (goalDesc.value || '').trim();

  g.reminders = {
    enabled: !!enableReminders.checked,
    mode: reminderMode.value === 'interval' ? 'interval' : 'fixed',
    fixedTimes: (reminderFixed.value || '').trim(),
    intervalMinutes: Number(reminderInterval.value || 60)
  };

  if (!Array.isArray(g.tasks)) g.tasks = [];
  return g;
}

// اعتبارسنجی ساده قبل از ذخیره
function validateGoal(goal) {
  if (!goal.title) return 'Title is required.';
  if (!goal.dueAt) return 'Due time is required.';
  if (goal.type === 'group' && goal.tasks.length === 0) return 'Add at least 1 task for a group.';
  return null;
}

// ================================
// رندر لیست Goals (سمت راست پنل)
// ================================

function renderGoalsList() {
  const goals = readGoals();
  goalsCount.textContent = String(goals.length);

  goalsList.innerHTML = '';
  if (goals.length === 0) {
    goalsList.innerHTML = `<p class="hero__note" style="margin: 6px 0 0;">No goals yet. Click "Add Goal".</p>`;
    return;
  }

  goals.forEach((g) => {
    const el = document.createElement('div');
    el.className = 'qcGoalCard';

    const dueLabel = g.dueAt ? new Date(g.dueAt).toLocaleString() : '—';
    const cat = g.category ? escapeHtml(g.category) : 'Uncategorized';
    const type = g.type === 'group' ? 'Group' : 'Single';

    el.innerHTML = `
      <div class="qcGoalCard__top">
        <h3 class="qcGoalCard__title">${escapeHtml(g.title)}</h3>
        <span class="badge badge--medium">${type}</span>
      </div>
      <div class="qcGoalCard__meta">
        <div><span class="qcMini">Category:</span> ${cat}</div>
        <div><span class="qcMini">Due:</span> ${escapeHtml(dueLabel)}</div>
        <div><span class="qcMini">Tasks:</span> ${g.type === 'group' ? (g.tasks?.length || 0) : 1}</div>
      </div>
      <div class="qcGoalCard__actions">
        <button class="btn btn--ghost" type="button" data-del-goal="${g.id}">Delete</button>
      </div>
    `;

    goalsList.appendChild(el);
  });
}

// ================================
// باز/بسته کردن فرم (collapsible)
// ================================

function openGoalForm() {
  goalFormCard.classList.add('is-open');
  btnToggleGoalForm.textContent = 'Close Form';
}

function closeGoalForm() {
  goalFormCard.classList.remove('is-open');
  btnToggleGoalForm.textContent = 'Add Goal';
}

function toggleGoalForm() {
  if (goalFormCard.classList.contains('is-open')) closeGoalForm();
  else openGoalForm();
}

// کلیک روی دکمه Add Goal / Close Form
btnToggleGoalForm.addEventListener('click', () => {
  toggleGoalForm();
});

// حذف یک goal از لیست (از طریق data-del-goal)
goalsList.addEventListener('click', (e) => {
  const goalId = e.target?.getAttribute?.('data-del-goal');
  if (!goalId) return;

  const goals = readGoals().filter(g => g.id !== goalId);
  saveGoals(goals);
  renderGoalsList();
  setMsg('Goal deleted.', 'ok');
});

// ================================
// رویدادهای فرم (Form events)
// ================================

// تغییر نوع goal (single/group)
goalType.addEventListener('change', () => {
  draftGoal = readDraftFromUI();
  renderDraftGoal(draftGoal);
});

// تغییر حالت reminder (fixed/interval)
reminderMode.addEventListener('change', () => {
  syncReminderModeUI();
  draftGoal = readDraftFromUI();
});

// روشن/خاموش کردن reminders
enableReminders.addEventListener('change', () => {
  draftGoal = readDraftFromUI();
  renderDraftGoal(draftGoal);
});

// اضافه کردن task به goal گروهی
btnAddTask.addEventListener('click', () => {
  setMsg('');

  const title = (taskTitle.value || '').trim();
  const dueAt = taskTime.value || '';

  if (!title) return setMsg('Task title is required.', 'error');
  if (!dueAt) return setMsg('Task time is required.', 'error');

  draftGoal = readDraftFromUI();
  if (draftGoal.type !== 'group') return setMsg('Switch type to "Task group" first.', 'error');

  draftGoal.tasks.push({
    id: `t_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title,
    dueAt,
    done: false
  });

  taskTitle.value = '';
  taskTime.value = '';

  renderDraftGoal(draftGoal);
  setMsg('Task added.', 'ok');
});

// حذف task از لیست task ها
tasksList.addEventListener('click', (e) => {
  const delId = e.target?.getAttribute?.('data-del-id');
  if (!delId) return;

  draftGoal = readDraftFromUI();
  draftGoal.tasks = (draftGoal.tasks || []).filter(t => t.id !== delId);
  renderDraftGoal(draftGoal);
  setMsg('Task removed.', 'ok');
});

// تغییر وضعیت done یک task
tasksList.addEventListener('change', (e) => {
  const taskId = e.target?.getAttribute?.('data-task-id');
  if (!taskId) return;

  const checked = !!e.target.checked;

  draftGoal = readDraftFromUI();
  draftGoal.tasks = (draftGoal.tasks || []).map(t => (t.id === taskId ? { ...t, done: checked } : t));
  renderDraftGoal(draftGoal);
});

// انتخاب تصویر و ساخت dataURL برای preview
goalImage.addEventListener('change', () => {
  const file = goalImage.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    draftGoal = readDraftFromUI();
    draftGoal.imageDataUrl = String(reader.result || '');
    renderDraftGoal(draftGoal);
    setMsg('Image selected (preview only).', 'ok');
  };
  reader.readAsDataURL(file);
});

// ذخیره goal در localStorage و آپدیت لیست
btnSaveGoal.addEventListener('click', () => {
  setMsg('');

  draftGoal = readDraftFromUI();
  const err = validateGoal(draftGoal);
  if (err) return setMsg(err, 'error');

  const goals = readGoals();
  goals.unshift(draftGoal);
  saveGoals(goals);

  renderGoalsList();
  setMsg('Goal saved.', 'ok');

  // ریست کردن draft و بستن فرم
  draftGoal = emptyDraftGoal();
  renderDraftGoal(draftGoal);
  closeGoalForm();
});

// کپی کردن JSON هدف برای share (فعلاً ساده: clipboard)
btnShareGoal.addEventListener('click', async () => {
  setMsg('');
  try {
    const goal = readDraftFromUI();
    const payload = JSON.stringify(goal, null, 2);
    await navigator.clipboard.writeText(payload);
    setMsg('Copied goal JSON to clipboard.', 'ok');
  } catch {
    setMsg('Could not copy. Clipboard permission blocked.', 'error');
  }
});

// ================================
// init: چک API، چک لاگین، رندر اولیه
// ================================

(async function init() {
  // نمایش وضعیت API
  await checkHealth();

  // اگر لاگین نبود -> redirect
  const ok = await requireAuth();
  if (!ok) return;

  // رندر goals از localStorage
  renderGoalsList();

  // فرم ابتدا بسته باشد + draft اولیه رندر شود
  closeGoalForm();
  renderDraftGoal(draftGoal);
})();
