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
import type { DocumentVisibility } from '@/domains/documents/documentsDomains';
import { useDocumentAutosave } from '@/hooks/documents/use-document-autosave';
import { useDocumentCollaboration } from '@/hooks/documents/use-document-collaboration';
import { useDocumentEditorPermissions } from '@/hooks/documents/use-document-editor-permissions';
import { useDocumentByIdQuery } from '@/features/documents/queries/useDocument';
import { useFavoriteDocumentMutation, usePatchDocumentMutation } from '@/features/documents/mutations/useDocumentMutation';
import { useFormatDocumentDate } from '@/hooks/documents/use-format-document-date';
import { useRecordPublicDocumentView } from '@/hooks/documents/use-record-public-document-view';
import { useRequireAuth } from '@/hooks/auth/use-require-auth';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { MessageKey } from '@/i18n';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { applyMarkdownFormat, type MarkdownFormat } from '@/lib/documents/markdown-format';

interface DocumentEditorViewProps {
  documentId: string;
}

function formatCollabUserLabel(userId: string): string {
  if (userId.length <= 12) {
    return userId;
  }
  return `${userId.slice(0, 10)}…`;
}

interface FormatButton {
  readonly format: MarkdownFormat;
  readonly text: string;
  readonly label: MessageKey;
  readonly className: string;
}

const FORMAT_BUTTONS: readonly FormatButton[] = [
  { format: 'bold', text: 'B', label: 'documents.editor.format.bold', className: 'font-bold' },
  { format: 'italic', text: 'I', label: 'documents.editor.format.italic', className: 'italic' },
  { format: 'heading', text: 'H', label: 'documents.editor.format.heading', className: 'font-serif font-semibold' },
  { format: 'code', text: '</>', label: 'documents.editor.format.code', className: 'font-mono' },
  { format: 'list', text: '•', label: 'documents.editor.format.list', className: '' },
  { format: 'quote', text: '❝', label: 'documents.editor.format.quote', className: '' },
];

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
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = useCallback(
    (format: MarkdownFormat): void => {
      const el = contentRef.current;
      if (el === null) {
        return;
      }
      const result = applyMarkdownFormat(contentDraft, el.selectionStart, el.selectionEnd, format);
      setContentDraft(result.text);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(result.selectionStart, result.selectionEnd);
      });
    },
    [contentDraft],
  );

  // Sunucu kaydı ilk kez geldiğinde (ya da belge değiştiğinde) taslakları eşitler. Yeniden getirmeler
  // yazılmakta olan metni ezmez. Eşitleme render sırasında yapılır; effect içinde setState lint hatası verir.
  const hydrationKey: string | null = data !== undefined && data.id === documentId ? data.id : null;
  const [appliedKey, setAppliedKey] = useState<string | null>(null);
  if (hydrationKey !== appliedKey) {
    setAppliedKey(hydrationKey);
    if (data !== undefined && hydrationKey !== null) {
      setTitleDraft(data.title);
      setContentDraft(data.content);
      setVisibilityDraft(data.visibility);
      setCategoryDraft(data.category?.name ?? '');
    }
  }
  const hydrated: boolean = hydrationKey !== null && appliedKey === hydrationKey;

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
      <div className="flex flex-1 items-center justify-center px-6 py-16 text-[var(--muted)]">
        {t('common.loading')}
      </div>
    );
  }

  if (docPending && data === undefined) {
    return <DocumentEditorSkeleton />;
  }

  if (docIsError && docError !== null && isNotFoundHttpError(docError)) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <p className="text-[var(--foreground)]">
          {t('documents.editor.notFound')}
        </p>
        <Link
          href="/documents"
          className="text-sm font-medium text-[var(--muted)] underline-offset-4 hover:text-[var(--foreground)] hover:underline"
        >
          {t('documents.editor.backToList')}
        </Link>
      </div>
    );
  }

  if (docIsError && docError !== null) {
    const loadMsg: string = isHttpNetworkError(docError)
      ? t('errors.network')
      : docError.message;
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <p className="text-sm text-red-600 dark:text-red-400">{loadMsg}</p>
        <Link
          href="/documents"
          className="text-sm font-medium text-[var(--muted)] underline-offset-4 hover:text-[var(--foreground)] hover:underline"
        >
          {t('documents.editor.backToList')}
        </Link>
      </div>
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

  const fieldClass =
    'mt-1.5 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)] read-only:cursor-default read-only:text-[var(--muted)] disabled:opacity-60';

  return (
    <div className={`mx-auto flex w-full flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 ${focusMode ? 'max-w-3xl' : 'max-w-6xl'}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--border)] pb-4 text-sm text-[var(--muted)]">
        <Link
          href="/documents"
          className="font-medium text-[var(--foreground)] underline-offset-4 hover:underline"
        >
          {t('documents.editor.backDocuments')}
        </Link>
        <span className="text-xs">
          {t('documents.editor.lastUpdated')}: {formatUpdatedAt(document.updatedAt)}
        </span>
        {readOnly && permissionReady ? (
          <span className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
            {t('documents.editor.readOnly')}
          </span>
        ) : null}
        {!permissionReady ? (
          <span className="text-xs">{t('documents.editor.permissionLoading')}</span>
        ) : null}
        <button
          type="button"
          aria-pressed={focusMode}
          onClick={() => {
            setFocusMode((value) => !value);
          }}
          className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
        >
          {focusMode ? t('documents.editor.focusOff') : t('documents.editor.focusOn')}
        </button>
        {autosaveLabel !== null ? (
          <span
            className={
              autosave.status === 'error'
                ? 'text-xs font-medium text-red-600 dark:text-red-400'
                : autosave.status === 'saved'
                  ? 'text-xs font-medium text-emerald-700 dark:text-emerald-400'
                  : 'text-xs font-medium text-[var(--accent)]'
            }
            role="status"
          >
            {autosaveLabel}
          </span>
        ) : null}
        {document.visibility === 'PUBLIC' ? (
          <span className="text-xs tabular-nums">
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
            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-50"
          >
            {favoritePending
              ? t('documents.editor.favoriting')
              : t('documents.editor.favorite')}
          </button>
        ) : null}
      </div>

      <div
        className={`grid gap-12 lg:items-start ${focusMode ? '' : 'lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]'}`}
      >
        <div className="flex min-w-0 flex-col gap-8">
          <section className="flex flex-col gap-5">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
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
                className={`mt-1 w-full bg-transparent font-serif text-4xl font-medium leading-tight tracking-tight text-[var(--foreground)] outline-none read-only:cursor-default sm:text-5xl ${
                  autosave.titleBlocked
                    ? 'border-b border-red-500'
                    : 'border-b border-transparent focus:border-[var(--border)]'
                }`}
              />
            </label>

            <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
              <label className="block w-44">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  {t('documents.editor.visibilityLabel')}
                </span>
                <select
                  value={visibilityDraft}
                  disabled={readOnly || visibilitySaving}
                  onChange={(e) => {
                    const v = e.target.value as DocumentVisibility;
                    void onVisibilityChange(v);
                  }}
                  className={fieldClass}
                >
                  <option value="PRIVATE">
                    {t('documents.visibilityPrivate')}
                  </option>
                  <option value="PUBLIC">
                    {t('documents.visibilityPublic')}
                  </option>
                </select>
              </label>
              <label className="block min-w-[200px] flex-1">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
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
                  className={fieldClass}
                />
              </label>
            </div>
            <p className="-mt-2 text-xs text-[var(--muted)]">
              {t('documents.editor.categoryHint')}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {readOnly
                ? t('documents.editor.readOnlyHint')
                : t('documents.editor.autosaveHintTitle')}
            </p>
          </section>

          <section className="flex flex-col border-t border-[var(--border)] pt-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-xl font-medium">
                {t('documents.editor.content')}
              </h2>
            </div>
            <div className="mt-3">
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
            </div>
            {remoteCaretLines.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {remoteCaretLines.map(
                  (row: { userId: string; line: number }): ReactNode => (
                    <span
                      key={row.userId}
                      className="inline-flex max-w-full rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)]"
                    >
                      {t('collaboration.remoteCaretDetailed')
                        .replace('{{line}}', String(row.line))
                        .replace('{{user}}', formatCollabUserLabel(row.userId))}
                    </span>
                  ),
                )}
              </div>
            ) : null}
            <div
              role="toolbar"
              aria-label={t('documents.editor.format.toolbar')}
              className="mt-4 flex flex-wrap gap-1"
            >
              {FORMAT_BUTTONS.map((item) => (
                <button
                  key={item.format}
                  type="button"
                  disabled={readOnly}
                  onClick={() => {
                    applyFormat(item.format);
                  }}
                  aria-label={t(item.label)}
                  title={t(item.label)}
                  className={`min-w-8 rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-40 ${item.className}`}
                >
                  {item.text}
                </button>
              ))}
            </div>
            <textarea
              ref={contentRef}
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
              className="mt-4 min-h-[60vh] w-full resize-y bg-transparent font-serif text-[18px] leading-[1.8] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] read-only:cursor-default read-only:text-[var(--muted)]"
            />
            <p className="mt-4 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
              {readOnly
                ? t('documents.editor.readOnlyContentHint')
                : t('documents.editor.contentHint')}
            </p>
          </section>
        </div>

        <aside className={`flex min-w-0 flex-col gap-8 border-t border-[var(--border)] pt-8 lg:border-t-0 lg:pt-0 ${focusMode ? 'hidden' : ''}`}>
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
        </aside>
      </div>
    </div>
  );
}
