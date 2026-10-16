'use client';

import { activityApi, type ActivityEntry } from '@/api/profile/activityApi';
import { apiClient } from '@/api/http/api-client';
import { notificationsApi, type NotificationItem } from '@/api/notifications/notificationsApi';
import { studyApi, type DueReview, type StudyProgress } from '@/api/study/studyApi';
import { useAuth } from '@/components/providers/auth-provider';
import { useRequireAuth } from '@/hooks/auth/use-require-auth';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { MessageKey } from '@/i18n';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

const DAILY_GOAL = 10;
const WEEK_DAYS = 7;

interface RecentItem {
  id: string;
  title: string;
  updatedAt: string;
}

const DAY_LABELS: readonly MessageKey[] = [
  'today.day.sun',
  'today.day.mon',
  'today.day.tue',
  'today.day.wed',
  'today.day.thu',
  'today.day.fri',
  'today.day.sat',
];

function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/** Son yedi günün (bugün dahil) etkinlik sayılarını yerel güne göre hizalar. */
function buildWeek(entries: readonly ActivityEntry[]): Array<{ date: Date; count: number }> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const key = localDayKey(new Date(entry.bucketDate));
    counts.set(key, (counts.get(key) ?? 0) + entry.count);
  }
  const days: Array<{ date: Date; count: number }> = [];
  const today = new Date();
  for (let offset = WEEK_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    days.push({ date, count: counts.get(localDayKey(date)) ?? 0 });
  }
  return days;
}

export function TodayView(): ReactNode {
  const { canRender } = useRequireAuth();
  if (!canRender) {
    return null;
  }
  return <TodayContent />;
}

function TodayContent(): ReactNode {
  const { t } = useTranslations();
  const { token } = useAuth();
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [due, setDue] = useState<DueReview[]>([]);
  const [week, setWeek] = useState<Array<{ date: Date; count: number }>>([]);
  const [docs, setDocs] = useState<RecentItem[]>([]);
  const [diagrams, setDiagrams] = useState<RecentItem[]>([]);
  const [notes, setNotes] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (token === null) {
      return;
    }
    let cancelled = false;
    const from = new Date();
    from.setDate(from.getDate() - WEEK_DAYS);

    void (async () => {
      const results = await Promise.allSettled([
        studyApi.progress(token),
        studyApi.due(token, 3),
        activityApi.list(token, from, new Date()),
        apiClient.get<{ items: RecentItem[] }>('/documents?pageSize=4', { accessToken: token }),
        apiClient.get<RecentItem[]>('/diagrams', { accessToken: token }),
        notificationsApi.list(token),
      ]);
      if (cancelled) {
        return;
      }
      const [p, d, a, docList, diagramList, n] = results;
      if (p.status === 'fulfilled') setProgress(p.value);
      if (d.status === 'fulfilled') setDue(d.value);
      if (a.status === 'fulfilled') setWeek(buildWeek(a.value));
      if (docList.status === 'fulfilled') setDocs(docList.value.data.items.slice(0, 4));
      if (diagramList.status === 'fulfilled') setDiagrams(diagramList.value.data.slice(0, 4));
      if (n.status === 'fulfilled') setNotes(n.value.slice(0, 2));
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const dueCount: number = progress?.dueNow ?? 0;
  const weekTotal: number = week.reduce((sum, day) => sum + day.count, 0);
  const scaleMax: number = Math.max(DAILY_GOAL, ...week.map((day) => day.count));
  const greeting: string = t('today.greeting');
  const dateLabel: string = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-[var(--muted)]">{dateLabel}</p>
          <h1 className="mt-1 font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            {greeting}. {t('today.dueCount').replace('{{count}}', String(dueCount))}.
          </h1>
          <p className="mt-3 text-[15px] text-[var(--muted)]">
            {t('today.estimate').replace('{{count}}', String(Math.max(5, Math.ceil(dueCount * 1.2))))}
          </p>
        </div>
        <Link
          href="/study"
          className="inline-flex w-fit items-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)]"
        >
          {t('today.start')}
        </Link>
      </section>

      <section className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 border-t border-[var(--border)] pt-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold">{t('today.weekTitle')}</h2>
            <span className="text-sm tabular-nums text-[var(--muted)]">{weekTotal}</span>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">{t('today.weekHint')}</p>

          {weekTotal === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">{t('today.noActivity')}</p>
          ) : null}

          <div className="relative mt-6 flex h-56 items-end justify-between gap-3">
            <div
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[var(--muted)]"
              style={{ bottom: `${(DAILY_GOAL / scaleMax) * 100}%` }}
              aria-hidden
            />
            <span
              className="absolute right-0 -translate-y-full text-xs text-[var(--muted)]"
              style={{ bottom: `${(DAILY_GOAL / scaleMax) * 100}%` }}
            >
              {t('today.goal').replace('{{count}}', String(DAILY_GOAL))}
            </span>
            {week.map((day, index) => {
              const isToday: boolean = index === week.length - 1;
              const height: number = (day.count / scaleMax) * 100;
              return (
                <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs tabular-nums text-[var(--muted)]">{day.count}</span>
                  <div
                    className={`w-full rounded-t-md ${isToday ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                    style={{ height: `${Math.max(height, day.count > 0 ? 4 : 2)}%` }}
                  />
                  <span className={`text-xs ${isToday ? 'font-semibold text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
                    {t(DAY_LABELS[day.date.getDay()])}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-8 text-sm text-[var(--muted)]">
            <span>
              <span className="font-serif text-2xl text-[var(--foreground)] tabular-nums">{progress?.learned ?? '–'}</span>{' '}
              {t('study.learned')}
            </span>
            <span>
              <span className="font-serif text-2xl text-[var(--foreground)] tabular-nums">{progress?.tracked ?? '–'}</span>{' '}
              {t('study.tracked')}
            </span>
            <span>
              <span className="font-serif text-2xl text-[var(--foreground)] tabular-nums">{progress?.totalQuestions ?? '–'}</span>{' '}
              {t('study.totalQuestions')}
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold">{t('today.dueFirst')}</h2>
          {due.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">{t('study.empty')}</p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--border)]">
              {due.map((item) => (
                <li key={item.questionId} className="py-4">
                  <Link href="/study" className="block">
                    <p className="font-serif text-lg leading-snug">{item.question.question}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{item.question.category}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {notes.length > 0 ? (
            <div className="mt-10">
              <h2 className="text-base font-semibold">{t('today.shared')}</h2>
              <ul className="mt-4 divide-y divide-[var(--border)]">
                {notes.map((note) => (
                  <li key={note.id} className="py-3 text-sm">
                    {t('notifications.invite').replace('{{title}}', note.payload.diagramTitle ?? '')}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 border-t border-[var(--border)] pt-8 md:grid-cols-2">
        <RecentList title={t('today.resume')} hint={t('today.recentHint')} items={docs} href={(id) => `/documents/${id}`} empty={t('today.emptyDocs')} />
        <RecentList title={t('nav.diagrams')} hint={t('today.recentHint')} items={diagrams} href={(id) => `/diagrams/${id}`} empty={t('today.emptyDiagrams')} />
      </section>
    </div>
  );
}

function RecentList(props: {
  title: string;
  hint: string;
  items: RecentItem[];
  href: (id: string) => string;
  empty: string;
}): ReactNode {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">{props.title}</h2>
        <span className="text-xs text-[var(--muted)]">{props.hint}</span>
      </div>
      {props.items.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">{props.empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--border)]">
          {props.items.map((item) => (
            <li key={item.id} className="flex items-baseline justify-between gap-4 py-3">
              <Link href={props.href(item.id)} className="min-w-0 truncate font-serif text-lg hover:underline">
                {item.title}
              </Link>
              <span className="shrink-0 text-xs tabular-nums text-[var(--muted)]">
                {new Date(item.updatedAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
