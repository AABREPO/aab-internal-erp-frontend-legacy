import { useRef, useEffect, useCallback } from 'react';

/**
 * Click-drag scroll with light momentum (matches Utility Hub electricity / expense DB tables).
 */
export function useUtilityHubTableDragScroll() {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });

  const cancelMomentum = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  }, []);

  const applyMomentum = useCallback(() => {
    if (!scrollRef.current) return;
    const friction = 0.95;
    const minVelocity = 0.1;
    const step = () => {
      const { x, y } = velocity.current;
      if (!scrollRef.current) return;
      if (Math.abs(x) > minVelocity || Math.abs(y) > minVelocity) {
        scrollRef.current.scrollLeft -= x * 20;
        scrollRef.current.scrollTop -= y * 20;
        velocity.current.x *= friction;
        velocity.current.y *= friction;
        animationFrame.current = requestAnimationFrame(step);
      } else {
        cancelMomentum();
      }
    };
    animationFrame.current = requestAnimationFrame(step);
  }, [cancelMomentum]);

  const handleMouseDown = useCallback(
    (e) => {
      if (!scrollRef.current) return;
      if (e.target.closest('button, a, input, select, textarea, [role="combobox"]')) return;
      isDragging.current = true;
      start.current = { x: e.clientX, y: e.clientY };
      scroll.current = {
        left: scrollRef.current.scrollLeft,
        top: scrollRef.current.scrollTop,
      };
      lastMove.current = {
        time: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };
      scrollRef.current.style.cursor = 'grabbing';
      scrollRef.current.style.userSelect = 'none';
      cancelMomentum();
    },
    [cancelMomentum]
  );

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const now = Date.now();
    const dt = now - lastMove.current.time || 16;
    velocity.current = {
      x: (e.clientX - lastMove.current.x) / dt,
      y: (e.clientY - lastMove.current.y) / dt,
    };
    scrollRef.current.scrollLeft = scroll.current.left - dx;
    scrollRef.current.scrollTop = scroll.current.top - dy;
    lastMove.current = {
      time: now,
      x: e.clientX,
      y: e.clientY,
    };
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current || !scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.style.cursor = '';
    scrollRef.current.style.userSelect = '';
    applyMomentum();
  }, [applyMomentum]);

  useEffect(() => () => cancelMomentum(), [cancelMomentum]);

  return {
    scrollRef,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp,
  };
}
