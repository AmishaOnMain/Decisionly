import { v4 as uuidv4 } from 'uuid';
import { pool, isUsingPostgres, loadLocalStore, saveLocalStore } from '../index.js';
import { Alternative } from '../../../shared/types/index.js';
import { decisionsRepository } from './decisions.js';

export const alternativesRepository = {
  async listByDecision(decisionId: string, userId: string): Promise<Alternative[]> {
    const decision = await decisionsRepository.findById(decisionId, userId);
    if (!decision) return [];

    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `SELECT * FROM alternatives WHERE decision_id = $1 ORDER BY sort_order ASC, created_at ASC`,
        [decisionId]
      );
      return res.rows;
    }

    const store = loadLocalStore();
    return store.alternatives
      .filter((a) => a.decision_id === decisionId)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  async replaceForDecision(
    decisionId: string,
    userId: string,
    items: Array<{
      id?: string;
      name: string;
      description?: string;
      sort_order?: number;
      values?: Record<string, any>;
    }>
  ): Promise<Alternative[]> {
    const decision = await decisionsRepository.findById(decisionId, userId);
    if (!decision) {
      throw new Error('Decision not found or unauthorized');
    }

    const now = new Date().toISOString();

    if (isUsingPostgres && pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(`DELETE FROM alternatives WHERE decision_id = $1`, [decisionId]);

        const inserted: Alternative[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const id = item.id || uuidv4();
          const res = await client.query(
            `INSERT INTO alternatives (id, decision_id, name, description, sort_order, values, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
              id,
              decisionId,
              item.name,
              item.description || '',
              item.sort_order ?? i,
              JSON.stringify(item.values || {}),
              now,
              now,
            ]
          );
          inserted.push(res.rows[0]);
        }
        await client.query('COMMIT');
        return inserted;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    const store = loadLocalStore();
    store.alternatives = store.alternatives.filter((a) => a.decision_id !== decisionId);

    const inserted: Alternative[] = items.map((item, idx) => ({
      id: item.id || uuidv4(),
      decision_id: decisionId,
      name: item.name,
      description: item.description || '',
      sort_order: item.sort_order ?? idx,
      values: item.values || {},
      created_at: now,
      updated_at: now,
    }));

    store.alternatives.push(...inserted);
    saveLocalStore(store);
    return inserted;
  },
};
