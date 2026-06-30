/** Same admin list as AdvanceDatabase.js / AdvanceTableView.js */
export const ADVANCE_PORTAL_ADMIN_USERNAMES = ['Mahalingam M', 'Admin'];

export const isAdvancePortalAdmin = (username = '') => {
  const normalized = String(username || '').trim().toLowerCase();
  return ADVANCE_PORTAL_ADMIN_USERNAMES.some((name) => name.toLowerCase() === normalized);
};
