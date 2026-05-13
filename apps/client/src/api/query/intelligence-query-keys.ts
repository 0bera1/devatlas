export type IntelligenceAuthBucket = 'auth' | 'anon';

export const intelligenceQueryKeys = {
  all: ['intelligence'] as const,
  diagramResources: (
    diagramId: string,
    authBucket: IntelligenceAuthBucket,
  ): readonly [
    'intelligence',
    'diagram-resources',
    string,
    IntelligenceAuthBucket,
  ] => ['intelligence', 'diagram-resources', diagramId, authBucket] as const,
  documentInterviewQuestions: (
    documentId: string,
    authBucket: IntelligenceAuthBucket,
  ): readonly [
    'intelligence',
    'document-interview-questions',
    string,
    IntelligenceAuthBucket,
  ] =>
    [
      'intelligence',
      'document-interview-questions',
      documentId,
      authBucket,
    ] as const,
} as const;
