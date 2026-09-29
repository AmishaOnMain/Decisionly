import { pool, isUsingPostgres, loadLocalStore, saveLocalStore } from '../index.js';

export interface SessionRecord {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export const sessionsRepository = {
  async create(id: string, userId: string, expiresAt: Date): Promise<SessionRecord> {
    const now = new Date().toISOString();
    const exp = expiresAt.toISOString();

    if (isUsingPostgres && pool) {
      await pool.query(
        `INSERT INTO user_sessions (id, user_id, expires_at, created_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET expires_at = $3`,
        [id, userId, exp, now]
      );
      return { id, user_id: userId, expires_at: exp, created_at: now };
    }

    const store = loadLocalStore();
    const existingIdx = store.sessions.findIndex((s) => s.id === id);
    const session: SessionRecord = { id, user_id: userId, expires_at: exp, created_at: now };

    if (existingIdx !== -1) {
      store.sessions[existingIdx] = session;
    } else {
      store.sessions.push(session);
    }
    saveLocalStore(store);
    return session;
  },

  async find(id: string): Promise<SessionRecord | null> {
    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `SELECT * FROM user_sessions WHERE id = $1 AND expires_at > now() LIMIT 1`,
        [id]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    const now = new Date();
    const s = store.sessions.find(
      (session) => session.id === id && new Date(session.expires_at) > now
    );
    return s || null;
  },

  async delete(id: string): Promise<void> {
    if (isUsingPostgres && pool) {
      await pool.query(`DELETE FROM user_sessions WHERE id = $1`, [id]);
      return;
    }

    const store = loadLocalStore();
    store.sessions = store.sessions.filter((s) => s.id !== id);
    saveLocalStore(store);
  },
};
