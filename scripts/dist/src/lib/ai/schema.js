"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchitectureOutputSchema = exports.UnknownItemSchema = exports.DataFlowSchema = exports.DataFlowStepSchema = exports.ApiSchema = exports.DatabaseSchema = exports.ConnectionSchema = exports.ComponentSchema = void 0;
const zod_1 = require("zod");
exports.ComponentSchema = zod_1.z.object({
    id: zod_1.z.string().describe('Unique identifier in kebab-case, e.g. web-frontend, auth-service, orders-db'),
    name: zod_1.z.string().describe('Display name of component'),
    type: zod_1.z.enum([
        'frontend',
        'backend_service',
        'database',
        'cache',
        'message_broker',
        'api_gateway',
        'external_service',
        'auth_provider',
        'storage',
        'unknown',
    ]).describe('Type category of component'),
    description: zod_1.z.string().describe('Description of component purpose and role'),
    technology: zod_1.z.string().optional().describe('Underlying framework, runtime, or language, if mentioned'),
    confidence: zod_1.z.enum(['explicit', 'inferred']).describe('Whether explicitly documented or reasonably inferred'),
    source_reference: zod_1.z.string().describe('Source page or section citation (e.g. "Page 3 - Microservices Architecture" or "Not specified")'),
});
exports.ConnectionSchema = zod_1.z.object({
    source: zod_1.z.string().describe('Component ID of source node'),
    target: zod_1.z.string().describe('Component ID of target node'),
    relationship: zod_1.z.string().describe('Short verb or description, e.g. "Queries", "Sends events to", "Authenticates via"'),
    communication_method: zod_1.z.string().describe('Protocol or transport, e.g. "REST / HTTPS", "gRPC", "WebSocket", "AMQP", "SQL"'),
    explanation: zod_1.z.string().describe('Detailed technical explanation of the interaction'),
    source_reference: zod_1.z.string().describe('Source citation in document'),
});
exports.DatabaseSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.string().describe('e.g. Relational (PostgreSQL), Document (MongoDB), Key-Value (Redis)'),
    purpose: zod_1.z.string(),
    storage_details: zod_1.z.string().optional(),
    source_reference: zod_1.z.string(),
});
exports.ApiSchema = zod_1.z.object({
    name: zod_1.z.string(),
    method: zod_1.z.string().describe('GET, POST, PUT, DELETE, WebSocket, gRPC RPC, etc.'),
    endpoint: zod_1.z.string().describe('URI or RPC path e.g. /api/v1/orders'),
    purpose: zod_1.z.string(),
    source_reference: zod_1.z.string(),
});
exports.DataFlowStepSchema = zod_1.z.object({
    step_number: zod_1.z.number(),
    component_id: zod_1.z.string(),
    action: zod_1.z.string().describe('Concise description of the action at this stage'),
    communication_method: zod_1.z.string().optional(),
    details: zod_1.z.string(),
});
exports.DataFlowSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().describe('e.g. "User Authentication Flow", "Order Placement Pipeline"'),
    description: zod_1.z.string(),
    steps: zod_1.z.array(exports.DataFlowStepSchema),
    source_reference: zod_1.z.string(),
});
exports.UnknownItemSchema = zod_1.z.object({
    category: zod_1.z.string().describe('e.g. "Database", "Authentication Protocol", "Deployment Strategy"'),
    information: zod_1.z.string().describe('What specific detail was sought but not found'),
    reason: zod_1.z.string().describe('Explanation of why it cannot be determined from the document'),
});
exports.ArchitectureOutputSchema = zod_1.z.object({
    project: zod_1.z.object({
        name: zod_1.z.string().describe('Actual project title identified from documentation'),
        description: zod_1.z.string().describe('Accurate summary of what the system does'),
        purpose: zod_1.z.string().describe('Primary business or technical goal'),
        technologies: zod_1.z.object({
            frontend: zod_1.z.array(zod_1.z.string()).default([]),
            backend: zod_1.z.array(zod_1.z.string()).default([]),
            database: zod_1.z.array(zod_1.z.string()).default([]),
            infrastructure: zod_1.z.array(zod_1.z.string()).default([]),
            apis_and_protocols: zod_1.z.array(zod_1.z.string()).default([]),
        }),
    }),
    components: zod_1.z.array(exports.ComponentSchema).min(1),
    connections: zod_1.z.array(exports.ConnectionSchema),
    databases: zod_1.z.array(exports.DatabaseSchema).default([]),
    apis: zod_1.z.array(exports.ApiSchema).default([]),
    data_flows: zod_1.z.array(exports.DataFlowSchema).default([]),
    unknowns: zod_1.z.array(exports.UnknownItemSchema).default([]),
    observations: zod_1.z.array(zod_1.z.string()).default([]),
});
