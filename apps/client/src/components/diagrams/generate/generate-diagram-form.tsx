'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { useGenerateDiagramMutation } from '@/features/intelligence/mutations/useGenerateDiagramMutation';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { useRouter } from 'next/navigation';
import type { FormEvent, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';

/**
 * Serbest prompt'tan heuristic mimari diagram üreten form.
 *
 * Sorumluluklar:
 * - Prompt input + submit
 * - Loading & error durum yönetimi
 * - Başarıda yeni diagram'a yönlendirme
 *
 * Asıl uçtan uca akış `useGenerateDiagramMutation` içinde.
 */
export function GenerateDiagramForm(): ReactNode {
  const { t } = useTranslations();
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>('');

  const { mutateAsync, isPending, isError, error } =
    useGenerateDiagramMutation();

  const errorMessage: string | null = useMemo((): string | null => {
    if (!isError || error === null || error === undefined) {
      return null;
    }
    return isHttpNetworkError(error) ? t('errors.network') : error.message;
  }, [error, isError, t]);

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      const trimmed: string = prompt.trim();
      if (trimmed.length === 0 || isPending) {
        return;
      }
      try {
        const result = await mutateAsync({ prompt: trimmed });
        setPrompt('');
        router.push(`/diagrams/${result.diagram.id}`);
      } catch {
        /* error state is rendered via errorMessage */
      }
    },
    [isPending, mutateAsync, prompt, router],
  );

  const disabled: boolean = isPending || prompt.trim().length === 0;

  return (
    <section className="rounded-2xl border border-violet-300/60 bg-gradient-to-br from-violet-50 via-white to-white p-5 shadow-sm dark:border-violet-900/40 dark:from-violet-950/30 dark:via-zinc-950 dark:to-zinc-950">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-violet-900 dark:text-violet-200">
          {t('diagrams.generate.title')}
        </h2>
        <p className="max-w-xl text-xs text-zinc-600 dark:text-zinc-400">
          {t('diagrams.generate.intro')}
        </p>
      </div>

      <form
        className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          void onSubmit(e);
        }}
      >
        <label className="block min-w-0 flex-1">
          <span className="sr-only">{t('diagrams.generate.promptLabel')}</span>
          <input
            type="text"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
            }}
            placeholder={t('diagrams.generate.promptPlaceholder')}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:ring-2 focus:ring-violet-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
        <button
          type="submit"
          disabled={disabled}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
        >
          {isPending
            ? t('diagrams.generate.loading')
            : t('diagrams.generate.button')}
        </button>
      </form>

      {errorMessage !== null ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
