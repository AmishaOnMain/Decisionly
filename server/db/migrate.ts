import fs from 'fs';
import path from 'path';
import { pool, isUsingPostgres } from './index.js';

export async function runMigrations() {
  if (!isUsingPostgres || !pool) {
    console.log('[DB] Running with local persistent data store (.data/decisionly_store.json).');
    return;
  }

  try {
    const client = await pool.connect();
    try {
      console.log('[DB] Connecting to PostgreSQL and running migrations...');
      const schemaPath = path.resolve(__dirname, 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(schemaSql);
      console.log('[DB] PostgreSQL migrations applied successfully.');
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn('[DB] Failed to run PostgreSQL migrations, falling back to local store:', (error as Error).message);
  }
}

if (process.argv[1] && process.argv[1].endsWith('migrate.ts')) {
  runMigrations().then(() => process.exit(0)).catch(() => process.exit(1));
}
