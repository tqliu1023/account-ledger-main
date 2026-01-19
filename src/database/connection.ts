import sqlite3 from 'sqlite3';

export class Database {
  private db: sqlite3.Database;

  constructor(filepath: string = ':memory:') {
    this.db = new sqlite3.Database(filepath);
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async run(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Run a sequence of operations inside a transaction. The provided async
   * callback receives this Database instance and can call `run`/`query`.
   * If the callback throws, the transaction will be rolled back.
   */
  async transaction<T>(fn: (db: Database) => Promise<T>): Promise<T> {
    // BEGIN
    await this.run('BEGIN TRANSACTION');
    try {
      const res = await fn(this);
      await this.run('COMMIT');
      return res;
    } catch (err) {
      try {
        await this.run('ROLLBACK');
      } catch (rollbackErr) {
        // ignore rollback error but surface original
      }
      throw err;
    }
  }
}

let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance) {
    // const defaultPath = process.env.NODE_ENV === 'test' ? ':memory:' : './ledger.db';
    const defaultPath = './ledger.db';
    dbInstance = new Database(defaultPath);
  }
  return dbInstance;
}