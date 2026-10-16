import type { InterviewQuestionCategory } from '@prisma/client';

export interface SeedInterviewQuestionInput {
  readonly slug: string;
  readonly question: string;
  readonly questionEn: string | null;
  readonly answer: string;
  readonly answerEn: string | null;
  readonly category: InterviewQuestionCategory;
  readonly tags: readonly string[];
  readonly difficulty: string | null;
  readonly questionKey: string;
  readonly parentSlug: string | null;
}

/**
 * YER TUTUCU: Bu dosyanın gerçek içeriği repoda yoktu ve git geçmişinde de bulunamadı.
 * Yerel bir kopya bulunduğunda bu dizi doldurulmalıdır. Bkz. YAPILACAKLAR.md.
 */
export const seedInterviewQuestions: readonly SeedInterviewQuestionInput[] = [];
