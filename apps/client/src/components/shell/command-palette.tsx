'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { MessageKey } from '@/i18n';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

interface PaletteItem {
  readonly href: string;
  readonly label: MessageKey;
}

const PAGES: readonly PaletteItem[] = [
  { href: '/today', label: 'nav.today' },
  { href: '/documents', label: 'nav.library' },
  { href: '/diagrams', label: 'nav.diagrams' },
  { href: '/explore', label: 'nav.explore' },
  { href: '/knowledge', label: 'nav.knowledge' },
  { href: '/study', label: 'nav.study' },
  { href: '/progress', label: 'nav.progress' },
  { href: '/study/lists', label: 'study.lists.link' },
  { href: '/search', label: 'shell.search' },
  { href: '/profile', label: 'nav.profile' },
  { href: '/settings', label: 'nav.settings' },
];

/** Kabuktaki arama düğmesinin paleti açmak için yaydığı olay. */
export const OPEN_PALETTE_EVENT = 'devatlas:open-palette';

/** Ctrl/⌘K ile açılan sayfa ve arama paleti. */
export function CommandPalette(): ReactNode {
  const { t } = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [active, setActive] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    const onOpen = (): void => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  const trimmed: string = query.trim();
  const matches: readonly PaletteItem[] = useMemo((): readonly PaletteItem[] => {
    const needle: string = trimmed.toLowerCase();
    return PAGES.filter((item) => t(item.label).toLowerCase().includes(needle));
  }, [trimmed, t]);

  // Metin varsa eşleşen sayfalar öne, tüm sonuçlar için arama en sona eklenir.
  const searchRow: PaletteItem = { href: `/search?q=${encodeURIComponent(trimmed)}`, label: 'shell.palette.searchFor' };
  const rows: readonly PaletteItem[] = trimmed.length > 0 ? [...matches, searchRow] : PAGES;

  const go = (href: string): void => {
    setOpen(false);
    router.push(href);
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('shell.palette.title')}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-palette-list"
          aria-activedescendant={`palette-row-${active}`}
          value={query}
          placeholder={t('shell.palette.placeholder')}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setActive((value) => Math.min(value + 1, rows.length - 1));
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActive((value) => Math.max(value - 1, 0));
            } else if (event.key === 'Enter') {
              const row = rows[active];
              if (row !== undefined) go(row.href);
            }
          }}
          className="w-full border-b border-[var(--border)] bg-transparent px-5 py-4 text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
        />
        <ul id="command-palette-list" role="listbox" className="max-h-80 overflow-y-auto p-2">
          {rows.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-[var(--muted)]">{t('shell.palette.empty')}</li>
          ) : (
            rows.map((row, index) => {
              const isActive: boolean = index === active;
              const label: string = row.label === 'shell.palette.searchFor'
                ? t(row.label).replace('{{query}}', trimmed)
                : t(row.label);
              return (
                <li
                  key={`${row.href}-${index}`}
                  id={`palette-row-${index}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(row.href)}
                  className={`cursor-pointer rounded-xl px-3 py-2.5 text-sm ${
                    isActive ? 'bg-[var(--background)] font-semibold text-[var(--foreground)]' : 'text-[var(--muted)]'
                  }`}
                >
                  {label}
                </li>
              );
            })
          )}
        </ul>
        <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-2.5 text-xs text-[var(--muted)]">
          <span>{t('shell.palette.hint')}</span>
          <button type="button" onClick={() => setOpen(false)} className="rounded px-2 py-1 hover:text-[var(--foreground)]">
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
