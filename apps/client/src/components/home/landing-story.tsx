'use client';

import { LandingFooter } from '@/components/home/landing-footer';
import { LandingHeader } from '@/components/home/landing-header';
import { useStoryProgress } from '@/components/home/use-story-progress';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { MessageKey } from '@/i18n';
import {
  CHAPTERS,
  FEATURE_COUNT,
  GRAPH_HEIGHT,
  GRAPH_WIDTH,
  NODE_HEIGHT,
  NODE_WIDTH,
  chapterOpacity,
  computeGraphFrame,
  featureRange,
  type GraphFrame,
} from '@/lib/landing/story-timeline';
import Link from 'next/link';
import { useMemo, useRef, type ReactNode } from 'react';

/** Kaydırma alanının yüksekliği (viewport yüzdesi). Sahne bu alan boyunca sabit kalır. */
const TRACK_VH = 560;

const FEATURE_KEYS: ReadonlyArray<{ title: MessageKey; body: MessageKey }> = [
  { title: 'home.story.feature1.title', body: 'home.story.feature1.body' },
  { title: 'home.story.feature2.title', body: 'home.story.feature2.body' },
  { title: 'home.story.feature3.title', body: 'home.story.feature3.body' },
  { title: 'home.story.feature4.title', body: 'home.story.feature4.body' },
];

/** Kaydırmaya bağlı tanıtım: bölümler sırayla açılır, grafik dağınık halden düzenli mimariye geçer. */
export function LandingStory(): ReactNode {
  const { t } = useTranslations();
  const trackRef = useRef<HTMLDivElement>(null);
  const progress: number = useStoryProgress(trackRef);
  const frame: GraphFrame = useMemo((): GraphFrame => computeGraphFrame(progress), [progress]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <LandingHeader />

      <div ref={trackRef} className="relative" style={{ height: `${TRACK_VH}vh` }}>
        <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl flex-1 content-center gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12">
            <StoryCopy progress={progress} t={t} />
            <StoryGraph frame={frame} />
          </div>

          <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 pb-6 sm:px-6">
            <div className="h-px flex-1 overflow-hidden bg-[var(--border)]" role="progressbar" aria-label={t('home.story.scrollHint')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
              <div className="h-full bg-[var(--accent)]" style={{ width: `${progress * 100}%` }} />
            </div>
            <span
              className="text-xs text-[var(--muted)] transition-opacity duration-300"
              style={{ opacity: progress < 0.04 ? 1 : 0 }}
              aria-hidden
            >
              {t('home.story.scrollHint')}
            </span>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}

interface StoryCopyProps {
  readonly progress: number;
  readonly t: (key: MessageKey) => string;
}

/** Tüm bölüm metinleri aynı hücrede üst üste durur; görünürlük ilerlemeye göre değişir. */
function StoryCopy(props: StoryCopyProps): ReactNode {
  const { progress, t } = props;

  return (
    <div className="grid min-w-0 [&>*]:col-start-1 [&>*]:row-start-1">
      <Chapter progress={progress} range={CHAPTERS.hero} fade={0.1}>
        <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl">{t('home.story.hero.headline')}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">{t('home.story.hero.sub')}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
          >
            {t('home.story.cta.button')}
          </Link>
          <Link
            href="/explore"
            className="rounded-full border border-[var(--border)] px-6 py-3 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
          >
            {t('nav.explore')}
          </Link>
        </div>
      </Chapter>

      <Chapter progress={progress} range={CHAPTERS.problem}>
        <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">{t('home.story.problem.title')}</h2>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">{t('home.story.problem.body')}</p>
      </Chapter>

      <Chapter progress={progress} range={CHAPTERS.transition}>
        <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">{t('home.story.transition.title')}</h2>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">{t('home.story.transition.body')}</p>
      </Chapter>

      {FEATURE_KEYS.slice(0, FEATURE_COUNT).map((item, index) => {
        const [start, end] = featureRange(index);
        return (
          <Chapter key={item.title} progress={progress} range={[start, end]} fade={0.03}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {String(index + 1).padStart(2, '0')} / {String(FEATURE_COUNT).padStart(2, '0')}
            </p>
            <h2 className="mt-4 font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">{t(item.title)}</h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">{t(item.body)}</p>
          </Chapter>
        );
      })}

      <Chapter progress={progress} range={CHAPTERS.demo} fade={0.06}>
        <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">{t('home.story.demo.title')}</h2>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">{t('home.story.demo.body')}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/register"
            className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
          >
            {t('home.story.cta.button')}
          </Link>
          <span className="text-sm text-[var(--muted)]">{t('home.story.cta.title')}</span>
        </div>
      </Chapter>
    </div>
  );
}

interface ChapterProps {
  readonly progress: number;
  readonly range: readonly [number, number];
  readonly fade?: number;
  readonly children: ReactNode;
}

function Chapter(props: ChapterProps): ReactNode {
  const { progress, range, fade, children } = props;
  const opacity: number = chapterOpacity(progress, range[0], range[1], fade);
  const visible: boolean = opacity > 0.001;

  return (
    <div
      className="transition-none"
      style={{
        opacity,
        transform: `translateY(${(1 - opacity) * 14}px)`,
        visibility: visible ? 'visible' : 'hidden',
      }}
      aria-hidden={!visible}
    >
      {children}
    </div>
  );
}

interface StoryGraphProps {
  readonly frame: GraphFrame;
}

/** Düğüm ve kenarları çizen SVG. Dekoratiftir; anlatım metinleri ayrıca okunur. */
function StoryGraph(props: StoryGraphProps): ReactNode {
  const { frame } = props;

  return (
    <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
      <svg viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} className="h-auto w-full" aria-hidden="true">
        {frame.edges.map((edge) => (
          <path
            key={`${edge.from}-${edge.to}`}
            d={`M ${edge.x1} ${edge.y1} L ${edge.x2} ${edge.y2}`}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - edge.draw}
            fill="none"
            stroke={edge.highlighted ? 'var(--accent)' : 'var(--border)'}
            strokeWidth={edge.highlighted ? 2 : 1.5}
          />
        ))}

        {frame.nodes.map((node) => (
          <g key={node.id} opacity={node.opacity}>
            <rect
              x={node.x - NODE_WIDTH / 2}
              y={node.y - NODE_HEIGHT / 2}
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              rx={12}
              fill="var(--background)"
              stroke={node.highlighted || node.accent ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={node.highlighted ? 2.5 : node.accent ? 2 : 1.5}
            />
            <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize={15} fontWeight={600} fill="var(--foreground)">
              {node.label}
            </text>
          </g>
        ))}

        {frame.cursors.map((cursor, index) => (
          <circle
            key={index}
            cx={cursor.x}
            cy={cursor.y}
            r={6}
            fill="var(--accent)"
            stroke="var(--background)"
            strokeWidth={2}
            opacity={cursor.opacity}
          />
        ))}
      </svg>
    </div>
  );
}
