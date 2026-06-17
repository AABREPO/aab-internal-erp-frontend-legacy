import { useEffect, useRef, useState } from 'react';
import {
  fetchPaymentModeSelectOptionsForModule,
  fetchPaymentModesForModule,
  fetchModulePaymentModeArrangementList,
  subscribePaymentModeArrangementRefresh,
} from './paymentModeArrangement';

const useStableFallbackRef = (fallback) => {
  const ref = useRef(fallback);
  ref.current = fallback;
  return ref;
};

export const usePaymentModeSelectOptionsForModule = (moduleName, fallbackOptions = []) => {
  const fallbackRef = useStableFallbackRef(fallbackOptions);
  const [options, setOptions] = useState(() =>
    Array.isArray(fallbackOptions) ? fallbackOptions : []
  );

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!moduleName) return;
      const next = await fetchPaymentModeSelectOptionsForModule(
        moduleName,
        fallbackRef.current
      );
      if (active) setOptions(next);
    };
    run();
    const unsubscribe = subscribePaymentModeArrangementRefresh(run);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [moduleName]);

  return options;
};

export const usePaymentModesForModule = (moduleName, { fallbackModes = [] } = {}) => {
  const fallbackRef = useStableFallbackRef(fallbackModes);
  const [modes, setModes] = useState(() =>
    Array.isArray(fallbackModes) ? fallbackModes : []
  );

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!moduleName) return;
      const next = await fetchPaymentModesForModule(moduleName, {
        fallbackModes: fallbackRef.current,
      });
      if (active) setModes(next);
    };
    run();
    const unsubscribe = subscribePaymentModeArrangementRefresh(run);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [moduleName]);

  return modes;
};

export const useModulePaymentModeArrangementList = (moduleName) => {
  const [arrangementList, setArrangementList] = useState([]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!moduleName) return;
      const next = await fetchModulePaymentModeArrangementList(moduleName);
      if (active) setArrangementList(next);
    };
    run();
    const unsubscribe = subscribePaymentModeArrangementRefresh(run);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [moduleName]);

  return arrangementList;
};

export const usePaymentModeArrangementRefresh = (onRefresh) => {
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (!onRefreshRef.current) return undefined;
    const run = () => {
      onRefreshRef.current?.();
    };
    run();
    return subscribePaymentModeArrangementRefresh(run);
  }, []);
};
