const express = require('express');
const router = express.Router();
let accepted = false;

router.get('/quests/today', (req, res) => {
return res.status(200).json({
  ok: true,
  accepted,
  date: new Date().toISOString().slice(0, 10),
  quest: {
    id: 'q_daily_001',
    title: 'Walk 10 minutes',
    xp: 10
  }
});
});

router.post('/quests/today/accept', (req, res) => {
  if (accepted) {
    return res.status(409).json({ error: 'Quest already accepted' });
  }

  accepted = true;
  return res.status(200).json({ accepted: true });
});


module.exports = router;

