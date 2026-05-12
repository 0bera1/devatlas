'use client';

import { HomeShell } from '@/components/home/home-shell';
import { DocumentEditorView } from '@/components/documents/document-editor-view';
import { useTranslations } from '@/hooks/use-translations';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';

export default function DocumentEditorPage(): ReactNode {
  const { t } = useTranslations();
  const params = useParams();
  const rawId = params.id;
  const documentId = typeof rawId === 'string' ? rawId : rawId?.[0] ?? '';

  if (documentId.length === 0) {
    return (
      <HomeShell>
        <main className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t('editor.invalidLink')}
          </p>
        </main>
      </HomeShell>
    );
  }

  return (
    <HomeShell>
      <DocumentEditorView documentId={documentId} />
    </HomeShell>
  );
}
