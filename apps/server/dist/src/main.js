"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const socket_io_adapter_1 = require("./collaboration/socket-io.adapter");
const DEFAULT_PORT = 3500;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useWebSocketAdapter(new socket_io_adapter_1.SocketIoAdapter(app));
    app.enableShutdownHooks();
    const corsOrigins = process.env.CORS_ORIGIN?.split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);
    app.enableCors({
        origin: corsOrigins !== undefined && corsOrigins.length > 0
            ? corsOrigins
            : true,
        credentials: true,
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Anonymous-Id',
        ],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(process.env.PORT ?? DEFAULT_PORT);
}
void bootstrap();
//# sourceMappingURL=main.js.map