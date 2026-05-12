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
exports.EngagementRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_interface_1 = require("../prisma/interfaces/prisma-service.interface");
let EngagementRepository = class EngagementRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async tryCountPublicDocumentView(documentId, viewerKey, bucketDate) {
        const publicDoc = await this.prisma.document.findFirst({
            where: {
                id: documentId,
                visibility: client_1.Visibility.PUBLIC,
            },
            select: { id: true },
        });
        if (publicDoc === null) {
            return false;
        }
        try {
            await this.prisma.documentViewBucket.create({
                data: {
                    documentId,
                    viewerKey,
                    bucketDate,
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                return false;
            }
            throw error;
        }
        await this.prisma.document.update({
            where: { id: documentId },
            data: {
                viewCount: {
                    increment: 1,
                },
            },
        });
        return true;
    }
    async insertFavorite(userId, documentId) {
        await this.prisma.$transaction(async (tx) => {
            await tx.favorite.create({
                data: {
                    userId,
                    documentId,
                },
            });
            await tx.document.update({
                where: { id: documentId },
                data: {
                    favoriteCount: {
                        increment: 1,
                    },
                },
            });
        });
    }
};
exports.EngagementRepository = EngagementRepository;
exports.EngagementRepository = EngagementRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_interface_1.PRISMA_SERVICE)),
    __metadata("design:paramtypes", [Object])
], EngagementRepository);
//# sourceMappingURL=engagement.repository.js.map