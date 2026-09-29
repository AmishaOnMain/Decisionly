import crypto from 'crypto';
import { Response } from 'express';
import { sessionsRepository } from '../db/repositories/sessions.js';
import { config } from '../config.js';

export const SESSION_COOKIE_NAME = 'decisionly_session';
export const SESSION_DURATION_DAYS = 7;

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await sessionsRepository.create(sessionId, userId, expiresAt);
  return sessionId;
}

export function setSessionCookie(res: Response, sessionId: string): void {
  const maxAge = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: config.COOKIE_SECURE || config.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: config.COOKIE_SECURE || config.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
