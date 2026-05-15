import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { type IUserRepository } from '../../users/interfaces/user-repository.interface';
import type { PublicUser } from '../../users/interfaces/public-user.interface';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userRepository;
    private readonly configService;
    constructor(userRepository: IUserRepository, configService: ConfigService);
    validate(payload: JwtPayload): Promise<PublicUser>;
}
export {};
