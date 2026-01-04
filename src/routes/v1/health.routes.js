const router = require('express').Router();

// اندپوینت Health برای چک کردن زنده بودن سرویس
// مثال استفاده: مانیتورینگ / تست سریع با curl
router.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

module.exports = router;
