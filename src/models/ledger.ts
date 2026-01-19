import { getDatabase } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';

export interface LedgerEntry {
  id: string;
  transfer_id?: string;
  account_id: string;
  amount: number; // cents
  entry_type: 'debit' | 'credit';
  status: 'pending' | 'finalized' | 'failed';
  created_at?: string;
}

export interface TransferRecord {
  id: string;
  reference?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'finalized' | 'failed';
  created_at?: string;
  finalized_at?: string | null;
}

export class LedgerModel {
  private db = getDatabase();

  /**
   * Create a transfer atomically with both ledger entries (debit fromAccount, credit toAccount).
   * If idempotencyKey is provided the call is idempotent: repeated calls with same key won't duplicate entries.
   */
  async createTransfer(fromAccountId: string, toAccountId: string, reference: string | undefined, amount: number, currency = 'USD', idempotencyKey?: string) {
    return this.db.transaction(async (db) => {
      let transferId: string | undefined;

      if (idempotencyKey) {
        // Try to create transfer if not exists
        await db.run(
          'INSERT OR IGNORE INTO transfers (id, idempotency_key, reference, amount, currency, status) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), idempotencyKey, reference || null, amount, currency, 'pending']
        );
        const rows = await db.query('SELECT * FROM transfers WHERE idempotency_key = ?', [idempotencyKey]);
        if (rows && rows[0]) transferId = rows[0].id;
      } else {
        const id = uuidv4();
        await db.run('INSERT INTO transfers (id, reference, amount, currency, status) VALUES (?, ?, ?, ?, ?)', [id, reference || null, amount, currency, 'pending']);
        transferId = id;
      }

      if (!transferId) throw new Error('unable to create or find transfer');

      // Check if ledger entries already exist for this transfer
      const existing = await db.query('SELECT COUNT(*) as cnt FROM ledger_entries WHERE transfer_id = ?', [transferId]);
      const cnt = existing && existing[0] ? existing[0].cnt : 0;
      if (cnt === 0) {
        // create debit (fromAccount) and credit (toAccount)
        await db.run('INSERT INTO ledger_entries (id, transfer_id, account_id, amount, entry_type, status) VALUES (?, ?, ?, ?, ?, ?)', [uuidv4(), transferId, fromAccountId, amount, 'debit', 'pending']);
        await db.run('INSERT INTO ledger_entries (id, transfer_id, account_id, amount, entry_type, status) VALUES (?, ?, ?, ?, ?, ?)', [uuidv4(), transferId, toAccountId, amount, 'credit', 'pending']);
      }

      const trows = await db.query('SELECT * FROM transfers WHERE id = ?', [transferId]);
      const transferRow = trows && trows[0];
      return {
        id: transferRow.id,
        reference: transferRow.reference,
        amount: transferRow.amount,
        currency: transferRow.currency,
        status: transferRow.status,
      } as TransferRecord;
    });
  }

  async createLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'created_at'>) {
    const id = uuidv4();
    await this.db.run(
      'INSERT INTO ledger_entries (id, transfer_id, account_id, amount, entry_type, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, entry.transfer_id || null, entry.account_id, entry.amount, entry.entry_type, entry.status]
    );
    return { ...entry, id } as LedgerEntry;
  }

  async finalizeTransfer(transferId: string) {
    // mark transfer finalized and all associated ledger entries finalized
    await this.db.run('UPDATE transfers SET status = ?, finalized_at = CURRENT_TIMESTAMP WHERE id = ?', ['finalized', transferId]);
    await this.db.run('UPDATE ledger_entries SET status = ? WHERE transfer_id = ?', ['finalized', transferId]);
  }

  async getEntriesForAccount(accountId: string, includePending = true): Promise<LedgerEntry[]> {
    const rows = await this.db.query(
      `SELECT * FROM ledger_entries WHERE account_id = ? ${includePending ? '' : "AND status = 'finalized'"} ORDER BY created_at ASC`,
      [accountId]
    );
    return rows as LedgerEntry[];
  }

  async getBalance(accountId: string, includePending = true): Promise<number> {
    const entries = await this.getEntriesForAccount(accountId, includePending);
    // debit reduces balance, credit increases (assume positive amounts)
    let balance = 0;
    for (const e of entries) {
      if (e.entry_type === 'credit') balance += e.amount;
      else balance -= e.amount;
    }
    return balance;
  }

  async reconciliationReport(date?: string) {
    // simple reconciliation: sum of finalized ledger entries per account and detect any unmatched transfers
    const targetDate = date || new Date().toISOString().slice(0, 10);
    // total by account (finalized)
    const rows = await this.db.query(
      `SELECT account_id, SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE -amount END) as balance_change
       FROM ledger_entries WHERE status = 'finalized' AND date(created_at) = ? GROUP BY account_id`,
      [targetDate]
    );

    const totals = rows.reduce((acc: Record<string, number>, r: any) => {
      acc[r.account_id] = r.balance_change || 0;
      return acc;
    }, {});

    // find transfers with missing two-sided entries
    const transfers = await this.db.query('SELECT id, amount FROM transfers WHERE date(created_at) = ?', [targetDate]);
    const anomalies: any[] = [];
    for (const t of transfers) {
      const entries = await this.db.query('SELECT COUNT(*) as cnt FROM ledger_entries WHERE transfer_id = ?', [t.id]);
      if (!entries || entries[0].cnt !== 2) {
        anomalies.push({ transferId: t.id, amount: t.amount, reason: 'missing entries or partial' });
      }
    }

    return { date: targetDate, totals, anomalies };
  }
}
