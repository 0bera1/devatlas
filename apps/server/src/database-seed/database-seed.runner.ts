import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedDocuments } from '../../prisma/seed/data/documents.data';
import { seedDiagrams } from '../../prisma/seed/data/diagrams.data';
import { seedFlows } from '../../prisma/seed/data/flows.data';
import {
  getDiagramNarrativeTrEn,
  resolveFlowSeedInputs,
} from '../../prisma/seed/data/narratives.seed';
import { seedInterviewQuestions } from '../../prisma/seed/data/interview-questions.data';
import { seedUsers } from '../../prisma/seed/data/users.data';
import type { SeedFlowInput } from '../../prisma/seed/types';
import type { IDatabaseSeedPersistence } from './interfaces/database-seed-persistence.interface';

const BCRYPT_SALT_ROUNDS = 10;

export class DatabaseSeedRunner {
  private readonly logger: Logger = new Logger(DatabaseSeedRunner.name);

  public constructor(
    private readonly persistence: IDatabaseSeedPersistence,
  ) {}

  public async run(): Promise<void> {
    this.logger.log('Seeding test users…');
    await this.seedUsersTable();

    this.logger.log('Seeding knowledge documents…');
    await this.seedKnowledgeDocuments();

    this.logger.log('Seeding knowledge diagrams…');
    const diagramIds: Map<string, string> = await this.seedKnowledgeDiagrams();

    this.logger.log('Seeding knowledge flows…');
    await this.seedKnowledgeFlows(diagramIds);

    this.logger.log('Seeding interview prep questions…');
    await this.seedInterviewQuestionsTable();

    this.logger.log('Seed completed.');
  }

  private async seedUsersTable(): Promise<void> {
    for (const user of seedUsers) {
      const hashed: string = await bcrypt.hash(
        user.password,
        BCRYPT_SALT_ROUNDS,
      );
      await this.persistence.user.upsert({
        where: { email: user.email },
        create: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: hashed,
          birthDate: user.birthDate,
        },
        update: {
          firstName: user.firstName,
          lastName: user.lastName,
          password: hashed,
          birthDate: user.birthDate,
        },
      });
    }
  }

  private async seedKnowledgeDocuments(): Promise<void> {
    for (const doc of seedDocuments) {
      await this.persistence.systemDocument.upsert({
        where: { slug: doc.slug },
        create: {
          slug: doc.slug,
          title: doc.title,
          summary: doc.summary,
          content: doc.content,
          sortOrder: doc.sortOrder,
        },
        update: {
          title: doc.title,
          summary: doc.summary,
          content: doc.content,
          sortOrder: doc.sortOrder,
        },
      });
    }
  }

  private async seedKnowledgeDiagrams(): Promise<Map<string, string>> {
    const slugToId = new Map<string, string>();

    for (const diagram of seedDiagrams) {
      const fromSeed: ReturnType<typeof getDiagramNarrativeTrEn> =
        getDiagramNarrativeTrEn(diagram.slug);
      const narrativeTr: string | null =
        diagram.narrativeTr ?? fromSeed.narrativeTr;
      const narrativeEn: string | null =
        diagram.narrativeEn ?? fromSeed.narrativeEn;
      const existing = await this.persistence.systemDiagram.findUnique({
        where: { slug: diagram.slug },
        select: { id: true },
      });

      if (existing !== null) {
        await this.persistence.systemDiagramEdge.deleteMany({
          where: { diagramId: existing.id },
        });
        await this.persistence.systemDiagramNode.deleteMany({
          where: { diagramId: existing.id },
        });
        await this.persistence.systemDiagram.update({
          where: { id: existing.id },
          data: {
            title: diagram.title,
            description: diagram.description,
            narrativeTr,
            narrativeEn,
            sortOrder: diagram.sortOrder,
          },
        });
        slugToId.set(diagram.slug, existing.id);
      } else {
        const created = await this.persistence.systemDiagram.create({
          data: {
            slug: diagram.slug,
            title: diagram.title,
            description: diagram.description,
            narrativeTr,
            narrativeEn,
            sortOrder: diagram.sortOrder,
          },
        });
        slugToId.set(diagram.slug, created.id);
      }

      const diagramId: string = slugToId.get(diagram.slug) as string;
      const nodeId = (localId: string): string => `${diagram.slug}__${localId}`;

      await this.persistence.systemDiagramNode.createMany({
        data: diagram.nodes.map((n) => {
          const row: Prisma.SystemDiagramNodeCreateManyInput = {
            id: nodeId(n.id),
            diagramId,
            label: n.label,
            type: n.type,
            x: n.x,
            y: n.y,
            width: n.width ?? null,
            height: n.height ?? null,
          };
          if (n.extras !== undefined) {
            row.extras = n.extras as Prisma.InputJsonValue;
          }
          return row;
        }),
      });

      await this.persistence.systemDiagramEdge.createMany({
        data: diagram.edges.map((e) => ({
          diagramId,
          fromNodeId: nodeId(e.from),
          toNodeId: nodeId(e.to),
          label: e.label ?? null,
          type: e.type ?? null,
          animated: e.animated ?? false,
        })),
      });
    }

    return slugToId;
  }

  private async seedKnowledgeFlows(
    diagramSlugToId: Map<string, string>,
  ): Promise<void> {
    const flowsToSeed: SeedFlowInput[] = resolveFlowSeedInputs();

    for (const flow of flowsToSeed) {
      const flowRow = await this.persistence.systemFlow.upsert({
        where: { slug: flow.slug },
        create: {
          slug: flow.slug,
          title: flow.title,
          description: flow.description,
          narrativeTr: flow.narrativeTr ?? null,
          narrativeEn: flow.narrativeEn ?? null,
          sortOrder: flow.sortOrder,
        },
        update: {
          title: flow.title,
          description: flow.description,
          narrativeTr: flow.narrativeTr ?? null,
          narrativeEn: flow.narrativeEn ?? null,
          sortOrder: flow.sortOrder,
        },
      });

      await this.persistence.systemFlowStep.deleteMany({
        where: { flowId: flowRow.id },
      });

      let order = 1;
      for (const step of flow.steps) {
        const diagramId: string | undefined = diagramSlugToId.get(
          step.diagramSlug,
        );
        if (diagramId === undefined) {
          throw new Error(
            `Flow "${flow.slug}" references unknown diagram slug "${step.diagramSlug}"`,
          );
        }
        await this.persistence.systemFlowStep.create({
          data: {
            flowId: flowRow.id,
            diagramId,
            stepOrder: order,
            label: step.label,
            narrativeTr: step.narrativeTr ?? null,
            narrativeEn: step.narrativeEn ?? null,
          },
        });
        order += 1;
      }
    }
  }

  private async seedInterviewQuestionsTable(): Promise<void> {
    await this.persistence.interviewQuestion.deleteMany({});

    const slugToId = new Map<string, string>();
    const mains = seedInterviewQuestions.filter(
      (item) => item.parentSlug === null,
    );
    const followUps = seedInterviewQuestions.filter(
      (item) => item.parentSlug !== null,
    );

    for (const item of mains) {
      const row = await this.persistence.interviewQuestion.create({
        data: {
          slug: item.slug,
          question: item.question,
          answer: item.answer,
          category: item.category,
          tags: [...item.tags],
          difficulty: item.difficulty,
          questionKey: item.questionKey,
        },
      });
      slugToId.set(item.slug, row.id);
    }

    for (const item of followUps) {
      const parentId: string | undefined = slugToId.get(
        item.parentSlug as string,
      );
      if (parentId === undefined) {
        throw new Error(
          `Interview follow-up "${item.slug}" references unknown parent "${item.parentSlug}"`,
        );
      }

      await this.persistence.interviewQuestion.create({
        data: {
          slug: item.slug,
          question: item.question,
          answer: item.answer,
          category: item.category,
          tags: [...item.tags],
          difficulty: item.difficulty,
          questionKey: item.questionKey,
          parentId,
        },
      });
    }
  }
}
