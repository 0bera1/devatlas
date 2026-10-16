import {
  computeNextReview,
  INITIAL_REVIEW_STATE,
} from './spaced-repetition';

const NOW = new Date('2026-10-16T12:00:00Z');
const DAY = 86_400_000;

describe('computeNextReview (SM-2)', () => {
  it('Tekrar değerlendirmesi 10 dakika sonrasına planlar ve tekrar sayacını sıfırlar', () => {
    const next = computeNextReview(
      { easeFactor: 2.5, intervalDays: 12, repetitions: 4 },
      0,
      NOW,
    );

    expect(next.repetitions).toBe(0);
    expect(next.intervalDays).toBe(0);
    expect(next.dueAt.getTime() - NOW.getTime()).toBe(10 * 60_000);
    expect(next.easeFactor).toBeCloseTo(2.3, 5);
  });

  it('ilk başarılı tekrar 1 gün, ikincisi 6 gün sonrasına planlanır', () => {
    const first = computeNextReview(INITIAL_REVIEW_STATE, 2, NOW);
    expect(first.repetitions).toBe(1);
    expect(first.intervalDays).toBe(1);
    expect(first.dueAt.getTime() - NOW.getTime()).toBe(DAY);

    const second = computeNextReview(first, 2, NOW);
    expect(second.repetitions).toBe(2);
    expect(second.intervalDays).toBe(6);
  });

  it('sonraki aralıklar ease factor ile büyür', () => {
    const state = { easeFactor: 2.5, intervalDays: 6, repetitions: 2 };
    const next = computeNextReview(state, 2, NOW);

    expect(next.intervalDays).toBe(Math.round(6 * 2.5));
  });

  it('Kolay değerlendirme, İyi değerlendirmeden daha uzun aralık ve daha yüksek ease verir', () => {
    const state = { easeFactor: 2.5, intervalDays: 6, repetitions: 2 };
    const good = computeNextReview(state, 2, NOW);
    const easy = computeNextReview(state, 3, NOW);

    expect(easy.easeFactor).toBeGreaterThan(good.easeFactor);
    expect(easy.intervalDays).toBeGreaterThan(good.intervalDays);
  });

  it('ease factor 1.3 altına düşmez', () => {
    let state = { easeFactor: 1.3, intervalDays: 1, repetitions: 1 };
    for (let i = 0; i < 5; i++) {
      state = { ...computeNextReview(state, 1, NOW) };
    }
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});
