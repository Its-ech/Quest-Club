# Quest Club

## فارسی
یک پروژه تمرینی برای یادگیری Node.js/Express:  
Daily Quest + Streak + Panel (Goals).  
این پروژه در حال یادگیری ساخته شده و با کمک هوش مصنوعی توسعه داده شده است.

### اجرا
```bash
npm install
npm run dev
.env:

text
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
صفحات
/ (Home)

/login.html

/panel.html

API (Base: /api/v1)
GET /health

Auth: POST /auth/register POST /auth/login POST /auth/logout GET /auth/me

Quests (Protected): GET /quests/today POST /quests/today/accept POST /quests/today/complete

Streak (Protected): GET /streak

Dev-only: POST /quests/today/reset GET /debug/state

نکته: داده‌ها in-memory و per-user هستند و با ریستارت سرور پاک می‌شوند.

English
A training project to practice Node.js/Express:
Daily Quest + Streak + Panel (Goals).
Built while learning, with AI assistance.

Run
bash
npm install
npm run dev
.env:

text
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
Pages
/ (Home)

/login.html

/panel.html

API (Base: /api/v1)
GET /health

Auth: POST /auth/register POST /auth/login POST /auth/logout GET /auth/me

Quests (Protected): GET /quests/today POST /quests/today/accept POST /quests/today/complete

Streak (Protected): GET /streak

Dev-only: POST /quests/today/reset GET /debug/state

