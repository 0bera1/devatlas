"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const user_activity_module_1 = require("../user-activity/user-activity.module");
const users_module_1 = require("../users/users.module");
const profile_repository_interface_1 = require("./interfaces/profile-repository.interface");
const profile_service_interface_1 = require("./interfaces/profile-service.interface");
const profile_controller_1 = require("./profile.controller");
const profile_repository_1 = require("./profile.repository");
const profile_service_1 = require("./profile.service");
const profileRepositoryProvider = {
    provide: profile_repository_interface_1.PROFILE_REPOSITORY,
    useClass: profile_repository_1.ProfileRepository,
};
const profileServiceProvider = {
    provide: profile_service_interface_1.PROFILE_SERVICE,
    useClass: profile_service_1.ProfileService,
};
let ProfileModule = class ProfileModule {
};
exports.ProfileModule = ProfileModule;
exports.ProfileModule = ProfileModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => auth_module_1.AuthModule), users_module_1.UsersModule, user_activity_module_1.UserActivityModule],
        controllers: [profile_controller_1.ProfileController],
        providers: [profileRepositoryProvider, profileServiceProvider],
    })
], ProfileModule);
//# sourceMappingURL=profile.module.js.map