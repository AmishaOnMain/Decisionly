import { v4 as uuidv4 } from 'uuid';
import { pool, isUsingPostgres, loadLocalStore, saveLocalStore } from '../index.js';
import { Analysis } from '../../../shared/types/index.js';

export const analysesRepository = {
  async create(data: {
    decision_id: string;
    user_id: string;
    context_snapshot_id?: string | null;
    input_snapshot: any;
    deterministic_results: any;
    ai_analysis: any;
    model_name?: string | null;
  }): Promise<Analysis> {
    const now = new Date().toISOString();
    const id = uuidv4();

    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `INSERT INTO analyses (
          id, decision_id, user_id, context_snapshot_id,
          input_snapshot, deterministic_results, ai_analysis,
          model_name, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          id,
          data.decision_id,
          data.user_id,
          data.context_snapshot_id || null,
          JSON.stringify(data.input_snapshot),
          JSON.stringify(data.deterministic_results),
          JSON.stringify(data.ai_analysis),
          data.model_name || null,
          now,
        ]
      );
      return res.rows[0];
    }

    const store = loadLocalStore();
    const analysis: Analysis = {
      id,
      decision_id: data.decision_id,
      user_id: data.user_id,
      context_snapshot_id: data.context_snapshot_id || null,
      input_snapshot: data.input_snapshot,
      deterministic_results: data.deterministic_results,
      ai_analysis: data.ai_analysis,
      model_name: data.model_name || null,
      created_at: now,
    };
    store.analyses.push(analysis);
    saveLocalStore(store);
    return analysis;
  },

  async listByDecision(decisionId: string, userId: string): Promise<Analysis[]> {
    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `SELECT * FROM analyses WHERE decision_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
        [decisionId, userId]
      );
      return res.rows;
    }

    const store = loadLocalStore();
    return store.analyses
      .filter((a) => a.decision_id === decisionId && a.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async findById(id: string, userId: string): Promise<Analysis | null> {
    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `SELECT * FROM analyses WHERE id = $1 AND user_id = $2 LIMIT 1`,
        [id, userId]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    return store.analyses.find((a) => a.id === id && a.user_id === userId) || null;
  },
};
