'use client';

import type { CollaborationConnection } from '@/domains/collaboration/collaborationDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

export interface CollaborationLiveStripProps {
  readonly connection: CollaborationConnection;
  readonly peerCount: number;
  readonly errorDetail: string | null;
  readonly onRetry: (() => void) | undefined;
  /** Bağlı ve 0 eş: genelde kanal hazır metni */
  readonly showSoloHint: boolean;
}

export function CollaborationLiveStrip(
  props: CollaborationLiveStripProps,
): ReactNode {
  const { connection, peerCount, errorDetail, onRetry, showSoloHint } = props;
  const { t } = useTranslations();

  if (connection === 'idle') {
    return null;
  }

  const dotClasses: string = ((): string => {
    switch (connection) {
      case 'connecting':
        return 'bg-amber-500 animate-pulse';
      case 'connected':
        return 'bg-emerald-500';
      case 'disconnected':
        return 'bg-zinc-400';
      case 'error':
        return 'bg-red-500';
      default: {
        const _exhaustive: never = connection;
        return _exhaustive;
      }
    }
  })();

  const message: string = ((): string => {
    switch (connection) {
      case 'connecting':
        return t('collaboration.statusConnecting');
      case 'connected': {
        if (peerCount > 0) {
          return t('collaboration.peersCount').replace(
            '{{count}}',
            String(peerCount),
          );
        }
        return showSoloHint
          ? t('collaboration.statusConnectedSolo')
          : t('collaboration.statusConnectedChannel');
      }
      case 'disconnected':
        return t('collaboration.statusDisconnected');
      case 'error':
        return t('collaboration.statusError');
      default: {
        const _exhaustive: never = connection;
        return _exhaustive;
      }
    }
  })();

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-xl border border-zinc-200/90 bg-gradient-to-r from-violet-50/90 to-white px-3 py-2.5 dark:border-zinc-700 dark:from-violet-950/40 dark:to-zinc-950/40">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${dotClasses}`}
          aria-hidden
        />
        <span className="text-xs font-medium leading-snug text-zinc-800 dark:text-zinc-200">
          {message}
        </span>
        {(connection === 'error' || connection === 'disconnected') &&
        onRetry !== undefined ? (
          <button
            type="button"
            onClick={() => {
              onRetry();
            }}
            className="ml-auto rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {t('collaboration.retry')}
          </button>
        ) : null}
      </div>
      {connection === 'error' && errorDetail !== null && errorDetail.length > 0 ? (
        <p className="text-[11px] leading-relaxed text-red-700 dark:text-red-400">
          {errorDetail}
        </p>
      ) : null}
    </div>
  );
}
