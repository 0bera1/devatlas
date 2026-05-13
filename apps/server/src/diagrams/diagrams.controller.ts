import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../auth/interfaces/auth-service.interface';
import type { PublicUser } from '../users/interfaces/public-user.interface';
import { AddDiagramCollaboratorDto } from './dto/add-diagram-collaborator.dto';
import { CreateDiagramDto } from './dto/create-diagram.dto';
import { PatchDiagramDto } from './dto/patch-diagram.dto';
import { SaveDiagramBodyDto } from './dto/save-diagram.dto';
import type { DiagramCollaboratorEntry } from './interfaces/diagram-collaborator-entry.interface';
import type { DiagramRecord } from './interfaces/diagram-record.interface';
import type { DiagramSummary } from './interfaces/diagram-summary.interface';
import {
  DIAGRAMS_SERVICE,
  type IDiagramsService,
} from './interfaces/diagrams-service.interface';

@Controller('diagrams')
@UseGuards(JwtAuthGuard)
export class DiagramsController {
  public constructor(
    @Inject(DIAGRAMS_SERVICE)
    private readonly diagramsService: IDiagramsService,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Req() req: Request,
    @Body() dto: CreateDiagramDto,
  ): Promise<DiagramRecord> {
    const owner: PublicUser = DiagramsController.requireUser(req);

    return this.diagramsService.createDiagram(owner.id, {
      title: dto.title,
      visibility: dto.visibility,
    });
  }

  @Post(':id/favorite')
  @HttpCode(HttpStatus.CREATED)
  public async favoriteDiagram(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<void> {
    const user: PublicUser = DiagramsController.requireUser(req);
    await this.diagramsService.addFavorite(user.id, id);
  }

  @Get()
  public async list(@Req() req: Request): Promise<DiagramSummary[]> {
    const owner: PublicUser = DiagramsController.requireUser(req);

    return this.diagramsService.listDiagramsForUser(owner.id);
  }

  @Get(':id/collaborators')
  public async listCollaborators(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<readonly DiagramCollaboratorEntry[]> {
    const owner: PublicUser = DiagramsController.requireUser(req);

    return this.diagramsService.listDiagramCollaborators(owner.id, id);
  }

  @Post(':id/collaborators')
  @HttpCode(HttpStatus.OK)
  public async addCollaborator(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: AddDiagramCollaboratorDto,
  ): Promise<DiagramCollaboratorEntry[]> {
    const owner: PublicUser = DiagramsController.requireUser(req);

    return this.diagramsService.addDiagramCollaboratorByEmail(
      owner.id,
      id,
      dto.email,
    );
  }

  @Delete(':id/collaborators/:userId')
  @HttpCode(HttpStatus.OK)
  public async removeCollaborator(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<DiagramCollaboratorEntry[]> {
    const owner: PublicUser = DiagramsController.requireUser(req);

    return this.diagramsService.removeDiagramCollaborator(owner.id, id, userId);
  }

  @Get(':id/related')
  @Public()
  public async getRelatedDiagrams(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
  ): Promise<DiagramSummary[]> {
    const bearer: string | undefined =
      DiagramsController.extractBearerToken(authorization);
    const subject: string | null =
      await this.authService.tryGetSubjectFromAccessToken(bearer);

    return this.diagramsService.getRelatedDiagrams(id, subject);
  }

  @Get(':id')
  public async getOne(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<DiagramRecord> {
    const user: PublicUser = DiagramsController.requireUser(req);

    return this.diagramsService.getDiagram(user.id, id);
  }

  @Put(':id')
  public async saveGraph(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: SaveDiagramBodyDto,
  ): Promise<DiagramRecord> {
    const actor: PublicUser = DiagramsController.requireUser(req);

    return this.diagramsService.saveDiagramGraph(actor.id, id, {
      nodes: dto.nodes,
      edges: dto.edges,
    });
  }

  @Patch(':id')
  public async patchDiagram(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: PatchDiagramDto,
  ): Promise<DiagramRecord> {
    const owner: PublicUser = DiagramsController.requireUser(req);

    return this.diagramsService.patchDiagram(owner.id, id, {
      title: dto.title,
      visibility: dto.visibility,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async remove(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<void> {
    const owner: PublicUser = DiagramsController.requireUser(req);

    await this.diagramsService.removeDiagram(owner.id, id);
  }

  private static requireUser(req: Request): PublicUser {
    if (req.user === undefined) {
      throw new UnauthorizedException();
    }

    return req.user;
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
