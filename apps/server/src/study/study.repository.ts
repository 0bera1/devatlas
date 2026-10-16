import { Inject, Injectable } from '@nestjs/common';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../prisma/interfaces/prisma-service.interface';
import type { ReviewState } from './spaced-repetition';
import type {
  DueReviewRow,
  IStudyRepository,
  SaveReviewParams,
  StudyListItemRow,
  StudyListSummary,
} from './interfaces/study-repository.interface';

/** "Öğrenildi" sayılması için en az iki başarılı tekrar. */
const LEARNED_MIN_REPETITIONS = 2;

@Injectable()
export class StudyRepository implements IStudyRepository {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async findQuestionById(id: string): Promise<{ id: string } | null> {
    return this.prisma.interviewQuestion.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  public async findDueReviews(
    userId: string,
    now: Date,
    limit: number,
  ): Promise<DueReviewRow[]> {
    const rows = await this.prisma.questionReview.findMany({
      where: { userId, dueAt: { lte: now } },
      orderBy: { dueAt: 'asc' },
      take: limit,
      select: {
        questionId: true,
        dueAt: true,
        repetitions: true,
        question: {
          select: {
            id: true,
            slug: true,
            question: true,
            answer: true,
            category: true,
            tags: true,
            difficulty: true,
          },
        },
      },
    });
    return rows;
  }

  public async findReview(
    userId: string,
    questionId: string,
  ): Promise<(ReviewState & { dueAt: Date }) | null> {
    return this.prisma.questionReview.findUnique({
      where: { userId_questionId: { userId, questionId } },
      select: { easeFactor: true, intervalDays: true, repetitions: true, dueAt: true },
    });
  }

  public async saveReview(params: SaveReviewParams): Promise<void> {
    const data = {
      easeFactor: params.easeFactor,
      intervalDays: params.intervalDays,
      repetitions: params.repetitions,
      lastRating: params.rating,
      dueAt: params.dueAt,
    };
    await this.prisma.questionReview.upsert({
      where: { userId_questionId: { userId: params.userId, questionId: params.questionId } },
      create: { userId: params.userId, questionId: params.questionId, ...data },
      update: data,
    });
  }

  public async countDue(userId: string, now: Date): Promise<number> {
    return this.prisma.questionReview.count({
      where: { userId, dueAt: { lte: now } },
    });
  }

  public async countTracked(userId: string): Promise<number> {
    return this.prisma.questionReview.count({ where: { userId } });
  }

  public async countLearned(userId: string): Promise<number> {
    return this.prisma.questionReview.count({
      where: { userId, repetitions: { gte: LEARNED_MIN_REPETITIONS } },
    });
  }

  public async countQuestions(): Promise<number> {
    return this.prisma.interviewQuestion.count();
  }

  public async findListsByUser(userId: string): Promise<StudyListSummary[]> {
    const rows = await this.prisma.studyList.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
      itemCount: row._count.items,
    }));
  }

  public async createList(userId: string, name: string): Promise<StudyListSummary> {
    const row = await this.prisma.studyList.create({
      data: { userId, name },
      select: { id: true, name: true, createdAt: true },
    });
    return { ...row, itemCount: 0 };
  }

  public async findListOwnedBy(
    listId: string,
    userId: string,
  ): Promise<{ id: string } | null> {
    return this.prisma.studyList.findFirst({
      where: { id: listId, userId },
      select: { id: true },
    });
  }

  public async deleteList(listId: string): Promise<void> {
    await this.prisma.studyList.delete({ where: { id: listId } });
  }

  public async findListItems(listId: string): Promise<StudyListItemRow[]> {
    const rows = await this.prisma.studyListItem.findMany({
      where: { listId },
      orderBy: { createdAt: 'asc' },
      select: {
        questionId: true,
        question: {
          select: { id: true, slug: true, question: true, category: true, difficulty: true },
        },
      },
    });
    return rows;
  }

  public async addListItem(listId: string, questionId: string): Promise<void> {
    await this.prisma.studyListItem.upsert({
      where: { listId_questionId: { listId, questionId } },
      create: { listId, questionId },
      update: {},
    });
  }

  public async removeListItem(listId: string, questionId: string): Promise<void> {
    await this.prisma.studyListItem.deleteMany({ where: { listId, questionId } });
  }
}
