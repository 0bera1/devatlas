'use client';

import { documentApi } from '@/api/documents/documentApi';
import { useAuth } from '@/components/providers/auth-provider';
import { ANONYMOUS_VIEWER_STORAGE_KEY } from '@/lib/engagement/anonymous-viewer-id';
import type { DocumentVisibility } from '@/domains/documentsDomains';
import { useEffect } from 'react';

/**
 * PUBLIC doküman açıldığında günde en fazla bir kez görüntülenme sayar (anon veya oturum).
 */
export function useRecordPublicDocumentView(
  documentId: string,
  visibility: DocumentVisibility | undefined,
  hydrated: boolean,
): void {
  const { token, isReady } = useAuth();

  useEffect(() => {
    if (
      !isReady ||
      !hydrated ||
      visibility !== 'PUBLIC' ||
      documentId.length === 0
    ) {
      return;
    }

    void (async (): Promise<void> => {
      try {
        const anonymousId: string | null =
          typeof window !== 'undefined'
            ? window.localStorage.getItem(ANONYMOUS_VIEWER_STORAGE_KEY)
            : null;
        const res = await documentApi.recordView(
          documentId,
          token,
          anonymousId,
        );
        if (
          res.anonymousId !== undefined &&
          typeof window !== 'undefined'
        ) {
          window.localStorage.setItem(
            ANONYMOUS_VIEWER_STORAGE_KEY,
            res.anonymousId,
          );
        }
      } catch {
        /* sessiz: feed/analytics için kritik değil */
      }
    })();
  }, [documentId, hydrated, isReady, token, visibility]);
}
