import { useEffect, useRef } from 'react';

export const LIVE_DATA_SYNC_MS = 20000;

/**
 * Silently refetches table data on an interval without reloading the page.
 * Pauses while the user is editing or a blocking modal is open.
 */
export const useLiveDataSync = (syncFn, isPaused = false) => {
    const syncRef = useRef(syncFn);
    const pauseRef = useRef(isPaused);

    syncRef.current = syncFn;
    pauseRef.current = isPaused;

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (pauseRef.current) return;
            void syncRef.current();
        }, LIVE_DATA_SYNC_MS);

        return () => clearInterval(intervalId);
    }, []);
};
