// مدیریت استیت موقت (in-memory) به ازای هر کاربر با Map
// نکته: با ریستارت سرور همه چیز پاک می‌شود (برای MVP کاملاً OK)

function createInitialState() {
  return {
    // وضعیت شروع کوئست
    accepted: false,
    acceptedAt: null,
    endsAt: null,

    // وضعیت تکمیل کوئست
    completed: false,
    completedAt: null,

    // وضعیت استریک
    streakDays: 0,

    // جایزه بعدی (مثلاً بعد از 10 روز)
    nextRewardAt: 10
  };
}

// Map<userId, state>
const usersState = new Map();

// گرفتن استیت کاربر؛ اگر وجود نداشت ساخته می‌شود
function getUserState(userId) {
  if (!userId) throw new Error('userId is required');

  if (!usersState.has(userId)) {
    usersState.set(userId, createInitialState());
  }

  return usersState.get(userId);
}

// (اختیاری) برای دیباگ یا ریست دستی
function resetUserState(userId) {
  usersState.set(userId, createInitialState());
  return usersState.get(userId);
}

module.exports = { getUserState, resetUserState };
