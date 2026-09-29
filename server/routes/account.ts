import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { usersRepository } from '../db/repositories/users.js';
import { clearSessionCookie } from '../auth/session.js';

const router = Router();
router.use(requireAuth);

router.delete('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await usersRepository.delete(userId);
    clearSessionCookie(res);
    res.json({ success: true, message: 'Account and all associated data permanently deleted.' });
  } catch (err: any) {
    console.error('[Account] Deletion error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
