export type ComponentType =
  | 'frontend'
  | 'backend_service'
  | 'database'
  | 'cache'
  | 'message_broker'
  | 'api_gateway'
  | 'external_service'
  | 'auth_provider'
  | 'storage'
  | 'unknown';

export type ConfidenceLevel = 'explicit' | 'inferred';

export type ExplanationMode = 'developer' | 'beginner' | 'interview';

export interface DocumentChunk {
  id: string;
  fileName: string;
  fileType: string;
  pageOrSection: string;
  content: string;
  tokenEstimate: number;
}

export interface ComponentItem {
  id: string;
  name: string;
  type: ComponentType;
  description: string;
  technology?: string;
  confidence: ConfidenceLevel;
  source_reference: string;
}

export interface ConnectionItem {
  source: string;
  target: string;
  relationship: string;
  communication_method: string;
  explanation: string;
  source_reference: string;
}

export interface DatabaseItem {
  name: string;
  type: string;
  purpose: string;
  storage_details?: string;
  source_reference: string;
}

export interface ApiItem {
  name: string;
  method: string;
  endpoint: string;
  purpose: string;
  source_reference: string;
}

export interface DataFlowStep {
  step_number: number;
  component_id: string;
  action: string;
  communication_method?: string;
  details: string;
}

export interface DataFlowItem {
  id: string;
  name: string;
  description: string;
  steps: DataFlowStep[];
  source_reference: string;
}

export interface UnknownItem {
  category: string;
  information: string;
  reason: string;
}

export interface ProjectMetadata {
  name: string;
  description: string;
  purpose: string;
  technologies: {
    frontend: string[];
    backend: string[];
    database: string[];
    infrastructure: string[];
    apis_and_protocols: string[];
  };
}

export interface ArchitectureAnalysis {
  id: string;
  uploadedAt: string;
  fileName: string;
  fileSize: number;
  documentText: string;
  pageCount: number;
  chunks?: DocumentChunk[];
  project: ProjectMetadata;
  components: ComponentItem[];
  connections: ConnectionItem[];
  databases: DatabaseItem[];
  apis: ApiItem[];
  data_flows: DataFlowItem[];
  unknowns: UnknownItem[];
  observations: string[];
  confidence_summary: {
    explicit_count: number;
    inferred_count: number;
    unknown_count: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  referencedChunks?: DocumentChunk[];
  mode?: ExplanationMode;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  projectId: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}
