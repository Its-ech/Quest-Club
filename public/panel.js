const apiStatus = document.getElementById('apiStatus');
const msg = document.getElementById('msg');

const btnLogout = document.getElementById('btnLogout');
const btnLogout2 = document.getElementById('btnLogout2');

// New UI elements
const btnToggleGoalForm = document.getElementById('btnToggleGoalForm');
const goalFormCard = document.getElementById('goalFormCard');
const goalsList = document.getElementById('goalsList');
const goalsCount = document.getElementById('goalsCount');

// Create Goal elements (form)
const goalType = document.getElementById('goalType');
const goalCategory = document.getElementById('goalCategory');
const goalTime = document.getElementById('goalTime');
const goalTitle = document.getElementById('goalTitle');
const goalDesc = document.getElementById('goalDesc');

const goalImage = document.getElementById('goalImage');
const imagePreviewWrap = document.getElementById('imagePreviewWrap');
const imagePreview = document.getElementById('imagePreview');

const enableReminders = document.getElementById('enableReminders');
const reminderMode = document.getElementById('reminderMode');
const reminderFixed = document.getElementById('reminderFixed');
const reminderInterval = document.getElementById('reminderInterval');
const reminderIntervalLabel = document.getElementById('reminderIntervalLabel');

const goalProgress = document.getElementById('goalProgress');
const goalProgressText = document.getElementById('goalProgressText');

const groupTasksWrap = document.getElementById('groupTasksWrap');
const taskTitle = document.getElementById('taskTitle');
const taskTime = document.getElementById('taskTime');
const btnAddTask = document.getElementById('btnAddTask');
const tasksList = document.getElementById('tasksList');

const btnSaveGoal = document.getElementById('btnSaveGoal');
const btnShareGoal = document.getElementById('btnShareGoal');

const LS_GOALS = 'qc_goals_v1';

let reminderTimerId = null;

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

async function requireAuth() {
  try {
    await request('/api/v1/auth/me');
    return true;
  } catch {
    window.location.href = '/login.html';
    return false;
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

function saveGoals(goals) {
  localStorage.setItem(LS_GOALS, JSON.stringify(goals));
}

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

let draftGoal = emptyDraftGoal();

function escapeHtml(str) {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setProgressPercent(pct) {
  const safe = Math.max(0, Math.min(100, Math.round(pct)));
  goalProgress.value = safe;
  goalProgressText.textContent = `${safe}%`;
}

function computeProgress(goal) {
  if (goal.type === 'single') return 0;

  const total = goal.tasks.length;
  if (total === 0) return 0;
  const done = goal.tasks.filter(t => t.done).length;
  return (done / total) * 100;
}

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

function stopReminders() {
  if (reminderTimerId) clearInterval(reminderTimerId);
  reminderTimerId = null;
}

function startReminders(goal) {
  stopReminders();

  if (!goal.reminders?.enabled) return;

  const mode = goal.reminders?.mode || 'fixed';
  if (mode === 'interval') {
    const minutes = Math.max(1, Number(goal.reminders?.intervalMinutes || 60));
    reminderTimerId = setInterval(() => {
      setMsg(`Reminder: keep going on "${goal.title}"`, 'ok');
    }, minutes * 60 * 1000);

    setMsg(`Reminders enabled: every ${minutes} minutes.`, 'ok');
    return;
  }

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

function renderTasks(goal) {
  tasksList.innerHTML = '';

  if (goal.type !== 'group') return;

  if (goal.tasks.length === 0) {
    tasksList.innerHTML = `<p class="hero__note" style="margin: 6px 0 0;">No tasks yet. Add your first task.</p>`;
    return;
  }

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

function renderDraftGoal(goal) {
  goalType.value = goal.type;
  goalCategory.value = goal.category || '';
  goalTime.value = goal.dueAt || '';
  goalTitle.value = goal.title || '';
  goalDesc.value = goal.desc || '';

  enableReminders.checked = !!goal.reminders?.enabled;
  reminderMode.value = goal.reminders?.mode || 'fixed';
  reminderFixed.value = goal.reminders?.fixedTimes || '09:00, 14:00, 20:00';
  reminderInterval.value = goal.reminders?.intervalMinutes ?? 60;

  if (goal.imageDataUrl) {
    imagePreview.src = goal.imageDataUrl;
    imagePreviewWrap.style.display = 'block';
  } else {
    imagePreview.src = '';
    imagePreviewWrap.style.display = 'none';
  }

  const isGroup = goal.type === 'group';
  groupTasksWrap.style.display = isGroup ? 'block' : 'none';

  syncReminderModeUI();
  renderTasks(goal);
  setProgressPercent(computeProgress(goal));

  startReminders(goal);
}

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

function validateGoal(goal) {
  if (!goal.title) return 'Title is required.';
  if (!goal.dueAt) return 'Due time is required.';
  if (goal.type === 'group' && goal.tasks.length === 0) return 'Add at least 1 task for a group.';
  return null;
}

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

btnToggleGoalForm.addEventListener('click', () => {
  toggleGoalForm();
});

goalsList.addEventListener('click', (e) => {
  const goalId = e.target?.getAttribute?.('data-del-goal');
  if (!goalId) return;

  const goals = readGoals().filter(g => g.id !== goalId);
  saveGoals(goals);
  renderGoalsList();
  setMsg('Goal deleted.', 'ok');
});

// Form events
goalType.addEventListener('change', () => {
  draftGoal = readDraftFromUI();
  renderDraftGoal(draftGoal);
});

reminderMode.addEventListener('change', () => {
  syncReminderModeUI();
  draftGoal = readDraftFromUI();
});

enableReminders.addEventListener('change', () => {
  draftGoal = readDraftFromUI();
  renderDraftGoal(draftGoal);
});

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

tasksList.addEventListener('click', (e) => {
  const delId = e.target?.getAttribute?.('data-del-id');
  if (!delId) return;

  draftGoal = readDraftFromUI();
  draftGoal.tasks = (draftGoal.tasks || []).filter(t => t.id !== delId);
  renderDraftGoal(draftGoal);
  setMsg('Task removed.', 'ok');
});

tasksList.addEventListener('change', (e) => {
  const taskId = e.target?.getAttribute?.('data-task-id');
  if (!taskId) return;

  const checked = !!e.target.checked;

  draftGoal = readDraftFromUI();
  draftGoal.tasks = (draftGoal.tasks || []).map(t => (t.id === taskId ? { ...t, done: checked } : t));
  renderDraftGoal(draftGoal);
});

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

  // reset draft and close
  draftGoal = emptyDraftGoal();
  renderDraftGoal(draftGoal);
  closeGoalForm();
});

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

// Init
(async function init() {
  await checkHealth();

  const ok = await requireAuth();
  if (!ok) return;

  renderGoalsList();

  // start collapsed
  closeGoalForm();
  renderDraftGoal(draftGoal);
})();
