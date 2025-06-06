import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { storage } from './storage';

const router = Router();

router.get('/auth/status', (req, res) => {
  if (req.user) {
    const user = req.user as any;
    res.json({ user: { id: user.id, username: user.username } });
  } else {
    res.json({ user: null });
  }
});

router.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  try {
    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await storage.createUser({ username, password: hashed, email: username });
    req.login(user, err => {
      if (err) { return res.status(500).json({ message: 'Login failed' }); }
      res.json({ user: { id: user.id, username: user.username } });
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) { return next(err); }
    if (!user) { return res.status(401).json({ message: info?.message || 'Login failed' }); }
    req.login(user, (err2: any) => {
      if (err2) { return next(err2); }
      res.json({ user: { id: (user as any).id, username: (user as any).username } });
    });
  })(req, res, next);
});

router.post('/auth/logout', (req, res, next) => {
  req.logout((err: any) => {
    if (err) return next(err);
    res.json({ success: true });
  });
});

router.get('/auth/google', (req, res, next) => {
  const redirect = req.query.next as string | undefined;
  if (redirect) req.session!.redirectTo = redirect;
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  const to = req.session!.redirectTo || '/';
  delete req.session!.redirectTo;
  res.redirect(to);
});

export default router;
