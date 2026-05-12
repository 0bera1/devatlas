'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAuth } from '@/components/providers/auth-provider';

export function HomeShell({ children }: { children: ReactNode }) {
  const { token, isReady, logout } = useAuth();
  const loggedIn = isReady && token !== null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
          >
            DevAtlas
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            {!isReady ? (
              <span className="text-zinc-400">…</span>
            ) : loggedIn ? (
              <>
                <span className="text-zinc-500 dark:text-zinc-400">
                  Oturum açık
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                  }}
                  className="rounded-lg px-3 py-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Giriş
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Kayıt ol
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
