const router = require('express').Router();
const state = require('../../store/memoryStore');

router.get('/streak', (req, res) => {
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
