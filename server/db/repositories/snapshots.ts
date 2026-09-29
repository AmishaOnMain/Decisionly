import { v4 as uuidv4 } from 'uuid';
import { pool, isUsingPostgres, loadLocalStore, saveLocalStore } from '../index.js';
import { DecisionContextSnapshot } from '../../../shared/types/index.js';

export const snapshotsRepository = {
  async create(
    decisionId: string,
    userId: string,
    contextEntries: any[],
    decisionSpecificContext: string[] = []
  ): Promise<DecisionContextSnapshot> {
    const now = new Date().toISOString();
    const id = uuidv4();

    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `INSERT INTO decision_context_snapshots (id, decision_id, user_id, context_entries, decision_specific_context, confirmed_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          id,
          decisionId,
          userId,
          JSON.stringify(contextEntries),
          JSON.stringify(decisionSpecificContext),
          now,
          now,
        ]
      );
      return res.rows[0];
    }

    const store = loadLocalStore();
    const snapshot: DecisionContextSnapshot = {
      id,
      decision_id: decisionId,
      user_id: userId,
      context_entries: contextEntries,
      decision_specific_context: decisionSpecificContext,
      confirmed_at: now,
      created_at: now,
    };
    store.snapshots.push(snapshot);
    saveLocalStore(store);
    return snapshot;
  },

  async getLatestForDecision(decisionId: string, userId: string): Promise<DecisionContextSnapshot | null> {
    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `SELECT * FROM decision_context_snapshots
         WHERE decision_id = $1 AND user_id = $2
         ORDER BY created_at DESC LIMIT 1`,
        [decisionId, userId]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    const matches = store.snapshots
      .filter((s) => s.decision_id === decisionId && s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return matches[0] || null;
  },

  async findById(id: string, userId: string): Promise<DecisionContextSnapshot | null> {
    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `SELECT * FROM decision_context_snapshots WHERE id = $1 AND user_id = $2 LIMIT 1`,
        [id, userId]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    return store.snapshots.find((s) => s.id === id && s.user_id === userId) || null;
  },
};
