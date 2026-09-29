import { Router, Response } from 'express';
import { SignUpSchema, SignInSchema } from '../../shared/schemas/auth.js';
import { usersRepository } from '../db/repositories/users.js';
import { hashPassword, verifyPassword } from '../auth/passwords.js';
import { createSession, setSessionCookie, clearSessionCookie } from '../auth/session.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { sessionsRepository } from '../db/repositories/sessions.js';

const router = Router();

// Sign Up
router.post('/sign-up', async (req, res: Response) => {
  try {
    const parseRes = SignUpSchema.safeParse(req.body);
    if (!parseRes.success) {
      res.status(400).json({ error: parseRes.error.errors[0]?.message || 'Invalid input' });
      return;
    }

    const { email, password, display_name } = parseRes.data;
    const existing = await usersRepository.findByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await usersRepository.create(email, passwordHash, display_name);
    const sessionId = await createSession(user.id);
    setSessionCookie(res, sessionId);

    res.status(201).json({ user, token: sessionId });
  } catch (err: any) {
    console.error('[Auth] Sign up error:', err);
    res.status(500).json({ error: err.message || 'Failed to create account' });
  }
});

// Sign In
router.post('/sign-in', async (req, res: Response) => {
  try {
    const parseRes = SignInSchema.safeParse(req.body);
    if (!parseRes.success) {
      res.status(400).json({ error: parseRes.error.errors[0]?.message || 'Invalid email or password' });
      return;
    }

    const { email, password } = parseRes.data;
    const userRecord = await usersRepository.findByEmail(email);
    if (!userRecord || !userRecord.password_hash) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isValid = await verifyPassword(password, userRecord.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const sessionId = await createSession(userRecord.id);
    setSessionCookie(res, sessionId);

    const safeUser = {
      id: userRecord.id,
      email: userRecord.email,
      display_name: userRecord.display_name,
      created_at: userRecord.created_at,
      updated_at: userRecord.updated_at,
    };

    res.json({ user: safeUser, token: sessionId });
  } catch (err: any) {
    console.error('[Auth] Sign in error:', err);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// Quick Demo Login helper (creates or logs into a demo account for immediate testing)
router.post('/demo', async (req, res: Response) => {
  try {
    const demoEmail = 'alex.reed@decisionly.demo';
    let userRecord = await usersRepository.findByEmail(demoEmail);

    if (!userRecord) {
      const demoHash = await hashPassword('DemoPassword2026!');
      const safe = await usersRepository.create(demoEmail, demoHash, 'Alex Reed');
      userRecord = await usersRepository.findByEmail(demoEmail);
    }

    if (!userRecord) {
      res.status(500).json({ error: 'Failed to prepare demo account' });
      return;
    }

    const sessionId = await createSession(userRecord.id);
    setSessionCookie(res, sessionId);

    res.json({
      user: {
        id: userRecord.id,
        email: userRecord.email,
        display_name: userRecord.display_name,
        created_at: userRecord.created_at,
        updated_at: userRecord.updated_at,
      },
      token: sessionId,
    });
  } catch (err: any) {
    console.error('[Auth] Demo login error:', err);
    res.status(500).json({ error: 'Failed to sign in as demo' });
  }
});

// Sign Out
router.post('/sign-out', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.sessionId) {
      await sessionsRepository.delete(req.sessionId);
    }
    clearSessionCookie(res);
    res.json({ success: true, message: 'Signed out successfully' });
  } catch (err: any) {
    clearSessionCookie(res);
    res.json({ success: true });
  }
});

// Current User Profile
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router;
