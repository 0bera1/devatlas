'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Avatar } from './avatar';

export interface UserDropdownItem {
  readonly id: string;
  readonly label: string;
  readonly onSelect: () => void;
  readonly variant?: 'default' | 'danger';
}

export interface UserDropdownProps {
  readonly initials: string;
  readonly triggerAriaLabel: string;
  readonly items: readonly UserDropdownItem[];
  readonly className?: string;
}

export function UserDropdown({
  initials,
  triggerAriaLabel,
  items,
  className,
}: UserDropdownProps): ReactNode {
  const [open, setOpen] = useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuId: string = useId();

  const close = useCallback((): void => {
    setOpen(false);
  }, []);

  const toggle = useCallback((): void => {
    setOpen((prev: boolean) => !prev);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent): void => {
      const root: HTMLDivElement | null = rootRef.current;
      if (root === null) {
        return;
      }
      const target: EventTarget | null = event.target;
      if (target instanceof Node && !root.contains(target)) {
        close();
      }
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);

    return (): void => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className={`relative shrink-0${className !== undefined ? ` ${className}` : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500"
        aria-label={triggerAriaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
      >
        <Avatar initials={initials} />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[11.5rem] origin-top-right scale-100 rounded-xl border border-zinc-200 bg-white py-1 opacity-100 shadow-lg shadow-zinc-900/10 ring-1 ring-zinc-900/5 transition duration-150 ease-out dark:border-zinc-700 dark:bg-zinc-950 dark:ring-white/10"
        >
          {items.map((item: UserDropdownItem) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={`flex w-full items-center px-3 py-2 text-left text-sm font-medium transition-colors${
                item.variant === 'danger'
                  ? ' text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
                  : ' text-zinc-800 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-900'
              }`}
              onClick={() => {
                item.onSelect();
                close();
                triggerRef.current?.focus();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
