/**
 * Database connection and setup
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

// Create database connection
const sqlite = new Database('./shared.db');
sqlite.pragma('journal_mode = WAL');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export for direct SQL if needed
export { sqlite };