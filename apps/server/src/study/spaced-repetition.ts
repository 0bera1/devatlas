/** Kullanıcının cevap değerlendirmesi: 0 = Tekrar, 1 = Zor, 2 = İyi, 3 = Kolay. */
export type ReviewRating = 0 | 1 | 2 | 3;

export interface ReviewState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface NextReview extends ReviewState {
  dueAt: Date;
}

export const INITIAL_REVIEW_STATE: ReviewState = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
};

const MIN_EASE_FACTOR = 1.3;
const AGAIN_RETRY_MINUTES = 10;
const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

/** SM-2 kalite skorları: Tekrar = 0 (başarısız), Zor = 3, İyi = 4, Kolay = 5. */
const QUALITY_BY_RATING: Record<ReviewRating, number> = {
  0: 0,
  1: 3,
  2: 4,
  3: 5,
};

/**
 * SM-2 algoritmasına dayalı bir sonraki tekrar planı.
 * - "Tekrar" yeniden başlatır ve 10 dakika sonrasına planlar.
 * - Diğer değerlendirmelerde aralık 1 gün, 6 gün, sonra ease factor ile büyür.
 */
export function computeNextReview(
  previous: ReviewState,
  rating: ReviewRating,
  now: Date,
): NextReview {
  if (rating === 0) {
    return {
      easeFactor: Math.max(
        MIN_EASE_FACTOR,
        previous.easeFactor - 0.2,
      ),
      intervalDays: 0,
      repetitions: 0,
      dueAt: new Date(now.getTime() + AGAIN_RETRY_MINUTES * MS_PER_MINUTE),
    };
  }

  const quality: number = QUALITY_BY_RATING[rating];
  const easeDelta: number =
    0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  const easeFactor: number = Math.max(
    MIN_EASE_FACTOR,
    previous.easeFactor + easeDelta,
  );
  const repetitions: number = previous.repetitions + 1;

  let intervalDays: number;
  if (repetitions === 1) {
    intervalDays = 1;
  } else if (repetitions === 2) {
    intervalDays = 6;
  } else {
    intervalDays = Math.max(1, Math.round(previous.intervalDays * easeFactor));
  }

  return {
    easeFactor,
    intervalDays,
    repetitions,
    dueAt: new Date(now.getTime() + intervalDays * MS_PER_DAY),
  };
}
