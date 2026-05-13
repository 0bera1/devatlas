'use client';

import {
  HttpRequestError,
  isHttpNetworkError,
  isNotFoundHttpError,
} from '@/api/http/execute-request';
import { CollaborationLiveStrip } from '@/components/collaboration/collaboration-live-strip';
import { DocumentDangerZone } from '@/components/documents/document-danger-zone';
import { DocumentEditorSkeleton } from '@/components/documents/document-editor-skeleton';
import { DocumentRelatedSection } from '@/components/documents/document-related-section';
import { DocumentsRoadmap } from '@/components/documents/documents-roadmap';
import { InterviewQuestionsSection } from '@/components/documents/interview-questions/interview-questions-section';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/components/providers/toast-provider';
import type { DocumentVisibility } from '@/domains/documentsDomains';
import { useDocumentAutosave } from '@/hooks/use-document-autosave';
import { useDocumentCollaboration } from '@/hooks/use-document-collaboration';
import { useDocumentEditorPermissions } from '@/hooks/use-document-editor-permissions';
import { useDocumentByIdQuery } from '@/features/documents/queries/useDocument';
import { useFavoriteDocumentMutation, usePatchDocumentMutation } from '@/features/documents/mutations/useDocumentMutation';
import { useFormatDocumentDate } from '@/hooks/use-format-document-date';
import { useRecordPublicDocumentView } from '@/hooks/use-record-public-document-view';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useTranslations } from '@/hooks/use-translations';
import Link from 'next/link';
import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface DocumentEditorViewProps {
  documentId: string;
}

function formatCollabUserLabel(userId: string): string {
  if (userId.length <= 12) {
    return userId;
  }
  return `${userId.slice(0, 10)}…`;
}

export function DocumentEditorView(props: DocumentEditorViewProps): ReactNode {
  const { documentId } = props;
  const { t } = useTranslations();
  const formatUpdatedAt = useFormatDocumentDate();
  const { showError, showSuccess } = useToast();
  const { canRender } = useRequireAuth();
  const { token } = useAuth();

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

  const { mutateAsync: favoriteAsync, isPending: favoritePending } =
    useFavoriteDocumentMutation();

  const { mutateAsync: patchDocumentAsync, isPending: visibilitySaving } =
    usePatchDocumentMutation();

  const [titleDraft, setTitleDraft] = useState<string>('');
  const [contentDraft, setContentDraft] = useState<string>('');
  const [visibilityDraft, setVisibilityDraft] =
    useState<DocumentVisibility>('PRIVATE');
  const [categoryDraft, setCategoryDraft] = useState<string>('');
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    if (data === undefined || data.id !== documentId) {
      setHydrated(false);
      return;
    }
    setTitleDraft(data.title);
    setContentDraft(data.content);
    setVisibilityDraft(data.visibility);
    setCategoryDraft(data.category?.name ?? '');
    setHydrated(true);
  }, [data, documentId]);

  const collaborationEnabled: boolean =
    canRender &&
    hydrated &&
    data !== undefined &&
    data.id === documentId;

  const {
    peerCount,
    remoteSelections,
    emitSelection,
    connection,
    connectionError,
    reconnect,
  } = useDocumentCollaboration(
    documentId,
    token,
    collaborationEnabled,
  );

  const remoteCaretLines = useMemo((): { userId: string; line: number }[] => {
    return remoteSelections.map((r): { userId: string; line: number } => {
      const safeFocus: number = Math.min(r.focus, contentDraft.length);
      const line: number = contentDraft.slice(0, safeFocus).split('\n').length;
      return { userId: r.userId, line };
    });
  }, [remoteSelections, contentDraft]);

  const pushTextareaSelection = useCallback(
    (el: HTMLTextAreaElement): void => {
      emitSelection(el.selectionStart, el.selectionEnd);
    },
    [emitSelection],
  );

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

  const onCategoryBlur = useCallback(async (): Promise<void> => {
    if (!canEdit || data === undefined) {
      return;
    }
    const serverNormalized: string = (data.category?.name ?? '')
      .trim()
      .toLowerCase();
    const draftNormalized: string = categoryDraft.trim().toLowerCase();
    if (draftNormalized === serverNormalized) {
      return;
    }
    try {
      const record = await patchDocumentAsync({
        documentId,
        patch: {
          categoryName:
            draftNormalized.length === 0 ? null : categoryDraft.trim(),
        },
      });
      setCategoryDraft(record.category?.name ?? '');
    } catch (err: unknown) {
      setCategoryDraft(data.category?.name ?? '');
      const msg: string = isHttpNetworkError(err)
        ? t('errors.network')
        : err instanceof Error
          ? err.message
          : t('documents.editor.autosaveError');
      showError(msg);
    }
  }, [
    canEdit,
    categoryDraft,
    data,
    documentId,
    patchDocumentAsync,
    showError,
    t,
  ]);

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

  useRecordPublicDocumentView(
    documentId,
    data?.visibility,
    hydrated && data !== undefined && data.id === documentId,
  );

  const onFavoriteClick = useCallback(async (): Promise<void> => {
    try {
      await favoriteAsync(documentId);
      showSuccess(t('toast.favoriteAdded'));
    } catch (err: unknown) {
      if (err instanceof HttpRequestError && err.status === 409) {
        showError(t('toast.favoriteDuplicate'));
        return;
      }
      const msg: string = isHttpNetworkError(err)
        ? t('errors.network')
        : err instanceof Error
          ? err.message
          : t('documents.editor.autosaveError');
      showError(msg);
    }
  }, [documentId, favoriteAsync, showError, showSuccess, t]);

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
          {document.visibility === 'PUBLIC' ? (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('documents.engagement.views')}: {document.viewCount} ·{' '}
              {t('documents.engagement.favorites')}: {document.favoriteCount}
            </span>
          ) : null}
          {document.visibility === 'PUBLIC' && token !== null ? (
            <button
              type="button"
              disabled={favoritePending}
              onClick={() => {
                void onFavoriteClick();
              }}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              {favoritePending
                ? t('documents.editor.favoriting')
                : t('documents.editor.favorite')}
            </button>
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
            <div className="mt-4 max-w-md">
              <label className="block">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {t('documents.editor.categoryLabel')}
                </span>
                <input
                  type="text"
                  value={categoryDraft}
                  readOnly={readOnly}
                  onChange={(e) => {
                    setCategoryDraft(e.target.value);
                  }}
                  onBlur={() => {
                    void onCategoryBlur();
                  }}
                  placeholder={t('documents.editor.categoryPlaceholder')}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 read-only:bg-zinc-50 read-only:text-zinc-600 dark:read-only:bg-zinc-900 dark:read-only:text-zinc-300"
                />
              </label>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {t('documents.editor.categoryHint')}
              </p>
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
            <CollaborationLiveStrip
              connection={connection}
              peerCount={peerCount}
              errorDetail={connectionError}
              onRetry={
                connection === 'error' || connection === 'disconnected'
                  ? reconnect
                  : undefined
              }
              showSoloHint
            />
            {remoteCaretLines.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {remoteCaretLines.map(
                  (row: { userId: string; line: number }): ReactNode => (
                    <span
                      key={row.userId}
                      className="inline-flex max-w-full rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-900 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200"
                    >
                      {t('collaboration.remoteCaretDetailed')
                        .replace('{{line}}', String(row.line))
                        .replace('{{user}}', formatCollabUserLabel(row.userId))}
                    </span>
                  ),
                )}
              </div>
            ) : null}
            <textarea
              value={contentDraft}
              readOnly={readOnly}
              onChange={(e) => {
                setContentDraft(e.target.value);
              }}
              onSelect={(e) => {
                pushTextareaSelection(e.currentTarget);
              }}
              onKeyUp={(e) => {
                if (e.currentTarget instanceof HTMLTextAreaElement) {
                  pushTextareaSelection(e.currentTarget);
                }
              }}
              onMouseUp={(e) => {
                if (e.currentTarget instanceof HTMLTextAreaElement) {
                  pushTextareaSelection(e.currentTarget);
                }
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

        <div className="flex flex-col gap-6">
          <DocumentRelatedSection
            documentId={documentId}
            enabled={hydrated && data !== undefined && data.id === documentId}
          />
          <InterviewQuestionsSection
            documentId={documentId}
            enabled={hydrated && data !== undefined && data.id === documentId}
          />
          {canEdit ? (
            <DocumentDangerZone
              documentId={document.id}
              documentTitle={document.title}
            />
          ) : null}
          <DocumentsRoadmap />
        </div>
      </div>
    </main>
  );
}
