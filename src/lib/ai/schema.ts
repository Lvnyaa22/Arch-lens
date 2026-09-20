import { z } from 'zod';

export const ComponentSchema = z.object({
  id: z.string().describe('Unique identifier in kebab-case, e.g. web-frontend, auth-service, orders-db'),
  name: z.string().describe('Display name of component'),
  type: z.enum([
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
  description: z.string().describe('Description of component purpose and role'),
  technology: z.string().optional().describe('Underlying framework, runtime, or language, if mentioned'),
  confidence: z.enum(['explicit', 'inferred']).describe('Whether explicitly documented or reasonably inferred'),
  source_reference: z.string().describe('Source page or section citation (e.g. "Page 3 - Microservices Architecture" or "Not specified")'),
});

export const ConnectionSchema = z.object({
  source: z.string().describe('Component ID of source node'),
  target: z.string().describe('Component ID of target node'),
  relationship: z.string().describe('Short verb or description, e.g. "Queries", "Sends events to", "Authenticates via"'),
  communication_method: z.string().describe('Protocol or transport, e.g. "REST / HTTPS", "gRPC", "WebSocket", "AMQP", "SQL"'),
  explanation: z.string().describe('Detailed technical explanation of the interaction'),
  source_reference: z.string().describe('Source citation in document'),
});

export const DatabaseSchema = z.object({
  name: z.string(),
  type: z.string().describe('e.g. Relational (PostgreSQL), Document (MongoDB), Key-Value (Redis)'),
  purpose: z.string(),
  storage_details: z.string().optional(),
  source_reference: z.string(),
});

export const ApiSchema = z.object({
  name: z.string(),
  method: z.string().describe('GET, POST, PUT, DELETE, WebSocket, gRPC RPC, etc.'),
  endpoint: z.string().describe('URI or RPC path e.g. /api/v1/orders'),
  purpose: z.string(),
  source_reference: z.string(),
});

export const DataFlowStepSchema = z.object({
  step_number: z.number(),
  component_id: z.string(),
  action: z.string().describe('Concise description of the action at this stage'),
  communication_method: z.string().optional(),
  details: z.string(),
});

export const DataFlowSchema = z.object({
  id: z.string(),
  name: z.string().describe('e.g. "User Authentication Flow", "Order Placement Pipeline"'),
  description: z.string(),
  steps: z.array(DataFlowStepSchema),
  source_reference: z.string(),
});

export const UnknownItemSchema = z.object({
  category: z.string().describe('e.g. "Database", "Authentication Protocol", "Deployment Strategy"'),
  information: z.string().describe('What specific detail was sought but not found'),
  reason: z.string().describe('Explanation of why it cannot be determined from the document'),
});

export const ArchitectureOutputSchema = z.object({
  project: z.object({
    name: z.string().describe('Actual project title identified from documentation'),
    description: z.string().describe('Accurate summary of what the system does'),
    purpose: z.string().describe('Primary business or technical goal'),
    technologies: z.object({
      frontend: z.array(z.string()).default([]),
      backend: z.array(z.string()).default([]),
      database: z.array(z.string()).default([]),
      infrastructure: z.array(z.string()).default([]),
      apis_and_protocols: z.array(z.string()).default([]),
    }),
  }),
  components: z.array(ComponentSchema).min(1),
  connections: z.array(ConnectionSchema),
  databases: z.array(DatabaseSchema).default([]),
  apis: z.array(ApiSchema).default([]),
  data_flows: z.array(DataFlowSchema).default([]),
  unknowns: z.array(UnknownItemSchema).default([]),
  observations: z.array(z.string()).default([]),
});

export type ArchitectureOutput = z.infer<typeof ArchitectureOutputSchema>;
