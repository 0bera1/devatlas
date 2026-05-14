'use client';

import { DiagramEditorView } from '@/components/diagrams/diagram-editor-view';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';

export default function DiagramEditorPage(): ReactNode {
  const { t } = useTranslations();
  const params = useParams();
  const raw: unknown = params?.id;
  const diagramId: string = typeof raw === 'string' ? raw : '';

  if (diagramId.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center p-6 text-zinc-500 dark:text-zinc-400">
        {t('diagrams.editor.invalidId')}
      </main>
    );
  }

  return <DiagramEditorView diagramId={diagramId} />;
}
