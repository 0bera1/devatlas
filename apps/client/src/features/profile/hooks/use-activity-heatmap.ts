'use client';

import type { UserActivityEntry } from '@/domains/profile/profileDomains';
import { useMemo } from 'react';

/**
 * Heatmap renk seviyesi: 0 boş, 1 soluk, 4 en belirgin.
 */
export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapDay {
  /** UTC günü, gece yarısı. */
  readonly date: Date;
  readonly isoDate: string;
  readonly count: number;
  readonly level: HeatmapLevel;
  /** Aralık dışındaysa (padding hücresi) `true`. */
  readonly outOfRange: boolean;
}

export interface HeatmapWeek {
  /** İlk hücrenin tarihi (paddingli olabilir). */
  readonly weekStart: Date;
  readonly days: readonly HeatmapDay[];
}

export interface HeatmapMatrix {
  readonly weeks: readonly HeatmapWeek[];
  readonly totalCount: number;
  readonly activeDayCount: number;
  /** Sadece aktif (count > 0) günlerin ortalaması. */
  readonly activeAverage: number;
  readonly from: Date;
  readonly to: Date;
}

const DEFAULT_WEEKS: number = 52;

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addUtcDays(date: Date, days: number): Date {
  const next: Date = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * GitHub paritesi için: haftayı Pazartesi başlatıyoruz. JS'in `getUTCDay`'inde
 * 0 = Pazar; pazartesi merkezli ofseti `(day + 6) % 7` ile alıyoruz.
 */
function mondayBasedDayIndex(date: Date): number {
  return (date.getUTCDay() + 6) % 7;
}

function classifyLevel(count: number, activeAverage: number): HeatmapLevel {
  if (count <= 0) {
    return 0;
  }
  if (activeAverage <= 0) {
    return 1;
  }
  const ratio: number = count / activeAverage;
  switch (true) {
    case ratio <= 0.5:
      return 1;
    case ratio <= 1.0:
      return 2;
    case ratio <= 1.5:
      return 3;
    default:
      return 4;
  }
}

function buildCountIndex(
  entries: readonly UserActivityEntry[],
): ReadonlyMap<string, number> {
  const out = new Map<string, number>();
  for (const entry of entries) {
    const date: Date = startOfUtcDay(new Date(entry.bucketDate));
    out.set(isoDate(date), entry.count);
  }
  return out;
}

export function useActivityHeatmapMatrix(
  entries: readonly UserActivityEntry[] | undefined,
  options: { weeks?: number; today?: Date } = {},
): HeatmapMatrix {
  return useMemo<HeatmapMatrix>(() => {
    const todayRaw: Date = options.today ?? new Date();
    const today: Date = startOfUtcDay(todayRaw);
    const weeksCount: number = options.weeks ?? DEFAULT_WEEKS;

    // Bugünün ait olduğu haftanın pazartesisi → kafes sağ-en üst hizalaması.
    const todayMondayOffset: number = mondayBasedDayIndex(today);
    const currentWeekMonday: Date = addUtcDays(today, -todayMondayOffset);
    const firstWeekMonday: Date = addUtcDays(
      currentWeekMonday,
      -(weeksCount - 1) * 7,
    );

    const counts: ReadonlyMap<string, number> = buildCountIndex(entries ?? []);

    // Önce active average'ı hesapla: yalnızca matrise dahil olacak günler.
    let totalCount: number = 0;
    let activeDayCount: number = 0;
    for (let w: number = 0; w < weeksCount; w += 1) {
      for (let d: number = 0; d < 7; d += 1) {
        const date: Date = addUtcDays(firstWeekMonday, w * 7 + d);
        if (date.getTime() > today.getTime()) {
          continue;
        }
        const value: number = counts.get(isoDate(date)) ?? 0;
        if (value > 0) {
          totalCount += value;
          activeDayCount += 1;
        }
      }
    }
    const activeAverage: number =
      activeDayCount === 0 ? 0 : totalCount / activeDayCount;

    const weeks: HeatmapWeek[] = [];
    for (let w: number = 0; w < weeksCount; w += 1) {
      const weekStart: Date = addUtcDays(firstWeekMonday, w * 7);
      const days: HeatmapDay[] = [];
      for (let d: number = 0; d < 7; d += 1) {
        const date: Date = addUtcDays(weekStart, d);
        const outOfRange: boolean = date.getTime() > today.getTime();
        const count: number = outOfRange
          ? 0
          : (counts.get(isoDate(date)) ?? 0);
        days.push({
          date,
          isoDate: isoDate(date),
          count,
          level: outOfRange ? 0 : classifyLevel(count, activeAverage),
          outOfRange,
        });
      }
      weeks.push({ weekStart, days });
    }

    return {
      weeks,
      totalCount,
      activeDayCount,
      activeAverage,
      from: firstWeekMonday,
      to: today,
    };
  }, [entries, options.weeks, options.today]);
}
