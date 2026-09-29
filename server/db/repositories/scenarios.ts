import { v4 as uuidv4 } from 'uuid';
import { pool, isUsingPostgres, loadLocalStore, saveLocalStore } from '../index.js';
import { DecisionScenario } from '../../../shared/types/index.js';

export const scenariosRepository = {
  async create(data: {
    decision_id: string;
    user_id: string;
    name: string;
    scenario_inputs: any;
    deterministic_results: any;
    ai_explanation?: any;
  }): Promise<DecisionScenario> {
    const now = new Date().toISOString();
    const id = uuidv4();

    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `INSERT INTO decision_scenarios (
          id, decision_id, user_id, name, scenario_inputs,
          deterministic_results, ai_explanation, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          id,
          data.decision_id,
          data.user_id,
          data.name,
          JSON.stringify(data.scenario_inputs),
          JSON.stringify(data.deterministic_results),
          data.ai_explanation ? JSON.stringify(data.ai_explanation) : null,
          now,
          now,
        ]
      );
      return res.rows[0];
    }

    const store = loadLocalStore();
    const scenario: DecisionScenario = {
      id,
      decision_id: data.decision_id,
      user_id: data.user_id,
      name: data.name,
      scenario_inputs: data.scenario_inputs,
      deterministic_results: data.deterministic_results,
      ai_explanation: data.ai_explanation || null,
      created_at: now,
      updated_at: now,
    };
    store.scenarios.push(scenario);
    saveLocalStore(store);
    return scenario;
  },

  async listByDecision(decisionId: string, userId: string): Promise<DecisionScenario[]> {
    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `SELECT * FROM decision_scenarios WHERE decision_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
        [decisionId, userId]
      );
      return res.rows;
    }

    const store = loadLocalStore();
    return store.scenarios
      .filter((s) => s.decision_id === decisionId && s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async findById(id: string, userId: string): Promise<DecisionScenario | null> {
    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `SELECT * FROM decision_scenarios WHERE id = $1 AND user_id = $2 LIMIT 1`,
        [id, userId]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    return store.scenarios.find((s) => s.id === id && s.user_id === userId) || null;
  },

  async update(
    id: string,
    userId: string,
    data: Partial<{
      name: string;
      scenario_inputs: any;
      deterministic_results: any;
      ai_explanation: any;
    }>
  ): Promise<DecisionScenario | null> {
    const now = new Date().toISOString();

    if (isUsingPostgres && pool) {
      const current = await this.findById(id, userId);
      if (!current) return null;

      const res = await pool.query(
        `UPDATE decision_scenarios
         SET name = COALESCE($1, name),
             scenario_inputs = COALESCE($2, scenario_inputs),
             deterministic_results = COALESCE($3, deterministic_results),
             ai_explanation = COALESCE($4, ai_explanation),
             updated_at = $5
         WHERE id = $6 AND user_id = $7
         RETURNING *`,
        [
          data.name ?? current.name,
          data.scenario_inputs ? JSON.stringify(data.scenario_inputs) : null,
          data.deterministic_results ? JSON.stringify(data.deterministic_results) : null,
          data.ai_explanation ? JSON.stringify(data.ai_explanation) : null,
          now,
          id,
          userId,
        ]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    const idx = store.scenarios.findIndex((s) => s.id === id && s.user_id === userId);
    if (idx === -1) return null;

    const current = store.scenarios[idx];
    const updated: DecisionScenario = {
      ...current,
      name: data.name ?? current.name,
      scenario_inputs: data.scenario_inputs ?? current.scenario_inputs,
      deterministic_results: data.deterministic_results ?? current.deterministic_results,
      ai_explanation: data.ai_explanation ?? current.ai_explanation,
      updated_at: now,
    };
    store.scenarios[idx] = updated;
    saveLocalStore(store);
    return updated;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `DELETE FROM decision_scenarios WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );
      return (res.rowCount || 0) > 0;
    }

    const store = loadLocalStore();
    const idx = store.scenarios.findIndex((s) => s.id === id && s.user_id === userId);
    if (idx === -1) return false;

    store.scenarios.splice(idx, 1);
    saveLocalStore(store);
    return true;
  },
};
