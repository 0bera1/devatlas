"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
class SocketIoAdapter extends platform_socket_io_1.IoAdapter {
    constructor(app) {
        super(app);
    }
    createIOServer(port, options) {
        const corsOrigins = process.env.CORS_ORIGIN?.split(',')
            .map((origin) => origin.trim())
            .filter((origin) => origin.length > 0);
        const merged = {
            ...(options ?? {}),
            path: options?.path ?? '/socket.io',
            cors: {
                origin: corsOrigins !== undefined && corsOrigins.length > 0
                    ? corsOrigins
                    : true,
                credentials: true,
            },
        };
        return super.createIOServer(port, merged);
    }
}
exports.SocketIoAdapter = SocketIoAdapter;
//# sourceMappingURL=socket-io.adapter.js.map