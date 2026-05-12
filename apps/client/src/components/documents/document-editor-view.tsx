'use client';

import {
  HttpRequestError,
  isHttpNetworkError,
  isNotFoundHttpError,
} from '@/api/http/execute-request';
import { DocumentsRoadmap } from '@/components/documents/documents-roadmap';
import { useToast } from '@/components/providers/toast-provider';
import {
  usePatchDocumentTitleMutation,
  useUpdateDocumentContentMutation,
} from '@/features/documents/mutations/useDocumentMutation';
import { useDocumentByIdQuery } from '@/features/documents/queries/useDocument';
import { useFormatDocumentDate } from '@/hooks/use-format-document-date';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useTranslations } from '@/hooks/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

interface DocumentEditorViewProps {
  documentId: string;
}

export function DocumentEditorView(props: DocumentEditorViewProps): ReactNode {
  const { documentId } = props;
  const { t } = useTranslations();
  const formatUpdatedAt = useFormatDocumentDate();
  const { showSuccess, showError } = useToast();
  const { canRender } = useRequireAuth();

  const {
    data,
    isPending: docPending,
    isError: docIsError,
    error: docError,
  } = useDocumentByIdQuery(documentId, canRender);

  const [titleDraft, setTitleDraft] = useState<string>('');
  const [contentDraft, setContentDraft] = useState<string>('');

  useEffect(() => {
    if (data === undefined) {
      return;
    }
    setTitleDraft(data.title);
    setContentDraft(data.content);
  }, [data?.id]);

  const patchTitleMut = usePatchDocumentTitleMutation();
  const updateContentMut = useUpdateDocumentContentMutation();

  if (!canRender) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-zinc-500 dark:text-zinc-400">
        {t('common.loading')}
      </main>
    );
  }

  if (docPending && data === undefined) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('documents.editor.loadingDoc')}
        </p>
      </main>
    );
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

  const saveTitle = async (): Promise<void> => {
    const nextTitle: string = titleDraft.trim();
    if (nextTitle.length === 0) {
      showError(t('validation.titleRequired'));
      return;
    }
    try {
      const record = await patchTitleMut.mutateAsync({
        documentId,
        title: nextTitle,
      });
      setTitleDraft(record.title);
      showSuccess(t('toast.titleSaved'));
    } catch (err: unknown) {
      if (isHttpNetworkError(err)) {
        showError(t('errors.network'));
      } else if (err instanceof HttpRequestError) {
        showError(err.message);
      } else if (err instanceof Error) {
        showError(err.message);
      }
    }
  };

  const saveContent = async (): Promise<void> => {
    try {
      const record = await updateContentMut.mutateAsync({
        documentId,
        content: contentDraft,
      });
      setContentDraft(record.content);
      showSuccess(t('toast.contentSaved'));
    } catch (err: unknown) {
      if (isHttpNetworkError(err)) {
        showError(t('errors.network'));
      } else if (err instanceof HttpRequestError) {
        showError(err.message);
      } else if (err instanceof Error) {
        showError(err.message);
      }
    }
  };

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
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(260px,320px)] lg:items-start">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
            <label className="block">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {t('documents.editor.titleLabel')}
              </span>
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => {
                  setTitleDraft(e.target.value);
                }}
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-lg font-semibold text-zinc-950 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </label>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={patchTitleMut.isPending}
                onClick={() => {
                  void saveTitle();
                }}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {patchTitleMut.isPending
                  ? t('documents.editor.savingTitle')
                  : t('documents.editor.saveTitle')}
              </button>
              {patchTitleMut.isError && patchTitleMut.error ? (
                <span className="text-sm text-red-600 dark:text-red-400">
                  {isHttpNetworkError(patchTitleMut.error)
                    ? t('errors.network')
                    : patchTitleMut.error.message}
                </span>
              ) : null}
            </div>
          </section>

          <section className="flex flex-1 flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t('documents.editor.content')}
              </h2>
              <button
                type="button"
                disabled={updateContentMut.isPending}
                onClick={() => {
                  void saveContent();
                }}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {updateContentMut.isPending
                  ? t('documents.editor.savingContent')
                  : t('documents.editor.saveContent')}
              </button>
            </div>
            {updateContentMut.isError && updateContentMut.error ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {isHttpNetworkError(updateContentMut.error)
                  ? t('errors.network')
                  : updateContentMut.error.message}
              </p>
            ) : null}
            <textarea
              value={contentDraft}
              onChange={(e) => {
                setContentDraft(e.target.value);
              }}
              rows={18}
              placeholder={t('documents.editor.contentPlaceholder')}
              className="mt-3 min-h-[280px] w-full flex-1 resize-y rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 font-mono text-sm leading-relaxed text-zinc-950 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-50"
            />
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              {t('documents.editor.contentHint')}
            </p>
          </section>
        </div>

        <DocumentsRoadmap />
      </div>
    </main>
  );
}
