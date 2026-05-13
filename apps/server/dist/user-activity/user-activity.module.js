"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserActivityModule = void 0;
const common_1 = require("@nestjs/common");
const user_activity_repository_interface_1 = require("./interfaces/user-activity-repository.interface");
const user_activity_service_interface_1 = require("./interfaces/user-activity-service.interface");
const user_activity_repository_1 = require("./user-activity.repository");
const user_activity_service_1 = require("./user-activity.service");
const userActivityRepositoryProvider = {
    provide: user_activity_repository_interface_1.USER_ACTIVITY_REPOSITORY,
    useClass: user_activity_repository_1.UserActivityRepository,
};
const userActivityServiceProvider = {
    provide: user_activity_service_interface_1.USER_ACTIVITY_SERVICE,
    useClass: user_activity_service_1.UserActivityService,
};
let UserActivityModule = class UserActivityModule {
};
exports.UserActivityModule = UserActivityModule;
exports.UserActivityModule = UserActivityModule = __decorate([
    (0, common_1.Module)({
        providers: [userActivityRepositoryProvider, userActivityServiceProvider],
        exports: [user_activity_service_interface_1.USER_ACTIVITY_SERVICE, user_activity_repository_interface_1.USER_ACTIVITY_REPOSITORY],
    })
], UserActivityModule);
//# sourceMappingURL=user-activity.module.js.map