export interface RelatedInterviewQuestion {
    readonly id: string;
    readonly question: string;
    readonly answer: string;
    readonly tags: readonly string[];
    readonly difficulty: string | null;
    readonly score: number;
    readonly matchingTags: readonly string[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export interface RelatedInterviewQuestionsResource {
    readonly documentId: string;
    readonly documentTags: readonly string[];
    readonly relatedInterviewQuestions: readonly RelatedInterviewQuestion[];
}
