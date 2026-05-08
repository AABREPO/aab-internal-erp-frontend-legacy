import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import CustomDateField from '../ExpensesEntry/CustomDateField';

const BANK_REGISTER_6_FONT = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@500;600;700&display=swap';

const BANK_REGISTER_6_CSS = "\n  :root{\n    --gold:#D6AB60; --gold-soft:#E6C68A; --gold-deep:#B8924B; --gold-darker:#9C7A3A;\n    --ink:#212121; --ink-2:#3a3a3a; --muted:#8a8275; --muted-2:#a59c8a;\n    --cream:#FBF7F0; --cream-2:#F5EFE3; --cream-3:#FAF4E8; --row-alt:#FAF4E8;\n    --line:#EADFC8; --line-soft:#f0e9d8;\n    --green:#2f9e6e; --green-soft:#3eb37f; --green-bg:#E0F1E5;\n    --red:#d23b3b; --red-bg:#FFE7E7;\n    --shadow: 0 1px 0 rgba(33,33,33,0.04), 0 8px 24px -12px rgba(33,33,33,0.10);\n  }\n  .bank-register-6-scope{background:#fff;color:var(--ink);font-family:'Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif;min-height:100%;overflow-y:auto;}\n  .font-display{font-family:'Fraunces',serif;letter-spacing:-0.01em;}\n  .text-gold{color:var(--gold);} .text-gold-deep{color:var(--gold-deep);}\n  .bg-gold{background:var(--gold);} .bg-cream{background:var(--cream);} .bg-cream-2{background:var(--cream-2);}\n  .ink{color:var(--ink);} .muted{color:var(--muted);}\n\n  /* Brand wordmark: logo + \"AA Builders\" single line */\n  .topbar > div:first-child{display:flex;align-items:center;gap:10px;}\n  .brand-text{font-family:'Fraunces',serif;font-weight:700;font-size:20px;color:var(--gold-deep);letter-spacing:0.01em;line-height:1;white-space:nowrap;}\n  @media(max-width:480px){\n    .brand-text{font-size:17px;}\n  }\n\n  .topbar{background:#fff;border-bottom:1px solid var(--line);padding:10px 18px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:30;}\n  .branch-select{background:#fff;border:1px solid var(--line);border-radius:8px;padding:7px 32px 7px 12px;font-size:13px;font-weight:600;color:var(--ink-2);appearance:none;-webkit-appearance:none;background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'><path d='M2 4l3 3 3-3' stroke='%238a8275' stroke-width='1.5' fill='none'/></svg>\");background-repeat:no-repeat;background-position:right 10px center;cursor:pointer;min-width:140px;}\n  .branch-select:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(214,171,96,0.15);}\n  .icon-btn{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink-2);cursor:pointer;transition:all .15s;}\n  .icon-btn:hover{background:var(--cream-2);}\n  .icon-btn.gold{color:var(--gold-deep);}\n  .avatar-mark{width:38px;height:38px;border-radius:50%;background:var(--cream-2);border:1.5px solid var(--gold);display:inline-flex;align-items:center;justify-content:center;}\n  .user-pill{display:inline-flex;align-items:center;gap:8px;padding:4px 10px 4px 4px;}\n\n  .tabs-row{background:var(--cream);border-bottom:1px solid var(--line);display:flex;align-items:flex-end;gap:0;padding:0 18px;position:sticky;top:58px;z-index:25;}\n  .tab{padding:12px 18px;font-size:14px;font-weight:600;color:#7a7163;border-bottom:2.5px solid transparent;cursor:pointer;white-space:nowrap;background:transparent;border-left:none;border-right:none;border-top:none;}\n  .tab.active{color:var(--ink);border-bottom-color:var(--gold);}\n  .tab:hover:not(.active){color:var(--ink-2);}\n  .tabs-balance{margin-left:auto;padding:12px 0;font-size:14px;font-weight:600;color:var(--ink);}\n  .tabs-balance .v{color:var(--green);font-weight:700;font-family:'Fraunces',serif;font-size:17px;letter-spacing:-0.01em;}\n\n  .shell{background:var(--cream);min-height:calc(100vh - 100px);padding:18px;}\n  @media(max-width:768px){.shell{padding:12px;}}\n\n  /* Action bar (date range + export) */\n  .action-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;}\n  .date-range-btn{background:#fff;border:1px solid var(--line);border-radius:10px;padding:8px 14px;display:inline-flex;align-items:center;gap:10px;cursor:pointer;font-size:13px;color:var(--ink-2);transition:all .15s;}\n  .date-range-btn:hover{border-color:var(--gold);background:var(--cream-2);}\n  .date-range-btn .lbl{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.04em;}\n  .date-range-btn .v{font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums;}\n  .export-btn{background:#fff;border:1px solid var(--line);border-radius:8px;padding:8px 12px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;font-weight:600;color:var(--ink-2);transition:all .15s;}\n  .export-btn:hover{background:var(--cream-2);}\n  .export-btn.pdf{color:#d23b3b;border-color:#fadcdc;}\n  .export-btn.excel{color:var(--green);border-color:#cce8d8;}\n  .recon-toggle{background:var(--cream-2);border:1px solid var(--gold);color:var(--gold-deep);border-radius:8px;padding:8px 12px;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}\n  .recon-toggle.active{background:var(--gold);color:#fff;}\n\n  /* Stat / account cards: enforce equal heights */\n  .stat-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px 14px;box-shadow:var(--shadow);display:flex;flex-direction:column;justify-content:space-between;min-width:0;min-height:88px;}\n  .stat-label{font-size:12.5px;font-weight:600;color:var(--ink);}\n  .stat-value{font-family:'Fraunces',serif;font-weight:600;color:var(--gold-deep);font-size:17px;font-variant-numeric:tabular-nums;letter-spacing:-0.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\n  .icon-chip{width:30px;height:30px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;}\n\n  /* Compact bank/account picker that matches stat-card height */\n  .acct-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:10px 14px;box-shadow:var(--shadow);display:flex;flex-direction:column;justify-content:center;gap:6px;min-height:88px;min-width:0;}\n  .acct-row{display:flex;align-items:center;gap:8px;min-width:0;}\n  .acct-row .lbl{font-size:10.5px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.04em;flex-shrink:0;width:48px;}\n  .acct-input{flex:1;min-width:0;background:transparent;border:none;border-bottom:1px solid var(--line-soft);padding:3px 0;font-size:13px;font-weight:600;color:var(--ink);appearance:none;-webkit-appearance:none;cursor:pointer;background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'><path d='M2 4l3 3 3-3' stroke='%238a8275' stroke-width='1.5' fill='none'/></svg>\");background-repeat:no-repeat;background-position:right 4px center;padding-right:18px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;}\n  .acct-input:focus{outline:none;border-bottom-color:var(--gold);}\n\n  /* Single-row layout from 768px and up: 5 cards, account ~1.5× wider than each stat card */\n  .acct-stat-grid{display:grid;grid-template-columns:1fr;gap:10px;}\n  @media(min-width:480px){\n    .acct-stat-grid{grid-template-columns:1fr 1fr;}\n  }\n  @media(min-width:768px){\n    .acct-stat-grid{grid-template-columns:1.5fr 1fr 1fr 1fr 1fr;gap:12px;}\n  }\n  @media(min-width:1280px){\n    .acct-stat-grid{gap:14px;}\n    .stat-card,.acct-card{padding:14px 16px;min-height:96px;}\n    .acct-row .lbl{font-size:11px;width:54px;}\n    .acct-input{font-size:13.5px;}\n    .stat-label{font-size:13px;}\n    .stat-value{font-size:18px;}\n    .icon-chip{width:34px;height:34px;border-radius:9px;}\n  }\n\n  .input{background:#fff;border:1px solid var(--line);border-radius:8px;padding:8px 12px;font-size:14px;width:100%;color:var(--ink);}\n  .input:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(214,171,96,0.15);}\n  .label-text{font-size:12px;font-weight:600;color:var(--muted);}\n\n  .ledger-card{background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden;display:flex;}\n  .ledger-card .accent{width:5px;background:var(--gold);flex-shrink:0;}\n  .ledger-card .body{flex:1;min-width:0;}\n\n  .ledger-table{width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0;}\n  .ledger-table th{font-size:12px;font-weight:700;color:var(--ink);text-align:left;padding:12px 10px;background:#fff;white-space:nowrap;border-bottom:1px solid var(--line);letter-spacing:0.005em;position:sticky;top:0;z-index:2;}\n  .ledger-table td{font-size:12.5px;color:var(--ink-2);padding:12px 10px;vertical-align:middle;border-top:1px solid var(--line-soft);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}\n  .ledger-table tbody tr:nth-child(even){background:var(--row-alt);}\n  .ledger-table tbody tr.matched{background:#F0F8F2 !important;}\n  .ledger-table tbody tr.matched td{color:#5d8a73;}\n  .num-cell{font-variant-numeric:tabular-nums;white-space:nowrap;}\n  .truncate-cell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\n\n  .table-scroll{max-height:560px;overflow-y:auto;overflow-x:auto;}\n  .table-scroll::-webkit-scrollbar{width:8px;height:8px;}\n  .table-scroll::-webkit-scrollbar-thumb{background:var(--line);border-radius:8px;}\n  .table-scroll::-webkit-scrollbar-thumb:hover{background:var(--gold-soft);}\n  .table-scroll::-webkit-scrollbar-track{background:transparent;}\n  @media(max-width:1279px) and (min-width:1024px){\n    .expenses-table-wrap .ledger-table{min-width:880px;}\n  }\n\n  .chip{font-size:11px;font-weight:600;padding:3px 8px;border-radius:999px;display:inline-block;}\n  .chip-tenant{background:#FFF3D9;color:#8a6a1f;}\n  .chip-contractor{background:#E6F0FF;color:#2a5fb0;}\n  .chip-vendor{background:#F0E6FF;color:#6a3aaf;}\n  .chip-other{background:#EFEFEF;color:#555;}\n  .chip-mode{background:var(--cream-2);color:var(--ink-2);}\n  .chip-matched{background:var(--green-bg);color:var(--green);}\n\n  /* Filter chips */\n  .filter-chips{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:2px;}\n  .fchip{display:inline-flex;align-items:center;gap:6px;padding:4px 4px 4px 10px;background:var(--cream-2);border:1px solid var(--gold-soft);color:var(--ink);font-size:12px;font-weight:600;border-radius:999px;}\n  .fchip .k{color:var(--muted);font-weight:500;font-size:11px;}\n  .fchip .x{width:18px;height:18px;border-radius:50%;background:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted-2);transition:all .15s;border:1px solid var(--line);}\n  .fchip .x:hover{background:var(--red-bg);color:var(--red);border-color:#fadcdc;}\n  .fchip-clear{background:transparent;border:none;color:var(--red);font-size:11.5px;font-weight:600;cursor:pointer;padding:4px 8px;border-radius:6px;}\n  .fchip-clear:hover{background:var(--red-bg);}\n\n  .act-cell{display:flex;align-items:center;justify-content:flex-start;gap:7px;}\n  .act-cell button{display:inline-flex;align-items:center;justify-content:center;cursor:pointer;background:transparent;border:none;padding:0;}\n  .act-cell button:hover{opacity:0.75;}\n\n  .check-box{width:18px;height:18px;border:1.5px solid var(--line);border-radius:4px;background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;position:relative;}\n  .check-box.checked{background:var(--green);border-color:var(--green);}\n  .check-box.partial{background:var(--green);border-color:var(--green);}\n  .check-box .partial-mark{display:block;width:10px;height:2px;background:#fff;border-radius:1px;}\n  .check-box:hover{border-color:var(--green);}\n\n  /* Sortable headers */\n  .ledger-table th[class*=\"sort\"]:hover, .ledger-table th[style*=\"cursor\"]:hover{background:var(--cream-2);}\n  .ledger-table th.sort-active{color:var(--gold-deep);background:var(--cream-3);}\n\n  .btn-add{border:1px solid var(--green);color:var(--green);font-weight:600;border-radius:8px;padding:7px 12px;font-size:13px;background:#fff;transition:all .15s;cursor:pointer;}\n  .btn-add:hover{background:#eafaf2;}\n  .btn-ghost{border:1px solid var(--line);background:#fff;border-radius:8px;padding:7px 10px;color:var(--ink-2);cursor:pointer;font-size:13px;font-weight:600;}\n  .btn-ghost:hover{background:var(--cream);}\n\n  .filter-btn{width:36px;height:36px;border:1px solid var(--gold);border-radius:8px;background:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;position:relative;}\n  .filter-btn:hover{background:var(--cream-2);}\n  .filter-btn .dot{position:absolute;top:-3px;right:-3px;background:var(--gold);color:#fff;font-size:10px;font-weight:700;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1.5px solid #fff;}\n\n  .stat-inline{font-size:13px;font-weight:600;color:var(--ink-2);}\n  .stat-inline .v{color:var(--gold-deep);font-weight:700;font-family:'Fraunces',serif;font-size:16px;}\n  .stat-inline.income .v{color:var(--green);}\n\n  .mob-card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin-bottom:10px;position:relative;overflow:hidden;}\n  .mob-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--gold);}\n  .mob-card.matched::before{background:var(--green);}\n  @media(max-width:1023px){\n    .desk-table{display:none;}\n    .mob-cards{display:block;}\n  }\n  @media(min-width:1024px){\n    .desk-table{display:block;}\n    .mob-cards{display:none;}\n  }\n\n  .modal-bg{position:fixed;inset:0;background:rgba(33,33,33,0.55);backdrop-filter:blur(2px);z-index:50;display:flex;align-items:flex-end;justify-content:center;}\n  @media (min-width:640px){.modal-bg{align-items:center;}}\n  .modal{background:#fff;width:100%;max-width:520px;border-radius:18px 18px 0 0;padding:20px;max-height:92vh;overflow-y:auto;}\n  @media (min-width:640px){.modal{border-radius:18px;}}\n\n  .toast{position:fixed;left:50%;transform:translateX(-50%);bottom:24px;background:var(--ink);color:#fff;padding:10px 18px;border-radius:999px;font-size:13px;z-index:70;box-shadow:0 8px 24px -8px rgba(0,0,0,.4);}\n  .badge-build{position:fixed;bottom:10px;right:12px;background:rgba(33,33,33,0.85);color:#fff;font-size:10px;letter-spacing:.05em;padding:4px 8px;border-radius:6px;z-index:60;font-weight:600;}\n\n  .side-col{transition:transform .25s ease;}\n  @media(max-width:1023px){\n    .side-col{position:fixed;top:0;right:0;bottom:0;width:90%;max-width:380px;background:var(--cream);z-index:40;overflow-y:auto;padding:18px;transform:translateX(100%);box-shadow:-12px 0 32px -8px rgba(0,0,0,0.18);}\n    .side-col.open{transform:translateX(0);}\n  }\n  .side-overlay{display:none;}\n  @media(max-width:1023px){\n    .side-overlay.open{display:block;position:fixed;inset:0;background:rgba(33,33,33,0.4);z-index:35;}\n  }\n  .side-fab{display:none;position:fixed;right:16px;bottom:16px;background:var(--gold);color:#fff;border-radius:999px;padding:12px 18px;font-weight:600;font-size:13px;box-shadow:0 8px 24px -6px rgba(214,171,96,0.55);z-index:30;border:none;cursor:pointer;align-items:center;gap:8px;}\n  @media(max-width:1023px){.side-fab{display:flex;}}\n\n  @media(max-width:768px){\n    .tabs-row{overflow-x:auto;-webkit-overflow-scrolling:touch;padding:0 12px;}\n    .tabs-row::-webkit-scrollbar{display:none;}\n    .tab{padding:12px 12px;font-size:13px;}\n    .tabs-balance{padding:8px 0;font-size:12px;}\n    .tabs-balance .v{font-size:14px;}\n    .topbar{padding:10px 12px;gap:8px;}\n    /* keep wordmark visible on mobile */\n    .topbar .desktop-only{display:none;}\n  }\n\n  .bank-register-6-scope .tabs-row { top: 0; }\n  @media(max-width:768px){\n    .bank-register-6-scope .tabs-row { top: 0; }\n  }\n";


const BUILD = "3.5";

const I = {
  Logo: ({size=28}) => (
    <img src="data:image/png;base64,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" width={size} height={size} alt="AA Builders" style={{display:"block",objectFit:"contain"}}/>
  ),
  Download: ()=> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4v12M6 11l6 6 6-6M5 21h14"/></svg>,
  Edit: ()=> <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#2f9e6e" strokeWidth="1.8"><path d="M14 4l6 6-10 10H4v-6z"/></svg>,
  EditPad: ()=> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2f9e6e" strokeWidth="1.6"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M14 4l4 4-7 7H7v-4z" fill="#2f9e6e" fillOpacity="0.08"/></svg>,
  Trash: ()=> <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#d23b3b" strokeWidth="1.8"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg>,
  Filter: ()=> <svg viewBox="0 0 24 24" width="16" height="16" fill="#D6AB60"><path d="M3 4h18l-7 8v7l-4-2v-5z"/></svg>,
  Plus: ()=> <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>,
  Close: ()=> <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5l14 14M19 5L5 19"/></svg>,
  X: ()=> <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 5l14 14M19 5L5 19"/></svg>,
  SignOut: ()=> <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l-5-5 5-5M5 12h11"/></svg>,
  UPI: ()=> <svg viewBox="0 0 24 24" width="18" height="18" fill="#D6AB60"><path d="M14 2L4 14h6l-2 8 10-12h-6z"/></svg>,
  Cheque: ()=> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#D6AB60" strokeWidth="1.8"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h10M7 14h6"/></svg>,
  NetBank: ()=> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2f9e6e" strokeWidth="1.8"><path d="M3 10 12 4l9 6"/><path d="M5 10v8M19 10v8"/><path d="M3 20h18"/></svg>,
  Wallet: ()=> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#7c3aed" strokeWidth="1.8"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12h3"/></svg>,
  Cal: ()=> <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  Pdf: ()=> <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v5h5"/><text x="8" y="17" fontSize="5" fontWeight="700" fill="#d23b3b" fontFamily="sans-serif" stroke="none">PDF</text></svg>,
  Excel: ()=> <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v5h5"/><path d="M9 12l5 6M14 12l-5 6"/></svg>,
  Coin: ()=> <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="1.9"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>,
  Check: ()=> <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" strokeWidth="3"><path d="M5 12l5 5L20 7"/></svg>,
  Link: ()=> <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M10 14a4 4 0 015.66 0l3 3a4 4 0 11-5.66 5.66"/><path d="M14 10a4 4 0 01-5.66 0l-3-3a4 4 0 015.66-5.66"/></svg>,
};

const fmtINR = (n) => Number(n).toLocaleString("en-IN", {minimumFractionDigits:0, maximumFractionDigits:0});
const fmtINR2 = (n) => Number(n).toLocaleString("en-IN", {minimumFractionDigits:2, maximumFractionDigits:2});

// Date utilities — work with DD/MM/YYYY strings
const parseDDMMYYYY = (s) => {
  if(!s) return null;
  const [d,m,y] = s.split("/");
  return new Date(+y, +m-1, +d);
};
const toISO = (date) => date.toISOString().slice(0,10);
const fromISO = (iso) => {
  if(!iso) return "";
  const [y,m,d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const ddmmToISO = (s) => {
  if(!s) return "";
  const [d,m,y] = s.split("/");
  if(!y) return "";
  return `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
};
const fmtRangeShort = (fromIso, toIso) => {
  const f = (iso)=>{ const [y,m,d]=iso.split("-"); return `${d}-${m}-${y}`; };
  return `${f(fromIso)} → ${f(toIso)}`;
};

const BRANCHES = [
  {id:"srivilliputtur", name:"Srivilliputtur"},
  {id:"madurai", name:"Madurai"},
];
const BANKS = [
  {name:"State Bank of India", branch:"Srivilliputtur", accounts:["50100247895621 — Current", "50100789456123 — OD Account"]},
  {name:"HDFC Bank", branch:"Srivilliputtur", accounts:["00882560004421 — Current"]},
  {name:"ICICI Bank", branch:"Madurai", accounts:["654301537780 — Current"]},
  {name:"Axis Bank", branch:"Madurai", accounts:["918020047822102 — Current"]},
  {name:"Kotak Mahindra", branch:"Madurai", accounts:["7411455125512 — Current"]},
];
const MODES = ["G-Pay","PhonePe","Paytm","Net Banking","Cheque","Cash","RTGS","NEFT"];
const PARTY_TYPES = ["Tenant","Contractor","Vendor","Employee","Other"];
const PARTIES = [
  "Welding Perumal","Sivan Centring","Karuppiah Centering","Mani Centring","Lingam Centring",
  "Selvam Mason","Kannan Mason","Karthick Mason","Murugan Centring","Santhanam Carpenter",
  "Moorthy Electrician","Bismi Shutters","Durai Tiles","Anand Tiles","Sika India","Fosroc India",
  "Dr. Fixit Materials","Kerakoll India","Bayer Crop","Local Shop","Gym Manikandan","Hari Plumber",
  "TNEB Office","Indane Gas Agency","Velavan Stationery"
];
const PURPOSES = [
  "Rent Payment","Weekly Payment","Bill Payment","Project Advance","Bill Settlement",
  "Wage Advance","Material","Claim","Transport","Utilities","Site Maintenance","Tea & Refreshments","Other"
];
const PROJECTS = [
  "AA Office - Kappalur, Madurai","Row vilas - kappalur, Madurai","AA plot - Paraipatti",
  "Malli Complex","Anandam Gardens","Velavan Hyper City","Surya Residences","Lakshmi Heights",
  "Karthik VPM - Thiruvanamalai","Mahendran - Meenakshipuram","Saradha - Malli","Asai Thambi - Ashok Nagar"
];

// Test data — primarily in Apr 2026 (the default range) with a few in Mar/May to demo date filter.
const SEED_EXPENSES = [
  // SBI Current 50100247895621 — most active account
  {id:1, date:"03/04/2026", account:"50100247895621 — Current", project:"AA Office - Kappalur, Madurai", party:"Local Shop", partyType:"Tenant", type:"Rent Payment", amount:600, mode:"G-Pay", chequeNo:"-", chequeDate:"-", matched:true},
  {id:2, date:"04/04/2026", account:"50100247895621 — Current", project:"Row vilas - kappalur, Madurai", party:"Sivan Centring", partyType:"Contractor", type:"Weekly Payment", amount:6000, mode:"Net Banking", chequeNo:"-", chequeDate:"-", matched:true},
  {id:3, date:"05/04/2026", account:"50100247895621 — Current", project:"AA Office - Kappalur, Madurai", party:"Welding Perumal", partyType:"Contractor", type:"Weekly Payment", amount:1600, mode:"Cheque", chequeNo:"545467", chequeDate:"06/04/2026", matched:false},
  {id:4, date:"07/04/2026", account:"50100247895621 — Current", project:"AA plot - Paraipatti", party:"Welding Perumal", partyType:"Contractor", type:"Wage Advance", amount:4000, mode:"Net Banking", chequeNo:"-", chequeDate:"-", matched:true},
  {id:5, date:"08/04/2026", account:"50100247895621 — Current", project:"Malli Complex", party:"Gym Manikandan", partyType:"Vendor", type:"Weekly Payment", amount:2600, mode:"G-Pay", chequeNo:"-", chequeDate:"-", matched:true},
  {id:6, date:"10/04/2026", account:"50100247895621 — Current", project:"Anandam Gardens", party:"Welding Perumal", partyType:"Contractor", type:"Weekly Payment", amount:5000, mode:"Cheque", chequeNo:"653488", chequeDate:"12/04/2026", matched:false},
  {id:7, date:"11/04/2026", account:"50100247895621 — Current", project:"Velavan Hyper City", party:"Sika India", partyType:"Vendor", type:"Material", amount:18000, mode:"Net Banking", chequeNo:"-", chequeDate:"-", matched:true},
  {id:8, date:"12/04/2026", account:"50100247895621 — Current", project:"Surya Residences", party:"Bismi Shutters", partyType:"Vendor", type:"Material", amount:42000, mode:"RTGS", chequeNo:"-", chequeDate:"-", matched:false},
  {id:9, date:"14/04/2026", account:"50100247895621 — Current", project:"Velavan Hyper City", party:"Fosroc India", partyType:"Vendor", type:"Material", amount:67500, mode:"NEFT", chequeNo:"-", chequeDate:"-", matched:true},
  {id:10, date:"15/04/2026", account:"50100247895621 — Current", project:"Lakshmi Heights", party:"Karthick Mason", partyType:"Contractor", type:"Weekly Payment", amount:8500, mode:"G-Pay", chequeNo:"-", chequeDate:"-", matched:false},
  {id:11, date:"17/04/2026", account:"50100247895621 — Current", project:"AA Office - Kappalur, Madurai", party:"TNEB Office", partyType:"Other", type:"Utilities", amount:12450, mode:"Net Banking", chequeNo:"-", chequeDate:"-", matched:true},
  {id:12, date:"18/04/2026", account:"50100247895621 — Current", project:"Karthik VPM - Thiruvanamalai", party:"Selvam Mason", partyType:"Contractor", type:"Project Advance", amount:30000, mode:"Cheque", chequeNo:"545468", chequeDate:"19/04/2026", matched:false},
  {id:13, date:"20/04/2026", account:"50100247895621 — Current", project:"Mahendran - Meenakshipuram", party:"Anand Tiles", partyType:"Vendor", type:"Bill Payment", amount:34800, mode:"Cheque", chequeNo:"545469", chequeDate:"21/04/2026", matched:true},
  {id:14, date:"22/04/2026", account:"50100247895621 — Current", project:"Saradha - Malli", party:"Mani Centring", partyType:"Contractor", type:"Bill Settlement", amount:96000, mode:"RTGS", chequeNo:"-", chequeDate:"-", matched:false},
  {id:15, date:"24/04/2026", account:"50100247895621 — Current", project:"AA plot - Paraipatti", party:"Hari Plumber", partyType:"Contractor", type:"Bill Payment", amount:5400, mode:"PhonePe", chequeNo:"-", chequeDate:"-", matched:true},
  {id:16, date:"26/04/2026", account:"50100247895621 — Current", project:"Asai Thambi - Ashok Nagar", party:"Lingam Centring", partyType:"Contractor", type:"Project Advance", amount:30000, mode:"NEFT", chequeNo:"-", chequeDate:"-", matched:false},
  {id:17, date:"28/04/2026", account:"50100247895621 — Current", project:"AA Office - Kappalur, Madurai", party:"Indane Gas Agency", partyType:"Vendor", type:"Utilities", amount:1850, mode:"G-Pay", chequeNo:"-", chequeDate:"-", matched:true},
  {id:18, date:"30/04/2026", account:"50100247895621 — Current", project:"Surya Residences", party:"Moorthy Electrician", partyType:"Contractor", type:"Bill Payment", amount:18350, mode:"Net Banking", chequeNo:"-", chequeDate:"-", matched:false},
  // SBI OD Account
  {id:19, date:"05/04/2026", account:"50100789456123 — OD Account", project:"Velavan Hyper City", party:"Kerakoll India", partyType:"Vendor", type:"Material", amount:125000, mode:"RTGS", chequeNo:"-", chequeDate:"-", matched:true},
  {id:20, date:"12/04/2026", account:"50100789456123 — OD Account", project:"Velavan Hyper City", party:"Bayer Crop", partyType:"Vendor", type:"Material", amount:88500, mode:"NEFT", chequeNo:"-", chequeDate:"-", matched:false},
  {id:21, date:"19/04/2026", account:"50100789456123 — OD Account", project:"Surya Residences", party:"Dr. Fixit Materials", partyType:"Vendor", type:"Material", amount:54200, mode:"Cheque", chequeNo:"771201", chequeDate:"20/04/2026", matched:true},
  // HDFC
  {id:22, date:"08/04/2026", account:"00882560004421 — Current", project:"Anandam Gardens", party:"Karuppiah Centering", partyType:"Contractor", type:"Weekly Payment", amount:19000, mode:"Net Banking", chequeNo:"-", chequeDate:"-", matched:true},
  {id:23, date:"15/04/2026", account:"00882560004421 — Current", project:"Lakshmi Heights", party:"Murugan Centring", partyType:"Contractor", type:"Bill Payment", amount:44900, mode:"NEFT", chequeNo:"-", chequeDate:"-", matched:false},
  {id:24, date:"23/04/2026", account:"00882560004421 — Current", project:"Karthik VPM - Thiruvanamalai", party:"Durai Tiles", partyType:"Vendor", type:"Material", amount:30000, mode:"Cheque", chequeNo:"441201", chequeDate:"25/04/2026", matched:false},
  // ICICI Madurai
  {id:25, date:"06/04/2026", account:"654301537780 — Current", project:"Velavan Hyper City", party:"Santhanam Carpenter", partyType:"Contractor", type:"Project Advance", amount:15000, mode:"G-Pay", chequeNo:"-", chequeDate:"-", matched:true},
  {id:26, date:"14/04/2026", account:"654301537780 — Current", project:"Mahendran - Meenakshipuram", party:"Kannan Mason", partyType:"Contractor", type:"Weekly Payment", amount:5860, mode:"Net Banking", chequeNo:"-", chequeDate:"-", matched:false},
  {id:27, date:"21/04/2026", account:"654301537780 — Current", project:"AA Office - Kappalur, Madurai", party:"Velavan Stationery", partyType:"Vendor", type:"Site Maintenance", amount:3200, mode:"PhonePe", chequeNo:"-", chequeDate:"-", matched:true},
  // Axis Madurai
  {id:28, date:"11/04/2026", account:"918020047822102 — Current", project:"Saradha - Malli", party:"Sika India", partyType:"Vendor", type:"Material", amount:22500, mode:"NEFT", chequeNo:"-", chequeDate:"-", matched:true},
  {id:29, date:"25/04/2026", account:"918020047822102 — Current", project:"Asai Thambi - Ashok Nagar", party:"Welding Perumal", partyType:"Contractor", type:"Weekly Payment", amount:7200, mode:"G-Pay", chequeNo:"-", chequeDate:"-", matched:false},
  // Kotak Madurai
  {id:30, date:"16/04/2026", account:"7411455125512 — Current", project:"Lakshmi Heights", party:"Selvam Mason", partyType:"Contractor", type:"Project Advance", amount:25000, mode:"Net Banking", chequeNo:"-", chequeDate:"-", matched:true},
  // Outside default range — to test date filter (March + May)
  {id:31, date:"15/03/2026", account:"50100247895621 — Current", project:"AA Office - Kappalur, Madurai", party:"Local Shop", partyType:"Tenant", type:"Rent Payment", amount:600, mode:"G-Pay", chequeNo:"-", chequeDate:"-", matched:true},
  {id:32, date:"02/05/2026", account:"50100247895621 — Current", project:"AA Office - Kappalur, Madurai", party:"Local Shop", partyType:"Tenant", type:"Rent Payment", amount:600, mode:"G-Pay", chequeNo:"-", chequeDate:"-", matched:false},
];
const SEED_INCOME = [
  // SBI Current
  {id:101, date:"02/04/2026", account:"50100247895621 — Current", amount:200000, matched:true},
  {id:102, date:"06/04/2026", account:"50100247895621 — Current", amount:75000, matched:true},
  {id:103, date:"09/04/2026", account:"50100247895621 — Current", amount:46320, matched:false},
  {id:104, date:"13/04/2026", account:"50100247895621 — Current", amount:150000, matched:true},
  {id:105, date:"16/04/2026", account:"50100247895621 — Current", amount:2000, matched:true},
  {id:106, date:"19/04/2026", account:"50100247895621 — Current", amount:88000, matched:false},
  {id:107, date:"23/04/2026", account:"50100247895621 — Current", amount:120000, matched:true},
  {id:108, date:"27/04/2026", account:"50100247895621 — Current", amount:35000, matched:false},
  {id:109, date:"29/04/2026", account:"50100247895621 — Current", amount:60000, matched:true},
  // SBI OD
  {id:110, date:"04/04/2026", account:"50100789456123 — OD Account", amount:300000, matched:true},
  {id:111, date:"18/04/2026", account:"50100789456123 — OD Account", amount:100000, matched:false},
  // HDFC
  {id:112, date:"07/04/2026", account:"00882560004421 — Current", amount:55000, matched:true},
  {id:113, date:"22/04/2026", account:"00882560004421 — Current", amount:40000, matched:false},
  // ICICI
  {id:114, date:"10/04/2026", account:"654301537780 — Current", amount:25000, matched:true},
  {id:115, date:"24/04/2026", account:"654301537780 — Current", amount:18500, matched:false},
  // Axis
  {id:116, date:"15/04/2026", account:"918020047822102 — Current", amount:32000, matched:true},
  // Kotak
  {id:117, date:"20/04/2026", account:"7411455125512 — Current", amount:50000, matched:true},
  // Outside range
  {id:118, date:"20/03/2026", account:"50100247895621 — Current", amount:80000, matched:true},
  {id:119, date:"03/05/2026", account:"50100247895621 — Current", amount:42000, matched:false},
];

const StatCard = ({icon, tone, label, value}) => (
  <div className="stat-card">
    <div className="flex items-start justify-between gap-2">
      <div className="stat-label">{label}</div>
      <div className="icon-chip" style={{background:tone}}>{icon}</div>
    </div>
    <div className="stat-value truncate">₹{value}</div>
  </div>
);

// Compact bank/account picker that matches the height of stat cards
const AccountPicker = ({banks, bank, setBank, account, setAccount}) => {
  const accounts = banks.find(b=>b.name===bank)?.accounts || [];
  const firstAccountValue =
    accounts.length === 0
      ? ""
      : (typeof accounts[0] === "string" ? accounts[0] : (accounts[0]?.value || ""));
  return (
    <div className="acct-card">
      <div className="acct-row">
        <div className="lbl text-left">Bank</div>
        <select
          value={bank}
          onChange={e=>{
            const nextBank = e.target.value;
            setBank(nextBank);
            const nextAccounts = banks.find(b=>b.name===nextBank)?.accounts || [];
            const nextFirst =
              nextAccounts.length === 0
                ? ""
                : (typeof nextAccounts[0] === "string" ? nextAccounts[0] : (nextAccounts[0]?.value || ""));
            setAccount(nextFirst);
          }}
          className="acct-input"
        >
          {banks.length===0 && <option value="">No banks for this branch</option>}
          {banks.map(b=> <option key={b.name}>{b.name}</option>)}
        </select>
      </div>
      <div className="acct-row">
        <div className="lbl text-left">Account</div>
        <select value={account} onChange={e=>setAccount(e.target.value)} className="acct-input">
          <option value="">Select account...</option>
          {accounts.map(a=>{
            const value = typeof a === "string" ? a : (a?.value || "");
            const label = typeof a === "string" ? a : (a?.label || a?.value || "");
            return <option key={value} value={value}>{label}</option>;
          })}
        </select>
      </div>
    </div>
  );
};

const PartyChip = ({type}) => {
  const cls = type==="Tenant"?"chip-tenant":type==="Contractor"?"chip-contractor":type==="Vendor"?"chip-vendor":"chip-other";
  return <span className={`chip ${cls}`}>{type}</span>;
};

// ---------- Date Range Picker (modal) ----------
const DateRangeModal = ({open, value, onClose, onApply}) => {
  const [from,setFrom] = useState(value?.from || "");
  const [to,setTo] = useState(value?.to || "");
  useEffect(()=>{ setFrom(value?.from||""); setTo(value?.to||""); },[value, open]);
  if(!open) return null;
  const presets = [
    {label:"This month", calc:()=>{ const d=new Date(); return [new Date(d.getFullYear(),d.getMonth(),1), new Date()]; }},
    {label:"Last month", calc:()=>{ const d=new Date(); return [new Date(d.getFullYear(),d.getMonth()-1,1), new Date(d.getFullYear(),d.getMonth(),0)]; }},
    {label:"Last 30 days", calc:()=>{ const t=new Date(); const f=new Date(); f.setDate(f.getDate()-30); return [f,t]; }},
    {label:"This FY (Apr–Mar)", calc:()=>{ const d=new Date(); const y=d.getMonth()<3?d.getFullYear()-1:d.getFullYear(); return [new Date(y,3,1), new Date(y+1,2,31)]; }},
  ];
  const applyPreset = (p) => { const [f,t]=p.calc(); setFrom(toISO(f)); setTo(toISO(t)); };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal text-left" style={{overflow:"visible"}} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl ink">Select Date Range</h3>
          <button onClick={onClose} className="ink"><I.Close/></button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="label-text mb-1">From</div>
            <CustomDateField value={from} onChange={(v)=>setFrom(v||"")} placeholder="dd-mm-yyyy" alwaysOpenBelow/>
          </div>
          <div>
            <div className="label-text mb-1">To</div>
            <CustomDateField value={to} onChange={(v)=>setTo(v||"")} placeholder="dd-mm-yyyy" alwaysOpenBelow/>
          </div>
        </div>
        <div className="label-text mb-2">Quick presets</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map(p=> <button key={p.label} className="btn-ghost" onClick={()=>applyPreset(p)}>{p.label}</button>)}
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-add" onClick={()=>{ if(!from||!to) return; onApply({from,to}); onClose(); }}>Apply Range</button>
        </div>
      </div>
    </div>
  );
};

// ---------- Filter Modal ----------
const FilterModal = ({open, value, onClose, onApply, onReset}) => {
  const [f,setF] = useState(value);
  useEffect(()=>{ setF(value); }, [value, open]);
  if(!open) return null;
  const set = (k,v)=>setF(s=>({...s,[k]:v}));
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl ink">Filter Expenses</h3>
          <button onClick={onClose} className="ink"><I.Close/></button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="col-span-2"><div className="label-text mb-1">Search</div><input className="input" value={f.q} onChange={e=>set("q",e.target.value)} placeholder="Project, party, type..."/></div>
          <div><div className="label-text mb-1">Party Type</div>
            <select className="input" value={f.partyType} onChange={e=>set("partyType",e.target.value)}><option value="">All</option>{PARTY_TYPES.map(p=><option key={p}>{p}</option>)}</select>
          </div>
          <div><div className="label-text mb-1">Payment Mode</div>
            <select className="input" value={f.mode} onChange={e=>set("mode",e.target.value)}><option value="">All</option>{MODES.map(m=><option key={m}>{m}</option>)}</select>
          </div>
          <div><div className="label-text mb-1">Match Status</div>
            <select className="input" value={f.matched} onChange={e=>set("matched",e.target.value)}><option value="">All</option><option value="yes">Reconciled</option><option value="no">Unreconciled</option></select>
          </div>
          <div><div className="label-text mb-1">Min Amount</div><input className="input num-cell" type="number" value={f.min} onChange={e=>set("min",e.target.value)}/></div>
          <div><div className="label-text mb-1">Max Amount</div><input className="input num-cell" type="number" value={f.max} onChange={e=>set("max",e.target.value)}/></div>
        </div>
        <div className="flex justify-between gap-2 mt-5">
          <button className="btn-ghost" onClick={()=>{onReset(); onClose();}}>Reset</button>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-add" onClick={()=>{onApply(f); onClose();}}>Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Filter Chips ----------
const FilterChips = ({filter, onClear, onClearAll}) => {
  const chips = [];
  if(filter.date) chips.push({k:"Date", v:fromISO(filter.date), key:"date"});
  if(filter.project) chips.push({k:"Project", v:filter.project, key:"project"});
  if(filter.party) chips.push({k:"Party", v:filter.party, key:"party"});
  if(filter.purpose) chips.push({k:"Purpose", v:filter.purpose, key:"purpose"});
  if(filter.cheque) chips.push({k:"Cheque", v:filter.cheque, key:"cheque"});
  if(filter.partyType) chips.push({k:"Type", v:filter.partyType, key:"partyType"});
  if(filter.mode) chips.push({k:"Mode", v:filter.mode, key:"mode"});
  if(filter.matched) chips.push({k:"Status", v:filter.matched==="yes"?"Reconciled":"Unreconciled", key:"matched"});
  if(filter.amount) chips.push({k:"Amount", v:filter.amount, key:"amount"});
  if(chips.length===0) return null;
  return (
    <div className="filter-chips">
      {chips.map(c=>(
        <span key={c.key} className="fchip">
          <span className="k">{c.k}:</span>
          <span>{c.v}</span>
          <button className="x" onClick={()=>onClear(c.key)} title={`Clear ${c.k}`}><I.X/></button>
        </span>
      ))}
      {chips.length>1 && <button className="fchip-clear" onClick={onClearAll}>Clear all</button>}
    </div>
  );
};

// ---------- Expense Register ----------
const SortIcon = ({dir}) => {
  if(!dir) return <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#a59c8a" strokeWidth="2" style={{flexShrink:0,opacity:0.5}}><path d="M8 9l4-4 4 4M8 15l4 4 4-4"/></svg>;
  return dir==="asc"
    ? <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#B8924B" strokeWidth="2.5" style={{flexShrink:0}}><path d="M6 14l6-6 6 6"/></svg>
    : <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#B8924B" strokeWidth="2.5" style={{flexShrink:0}}><path d="M6 10l6 6 6-6"/></svg>;
};

const SortableTh = ({label, sortKey, sortBy, sortDir, onSort, align, noBottomBorder}) => {
  const active = sortBy === sortKey;
  return (
    <th
      onClick={()=>onSort(sortKey)}
      style={{cursor:"pointer", userSelect:"none", borderBottom: noBottomBorder ? "0" : undefined}}
      className={active?"sort-active":""}
    >
      <span style={{display:"inline-flex",alignItems:"center",gap:4, justifyContent:align==="right"?"flex-end":"flex-start", width:"100%"}}>
        {align==="right" && <SortIcon dir={active?sortDir:null}/>}
        <span>{label}</span>
        {align!=="right" && <SortIcon dir={active?sortDir:null}/>}
      </span>
    </th>
  );
};

const ExpenseRegister = ({rows, total, onAdd, onEdit, onDelete, onFilter, onToggleMatch, onToggleAll, filter, onSetFilter, onClearFilter, onClearAll, activeFilterCount, reconcileMode, filterOpen, allRowsForFilters}) => {
  const [sortBy,setSortBy] = useState("");
  const [sortDir,setSortDir] = useState("asc");

  const filterRows = allRowsForFilters || rows;
  const dateFilterISO = filter.date || "";
  const unique = (arr) =>
    Array.from(
      new Set(
        arr
          .map((v) => String(v ?? "").trim())
          .filter((v) => Boolean(v) && v !== "-")
      )
    );
  const projectOptions = useMemo(()=> unique(filterRows.map(r=>r.project)).sort(), [filterRows]);
  const partyOptions = useMemo(()=> unique(filterRows.map(r=>r.party)).sort(), [filterRows]);
  const purposeOptions = useMemo(()=> unique(filterRows.map(r=>r.type)).sort(), [filterRows]);
  const chequeOptions = useMemo(()=> unique(filterRows.map(r=>r.chequeNo).filter(v=>v && v !== "-")).sort(), [filterRows]);
  const partyTypeOptions = useMemo(()=> unique(filterRows.map(r=>r.partyType)).sort(), [filterRows]);
  const modeOptions = useMemo(()=> unique(filterRows.map(r=>r.mode)).sort(), [filterRows]);
  const selectStyles = useMemo(() => ({
    control: (base) => ({
      ...base,
      minHeight: 45,
      height: 45,
      borderRadius: 8,
      borderColor: "var(--line)",
      boxShadow: "none",
      backgroundColor: "#fff",
      textAlign: "left",
      fontWeight: 400,
    }),
    valueContainer: (base) => ({ ...base, padding: "0 8px" }),
    input: (base) => ({ ...base, margin: 0, padding: 0, fontWeight: 400, fontSize: 13 }),
    indicatorsContainer: (base) => ({ ...base, height: 45 }),
    dropdownIndicator: (base) => ({ ...base, padding: 6 }),
    clearIndicator: (base) => ({ ...base, padding: 6 }),
    menu: (base) => ({ ...base, zIndex: 80 }),
    option: (base) => ({ ...base, fontSize: 13, textAlign: "left" }),
    placeholder: (base) => ({ ...base, fontSize: 13, fontWeight: 400, color: "var(--ink-2)" }),
    singleValue: (base) => ({ ...base, fontSize: 13, fontWeight: 400, color: "var(--ink-2)", textAlign: "left" }),
    menuList: (base) => ({
      ...base,
      textAlign: "left",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      "::-webkit-scrollbar": { display: "none" },
    }),
  }), []);
  const toSelectOptions = (arr) => arr.map((v) => ({ value: v, label: v }));
  const getSelected = (value) => (value ? { value, label: value } : null);

  const handleSort = (key) => {
    if(sortBy===key){
      setSortDir(d => d==="asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const sortedRows = useMemo(()=>{
    if(!sortBy) return rows;
    const dateVal = (s) => { if(!s||s==="-") return 0; const [d,m,y]=s.split("/"); return new Date(+y,+m-1,+d).getTime(); };
    const get = (r) => {
      if(sortBy==="date" || sortBy==="chequeDate") return dateVal(r[sortBy]);
      if(sortBy==="amount") return r.amount;
      if(sortBy==="matched") return r.matched ? 1 : 0;
      if(sortBy==="chequeNo") return r.chequeNo==="-" ? "" : r.chequeNo;
      const v = r[sortBy];
      return typeof v === "string" ? v.toLowerCase() : v;
    };
    const copy = [...rows];
    copy.sort((a,b)=>{
      const va = get(a), vb = get(b);
      if(va < vb) return sortDir==="asc" ? -1 : 1;
      if(va > vb) return sortDir==="asc" ? 1 : -1;
      return 0;
    });
    return copy;
  },[rows,sortBy,sortDir]);

  const allMatched = sortedRows.length>0 && sortedRows.every(r=>r.matched);
  const someMatched = sortedRows.some(r=>r.matched) && !allMatched;

  return (
  <div className="ledger-card">
    <div className="accent"/>
    <div className="body">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button className="filter-btn" onClick={onFilter} title="Filter">
              <I.Filter/>
              {activeFilterCount>0 && <span className="dot">{activeFilterCount}</span>}
            </button>
            <h3 className="font-display text-base ink font-semibold">Expenses (Debit)</h3>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="stat-inline">Total: <span className="v">₹{fmtINR2(total)}</span></div>
            <button onClick={onAdd} className="btn-add flex items-center gap-1.5"><I.Plus/> Add Expense</button>
          </div>
        </div>
        <FilterChips filter={filter} onClear={onClearFilter} onClearAll={onClearAll}/>
      </div>

      <div className="desk-table expenses-table-wrap table-scroll px-2">
        <table className="ledger-table">
          <colgroup>
            {reconcileMode && <col style={{width:"4%"}}/>}
            <col style={{width:"4%"}}/>
            <col style={{width:"10%"}}/>
            <col style={{width:reconcileMode?"18%":"21%"}}/>
            <col style={{width:reconcileMode?"13%":"13%"}}/>
            <col style={{width:"9%"}}/>
            <col style={{width:"12%"}}/>
            <col style={{width:"10%"}}/>
            <col style={{width:"9%"}}/>
            <col style={{width:reconcileMode?"6%":"7%"}}/>
            <col style={{width:"5%"}}/>
          </colgroup>
          <thead>
            <tr>
              {reconcileMode && <th>
                <div
                  className={`check-box ${allMatched?'checked':''} ${someMatched?'partial':''}`}
                  onClick={()=>onToggleAll(!allMatched)}
                  title={allMatched?"Uncheck all":"Check all"}
                >
                  {allMatched && <I.Check/>}
                  {someMatched && <span className="partial-mark"></span>}
                </div>
              </th>}
              <SortableTh label="#" sortKey="id" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} noBottomBorder={filterOpen}/>
              <SortableTh label="Date" sortKey="date" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} noBottomBorder={filterOpen}/>
              <SortableTh label="Project" sortKey="project" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} noBottomBorder={filterOpen}/>
              <SortableTh label="Party" sortKey="party" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} noBottomBorder={filterOpen}/>
              <SortableTh label="Type" sortKey="partyType" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} noBottomBorder={filterOpen}/>
              <SortableTh label="Purpose" sortKey="type" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} noBottomBorder={filterOpen}/>
              <SortableTh label="Amount" sortKey="amount" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} align="right" noBottomBorder={filterOpen}/>
              <SortableTh label="Mode" sortKey="mode" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} noBottomBorder={filterOpen}/>
              <SortableTh label="Cheque" sortKey="chequeNo" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} noBottomBorder={filterOpen}/>
              <th className="text-right" style={{borderBottom: filterOpen ? "0" : undefined}}>·</th>
            </tr>
            {filterOpen && (
              <tr>
                {reconcileMode && <th style={{top:42}} />}
                <th style={{top:42, borderTop:"1px solid var(--line)"}} />
                <th style={{top:42, borderTop:"1px solid var(--line)", whiteSpace:"normal"}}>
                  <CustomDateField
                    value={dateFilterISO}
                    onChange={(v)=>onSetFilter("date", v || "")}
                    placeholder="dd/mm/yyyy"
                    alwaysOpenBelow
                    className="[&>button]:!whitespace-nowrap [&>button]:!pl-[5px] [&>button]:!pr-10 [&>button]:!text-[13px] [&>button]:!font-normal [&>button]:!text-[color:var(--ink-2)]"
                  />
                </th>
                <th style={{top:42, borderTop:"1px solid var(--line)"}}>
                  <Select
                    value={getSelected(filter.project)}
                    onChange={(opt)=>onSetFilter("project", opt?.value || "")}
                    options={toSelectOptions(projectOptions)}
                    isClearable
                    isSearchable
                    placeholder="All"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                  />
                </th>
                <th style={{top:42, borderTop:"1px solid var(--line)"}}>
                  <Select
                    value={getSelected(filter.party)}
                    onChange={(opt)=>onSetFilter("party", opt?.value || "")}
                    options={toSelectOptions(partyOptions)}
                    isClearable
                    isSearchable
                    placeholder="All"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                  />
                </th>
                <th style={{top:42, borderTop:"1px solid var(--line)"}}>
                  <Select
                    value={getSelected(filter.partyType)}
                    onChange={(opt)=>onSetFilter("partyType", opt?.value || "")}
                    options={toSelectOptions(partyTypeOptions)}
                    isClearable
                    isSearchable
                    placeholder="All"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                  />
                </th>
                <th style={{top:42, borderTop:"1px solid var(--line)"}}>
                  <Select
                    value={getSelected(filter.purpose)}
                    onChange={(opt)=>onSetFilter("purpose", opt?.value || "")}
                    options={toSelectOptions(purposeOptions)}
                    isClearable
                    isSearchable
                    placeholder="All"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                  />
                </th>
                <th style={{top:42, borderTop:"1px solid var(--line)"}}>
                  <input
                    className="input num-cell"
                    value={filter.amount}
                    onChange={(e)=>onSetFilter("amount", e.target.value)}
                    placeholder="Amount..."
                    style={{fontWeight:400, fontSize:13, height:45, paddingTop:0, paddingBottom:0}}
                  />
                </th>
                <th style={{top:42, borderTop:"1px solid var(--line)"}}>
                  <Select
                    value={getSelected(filter.mode)}
                    onChange={(opt)=>onSetFilter("mode", opt?.value || "")}
                    options={toSelectOptions(modeOptions)}
                    isClearable
                    isSearchable
                    placeholder="All"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                  />
                </th>
                <th style={{top:42, borderTop:"1px solid var(--line)"}}>
                  <Select
                    value={getSelected(filter.cheque)}
                    onChange={(opt)=>onSetFilter("cheque", opt?.value || "")}
                    options={toSelectOptions(chequeOptions)}
                    isClearable
                    isSearchable
                    placeholder="All"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                  />
                </th>
                <th style={{top:42, borderTop:"1px solid var(--line)"}} />
              </tr>
            )}
          </thead>
          <tbody>
            {sortedRows.map((r,i)=>(
              <tr key={r.id} className={r.matched?"matched":""}>
                {reconcileMode && <td className=" text-left"><div className={`check-box ${r.matched?'checked':''}`} onClick={()=>onToggleMatch(r)}>{r.matched && <I.Check/>}</div></td>}
                <td className="font-semibold text-left ink">{String(i+1).padStart(2,"0")}</td>
                <td className="num-cell text-left">{r.date}</td>
                <td className="text-left ink truncate-cell" title={r.project}>{r.project}</td>
                <td className="text-left truncate-cell" title={r.party}>{r.party}</td>
                <td className="text-left"><PartyChip type={r.partyType}/></td>
                <td className="text-left truncate-cell" title={r.type}>{r.type}</td>
                <td className="font-semibold ink num-cell text-right">₹{fmtINR(r.amount)}</td>
                <td className="text-left"><span className="chip  chip-mode truncate-cell" style={{maxWidth:"100%"}}>{r.mode}</span></td>
                <td className="text-left num-cell  truncate-cell" title={r.chequeNo!=="-"?`${r.chequeNo} · ${r.chequeDate}`:""}>
                  {r.chequeNo!=="-" ? <span className="ink font-semibold">{r.chequeNo}</span> : <span className="muted">—</span>}
                </td>
                <td>
                  <div className="act-cell">
                    <button onClick={()=>onEdit(r)} title="Edit"><I.Edit/></button>
                    <button onClick={()=>onDelete(r)} title="Delete"><I.Trash/></button>
                  </div>
                </td>
              </tr>
            ))}
            {sortedRows.length===0 && <tr><td colSpan={reconcileMode?11:10} className="text-center py-8 muted">No matching expenses for this account & date range.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="mob-cards px-3 pb-4 pt-2">
        {sortedRows.map((r,i)=>(
          <div key={r.id} className={`mob-card ${r.matched?'matched':''}`}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                {reconcileMode && <div className={`check-box ${r.matched?'checked':''}`} onClick={()=>onToggleMatch(r)}>{r.matched && <I.Check/>}</div>}
                <div style={{textAlign:"left"}}>
                  <div className="text-[11px] muted">#{String(i+1).padStart(2,"0")} · {r.date}</div>
                  <div className="ink font-semibold text-sm leading-snug mt-0.5">{r.project}</div>
                </div>
              </div>
              <div className="font-bold ink num-cell">₹{fmtINR(r.amount)}</div>
            </div>
            <div className="text-xs muted" style={{textAlign:"left"}}>{r.party} • {r.type}</div>
            <div className="flex items-center justify-between mt-2.5 gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <PartyChip type={r.partyType}/>
                <span className="chip chip-mode">{r.mode}</span>
                {r.chequeNo!=="-" && <span className="chip chip-mode">#{r.chequeNo}</span>}
                {r.matched && <span className="chip chip-matched">Reconciled</span>}
              </div>
              <div className="act-cell">
                <button onClick={()=>onEdit(r)}><I.Edit/></button>
                <button onClick={()=>onDelete(r)}><I.Trash/></button>
              </div>
            </div>
          </div>
        ))}
        {sortedRows.length===0 && <div className="text-center py-8 muted text-sm">No matching expenses for this account & date range.</div>}
      </div>
    </div>
  </div>
  );
};

// ---------- Income Register (date + amount only, since account is selected above) ----------
const IncomeRegister = ({rows, total, onAdd, onEdit, onDelete, onToggleMatch, onToggleAll, reconcileMode}) => {
  const [sortBy,setSortBy] = useState("");
  const [sortDir,setSortDir] = useState("asc");
  const handleSort = (key) => {
    if(sortBy===key){ setSortDir(d=>d==="asc"?"desc":"asc"); }
    else { setSortBy(key); setSortDir("asc"); }
  };
  const sortedRows = useMemo(()=>{
    if(!sortBy) return rows;
    const dateVal = (s) => { const [d,m,y]=s.split("/"); return new Date(+y,+m-1,+d).getTime(); };
    const get = (r) => sortBy==="date" ? dateVal(r.date) : sortBy==="amount" ? r.amount : r.matched?1:0;
    const copy = [...rows];
    copy.sort((a,b)=>{ const va=get(a),vb=get(b); if(va<vb) return sortDir==="asc"?-1:1; if(va>vb) return sortDir==="asc"?1:-1; return 0; });
    return copy;
  },[rows,sortBy,sortDir]);
  const allMatched = sortedRows.length>0 && sortedRows.every(r=>r.matched);
  const someMatched = sortedRows.some(r=>r.matched) && !allMatched;

  return (
  <div className="ledger-card">
    <div className="accent"/>
    <div className="body">
      <div className="flex items-center justify-between px-3 pt-4 pb-2 gap-2 flex-nowrap">
        <h3 className="font-display text-base ink font-semibold whitespace-nowrap shrink-0">Income</h3>
        <div className="flex items-center gap-2 min-w-0 shrink-1 justify-end">
          <div className="stat-inline income whitespace-nowrap truncate" title={`Total: ₹${fmtINR2(total)}`}>
            <span className="hidden xl:inline">Total: </span><span className="v">₹{fmtINR2(total)}</span>
          </div>
          <button onClick={onAdd} className="btn-add flex items-center gap-1 shrink-0" title="Add Income"><I.Plus/> <span className="hidden xl:inline">Add</span></button>
        </div>
      </div>

      <div className="desk-table table-scroll px-2">
        <table className="ledger-table">
          <colgroup>
            {reconcileMode && <col style={{width:"15%"}}/>}
            <col style={{width:reconcileMode?"30%":"38%"}}/>
            <col style={{width:reconcileMode?"35%":"42%"}}/>
            <col style={{width:"20%"}}/>
          </colgroup>
          <thead>
            <tr>
              {reconcileMode && <th>
                <div
                  className={`check-box ${allMatched?'checked':''} ${someMatched?'partial':''}`}
                  onClick={()=>onToggleAll(!allMatched)}
                  title={allMatched?"Uncheck all":"Check all"}
                >
                  {allMatched && <I.Check/>}
                  {someMatched && <span className="partial-mark"></span>}
                </div>
              </th>}
              <SortableTh label="Date" sortKey="date" sortBy={sortBy} sortDir={sortDir} onSort={handleSort}/>
              <SortableTh label="Amount" sortKey="amount" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} align="right"/>
              <th className="text-right">·</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map(r=>(
              <tr key={r.id} className={r.matched?"matched":""}>
                {reconcileMode && <td><div className={`check-box ${r.matched?'checked':''}`} onClick={()=>onToggleMatch(r)}>{r.matched && <I.Check/>}</div></td>}
                <td className="num-cell">{r.date}</td>
                <td className="font-semibold ink num-cell text-right">₹{fmtINR(r.amount)}</td>
                <td>
                  <div className="act-cell">
                    <button onClick={()=>onEdit(r)}><I.Edit/></button>
                    <button onClick={()=>onDelete(r)}><I.Trash/></button>
                  </div>
                </td>
              </tr>
            ))}
            {sortedRows.length===0 && <tr><td colSpan={reconcileMode?4:3} className="text-center py-8 muted">No income for this range.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="mob-cards px-3 pb-4 pt-2">
        {sortedRows.map(r=>(
          <div key={r.id} className={`mob-card ${r.matched?'matched':''}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {reconcileMode && <div className={`check-box ${r.matched?'checked':''}`} onClick={()=>onToggleMatch(r)}>{r.matched && <I.Check/>}</div>}
                <div className="text-xs muted">{r.date}</div>
              </div>
              <div className="act-cell">
                <button onClick={()=>onEdit(r)}><I.Edit/></button>
                <button onClick={()=>onDelete(r)}><I.Trash/></button>
              </div>
            </div>
            <div className="font-bold ink mt-2 text-right num-cell">₹{fmtINR(r.amount)}</div>
            {r.matched && <div className="mt-1 text-right"><span className="chip chip-matched">Reconciled</span></div>}
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

// ---------- Modals: Expense / Income (kept compact) ----------
const ExpenseModal = ({open, initial, onClose, onSave, account}) => {
  const empty = {date:new Date().toLocaleDateString("en-GB"), account, project:PROJECTS[0], party:"", partyType:"Tenant", type:"Rent Payment", amount:"", mode:"G-Pay", chequeNo:"-", chequeDate:"-", matched:false};
  const [f,setF] = useState(initial||empty);
  // For party + purpose, we track whether the user wants to type a custom (off-list) value
  const [partyCustom,setPartyCustom] = useState(false);
  const [purposeCustom,setPurposeCustom] = useState(false);
  useEffect(()=>{
    const init = initial||{...empty, account};
    setF(init);
    setPartyCustom(init.party && !PARTIES.includes(init.party));
    setPurposeCustom(init.type && !PURPOSES.includes(init.type));
  }, [initial,open,account]);
  if(!open) return null;
  const set = (k,v)=>setF(s=>({...s,[k]:v}));

  const save = () => { if(!f.party || !f.amount) return; onSave({...f, amount:Number(f.amount), id: f.id || Date.now()}); };

  // Bind ISO date <-> DD/MM/YYYY
  const dateISO = ddmmToISO(f.date);
  const setDateFromISO = (iso) => set("date", fromISO(iso));
  const chequeDateISO = f.chequeDate==="-" ? "" : ddmmToISO(f.chequeDate);
  const setChequeDateFromISO = (iso) => set("chequeDate", iso ? fromISO(iso) : "-");

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal text-left" style={{overflow:"visible"}} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl ink">{initial?"Edit Expense":"Add Expense"}</h3>
          <button onClick={onClose} className="ink"><I.Close/></button>
        </div>
        <div className="text-xs muted mb-3">Account: <span className="font-semibold ink">{f.account}</span></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="label-text mb-1">Date</div>
            <CustomDateField value={dateISO} onChange={(v)=>setDateFromISO(v||"")} placeholder="dd-mm-yyyy" alwaysOpenBelow/>
          </div>
          <div>
            <div className="label-text mb-1">Amount (₹)</div>
            <input className="input num-cell" type="number" value={f.amount} onChange={e=>set("amount",e.target.value)} placeholder="0"/>
          </div>

          <div className="col-span-2">
            <div className="label-text mb-1">Project</div>
            <select className="input" value={f.project} onChange={e=>set("project",e.target.value)}>{PROJECTS.map(p=><option key={p}>{p}</option>)}</select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <div className="label-text">Party Name</div>
              <button type="button" className="text-[11px] font-semibold text-gold-deep hover:underline" onClick={()=>{ setPartyCustom(c=>!c); set("party",""); }}>{partyCustom?"Pick from list":"+ Add new"}</button>
            </div>
            {partyCustom ? (
              <input className="input" value={f.party} onChange={e=>set("party",e.target.value)} placeholder="Enter party name" autoFocus/>
            ) : (
              <select className="input" value={f.party} onChange={e=>set("party",e.target.value)}>
                <option value="">Select party...</option>
                {PARTIES.map(p=><option key={p}>{p}</option>)}
              </select>
            )}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="label-text mb-1">Party Type</div>
            <select className="input" value={f.partyType} onChange={e=>set("partyType",e.target.value)}>{PARTY_TYPES.map(p=><option key={p}>{p}</option>)}</select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <div className="label-text">Purpose</div>
              <button type="button" className="text-[11px] font-semibold text-gold-deep hover:underline" onClick={()=>{ setPurposeCustom(c=>!c); set("type",""); }}>{purposeCustom?"Pick from list":"+ Add new"}</button>
            </div>
            {purposeCustom ? (
              <input className="input" value={f.type} onChange={e=>set("type",e.target.value)} placeholder="Enter purpose"/>
            ) : (
              <select className="input" value={f.type} onChange={e=>set("type",e.target.value)}>
                <option value="">Select purpose...</option>
                {PURPOSES.map(p=><option key={p}>{p}</option>)}
              </select>
            )}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="label-text mb-1">Payment Mode</div>
            <select className="input" value={f.mode} onChange={e=>set("mode",e.target.value)}>{MODES.map(m=><option key={m}>{m}</option>)}</select>
          </div>

          {f.mode==="Cheque" && <>
            <div>
              <div className="label-text mb-1">Cheque No</div>
              <input className="input num-cell" value={f.chequeNo==="-"?"":f.chequeNo} onChange={e=>set("chequeNo",e.target.value||"-")} placeholder="e.g. 545467"/>
            </div>
            <div>
              <div className="label-text mb-1">Cheque Date</div>
              <CustomDateField value={chequeDateISO} onChange={(v)=>setChequeDateFromISO(v||"")} placeholder="dd-mm-yyyy" alwaysOpenBelow/>
            </div>
          </>}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-add" onClick={save}>{initial?"Save Changes":"Add Expense"}</button>
        </div>
      </div>
    </div>
  );
};

const IncomeModal = ({open, initial, onClose, onSave, account}) => {
  const empty = {date:new Date().toLocaleDateString("en-GB"), account, amount:"", matched:false};
  const [f,setF] = useState(initial||empty);
  useEffect(()=>{ setF(initial||{...empty, account}); }, [initial,open,account]);
  if(!open) return null;
  const set = (k,v)=>setF(s=>({...s,[k]:v}));
  const save = () => { if(!f.amount) return; onSave({...f, amount:Number(f.amount), id:f.id||Date.now()}); };
  const dateISO = ddmmToISO(f.date);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal text-left" style={{overflow:"visible"}} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl ink">{initial?"Edit Income":"Add Income"}</h3>
          <button onClick={onClose} className="ink"><I.Close/></button>
        </div>
        <div className="text-xs muted mb-3">Account: <span className="font-semibold ink">{f.account}</span></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="label-text mb-1">Date</div>
            <CustomDateField value={dateISO} onChange={(v)=>set("date", fromISO(v||""))} placeholder="dd-mm-yyyy" alwaysOpenBelow/>
          </div>
          <div><div className="label-text mb-1">Amount (₹)</div><input className="input num-cell" type="number" value={f.amount} onChange={e=>set("amount",e.target.value)} placeholder="0"/></div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-add" onClick={save}>{initial?"Save Changes":"Add Income"}</button>
        </div>
      </div>
    </div>
  );
};

// ---------- App ----------
const BankRegister6Inner = () => {
  const [branch,setBranch] = useState('srivilliputtur');
  const [banksForBranch, setBanksForBranch] = useState([]);
  const [bank,setBank] = useState(banksForBranch[0]?.name || "");
  const [account,setAccount] = useState(banksForBranch[0]?.accounts[0] || "");
  const [billPayments, setBillPayments] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [purposeOptions, setPurposeOptions] = useState([]);
  const [tenantOptions, setTenantOptions] = useState([]);
  const [tenantShopData, setTenantShopData] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/account-details/getAll');
        if (!response.ok) return;
        const data = await response.json();
        console.log("[BankRegisterPayments] account-details/getAll raw:", data);
        const rows = Array.isArray(data) ? data : [];
        const byBank = new Map();
        for (const r of rows) {
          const bankName = String(r?.bank_name || '').trim();
          if (!bankName) continue;
          const accountNumber = String(r?.account_number || '').trim();
          const accountType = String(r?.account_type || '').trim();
          if (!byBank.has(bankName)) byBank.set(bankName, new Map());
          if (accountNumber) {
            const label = accountType ? `${accountNumber} - ${accountType}` : accountNumber;
            byBank.get(bankName).set(accountNumber, label);
          }
        }
        setBanksForBranch(
          Array.from(byBank.entries()).map(([name, accountsMap]) => ({
            name,
            branch: '',
            accounts: Array.from(accountsMap.entries()).map(([value, label]) => ({ value, label })),
          }))
        );
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    };
    void fetchAccountDetails();
  }, []);

  useEffect(() => {
    if (!banksForBranch.length) return;
    const firstBank = banksForBranch[0];
    const firstAcc = firstBank?.accounts?.[0];
    const firstAccValue = typeof firstAcc === "string" ? firstAcc : (firstAcc?.value || "");
    setBank(firstBank.name);
    setAccount(firstAccValue || "");
  }, [banksForBranch, branch]);

  useEffect(() => {
    const fetchBillPayments = async () => {
      try {
        const response = await fetch("https://backendaab.in/demoAabuildersDash/api/weekly-payment-bills/all", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) return;
        const data = await response.json();
        const claimPayments = (Array.isArray(data) ? data : []).filter(
          item => item.type === "Claim Payment"
        );
        
        console.log("[Claim Payments only]:", claimPayments);
        const sortedData = (Array.isArray(data) ? data : []).sort((a, b) => (b.id || 0) - (a.id || 0));
        setBillPayments(sortedData);
      } catch (error) {
        console.error("Error fetching bill payments:", error);
      }
    };

    const fetchVendorOptions = async () => {
      try {
        const response = await fetch("https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) return;
        const data = await response.json();
        setVendorOptions((Array.isArray(data) ? data : []).map((vendor) => ({
          label: vendor?.vendorName || vendor?.vendor_name || vendor?.name || "-",
          id: vendor?.id,
        })));
      } catch (error) {
        console.error("Error fetching vendor options:", error);
      }
    };

    const fetchContractorOptions = async () => {
      try {
        const response = await fetch("https://backendaab.in/demoAabuilderDash/api/contractor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) return;
        const data = await response.json();
        setContractorOptions((Array.isArray(data) ? data : []).map((contractor) => ({
          label: contractor?.contractorName || contractor?.contractor_name || contractor?.name || "-",
          id: contractor?.id,
        })));
      } catch (error) {
        console.error("Error fetching contractor options:", error);
      }
    };

    const fetchEmployeeOptions = async () => {
      try {
        const response = await fetch("https://backendaab.in/demoAabuildersDash/api/employee_details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) return;
        const data = await response.json();
        setEmployeeOptions((Array.isArray(data) ? data : []).map((employee) => ({
          label: employee?.employee_name || employee?.employeeName || employee?.name || "-",
          id: employee?.id,
        })));
      } catch (error) {
        console.error("Error fetching employee options:", error);
      }
    };

    const fetchProjectOptions = async () => {
      try {
        const response = await fetch("https://backendaab.in/demoAabuilderDash/api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) return;
        const data = await response.json();
        const formattedData = (Array.isArray(data) ? data : []).map((item) => ({
          label: item?.siteName || item?.projectName || item?.project_name || item?.project || item?.name || "-",
          id: item?.id,
        }));
        const predefinedSiteOptions = [
          { label: "Mason Advance", id: 1 },
          { label: "Material Advance", id: 2 },
          { label: "Weekly Advance", id: 3 },
          { label: "Excess Advance", id: 4 },
          { label: "Material Rent", id: 5 },
          { label: "Subhash Kumar - Kunnur", id: 6 },
          { label: "Summary Bill", id: 7 },
          { label: "Daily Wage", id: 8 },
          { label: "Rent Management Portal", id: 9 },
          { label: "Multi-Project Batch", id: 10 },
          { label: "Loan Portal", id: 11 },
        ];
        setSiteOptions([...predefinedSiteOptions, ...formattedData]);
      } catch (error) {
        console.error("Error fetching project options:", error);
      }
    };

    const fetchPurposeOptions = async () => {
      try {
        const response = await fetch("https://backendaab.in/demoAabuildersDash/api/loan-purposes/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) return;
        const data = await response.json();
        setPurposeOptions((Array.isArray(data) ? data : []).map((purpose) => ({
          label: purpose.purpose,
          id: purpose.id,
        })));
      } catch (error) {
        console.error("Error fetching purpose options:", error);
        setPurposeOptions([]);
      }
    };

    const fetchTenantOptions = async () => {
      try {
        const response = await fetch("https://backendaab.in/demoAabuildersDash/api/tenant_link_shop/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) return;
        const data = await response.json();
        const rows = Array.isArray(data) ? data : [];
        setTenantShopData(rows);
        const tenantOptionsUnique = rows
          .filter((t) => t.tenantName)
          .map((t) => ({ label: t.tenantName, id: t.id }))
          .filter((t, i, arr) => arr.findIndex((x) => x.label === t.label) === i);
        setTenantOptions(tenantOptionsUnique);
      } catch (error) {
        console.error("Error fetching tenant options:", error);
        setTenantOptions([]);
        setTenantShopData([]);
      }
    };

    void Promise.all([
      fetchBillPayments(),
      fetchVendorOptions(),
      fetchContractorOptions(),
      fetchEmployeeOptions(),
      fetchProjectOptions(),
      fetchPurposeOptions(),
      fetchTenantOptions(),
    ]);
  }, []);

  const [expenses,setExpenses] = useState([]);
  const [income,setIncome] = useState(SEED_INCOME);
  const [expModal,setExpModal] = useState({open:false, initial:null});
  const [incModal,setIncModal] = useState({open:false, initial:null});
  const [filter,setFilter] = useState({date:"",project:"",party:"",purpose:"",cheque:"",partyType:"",mode:"",matched:"",amount:""});
  const [filterOpen,setFilterOpen] = useState(false);
  const [dateRangeOpen,setDateRangeOpen] = useState(false);
  const [dateRange,setDateRange] = useState({from:"2026-04-01", to:"2026-05-04"});
  const [reconcileMode,setReconcileMode] = useState(false);
  const [toast,setToast] = useState("");
  const [sideOpen,setSideOpen] = useState(false);

  useEffect(() => {
    const sameId = (a, b) => {
      const na = Number(a), nb = Number(b);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na === nb;
      return String(a ?? "") === String(b ?? "");
    };
    const getProjectName = (projectId) => {
      const project = siteOptions.find((o) => sameId(o.id, projectId));
      return project ? project.label : "-";
    };
    const getVendorName = (vendorId) => {
      const vendor = vendorOptions.find((o) => sameId(o.id, vendorId));
      return vendor ? vendor.label : "-";
    };
    const getContractorName = (contractorId) => {
      const contractor = contractorOptions.find((o) => sameId(o.id, contractorId));
      return contractor ? contractor.label : "-";
    };
    const getEmployeeName = (employeeId) => {
      const employee = employeeOptions.find((o) => sameId(o.id, employeeId));
      return employee ? employee.label : "-";
    };
    const getPurposeName = (purposeId) => {
      const purpose = purposeOptions.find((o) => sameId(o.id, purposeId));
      return purpose ? purpose.label : "-";
    };
    const getTenantName = (tenantId) => {
      const tenant = tenantOptions.find((o) => sameId(o.id, tenantId));
      if (tenant) return tenant.label;
      const tenantFromLink = tenantShopData.find((t) => sameId(t?.id, tenantId));
      return tenantFromLink ? (tenantFromLink.tenantName || tenantFromLink.tenant_name || "-") : "-";
    };
    const getPartyNameAndType = (item) => {
      const directPartyName =
        (typeof item?.party_name === "string" && item.party_name.trim()) ||
        (typeof item?.partyName === "string" && item.partyName.trim()) ||
        (typeof item?.party === "string" && item.party.trim()) ||
        "";
      const directPartyType =
        (typeof item?.party_type === "string" && item.party_type.trim()) ||
        (typeof item?.partyType === "string" && item.partyType.trim()) ||
        "";
      if (directPartyName || directPartyType) {
        return { name: directPartyName || "-", type: directPartyType || "-" };
      }
      const contractorName = getContractorName(item.contractor_id);
      const vendorName = getVendorName(item.vendor_id);
      const employeeName = getEmployeeName(item.employee_id);
      const tenantName = getTenantName(item.tenant_id);
      if (contractorName !== "-") return { name: contractorName, type: "Contractor" };
      if (vendorName !== "-") return { name: vendorName, type: "Vendor" };
      if (employeeName !== "-") return { name: employeeName, type: "Employee" };
      if (tenantName !== "-") return { name: tenantName, type: "Tenant" };
      return { name: "-", type: "-" };
    };
    const getProjectOrPurposeName = (item) => {
      const partyData = getPartyNameAndType(item);
      if (partyData.type === "Tenant" && item.tenant_complex_name) return item.tenant_complex_name;
      const directProject =
        (typeof item?.project_name === "string" && item.project_name.trim()) ||
        (typeof item?.projectName === "string" && item.projectName.trim()) ||
        (typeof item?.project === "string" && item.project.trim()) ||
        (typeof item?.projectNameText === "string" && item.projectNameText.trim()) ||
        "";
      if (directProject) return directProject;
      if (item.project_id) {
        const projectName = getProjectName(item.project_id);
        if (projectName !== "-") return projectName;
      }
      if (item.purpose_id) {
        const purposeName = getPurposeName(item.purpose_id);
        if (purposeName !== "-") return purposeName;
      }
      return "-";
    };

    if (!billPayments.length) return;
    setExpenses(
      billPayments.map((item, index) => {
        const partyData = getPartyNameAndType(item);
        const dateStr = item.date ? new Date(item.date).toLocaleDateString("en-GB") : "-";
        return {
          id: item.id ?? index + 1,
          date: dateStr,
          project: getProjectOrPurposeName(item),
          party: partyData.name,
          partyType: partyData.type,
          type: item.type || "-",
          mode: item.bill_payment_mode || "-",
          chequeNo: item.cheque_number || "-",
          chequeDate: item.cheque_date ? new Date(item.cheque_date).toLocaleDateString("en-GB") : "-",
          amount: Number(item.amount || 0),
          matched: false,
          account: item.account_number || "",
        };
      })
    );
  }, [
    billPayments,
    siteOptions,
    vendorOptions,
    contractorOptions,
    employeeOptions,
    purposeOptions,
    tenantOptions,
    tenantShopData,
  ]);

  const inDateRange = (ddmmyyyy) => {
    const dt = parseDDMMYYYY(ddmmyyyy);
    if(!dt) return true;
    const f = new Date(dateRange.from);
    const t = new Date(dateRange.to);
    return dt >= f && dt <= t;
  };

  // Both registers are scoped by selected ACCOUNT and DATE RANGE
  const accountExpenses = useMemo(()=> expenses.filter(r=> r.account===account && inDateRange(r.date)), [expenses,account,dateRange]);
  const accountIncome = useMemo(()=> income.filter(r=> r.account===account && inDateRange(r.date)), [income,account,dateRange]);

  const filteredExpenses = useMemo(()=>{
    const inc = (text, q) => String(text||"").toLowerCase().includes(String(q||"").toLowerCase());
    return accountExpenses.filter(r=>{
      if(filter.date && !inc(r.date, fromISO(filter.date))) return false;
      if(filter.project && !inc(r.project, filter.project)) return false;
      if(filter.party && !inc(r.party, filter.party)) return false;
      if(filter.purpose && !inc(r.type, filter.purpose)) return false;
      if(filter.cheque && !inc(r.chequeNo, filter.cheque)) return false;
      if(filter.partyType && r.partyType!==filter.partyType) return false;
      if(filter.mode && r.mode!==filter.mode) return false;
      if(filter.matched==="yes" && !r.matched) return false;
      if(filter.matched==="no" && r.matched) return false;
      if(filter.amount && !inc(r.amount, filter.amount)) return false;
      return true;
    });
  },[accountExpenses,filter]);

  const totalExpense = filteredExpenses.reduce((s,r)=>s+r.amount,0);
  const totalIncome = accountIncome.reduce((s,r)=>s+r.amount,0);
  const upiTotal = accountExpenses
    .filter((r) => {
      const m = String(r.mode || "").toLowerCase().replace(/\s+/g, "");
      return m === "paytm" || m.includes("phonepe") || m.includes("gpay") || m.includes("googlepay");
    })
    .reduce((s, r) => s + r.amount, 0);
  const chequeTotal = accountExpenses.filter(r=>r.mode==="Cheque").reduce((s,r)=>s+r.amount,0);
  const netbankTotal = accountExpenses.filter(r=>["Net Banking","RTGS","NEFT"].includes(r.mode)).reduce((s,r)=>s+r.amount,0);
  const balance = totalIncome - totalExpense;

  // Reconciliation stats
  const expReconciled = accountExpenses.filter(r=>r.matched).length;
  const incReconciled = accountIncome.filter(r=>r.matched).length;
  const totalEntries = accountExpenses.length + accountIncome.length;
  const reconciledEntries = expReconciled + incReconciled;
  const reconcilePct = totalEntries ? Math.round((reconciledEntries/totalEntries)*100) : 0;

  const activeFilterCount = Object.values(filter).filter(v=>v).length;

  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(""),2000); };
  const saveExpense = (r) => { setExpenses(prev=> prev.some(x=>x.id===r.id) ? prev.map(x=>x.id===r.id?r:x) : [r,...prev]); setExpModal({open:false,initial:null}); showToast("Saved"); };
  const saveIncome = (r) => { setIncome(prev=> prev.some(x=>x.id===r.id) ? prev.map(x=>x.id===r.id?r:x) : [r,...prev]); setIncModal({open:false,initial:null}); showToast("Saved"); };
  const deleteExp = (r) => { if(!window.confirm(`Delete expense for ${r.party} (₹${fmtINR(r.amount)})?`)) return; setExpenses(prev=>prev.filter(x=>x.id!==r.id)); showToast("Deleted"); };
  const deleteInc = (r) => { if(!window.confirm(`Delete income of ₹${fmtINR(r.amount)}?`)) return; setIncome(prev=>prev.filter(x=>x.id!==r.id)); showToast("Deleted"); };
  const toggleMatchExp = (r) => setExpenses(prev=>prev.map(x=>x.id===r.id?{...x,matched:!x.matched}:x));
  const toggleMatchInc = (r) => setIncome(prev=>prev.map(x=>x.id===r.id?{...x,matched:!x.matched}:x));
  // Toggle-all: affects only rows currently visible (post account+date+filter)
  const toggleAllExp = (checked) => {
    const visibleIds = new Set(filteredExpenses.map(r=>r.id));
    setExpenses(prev=>prev.map(x=> visibleIds.has(x.id) ? {...x,matched:checked} : x));
    showToast(checked?`Marked ${visibleIds.size} expenses reconciled`:`Cleared ${visibleIds.size} expenses`);
  };
  const toggleAllInc = (checked) => {
    const visibleIds = new Set(accountIncome.map(r=>r.id));
    setIncome(prev=>prev.map(x=> visibleIds.has(x.id) ? {...x,matched:checked} : x));
    showToast(checked?`Marked ${visibleIds.size} income reconciled`:`Cleared ${visibleIds.size} income`);
  };

  const clearFilterKey = (k) => setFilter(f=>({...f,[k]:""}));
  const clearAllFilters = () => setFilter({date:"",project:"",party:"",purpose:"",cheque:"",partyType:"",mode:"",matched:"",amount:""});

  // --- EXPORT ---
  const downloadFile = (filename, content, mime) => {
    const blob = new Blob([content], {type:mime});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  };
  const exportExcel = () => {
    // CSV that Excel opens natively
    const lines = [];
    lines.push(`AA Builders — Bank Reconciliation`);
    lines.push(`Account,${account}`);
    lines.push(`Branch,${BRANCHES.find(b=>b.id===branch)?.name}`);
    lines.push(`Period,${fmtRangeShort(dateRange.from,dateRange.to)}`);
    lines.push("");
    lines.push("EXPENSES (DEBIT)");
    lines.push("Date,Project,Party,Party Type,Purpose,Mode,Cheque No,Cheque Date,Amount,Reconciled");
    filteredExpenses.forEach(r=>{
      lines.push([r.date,`"${r.project}"`,`"${r.party}"`,r.partyType,`"${r.type}"`,r.mode,r.chequeNo,r.chequeDate,r.amount,r.matched?"Yes":"No"].join(","));
    });
    lines.push(`Total Expense,,,,,,,,${totalExpense},`);
    lines.push("");
    lines.push("INCOME (CREDIT)");
    lines.push("Date,Amount,Reconciled");
    accountIncome.forEach(r=>{
      lines.push([r.date,r.amount,r.matched?"Yes":"No"].join(","));
    });
    lines.push(`Total Income,${totalIncome},`);
    lines.push("");
    lines.push(`Net Balance,${balance}`);
    lines.push(`Reconciliation,${reconciledEntries} of ${totalEntries} entries (${reconcilePct}%)`);
    const fname = `BankRegister_${account.replace(/\s+/g,"_").replace(/[^\w-]/g,"")}_${dateRange.from}_to_${dateRange.to}.csv`;
    downloadFile(fname, lines.join("\n"), "text/csv;charset=utf-8");
    showToast("Excel exported");
  };
  const exportPDF = () => {
    // Print-friendly HTML opens new window for native PDF print
    const w = window.open("", "_blank");
    if(!w){ showToast("Popup blocked — allow popups"); return; }
    const fmt = (n)=>"₹"+Number(n).toLocaleString("en-IN",{minimumFractionDigits:2});
    const expRows = filteredExpenses.map(r=>`<tr><td>${r.date}</td><td>${r.project}</td><td>${r.party}</td><td>${r.partyType}</td><td>${r.type}</td><td>${r.mode}</td><td>${r.chequeNo}</td><td style="text-align:right">${fmt(r.amount)}</td><td>${r.matched?"✓":""}</td></tr>`).join("");
    const incRows = accountIncome.map(r=>`<tr><td>${r.date}</td><td style="text-align:right">${fmt(r.amount)}</td><td>${r.matched?"✓":""}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Bank Reconciliation — ${account}</title>
      <style>
        body{font-family:Arial,sans-serif;color:#212121;padding:24px;font-size:11px;}
        h1{font-size:18px;margin:0 0 4px;color:#B8924B;}
        h2{font-size:13px;margin:18px 0 6px;border-bottom:1px solid #D6AB60;padding-bottom:4px;}
        .meta{margin-bottom:12px;color:#555;font-size:11px;}
        table{width:100%;border-collapse:collapse;margin-bottom:8px;}
        th,td{border:1px solid #EADFC8;padding:5px 7px;text-align:left;font-size:10.5px;}
        th{background:#FAF4E8;font-weight:700;}
        .total{background:#F5EFE3;font-weight:700;}
        .footer{margin-top:18px;padding-top:8px;border-top:1px solid #EADFC8;display:flex;justify-content:space-between;font-size:11px;}
      </style></head><body>
      <h1>AA Builders — Bank Reconciliation Report</h1>
      <div class="meta">
        <strong>Account:</strong> ${account} &nbsp;|&nbsp;
        <strong>Branch:</strong> ${BRANCHES.find(b=>b.id===branch)?.name} &nbsp;|&nbsp;
        <strong>Period:</strong> ${fmtRangeShort(dateRange.from,dateRange.to)} &nbsp;|&nbsp;
        <strong>Generated:</strong> ${new Date().toLocaleString("en-IN")}
      </div>
      <h2>Expenses (Debit) — ${filteredExpenses.length} entries</h2>
      <table><thead><tr><th>Date</th><th>Project</th><th>Party</th><th>Type</th><th>Purpose</th><th>Mode</th><th>Cheque</th><th style="text-align:right">Amount</th><th>✓</th></tr></thead>
      <tbody>${expRows}<tr class="total"><td colspan="7">Total Expense</td><td style="text-align:right">${fmt(totalExpense)}</td><td></td></tr></tbody></table>
      <h2>Income (Credit) — ${accountIncome.length} entries</h2>
      <table><thead><tr><th>Date</th><th style="text-align:right">Amount</th><th>✓</th></tr></thead>
      <tbody>${incRows}<tr class="total"><td>Total Income</td><td style="text-align:right">${fmt(totalIncome)}</td><td></td></tr></tbody></table>
      <div class="footer">
        <div><strong>Reconciliation:</strong> ${reconciledEntries} of ${totalEntries} entries matched (${reconcilePct}%)</div>
        <div><strong>Net Balance:</strong> ${fmt(balance)}</div>
      </div>
      <script>window.onload=()=>setTimeout(()=>window.print(),300);<\/script>
      </body></html>`;
    w.document.write(html); w.document.close();
    showToast("PDF window opened");
  };

  return (
    <div>
      <div className="shell">
        {/* Action bar — date range as filter + export options */}
        <div className="action-bar lg:mt-[-10px] lg:px-4">
          <button className="date-range-btn" onClick={()=>setDateRangeOpen(true)}>
            <I.Cal/>
            <span><span className="lbl">Period:</span> <span className="v">{fmtRangeShort(dateRange.from, dateRange.to)}</span></span>
          </button>
          <button className={`recon-toggle ${reconcileMode?'active':''}`} onClick={()=>setReconcileMode(r=>!r)} title="Toggle reconcile mode">
            <I.Link/>
            <span>Reconcile {reconcileMode?'on':'off'} · {reconcilePct}%</span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button className="export-btn excel" onClick={exportExcel}><I.Excel/> Excel</button>
            <button className="export-btn pdf" onClick={exportPDF}><I.Pdf/> PDF</button>
          </div>
        </div>

        {/* Account picker (wider) + 4 stat cards — single row from md+ */}
        <div className="acct-stat-grid text-left mb-5 lg:px-4">
          <AccountPicker banks={banksForBranch} bank={bank} setBank={setBank} account={account} setAccount={setAccount}/>
          <StatCard label="UPI" tone="#FFF1D6" icon={<I.UPI/>} value={fmtINR2(upiTotal)}/>
          <StatCard label="Cheque" tone="#FBE9D6" icon={<I.Cheque/>} value={fmtINR2(chequeTotal)}/>
          <StatCard label="Net Banking" tone="#E0F1E5" icon={<I.NetBank/>} value={fmtINR2(netbankTotal)}/>
          <StatCard label="Net Balance" tone="#EFE2FF" icon={<I.Wallet/>} value={fmtINR2(balance)}/>
        </div>

        {!account ? (
          <div className="ledger-card"><div className="accent"/><div className="body p-8 text-center">
            <p className="muted text-sm">Please select a bank account above to view its register.</p>
          </div></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-9 lg:pl-4">
              <ExpenseRegister
                rows={filteredExpenses}
                total={totalExpense}
                onAdd={()=>setExpModal({open:true,initial:null})}
                onEdit={(r)=>setExpModal({open:true,initial:r})}
                onDelete={deleteExp}
                onFilter={()=>setFilterOpen(o=>!o)}
                onToggleMatch={toggleMatchExp}
                onToggleAll={toggleAllExp}
                filter={filter}
                onSetFilter={(k,v)=>setFilter(f=>({...f,[k]:v}))}
                onClearFilter={clearFilterKey}
                onClearAll={clearAllFilters}
                activeFilterCount={activeFilterCount}
                reconcileMode={reconcileMode}
                filterOpen={filterOpen}
                allRowsForFilters={accountExpenses}
              />
            </div>
            <aside className={`lg:col-span-3 side-col ${sideOpen?'open':''}`} style={{paddingRight:16}}>
              <div className="lg:hidden flex items-center justify-between mb-3" style={{marginTop:58}}>
                <h2 className="font-display text-lg ink">Income</h2>
                <button className="icon-btn" onClick={()=>setSideOpen(false)}><I.Close/></button>
              </div>
              <IncomeRegister
                rows={accountIncome}
                total={totalIncome}
                onAdd={()=>setIncModal({open:true,initial:null})}
                onEdit={(r)=>setIncModal({open:true,initial:r})}
                onDelete={deleteInc}
                onToggleMatch={toggleMatchInc}
                onToggleAll={toggleAllInc}
                reconcileMode={reconcileMode}
              />
            </aside>
            <div className={`side-overlay ${sideOpen?'open':''}`} onClick={()=>setSideOpen(false)}></div>
          </div>
        )}
      </div>

      {account && (
        <button className="side-fab" onClick={()=>setSideOpen(true)}>
          <I.Coin/>
          <span>Income · ₹{fmtINR(totalIncome)}</span>
        </button>
      )}

      <ExpenseModal open={expModal.open} initial={expModal.initial} onClose={()=>setExpModal({open:false,initial:null})} onSave={saveExpense} account={account}/>
      <IncomeModal open={incModal.open} initial={incModal.initial} onClose={()=>setIncModal({open:false,initial:null})} onSave={saveIncome} account={account}/>
      <FilterModal open={false} value={filter} onClose={()=>setFilterOpen(false)} onApply={setFilter} onReset={clearAllFilters}/>
      <DateRangeModal open={dateRangeOpen} value={dateRange} onClose={()=>setDateRangeOpen(false)} onApply={setDateRange}/>

      {toast && <div className="toast">{toast}</div>}
      <div className="badge-build">BANK · BUILD {BUILD}</div>
    </div>
  );
};

export default function BankRegister6View () {
  return (
    <div className="bank-register-6-scope">
      <link rel="stylesheet" href={BANK_REGISTER_6_FONT} />
      <style dangerouslySetInnerHTML={{ __html: BANK_REGISTER_6_CSS }} />
      <BankRegister6Inner />
    </div>
  );
}

export {
  BANK_REGISTER_6_FONT,
  BANK_REGISTER_6_CSS,
  fmtINR,
  fmtINR2,
  parseDDMMYYYY,
  fmtRangeShort,
  BRANCHES,
  BANKS,
  SEED_EXPENSES,
  SEED_INCOME
};
