/**
 * Single source of truth for “mobile layout” (componentsMobile) vs desktop.
 * Use 800px so viewports 769–799px are not stuck on desktop Advance/Loan, etc.
 */
export const MOBILE_MAX_WIDTH_PX = 800;

export function isMobileViewportWidth() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= MOBILE_MAX_WIDTH_PX;
}
