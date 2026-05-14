'use client';

import { useUserActivityQuery } from '@/features/profile/queries/useProfileQuery';
import {
  useActivityHeatmapMatrix,
  type HeatmapLevel,
  type HeatmapMatrix,
} from '@/features/profile/hooks/use-activity-heatmap';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { MessageKey } from '@/i18n';
import type { ReactNode } from 'react';

const WEEKDAY_KEYS: ReadonlyArray<{
  row: number;
  key: MessageKey;
}> = [
  { row: 0, key: 'profile.activity.weekday.mon' },
  { row: 2, key: 'profile.activity.weekday.wed' },
  { row: 4, key: 'profile.activity.weekday.fri' },
];

const MONTH_KEYS: readonly MessageKey[] = [
  'profile.activity.month.jan',
  'profile.activity.month.feb',
  'profile.activity.month.mar',
  'profile.activity.month.apr',
  'profile.activity.month.may',
  'profile.activity.month.jun',
  'profile.activity.month.jul',
  'profile.activity.month.aug',
  'profile.activity.month.sep',
  'profile.activity.month.oct',
  'profile.activity.month.nov',
  'profile.activity.month.dec',
];

function levelToClassName(level: HeatmapLevel): string {
  switch (level) {
    case 0:
      return 'bg-zinc-200 dark:bg-zinc-800';
    case 1:
      return 'bg-emerald-200 dark:bg-emerald-900';
    case 2:
      return 'bg-emerald-400 dark:bg-emerald-700';
    case 3:
      return 'bg-emerald-500 dark:bg-emerald-500';
    case 4:
      return 'bg-emerald-700 dark:bg-emerald-300';
    default: {
      const _exhaustive: never = level;
      return _exhaustive;
    }
  }
}

interface MonthLabelMarker {
  readonly weekIndex: number;
  readonly monthKey: MessageKey;
}

function buildMonthLabels(matrix: HeatmapMatrix): readonly MonthLabelMarker[] {
  const markers: MonthLabelMarker[] = [];
  let lastMonth: number = -1;
  matrix.weeks.forEach((week, weekIndex) => {
    // Haftanın ortasındaki günden ayı al, sadece yeni ay başlangıcında etiketle.
    const referenceDay: Date = week.days[3]?.date ?? week.weekStart;
    const month: number = referenceDay.getUTCMonth();
    if (month !== lastMonth) {
      markers.push({ weekIndex, monthKey: MONTH_KEYS[month]! });
      lastMonth = month;
    }
  });
  return markers;
}

interface ProfileActivityHeatmapProps {
  readonly weeks?: number;
}

export function ProfileActivityHeatmap({
  weeks,
}: ProfileActivityHeatmapProps): ReactNode {
  const { t } = useTranslations();
  const { data, isLoading, isError } = useUserActivityQuery();
  const matrix: HeatmapMatrix = useActivityHeatmapMatrix(data ?? [], {
    weeks,
  });

  if (isLoading) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t('common.loading')}
      </p>
    );
  }
  if (isError) {
    return (
      <p className="text-sm text-rose-600 dark:text-rose-400">
        {t('errors.network')}
      </p>
    );
  }

  const monthMarkers = buildMonthLabels(matrix);

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-2">
        <MonthLabelRow markers={monthMarkers} weekCount={matrix.weeks.length} />
        <div className="flex gap-2">
          <WeekdayLabelColumn />
          <HeatmapGrid matrix={matrix} />
        </div>
        <HeatmapLegend />
      </div>
    </div>
  );
}

function MonthLabelRow({
  markers,
  weekCount,
}: {
  readonly markers: readonly MonthLabelMarker[];
  readonly weekCount: number;
}): ReactNode {
  const { t } = useTranslations();
  const markerByWeek: ReadonlyMap<number, MessageKey> = new Map(
    markers.map((m): readonly [number, MessageKey] => [m.weekIndex, m.monthKey]),
  );
  return (
    <div className="ml-9 flex gap-[0.125rem] text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
      {Array.from({ length: weekCount }).map((_, weekIndex) => {
        const key: MessageKey | undefined = markerByWeek.get(weekIndex);
        return (
          <span
            key={weekIndex}
            className="h-[0.875rem] w-[0.875rem] overflow-visible whitespace-nowrap"
          >
            {key !== undefined ? t(key) : ''}
          </span>
        );
      })}
    </div>
  );
}

function WeekdayLabelColumn(): ReactNode {
  const { t } = useTranslations();
  return (
    <div className="grid h-[7.875rem] grid-rows-7 gap-[0.125rem] text-[10px] text-zinc-500 dark:text-zinc-500">
      {Array.from({ length: 7 }).map((_, row) => {
        const label = WEEKDAY_KEYS.find(w => w.row === row);
        return (
          <span key={row} className="flex h-[0.875rem] items-center pr-1">
            {label !== undefined ? t(label.key) : ''}
          </span>
        );
      })}
    </div>
  );
}

function HeatmapGrid({ matrix }: { readonly matrix: HeatmapMatrix }): ReactNode {
  const { t } = useTranslations();
  return (
    <div className="flex gap-[0.125rem]">
      {matrix.weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-[0.125rem]">
          {week.days.map(day => {
            if (day.outOfRange) {
              return (
                <span
                  key={day.isoDate}
                  className="h-[0.875rem] w-[0.875rem] rounded-[2px] bg-transparent"
                />
              );
            }
            const tooltip: string =
              day.count > 0
                ? `${day.isoDate} • ${t('profile.activity.tooltipCount').replace('{{count}}', String(day.count))}`
                : `${day.isoDate} • ${t('profile.activity.tooltipNone')}`;
            return (
              <span
                key={day.isoDate}
                title={tooltip}
                className={`h-[0.875rem] w-[0.875rem] rounded-[2px] ${levelToClassName(day.level)}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function HeatmapLegend(): ReactNode {
  const { t } = useTranslations();
  const levels: HeatmapLevel[] = [0, 1, 2, 3, 4];
  return (
    <div className="ml-9 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
      <span>{t('profile.activity.legendLess')}</span>
      <div className="flex gap-[0.125rem]">
        {levels.map(level => (
          <span
            key={level}
            className={`h-[0.875rem] w-[0.875rem] rounded-[2px] ${levelToClassName(level)}`}
          />
        ))}
      </div>
      <span>{t('profile.activity.legendMore')}</span>
    </div>
  );
}
