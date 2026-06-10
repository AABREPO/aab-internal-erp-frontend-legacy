import { useEffect, useRef } from 'react';
import {
  registerOrbitPageRefresh,
  getOrbitModuleIdForPath,
  getOrbitModuleNotifyEvent,
  getOrbitModulePaths,
} from './orbitProjectDataSync';

/**
 * Keeps the visible table in sync with Orbit background sync.
 * Registers a refresh handler AND listens for sync events as a fallback.
 */
export function useOrbitPageSync(moduleId, onRefresh, deps = []) {
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (!moduleId) return undefined;

    const runRefresh = () => {
      void onRefreshRef.current?.();
    };

    const unregister = registerOrbitPageRefresh(moduleId, runRefresh);
    const notifyEvent = getOrbitModuleNotifyEvent(moduleId);
    const modulePaths = getOrbitModulePaths(moduleId);

    const handleModuleEvent = () => runRefresh();

    const handleOrbitSync = (event) => {
      const detail = event.detail || {};
      const path = String(detail.path || window.location.pathname || '');
      const onThisModulePage = modulePaths.some((prefix) => path.startsWith(prefix));
      const forThisModule = detail.moduleId === moduleId || onThisModulePage;

      if (detail.scope === 'all') {
        if (onThisModulePage || detail.moduleId === moduleId) runRefresh();
        return;
      }

      if (forThisModule) runRefresh();
    };

    if (notifyEvent) {
      window.addEventListener(notifyEvent, handleModuleEvent);
    }
    window.addEventListener('orbitProjectDataSync', handleOrbitSync);
    window.addEventListener('orbitPageTableRefresh', handleOrbitSync);

    return () => {
      unregister();
      if (notifyEvent) {
        window.removeEventListener(notifyEvent, handleModuleEvent);
      }
      window.removeEventListener('orbitProjectDataSync', handleOrbitSync);
      window.removeEventListener('orbitPageTableRefresh', handleOrbitSync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, ...deps]);
}

/** Convenience: refresh hook tied to the current browser route. */
export function useOrbitPageSyncForCurrentPath(onRefresh, deps = []) {
  const moduleId = getOrbitModuleIdForPath(window.location.pathname);
  useOrbitPageSync(moduleId, onRefresh, deps);
}
