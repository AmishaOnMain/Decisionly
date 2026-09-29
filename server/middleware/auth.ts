import { Request, Response, NextFunction } from 'express';
import { sessionsRepository } from '../db/repositories/sessions.js';
import { usersRepository } from '../db/repositories/users.js';
import { SESSION_COOKIE_NAME } from '../auth/session.js';
import { UserSafe } from '../../shared/types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: UserSafe;
  sessionId?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let sessionId = req.cookies?.[SESSION_COOKIE_NAME];

    // Fallback to Bearer token in header if present
    if (!sessionId && req.headers.authorization?.startsWith('Bearer ')) {
      sessionId = req.headers.authorization.substring(7).trim();
    }

    if (!sessionId) {
      res.status(401).json({ error: 'Authentication required. Please sign in.' });
      return;
    }

    const session = await sessionsRepository.find(sessionId);
    if (!session) {
      res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
      return;
    }

    const user = await usersRepository.findById(session.user_id);
    if (!user) {
      res.status(401).json({ error: 'User account not found.' });
      return;
    }

    req.user = user;
    req.sessionId = sessionId;
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Error:', error);
    res.status(500).json({ error: 'Internal server authentication error' });
  }
}
