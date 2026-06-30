/**
 * Desktop routes that use the Orbit ERP 1.6 pattern: one app-level top bar ({@link OrbitAppChrome} /
 * {@link OrbitERPHeading}) rendered from App.js — modules are only the body (no global bar inside each folder).
 * Keep in sync with App.js Route paths.
 */
export const ORBIT_APP_CHROME_PATH_PREFIXES = [
  "/expense-entry",
  "/designtool",
  "/invoice-bill",
  "/paints",
  "/rccal",
  "/bath",
  "/switch",
  "/weekly-payment",
  "/rent",
  "/masonary",
  "/carpentry",
  "/entrychecklist",
  "/purchaseorder",
  "/inventory",
  "/user_manage",
  "/attendance",
  "/portal",
  "/Claim",
  "/staffadvance",
  "/loan",
  "/tracker",
  "/master-data",
  "/bankreconciliation",
  "/orbit-erp",
  "/utility",
  "/bank-register",
  "/quotation",
  "/directory",
  "/toolsTracker",
  "/testtoolsTracker",
  "/testpurchaseorder",
];

export function isOrbitAppChromeRoute(pathname) {
  if (!pathname || typeof pathname !== "string") return false;
  return ORBIT_APP_CHROME_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
