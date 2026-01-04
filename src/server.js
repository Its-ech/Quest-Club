// لود کردن متغیرهای محیطی از فایل .env (مثل PORT, JWT_SECRET و ...)
require('dotenv').config();

 // [web:113][web:119]
const app = require('./app'); // اپلیکیشن اصلی Express (config، روت‌ها، middlewareها)

const PORT = process.env.PORT || 3000; // پورت از env یا 3000 به صورت پیش‌فرض [web:110][web:115]

// اندپوینت ساده‌ی health روی خود app (برای سازگاری /api/v1/health در تست‌ها)
// توجه: هم‌زمان یک /health داخل روت‌ها هم داریم.
app.get('/api/v1/health', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

// استارت سرور HTTP و گوش دادن روی PORT مشخص‌شده
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
