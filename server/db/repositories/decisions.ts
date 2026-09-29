import { v4 as uuidv4 } from 'uuid';
import { pool, isUsingPostgres, loadLocalStore, saveLocalStore } from '../index.js';
import { Decision, DecisionStatus } from '../../../shared/types/index.js';
import { TargetCategory } from '../../../shared/constants/categories.js';

export interface DecisionListOptions {
  search?: string;
  category?: TargetCategory;
  status?: DecisionStatus;
  includeArchived?: boolean;
  limit?: number;
  offset?: number;
}

export const decisionsRepository = {
  async listByUser(userId: string, options?: DecisionListOptions): Promise<{ items: Decision[]; total: number }> {
    const {
      search,
      category,
      status,
      includeArchived = false,
      limit = 50,
      offset = 0,
    } = options || {};

    if (isUsingPostgres && pool) {
      let queryStr = `SELECT * FROM decisions WHERE user_id = $1`;
      const params: any[] = [userId];

      if (!includeArchived) {
        queryStr += ` AND archived_at IS NULL`;
      }
      if (category) {
        params.push(category);
        queryStr += ` AND category = $${params.length}`;
      }
      if (status) {
        params.push(status);
        queryStr += ` AND status = $${params.length}`;
      }
      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        queryStr += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`;
      }

      // Count query
      const countRes = await pool.query(
        queryStr.replace('SELECT *', 'SELECT COUNT(*) as count'),
        params
      );
      const total = parseInt(countRes.rows[0].count, 10);

      queryStr += ` ORDER BY updated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const res = await pool.query(queryStr, params);
      return { items: res.rows, total };
    }

    const store = loadLocalStore();
    let filtered = store.decisions.filter((d) => {
      if (d.user_id !== userId) return false;
      if (!includeArchived && d.archived_at) return false;
      if (category && d.category !== category) return false;
      if (status && d.status !== status) return false;
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesTitle = d.title.toLowerCase().includes(q);
        const matchesDesc = (d.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });

    filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit);

    return { items, total };
  },

  async findById(id: string, userId: string): Promise<Decision | null> {
    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `SELECT * FROM decisions WHERE id = $1 AND user_id = $2 LIMIT 1`,
        [id, userId]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    return store.decisions.find((d) => d.id === id && d.user_id === userId) || null;
  },

  async create(
    userId: string,
    data: {
      title: string;
      description: string;
      category: TargetCategory;
      custom_category?: string | null;
      desired_outcome?: string | null;
      deadline?: string | null;
      constraints?: string[];
      assumptions?: string[];
    }
  ): Promise<Decision> {
    const now = new Date().toISOString();
    const id = uuidv4();

    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `INSERT INTO decisions (
          id, user_id, title, description, category, custom_category,
          desired_outcome, deadline, constraints, assumptions, status,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'draft', $11, $12)
        RETURNING *`,
        [
          id,
          userId,
          data.title,
          data.description,
          data.category,
          data.custom_category || null,
          data.desired_outcome || null,
          data.deadline || null,
          JSON.stringify(data.constraints || []),
          JSON.stringify(data.assumptions || []),
          now,
          now,
        ]
      );
      return res.rows[0];
    }

    const store = loadLocalStore();
    const decision: Decision = {
      id,
      user_id: userId,
      title: data.title,
      description: data.description,
      category: data.category,
      custom_category: data.custom_category || null,
      desired_outcome: data.desired_outcome || null,
      deadline: data.deadline || null,
      constraints: data.constraints || [],
      assumptions: data.assumptions || [],
      status: 'draft',
      chosen_alternative_id: null,
      chosen_at: null,
      outcome_reflection: null,
      outcome_recorded_at: null,
      created_at: now,
      updated_at: now,
      archived_at: null,
    };
    store.decisions.push(decision);
    saveLocalStore(store);
    return decision;
  },

  async update(
    id: string,
    userId: string,
    data: Partial<{
      title: string;
      description: string;
      category: TargetCategory;
      custom_category: string | null;
      desired_outcome: string | null;
      deadline: string | null;
      constraints: string[];
      assumptions: string[];
      status: DecisionStatus;
    }>
  ): Promise<Decision | null> {
    const now = new Date().toISOString();

    if (isUsingPostgres && pool) {
      const current = await this.findById(id, userId);
      if (!current) return null;

      const res = await pool.query(
        `UPDATE decisions
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             category = COALESCE($3, category),
             custom_category = $4,
             desired_outcome = $5,
             deadline = $6,
             constraints = COALESCE($7, constraints),
             assumptions = COALESCE($8, assumptions),
             status = COALESCE($9, status),
             updated_at = $10
         WHERE id = $11 AND user_id = $12
         RETURNING *`,
        [
          data.title ?? current.title,
          data.description ?? current.description,
          data.category ?? current.category,
          data.custom_category !== undefined ? data.custom_category : current.custom_category,
          data.desired_outcome !== undefined ? data.desired_outcome : current.desired_outcome,
          data.deadline !== undefined ? data.deadline : current.deadline,
          data.constraints ? JSON.stringify(data.constraints) : null,
          data.assumptions ? JSON.stringify(data.assumptions) : null,
          data.status ?? current.status,
          now,
          id,
          userId,
        ]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    const idx = store.decisions.findIndex((d) => d.id === id && d.user_id === userId);
    if (idx === -1) return null;

    const current = store.decisions[idx];
    const updated: Decision = {
      ...current,
      title: data.title ?? current.title,
      description: data.description ?? current.description,
      category: data.category ?? current.category,
      custom_category: data.custom_category !== undefined ? data.custom_category : current.custom_category,
      desired_outcome: data.desired_outcome !== undefined ? data.desired_outcome : current.desired_outcome,
      deadline: data.deadline !== undefined ? data.deadline : current.deadline,
      constraints: data.constraints ?? current.constraints,
      assumptions: data.assumptions ?? current.assumptions,
      status: data.status ?? current.status,
      updated_at: now,
    };
    store.decisions[idx] = updated;
    saveLocalStore(store);
    return updated;
  },

  async recordOutcome(
    id: string,
    userId: string,
    outcome: { chosen_alternative_id: string | null; outcome_reflection?: string | null }
  ): Promise<Decision | null> {
    const now = new Date().toISOString();

    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `UPDATE decisions
         SET chosen_alternative_id = $1,
             chosen_at = CASE WHEN $1 IS NOT NULL THEN now() ELSE NULL END,
             outcome_reflection = $2,
             outcome_recorded_at = CASE WHEN $2 IS NOT NULL THEN now() ELSE NULL END,
             updated_at = $3
         WHERE id = $4 AND user_id = $5
         RETURNING *`,
        [outcome.chosen_alternative_id, outcome.outcome_reflection || null, now, id, userId]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    const idx = store.decisions.findIndex((d) => d.id === id && d.user_id === userId);
    if (idx === -1) return null;

    store.decisions[idx].chosen_alternative_id = outcome.chosen_alternative_id;
    store.decisions[idx].chosen_at = outcome.chosen_alternative_id ? now : null;
    store.decisions[idx].outcome_reflection = outcome.outcome_reflection || null;
    store.decisions[idx].outcome_recorded_at = outcome.outcome_reflection ? now : null;
    store.decisions[idx].updated_at = now;
    saveLocalStore(store);
    return store.decisions[idx];
  },

  async setArchived(id: string, userId: string, archive: boolean): Promise<Decision | null> {
    const now = archive ? new Date().toISOString() : null;
    const updatedAt = new Date().toISOString();

    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `UPDATE decisions
         SET archived_at = $1, updated_at = $2
         WHERE id = $3 AND user_id = $4
         RETURNING *`,
        [now, updatedAt, id, userId]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    const idx = store.decisions.findIndex((d) => d.id === id && d.user_id === userId);
    if (idx === -1) return null;

    store.decisions[idx].archived_at = now;
    store.decisions[idx].updated_at = updatedAt;
    saveLocalStore(store);
    return store.decisions[idx];
  },

  async delete(id: string, userId: string): Promise<boolean> {
    if (isUsingPostgres && pool) {
      const res = await pool.query(`DELETE FROM decisions WHERE id = $1 AND user_id = $2`, [id, userId]);
      return (res.rowCount || 0) > 0;
    }

    const store = loadLocalStore();
    const idx = store.decisions.findIndex((d) => d.id === id && d.user_id === userId);
    if (idx === -1) return false;

    store.decisions.splice(idx, 1);
    store.alternatives = store.alternatives.filter((a) => a.decision_id !== id);
    store.criteria = store.criteria.filter((c) => c.decision_id !== id);
    store.snapshots = store.snapshots.filter((s) => s.decision_id !== id);
    store.analyses = store.analyses.filter((an) => an.decision_id !== id);
    store.scenarios = store.scenarios.filter((sc) => sc.decision_id !== id);
    saveLocalStore(store);
    return true;
  },
};
