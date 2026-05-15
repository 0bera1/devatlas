import { type IAuthService } from '../auth/interfaces/auth-service.interface';
import { AutoTagRequestDto } from './dto/auto-tag-request.dto';
import type { AutoTagResponseDto } from './dto/auto-tag-response.dto';
import { GenerateDiagramRequestDto } from './dto/generate-diagram-request.dto';
import type { DiagramIntelligenceResource } from './interfaces/diagram-intelligence-resource.interface';
import type { GeneratedDiagramTemplate } from './interfaces/generated-diagram-template.interface';
import type { RelatedInterviewQuestionsResource } from './interfaces/related-interview-question.interface';
import { type IIntelligenceService } from './interfaces/intelligence-service.interface';
export declare class IntelligenceController {
    private readonly intelligenceService;
    private readonly authService;
    constructor(intelligenceService: IIntelligenceService, authService: IAuthService);
    getDiagramResources(id: string, authorization: string | undefined): Promise<DiagramIntelligenceResource>;
    extractAutoTags(body: AutoTagRequestDto): AutoTagResponseDto;
    generateDiagram(body: GenerateDiagramRequestDto): GeneratedDiagramTemplate;
    getRelatedInterviewQuestionsForDocument(id: string, authorization: string | undefined): Promise<RelatedInterviewQuestionsResource>;
    private static extractBearerToken;
}
