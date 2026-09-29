import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { usersRepository } from '../db/repositories/users.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const exportData = await usersRepository.exportUserData(userId);

    const filename = `decisionly_export_${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.json(exportData);
  } catch (err: any) {
    console.error('[Export] Error:', err);
    res.status(500).json({ error: 'Failed to export user data' });
  }
});

export default router;
