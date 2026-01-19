import { AccountModel } from '../models/account';
import { LedgerModel } from '../models/ledger';
import { v4 as uuidv4 } from 'uuid';

const accountModel = new AccountModel();
const ledgerModel = new LedgerModel();

export class LedgerService {
  async createAccount(name: string) {
    const id = uuidv4();
    return accountModel.create(id, name);
  }

  async getAccount(id: string) {
    return accountModel.findById(id);
  }

  /**
   * Create a transfer between two accounts using double-entry.
   * amount is in cents and must be positive.
   * Returns transfer record.
   */
  async createTransfer(fromAccountId: string, toAccountId: string, amount: number, reference?: string, idempotencyKey?: string) {
    if (amount <= 0) throw new Error('amount must be positive');

    // create transfer and entries atomically in the ledger model
    const transfer = await ledgerModel.createTransfer(fromAccountId, toAccountId, reference, amount, 'USD', idempotencyKey);
    return transfer;
  }

  async finalizeTransfer(transferId: string) {
    await ledgerModel.finalizeTransfer(transferId);
  }

  async getBalance(accountId: string, includePending = true) {
    return ledgerModel.getBalance(accountId, includePending);
  }

  async reconciliation(date?: string) {
    return ledgerModel.reconciliationReport(date);
  }
}
