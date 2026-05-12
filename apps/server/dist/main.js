"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const DEFAULT_PORT = 3500;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableShutdownHooks();
    await app.listen(process.env.PORT ?? DEFAULT_PORT);
}
void bootstrap();
//# sourceMappingURL=main.js.map