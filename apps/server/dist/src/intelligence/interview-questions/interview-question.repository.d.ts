import { type IPrismaService } from '../../prisma/interfaces/prisma-service.interface';
import type { InterviewQuestionRecord } from './interfaces/interview-question-record.interface';
import type { IInterviewQuestionRepository } from './interfaces/interview-question-repository.interface';
export declare class InterviewQuestionRepository implements IInterviewQuestionRepository {
    private readonly prisma;
    constructor(prisma: IPrismaService);
    selectQuestionsByTagsAnyMatch(tagNames: readonly string[], take: number): Promise<InterviewQuestionRecord[]>;
}
