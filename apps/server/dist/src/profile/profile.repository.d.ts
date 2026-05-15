import { type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import type { FavoriteDiagramEntry } from './interfaces/favorite-diagram-entry.interface';
import type { FavoriteDocumentEntry } from './interfaces/favorite-document-entry.interface';
import type { IProfileRepository } from './interfaces/profile-repository.interface';
export declare class ProfileRepository implements IProfileRepository {
    private readonly prisma;
    constructor(prisma: IPrismaService);
    selectFavoriteDocumentsByUserId(userId: string): Promise<FavoriteDocumentEntry[]>;
    selectFavoriteDiagramsByUserId(userId: string): Promise<FavoriteDiagramEntry[]>;
}
