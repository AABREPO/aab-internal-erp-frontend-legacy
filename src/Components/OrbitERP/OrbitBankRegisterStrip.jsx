import React from "react";
import { Link, NavLink } from "react-router-dom";

/** Matches Orbit ERP 1.6.html `.tabs-row` / `.tab` (tabs only; no branch / profile toolbar). */
const STRIP_CSS = `
.orbit-bank-strip-root{
  --gold:#D6AB60; --gold-deep:#B8924B; --ink:#212121; --ink-2:#3a3a3a; --muted:#8a8275;
  --cream:#FBF7F0; --line:#EADFC8;
  font-family:'Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif;
  color:var(--ink);
}
.orbit-bank-strip-row{
  background:var(--cream);
  border-bottom:1px solid var(--line);
  display:flex;
  align-items:center;
  justify-content:flex-start;
  flex-wrap:wrap;
  gap:0;
  padding:4px 16px 0;
  position:sticky;
  top:42px;
  z-index:25;
  min-height:46px;
  box-sizing:border-box;
}
@media(max-width:768px){
  .orbit-bank-strip-row{padding:8px 12px 0;}
}
.orbit-bank-strip-tabs{display:flex;align-items:flex-end;gap:0;flex:1;min-width:0;}
.orbit-bank-strip-tab{
  display:inline-block;
  padding:9px 16px;
  font-size:13.5px;
  font-weight:600;
  color:#7a7163;
  border-bottom:2.5px solid transparent;
  cursor:pointer;
  white-space:nowrap;
  background:transparent;
  border-left:none;border-right:none;border-top:none;
  text-decoration:none;
  font-family:inherit;
  margin:0;
}
.orbit-bank-strip-tab:hover{color:var(--ink-2);}
.orbit-bank-strip-tab.active{color:var(--ink);border-bottom-color:var(--gold);}
`;

/**
 * Second header row: Bank Payments / History / Reconcile (Orbit-style tab strip only).
 */
export default function OrbitBankRegisterStrip() {
  const tabClass = (extra) => `orbit-bank-strip-tab ${extra || ""}`.trim();

  return (
    <div className="orbit-bank-strip-root">
      <style>{STRIP_CSS}</style>
      <div className="orbit-bank-strip-row">
        <nav className="orbit-bank-strip-tabs" aria-label="Bank register sections">
          <NavLink to="/orbit-erp/bill-payment" className={({ isActive }) => tabClass(isActive ? "active" : "")} end>
            Bank Payments
          </NavLink>
          <Link
            to="/bank-register"
            className={tabClass()}
            onClick={() => localStorage.setItem("activePaintTab", "bankregisterhistory")}
          >
            History
          </Link>
          <Link
            to="/bank-register"
            className={tabClass()}
            onClick={() => localStorage.setItem("activePaintTab", "bankregisterreconcile")}
          >
            Reconcile
          </Link>
        </nav>
      </div>
    </div>
  );
}
