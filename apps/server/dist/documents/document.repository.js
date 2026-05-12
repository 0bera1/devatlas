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
exports.DocumentRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_interface_1 = require("../prisma/interfaces/prisma-service.interface");
const documentRecordSelect = {
    id: true,
    title: true,
    content: true,
    ownerId: true,
    createdAt: true,
    updatedAt: true,
};
let DocumentRepository = class DocumentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async insertDocument(input) {
        return this.prisma.document.create({
            data: {
                title: input.title,
                ownerId: input.ownerId,
            },
            select: documentRecordSelect,
        });
    }
    async countAllDocumentsByOwnerId(ownerId) {
        return this.prisma.document.count({
            where: { ownerId },
        });
    }
    async countDocumentsByOwnerIdAndTitleContains(ownerId, titleSearch) {
        return this.prisma.document.count({
            where: {
                ownerId,
                title: {
                    contains: titleSearch,
                    mode: 'insensitive',
                },
            },
        });
    }
    async selectDocumentsByOwnerIdPage(ownerId, skip, take) {
        return this.prisma.document.findMany({
            where: { ownerId },
            select: documentRecordSelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        });
    }
    async selectDocumentsByOwnerIdAndTitleContainsPage(ownerId, titleSearch, skip, take) {
        return this.prisma.document.findMany({
            where: {
                ownerId,
                title: {
                    contains: titleSearch,
                    mode: 'insensitive',
                },
            },
            select: documentRecordSelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        });
    }
    async selectDocumentByIdAndOwnerId(id, ownerId) {
        return this.prisma.document.findFirst({
            where: { id, ownerId },
            select: documentRecordSelect,
        });
    }
    async updateDocumentContentByIdAndOwnerId(id, ownerId, content) {
        const existing = await this.selectDocumentByIdAndOwnerId(id, ownerId);
        if (existing === null) {
            return null;
        }
        return this.prisma.document.update({
            where: { id },
            data: { content },
            select: documentRecordSelect,
        });
    }
    async updateDocumentTitleByIdAndOwnerId(id, ownerId, title) {
        const existing = await this.selectDocumentByIdAndOwnerId(id, ownerId);
        if (existing === null) {
            return null;
        }
        return this.prisma.document.update({
            where: { id },
            data: { title },
            select: documentRecordSelect,
        });
    }
    async deleteDocumentsByIdAndOwnerId(id, ownerId) {
        const result = await this.prisma.document.deleteMany({
            where: { id, ownerId },
        });
        return result.count;
    }
};
exports.DocumentRepository = DocumentRepository;
exports.DocumentRepository = DocumentRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_interface_1.PRISMA_SERVICE)),
    __metadata("design:paramtypes", [Object])
], DocumentRepository);
//# sourceMappingURL=document.repository.js.map