import { LedgerService } from '../../src/services/ledgerService';
import { runMigrations } from '../../src/database/migrate';

process.env.NODE_ENV = 'test';

describe('Ledger integration (in-memory)', () => {
  let svc: LedgerService;
  let aliceId: string;
  let bobId: string;

  beforeAll(async () => {
    // ensure migrations run against in-memory DB
    await runMigrations();
    svc = new LedgerService();
    const a = await svc.createAccount('Alice');
    const b = await svc.createAccount('Bob');
    aliceId = a.id;
    bobId = b.id;
  });

  it('creates a pending transfer and reflects pending balances', async () => {
    const amount = 1000; // $10.00
    const transfer = await svc.createTransfer(aliceId, bobId, amount, 'test-transfer');

    // pending balance: Alice should show -1000 if including pending, Bob +1000
    const alicePending = await svc.getBalance(aliceId, true);
    const bobPending = await svc.getBalance(bobId, true);

    expect(alicePending).toBe(-amount);
    expect(bobPending).toBe(amount);

    // finalized balances (exclude pending) should be 0
    const aliceFinal = await svc.getBalance(aliceId, false);
    const bobFinal = await svc.getBalance(bobId, false);
    expect(aliceFinal).toBe(0);
    expect(bobFinal).toBe(0);

    // finalize transfer
    await svc.finalizeTransfer(transfer.id);

    const aliceAfter = await svc.getBalance(aliceId, false);
    const bobAfter = await svc.getBalance(bobId, false);
    expect(aliceAfter).toBe(-amount);
    expect(bobAfter).toBe(amount);
  });

  it('is idempotent when using the same idempotency key', async () => {
    const amount = 500;
    const key = 'idem-key-1';

    // initial balances
    const a0 = await svc.getBalance(aliceId, true);
    const b0 = await svc.getBalance(bobId, true);

    // call twice with same idempotency key
    const t1 = await svc.createTransfer(aliceId, bobId, amount, 'idempotent-transfer', key);
    const t2 = await svc.createTransfer(aliceId, bobId, amount, 'idempotent-transfer', key);

    expect(t1.id).toBe(t2.id);

    // balances should reflect a single transfer
    const a1 = await svc.getBalance(aliceId, true);
    const b1 = await svc.getBalance(bobId, true);
    expect(a1).toBe(a0 - amount);
    expect(b1).toBe(b0 + amount);
  });

  it('reconciliation report shows no anomalies after finalize', async () => {
    const report = await svc.reconciliation();
    expect(report).toHaveProperty('date');
    expect(report).toHaveProperty('totals');
    expect(report).toHaveProperty('anomalies');
    // anomalies should be an array (may be empty)
    expect(Array.isArray(report.anomalies)).toBe(true);
  });
});
