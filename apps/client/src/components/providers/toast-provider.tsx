'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ToastVariant = 'success' | 'error';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  leaving: boolean;
}

export interface ToastContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Ekranda kalma süresi (çıkış animasyonu bundan sonra başlar) */
const TOAST_VISIBLE_MS = 3400;
/** DOM’dan kaldırmadan önce çıkış animasyonunun süresi (CSS ile eşleşmeli) */
const TOAST_EXIT_ANIM_MS = 320;

function createToastId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function ToastProvider({ children }: { children: ReactNode }): ReactNode {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastsRef = useRef<ToastItem[]>([]);
  toastsRef.current = toasts;

  const dismissTimersRef = useRef<Map<string, number>>(new Map());
  const exitTimersRef = useRef<Map<string, number>>(new Map());
  const exitingIdsRef = useRef<Set<string>>(new Set());

  const clearDismissTimer = useCallback((id: string) => {
    const existing: number | undefined = dismissTimersRef.current.get(id);
    if (existing !== undefined) {
      window.clearTimeout(existing);
      dismissTimersRef.current.delete(id);
    }
  }, []);

  const beginExit = useCallback(
    (id: string) => {
      clearDismissTimer(id);
      if (exitingIdsRef.current.has(id)) {
        return;
      }

      const snapshot: ToastItem[] = toastsRef.current;
      const canExit: boolean = snapshot.some(
        (item: ToastItem) => item.id === id && !item.leaving,
      );
      if (!canExit) {
        return;
      }

      exitingIdsRef.current.add(id);
      setToasts((prev: ToastItem[]) =>
        prev.map((item: ToastItem) =>
          item.id === id && !item.leaving ? { ...item, leaving: true } : item,
        ),
      );

      const exitTimerId: number = window.setTimeout(() => {
        exitingIdsRef.current.delete(id);
        exitTimersRef.current.delete(id);
        setToasts((prev: ToastItem[]) =>
          prev.filter((item: ToastItem) => item.id !== id),
        );
      }, TOAST_EXIT_ANIM_MS);
      exitTimersRef.current.set(id, exitTimerId);
    },
    [clearDismissTimer],
  );

  const push = useCallback(
    (message: string, variant: ToastVariant) => {
      const id: string = createToastId();
      const item: ToastItem = { id, message, variant, leaving: false };
      setToasts((prev: ToastItem[]) => [...prev, item]);
      const dismissTimerId: number = window.setTimeout(() => {
        dismissTimersRef.current.delete(id);
        beginExit(id);
      }, TOAST_VISIBLE_MS);
      dismissTimersRef.current.set(id, dismissTimerId);
    },
    [beginExit],
  );

  useEffect(() => {
    return () => {
      dismissTimersRef.current.forEach((tid: number) => {
        window.clearTimeout(tid);
      });
      dismissTimersRef.current.clear();
      exitTimersRef.current.forEach((tid: number) => {
        window.clearTimeout(tid);
      });
      exitTimersRef.current.clear();
      exitingIdsRef.current.clear();
    };
  }, []);

  const value = useMemo(
    (): ToastContextValue => ({
      showSuccess: (message: string) => {
        push(message, 'success');
      },
      showError: (message: string) => {
        push(message, 'error');
      },
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-0 z-[100] flex w-full flex-col items-stretch gap-2 px-4 sm:bottom-6 sm:right-6 sm:max-w-sm sm:px-0"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((t: ToastItem) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md ${
              t.leaving ? 'devatlas-toast-exit' : 'devatlas-toast-enter'
            } ${
              t.variant === 'success'
                ? 'border-emerald-200/90 bg-emerald-50/95 text-emerald-950 dark:border-emerald-800/90 dark:bg-emerald-950/90 dark:text-emerald-50'
                : 'border-red-200/90 bg-red-50/95 text-red-950 dark:border-red-900/80 dark:bg-red-950/90 dark:text-red-100'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx === null) {
    throw new Error('useToast yalnızca ToastProvider içinde kullanılmalıdır');
  }
  return ctx;
}
