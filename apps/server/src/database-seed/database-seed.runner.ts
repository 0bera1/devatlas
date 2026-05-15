import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedDocuments } from '../../prisma/seed/data/documents.data';
import { seedDiagrams } from '../../prisma/seed/data/diagrams.data';
import { seedFlows } from '../../prisma/seed/data/flows.data';
import {
  diagramNarratives,
  flowNarratives,
} from '../../prisma/seed/data/narratives.data';
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

    this.logger.log('Seed completed.');
  }

  private resolveFlowSeedInputs(): SeedFlowInput[] {
    return seedFlows.map((flow: SeedFlowInput): SeedFlowInput => {
      const extra = flowNarratives.find((n) => n.slug === flow.slug);
      if (extra === undefined) {
        return flow;
      }
      return {
        ...flow,
        narrative: extra.narrative,
        steps: flow.steps.map((step) => {
          const stepExtra = extra.steps.find(
            (s) => s.diagramSlug === step.diagramSlug,
          );
          return {
            ...step,
            label: stepExtra?.label ?? step.label,
            narrative: stepExtra?.narrative ?? step.narrative,
          };
        }),
      };
    });
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
          name: user.name,
          password: hashed,
          birthDate: user.birthDate,
        },
        update: {
          name: user.name,
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
      const narrative: string | null =
        diagramNarratives[diagram.slug] ?? diagram.narrative ?? null;
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
            narrative,
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
            narrative,
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
    const flowsToSeed: SeedFlowInput[] = this.resolveFlowSeedInputs();

    for (const flow of flowsToSeed) {
      const flowRow = await this.persistence.systemFlow.upsert({
        where: { slug: flow.slug },
        create: {
          slug: flow.slug,
          title: flow.title,
          description: flow.description,
          narrative: flow.narrative ?? null,
          sortOrder: flow.sortOrder,
        },
        update: {
          title: flow.title,
          description: flow.description,
          narrative: flow.narrative ?? null,
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
            narrative: step.narrative ?? null,
          },
        });
        order += 1;
      }
    }
  }
}
