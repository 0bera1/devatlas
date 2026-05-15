"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ARCHITECTURE_TEMPLATE_MAX_PROMPT_LENGTH = exports.ARCHITECTURE_TEMPLATE_MIN_PROMPT_LENGTH = exports.ARCHITECTURE_TEMPLATE_FALLBACK_ID = exports.ARCHITECTURE_TEMPLATES = void 0;
exports.ARCHITECTURE_TEMPLATES = [
    {
        id: 'websocket',
        name: 'Realtime WebSocket Architecture',
        keywords: ['websocket', 'realtime', 'chat', 'pubsub', 'socket.io'],
        description: 'Client → WebSocket Gateway → Redis Pub/Sub → PostgreSQL',
        nodes: [
            { localId: 'client', label: 'Client', type: 'text', x: 0, y: 0 },
            {
                localId: 'gateway',
                label: 'WebSocket Gateway',
                type: 'api',
                x: 260,
                y: 0,
            },
            {
                localId: 'pubsub',
                label: 'Redis Pub/Sub',
                type: 'cache',
                x: 520,
                y: 0,
            },
            { localId: 'db', label: 'PostgreSQL', type: 'db', x: 520, y: 160 },
        ],
        edges: [
            { fromLocalId: 'client', toLocalId: 'gateway', label: 'ws' },
            {
                fromLocalId: 'gateway',
                toLocalId: 'pubsub',
                label: 'publish',
                animated: true,
            },
            { fromLocalId: 'gateway', toLocalId: 'db', label: 'persist' },
        ],
    },
    {
        id: 'microservice',
        name: 'Microservice Mesh',
        keywords: [
            'microservice',
            'microservices',
            'mesh',
            'service-mesh',
            'kafka',
            'event-driven',
        ],
        description: 'API Gateway + iki servis + Kafka mesajlaşma',
        nodes: [
            {
                localId: 'gateway',
                label: 'API Gateway',
                type: 'api',
                x: 0,
                y: 0,
            },
            {
                localId: 'svc-a',
                label: 'Service A',
                type: 'service',
                x: 260,
                y: -80,
            },
            {
                localId: 'svc-b',
                label: 'Service B',
                type: 'service',
                x: 260,
                y: 80,
            },
            { localId: 'kafka', label: 'Kafka', type: 'queue', x: 520, y: 0 },
            { localId: 'db-a', label: 'PostgreSQL A', type: 'db', x: 520, y: -160 },
            { localId: 'db-b', label: 'PostgreSQL B', type: 'db', x: 520, y: 160 },
        ],
        edges: [
            { fromLocalId: 'gateway', toLocalId: 'svc-a', label: 'http' },
            { fromLocalId: 'gateway', toLocalId: 'svc-b', label: 'http' },
            { fromLocalId: 'svc-a', toLocalId: 'kafka', label: 'produce' },
            { fromLocalId: 'svc-b', toLocalId: 'kafka', label: 'consume' },
            { fromLocalId: 'svc-a', toLocalId: 'db-a' },
            { fromLocalId: 'svc-b', toLocalId: 'db-b' },
        ],
    },
    {
        id: 'redis-cache',
        name: 'Redis Cache Layer',
        keywords: ['redis', 'cache', 'caching'],
        description: 'Client → API → Redis → PostgreSQL',
        nodes: [
            { localId: 'client', label: 'Client', type: 'text', x: 0, y: 0 },
            { localId: 'api', label: 'API', type: 'api', x: 260, y: 0 },
            { localId: 'cache', label: 'Redis', type: 'cache', x: 520, y: -80 },
            { localId: 'db', label: 'PostgreSQL', type: 'db', x: 520, y: 80 },
        ],
        edges: [
            { fromLocalId: 'client', toLocalId: 'api' },
            {
                fromLocalId: 'api',
                toLocalId: 'cache',
                label: 'read/write',
                animated: true,
            },
            { fromLocalId: 'api', toLocalId: 'db', label: 'fallback' },
        ],
    },
    {
        id: 'rest-api',
        name: 'Classic REST API',
        keywords: ['rest', 'api', 'crud', 'backend'],
        description: 'Client → REST API → PostgreSQL',
        nodes: [
            { localId: 'client', label: 'Client', type: 'text', x: 0, y: 0 },
            { localId: 'api', label: 'REST API', type: 'api', x: 260, y: 0 },
            { localId: 'db', label: 'PostgreSQL', type: 'db', x: 520, y: 0 },
        ],
        edges: [
            { fromLocalId: 'client', toLocalId: 'api', label: 'http' },
            { fromLocalId: 'api', toLocalId: 'db', label: 'sql' },
        ],
    },
    {
        id: 'auth',
        name: 'OAuth / JWT Authentication',
        keywords: ['oauth', 'jwt', 'auth', 'authentication', 'login'],
        description: 'Client → Auth API → Identity DB + Token Store',
        nodes: [
            { localId: 'client', label: 'Client', type: 'text', x: 0, y: 0 },
            { localId: 'auth', label: 'Auth API', type: 'api', x: 260, y: 0 },
            { localId: 'idp', label: 'Identity DB', type: 'db', x: 520, y: -80 },
            {
                localId: 'tokens',
                label: 'Refresh Tokens',
                type: 'service',
                x: 520,
                y: 80,
            },
        ],
        edges: [
            { fromLocalId: 'client', toLocalId: 'auth', label: 'login' },
            { fromLocalId: 'auth', toLocalId: 'idp' },
            { fromLocalId: 'auth', toLocalId: 'tokens', label: 'rotate' },
        ],
    },
    {
        id: 'graphql',
        name: 'GraphQL Gateway',
        keywords: ['graphql', 'apollo', 'federation'],
        description: 'Client → GraphQL Gateway → Service A + Service B',
        nodes: [
            { localId: 'client', label: 'Client', type: 'text', x: 0, y: 0 },
            {
                localId: 'gateway',
                label: 'GraphQL Gateway',
                type: 'api',
                x: 260,
                y: 0,
            },
            {
                localId: 'svc-a',
                label: 'Service A',
                type: 'service',
                x: 520,
                y: -80,
            },
            {
                localId: 'svc-b',
                label: 'Service B',
                type: 'service',
                x: 520,
                y: 80,
            },
        ],
        edges: [
            { fromLocalId: 'client', toLocalId: 'gateway', label: 'query' },
            { fromLocalId: 'gateway', toLocalId: 'svc-a' },
            { fromLocalId: 'gateway', toLocalId: 'svc-b' },
        ],
    },
];
exports.ARCHITECTURE_TEMPLATE_FALLBACK_ID = 'rest-api';
exports.ARCHITECTURE_TEMPLATE_MIN_PROMPT_LENGTH = 1;
exports.ARCHITECTURE_TEMPLATE_MAX_PROMPT_LENGTH = 500;
//# sourceMappingURL=architecture-templates.constant.js.map