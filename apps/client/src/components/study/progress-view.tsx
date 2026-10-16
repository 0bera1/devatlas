'use client';

import { activityApi, type ActivityEntry } from '@/api/profile/activityApi';
import { studyApi, type StudyProgress } from '@/api/study/studyApi';
import { useAuth } from '@/components/providers/auth-provider';
import { useRequireAuth } from '@/hooks/auth/use-require-auth';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

const WINDOW_DAYS = 14;

interface DayCount {
  readonly key: string;
  readonly label: string;
  readonly count: number;
}

function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/** Son on dört günün etkinliğini yerel güne göre hizalar. */
function buildWindow(entries: readonly ActivityEntry[]): DayCount[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const key = localDayKey(new Date(entry.bucketDate));
    counts.set(key, (counts.get(key) ?? 0) + entry.count);
  }
  const days: DayCount[] = [];
  const today = new Date();
  for (let offset = WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    days.push({
      key: localDayKey(date),
      label: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      count: counts.get(localDayKey(date)) ?? 0,
    });
  }
  return days;
}

export function ProgressView(): ReactNode {
  const { canRender } = useRequireAuth();
  if (!canRender) {
    return null;
  }
  return <ProgressContent />;
}

function ProgressContent(): ReactNode {
  const { t } = useTranslations();
  const { token } = useAuth();
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [days, setDays] = useState<DayCount[]>([]);
  const [failed, setFailed] = useState<boolean>(false);

  useEffect(() => {
    if (token === null) {
      return;
    }
    let cancelled = false;
    const from = new Date();
    from.setDate(from.getDate() - WINDOW_DAYS);

    void (async () => {
      const [p, a] = await Promise.allSettled([
        studyApi.progress(token),
        activityApi.list(token, from, new Date()),
      ]);
      if (cancelled) {
        return;
      }
      if (p.status === 'fulfilled') {
        setProgress(p.value);
      } else {
        setFailed(true);
      }
      if (a.status === 'fulfilled') {
        setDays(buildWindow(a.value));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const learned: number = progress?.learned ?? 0;
  const total: number = progress?.totalQuestions ?? 0;
  const learnedPercent: number = total === 0 ? 0 : Math.round((learned / total) * 100);
  const reviewed14: number = days.reduce((sum, day) => sum + day.count, 0);
  const scaleMax: number = Math.max(1, ...days.map((day) => day.count));

  const stats: Array<{ label: string; value: number | undefined }> = [
    { label: t('study.dueNow'), value: progress?.dueNow },
    { label: t('study.tracked'), value: progress?.tracked },
    { label: t('study.learned'), value: progress?.learned },
    { label: t('study.totalQuestions'), value: progress?.totalQuestions },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">{t('progress.title')}</h1>
          <p className="mt-3 max-w-xl text-[15px] text-[var(--muted)]">{t('progress.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/study" className="inline-flex items-center rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-[var(--background)]">
            {t('progress.openStudy')}
          </Link>
          <Link href="/study/lists" className="inline-flex items-center rounded-full border border-[var(--border)] px-5 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface)]">
            {t('progress.openLists')}
          </Link>
        </div>
      </header>

      {failed ? (
        <p className="mt-8 rounded-xl border border-red-300/60 px-4 py-3 text-sm text-red-700 dark:text-red-300">{t('study.error')}</p>
      ) : null}

      <section className="mt-10 grid grid-cols-2 gap-6 border-y border-[var(--border)] py-8 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-serif text-4xl tabular-nums">{stat.value ?? '–'}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div>
          <h2 className="text-base font-semibold">{t('study.learned')}</h2>
          <p className="mt-1 font-serif text-3xl tabular-nums">{learnedPercent}%</p>
          <div
            className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={learnedPercent}
            aria-label={t('study.learned')}
          >
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${learnedPercent}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold">{t('today.weekTitle')}</h2>
            <span className="text-sm tabular-nums text-[var(--muted)]">{reviewed14}</span>
          </div>
          {reviewed14 === 0 ? <p className="mt-4 text-sm text-[var(--muted)]">{t('today.noActivity')}</p> : null}
          <div className="mt-6 flex h-40 items-end gap-1.5">
            {days.map((day, index) => {
              const isToday: boolean = index === days.length - 1;
              const height: number = (day.count / scaleMax) * 100;
              return (
                <div
                  key={day.key}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  title={`${day.label}: ${day.count}`}
                >
                  <div
                    className={`w-full rounded-t-sm ${isToday ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                    style={{ height: `${Math.max(height, day.count > 0 ? 4 : 2)}%` }}
                  />
                  <span className="text-[10px] tabular-nums text-[var(--muted)]">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
