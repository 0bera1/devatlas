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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const user_repository_interface_1 = require("../users/interfaces/user-repository.interface");
const refresh_token_repository_interface_1 = require("./interfaces/refresh-token-repository.interface");
const BCRYPT_SALT_ROUNDS = 10;
let AuthService = class AuthService {
    userRepository;
    refreshTokenRepository;
    jwtService;
    configService;
    constructor(userRepository, refreshTokenRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(email, password, firstName, lastName, birthDate) {
        const existing = await this.userRepository.findByEmailWithPassword(email);
        if (existing !== null) {
            throw new common_1.ConflictException(`User with email "${email}" already exists`);
        }
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        const user = await this.userRepository.create({
            email,
            firstName,
            lastName,
            password: hashedPassword,
            birthDate,
        });
        return await this.issueSession(user);
    }
    async login(email, password) {
        const stored = await this.userRepository.findByEmailWithPassword(email);
        if (stored === null) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const match = await bcrypt.compare(password, stored.password);
        if (!match) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const user = {
            id: stored.id,
            email: stored.email,
            firstName: stored.firstName,
            lastName: stored.lastName,
            createdAt: stored.createdAt,
            birthDate: stored.birthDate,
        };
        return await this.issueSession(user);
    }
    async refresh(plainRefreshToken) {
        const tokenHash = this.hashRefreshToken(plainRefreshToken);
        const record = await this.refreshTokenRepository.findByTokenHash(tokenHash);
        if (record === null) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (record.expiresAt.getTime() <= Date.now()) {
            await this.refreshTokenRepository.deleteById(record.id);
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        const user = await this.userRepository.findById(record.userId);
        if (user === null) {
            await this.refreshTokenRepository.deleteById(record.id);
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const newPlain = this.generateOpaqueRefreshToken();
        const newHash = this.hashRefreshToken(newPlain);
        const newExpires = this.computeRefreshExpiry();
        await this.refreshTokenRepository.replaceToken(record.id, {
            userId: user.id,
            tokenHash: newHash,
            expiresAt: newExpires,
        });
        return {
            accessToken: this.signAccessToken(user),
            refreshToken: newPlain,
            user,
        };
    }
    async tryGetSubjectFromAccessToken(accessToken) {
        if (accessToken === undefined || accessToken.trim().length === 0) {
            return null;
        }
        try {
            const payload = await this.jwtService.verifyAsync(accessToken.trim());
            const user = await this.userRepository.findById(payload.sub);
            if (user === null || user.email !== payload.email) {
                return null;
            }
            return user.id;
        }
        catch {
            return null;
        }
    }
    async issueSession(user) {
        const plainRefresh = this.generateOpaqueRefreshToken();
        const tokenHash = this.hashRefreshToken(plainRefresh);
        const expiresAt = this.computeRefreshExpiry();
        await this.refreshTokenRepository.insertToken({
            userId: user.id,
            tokenHash,
            expiresAt,
        });
        return {
            accessToken: this.signAccessToken(user),
            refreshToken: plainRefresh,
            user,
        };
    }
    signAccessToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        };
        const expiresIn = (this.configService.get('JWT_ACCESS_EXPIRES_IN') ??
            '10m');
        return this.jwtService.sign(payload, { expiresIn });
    }
    generateOpaqueRefreshToken() {
        return (0, crypto_1.randomBytes)(48).toString('base64url');
    }
    hashRefreshToken(plain) {
        return (0, crypto_1.createHash)('sha256').update(plain, 'utf8').digest('hex');
    }
    computeRefreshExpiry() {
        const raw = this.configService.get('REFRESH_TOKEN_EXPIRES_DAYS') ?? '7';
        const parsed = Number.parseInt(raw, 10);
        const days = Number.isFinite(parsed) && parsed > 0 ? parsed : 7;
        const expiry = new Date();
        expiry.setUTCDate(expiry.getUTCDate() + days);
        return expiry;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_interface_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(refresh_token_repository_interface_1.REFRESH_TOKEN_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map