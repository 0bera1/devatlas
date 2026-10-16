'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { NotificationsMenu } from '@/components/notifications/notifications-menu';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { MessageKey } from '@/i18n';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ModeLink {
  readonly href: string;
  readonly label: MessageKey;
  readonly match: string;
}

/** Üst mod çubuğu: Bugün, Kitaplık, Keşif, Bilgi. */
const MODES: readonly ModeLink[] = [
  { href: '/today', label: 'nav.today', match: '/today' },
  { href: '/documents', label: 'nav.library', match: '/documents' },
  { href: '/explore', label: 'nav.explore', match: '/explore' },
  { href: '/knowledge', label: 'nav.knowledge', match: '/knowledge' },
];

/** Uygulama kabuğu (B tasarımı): tek üst çubuk, ana alan ve küçük ekranlarda alt mod çubuğu. */
export function AppShell({ children }: { children: ReactNode }): ReactNode {
  const { t } = useTranslations();
  const pathname: string = usePathname() ?? '';

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/today" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="h-3 w-3 rounded-full bg-[var(--accent)]" aria-hidden />
            DevAtlas
          </Link>

          <nav aria-label="modes" className="mx-auto hidden items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 sm:flex">
            {MODES.map((mode) => {
              const active: boolean = pathname.startsWith(mode.match);
              return (
                <Link
                  key={mode.href}
                  href={mode.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                    active ? 'bg-[var(--foreground)] font-semibold text-[var(--background)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {t(mode.label)}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/search"
              aria-label={t('shell.search')}
              className="hidden h-9 items-center gap-2 rounded-full border border-[var(--border)] px-3 text-sm text-[var(--muted)] hover:text-[var(--foreground)] md:flex"
            >
              {t('shell.search')}
              <kbd className="rounded border border-[var(--border)] px-1 font-mono text-[10px]">⌘K</kbd>
            </Link>
            <Link href="/study" className="hidden text-sm text-[var(--muted)] hover:text-[var(--foreground)] md:inline">
              {t('nav.study')}
            </Link>
            <NotificationsMenu />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col pb-20 sm:pb-0">{children}</main>

      <nav
        aria-label="modes"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[var(--border)] bg-[var(--surface)] py-2 sm:hidden"
      >
        {MODES.map((mode) => {
          const active: boolean = pathname.startsWith(mode.match);
          return (
            <Link
              key={mode.href}
              href={mode.href}
              className={`text-center text-xs ${active ? 'font-semibold text-[var(--accent)]' : 'text-[var(--muted)]'}`}
            >
              {t(mode.label)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function AccountMenu(): ReactNode {
  const { t } = useTranslations();
  const { logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onClick = (event: MouseEvent): void => {
      if (rootRef.current !== null && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t('shell.account')}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface)] text-xs font-semibold ring-1 ring-[var(--border)]"
      >
        AD
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl">
          <Link href="/profile" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-[var(--background)]">
            {t('nav.profile')}
          </Link>
          <Link href="/settings" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-[var(--background)]">
            {t('nav.settings')}
          </Link>
          <Link href="/study/lists" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-[var(--background)]">
            {t('study.lists.link')}
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
              router.replace('/');
            }}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-[var(--background)]"
          >
            {t('nav.logout')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
