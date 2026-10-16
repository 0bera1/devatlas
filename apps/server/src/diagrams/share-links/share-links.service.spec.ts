import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ShareLinksService } from './share-links.service';

const DIAGRAM = {
  id: 'd1',
  title: 'Ödeme',
  ownerId: 'owner-1',
  visibility: 'PRIVATE',
  viewerAccess: 'viewer',
  nodes: [],
  edges: [],
  favoriteCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createService(link: unknown) {
  const prisma = {
    diagramShareLink: {
      findUnique: jest.fn().mockResolvedValue(link),
    },
    diagram: {
      findUnique: jest.fn().mockResolvedValue({ ownerId: 'owner-1' }),
    },
  };
  const repo = {
    selectDiagramByIdForUser: jest.fn().mockResolvedValue(DIAGRAM),
    selectDiagramByIdAndOwnerId: jest.fn().mockResolvedValue(DIAGRAM),
  };
  const config = { get: jest.fn() } as unknown as ConfigService;
  return {
    repo,
    service: new ShareLinksService(prisma as never, repo as never, config),
  };
}

const FUTURE = new Date(Date.now() + 86_400_000);

describe('ShareLinksService.open', () => {
  it('süresi dolmuş bağlantı 404 döner', async () => {
    const { service } = createService({
      diagramId: 'd1',
      passwordHash: null,
      expiresAt: new Date(Date.now() - 1000),
      revokedAt: null,
    });
    await expect(service.open('tok', undefined)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('iptal edilmiş bağlantı 404 döner', async () => {
    const { service } = createService({
      diagramId: 'd1',
      passwordHash: null,
      expiresAt: FUTURE,
      revokedAt: new Date(),
    });
    await expect(service.open('tok', undefined)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('şifreli bağlantıda şifre yoksa 401 döner', async () => {
    const passwordHash = await bcrypt.hash('gizli1234', 4);
    const { service } = createService({
      diagramId: 'd1',
      passwordHash,
      expiresAt: FUTURE,
      revokedAt: null,
    });
    await expect(service.open('tok', undefined)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('şifreli bağlantıda yanlış şifre 401 döner', async () => {
    const passwordHash = await bcrypt.hash('gizli1234', 4);
    const { service } = createService({
      diagramId: 'd1',
      passwordHash,
      expiresAt: FUTURE,
      revokedAt: null,
    });
    await expect(service.open('tok', 'yanlis')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('doğru şifre ile diyagram salt okunur döner', async () => {
    const passwordHash = await bcrypt.hash('gizli1234', 4);
    const { service, repo } = createService({
      diagramId: 'd1',
      passwordHash,
      expiresAt: FUTURE,
      revokedAt: null,
    });

    const result = await service.open('tok', 'gizli1234');

    expect(result.id).toBe('d1');
    expect(repo.selectDiagramByIdForUser).toHaveBeenCalledWith('d1', 'owner-1');
  });

  it('şifresiz ve geçerli bağlantı diyagramı döner', async () => {
    const { service } = createService({
      diagramId: 'd1',
      passwordHash: null,
      expiresAt: FUTURE,
      revokedAt: null,
    });
    await expect(service.open('tok', undefined)).resolves.toMatchObject({ id: 'd1' });
  });
});
