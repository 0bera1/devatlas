import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/components/providers/toast-provider';
import {
  fetchDocumentById,
  patchDocumentTitleRequest,
  updateDocumentContentRequest,
} from '@/lib/api/documents-api';
import { isNetworkFailure } from '@/lib/api/api-error';
import { useTranslations } from '@/hooks/use-translations';
import type { DocumentRecord } from '@/types/document';
import { useCallback, useEffect, useState } from 'react';

export type EditorLoadStatus = 'idle' | 'loading' | 'error' | 'not-found';
export type EditorSaveStatus = 'idle' | 'saving' | 'error';

export interface UseDocumentEditorResult {
  loadStatus: EditorLoadStatus;
  loadError: string | null;
  document: DocumentRecord | null;
  titleDraft: string;
  contentDraft: string;
  setTitleDraft: (value: string) => void;
  setContentDraft: (value: string) => void;
  titleSave: EditorSaveStatus;
  titleSaveError: string | null;
  contentSave: EditorSaveStatus;
  contentSaveError: string | null;
  saveTitle: () => Promise<void>;
  saveContent: () => Promise<void>;
  reload: () => void;
}

export function useDocumentEditor(documentId: string): UseDocumentEditorResult {
  const { token, isReady } = useAuth();
  const { showSuccess, showError } = useToast();
  const { t } = useTranslations();
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [loadStatus, setLoadStatus] = useState<EditorLoadStatus>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState<string>('');
  const [contentDraft, setContentDraft] = useState<string>('');
  const [titleSave, setTitleSave] = useState<EditorSaveStatus>('idle');
  const [titleSaveError, setTitleSaveError] = useState<string | null>(null);
  const [contentSave, setContentSave] = useState<EditorSaveStatus>('idle');
  const [contentSaveError, setContentSaveError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);

  const reload = useCallback(() => {
    setReloadToken((n: number) => n + 1);
  }, []);

  useEffect(() => {
    if (!isReady || token === null) {
      return;
    }

    let cancelled = false;

    const run = async (): Promise<void> => {
      setLoadStatus('loading');
      setLoadError(null);

      const result = await fetchDocumentById(token, documentId);
      if (cancelled) {
        return;
      }

      if (!result.ok) {
        if (isNetworkFailure(result)) {
          setLoadStatus('error');
          setLoadError(t('errors.network'));
          setDocument(null);
          return;
        }
        if (result.status === 404) {
          setLoadStatus('not-found');
          setDocument(null);
          return;
        }
        setLoadStatus('error');
        setLoadError(result.error);
        setDocument(null);
        return;
      }

      setDocument(result.data);
      setTitleDraft(result.data.title);
      setContentDraft(result.data.content);
      setLoadStatus('idle');
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isReady, token, documentId, reloadToken, t]);

  const saveTitle = useCallback(async (): Promise<void> => {
    if (token === null || loadStatus !== 'idle') {
      return;
    }
    const nextTitle: string = titleDraft.trim();
    if (nextTitle.length === 0) {
      setTitleSave('error');
      setTitleSaveError(t('validation.titleRequired'));
      showError(t('validation.titleRequired'));
      return;
    }

    setTitleSave('saving');
    setTitleSaveError(null);
    const result = await patchDocumentTitleRequest(token, documentId, {
      title: nextTitle,
    });

    if (!result.ok) {
      setTitleSave('error');
      const message: string = isNetworkFailure(result)
        ? t('errors.network')
        : result.error;
      setTitleSaveError(message);
      showError(message);
      return;
    }

    setDocument(result.data);
    setTitleDraft(result.data.title);
    setTitleSave('idle');
    showSuccess(t('toast.titleSaved'));
  }, [
    token,
    loadStatus,
    documentId,
    titleDraft,
    showSuccess,
    showError,
    t,
  ]);

  const saveContent = useCallback(async (): Promise<void> => {
    if (token === null || loadStatus !== 'idle') {
      return;
    }

    setContentSave('saving');
    setContentSaveError(null);
    const result = await updateDocumentContentRequest(token, documentId, {
      content: contentDraft,
    });

    if (!result.ok) {
      setContentSave('error');
      const message: string = isNetworkFailure(result)
        ? t('errors.network')
        : result.error;
      setContentSaveError(message);
      showError(message);
      return;
    }

    setDocument(result.data);
    setContentDraft(result.data.content);
    setContentSave('idle');
    showSuccess(t('toast.contentSaved'));
  }, [
    token,
    loadStatus,
    documentId,
    contentDraft,
    showSuccess,
    showError,
    t,
  ]);

  return {
    loadStatus,
    loadError,
    document,
    titleDraft,
    contentDraft,
    setTitleDraft,
    setContentDraft,
    titleSave,
    titleSaveError,
    contentSave,
    contentSaveError,
    saveTitle,
    saveContent,
    reload,
  };
}
