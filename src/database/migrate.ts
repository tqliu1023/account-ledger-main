import { getDatabase } from './connection';

// Migrations to support accounts, transfers and ledger entries (double-entry)
const migrations = [
  `
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS transfers (
    id TEXT PRIMARY KEY,
    idempotency_key TEXT UNIQUE,
    reference TEXT,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending', -- pending | finalized | failed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finalized_at DATETIME
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS ledger_entries (
    id TEXT PRIMARY KEY,
    transfer_id TEXT,
    account_id TEXT NOT NULL,
    amount INTEGER NOT NULL, -- stored in smallest unit (cents)
    entry_type TEXT NOT NULL, -- debit | credit
    status TEXT NOT NULL DEFAULT 'pending', -- pending | finalized
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(transfer_id) REFERENCES transfers(id),
    FOREIGN KEY(account_id) REFERENCES accounts(id)
  );
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_ledger_account ON ledger_entries(account_id);
  `
];

export async function runMigrations(): Promise<void> {
  const db = getDatabase();

  console.log('Running database migrations...');

  for (let i = 0; i < migrations.length; i++) {
    try {
      await db.run(migrations[i]);
      console.log(`Migration ${i + 1} completed`);
    } catch (error) {
      console.error(`Migration ${i + 1} failed:`, error);
      throw error;
    }
  }

  console.log('All migrations completed successfully');
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}