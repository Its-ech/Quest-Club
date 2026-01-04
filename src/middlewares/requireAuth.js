const jwt = require('jsonwebtoken');

// میدلوری احراز هویت: توکن را از cookie می‌خواند و verify می‌کند
function requireAuth(req, res, next) {
  try {
    // توکن داخل کوکی HttpOnly ذخیره شده
    const token = req.cookies?.qc_token;

    // اگر توکن نبود یعنی لاگین نیست
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // اگر توکن نامعتبر/منقضی باشد jwt.verify خطا می‌دهد
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // اطلاعات کاربر را برای روت‌های بعدی ذخیره می‌کنیم
    req.user = {
      id: payload.sub,
      email: payload.email
    };

    return next();
  } catch (err) {
    // توکن خراب یا منقضی
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = requireAuth;
