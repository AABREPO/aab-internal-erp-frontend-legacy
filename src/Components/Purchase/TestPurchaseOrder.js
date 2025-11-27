import React, { useEffect, useMemo, useState } from 'react';

const APP_STYLES = String.raw`
:root {
  --bg: #f4f5f7;
  --card-bg: #ffffff;
  --primary: #2563eb;
  --primary-soft: #dbeafe;
  --danger: #ef4444;
  --text-main: #111827;
  --text-sub: #6b7280;
  --border-soft: #e5e7eb;
  --radius-lg: 16px;
  --radius-xl: 22px;
  --shadow-soft: 0 8px 24px rgba(15, 23, 42, 0.12);
}
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}
body.test-po-body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: radial-gradient(circle at top, #e0f2fe 0, #f9fafb 38%, #f4f5f7 100%);
  color: var(--text-main);
}
.test-po-root {
  max-width: 480px;
  margin: 40px auto 0;
  min-height: 100vh;
  padding: 16px 14px 80px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 2px 2px;
}
.app-title-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.app-subtitle {
  font-size: 0.75rem;
  color: var(--text-sub);
}
.step-pill {
  font-size: 0.7rem;
  border-radius: 999px;
  padding: 4px 10px;
  background: rgba(15, 23, 42, 0.9);
  color: #f9fafb;
  white-space: nowrap;
}
.meta-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--radius-xl);
  padding: 10px 12px 12px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.meta-row {
  display: flex;
  gap: 8px;
}
.field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.75rem;
}
.field label {
  color: var(--text-sub);
}
.field-input,
.field-select {
  border-radius: 999px;
  border: 1px solid #d1d5db;
  padding: 6px 10px;
  font-size: 0.8rem;
  outline: none;
  font-family: inherit;
  background: #ffffff;
}
.field-input:focus,
.field-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary-soft);
}
.badge-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 0.7rem;
}
.small-pill {
  border-radius: 999px;
  padding: 3px 8px;
  background: #eff6ff;
  color: #1d4ed8;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 1px 3px rgba(148, 163, 184, 0.35);
}
.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.82rem;
  background: transparent;
}
.search-icon {
  font-size: 0.9rem;
  color: var(--text-sub);
}
.catalog-wrapper {
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--radius-xl);
  padding: 10px 8px 12px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  padding: 0 2px;
  color: var(--text-sub);
  gap: 8px;
  flex-wrap: wrap;
}
.catalog-header strong {
  color: var(--text-main);
  font-size: 0.8rem;
}
.tab-row {
  display: inline-flex;
  border-radius: 999px;
  padding: 2px;
  background: #f3f4f6;
  gap: 2px;
}
.tab {
  border-radius: 999px;
  border: none;
  padding: 4px 10px;
  font-size: 0.75rem;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
}
.tab.active {
  background: #ffffff;
  color: #111827;
  box-shadow: 0 1px 3px rgba(148, 163, 184, 0.4);
}
.item-list {
  list-style: none;
  margin: 0;
  padding: 4px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.item-card {
  background: #ffffff;
  border-radius: var(--radius-lg);
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.item-top {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}
.item-name-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.item-name {
  font-size: 0.86rem;
  font-weight: 600;
}
.item-meta {
  font-size: 0.72rem;
  color: var(--text-sub);
}
.item-badge {
  align-self: flex-start;
  font-size: 0.7rem;
  border-radius: 999px;
  padding: 3px 8px;
  background: #eef2ff;
  color: #4f46e5;
}
.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}
.rate-text {
  font-size: 0.8rem;
  font-weight: 600;
}
.rate-text span {
  display: block;
  font-size: 0.7rem;
  color: var(--text-sub);
  font-weight: 400;
}
.qty-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.qty-input {
  width: 60px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  padding: 4px 6px;
  font-size: 0.78rem;
  text-align: center;
  outline: none;
}
.qty-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary-soft);
}
.add-btn {
  border-radius: 999px;
  border: none;
  padding: 5px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  background: #111827;
  color: white;
  cursor: pointer;
  white-space: nowrap;
}
.in-cart-pill {
  font-size: 0.72rem;
  border-radius: 999px;
  padding: 3px 8px;
  background: #dcfce7;
  color: #166534;
}
.add-input-btn {
  border-radius: 999px;
  border: none;
  padding: 5px 10px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #eff6ff;
  color: #1d4ed8;
  cursor: pointer;
  white-space: nowrap;
}
.cart-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: none;
  justify-content: center;
  z-index: 30;
}
.cart-bar-inner {
  max-width: 480px;
  margin: 0 auto 10px;
  border-radius: 999px;
  padding: 8px 12px;
  background: #0f172a;
  color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.65);
}
.cart-bar-text {
  font-size: 0.78rem;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.cart-bar-text strong {
  color: #ffffff;
}
.cart-bar-sub {
  font-size: 0.7rem;
  color: #9ca3af;
}
.cart-bar-btn {
  border-radius: 999px;
  border: none;
  padding: 7px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  background: #f97316;
  color: #111827;
  cursor: pointer;
  white-space: nowrap;
}
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease-out;
  z-index: 40;
}
.sheet-backdrop.open {
  opacity: 1;
  pointer-events: auto;
}
.sheet {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 -6px 22px rgba(15, 23, 42, 0.25);
  padding: 10px 16px 16px;
  transform: translateY(100%);
  transition: transform 0.2s ease-out;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sheet.open {
  transform: translateY(0);
}
.sheet-handle {
  width: 42px;
  height: 4px;
  border-radius: 999px;
  background: #e5e7eb;
  margin: 4px auto 6px;
}
.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.sheet-title {
  font-size: 0.92rem;
  font-weight: 700;
}
.sheet-subtitle {
  font-size: 0.72rem;
  color: var(--text-sub);
}
.sheet-close-btn {
  border: none;
  background: #f3f4f6;
  border-radius: 999px;
  font-size: 0.75rem;
  padding: 5px 10px;
  cursor: pointer;
}
.cart-items {
  margin: 0;
  padding: 4px 0 0;
  list-style: none;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cart-item-row {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #f9fafb;
}
.cart-item-top {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  font-size: 0.8rem;
}
.cart-item-name {
  font-weight: 600;
}
.cart-item-meta {
  font-size: 0.72rem;
  color: var(--text-sub);
}
.cart-item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
}
.cart-qty-group {
  display: flex;
  align-items: center;
  gap: 4px;
}
.cart-qty-input {
  width: 60px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  padding: 3px 6px;
  text-align: center;
  font-size: 0.78rem;
}
.cart-remove-btn {
  border: none;
  background: transparent;
  color: #b91c1c;
  font-size: 0.75rem;
  cursor: pointer;
}
.cart-line-total {
  font-weight: 600;
}
.sheet-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 6px;
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.78rem;
}
.sheet-summary-row {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}
.sheet-footer-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.sheet-btn {
  flex: 1;
  border-radius: 999px;
  border: none;
  padding: 7px 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.sheet-btn.primary {
  background: var(--primary);
  color: #ffffff;
}
.sheet-btn.outline {
  background: #ffffff;
  color: #111827;
  border: 1px solid #e5e7eb;
}
.add-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: none;
  justify-content: center;
  align-items: flex-start;
  z-index: 50;
  overflow-y: auto;
}
.add-overlay.open {
  display: flex;
}
.add-panel {
  width: 100%;
  max-width: 480px;
  margin: 10px auto 20px;
  background: #f3f4f6;
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.45);
  padding: 10px 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.add-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 0 2px;
}
.add-panel-title-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.add-panel-title {
  font-size: 0.95rem;
  font-weight: 700;
}
.add-panel-subtitle {
  font-size: 0.74rem;
  color: var(--text-sub);
}
.add-panel-close-btn {
  border-radius: 999px;
  border: none;
  padding: 4px 10px;
  font-size: 0.75rem;
  background: #111827;
  color: #f9fafb;
  cursor: pointer;
}
.lists-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--radius-xl);
  padding: 8px 10px;
  box-shadow: var(--shadow-soft);
  font-size: 0.78rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lists-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lists-label {
  font-size: 0.72rem;
  color: var(--text-sub);
}
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 18px;
}
.chip {
  border-radius: 999px;
  padding: 3px 8px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.7rem;
}
.chip.empty {
  background: transparent;
  color: #9ca3af;
  padding: 0;
}
.form-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--radius-xl);
  padding: 10px 10px 12px;
  box-shadow: var(--shadow-soft);
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.form-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.field-small {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.field-small label {
  font-size: 0.75rem;
  color: var(--text-sub);
}
.field-small-input {
  border-radius: 10px;
  border: 1px solid #d1d5db;
  padding: 6px 8px;
  font-size: 0.8rem;
  outline: none;
  font-family: inherit;
  background: #ffffff;
}
.field-small-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary-soft);
}
.field-small-input[type="number"] {
  text-align: right;
}
.primary-btn {
  border-radius: 999px;
  border: none;
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #111827;
  color: #f9fafb;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
}
.primary-btn span {
  font-size: 1rem;
}
.table-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--radius-xl);
  padding: 8px 8px 10px;
  box-shadow: var(--shadow-soft);
  font-size: 0.78rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.table-header small {
  font-size: 0.7rem;
  color: var(--text-sub);
}
.table-wrapper {
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  background: #f9fafb;
  overflow-x: auto;
}
.table-wrapper table,
.table-wrapper-review table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
  font-size: 0.74rem;
}
.table-wrapper thead,
.table-wrapper-review thead {
  background: #f3f4f6;
}
.table-wrapper th,
.table-wrapper td,
.table-wrapper-review th,
.table-wrapper-review td {
  padding: 6px 8px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
}
.table-wrapper th,
.table-wrapper-review th {
  font-weight: 600;
  color: #4b5563;
}
.table-wrapper tbody tr:last-child td,
.table-wrapper-review tbody tr:last-child td {
  border-bottom: none;
}
.qty-cell {
  text-align: right;
}
.empty-text {
  font-size: 0.75rem;
  color: #9ca3af;
  padding: 8px 4px;
}
.remove-btn {
  border: none;
  background: none;
  color: #b91c1c;
  font-size: 0.75rem;
  cursor: pointer;
}
.bottom-note {
  font-size: 0.7rem;
  color: #9ca3af;
  text-align: center;
  margin-top: 2px;
}
#screenReview {
  display: none;
  gap: 12px;
}
.summary-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--radius-xl);
  padding: 10px 12px 10px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.8rem;
}
.summary-top-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.summary-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.label {
  font-size: 0.72rem;
  color: var(--text-sub);
}
.value {
  font-size: 0.8rem;
  font-weight: 500;
}
.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
  font-size: 0.7rem;
}
.pill {
  border-radius: 999px;
  padding: 3px 8px;
  background: #eff6ff;
  color: #1d4ed8;
}
.editable {
  border-bottom: 1px dashed #cbd5f5;
  cursor: text;
}
.editable[contenteditable="true"]:focus {
  outline: none;
  background: #eef2ff;
}
.items-card-review {
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--radius-xl);
  padding: 10px 8px 10px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.items-header-review {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  padding: 0 2px;
}
.items-header-review span {
  color: var(--text-sub);
  font-size: 0.75rem;
}
.tiny-link-btn {
  border: none;
  background: none;
  padding: 0;
  font-size: 0.75rem;
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
}
.table-wrapper-review {
  margin-top: 4px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  background: #f9fafb;
  overflow-x: auto;
}
.num-input {
  width: 70px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  padding: 3px 6px;
  text-align: right;
  font-size: 0.75rem;
  outline: none;
}
.num-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary-soft);
}
.item-desc {
  font-weight: 500;
  font-size: 0.78rem;
}
.item-sub {
  font-size: 0.7rem;
  color: var(--text-sub);
}
.amount-cell {
  font-weight: 600;
  text-align: right;
  white-space: nowrap;
}
.terms-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--radius-xl);
  padding: 8px 10px 10px;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.78rem;
}
.terms-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.terms-field {
  flex: 1;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.terms-input,
.terms-textarea {
  border-radius: 10px;
  border: 1px solid #d1d5db;
  padding: 5px 8px;
  font-size: 0.78rem;
  font-family: inherit;
  outline: none;
}
.terms-textarea {
  min-height: 60px;
  resize: vertical;
}
.terms-input:focus,
.terms-textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary-soft);
}
.totals-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: var(--radius-xl);
  padding: 8px 10px 10px;
  box-shadow: var(--shadow-soft);
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.totals-row {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}
.totals-row strong {
  font-weight: 600;
}
.totals-row.total {
  margin-top: 2px;
  padding-top: 4px;
  border-top: 1px solid #e5e7eb;
  font-size: 0.85rem;
}
.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: none;
  justify-content: center;
  padding: 8px 10px;
  z-index: 30;
}
.bottom-actions-inner {
  max-width: 480px;
  width: 100%;
  border-radius: 16px;
  padding: 8px 10px;
  background: #0f172a;
  display: flex;
  gap: 8px;
}
.action-btn {
  flex: 1;
  border-radius: 999px;
  border: none;
  padding: 8px 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.action-btn.secondary {
  background: #111827;
  color: #e5e7eb;
  border: 1px solid #4b5563;
}
.action-btn.primary {
  background: #22c55e;
  color: #064e3b;
}
@media (min-width: 600px) {
  .test-po-root {
    padding-top: 24px;
  }
  .add-panel {
    margin-top: 20px;
  }
}
`;

const INITIAL_ITEMS = [
  {
    id: 'CEM-OPC-53',
    name: 'OPC 53 Grade Cement',
    unit: 'bag',
    rate: 420,
    category: 'Material',
    meta: 'Code: CEM-OPC-53 • Unit: bag • Stock at site: 28',
    rateLabel: 'per bag',
    defaultQty: 10,
  },
  {
    id: 'RIV-12MM',
    name: 'TMT Steel Bar 12mm',
    unit: 'kg',
    rate: 68,
    category: 'Material',
    meta: 'Code: RIV-12MM • Unit: kg • Stock at site: 120',
    rateLabel: 'per kg',
    defaultQty: 50,
  },
  {
    id: 'SAND-M',
    name: 'M-Sand',
    unit: 'cu.m',
    rate: 1550,
    category: 'Material',
    meta: 'Code: SAND-M • Unit: cu.m • Stock at site: 12',
    rateLabel: 'per cu.m',
    defaultQty: 3,
  },
  {
    id: 'LAB-CONC',
    name: 'Concreting Labour Charges',
    unit: 'day',
    rate: 8500,
    category: 'Service',
    meta: 'Code: LAB-CONC • Unit: day • Crew size: 8',
    rateLabel: 'per day',
    defaultQty: 1,
  },
];

const vendors = ['Safi Traders', 'Madurai Ready-Mix', 'Sri Venkateswara Electricals'];
const projects = ['Villa #12', 'G+1 House', 'Apartment Block A'];
const incharges = ['Arun Kumar', 'Meena R', 'Suresh B'];
const tabFilters = ['All', 'Material', 'Service'];

const formatCurrency = (value) =>
  `₹ ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const uniqueList = (items) => Array.from(new Set(items.filter(Boolean)));

const TestPurchaseOrder = () => {
  const [meta, setMeta] = useState({
    vendor: vendors[0],
    project: projects[0],
    incharge: incharges[0],
    needBy: '',
  });
  const poDetails = {
    number: 'PO-2025-0012',
    date: '26 Nov 2025',
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [cart, setCart] = useState({});
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  const [addOverlayOpen, setAddOverlayOpen] = useState(false);
  const [customItems, setCustomItems] = useState([]);
  const [customForm, setCustomForm] = useState({
    category: '',
    itemName: '',
    model: '',
    brand: '',
    type: '',
    quantity: '',
  });
  const [step, setStep] = useState('items');
  const [reviewRows, setReviewRows] = useState([]);
  const [reviewMeta, setReviewMeta] = useState({
    vendor: '',
    project: '',
    incharge: '',
    needBy: '',
    poNumber: '',
    poDate: '',
  });
  const [terms, setTerms] = useState({
    payment: 'Within 15 days against invoice submission',
    transport: 'Delivery at site, unloading by vendor',
    address:
      'AA Builders – Site,\nNear Thiruthangal Road, Srivilliputtur, Tamil Nadu.',
    notes:
      'Please supply fresh material. Any damaged / wet bags will be rejected at site. Inform site incharge before dispatch.',
  });
  const [qtyDraft, setQtyDraft] = useState({});

  useEffect(() => {
    document.body.classList.add('test-po-body');
    const styleEl = document.createElement('style');
    styleEl.id = 'test-po-style';
    styleEl.innerHTML = APP_STYLES;
    document.head.appendChild(styleEl);
    return () => {
      document.body.classList.remove('test-po-body');
      if (styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    };
  }, []);

  const catalogItems = useMemo(() => {
    const customCards = customItems.map((item) => ({
      id: item.id,
      name: item.itemName,
      unit: 'unit',
      rate: 0,
      category: item.type || 'Custom',
      meta: `Cat: ${item.category || '-'} • Model: ${item.model || '-'} • Brand: ${item.brand || '-'}`,
      rateLabel: 'per unit',
      defaultQty: item.quantity || 1,
    }));
    return [...INITIAL_ITEMS, ...customCards];
  }, [customItems]);

  const filteredItems = useMemo(() => {
    return catalogItems.filter((item) => {
      const matchesTab = activeTab === 'All' || item.category === activeTab;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term) ||
        (item.category || '').toLowerCase().includes(term);
      return matchesTab && matchesSearch;
    });
  }, [catalogItems, activeTab, searchTerm]);

  const cartLines = useMemo(() => Object.values(cart), [cart]);

  const cartSummary = useMemo(() => {
    const items = cartLines.length;
    const totalQty = cartLines.reduce((sum, line) => sum + line.qty, 0);
    const totalValue = cartLines.reduce((sum, line) => sum + line.qty * line.rate, 0);
    return { items, totalQty, totalValue };
  }, [cartLines]);

  const chipData = useMemo(() => {
    return {
      category: uniqueList(customItems.map((item) => item.category)),
      itemName: uniqueList(customItems.map((item) => item.itemName)),
      model: uniqueList(customItems.map((item) => item.model)),
      brand: uniqueList(customItems.map((item) => item.brand)),
      type: uniqueList(customItems.map((item) => item.type)),
    };
  }, [customItems]);

  const reviewTotals = useMemo(() => {
    return reviewRows.reduce(
      (acc, row) => {
        const qty = Number(row.qty) || 0;
        const rate = Number(row.rate) || 0;
        const discPct = Number(row.discPct) || 0;
        const taxPct = Number(row.taxPct) || 0;
        const base = qty * rate;
        const disc = base * (discPct / 100);
        const taxable = base - disc;
        const tax = taxable * (taxPct / 100);
        const total = taxable + tax;
        acc.subTotal += base;
        acc.discount += disc;
        acc.taxable += taxable;
        acc.tax += tax;
        acc.grand += total;
        return acc;
      },
      { subTotal: 0, discount: 0, taxable: 0, tax: 0, grand: 0 }
    );
  }, [reviewRows]);

  const handleAddToCart = (item) => {
    const rawQty = qtyDraft[item.id] ?? item.defaultQty ?? 1;
    const qty = parseFloat(rawQty);
    if (!qty || qty <= 0) {
      alert('Enter a valid quantity.');
      return;
    }
    setCart((prev) => {
      const existing = prev[item.id];
      const nextQty = (existing?.qty || 0) + qty;
      return {
        ...prev,
        [item.id]: {
          id: item.id,
          name: item.name,
          unit: item.unit,
          rate: item.rate,
          category: item.category,
          qty: nextQty,
        },
      };
    });
  };

  const handleCartQtyChange = (id, value) => {
    setCart((prev) => {
      const line = prev[id];
      if (!line) return prev;
      const qty = parseFloat(value);
      if (!qty || qty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [id]: { ...line, qty },
      };
    });
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleClearCart = () => {
    if (window.confirm('Clear all items from PO cart?')) {
      setCart({});
    }
  };

  const handleAddCustomItem = () => {
    if (!customForm.category || !customForm.itemName) {
      alert('Category and Item Name are required.');
      return;
    }
    const qty = parseFloat(customForm.quantity) || 1;
    const id =
      customForm.model?.trim() ||
      `CUSTOM-${Date.now()}-${Math.floor(Math.random() * 999)}`;
    setCustomItems((prev) => [
      ...prev,
      {
        id,
        category: customForm.category,
        itemName: customForm.itemName,
        model: customForm.model,
        brand: customForm.brand,
        type: customForm.type,
        quantity: qty,
      },
    ]);
    setCustomForm({
      category: '',
      itemName: '',
      model: '',
      brand: '',
      type: '',
      quantity: '',
    });
  };

  const handleRemoveCustomItem = (id) => {
    setCustomItems((prev) => prev.filter((item) => item.id !== id));
    setCart((prev) => {
      if (!prev[id]) return prev;
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const openReviewScreen = () => {
    if (!cartLines.length) {
      alert('Add at least one item to the cart.');
      return;
    }
    setReviewRows(
      cartLines.map((line) => ({
        key: `${line.id}-${Date.now()}-${Math.random()}`,
        id: line.id,
        name: line.name,
        unit: line.unit,
        qty: line.qty,
        rate: line.rate,
        discPct: 0,
        taxPct: 18,
      }))
    );
    setReviewMeta({
      vendor: meta.vendor,
      project: meta.project,
      incharge: meta.incharge,
      needBy: meta.needBy || '-',
      poNumber: poDetails.number,
      poDate: poDetails.date,
    });
    setStep('review');
    setCartSheetOpen(false);
  };

  const handleReviewRowChange = (key, field, value) => {
    setReviewRows((rows) =>
      rows.map((row) =>
        row.key === key
          ? {
              ...row,
              [field]:
                field === 'name' || field === 'unit' ? value : value === '' ? '' : Number(value),
            }
          : row
      )
    );
  };

  const handleRemoveReviewRow = (key) => {
    setReviewRows((rows) => rows.filter((row) => row.key !== key));
  };

  const handleAddReviewRow = () => {
    setReviewRows((rows) => [
      ...rows,
      {
        key: `manual-${Date.now()}`,
        id: 'NEW',
        name: 'New item',
        unit: 'unit',
        qty: 1,
        rate: 0,
        discPct: 0,
        taxPct: 18,
      },
    ]);
  };

  const handleGeneratePO = () => {
    alert('PO generated (mock). Connect this action to backend.');
  };

  const showCartBar = step === 'items' && cartSummary.items > 0;
  const showReview = step === 'review';

  const renderChips = (list) => {
    if (!list.length) return <span className="chip empty">No entries yet</span>;
    return list.sort().map((entry) => (
      <span key={entry} className="chip">
        {entry}
      </span>
    ));
  };

  const inlineEditable = (field) => ({
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur: (event) => {
      const value = event.target.textContent || '';
      setReviewMeta((prev) => ({ ...prev, [field]: value }));
    },
  });

  return (
    <div className="test-po-wrapper">
      {step === 'items' && (
        <div id="screenItems" className="test-po-root">
          <header className="app-header">
            <div className="app-title-block">
              <div className="app-title">Create Purchase Order</div>
              <div className="app-subtitle">
                Step 1 • Select items and build PO cart
              </div>
            </div>
            <div className="step-pill">1 / 3 • Items</div>
          </header>
          <section className="meta-card">
            <div className="meta-row">
              <div className="field">
                <label htmlFor="vendor">Vendor</label>
                <select
                  id="vendor"
                  className="field-select"
                  value={meta.vendor}
                  onChange={(e) =>
                    setMeta((prev) => ({ ...prev, vendor: e.target.value }))
                  }
                >
                  {vendors.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="project">Project / Site</label>
                <select
                  id="project"
                  className="field-select"
                  value={meta.project}
                  onChange={(e) =>
                    setMeta((prev) => ({ ...prev, project: e.target.value }))
                  }
                >
                  {projects.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="meta-row">
              <div className="field">
                <label htmlFor="incharge">Site Incharge</label>
                <select
                  id="incharge"
                  className="field-select"
                  value={meta.incharge}
                  onChange={(e) =>
                    setMeta((prev) => ({ ...prev, incharge: e.target.value }))
                  }
                >
                  {incharges.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="needBy">Need by</label>
                <input
                  id="needBy"
                  type="date"
                  className="field-input"
                  value={meta.needBy}
                  onChange={(e) =>
                    setMeta((prev) => ({ ...prev, needBy: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="badge-row">
              <span className="small-pill">PO Date: Today</span>
              <span className="small-pill">PO Type: Materials</span>
            </div>
          </section>
          <div className="search-bar">
            <span className="search-icon" role="img" aria-label="search">
              🔍
            </span>
            <input
              id="searchInput"
              type="text"
              placeholder="Search item by name, code or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <section className="catalog-wrapper">
            <div className="catalog-header">
              <div>
                <strong>Item Catalog</strong> • Tap + add to PO
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="add-input-btn"
                  type="button"
                  onClick={() => setAddOverlayOpen(true)}
                >
                  + Add New Item
                </button>
                <div className="tab-row">
                  {tabFilters.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      className={`tab ${activeTab === tab ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <ul className="item-list" id="itemList">
              {filteredItems.map((item) => (
                <li
                  key={item.id}
                  className="item-card"
                  data-id={item.id}
                  data-category={item.category}
                >
                  <div className="item-top">
                    <div className="item-name-group">
                      <div className="item-name">{item.name}</div>
                      <div className="item-meta">{item.meta}</div>
                    </div>
                    <div className="item-badge">{item.category}</div>
                  </div>
                  <div className="item-bottom">
                    <div className="rate-text">
                      {formatCurrency(item.rate)}
                      <span>{item.rateLabel}</span>
                    </div>
                    <div className="qty-row">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={qtyDraft[item.id] ?? item.defaultQty ?? 1}
                        className="qty-input"
                        onChange={(e) =>
                          setQtyDraft((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                      />
                      <button
                        className="add-btn"
                        type="button"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add
                      </button>
                      {cart[item.id] && (
                        <span className="in-cart-pill">
                          {cart[item.id].qty} {cart[item.id].unit} in cart
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {!filteredItems.length && (
                <li className="empty-text">No items match your filters.</li>
              )}
            </ul>
          </section>
        </div>
      )}

      {showCartBar && (
        <div className="cart-bar" id="cartBar" style={{ display: 'flex' }}>
          <div className="cart-bar-inner">
            <div className="cart-bar-text">
              <strong id="cartBarTitle">
                {cartSummary.items} item{cartSummary.items !== 1 ? 's' : ''} in PO cart
              </strong>
              <span className="cart-bar-sub" id="cartBarSub">
                Total qty: {cartSummary.totalQty} • Value: {formatCurrency(cartSummary.totalValue)}
              </span>
            </div>
            <button
              className="cart-bar-btn"
              type="button"
              onClick={() => setCartSheetOpen(true)}
            >
              Review Cart →
            </button>
          </div>
        </div>
      )}

      <div className={`sheet-backdrop ${cartSheetOpen ? 'open' : ''}`} id="cartSheetBackdrop" onClick={(e) => {
        if (e.target.classList.contains('sheet-backdrop')) {
          setCartSheetOpen(false);
        }
      }}>
        <div className={`sheet ${cartSheetOpen ? 'open' : ''}`} id="cartSheet">
          <div className="sheet-handle" />
          <div className="sheet-header">
            <div>
              <div className="sheet-title">PO Cart</div>
              <div className="sheet-subtitle" id="sheetSubtitle">
                Items selected for this PO
              </div>
            </div>
            <button
              className="sheet-close-btn"
              type="button"
              onClick={() => setCartSheetOpen(false)}
            >
              Close
            </button>
          </div>
          <ul className="cart-items" id="cartItems">
            {!cartLines.length && (
              <li style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                No items in cart. Add items from the list.
              </li>
            )}
            {cartLines.map((line) => (
              <li key={line.id} className="cart-item-row">
                <div className="cart-item-top">
                  <div>
                    <div className="cart-item-name">{line.name}</div>
                    <div className="cart-item-meta">
                      {line.id} • {line.category}
                    </div>
                  </div>
                  <div className="cart-item-meta">
                    {formatCurrency(line.rate)} / {line.unit}
                  </div>
                </div>
                <div className="cart-item-bottom">
                  <div className="cart-qty-group">
                    <span>Qty</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="cart-qty-input"
                      value={line.qty}
                      onChange={(e) => handleCartQtyChange(line.id, e.target.value)}
                    />
                    <span>{line.unit}</span>
                    <button
                      className="cart-remove-btn"
                      type="button"
                      onClick={() => handleRemoveFromCart(line.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="cart-line-total">
                    {formatCurrency(line.qty * line.rate)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="sheet-footer">
            <div className="sheet-summary-row">
              <span>Total items</span>
              <span id="summaryItems">{cartSummary.items}</span>
            </div>
            <div className="sheet-summary-row">
              <span>Total quantity</span>
              <span id="summaryQty">{cartSummary.totalQty}</span>
            </div>
            <div className="sheet-summary-row">
              <span>
                <strong>Estimated PO value</strong>
              </span>
              <span id="summaryTotal">
                <strong>{formatCurrency(cartSummary.totalValue)}</strong>
              </span>
            </div>
            <div className="sheet-footer-actions">
              <button
                className="sheet-btn outline"
                type="button"
                onClick={handleClearCart}
                disabled={!cartLines.length}
              >
                Clear cart
              </button>
              <button
                className="sheet-btn primary"
                type="button"
                onClick={openReviewScreen}
                disabled={!cartLines.length}
              >
                Next: Review &amp; Generate →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`add-overlay ${addOverlayOpen ? 'open' : ''}`} id="addInputOverlay" onClick={(e) => {
        if (e.target.classList.contains('add-overlay')) {
          setAddOverlayOpen(false);
        }
      }}>
        <div className="add-panel">
          <div className="add-panel-header">
            <div className="add-panel-title-block">
              <div className="add-panel-title">Add Input</div>
              <div className="add-panel-subtitle">
                Add Category, Item Name, Model, Brand, Type, Quantity
              </div>
            </div>
            <button
              className="add-panel-close-btn"
              type="button"
              onClick={() => setAddOverlayOpen(false)}
            >
              Close
            </button>
          </div>
          <section className="lists-card">
            <div className="lists-row">
              <span className="lists-label">Category list</span>
              <div className="chip-row" id="inputListCategory">
                {renderChips(chipData.category)}
              </div>
            </div>
            <div className="lists-row">
              <span className="lists-label">Item Name list</span>
              <div className="chip-row" id="inputListItemName">
                {renderChips(chipData.itemName)}
              </div>
            </div>
            <div className="lists-row">
              <span className="lists-label">Model list</span>
              <div className="chip-row" id="inputListModel">
                {renderChips(chipData.model)}
              </div>
            </div>
            <div className="lists-row">
              <span className="lists-label">Brand list</span>
              <div className="chip-row" id="inputListBrand">
                {renderChips(chipData.brand)}
              </div>
            </div>
            <div className="lists-row">
              <span className="lists-label">Type list</span>
              <div className="chip-row" id="inputListType">
                {renderChips(chipData.type)}
              </div>
            </div>
          </section>
          <section className="form-card">
            <div className="form-header">
              <div>
                <strong style={{ fontSize: '0.8rem' }}>New Input</strong>
                <small>Fill details and add to Catalog</small>
              </div>
            </div>
            <div className="form-row">
              <div className="field-small">
                <label htmlFor="inputCategory">Category</label>
                <input
                  id="inputCategory"
                  className="field-small-input"
                  type="text"
                  placeholder="e.g. Cement, Steel"
                  value={customForm.category}
                  onChange={(e) =>
                    setCustomForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                />
              </div>
              <div className="field-small">
                <label htmlFor="inputItemName">Item Name</label>
                <input
                  id="inputItemName"
                  className="field-small-input"
                  type="text"
                  placeholder="e.g. OPC 53 Grade Cement"
                  value={customForm.itemName}
                  onChange={(e) =>
                    setCustomForm((prev) => ({ ...prev, itemName: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="form-row">
              <div className="field-small">
                <label htmlFor="inputModel">Model</label>
                <input
                  id="inputModel"
                  className="field-small-input"
                  type="text"
                  placeholder="e.g. OPC-53"
                  value={customForm.model}
                  onChange={(e) =>
                    setCustomForm((prev) => ({ ...prev, model: e.target.value }))
                  }
                />
              </div>
              <div className="field-small">
                <label htmlFor="inputBrand">Brand</label>
                <input
                  id="inputBrand"
                  className="field-small-input"
                  type="text"
                  placeholder="e.g. Ramco, Ultratech"
                  value={customForm.brand}
                  onChange={(e) =>
                    setCustomForm((prev) => ({ ...prev, brand: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="form-row">
              <div className="field-small">
                <label htmlFor="inputType">Type</label>
                <input
                  id="inputType"
                  className="field-small-input"
                  type="text"
                  placeholder="e.g. Material / Service"
                  value={customForm.type}
                  onChange={(e) =>
                    setCustomForm((prev) => ({ ...prev, type: e.target.value }))
                  }
                />
              </div>
              <div className="field-small">
                <label htmlFor="inputQuantity">Quantity</label>
                <input
                  id="inputQuantity"
                  className="field-small-input"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 50"
                  value={customForm.quantity}
                  onChange={(e) =>
                    setCustomForm((prev) => ({ ...prev, quantity: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomItem();
                    }
                  }}
                />
              </div>
            </div>
            <button className="primary-btn" type="button" onClick={handleAddCustomItem}>
              <span>＋</span> Add to Catalog
            </button>
          </section>
          <section className="table-card">
            <div className="table-header">
              <strong style={{ fontSize: '0.8rem' }}>Added Inputs</strong>
              <small id="inputCountLabel">
                {customItems.length} item{customItems.length === 1 ? '' : 's'}
              </small>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Item Name</th>
                    <th>Model</th>
                    <th>Brand</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Quantity</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {!customItems.length && (
                    <tr>
                      <td colSpan={7} className="empty-text">
                        No items added yet. Use the form above to create your first entry.
                      </td>
                    </tr>
                  )}
                  {customItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.category}</td>
                      <td>{item.itemName}</td>
                      <td>{item.model}</td>
                      <td>{item.brand}</td>
                      <td>{item.type}</td>
                      <td className="qty-cell">{item.quantity}</td>
                      <td>
                        <button
                          className="remove-btn"
                          type="button"
                          onClick={() => handleRemoveCustomItem(item.id)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <div className="bottom-note">
            When you add here, a new item card is created in the PO catalog.
          </div>
        </div>
      </div>

      {showReview && (
        <>
          <div id="screenReview" className="test-po-root" style={{ display: 'flex' }}>
            <header className="app-header">
              <div className="app-title-block">
                <div className="app-title">Review Purchase Order</div>
                <div className="app-subtitle">
                  Step 2 • Verify items, amounts &amp; terms
                </div>
              </div>
              <div className="step-pill">2 / 3 • Review</div>
            </header>
            <section className="summary-card">
              <div className="summary-top-row">
                <div className="summary-col">
                  <span className="label">Vendor</span>
                  <span className="value editable" {...inlineEditable('vendor')}>
                    {reviewMeta.vendor}
                  </span>
                </div>
                <div className="summary-col">
                  <span className="label">Project / Site</span>
                  <span className="value editable" {...inlineEditable('project')}>
                    {reviewMeta.project}
                  </span>
                </div>
                <div className="summary-col">
                  <span className="label">Site Incharge</span>
                  <span className="value editable" {...inlineEditable('incharge')}>
                    {reviewMeta.incharge}
                  </span>
                </div>
              </div>
              <div className="summary-top-row">
                <div className="summary-col">
                  <span className="label">PO No.</span>
                  <span className="value editable" {...inlineEditable('poNumber')}>
                    {reviewMeta.poNumber}
                  </span>
                </div>
                <div className="summary-col">
                  <span className="label">PO Date</span>
                  <span className="value editable" {...inlineEditable('poDate')}>
                    {reviewMeta.poDate}
                  </span>
                </div>
                <div className="summary-col">
                  <span className="label">Need by</span>
                  <span className="value editable" {...inlineEditable('needBy')}>
                    {reviewMeta.needBy}
                  </span>
                </div>
              </div>
              <div className="pill-row">
                <span className="pill">Status: Draft</span>
                <span className="pill">Type: Materials + Service</span>
              </div>
            </section>
            <section className="items-card-review">
              <div className="items-header-review">
                <div>
                  <strong>Line Items</strong>
                  <span> • Edit qty, rate, discount, tax</span>
                </div>
                <button className="tiny-link-btn" type="button" onClick={handleAddReviewRow}>
                  + Add row
                </button>
              </div>
              <div className="table-wrapper-review">
                <table id="itemsTable">
                  <thead>
                    <tr>
                      <th style={{ width: '26%' }}>Item / Description</th>
                      <th style={{ width: '6%' }}>Unit</th>
                      <th style={{ width: '10%' }}>Qty</th>
                      <th style={{ width: '12%' }}>Rate</th>
                      <th style={{ width: '10%' }}>Disc %</th>
                      <th style={{ width: '10%' }}>Tax %</th>
                      <th style={{ width: '14%' }}>Amount</th>
                      <th style={{ width: '8%' }} />
                    </tr>
                  </thead>
                  <tbody>
                    {!reviewRows.length && (
                      <tr>
                        <td colSpan={8} className="empty-text">
                          No rows yet. Add items from the cart.
                        </td>
                      </tr>
                    )}
                    {reviewRows.map((row) => {
                      const qty = Number(row.qty) || 0;
                      const rate = Number(row.rate) || 0;
                      const discPct = Number(row.discPct) || 0;
                      const taxPct = Number(row.taxPct) || 0;
                      const base = qty * rate;
                      const disc = base * (discPct / 100);
                      const taxable = base - disc;
                      const tax = taxable * (taxPct / 100);
                      const total = taxable + tax;
                      return (
                        <tr key={row.key}>
                          <td>
                            <div
                              className="item-desc editable"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                handleReviewRowChange(row.key, 'name', e.target.textContent || '')
                              }
                            >
                              {row.name}
                            </div>
                            <div className="item-sub">Code: {row.id}</div>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="num-input"
                              value={row.unit}
                              onChange={(e) =>
                                handleReviewRowChange(row.key, 'unit', e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="num-input qty-input"
                              min="0"
                              step="0.1"
                              value={row.qty}
                              onChange={(e) =>
                                handleReviewRowChange(row.key, 'qty', e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="num-input rate-input"
                              min="0"
                              step="0.01"
                              value={row.rate}
                              onChange={(e) =>
                                handleReviewRowChange(row.key, 'rate', e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="num-input disc-input"
                              min="0"
                              step="0.1"
                              value={row.discPct}
                              onChange={(e) =>
                                handleReviewRowChange(row.key, 'discPct', e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="num-input tax-input"
                              min="0"
                              step="0.1"
                              value={row.taxPct}
                              onChange={(e) =>
                                handleReviewRowChange(row.key, 'taxPct', e.target.value)
                              }
                            />
                          </td>
                          <td className="amount-cell amount-output">
                            {formatCurrency(total)}
                          </td>
                          <td>
                            <button
                              className="remove-btn"
                              type="button"
                              onClick={() => handleRemoveReviewRow(row.key)}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <small style={{ fontSize: '0.7rem', color: '#9ca3af', padding: '0 2px' }}>
                Amount = (Qty × Rate − Discount) + Tax. Edit on this screen before generating PO.
              </small>
            </section>
            <section className="terms-card">
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <strong style={{ fontSize: '0.8rem' }}>Terms &amp; Delivery</strong>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                  Optional but recommended
                </span>
              </div>
              <div className="terms-row">
                <div className="terms-field">
                  <span className="label">Payment terms</span>
                  <input
                    className="terms-input"
                    type="text"
                    value={terms.payment}
                    onChange={(e) =>
                      setTerms((prev) => ({ ...prev, payment: e.target.value }))
                    }
                  />
                </div>
                <div className="terms-field">
                  <span className="label">Transport / unloading</span>
                  <input
                    className="terms-input"
                    type="text"
                    value={terms.transport}
                    onChange={(e) =>
                      setTerms((prev) => ({ ...prev, transport: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="terms-row">
                <div className="terms-field">
                  <span className="label">Delivery address</span>
                  <textarea
                    className="terms-textarea"
                    value={terms.address}
                    onChange={(e) =>
                      setTerms((prev) => ({ ...prev, address: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="terms-row">
                <div className="terms-field">
                  <span className="label">PO notes / special instructions</span>
                  <textarea
                    className="terms-textarea"
                    value={terms.notes}
                    onChange={(e) =>
                      setTerms((prev) => ({ ...prev, notes: e.target.value }))
                    }
                  />
                </div>
              </div>
            </section>
            <section className="totals-card">
              <div className="totals-row">
                <span>Sub-total (before discount)</span>
                <span id="subTotal">{formatCurrency(reviewTotals.subTotal)}</span>
              </div>
              <div className="totals-row">
                <span>Discount total</span>
                <span id="discountTotal">{formatCurrency(reviewTotals.discount)}</span>
              </div>
              <div className="totals-row">
                <span>Taxable value</span>
                <span id="taxableTotal">{formatCurrency(reviewTotals.taxable)}</span>
              </div>
              <div className="totals-row">
                <span>Tax total (CGST+SGST/IGST)</span>
                <span id="taxTotal">{formatCurrency(reviewTotals.tax)}</span>
              </div>
              <div className="totals-row total">
                <span>
                  <strong>Grand Total</strong>
                </span>
                <span id="grandTotal">
                  <strong>{formatCurrency(reviewTotals.grand)}</strong>
                </span>
              </div>
            </section>
          </div>
          <div className="bottom-actions" id="bottomActions" style={{ display: 'flex' }}>
            <div className="bottom-actions-inner">
              <button
                className="action-btn secondary"
                type="button"
                onClick={() => setStep('items')}
              >
                ← Back to Items
              </button>
              <button className="action-btn primary" type="button" onClick={handleGeneratePO}>
                Generate PO →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TestPurchaseOrder;

