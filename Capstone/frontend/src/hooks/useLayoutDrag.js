import { useState, useRef, useCallback } from 'react';

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function useLayoutDrag(onDrag) {
  const [isDragging, setIsDragging] = useState(false);
  const startRef = useRef(null);

  const onMouseDown = useCallback((e, direction) => {
    e.preventDefault();
    setIsDragging(true);
    startRef.current = direction === 'col' ? e.clientX : e.clientY;

    const move = (moveE) => {
      const current = direction === 'col' ? moveE.clientX : moveE.clientY;
      const delta = current - startRef.current;
      startRef.current = current;
      onDrag(delta);
    };

    const up = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [onDrag]);

  return { isDragging, onMouseDown };
}
