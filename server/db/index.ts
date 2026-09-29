import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const { Pool } = pg;

export let pool: pg.Pool | null = null;
export let isUsingPostgres = false;

// Initialize Postgres if DATABASE_URL is configured
if (config.DATABASE_URL && !config.DATABASE_URL.includes('USER:PASSWORD')) {
  try {
    pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 15,
      idleTimeoutMillis: 30000,
    });
    isUsingPostgres = true;
  } catch (err) {
    console.warn('PostgreSQL Pool initialization deferred:', (err as Error).message);
    pool = null;
    isUsingPostgres = false;
  }
}

// Database helper functions
export async function query(text: string, params?: any[]): Promise<any> {
  if (isUsingPostgres && pool) {
    return pool.query(text, params);
  }
  throw new Error('PostgreSQL is not connected. Use repository methods for local fallback.');
}

// Ensure database directory exists for local development store
const dataDir = process.env.VERCEL
  ? path.resolve('/tmp', '.data')
  : path.resolve(process.cwd(), '.data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const localDbPath = path.resolve(dataDir, 'decisionly_store.json');

// Interface for local store
export interface LocalStoreData {
  users: any[];
  sessions: any[];
  personal_context: any[];
  decisions: any[];
  alternatives: any[];
  criteria: any[];
  snapshots: any[];
  analyses: any[];
  scenarios: any[];
}

export function loadLocalStore(): LocalStoreData {
  if (!fs.existsSync(localDbPath)) {
    const initial: LocalStoreData = {
      users: [],
      sessions: [],
      personal_context: [],
      decisions: [],
      alternatives: [],
      criteria: [],
      snapshots: [],
      analyses: [],
      scenarios: [],
    };
    fs.writeFileSync(localDbPath, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(localDbPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {
      users: [],
      sessions: [],
      personal_context: [],
      decisions: [],
      alternatives: [],
      criteria: [],
      snapshots: [],
      analyses: [],
      scenarios: [],
    };
  }
}

export function saveLocalStore(data: LocalStoreData): void {
  fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf-8');
}
