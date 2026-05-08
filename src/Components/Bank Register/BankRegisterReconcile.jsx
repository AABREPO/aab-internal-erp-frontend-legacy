import React, { useEffect, useMemo, useState } from 'react';
import {
  BANKS,
  BANK_REGISTER_6_CSS,
  BANK_REGISTER_6_FONT,
  BRANCHES,
  fmtINR2,
  fmtRangeShort,
  parseDDMMYYYY,
  SEED_EXPENSES,
  SEED_INCOME
} from './BankRegisterPayments';

export default function BankRegisterReconcile() {
  const [branch] = useState('srivilliputtur');
  const banksForBranch = useMemo(
    () => BANKS.filter((b) => b.branch === BRANCHES.find((x) => x.id === branch)?.name),
    [branch]
  );
  const [bank, setBank] = useState(banksForBranch[0]?.name || '');
  const [account, setAccount] = useState(banksForBranch[0]?.accounts[0] || '');
  useEffect(() => {
    if (banksForBranch.length) {
      setBank(banksForBranch[0].name);
      setAccount(banksForBranch[0].accounts[0] || '');
    }
  }, [banksForBranch]);

  const [expenses] = useState(SEED_EXPENSES);
  const [income] = useState(SEED_INCOME);
  const [dateRange] = useState({ from: '2026-04-01', to: '2026-05-04' });

  const inDateRange = (ddmmyyyy) => {
    const dt = parseDDMMYYYY(ddmmyyyy);
    if (!dt) return true;
    const f = new Date(dateRange.from);
    const t = new Date(dateRange.to);
    return dt >= f && dt <= t;
  };

  const accountExpenses = useMemo(
    () => expenses.filter((r) => r.account === account && inDateRange(r.date)),
    [expenses, account, dateRange]
  );
  const accountIncome = useMemo(
    () => income.filter((r) => r.account === account && inDateRange(r.date)),
    [income, account, dateRange]
  );

  const totalExpense = accountExpenses.reduce((s, r) => s + r.amount, 0);
  const totalIncome = accountIncome.reduce((s, r) => s + r.amount, 0);
  const balance = totalIncome - totalExpense;

  const expReconciled = accountExpenses.filter((r) => r.matched).length;
  const incReconciled = accountIncome.filter((r) => r.matched).length;
  const totalEntries = accountExpenses.length + accountIncome.length;
  const reconciledEntries = expReconciled + incReconciled;
  const reconcilePct = totalEntries ? Math.round((reconciledEntries / totalEntries) * 100) : 0;

  return (
    <div className="bank-register-6-scope">
      <link rel="stylesheet" href={BANK_REGISTER_6_FONT} />
      <style dangerouslySetInnerHTML={{ __html: BANK_REGISTER_6_CSS }} />

      <div className="shell">
        <div className="ledger-card">
          <div className="accent" />
          <div className="body p-5">
            <h2 className="font-display text-xl ink mb-1">Reconciliation Status</h2>
            <p className="text-sm muted mb-5">
              Account: <span className="ink font-semibold">{account || 'none'}</span> · Period:{' '}
              {fmtRangeShort(dateRange.from, dateRange.to)}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div className="stat-card">
                <div className="stat-label">Total Income</div>
                <div className="stat-value">₹{fmtINR2(totalIncome)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Expense</div>
                <div className="stat-value" style={{ color: 'var(--red)' }}>
                  ₹{fmtINR2(totalExpense)}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Net Balance</div>
                <div className="stat-value" style={{ color: balance >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  ₹{fmtINR2(balance)}
                </div>
              </div>
            </div>
            <div className="bg-cream-2 rounded-xl p-4 border" style={{ borderColor: 'var(--gold-soft)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold ink">Reconciliation Progress</div>
                <div className="text-sm font-semibold text-gold-deep">
                  {reconciledEntries} / {totalEntries} entries · {reconcilePct}%
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-white overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${reconcilePct}%`, background: 'var(--gold)', transition: 'width .3s' }}
                />
              </div>
              <p className="text-xs muted mt-3 italic">
                Toggle <strong>Reconcile</strong> mode in the Bank Payments tab to start checking off entries that match
                your bank statement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

