const router = require('express').Router();

const healthRoutes = require('./health.routes');
const questsRoutes = require('./quests.routes');
const streakRoutes = require('./streak.routes');
const authRoutes = require('./auth.routes');

router.use(healthRoutes);
router.use(authRoutes);
router.use(questsRoutes);
router.use(streakRoutes);

module.exports = router;
