import { v4 as uuidv4 } from 'uuid';
import { pool, isUsingPostgres, loadLocalStore, saveLocalStore } from '../index.js';
import { Criterion, CriterionType, CriterionDirection } from '../../../shared/types/index.js';
import { decisionsRepository } from './decisions.js';

export const criteriaRepository = {
  async listByDecision(decisionId: string, userId: string): Promise<Criterion[]> {
    const decision = await decisionsRepository.findById(decisionId, userId);
    if (!decision) return [];

    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `SELECT * FROM criteria WHERE decision_id = $1 ORDER BY sort_order ASC, created_at ASC`,
        [decisionId]
      );
      return res.rows.map((row) => ({
        ...row,
        weight: parseFloat(row.weight),
      }));
    }

    const store = loadLocalStore();
    return store.criteria
      .filter((c) => c.decision_id === decisionId)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  async replaceForDecision(
    decisionId: string,
    userId: string,
    items: Array<{
      id?: string;
      name: string;
      description?: string;
      criterion_type: CriterionType;
      direction: CriterionDirection;
      weight: number;
      sort_order?: number;
    }>
  ): Promise<Criterion[]> {
    const decision = await decisionsRepository.findById(decisionId, userId);
    if (!decision) {
      throw new Error('Decision not found or unauthorized');
    }

    const now = new Date().toISOString();

    if (isUsingPostgres && pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(`DELETE FROM criteria WHERE decision_id = $1`, [decisionId]);

        const inserted: Criterion[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const id = item.id || uuidv4();
          const res = await client.query(
            `INSERT INTO criteria (id, decision_id, name, description, criterion_type, direction, weight, sort_order, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
              id,
              decisionId,
              item.name,
              item.description || '',
              item.criterion_type,
              item.direction,
              item.weight,
              item.sort_order ?? i,
              now,
              now,
            ]
          );
          inserted.push({
            ...res.rows[0],
            weight: parseFloat(res.rows[0].weight),
          });
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
    store.criteria = store.criteria.filter((c) => c.decision_id !== decisionId);

    const inserted: Criterion[] = items.map((item, idx) => ({
      id: item.id || uuidv4(),
      decision_id: decisionId,
      name: item.name,
      description: item.description || '',
      criterion_type: item.criterion_type,
      direction: item.direction,
      weight: item.weight,
      sort_order: item.sort_order ?? idx,
      created_at: now,
      updated_at: now,
    }));

    store.criteria.push(...inserted);
    saveLocalStore(store);
    return inserted;
  },
};
