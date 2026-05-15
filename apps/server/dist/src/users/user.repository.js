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
var UserRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_interface_1 = require("../prisma/interfaces/prisma-service.interface");
const publicUserSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    createdAt: true,
    birthDate: true,
};
let UserRepository = UserRepository_1 = class UserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.user.findMany({
            select: publicUserSelect,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: publicUserSelect,
        });
    }
    async findPublicByEmailNormalized(email) {
        const trimmed = email.trim();
        if (trimmed.length === 0) {
            return null;
        }
        return this.prisma.user.findFirst({
            where: { email: { equals: trimmed, mode: 'insensitive' } },
            select: publicUserSelect,
        });
    }
    async findByEmailWithPassword(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async create(data) {
        const created = await this.prisma.user.create({
            data: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                password: data.password,
                birthDate: data.birthDate,
            },
        });
        return UserRepository_1.mapToPublicUser(created);
    }
    async deleteById(id) {
        const removed = await this.prisma.user.delete({
            where: { id },
        });
        return UserRepository_1.mapToPublicUser(removed);
    }
    async updateProfileById(id, patch) {
        const data = {};
        if (patch.firstName !== undefined) {
            data.firstName = patch.firstName;
        }
        if (patch.lastName !== undefined) {
            data.lastName = patch.lastName;
        }
        if (patch.birthDate !== undefined) {
            data.birthDate = patch.birthDate;
        }
        if (Object.keys(data).length === 0) {
            return this.findById(id);
        }
        const existing = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true },
        });
        if (existing === null) {
            return null;
        }
        return this.prisma.user.update({
            where: { id },
            data,
            select: publicUserSelect,
        });
    }
    async updatePasswordHashById(id, newPasswordHash) {
        const result = await this.prisma.user.updateMany({
            where: { id },
            data: { password: newPasswordHash },
        });
        return result.count > 0;
    }
    async selectPasswordHashById(id) {
        const row = await this.prisma.user.findUnique({
            where: { id },
            select: { password: true },
        });
        return row === null ? null : row.password;
    }
    static mapToPublicUser(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            createdAt: user.createdAt,
            birthDate: user.birthDate,
        };
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = UserRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_interface_1.PRISMA_SERVICE)),
    __metadata("design:paramtypes", [Object])
], UserRepository);
//# sourceMappingURL=user.repository.js.map