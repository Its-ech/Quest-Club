const router = require('express').Router();
const authRoutes = require('./auth.routes');
const healthRoutes = require('./health.routes');
const questsRoutes = require('./quests.routes');
const streakRoutes = require('./streak.routes');


router.use(healthRoutes);
router.use(questsRoutes);
router.use(streakRoutes);
router.use(authRoutes);

module.exports = router;
