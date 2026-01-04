const express = require('express');
const router = express.Router();

const { getUserState, resetUserState } = require('../../store/memoryStore'); // استیت per-user + ریست
const requireAuth = require('../../middlewares/requireAuth'); // میدلوری چک لاگین

// تمام روت‌های این فایل فقط برای کاربر لاگین‌شده
router.use(requireAuth); // میدلوری در سطح router [web:14]

// دریافت وضعیت کوئست امروز + وضعیت کاربر
router.get('/quests/today', (req, res) => {
  // گرفتن استیت مخصوص همین کاربر
  const state = getUserState(req.user.id);

  return res.status(200).json({
    ok: true,

    // وضعیت شروع کوئست
    accepted: state.accepted,
    acceptedAt: state.acceptedAt,
    endsAt: state.endsAt,

    // وضعیت تکمیل کوئست
    completed: state.completed,
    completedAt: state.completedAt,

    // تاریخ امروز برای نمایش در UI
    date: new Date().toISOString().slice(0, 10),

    // تعریف کوئست امروز (فعلاً ثابت)
    quest: {
      id: 'q_daily_001',
      title: 'Walk 10 minutes',
      xp: 10
    }
  });
});

// شروع کوئست امروز (accept) و ست کردن تایمر (deadline)
router.post('/quests/today/accept', (req, res) => {
  const state = getUserState(req.user.id);

  // جلوگیری از accept دوباره
  if (state.accepted) {
    return res.status(409).json({ error: 'Quest already accepted' });
  }

  // علامت‌گذاری شروع کوئست
  state.accepted = true;

  // زمان شروع و زمان پایان (15 دقیقه بعد)
  state.acceptedAt = new Date().toISOString();
  state.endsAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  return res.status(200).json({
    accepted: true,
    acceptedAt: state.acceptedAt,
    endsAt: state.endsAt
  });
});

// تکمیل کوئست امروز (قانون A: بعد از endsAt منقضی می‌شود)
router.post('/quests/today/complete', (req, res) => {
  const state = getUserState(req.user.id);

  // باید اول accept شده باشد
  if (!state.accepted) {
    return res.status(409).json({ error: 'Quest must be accepted first' });
  }

  // قانون deadline: بعد از پایان زمان، کوئست expire می‌شود
  if (state.endsAt && Date.now() > Date.parse(state.endsAt)) {
    return res.status(409).json({ error: 'Quest expired' });
  }

  // جلوگیری از complete دوباره
  if (state.completed) {
    return res.status(409).json({ error: 'Quest already completed' });
  }

  // ثبت تکمیل
  state.completed = true;
  state.completedAt = new Date().toISOString();

  // افزایش استریک فقط برای همین کاربر
  state.streakDays += 1;

  return res.status(200).json({
    completed: true,
    completedAt: state.completedAt
  });
});

// ریست کردن وضعیت کوئست/استریک برای همین کاربر (فقط برای توسعه)
router.post('/quests/today/reset', (req, res) => {
  // در production این endpoint نباید فعال باشد
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not Found' });
  }

  // ریست استیت مخصوص همین کاربر
  const state = resetUserState(req.user.id);

  return res.status(200).json({
    ok: true,
    // یک خلاصه کوچک برمی‌گردانیم تا تست راحت باشد
    accepted: state.accepted,
    completed: state.completed,
    streakDays: state.streakDays
  });
});

module.exports = router;
