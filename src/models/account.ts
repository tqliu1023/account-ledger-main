import { getDatabase } from '../database/connection';

export interface AccountRecord {
  id: string;
  name: string;
  created_at: string;
}

export class AccountModel {
  private db = getDatabase();

  async create(id: string, name: string) {
    await this.db.run(
      'INSERT OR IGNORE INTO accounts (id, name) VALUES (?, ?)',
      [id, name]
    );
    return { id, name } as AccountRecord;
  }

  async findById(id: string): Promise<AccountRecord | null> {
    const rows = await this.db.query('SELECT * FROM accounts WHERE id = ?', [id]);
    return rows[0] || null;
  }
}
