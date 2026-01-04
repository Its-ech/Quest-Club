const router = require('express').Router();

const requireAuth = require('../../middlewares/requireAuth'); // فقط کاربران لاگین‌شده
const { getUserState } = require('../../store/memoryStore'); // استیت per-user

// روت‌های دیباگ (فقط برای محیط توسعه)
router.get('/debug/state', requireAuth, (req, res) => {
  // در production این endpoint نباید فعال باشد
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not Found' });
  }

  // گرفتن استیت مخصوص همین کاربر
  const state = getUserState(req.user.id);

  // برای جلوگیری از خروجی خیلی بزرگ، فقط همان فیلدهای مهم را برمی‌گردانیم
  return res.status(200).json({
    ok: true,
    user: req.user,
    state: {
      accepted: state.accepted,
      acceptedAt: state.acceptedAt,
      endsAt: state.endsAt,
      completed: state.completed,
      completedAt: state.completedAt,
      streakDays: state.streakDays,
      nextRewardAt: state.nextRewardAt
    }
  });
});

module.exports = router;
