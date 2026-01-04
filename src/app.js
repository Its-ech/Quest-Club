const express = require('express');
const V1Routes = require('./routes/v1'); // روت‌های نسخه 1 API
const { notFound, errorHandler } = require('./middlewares/errorHandlers'); // هندلرهای خطا
const path = require('path');
const cookieParser = require('cookie-parser'); // برای خواندن req.cookies (توکن HttpOnly)

const app = express();

// سرو کردن فایل‌های front (public) مثل index.html, panel.html و ...
app.use(express.static(path.join(__dirname, '..', 'public')));

// پارس کردن body به صورت JSON
app.use(express.json());

// فعال‌سازی cookie parsing تا req.cookies کار کند
app.use(cookieParser());

// سوار کردن همه‌ی APIهای نسخه 1 زیر /api/v1
app.use('/api/v1', V1Routes);

// اگر هیچ روتی match نشد -> 404
app.use(notFound);

// هندل کردن خطاهای کلی برنامه
app.use(errorHandler);

module.exports = app;
