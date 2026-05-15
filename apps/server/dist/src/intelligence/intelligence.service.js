"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const tech_keyword_extractor_interface_1 = require("./auto-tag/interfaces/tech-keyword-extractor.interface");
const architecture_template_matcher_interface_1 = require("./diagram-generation/interfaces/architecture-template-matcher.interface");
const intelligence_constants_1 = require("./constants/intelligence.constants");
const intelligence_repository_interface_1 = require("./interfaces/intelligence-repository.interface");
const interview_question_repository_interface_1 = require("./interview-questions/interfaces/interview-question-repository.interface");
let IntelligenceService = class IntelligenceService {
    intelligenceRepository;
    techKeywordExtractor;
    architectureTemplateMatcher;
    interviewQuestionRepository;
    constructor(intelligenceRepository, techKeywordExtractor, architectureTemplateMatcher, interviewQuestionRepository) {
        this.intelligenceRepository = intelligenceRepository;
        this.techKeywordExtractor = techKeywordExtractor;
        this.architectureTemplateMatcher = architectureTemplateMatcher;
        this.interviewQuestionRepository = interviewQuestionRepository;
    }
    async getRelatedInterviewQuestionsForDocument(documentId, viewerUserId) {
        const accessibleTags = await this.intelligenceRepository.selectAccessibleDocumentTags(documentId, viewerUserId);
        if (accessibleTags === null) {
            throw new common_1.NotFoundException(`Document with id "${documentId}" not found`);
        }
        const documentTags = this.collectInterviewQuestionTags(accessibleTags);
        if (documentTags.length === 0) {
            return {
                documentId: accessibleTags.id,
                documentTags,
                relatedInterviewQuestions: [],
            };
        }
        const candidates = await this.interviewQuestionRepository.selectQuestionsByTagsAnyMatch(documentTags, intelligence_constants_1.INTERVIEW_QUESTION_CANDIDATE_LIMIT);
        const documentTagSet = new Set(documentTags);
        const scored = candidates
            .map((candidate) => this.scoreInterviewQuestion(candidate, documentTagSet))
            .filter((entry) => entry.matchingTags.length > 0)
            .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return b.updatedAt.getTime() - a.updatedAt.getTime();
        })
            .slice(0, intelligence_constants_1.INTERVIEW_QUESTION_RESOURCE_LIMIT);
        return {
            documentId: accessibleTags.id,
            documentTags,
            relatedInterviewQuestions: scored,
        };
    }
    collectInterviewQuestionTags(row) {
        const collected = [];
        const seen = new Set();
        for (const tag of row.tagNames) {
            const normalized = tag.trim().toLowerCase();
            if (normalized.length === 0 || seen.has(normalized)) {
                continue;
            }
            collected.push(normalized);
            seen.add(normalized);
            if (collected.length >= intelligence_constants_1.INTERVIEW_QUESTION_TAG_LIMIT) {
                return collected;
            }
        }
        if (row.categoryName !== null) {
            const normalizedCategory = row.categoryName.trim().toLowerCase();
            if (normalizedCategory.length > 0 && !seen.has(normalizedCategory)) {
                collected.push(normalizedCategory);
            }
        }
        return collected;
    }
    scoreInterviewQuestion(candidate, documentTagSet) {
        const matchingTags = [];
        const seen = new Set();
        for (const rawTag of candidate.tags) {
            const normalized = rawTag.trim().toLowerCase();
            if (normalized.length === 0 || seen.has(normalized)) {
                continue;
            }
            seen.add(normalized);
            if (documentTagSet.has(normalized)) {
                matchingTags.push(normalized);
            }
        }
        return {
            id: candidate.id,
            question: candidate.question,
            answer: candidate.answer,
            tags: [...candidate.tags],
            difficulty: candidate.difficulty,
            matchingTags,
            score: matchingTags.length * intelligence_constants_1.INTERVIEW_QUESTION_MATCH_SCORE,
            createdAt: candidate.createdAt,
            updatedAt: candidate.updatedAt,
        };
    }
    generateDiagramFromPrompt(prompt) {
        const result = this.architectureTemplateMatcher.match(prompt);
        const nodes = result.template.nodes.map((node) => ({
            localId: node.localId,
            label: node.label,
            type: node.type,
            x: node.x,
            y: node.y,
            width: node.width ?? null,
            height: node.height ?? null,
        }));
        const edges = result.template.edges.map((edge) => ({
            fromLocalId: edge.fromLocalId,
            toLocalId: edge.toLocalId,
            ...(edge.label === undefined ? {} : { label: edge.label }),
            ...(edge.type === undefined ? {} : { type: edge.type }),
            ...(edge.animated === undefined ? {} : { animated: edge.animated }),
        }));
        return {
            templateId: result.template.id,
            templateName: result.template.name,
            description: result.template.description,
            matchedKeywords: result.matchedKeywords,
            score: result.score,
            nodes,
            edges,
        };
    }
    extractAutoTagsFromSource(source) {
        const parts = [];
        if (source.title !== undefined && source.title.length > 0) {
            parts.push(source.title);
        }
        if (source.content !== undefined && source.content.length > 0) {
            parts.push(source.content);
        }
        if (source.extraKeywords !== undefined) {
            for (const keyword of source.extraKeywords) {
                if (keyword.length > 0) {
                    parts.push(keyword);
                }
            }
        }
        if (parts.length === 0) {
            return [];
        }
        return this.techKeywordExtractor.extractFrom(parts.join('\n'));
    }
    async extractDiagramKeywords(diagramId) {
        const nodes = await this.intelligenceRepository.selectNodeLabelsByDiagramId(diagramId);
        return this.normalizeKeywords(nodes.map((node) => node.label));
    }
    async getDiagramResources(diagramId, viewerUserId) {
        const accessibleDiagramId = await this.intelligenceRepository.selectAccessibleDiagramId(diagramId, viewerUserId);
        if (accessibleDiagramId === null) {
            throw new common_1.NotFoundException(`Diagram with id "${diagramId}" not found`);
        }
        const semanticTags = await this.extractDiagramKeywords(diagramId);
        if (semanticTags.length === 0) {
            return {
                semanticTags,
                relatedDiagrams: [],
                relatedDocuments: [],
                relatedInterviewQuestions: [],
                similarTechnologies: [],
            };
        }
        const [diagramRows, documentRows, interviewRows, technologyRows] = await Promise.all([
            this.intelligenceRepository.selectPublicDiagramCandidatesByKeywords(diagramId, semanticTags, intelligence_constants_1.RELATED_CANDIDATE_LIMIT),
            this.intelligenceRepository.selectPublicDocumentCandidatesByKeywords(semanticTags, intelligence_constants_1.RELATED_CANDIDATE_LIMIT, false),
            this.intelligenceRepository.selectPublicDocumentCandidatesByKeywords(semanticTags, intelligence_constants_1.RELATED_CANDIDATE_LIMIT, true),
            this.intelligenceRepository.selectPublicTechnologyDiagramCandidatesByKeywords(diagramId, semanticTags, intelligence_constants_1.RELATED_CANDIDATE_LIMIT),
        ]);
        return {
            semanticTags,
            relatedDiagrams: this.scoreDiagramRows(diagramRows, semanticTags),
            relatedDocuments: this.scoreDocumentRows(documentRows, semanticTags),
            relatedInterviewQuestions: this.scoreDocumentRows(interviewRows, semanticTags),
            similarTechnologies: this.scoreSimilarTechnologies(technologyRows, semanticTags),
        };
    }
    normalizeKeywords(labels) {
        const unique = new Set();
        for (const label of labels) {
            const normalized = label.trim().toLowerCase();
            if (normalized.length === 0) {
                continue;
            }
            unique.add(normalized);
            if (unique.size >= intelligence_constants_1.DIAGRAM_KEYWORDS_LIMIT) {
                break;
            }
        }
        return [...unique];
    }
    scoreDiagramRows(rows, semanticTags) {
        const scored = rows
            .map((row) => {
            const nodeLabels = row.nodes.map((node) => node.label);
            const matchingKeywords = this.findMatchingKeywords(semanticTags, nodeLabels.join(' '));
            return {
                id: row.id,
                title: row.title,
                ownerId: row.ownerId,
                visibility: row.visibility,
                accessRole: 'viewer',
                nodeCount: row._count.nodes,
                favoriteCount: row.favoriteCount,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                score: matchingKeywords.length * intelligence_constants_1.MATCHING_KEYWORD_SCORE,
                matchingKeywords,
            };
        })
            .filter((item) => item.matchingKeywords.length > 0);
        return this.takeTopByScore(scored);
    }
    scoreDocumentRows(rows, semanticTags) {
        const scored = rows
            .map((row) => {
            const searchText = [
                row.title,
                row.content,
                row.category?.name ?? '',
                ...row.documentTags.map((item) => item.tag.name),
            ].join(' ');
            const matchingKeywords = this.findMatchingKeywords(semanticTags, searchText);
            return {
                id: row.id,
                title: row.title,
                content: row.content,
                ownerId: row.ownerId,
                visibility: row.visibility,
                category: row.category,
                viewCount: row.viewCount,
                favoriteCount: row.favoriteCount,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                score: matchingKeywords.length * intelligence_constants_1.MATCHING_KEYWORD_SCORE +
                    row.favoriteCount * intelligence_constants_1.FAVORITE_SCORE +
                    row.viewCount,
                matchingKeywords,
            };
        })
            .filter((item) => item.matchingKeywords.length > 0);
        return this.takeTopByScore(scored);
    }
    scoreSimilarTechnologies(rows, semanticTags) {
        const sourceTagSet = new Set(semanticTags);
        const aggregates = new Map();
        for (const row of rows) {
            const seenInDiagram = new Set();
            for (const node of row.nodes) {
                const normalized = node.label.trim().toLowerCase();
                if (normalized.length === 0 || sourceTagSet.has(normalized)) {
                    continue;
                }
                seenInDiagram.add(normalized);
                if (!aggregates.has(normalized)) {
                    aggregates.set(normalized, {
                        label: node.label.trim(),
                        relatedDiagramCount: 0,
                    });
                }
            }
            for (const normalized of seenInDiagram) {
                const aggregate = aggregates.get(normalized);
                if (aggregate !== undefined) {
                    aggregate.relatedDiagramCount += 1;
                }
            }
        }
        const scored = [...aggregates.values()]
            .map((aggregate) => ({
            label: aggregate.label,
            relatedDiagramCount: aggregate.relatedDiagramCount,
            score: aggregate.relatedDiagramCount * intelligence_constants_1.MATCHING_KEYWORD_SCORE,
        }))
            .sort((first, second) => {
            if (second.score !== first.score) {
                return second.score - first.score;
            }
            return first.label.localeCompare(second.label);
        });
        return scored.slice(0, intelligence_constants_1.RELATED_RESOURCE_LIMIT);
    }
    findMatchingKeywords(semanticTags, rawText) {
        const lowerText = rawText.toLowerCase();
        return semanticTags.filter((keyword) => lowerText.includes(keyword));
    }
    takeTopByScore(items) {
        return [...items]
            .sort((first, second) => {
            if (second.score !== first.score) {
                return second.score - first.score;
            }
            return second.updatedAt.getTime() - first.updatedAt.getTime();
        })
            .slice(0, intelligence_constants_1.RELATED_RESOURCE_LIMIT);
    }
};
exports.IntelligenceService = IntelligenceService;
exports.IntelligenceService = IntelligenceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(intelligence_repository_interface_1.INTELLIGENCE_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tech_keyword_extractor_interface_1.TECH_KEYWORD_EXTRACTOR)),
    __param(2, (0, common_1.Inject)(architecture_template_matcher_interface_1.ARCHITECTURE_TEMPLATE_MATCHER)),
    __param(3, (0, common_1.Inject)(interview_question_repository_interface_1.INTERVIEW_QUESTION_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], IntelligenceService);
//# sourceMappingURL=intelligence.service.js.map