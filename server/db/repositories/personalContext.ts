import { v4 as uuidv4 } from 'uuid';
import { pool, isUsingPostgres, loadLocalStore, saveLocalStore } from '../index.js';
import { PersonalContextEntry, EntryType, DurationType } from '../../../shared/types/index.js';

export const personalContextRepository = {
  async listByUser(
    userId: string,
    options?: { includeArchived?: boolean; entryType?: EntryType }
  ): Promise<PersonalContextEntry[]> {
    const { includeArchived = false, entryType } = options || {};

    if (isUsingPostgres && pool) {
      let queryStr = `SELECT * FROM personal_context_entries WHERE user_id = $1`;
      const params: any[] = [userId];

      if (!includeArchived) {
        queryStr += ` AND archived_at IS NULL`;
      }
      if (entryType) {
        params.push(entryType);
        queryStr += ` AND entry_type = $${params.length}`;
      }

      queryStr += ` ORDER BY created_at DESC`;
      const res = await pool.query(queryStr, params);
      return res.rows;
    }

    const store = loadLocalStore();
    return store.personal_context.filter((c) => {
      if (c.user_id !== userId) return false;
      if (!includeArchived && c.archived_at) return false;
      if (entryType && c.entry_type !== entryType) return false;
      return true;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async findById(id: string, userId: string): Promise<PersonalContextEntry | null> {
    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `SELECT * FROM personal_context_entries WHERE id = $1 AND user_id = $2 LIMIT 1`,
        [id, userId]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    return (
      store.personal_context.find(
        (c) => c.id === id && c.user_id === userId
      ) || null
    );
  },

  async create(
    userId: string,
    data: {
      entry_type: EntryType;
      title: string;
      content: string;
      duration_type?: DurationType;
      review_at?: string | null;
    }
  ): Promise<PersonalContextEntry> {
    const now = new Date().toISOString();
    const id = uuidv4();
    const duration = data.duration_type || 'long_term';
    const reviewAt = data.review_at || null;

    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `INSERT INTO personal_context_entries (id, user_id, entry_type, title, content, duration_type, review_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [id, userId, data.entry_type, data.title, data.content, duration, reviewAt, now, now]
      );
      return res.rows[0];
    }

    const store = loadLocalStore();
    const entry: PersonalContextEntry = {
      id,
      user_id: userId,
      entry_type: data.entry_type,
      title: data.title,
      content: data.content,
      duration_type: duration,
      review_at: reviewAt,
      archived_at: null,
      created_at: now,
      updated_at: now,
    };
    store.personal_context.push(entry);
    saveLocalStore(store);
    return entry;
  },

  async update(
    id: string,
    userId: string,
    data: Partial<{
      entry_type: EntryType;
      title: string;
      content: string;
      duration_type: DurationType;
      review_at: string | null;
    }>
  ): Promise<PersonalContextEntry | null> {
    const now = new Date().toISOString();

    if (isUsingPostgres && pool) {
      const current = await this.findById(id, userId);
      if (!current) return null;

      const updatedType = data.entry_type ?? current.entry_type;
      const updatedTitle = data.title ?? current.title;
      const updatedContent = data.content ?? current.content;
      const updatedDuration = data.duration_type ?? current.duration_type;
      const updatedReviewAt = data.review_at !== undefined ? data.review_at : current.review_at;

      const res = await pool.query(
        `UPDATE personal_context_entries
         SET entry_type = $1, title = $2, content = $3, duration_type = $4, review_at = $5, updated_at = $6
         WHERE id = $7 AND user_id = $8
         RETURNING *`,
        [updatedType, updatedTitle, updatedContent, updatedDuration, updatedReviewAt, now, id, userId]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    const idx = store.personal_context.findIndex((c) => c.id === id && c.user_id === userId);
    if (idx === -1) return null;

    const current = store.personal_context[idx];
    const updated: PersonalContextEntry = {
      ...current,
      entry_type: data.entry_type ?? current.entry_type,
      title: data.title ?? current.title,
      content: data.content ?? current.content,
      duration_type: data.duration_type ?? current.duration_type,
      review_at: data.review_at !== undefined ? data.review_at : current.review_at,
      updated_at: now,
    };
    store.personal_context[idx] = updated;
    saveLocalStore(store);
    return updated;
  },

  async setArchived(id: string, userId: string, archive: boolean): Promise<PersonalContextEntry | null> {
    const now = archive ? new Date().toISOString() : null;
    const updatedAt = new Date().toISOString();

    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `UPDATE personal_context_entries
         SET archived_at = $1, updated_at = $2
         WHERE id = $3 AND user_id = $4
         RETURNING *`,
        [now, updatedAt, id, userId]
      );
      return res.rows[0] || null;
    }

    const store = loadLocalStore();
    const idx = store.personal_context.findIndex((c) => c.id === id && c.user_id === userId);
    if (idx === -1) return null;

    store.personal_context[idx].archived_at = now;
    store.personal_context[idx].updated_at = updatedAt;
    saveLocalStore(store);
    return store.personal_context[idx];
  },

  async delete(id: string, userId: string): Promise<boolean> {
    if (isUsingPostgres && pool) {
      const res = await pool.query(
        `DELETE FROM personal_context_entries WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );
      return (res.rowCount || 0) > 0;
    }

    const store = loadLocalStore();
    const idx = store.personal_context.findIndex((c) => c.id === id && c.user_id === userId);
    if (idx === -1) return false;

    store.personal_context.splice(idx, 1);
    saveLocalStore(store);
    return true;
  },
};
