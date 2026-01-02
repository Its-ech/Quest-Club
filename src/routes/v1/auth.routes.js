const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const users = require('../../store/usersStore');

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ✅ NEW: auth check endpoint (must be top-level, not inside login)
router.get('/auth/me', (req, res) => {
  try {
    const token = req.cookies?.qc_token;
    if (!token) return res.status(401).json({ ok: false });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      ok: true,
      user: { id: payload.sub, email: payload.email }
    });
  } catch {
    return res.status(401).json({ ok: false });
  }
});

router.post('/auth/register', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const exists = users.find((u) => u.email === email);
  if (exists) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    id: `u_${Date.now()}`,
    email,
    passwordHash
  };

  users.push(user);

  return res.status(201).json({ id: user.id, email: user.email });
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = issueToken(user);

  res.cookie('qc_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(200).json({ ok: true });
});

router.post('/auth/logout', (req, res) => {
  res.clearCookie('qc_token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });

  return res.status(200).json({ ok: true });
});

module.exports = router;
