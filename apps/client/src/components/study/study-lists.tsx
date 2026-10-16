'use client';

import { studyListApi, studyApi, type QuestionSummary, type StudyListItem, type StudyListSummary } from '@/api/study/studyApi';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/components/providers/toast-provider';
import { useRequireAuth } from '@/hooks/auth/use-require-auth';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';

export function StudyLists(): ReactNode {
  const { canRender } = useRequireAuth();
  if (!canRender) {
    return null;
  }
  return <StudyListsContent />;
}

function StudyListsContent(): ReactNode {
  const { t } = useTranslations();
  const { token } = useAuth();
  const { showSuccess, showError } = useToast();
  const [lists, setLists] = useState<StudyListSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');

  const load = async (): Promise<void> => {
    if (token === null) return;
    try {
      setLists(await studyApi.lists(token));
    } catch {
      showError(t('settings.error'));
    }
  };

  useEffect(() => {
    void load();
    // Yalnızca oturum değiştiğinde yüklenir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (token === null || name.trim().length === 0) return;
    try {
      const created = await studyApi.createList(token, name.trim());
      setName('');
      setLists((prev) => [...prev, created]);
    } catch {
      showError(t('settings.error'));
    }
  };

  const active: StudyListSummary | undefined = lists.find((list) => list.id === activeId);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 text-[var(--foreground)] sm:px-6">
      {active === undefined ? (
        <>
          <h1 className="font-serif text-4xl font-medium tracking-tight">{t('study.lists.title')}</h1>
          <form onSubmit={handleCreate} className="mt-6 flex gap-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              placeholder={t('study.lists.namePlaceholder')}
              aria-label={t('study.lists.namePlaceholder')}
              className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5"
            />
            <button type="submit" className="rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-[var(--background)]">
              {t('study.lists.create')}
            </button>
          </form>
          {lists.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--muted)]">{t('study.lists.empty')}</p>
          ) : (
            <ul className="mt-8 divide-y divide-[var(--border)]">
              {lists.map((list) => (
                <li key={list.id}>
                  <button type="button" onClick={() => setActiveId(list.id)} className="flex w-full items-baseline justify-between py-4 text-left">
                    <span className="font-serif text-xl">{list.name}</span>
                    <span className="text-sm tabular-nums text-[var(--muted)]">
                      {t('study.lists.items').replace('{{count}}', String(list.itemCount))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <ListDetail
          list={active}
          onBack={() => {
            setActiveId(null);
            void load();
          }}
          onDeleted={() => {
            showSuccess(t('study.lists.deleted'));
            setActiveId(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function ListDetail(props: { list: StudyListSummary; onBack: () => void; onDeleted: () => void }): ReactNode {
  const { t } = useTranslations();
  const { token } = useAuth();
  const { showSuccess, showError } = useToast();
  const [items, setItems] = useState<StudyListItem[]>([]);
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<QuestionSummary[]>([]);

  const reload = async (): Promise<void> => {
    if (token === null) return;
    try {
      setItems(await studyListApi.items(token, props.list.id));
    } catch {
      showError(t('settings.error'));
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.list.id, token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void studyListApi.searchQuestions(query).then(setResults).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const added = new Set(items.map((item) => item.questionId));

  return (
    <>
      <button type="button" onClick={props.onBack} className="text-sm text-[var(--muted)] underline">
        ← {t('study.lists.back')}
      </button>
      <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight">{props.list.name}</h1>

      <section className="mt-8">
        <h2 className="text-base font-semibold">{t('study.lists.addQuestion')}</h2>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('study.lists.searchPlaceholder')}
          aria-label={t('study.lists.searchPlaceholder')}
          className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5"
        />
        <ul className="mt-3 divide-y divide-[var(--border)]">
          {results.map((question) => (
            <li key={question.id} className="flex items-center justify-between gap-3 py-3">
              <span className="text-sm">{question.question}</span>
              <button
                type="button"
                disabled={added.has(question.id) || token === null}
                onClick={async () => {
                  if (token === null) return;
                  try {
                    await studyListApi.addItem(token, props.list.id, question.id);
                    showSuccess(t('study.lists.added'));
                    await reload();
                  } catch {
                    showError(t('settings.error'));
                  }
                }}
                className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1 text-xs disabled:opacity-40"
              >
                +
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        {items.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{t('study.lists.noItems')}</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {items.map((item) => (
              <li key={item.questionId} className="flex items-center justify-between gap-3 py-3">
                <span className="font-serif text-lg">{item.question.question}</span>
                <button
                  type="button"
                  onClick={async () => {
                    if (token === null) return;
                    try {
                      await studyListApi.removeItem(token, props.list.id, item.questionId);
                      await reload();
                    } catch {
                      showError(t('settings.error'));
                    }
                  }}
                  className="shrink-0 text-xs text-red-600 underline"
                >
                  {t('study.lists.remove')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={async () => {
          if (token === null) return;
          try {
            await studyListApi.deleteList(token, props.list.id);
            props.onDeleted();
          } catch {
            showError(t('settings.error'));
          }
        }}
        className="mt-12 rounded-full border border-red-500/50 px-4 py-2 text-sm text-red-600"
      >
        {t('study.lists.delete')}
      </button>
    </>
  );
}
