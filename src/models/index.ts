export { AccountModel } from './account';
export { LedgerModel } from './ledger';

// Keep example model available for compatibility
import { getDatabase } from '../database/connection';

export class ExampleTableModel {
  private db = getDatabase();

  async findById(id: string) {
    const rows = await this.db.query('SELECT * FROM example_table WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async create(data: { id: string; name: string }) {
    await this.db.run(
      'INSERT INTO example_table (id, name) VALUES (?, ?)',
      [data.id, data.name]
    );
    return data;
  }
}