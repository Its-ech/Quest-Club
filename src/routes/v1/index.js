const router = require('express').Router();

// روت‌های کوچک و ماژولار نسخه 1
const healthRoutes = require('./health.routes'); // وضعیت سرور (عمومی)
const questsRoutes = require('./quests.routes'); // کوئست‌ها (محافظت‌شده)
const streakRoutes = require('./streak.routes'); // استریک (محافظت‌شده)
const authRoutes = require('./auth.routes'); // ثبت‌نام/لاگین/لاگ‌اوت و /auth/me (عمومی)
const debugRoutes = require('./debug.routes'); // روت‌های دیباگ (فقط dev)

// روت‌ها را به router اصلی متصل می‌کنیم
router.use(healthRoutes);
router.use(authRoutes);
router.use(questsRoutes);
router.use(streakRoutes);
router.use(debugRoutes);

module.exports = router;
