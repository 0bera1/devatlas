'use client';

import {
  isHttpNetworkError,
  isNotFoundHttpError,
} from '@/api/http/execute-request';
import { DocumentEditorSkeleton } from '@/components/documents/document-editor-skeleton';
import { DocumentsRoadmap } from '@/components/documents/documents-roadmap';
import { useToast } from '@/components/providers/toast-provider';
import type { DocumentVisibility } from '@/domains/documentsDomains';
import { useDocumentAutosave } from '@/hooks/use-document-autosave';
import { useDocumentEditorPermissions } from '@/hooks/use-document-editor-permissions';
import { useDocumentByIdQuery } from '@/features/documents/queries/useDocument';
import { usePatchDocumentMutation } from '@/features/documents/mutations/useDocumentMutation';
import { useFormatDocumentDate } from '@/hooks/use-format-document-date';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useTranslations } from '@/hooks/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';

interface DocumentEditorViewProps {
  documentId: string;
}

export function DocumentEditorView(props: DocumentEditorViewProps): ReactNode {
  const { documentId } = props;
  const { t } = useTranslations();
  const formatUpdatedAt = useFormatDocumentDate();
  const { showError } = useToast();
  const { canRender } = useRequireAuth();

  const {
    data,
    isPending: docPending,
    isError: docIsError,
    error: docError,
  } = useDocumentByIdQuery(documentId, canRender);

  const { permissionReady, canEdit } = useDocumentEditorPermissions(
    canRender,
    data?.ownerId ?? '',
  );

  const { mutateAsync: patchDocumentAsync, isPending: visibilitySaving } =
    usePatchDocumentMutation();

  const [titleDraft, setTitleDraft] = useState<string>('');
  const [contentDraft, setContentDraft] = useState<string>('');
  const [visibilityDraft, setVisibilityDraft] =
    useState<DocumentVisibility>('PRIVATE');
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    if (data === undefined || data.id !== documentId) {
      setHydrated(false);
      return;
    }
    setTitleDraft(data.title);
    setContentDraft(data.content);
    setVisibilityDraft(data.visibility);
    setHydrated(true);
  }, [data, documentId]);

  const onVisibilityChange = useCallback(
    async (next: DocumentVisibility): Promise<void> => {
      if (!canEdit || data === undefined) {
        return;
      }
      setVisibilityDraft(next);
      try {
        const record = await patchDocumentAsync({
          documentId,
          patch: { visibility: next },
        });
        setVisibilityDraft(record.visibility);
      } catch (err: unknown) {
        setVisibilityDraft(data.visibility);
        const msg: string = isHttpNetworkError(err)
          ? t('errors.network')
          : err instanceof Error
            ? err.message
            : t('documents.editor.autosaveError');
        showError(msg);
      }
    },
    [canEdit, data, documentId, patchDocumentAsync, showError, t],
  );

  const autosave = useDocumentAutosave({
    documentId,
    titleDraft,
    contentDraft,
    serverRecord: data,
    enabled:
      canRender &&
      permissionReady &&
      canEdit &&
      hydrated &&
      data !== undefined &&
      data.id === documentId,
  });

  if (!canRender) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-zinc-500 dark:text-zinc-400">
        {t('common.loading')}
      </main>
    );
  }

  if (docPending && data === undefined) {
    return <DocumentEditorSkeleton />;
  }

  if (docIsError && docError !== null && isNotFoundHttpError(docError)) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
        <p className="text-zinc-800 dark:text-zinc-200">
          {t('documents.editor.notFound')}
        </p>
        <Link
          href="/documents"
          className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          {t('documents.editor.backToList')}
        </Link>
      </main>
    );
  }

  if (docIsError && docError !== null) {
    const loadMsg: string = isHttpNetworkError(docError)
      ? t('errors.network')
      : docError.message;
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
        <p className="text-sm text-red-600 dark:text-red-400">{loadMsg}</p>
        <Link
          href="/documents"
          className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          {t('documents.editor.backToList')}
        </Link>
      </main>
    );
  }

  if (data === undefined) {
    return null;
  }

  const document = data;
  const readOnly: boolean = !permissionReady || !canEdit;

  const autosaveLabel: string | null =
    readOnly
      ? null
      : autosave.status === 'saving'
        ? t('documents.editor.autosaveSaving')
        : autosave.status === 'saved'
          ? t('documents.editor.autosaveSaved')
          : autosave.status === 'error' && autosave.errorMessage !== null
            ? autosave.errorMessage
            : null;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10 lg:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/documents"
            className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            {t('documents.editor.backDocuments')}
          </Link>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {t('documents.editor.lastUpdated')}:{' '}
            {formatUpdatedAt(document.updatedAt)}
          </span>
          {readOnly && permissionReady ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {t('documents.editor.readOnly')}
            </span>
          ) : null}
          {!permissionReady ? (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('documents.editor.permissionLoading')}
            </span>
          ) : null}
          {autosaveLabel !== null ? (
            <span
              className={
                autosave.status === 'error'
                  ? 'text-xs font-medium text-red-600 dark:text-red-400'
                  : autosave.status === 'saved'
                    ? 'text-xs font-medium text-emerald-600 dark:text-emerald-400'
                    : 'text-xs font-medium text-amber-600 dark:text-amber-400'
              }
              role="status"
            >
              {autosaveLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(260px,320px)] lg:items-start">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <label className="block min-w-0 flex-1">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {t('documents.editor.titleLabel')}
                </span>
                <input
                  type="text"
                  value={titleDraft}
                  readOnly={readOnly}
                  onChange={(e) => {
                    setTitleDraft(e.target.value);
                  }}
                  aria-invalid={autosave.titleBlocked}
                  className={
                    autosave.titleBlocked
                      ? 'mt-2 w-full rounded-xl border border-red-400 bg-white px-3 py-2 text-lg font-semibold text-zinc-950 outline-none focus:ring-2 focus:ring-red-400 dark:border-red-600 dark:bg-zinc-950 dark:text-zinc-50'
                      : 'mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-lg font-semibold text-zinc-950 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 read-only:bg-zinc-50 read-only:text-zinc-600 dark:read-only:bg-zinc-900 dark:read-only:text-zinc-300'
                  }
                />
              </label>
              <label className="block shrink-0 sm:w-44">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {t('documents.editor.visibilityLabel')}
                </span>
                <select
                  value={visibilityDraft}
                  disabled={readOnly || visibilitySaving}
                  onChange={(e) => {
                    const v = e.target.value as DocumentVisibility;
                    void onVisibilityChange(v);
                  }}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                >
                  <option value="PRIVATE">
                    {t('documents.visibilityPrivate')}
                  </option>
                  <option value="PUBLIC">
                    {t('documents.visibilityPublic')}
                  </option>
                </select>
              </label>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {readOnly
                ? t('documents.editor.readOnlyHint')
                : t('documents.editor.autosaveHintTitle')}
            </p>
          </section>

          <section className="flex flex-1 flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t('documents.editor.content')}
            </h2>
            <textarea
              value={contentDraft}
              readOnly={readOnly}
              onChange={(e) => {
                setContentDraft(e.target.value);
              }}
              rows={18}
              placeholder={t('documents.editor.contentPlaceholder')}
              className="mt-3 min-h-[280px] w-full flex-1 resize-y rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 font-mono text-sm leading-relaxed text-zinc-950 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-50 read-only:cursor-default read-only:opacity-90"
            />
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              {readOnly
                ? t('documents.editor.readOnlyContentHint')
                : t('documents.editor.contentHint')}
            </p>
          </section>
        </div>

        <DocumentsRoadmap />
      </div>
    </main>
  );
}
