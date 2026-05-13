import { Inject, Injectable } from '@nestjs/common';
import {
  PRISMA_SERVICE,
  type IPrismaService,
} from '../../prisma/interfaces/prisma-service.interface';
import type { InterviewQuestionRecord } from './interfaces/interview-question-record.interface';
import type { IInterviewQuestionRepository } from './interfaces/interview-question-repository.interface';

const INTERVIEW_QUESTION_DEFAULT_ORDER: 'desc' = 'desc';

@Injectable()
export class InterviewQuestionRepository
  implements IInterviewQuestionRepository
{
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
  ) {}

  public async selectQuestionsByTagsAnyMatch(
    tagNames: readonly string[],
    take: number,
  ): Promise<InterviewQuestionRecord[]> {
    if (tagNames.length === 0) {
      return [];
    }

    const rows = await this.prisma.interviewQuestion.findMany({
      where: {
        tags: { hasSome: [...tagNames] },
      },
      take,
      orderBy: { updatedAt: INTERVIEW_QUESTION_DEFAULT_ORDER },
      select: {
        id: true,
        question: true,
        answer: true,
        tags: true,
        difficulty: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return rows.map(
      (row): InterviewQuestionRecord => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        tags: [...row.tags],
        difficulty: row.difficulty,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }
}
