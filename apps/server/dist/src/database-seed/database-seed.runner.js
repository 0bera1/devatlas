"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSeedRunner = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const documents_data_1 = require("../../prisma/seed/data/documents.data");
const diagrams_data_1 = require("../../prisma/seed/data/diagrams.data");
const flows_data_1 = require("../../prisma/seed/data/flows.data");
const narratives_data_1 = require("../../prisma/seed/data/narratives.data");
const users_data_1 = require("../../prisma/seed/data/users.data");
const BCRYPT_SALT_ROUNDS = 10;
class DatabaseSeedRunner {
    persistence;
    logger = new common_1.Logger(DatabaseSeedRunner.name);
    constructor(persistence) {
        this.persistence = persistence;
    }
    async run() {
        this.logger.log('Seeding test users…');
        await this.seedUsersTable();
        this.logger.log('Seeding knowledge documents…');
        await this.seedKnowledgeDocuments();
        this.logger.log('Seeding knowledge diagrams…');
        const diagramIds = await this.seedKnowledgeDiagrams();
        this.logger.log('Seeding knowledge flows…');
        await this.seedKnowledgeFlows(diagramIds);
        this.logger.log('Seed completed.');
    }
    resolveFlowSeedInputs() {
        return flows_data_1.seedFlows.map((flow) => {
            const extra = narratives_data_1.flowNarratives.find((n) => n.slug === flow.slug);
            if (extra === undefined) {
                return flow;
            }
            return {
                ...flow,
                narrative: extra.narrative,
                steps: flow.steps.map((step) => {
                    const stepExtra = extra.steps.find((s) => s.diagramSlug === step.diagramSlug);
                    return {
                        ...step,
                        label: stepExtra?.label ?? step.label,
                        narrative: stepExtra?.narrative ?? step.narrative,
                    };
                }),
            };
        });
    }
    async seedUsersTable() {
        for (const user of users_data_1.seedUsers) {
            const hashed = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
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
    async seedKnowledgeDocuments() {
        for (const doc of documents_data_1.seedDocuments) {
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
    async seedKnowledgeDiagrams() {
        const slugToId = new Map();
        for (const diagram of diagrams_data_1.seedDiagrams) {
            const narrative = narratives_data_1.diagramNarratives[diagram.slug] ?? diagram.narrative ?? null;
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
            }
            else {
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
            const diagramId = slugToId.get(diagram.slug);
            const nodeId = (localId) => `${diagram.slug}__${localId}`;
            await this.persistence.systemDiagramNode.createMany({
                data: diagram.nodes.map((n) => {
                    const row = {
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
                        row.extras = n.extras;
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
    async seedKnowledgeFlows(diagramSlugToId) {
        const flowsToSeed = this.resolveFlowSeedInputs();
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
                const diagramId = diagramSlugToId.get(step.diagramSlug);
                if (diagramId === undefined) {
                    throw new Error(`Flow "${flow.slug}" references unknown diagram slug "${step.diagramSlug}"`);
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
exports.DatabaseSeedRunner = DatabaseSeedRunner;
//# sourceMappingURL=database-seed.runner.js.map