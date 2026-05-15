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
exports.ProfileRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_interface_1 = require("../prisma/interfaces/prisma-service.interface");
let ProfileRepository = class ProfileRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async selectFavoriteDocumentsByUserId(userId) {
        const rows = await this.prisma.favorite.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                createdAt: true,
                document: {
                    select: {
                        id: true,
                        title: true,
                        ownerId: true,
                        visibility: true,
                        favoriteCount: true,
                        viewCount: true,
                        updatedAt: true,
                    },
                },
            },
        });
        return rows.map((r) => ({
            id: r.document.id,
            title: r.document.title,
            ownerId: r.document.ownerId,
            visibility: r.document.visibility,
            favoritedAt: r.createdAt,
            updatedAt: r.document.updatedAt,
            favoriteCount: r.document.favoriteCount,
            viewCount: r.document.viewCount,
        }));
    }
    async selectFavoriteDiagramsByUserId(userId) {
        const rows = await this.prisma.diagramFavorite.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                createdAt: true,
                diagram: {
                    select: {
                        id: true,
                        title: true,
                        ownerId: true,
                        visibility: true,
                        favoriteCount: true,
                        updatedAt: true,
                        _count: { select: { nodes: true } },
                    },
                },
            },
        });
        return rows.map((r) => ({
            id: r.diagram.id,
            title: r.diagram.title,
            ownerId: r.diagram.ownerId,
            visibility: r.diagram.visibility,
            favoritedAt: r.createdAt,
            updatedAt: r.diagram.updatedAt,
            favoriteCount: r.diagram.favoriteCount,
            nodeCount: r.diagram._count.nodes,
        }));
    }
};
exports.ProfileRepository = ProfileRepository;
exports.ProfileRepository = ProfileRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_interface_1.PRISMA_SERVICE)),
    __metadata("design:paramtypes", [Object])
], ProfileRepository);
//# sourceMappingURL=profile.repository.js.map