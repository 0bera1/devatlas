'use client';

import { DocumentEditorView } from '@/components/documents/document-editor-view';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';

export default function DocumentEditorPage(): ReactNode {
  const { t } = useTranslations();
  const params = useParams();
  const rawId = params.id;
  const documentId = typeof rawId === 'string' ? rawId : rawId?.[0] ?? '';

  if (documentId.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-sm text-[var(--muted)]">
          {t('editor.invalidLink')}
        </p>
      </div>
    );
  }

  return <DocumentEditorView documentId={documentId} />;
}
