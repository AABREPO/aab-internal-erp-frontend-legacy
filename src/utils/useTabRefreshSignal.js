import { useEffect, useRef } from 'react';

/**
 * Instant refetch when the user clicks a module tab (heading bumps refreshSignal).
 * Only the visible tab refetches so data appears immediately without waiting for Orbit sync.
 * Background module sync (every 60s) is handled separately via useOrbitPageSync.
 */
export function useTabRefreshSignal(refreshSignal, isActive, onRefresh) {
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (refreshSignal === undefined) return;
    if (!isActive) return;
    void onRefreshRef.current?.();
  }, [refreshSignal, isActive]);
}
