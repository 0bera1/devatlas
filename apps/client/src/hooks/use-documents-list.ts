import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/components/providers/toast-provider';
import {
  createDocumentRequest,
  fetchDocumentsList,
  type ListDocumentsQuery,
} from '@/lib/api/documents-api';
import { isNetworkFailure } from '@/lib/api/api-error';
import { useTranslations } from '@/hooks/use-translations';
import type { PaginatedDocumentList } from '@/types/document';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export type DocumentsListStatus = 'idle' | 'loading' | 'error';

export interface UseDocumentsListResult {
  status: DocumentsListStatus;
  errorMessage: string | null;
  data: PaginatedDocumentList | null;
  page: number;
  pageSize: number;
  searchInput: string;
  setSearchInput: (value: string) => void;
  createStatus: DocumentsListStatus;
  createError: string | null;
  setPage: (page: number) => void;
  applySearch: () => void;
  clearSearch: () => void;
  refresh: () => void;
  createDocument: (title: string) => Promise<void>;
}

export function useDocumentsList(): UseDocumentsListResult {
  const router = useRouter();
  const { token, isReady } = useAuth();
  const { showSuccess, showError } = useToast();
  const { t } = useTranslations();
  const [page, setPageState] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [appliedQ, setAppliedQ] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState<string>('');
  const [data, setData] = useState<PaginatedDocumentList | null>(null);
  const [status, setStatus] = useState<DocumentsListStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createStatus, setCreateStatus] = useState<DocumentsListStatus>('idle');
  const [createError, setCreateError] = useState<string | null>(null);
  const [loadToken, setLoadToken] = useState<number>(0);

  const setPage = useCallback((next: number) => {
    setPageState(next);
  }, []);

  const applySearch = useCallback(() => {
    const trimmed: string = searchInput.trim();
    setAppliedQ(trimmed.length > 0 ? trimmed : null);
    setPageState(1);
    setLoadToken((n: number) => n + 1);
  }, [searchInput]);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setAppliedQ(null);
    setPageState(1);
    setLoadToken((n: number) => n + 1);
  }, []);

  const refresh = useCallback(() => {
    setLoadToken((n: number) => n + 1);
  }, []);

  useEffect(() => {
    if (!isReady || token === null) {
      return;
    }

    let cancelled = false;

    const run = async (): Promise<void> => {
      setStatus('loading');
      setErrorMessage(null);

      const query: ListDocumentsQuery = {
        page,
        pageSize,
        q: appliedQ,
      };

      const result = await fetchDocumentsList(token, query);
      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setStatus('error');
        setErrorMessage(
          isNetworkFailure(result) ? t('errors.network') : result.error,
        );
        setData(null);
        return;
      }

      setData(result.data);
      setStatus('idle');
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isReady, token, page, pageSize, appliedQ, loadToken, t]);

  const createDocument = useCallback(
    async (title: string): Promise<void> => {
      if (token === null) {
        return;
      }
      setCreateStatus('loading');
      setCreateError(null);
      const result = await createDocumentRequest(token, { title });
      if (!result.ok) {
        setCreateStatus('error');
        const message: string = isNetworkFailure(result)
          ? t('errors.network')
          : result.error;
        setCreateError(message);
        showError(message);
        return;
      }
      setCreateStatus('idle');
      showSuccess(t('toast.documentCreated'));
      router.push(`/documents/${result.data.id}`);
    },
    [token, router, showSuccess, showError, t],
  );

  return {
    status,
    errorMessage,
    data,
    page,
    pageSize,
    searchInput,
    setSearchInput,
    createStatus,
    createError,
    setPage,
    applySearch,
    clearSearch,
    refresh,
    createDocument,
  };
}
