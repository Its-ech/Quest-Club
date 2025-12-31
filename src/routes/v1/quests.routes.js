const express = require('express');
const router = express.Router();
const state = require('../../store/memoryStore');

router.get('/quests/today', (req, res) => {
  return res.status(200).json({
    ok: true,

    accepted: state.accepted,
    acceptedAt: state.acceptedAt,
    endsAt: state.endsAt,

    completed: state.completed,
    completedAt: state.completedAt,

    date: new Date().toISOString().slice(0, 10),
    quest: {
      id: 'q_daily_001',
      title: 'Walk 10 minutes',
      xp: 10
    }
  });
});

router.post('/quests/today/accept', (req, res) => {
  if (state.accepted) {
    return res.status(409).json({ error: 'Quest already accepted' });
  }

  state.accepted = true;

  // Start timer on accept
  state.acceptedAt = new Date().toISOString();
  state.endsAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  return res.status(200).json({
    accepted: true,
    acceptedAt: state.acceptedAt,
    endsAt: state.endsAt
  });
});

router.post('/quests/today/complete', (req, res) => {
  if (!state.accepted) {
    return res.status(409).json({ error: 'Quest must be accepted first' });
  }

  if (state.completed) {
    return res.status(409).json({ error: 'Quest already completed' });
  }

  state.completed = true;
  state.completedAt = new Date().toISOString();

  state.streakDays += 1;

  return res.status(200).json({
    completed: true,
    completedAt: state.completedAt
  });
});

module.exports = router;
