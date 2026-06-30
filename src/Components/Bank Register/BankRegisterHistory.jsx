import React, { useEffect, useMemo, useState } from 'react';
import {
  BANKS,
  BANK_REGISTER_6_CSS,
  BANK_REGISTER_6_FONT,
  BRANCHES,
  fmtINR,
  parseDDMMYYYY,
  SEED_EXPENSES,
  SEED_INCOME
} from './BankRegisterPayments';

export default function BankRegisterHistory() {
  const [branch, setBranch] = useState('srivilliputtur');
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

  return (
    <div className="bank-register-6-scope">
      <link rel="stylesheet" href={BANK_REGISTER_6_FONT} />
      <style dangerouslySetInnerHTML={{ __html: BANK_REGISTER_6_CSS }} />

      <div className="shell">
        <div className="ledger-card">
          <div className="accent" />
          <div className="body p-4">
            <h2 className="font-display text-xl ink mb-3">All Transactions — {account || 'select account'}</h2>
            {[...accountExpenses.map((r) => ({ ...r, kind: 'out' })), ...accountIncome.map((r) => ({ ...r, kind: 'in' }))]
              .sort((x, y) => y.date.split('/').reverse().join('').localeCompare(x.date.split('/').reverse().join('')))
              .map((t) => (
                <div
                  key={`${t.kind}-${t.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 border-b"
                  style={{ borderColor: 'var(--line-soft)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="icon-chip"
                      style={{
                        background: t.kind === 'in' ? 'var(--green-bg)' : 'var(--red-bg)',
                        width: 32,
                        height: 32,
                        borderRadius: 8
                      }}
                    >
                      <span
                        style={{
                          color: t.kind === 'in' ? 'var(--green)' : 'var(--red)',
                          fontWeight: 700,
                          fontSize: 14
                        }}
                      >
                        {t.kind === 'in' ? '+' : '−'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold ink truncate-cell">
                        {t.kind === 'in' ? 'Credit received' : `${t.party} • ${t.project}`}
                      </div>
                      <div className="text-xs muted">
                        {t.date} {t.kind === 'out' && `• ${t.mode}`} {t.matched && '• ✓ Reconciled'}
                      </div>
                    </div>
                  </div>
                  <div
                    className="font-semibold whitespace-nowrap num-cell"
                    style={{ color: t.kind === 'in' ? 'var(--green)' : 'var(--ink)' }}
                  >
                    {t.kind === 'in' ? '+' : '−'} ₹{fmtINR(t.amount)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

