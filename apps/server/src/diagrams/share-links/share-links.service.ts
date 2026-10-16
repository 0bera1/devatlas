import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PRISMA_SERVICE, type IPrismaService } from '../../prisma/interfaces/prisma-service.interface';
import {
  DIAGRAM_REPOSITORY,
  type IDiagramRepository,
} from '../interfaces/diagram-repository.interface';
import type { DiagramRecord } from '../interfaces/diagram-record.interface';

const BCRYPT_SALT_ROUNDS = 10;
const DEFAULT_APP_URL = 'http://localhost:3000';
const MS_PER_DAY = 86_400_000;

export interface ShareLinkView {
  id: string;
  expiresAt: Date;
  hasPassword: boolean;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface CreatedShareLink extends ShareLinkView {
  url: string;
}

@Injectable()
export class ShareLinksService {
  public constructor(
    @Inject(PRISMA_SERVICE)
    private readonly prisma: IPrismaService,
    @Inject(DIAGRAM_REPOSITORY)
    private readonly diagramRepository: IDiagramRepository,
    private readonly configService: ConfigService,
  ) {}

  public async create(
    ownerId: string,
    diagramId: string,
    expiresInDays: number,
    password: string | undefined,
  ): Promise<CreatedShareLink> {
    await this.requireOwnedDiagram(ownerId, diagramId);

    const plain: string = randomBytes(32).toString('base64url');
    const expiresAt: Date = new Date(Date.now() + expiresInDays * MS_PER_DAY);
    const passwordHash: string | null =
      password !== undefined && password.length > 0
        ? await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
        : null;

    const row = await this.prisma.diagramShareLink.create({
      data: {
        tokenHash: this.hashToken(plain),
        diagramId,
        createdById: ownerId,
        passwordHash,
        expiresAt,
      },
      select: { id: true, expiresAt: true, passwordHash: true, revokedAt: true, createdAt: true },
    });

    return {
      id: row.id,
      expiresAt: row.expiresAt,
      hasPassword: row.passwordHash !== null,
      revokedAt: row.revokedAt,
      createdAt: row.createdAt,
      url: `${this.appBaseUrl()}/s/${plain}`,
    };
  }

  public async list(ownerId: string, diagramId: string): Promise<ShareLinkView[]> {
    await this.requireOwnedDiagram(ownerId, diagramId);

    const rows = await this.prisma.diagramShareLink.findMany({
      where: { diagramId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, expiresAt: true, passwordHash: true, revokedAt: true, createdAt: true },
    });

    return rows.map((row) => ({
      id: row.id,
      expiresAt: row.expiresAt,
      hasPassword: row.passwordHash !== null,
      revokedAt: row.revokedAt,
      createdAt: row.createdAt,
    }));
  }

  public async revoke(ownerId: string, diagramId: string, linkId: string): Promise<void> {
    await this.requireOwnedDiagram(ownerId, diagramId);

    const result = await this.prisma.diagramShareLink.updateMany({
      where: { id: linkId, diagramId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (result.count === 0) {
      throw new NotFoundException('Paylaşım bağlantısı bulunamadı');
    }
  }

  /**
   * Halka açık paylaşım bağlantısından diyagramı salt okunur döndürür.
   * Bağlantı yoksa, süresi dolmuşsa veya iptal edilmişse aynı 404 döner.
   * Şifre gerekiyorsa ve yanlışsa 401 döner.
   */
  public async open(token: string, password: string | undefined): Promise<DiagramRecord> {
    const link = await this.prisma.diagramShareLink.findUnique({
      where: { tokenHash: this.hashToken(token) },
      select: { diagramId: true, passwordHash: true, expiresAt: true, revokedAt: true },
    });

    if (link === null || link.revokedAt !== null || link.expiresAt.getTime() <= Date.now()) {
      throw new NotFoundException('Bağlantı bulunamadı veya süresi dolmuş');
    }

    if (link.passwordHash !== null) {
      const matches: boolean =
        password !== undefined && (await bcrypt.compare(password, link.passwordHash));
      if (!matches) {
        throw new UnauthorizedException('Bu bağlantı için şifre gerekli');
      }
    }

    // Paylaşılan diyagramı sahibi adına okuruz; görünürlük bağlantı ile belirlenir.
    const owner = await this.prisma.diagram.findUnique({
      where: { id: link.diagramId },
      select: { ownerId: true },
    });
    const diagram: DiagramRecord | null =
      owner === null
        ? null
        : await this.diagramRepository.selectDiagramByIdForUser(link.diagramId, owner.ownerId);

    if (diagram === null) {
      throw new NotFoundException('Bağlantı bulunamadı veya süresi dolmuş');
    }

    return diagram;
  }

  private async requireOwnedDiagram(ownerId: string, diagramId: string): Promise<void> {
    const owned = await this.diagramRepository.selectDiagramByIdAndOwnerId(diagramId, ownerId);
    if (owned === null) {
      throw new NotFoundException(`Diagram with id "${diagramId}" not found`);
    }
  }

  private hashToken(plain: string): string {
    return createHash('sha256').update(plain, 'utf8').digest('hex');
  }

  private appBaseUrl(): string {
    const raw: string = this.configService.get<string>('APP_URL') ?? DEFAULT_APP_URL;
    return raw.trim().replace(/\/+$/, '');
  }
}
