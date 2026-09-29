import { v4 as uuidv4 } from 'uuid';
import { pool, isUsingPostgres, loadLocalStore, saveLocalStore } from '../index.js';
import { UserSafe } from '../../../shared/types/index.js';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const usersRepository = {
  async create(email: string, passwordHash: string, displayName?: string): Promise<UserSafe> {
    const now = new Date().toISOString();
    const id = uuidv4();

    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, display_name, created_at, updated_at`,
        [id, email.toLowerCase(), passwordHash, displayName || null, now, now]
      );
      return res.rows[0];
    }

    const store = loadLocalStore();
    const existing = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const newUser: UserRecord = {
      id,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      display_name: displayName || null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    store.users.push(newUser);
    saveLocalStore(store);

    return {
      id: newUser.id,
      email: newUser.email,
      display_name: newUser.display_name,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    };
  },

  async findByEmail(email: string): Promise<UserRecord | null> {
    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1`,
        [email.toLowerCase()]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    return (
      store.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && !u.deleted_at
      ) || null
    );
  },

  async findById(id: string): Promise<UserSafe | null> {
    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `SELECT id, email, display_name, created_at, updated_at FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
        [id]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    const u = store.users.find((user) => user.id === id && !user.deleted_at);
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      display_name: u.display_name,
      created_at: u.created_at,
      updated_at: u.updated_at,
    };
  },

  async delete(id: string): Promise<boolean> {
    if (isUsingPostgres && pool) {
      // Cascades to decisions, context, etc.
      await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
      return true;
    }

    const store = loadLocalStore();
    const idx = store.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;

    store.users.splice(idx, 1);
    store.sessions = store.sessions.filter((s) => s.user_id !== id);
    store.personal_context = store.personal_context.filter((c) => c.user_id !== id);
    store.decisions = store.decisions.filter((d) => d.user_id !== id);
    store.snapshots = store.snapshots.filter((s) => s.user_id !== id);
    store.analyses = store.analyses.filter((a) => a.user_id !== id);
    store.scenarios = store.scenarios.filter((s) => s.user_id !== id);
    saveLocalStore(store);
    return true;
  },

  async exportUserData(userId: string) {
    if (isUsingPostgres && pool) {
      const userRes = await pool.query(
        `SELECT id, email, display_name, created_at, updated_at FROM users WHERE id = $1`,
        [userId]
      );
      const contextRes = await pool.query(
        `SELECT * FROM personal_context_entries WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      const decisionsRes = await pool.query(
        `SELECT * FROM decisions WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      const decisionIds = decisionsRes.rows.map((d) => d.id);
      let alternatives: any[] = [];
      let criteria: any[] = [];
      let analyses: any[] = [];
      let scenarios: any[] = [];

      if (decisionIds.length > 0) {
        const altRes = await pool.query(
          `SELECT * FROM alternatives WHERE decision_id = ANY($1::uuid[])`,
          [decisionIds]
        );
        alternatives = altRes.rows;

        const critRes = await pool.query(
          `SELECT * FROM criteria WHERE decision_id = ANY($1::uuid[])`,
          [decisionIds]
        );
        criteria = critRes.rows;

        const anRes = await pool.query(
          `SELECT * FROM analyses WHERE decision_id = ANY($1::uuid[])`,
          [decisionIds]
        );
        analyses = anRes.rows;

        const scRes = await pool.query(
          `SELECT * FROM decision_scenarios WHERE decision_id = ANY($1::uuid[])`,
          [decisionIds]
        );
        scenarios = scRes.rows;
      }

      return {
        exportVersion: '1.0',
        exportedAt: new Date().toISOString(),
        profile: userRes.rows[0] || null,
        personalContext: contextRes.rows,
        decisions: decisionsRes.rows.map((d) => ({
          ...d,
          alternatives: alternatives.filter((a) => a.decision_id === d.id),
          criteria: criteria.filter((c) => c.decision_id === d.id),
          analyses: analyses.filter((a) => a.decision_id === d.id),
          scenarios: scenarios.filter((s) => s.decision_id === d.id),
        })),
      };
    }

    const store = loadLocalStore();
    const user = store.users.find((u) => u.id === userId);
    const context = store.personal_context.filter((c) => c.user_id === userId);
    const userDecisions = store.decisions.filter((d) => d.user_id === userId);

    return {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      profile: user ? { id: user.id, email: user.email, display_name: user.display_name, created_at: user.created_at } : null,
      personalContext: context,
      decisions: userDecisions.map((d) => ({
        ...d,
        alternatives: store.alternatives.filter((a) => a.decision_id === d.id),
        criteria: store.criteria.filter((c) => c.decision_id === d.id),
        analyses: store.analyses.filter((a) => a.decision_id === d.id),
        scenarios: store.scenarios.filter((s) => s.decision_id === d.id),
      })),
    };
  },
};
