'use client';

import {
  HttpRequestError,
  isHttpNetworkError,
} from '@/api/http/execute-request';
import type { DocumentRecord } from '@/domains/documentsDomains';
import {
  usePatchDocumentMutation,
  useUpdateDocumentContentMutation,
} from '@/features/documents/mutations/useDocumentMutation';
import { useTranslations } from '@/hooks/use-translations';
import { useCallback, useEffect, useRef, useState } from 'react';

const AUTOSAVE_DEBOUNCE_MS = 500;
const AUTOSAVE_SAVED_VISIBLE_MS = 1600;

export type DocumentAutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseDocumentAutosaveParams {
  readonly documentId: string;
  readonly titleDraft: string;
  readonly contentDraft: string;
  readonly serverRecord: DocumentRecord | undefined;
  readonly enabled: boolean;
}

export interface UseDocumentAutosaveResult {
  readonly status: DocumentAutosaveStatus;
  readonly errorMessage: string | null;
  readonly titleBlocked: boolean;
}

export function useDocumentAutosave(
  params: UseDocumentAutosaveParams,
): UseDocumentAutosaveResult {
  const { documentId, titleDraft, contentDraft, serverRecord, enabled } =
    params;
  const { t } = useTranslations();

  const [status, setStatus] = useState<DocumentAutosaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [titleBlocked, setTitleBlocked] = useState<boolean>(false);

  const lastSavedTitleRef = useRef<string>('');
  const lastSavedContentRef = useRef<string>('');
  const mountedDocIdRef = useRef<string | null>(null);

  const { mutateAsync: patchDocumentAsync } = usePatchDocumentMutation();
  const { mutateAsync: updateContentAsync } =
    useUpdateDocumentContentMutation();

  useEffect(() => {
    if (serverRecord === undefined) {
      return;
    }
    if (mountedDocIdRef.current !== serverRecord.id) {
      mountedDocIdRef.current = serverRecord.id;
      lastSavedTitleRef.current = serverRecord.title;
      lastSavedContentRef.current = serverRecord.content;
      setTitleBlocked(false);
      setErrorMessage(null);
      setStatus('idle');
    }
  }, [serverRecord]);

  useEffect(() => {
    if (status !== 'saved') {
      return;
    }
    const timerId: ReturnType<typeof setTimeout> = setTimeout(() => {
      setStatus('idle');
    }, AUTOSAVE_SAVED_VISIBLE_MS);
    return () => {
      clearTimeout(timerId);
    };
  }, [status]);

  const handleError = useCallback(
    (err: unknown): void => {
      if (isHttpNetworkError(err)) {
        setErrorMessage(t('errors.network'));
      } else if (err instanceof HttpRequestError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(t('documents.editor.autosaveError'));
      }
      setStatus('error');
    },
    [t],
  );

  useEffect(() => {
    if (!enabled || serverRecord === undefined) {
      return;
    }

    const titleTrimmed: string = titleDraft.trim();
    const titleDirty: boolean = titleTrimmed !== lastSavedTitleRef.current;
    const contentDirty: boolean = contentDraft !== lastSavedContentRef.current;

    if (!titleDirty && !contentDirty) {
      return;
    }

    if (titleTrimmed.length === 0 && titleDirty) {
      setTitleBlocked(true);
      setErrorMessage(t('validation.titleRequired'));
      setStatus('error');
      return;
    }

    setTitleBlocked(false);
    setErrorMessage(null);

    const id: ReturnType<typeof setTimeout> = setTimeout(() => {
      void (async () => {
        const titleToSave: string = titleDraft.trim();
        const needTitle: boolean =
          titleToSave.length > 0 &&
          titleToSave !== lastSavedTitleRef.current;
        const needContent: boolean =
          contentDraft !== lastSavedContentRef.current;

        if (!needTitle && !needContent) {
          return;
        }

        if (titleToSave.length === 0) {
          setTitleBlocked(true);
          setErrorMessage(t('validation.titleRequired'));
          setStatus('error');
          return;
        }

        setStatus('saving');
        setErrorMessage(null);

        try {
          if (needTitle) {
            const record: DocumentRecord = await patchDocumentAsync({
              documentId,
              patch: { title: titleToSave },
            });
            lastSavedTitleRef.current = record.title;
          }
          if (needContent) {
            const record: DocumentRecord = await updateContentAsync({
              documentId,
              content: contentDraft,
            });
            lastSavedContentRef.current = record.content;
            if (!needTitle) {
              lastSavedTitleRef.current = record.title;
            }
          }
          setStatus('saved');
        } catch (err: unknown) {
          handleError(err);
        }
      })();
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      clearTimeout(id);
    };
  }, [
    contentDraft,
    documentId,
    enabled,
    handleError,
    patchDocumentAsync,
    serverRecord,
    t,
    titleDraft,
    updateContentAsync,
  ]);

  return { status, errorMessage, titleBlocked };
}
