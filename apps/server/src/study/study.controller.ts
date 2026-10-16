import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddStudyItemDto, CreateStudyListDto, DueQueryDto, ReviewDto } from './dto/study.dto';
import { StudyService, type ProgressSummary } from './study.service';

const DEFAULT_DUE_LIMIT = 20;

@Controller('study')
@UseGuards(JwtAuthGuard)
export class StudyController {
  public constructor(private readonly studyService: StudyService) {}

  @Get('due')
  public async getDue(@Req() req: Request, @Query() query: DueQueryDto) {
    const rows = await this.studyService.getDueReviews(
      req.user!.id,
      query.limit ?? DEFAULT_DUE_LIMIT,
    );
    return rows.map((row) => ({
      questionId: row.questionId,
      dueAt: row.dueAt,
      repetitions: row.repetitions,
      question: row.question,
    }));
  }

  @Post('reviews')
  @HttpCode(HttpStatus.OK)
  public async review(@Req() req: Request, @Body() dto: ReviewDto) {
    return this.studyService.review(req.user!.id, dto.questionId, dto.rating);
  }

  @Get('progress')
  public async getProgress(@Req() req: Request): Promise<ProgressSummary> {
    return this.studyService.getProgress(req.user!.id);
  }

  @Get('lists')
  public async getLists(@Req() req: Request) {
    return this.studyService.getLists(req.user!.id);
  }

  @Post('lists')
  public async createList(@Req() req: Request, @Body() dto: CreateStudyListDto) {
    return this.studyService.createList(req.user!.id, dto.name);
  }

  @Delete('lists/:listId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteList(@Req() req: Request, @Param('listId') listId: string): Promise<void> {
    await this.studyService.deleteList(req.user!.id, listId);
  }

  @Get('lists/:listId/items')
  public async getListItems(@Req() req: Request, @Param('listId') listId: string) {
    return this.studyService.getListItems(req.user!.id, listId);
  }

  @Post('lists/:listId/items')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async addItem(
    @Req() req: Request,
    @Param('listId') listId: string,
    @Body() dto: AddStudyItemDto,
  ): Promise<void> {
    await this.studyService.addToList(req.user!.id, listId, dto.questionId);
  }

  @Delete('lists/:listId/items/:questionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async removeItem(
    @Req() req: Request,
    @Param('listId') listId: string,
    @Param('questionId') questionId: string,
  ): Promise<void> {
    await this.studyService.removeFromList(req.user!.id, listId, questionId);
  }
}
