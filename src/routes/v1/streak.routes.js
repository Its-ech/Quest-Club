const router = require('express').Router();

const { getUserState } = require('../../store/memoryStore'); // استیت per-user
const requireAuth = require('../../middlewares/requireAuth'); // میدلوری چک لاگین

// تمام روت‌های این فایل فقط برای کاربر لاگین‌شده
router.use(requireAuth); // میدلوری در سطح router [web:14]

// دریافت وضعیت استریک و درصد پیشرفت تا جایزه بعدی
router.get('/streak', (req, res) => {
  // گرفتن استیت مخصوص همین کاربر
  const state = getUserState(req.user.id);

  // محاسبه درصد پیشرفت تا جایزه بعدی
  const progressPercent = Math.min(
    100,
    Math.floor((state.streakDays / state.nextRewardAt) * 100)
  );

  return res.status(200).json({
    streakDays: state.streakDays,
    nextRewardAt: state.nextRewardAt,
    progressPercent
  });
});

module.exports = router;
