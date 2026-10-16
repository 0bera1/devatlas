import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  computeNextReview,
  INITIAL_REVIEW_STATE,
  type ReviewRating,
} from './spaced-repetition';
import {
  STUDY_REPOSITORY,
  type DueReviewRow,
  type IStudyRepository,
  type StudyListItemRow,
  type StudyListSummary,
} from './interfaces/study-repository.interface';

export interface ProgressSummary {
  dueNow: number;
  tracked: number;
  learned: number;
  totalQuestions: number;
}

@Injectable()
export class StudyService {
  public constructor(
    @Inject(STUDY_REPOSITORY)
    private readonly repository: IStudyRepository,
  ) {}

  public async getDueReviews(userId: string, limit: number): Promise<DueReviewRow[]> {
    return this.repository.findDueReviews(userId, new Date(), limit);
  }

  /** Değerlendirmeyi kaydeder ve sonraki tekrar planını döndürür. */
  public async review(
    userId: string,
    questionId: string,
    rating: ReviewRating,
  ): Promise<{ dueAt: Date; intervalDays: number; repetitions: number }> {
    const question = await this.repository.findQuestionById(questionId);
    if (question === null) {
      throw new NotFoundException('Soru bulunamadı');
    }

    const now: Date = new Date();
    const previous =
      (await this.repository.findReview(userId, questionId)) ?? INITIAL_REVIEW_STATE;
    const next = computeNextReview(previous, rating, now);

    await this.repository.saveReview({
      userId,
      questionId,
      rating,
      easeFactor: next.easeFactor,
      intervalDays: next.intervalDays,
      repetitions: next.repetitions,
      dueAt: next.dueAt,
    });

    return {
      dueAt: next.dueAt,
      intervalDays: next.intervalDays,
      repetitions: next.repetitions,
    };
  }

  public async getProgress(userId: string): Promise<ProgressSummary> {
    const now: Date = new Date();
    const [dueNow, tracked, learned, totalQuestions] = await Promise.all([
      this.repository.countDue(userId, now),
      this.repository.countTracked(userId),
      this.repository.countLearned(userId),
      this.repository.countQuestions(),
    ]);
    return { dueNow, tracked, learned, totalQuestions };
  }

  public async getLists(userId: string): Promise<StudyListSummary[]> {
    return this.repository.findListsByUser(userId);
  }

  public async createList(userId: string, name: string): Promise<StudyListSummary> {
    return this.repository.createList(userId, name.trim());
  }

  public async deleteList(userId: string, listId: string): Promise<void> {
    await this.requireOwnedList(userId, listId);
    await this.repository.deleteList(listId);
  }

  public async getListItems(userId: string, listId: string): Promise<StudyListItemRow[]> {
    await this.requireOwnedList(userId, listId);
    return this.repository.findListItems(listId);
  }

  public async addToList(userId: string, listId: string, questionId: string): Promise<void> {
    await this.requireOwnedList(userId, listId);
    const question = await this.repository.findQuestionById(questionId);
    if (question === null) {
      throw new NotFoundException('Soru bulunamadı');
    }
    await this.repository.addListItem(listId, questionId);
  }

  public async removeFromList(userId: string, listId: string, questionId: string): Promise<void> {
    await this.requireOwnedList(userId, listId);
    await this.repository.removeListItem(listId, questionId);
  }

  private async requireOwnedList(userId: string, listId: string): Promise<void> {
    const list = await this.repository.findListOwnedBy(listId, userId);
    if (list === null) {
      throw new NotFoundException('Çalışma listesi bulunamadı');
    }
  }
}
