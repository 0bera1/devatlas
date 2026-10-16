'use client';

import { studyApi, type DueReview, type ReviewRating, type StudyProgress } from '@/api/study/studyApi';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/components/providers/toast-provider';
import { useRequireAuth } from '@/hooks/auth/use-require-auth';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { MessageKey } from '@/i18n';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

const SESSION_LIMIT = 20;

const RATINGS: ReadonlyArray<{ rating: ReviewRating; label: MessageKey; tone: string }> = [
  { rating: 0, label: 'study.again', tone: 'border-red-500/50 text-red-700' },
  { rating: 1, label: 'study.hard', tone: 'border-amber-500/50 text-amber-700' },
  { rating: 2, label: 'study.good', tone: 'border-emerald-500/50 text-emerald-700' },
  { rating: 3, label: 'study.easy', tone: 'border-sky-500/50 text-sky-700' },
];

export function StudySession(): ReactNode {
  const { canRender } = useRequireAuth();
  if (!canRender) {
    return null;
  }
  return <StudySessionContent />;
}

function StudySessionContent(): ReactNode {
  const { t } = useTranslations();
  const { token } = useAuth();
  const { showError } = useToast();
  const [queue, setQueue] = useState<DueReview[]>([]);
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [index, setIndex] = useState<number>(0);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [nextInfo, setNextInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async (): Promise<void> => {
    if (token === null) {
      return;
    }
    setLoading(true);
    try {
      const [due, stats] = await Promise.all([
        studyApi.due(token, SESSION_LIMIT),
        studyApi.progress(token),
      ]);
      setQueue(due);
      setProgress(stats);
      setIndex(0);
      setRevealed(false);
      setNextInfo(null);
    } catch {
      showError(t('study.error'));
    } finally {
      setLoading(false);
    }
  }, [token, showError, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const current: DueReview | undefined = queue[index];

  const handleRate = async (rating: ReviewRating): Promise<void> => {
    if (token === null || current === undefined) {
      return;
    }
    setBusy(true);
    try {
      const result = await studyApi.review(token, current.questionId, rating);
      setNextInfo(formatInterval(result.intervalDays, t));
      setRevealed(false);
      setIndex((value) => value + 1);
    } catch {
      showError(t('study.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 text-[var(--foreground)] sm:px-6">
      <header>
        <h1 className="font-serif text-4xl font-medium tracking-tight">{t('study.title')}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{t('study.subtitle')}</p>
      </header>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t('study.dueNow')} value={progress?.dueNow} />
        <Stat label={t('study.tracked')} value={progress?.tracked} />
        <Stat label={t('study.learned')} value={progress?.learned} />
        <Stat label={t('study.totalQuestions')} value={progress?.totalQuestions} />
      </dl>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        {loading ? (
          <p className="text-sm text-[var(--muted)]">…</p>
        ) : current === undefined ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--muted)]">{queue.length === 0 ? t('study.empty') : t('study.done')}</p>
            {nextInfo !== null ? <p className="text-xs text-[var(--muted)]">{nextInfo}</p> : null}
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
            >
              ↻
            </button>
          </div>
        ) : (
          <article className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
              <span className="rounded-full border border-[var(--border)] px-2.5 py-1">{current.question.category}</span>
              {current.question.difficulty !== null ? (
                <span className="rounded-full border border-[var(--border)] px-2.5 py-1">{current.question.difficulty}</span>
              ) : null}
              <span className="ml-auto tabular-nums">
                {index + 1} / {queue.length}
              </span>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{t('study.question')}</p>
              <h2 className="mt-2 font-serif text-2xl leading-snug">{current.question.question}</h2>
            </div>

            {revealed ? (
              <div className="space-y-2 border-t border-[var(--border)] pt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{t('study.answer')}</p>
                <div className="whitespace-pre-line text-[15px] leading-7">{current.question.answer}</div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="w-full rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-[var(--background)]"
              >
                {t('study.reveal')}
              </button>
            )}

            {revealed ? (
              <div className="space-y-3 border-t border-[var(--border)] pt-5">
                <p className="text-sm font-medium">{t('study.rate')}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {RATINGS.map((item) => (
                    <button
                      key={item.rating}
                      type="button"
                      disabled={busy}
                      onClick={() => void handleRate(item.rating)}
                      className={`rounded-xl border bg-[var(--background)] px-3 py-2.5 text-sm font-semibold disabled:opacity-60 ${item.tone}`}
                    >
                      {t(item.label)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        )}
      </section>

      {nextInfo !== null && current !== undefined ? (
        <p className="mt-3 text-xs text-[var(--muted)]">{nextInfo}</p>
      ) : null}
    </div>
  );
}

function Stat(props: { label: string; value: number | undefined }): ReactNode {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <dt className="text-xs text-[var(--muted)]">{props.label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{props.value ?? '–'}</dd>
    </div>
  );
}

/** Aralığı kısa bir metne çevirir. Gün 0 ise tekrar 10 dakika sonra planlanmıştır. */
function formatInterval(days: number, t: (key: MessageKey) => string): string {
  const time: string = days === 0 ? '10 dk' : `${days} gün`;
  return t('study.nextIn').replace('{{time}}', time);
}
