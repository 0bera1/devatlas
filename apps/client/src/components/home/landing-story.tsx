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
import { useMemo, useRef, type ReactNode, type RefObject } from 'react';

/** Kaydırma alanının yüksekliği (viewport yüzdesi). Sahne bu alan boyunca sabit kalır. */
const TRACK_VH = 560;

/** Her bölümün başladığı ilerleme değeri; bölüm noktalarının hedefi. */
const CHAPTER_STARTS: readonly number[] = [0, CHAPTERS.problem[0], CHAPTERS.transition[0], CHAPTERS.features[0], CHAPTERS.demo[0]];
const CHAPTER_COUNT: number = CHAPTER_STARTS.length;

/** Veri noktalarının bağlantı üzerinde akmaya başladığı ilerleme değeri. */
const PULSE_FROM: number = 0.5;

const FEATURE_KEYS: ReadonlyArray<{ title: MessageKey; body: MessageKey }> = [
  { title: 'home.story.feature1.title', body: 'home.story.feature1.body' },
  { title: 'home.story.feature2.title', body: 'home.story.feature2.body' },
  { title: 'home.story.feature3.title', body: 'home.story.feature3.body' },
  { title: 'home.story.feature4.title', body: 'home.story.feature4.body' },
];

function chapterLabel(index: number, total: number): string {
  return `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}

/** Kaydırmaya bağlı tanıtım: bölümler sırayla açılır, grafik dağınık halden düzenli mimariye geçer. */
export function LandingStory(): ReactNode {
  const { t } = useTranslations();
  const trackRef = useRef<HTMLDivElement>(null);
  const progress: number = useStoryProgress(trackRef);
  const frame: GraphFrame = useMemo((): GraphFrame => computeGraphFrame(progress), [progress]);

  const activeChapter: number = CHAPTER_STARTS.reduce((current: number, start: number, index: number): number => (progress >= start - 0.001 ? index : current), 0);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <LandingHeader />

      <div ref={trackRef} className="relative" style={{ height: `${TRACK_VH}vh` }}>
        <div className="sticky top-0 flex h-dvh flex-col overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl flex-1 content-center gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12">
            <StoryCopy progress={progress} t={t} />
            <StoryGraph frame={frame} showPulses={progress >= PULSE_FROM} />
          </div>

          <ScrollCue progress={progress} label={t('home.story.scrollHint')} />

          <div className="mx-auto flex w-full max-w-6xl items-center gap-5 px-4 pb-6 sm:px-6">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--border)]" role="progressbar" aria-label={t('home.story.scrollHint')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
              <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${progress * 100}%` }} />
            </div>
            <ChapterDots trackRef={trackRef} activeChapter={activeChapter} />
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}

/** Aşağı kaydırma ipucu. Yalnızca başlangıçta görünür ve hareketi bir oka verir. */
function ScrollCue(props: { readonly progress: number; readonly label: string }): ReactNode {
  const { progress, label } = props;
  const visible: boolean = progress < 0.04;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-16 flex flex-col items-center gap-2 text-[var(--muted)] transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden
    >
      <span className="text-xs font-medium uppercase tracking-[0.18em]">{label}</span>
      <svg width="20" height="28" viewBox="0 0 20 28" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="animate-bounce motion-reduce:animate-none">
        <path d="M10 2v22" />
        <path d="M3 17l7 7 7-7" />
      </svg>
    </div>
  );
}

/** Sağdaki bölüm noktaları: aktif bölüm dolu, diğerleri içi boş; tıklanınca o bölüme kayar. */
function ChapterDots(props: { readonly trackRef: RefObject<HTMLElement | null>; readonly activeChapter: number }): ReactNode {
  const { trackRef, activeChapter } = props;

  const jumpTo = (index: number): void => {
    const track: HTMLElement | null = trackRef.current;
    if (track === null) {
      return;
    }
    const scrollable: number = track.offsetHeight - window.innerHeight;
    const top: number = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + scrollable * (CHAPTER_STARTS[index] ?? 0), behavior: 'smooth' });
  };

  return (
    <nav className="flex items-center gap-2">
      {CHAPTER_STARTS.map((_, index: number) => {
        const active: boolean = index === activeChapter;
        return (
          <button
            key={index}
            type="button"
            onClick={() => {
              jumpTo(index);
            }}
            aria-current={active ? 'step' : undefined}
            aria-label={`${index + 1} / ${CHAPTER_COUNT}`}
            className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              active ? 'scale-110 border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--muted)] bg-transparent hover:border-[var(--foreground)]'
            }`}
          />
        );
      })}
    </nav>
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
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
          {t('nav.brand')}
        </p>
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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{chapterLabel(1, CHAPTER_COUNT)}</p>
        <h2 className="mt-4 font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">{t('home.story.problem.title')}</h2>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">{t('home.story.problem.body')}</p>
      </Chapter>

      <Chapter progress={progress} range={CHAPTERS.transition}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{chapterLabel(2, CHAPTER_COUNT)}</p>
        <h2 className="mt-4 font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">{t('home.story.transition.title')}</h2>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">{t('home.story.transition.body')}</p>
      </Chapter>

      {FEATURE_KEYS.slice(0, FEATURE_COUNT).map((item, index) => {
        const [start, end] = featureRange(index);
        return (
          <Chapter key={item.title} progress={progress} range={[start, end]} fade={0.03}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{chapterLabel(index, FEATURE_COUNT)}</p>
            <h2 className="mt-4 font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">{t(item.title)}</h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">{t(item.body)}</p>
          </Chapter>
        );
      })}

      <Chapter progress={progress} range={CHAPTERS.demo} fade={0.06}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{chapterLabel(4, CHAPTER_COUNT)}</p>
        <h2 className="mt-4 font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl">{t('home.story.demo.title')}</h2>
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
      style={{
        opacity,
        transform: `translateY(${(1 - opacity) * 18}px)`,
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
  readonly showPulses: boolean;
}

/** Düğüm ve kenarları çizen SVG. Dekoratiftir; anlatım metinleri ayrıca okunur. */
function StoryGraph(props: StoryGraphProps): ReactNode {
  const { frame, showPulses } = props;

  return (
    <div className="relative min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:18px_18px]"
        aria-hidden
      />
      <svg viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} className="relative h-auto w-full" aria-hidden="true">
        {frame.edges.map((edge) => {
          const d: string = `M ${edge.x1} ${edge.y1} L ${edge.x2} ${edge.y2}`;
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <path
                d={d}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - edge.draw}
                fill="none"
                stroke={edge.highlighted ? 'var(--accent)' : 'var(--border)'}
                strokeWidth={edge.highlighted ? 2 : 1.5}
              />
              {showPulses && edge.draw > 0.99 ? (
                <circle r={4.5} fill="var(--accent)" opacity={edge.highlighted ? 1 : 0.55}>
                  <animateMotion dur={edge.highlighted ? '1.6s' : '2.8s'} repeatCount="indefinite" path={d} />
                </circle>
              ) : null}
            </g>
          );
        })}

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
          <g key={index} opacity={cursor.opacity}>
            <circle cx={cursor.x} cy={cursor.y} r={7} fill="var(--accent)" stroke="var(--background)" strokeWidth={2} />
          </g>
        ))}
      </svg>
    </div>
  );
}
