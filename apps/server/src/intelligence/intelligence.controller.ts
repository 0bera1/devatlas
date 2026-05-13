import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../auth/interfaces/auth-service.interface';
import { AutoTagRequestDto } from './dto/auto-tag-request.dto';
import type { AutoTagResponseDto } from './dto/auto-tag-response.dto';
import { GenerateDiagramRequestDto } from './dto/generate-diagram-request.dto';
import type { DiagramIntelligenceResource } from './interfaces/diagram-intelligence-resource.interface';
import type { GeneratedDiagramTemplate } from './interfaces/generated-diagram-template.interface';
import type { RelatedInterviewQuestionsResource } from './interfaces/related-interview-question.interface';
import {
  INTELLIGENCE_SERVICE,
  type IIntelligenceService,
} from './interfaces/intelligence-service.interface';

@Controller('intelligence')
@UseGuards(JwtAuthGuard)
export class IntelligenceController {
  public constructor(
    @Inject(INTELLIGENCE_SERVICE)
    private readonly intelligenceService: IIntelligenceService,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  @Get('diagrams/:id/resources')
  @Public()
  public async getDiagramResources(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
  ): Promise<DiagramIntelligenceResource> {
    const bearer: string | undefined =
      IntelligenceController.extractBearerToken(authorization);
    const subject: string | null =
      await this.authService.tryGetSubjectFromAccessToken(bearer);

    return this.intelligenceService.getDiagramResources(id, subject);
  }

  @Post('auto-tags')
  @HttpCode(HttpStatus.OK)
  public extractAutoTags(@Body() body: AutoTagRequestDto): AutoTagResponseDto {
    const tags: string[] = this.intelligenceService.extractAutoTagsFromSource({
      title: body.title,
      content: body.content,
      extraKeywords: body.extraKeywords,
    });
    return { tags };
  }

  @Post('diagrams/generate')
  @HttpCode(HttpStatus.OK)
  public generateDiagram(
    @Body() body: GenerateDiagramRequestDto,
  ): GeneratedDiagramTemplate {
    return this.intelligenceService.generateDiagramFromPrompt(body.prompt);
  }

  @Get('documents/:id/interview-questions')
  @Public()
  public async getRelatedInterviewQuestionsForDocument(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
  ): Promise<RelatedInterviewQuestionsResource> {
    const bearer: string | undefined =
      IntelligenceController.extractBearerToken(authorization);
    const subject: string | null =
      await this.authService.tryGetSubjectFromAccessToken(bearer);

    return this.intelligenceService.getRelatedInterviewQuestionsForDocument(
      id,
      subject,
    );
  }

  private static extractBearerToken(
    authorization: string | undefined,
  ): string | undefined {
    if (authorization === undefined) {
      return undefined;
    }

    const trimmed: string = authorization.trim();
    if (!trimmed.startsWith('Bearer ')) {
      return undefined;
    }

    const token: string = trimmed.slice(7).trim();
    return token.length > 0 ? token : undefined;
  }
}
