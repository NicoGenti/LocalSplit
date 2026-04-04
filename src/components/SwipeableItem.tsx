import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const SNAP_BACK_THRESHOLD = 30;
const REVEAL_THRESHOLD = 70;
const FULL_THRESHOLD = 180;
const REVEAL_WIDTH = 80;
const FAST_VELOCITY = 0.4; // px/ms

interface SwipeableItemProps {
  id: string;
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  editLabel: string;
  deleteLabel: string;
  disabled?: boolean;
  isGroupActive: boolean;
  onBecomeActive: () => void;
  onBecomeInactive: () => void;
}

export function SwipeableItem({
  children,
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
  disabled = false,
  isGroupActive,
  onBecomeActive,
  onBecomeInactive,
}: SwipeableItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const currentDxRef = useRef(0);
  const revealedOffsetRef = useRef(0);
  const directionLockedRef = useRef<'horizontal' | 'vertical' | null>(null);

  // Stable refs to latest callback/state to avoid stale closures in native listeners
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const onEditRef = useRef(onEdit);
  onEditRef.current = onEdit;
  const onDeleteRef = useRef(onDelete);
  onDeleteRef.current = onDelete;
  const onBecomeActiveRef = useRef(onBecomeActive);
  onBecomeActiveRef.current = onBecomeActive;
  const onBecomeInactiveRef = useRef(onBecomeInactive);
  onBecomeInactiveRef.current = onBecomeInactive;

  const snapTo = useCallback((target: number) => {
    revealedOffsetRef.current = target;
    setIsAnimating(true);
    setTranslateX(target);
    if (target === 0) {
      onBecomeInactiveRef.current();
    } else {
      onBecomeActiveRef.current();
    }
  }, []);

  const triggerAction = useCallback((direction: 'edit' | 'delete') => {
    const exitX = direction === 'edit' ? window.innerWidth : -window.innerWidth;
    revealedOffsetRef.current = 0;
    setIsAnimating(true);
    setTranslateX(exitX);
    setTimeout(() => {
      setTranslateX(0);
      setIsAnimating(false);
      if (direction === 'edit') {
        onEditRef.current();
      } else {
        onDeleteRef.current();
      }
      onBecomeInactiveRef.current();
    }, 220);
  }, []);

  // When another item in the group becomes active, snap back to 0
  useEffect(() => {
    if (isGroupActive && revealedOffsetRef.current !== 0) {
      revealedOffsetRef.current = 0;
      setIsAnimating(true);
      setTranslateX(0);
    }
  }, [isGroupActive]);

  // Non-passive native touchmove listener to allow e.preventDefault() for scroll blocking
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleNativeTouchMove = (e: TouchEvent) => {
      if (disabledRef.current || !touchStartRef.current) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;

      if (!directionLockedRef.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        if (Math.abs(dy) > Math.abs(dx) * 1.5) {
          directionLockedRef.current = 'vertical';
        } else {
          directionLockedRef.current = 'horizontal';
        }
      }

      if (directionLockedRef.current !== 'horizontal') return;

      e.preventDefault();
      currentDxRef.current = dx;

      const rawPos = dx + revealedOffsetRef.current;
      const max = FULL_THRESHOLD + 20;
      const clamped = Math.max(-max, Math.min(max, rawPos));
      setTranslateX(clamped);
      setIsAnimating(false);
    };

    el.addEventListener('touchmove', handleNativeTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', handleNativeTouchMove);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabledRef.current) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    currentDxRef.current = 0;
    directionLockedRef.current = null;
    setIsAnimating(false);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (disabledRef.current || !touchStartRef.current || directionLockedRef.current !== 'horizontal') {
      touchStartRef.current = null;
      return;
    }

    const dx = currentDxRef.current;
    const elapsed = Date.now() - touchStartRef.current.time;
    const velocity = Math.abs(dx) / Math.max(elapsed, 1);
    touchStartRef.current = null;

    const absDx = Math.abs(dx);

    if (absDx > FULL_THRESHOLD || velocity > FAST_VELOCITY) {
      if (dx > 0) {
        triggerAction('edit');
      } else if (dx < 0) {
        triggerAction('delete');
      } else {
        snapTo(0);
      }
      return;
    }

    const effectivePos = dx + revealedOffsetRef.current;
    if (effectivePos > REVEAL_THRESHOLD) {
      snapTo(REVEAL_WIDTH);
    } else if (effectivePos < -REVEAL_THRESHOLD) {
      snapTo(-REVEAL_WIDTH);
    } else {
      snapTo(0);
    }
  }, [triggerAction, snapTo]);

  const handleActionClick = useCallback((action: 'edit' | 'delete', e: React.MouseEvent) => {
    e.stopPropagation();
    triggerAction(action);
  }, [triggerAction]);

  const absTranslate = Math.abs(translateX);
  const progress = Math.min(absTranslate / FULL_THRESHOLD, 1);
  const isNearFull = absTranslate > FULL_THRESHOLD * 0.65;
  const panelScale = 0.85 + progress * 0.2;
  const editVisible = translateX > 2;
  const deleteVisible = translateX < -2;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Left panel: Edit */}
      <div
        className={`absolute inset-y-0 left-0 flex items-center justify-center px-4 rounded-l-lg transition-colors cursor-pointer ${
          isNearFull && editVisible ? 'bg-blue-600' : 'bg-blue-500'
        }`}
        style={{
          width: Math.max(absTranslate, 0),
          opacity: editVisible ? Math.min(absTranslate / REVEAL_WIDTH, 1) : 0,
        }}
        onClick={(e) => handleActionClick('edit', e)}
      >
        <div
          style={{ transform: `scale(${panelScale})`, transition: isAnimating ? 'transform 0.18s ease' : 'none' }}
          className="flex flex-col items-center gap-0.5 pointer-events-none"
        >
          <Edit2 size={18} className="text-white" />
          <span className="text-white text-[10px] font-semibold uppercase tracking-wide leading-none">
            {editLabel}
          </span>
        </div>
      </div>

      {/* Right panel: Delete */}
      <div
        className={`absolute inset-y-0 right-0 flex items-center justify-center px-4 rounded-r-lg transition-colors cursor-pointer ${
          isNearFull && deleteVisible ? 'bg-red-600' : 'bg-red-500'
        }`}
        style={{
          width: Math.max(absTranslate, 0),
          opacity: deleteVisible ? Math.min(absTranslate / REVEAL_WIDTH, 1) : 0,
        }}
        onClick={(e) => handleActionClick('delete', e)}
      >
        <div
          style={{ transform: `scale(${panelScale})`, transition: isAnimating ? 'transform 0.18s ease' : 'none' }}
          className="flex flex-col items-center gap-0.5 pointer-events-none"
        >
          <Trash2 size={18} className="text-white" />
          <span className="text-white text-[10px] font-semibold uppercase tracking-wide leading-none">
            {deleteLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isAnimating ? 'transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          willChange: 'transform',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
