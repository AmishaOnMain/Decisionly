import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { personalContextRepository } from '../db/repositories/personalContext.js';
import {
  CreateContextEntrySchema,
  UpdateContextEntrySchema,
  EntryTypeSchema,
} from '../../shared/schemas/context.js';

const router = Router();
router.use(requireAuth);

// List user's personal context entries
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const includeArchived = req.query.includeArchived === 'true';
    const entryType = req.query.entryType ? (req.query.entryType as any) : undefined;

    if (entryType && !EntryTypeSchema.safeParse(entryType).success) {
      res.status(400).json({ error: 'Invalid entry_type filter' });
      return;
    }

    const items = await personalContextRepository.listByUser(userId, {
      includeArchived,
      entryType,
    });
    res.json({ items });
  } catch (err: any) {
    console.error('[PersonalContext] List error:', err);
    res.status(500).json({ error: 'Failed to retrieve personal context entries' });
  }
});

// Create entry
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const parsed = CreateContextEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid input' });
      return;
    }

    const entry = await personalContextRepository.create(userId, parsed.data);
    res.status(201).json({ entry });
  } catch (err: any) {
    console.error('[PersonalContext] Create error:', err);
    res.status(500).json({ error: 'Failed to create personal context entry' });
  }
});

// Get single entry
router.get('/:entryId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const entryId = req.params.entryId as string;
    const entry = await personalContextRepository.findById(entryId, userId);
    if (!entry) {
      res.status(404).json({ error: 'Personal context entry not found' });
      return;
    }
    res.json({ entry });
  } catch (err: any) {
    console.error('[PersonalContext] Get error:', err);
    res.status(500).json({ error: 'Failed to get personal context entry' });
  }
});

// Update entry
router.patch('/:entryId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const entryId = req.params.entryId as string;
    const parsed = UpdateContextEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid update' });
      return;
    }

    const updated = await personalContextRepository.update(entryId, userId, parsed.data);
    if (!updated) {
      res.status(404).json({ error: 'Personal context entry not found' });
      return;
    }
    res.json({ entry: updated });
  } catch (err: any) {
    console.error('[PersonalContext] Update error:', err);
    res.status(500).json({ error: 'Failed to update personal context entry' });
  }
});

// Archive / Restore entry
router.post('/:entryId/archive', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const entryId = req.params.entryId as string;
    const archive = req.body.archive !== false; // defaults to archiving if not specified
    const updated = await personalContextRepository.setArchived(entryId, userId, archive);
    if (!updated) {
      res.status(404).json({ error: 'Personal context entry not found' });
      return;
    }
    res.json({ entry: updated });
  } catch (err: any) {
    console.error('[PersonalContext] Archive error:', err);
    res.status(500).json({ error: 'Failed to modify archive status' });
  }
});

// Delete entry
router.delete('/:entryId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const entryId = req.params.entryId as string;
    const deleted = await personalContextRepository.delete(entryId, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Personal context entry not found' });
      return;
    }
    res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (err: any) {
    console.error('[PersonalContext] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete personal context entry' });
  }
});

export default router;
