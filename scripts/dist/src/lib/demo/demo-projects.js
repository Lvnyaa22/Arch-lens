"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_PROJECTS = exports.DEMO_PROJECT_COLLABCANVAS = exports.DEMO_PROJECT_SHOPSTREAM = void 0;
exports.DEMO_PROJECT_SHOPSTREAM = {
    id: 'demo-shopstream-cloud',
    uploadedAt: new Date().toISOString(),
    fileName: 'shopstream-cloud-architecture.pdf',
    fileSize: 184520,
    documentText: `ShopStream Cloud - Technical Architecture Specification
Section 1: Executive Summary & Project Purpose
ShopStream is a cloud-native, distributed e-commerce platform built for high-throughput retail operations.
The system provides scalable product browsing, secure user authentication, order placement, and payment settlement.

Section 2: Microservices & Component Inventory
1. Web Storefront (web-storefront): Next.js 14, React, Tailwind CSS. SSR customer portal.
2. API Gateway (api-gateway): Kong Gateway with JWT validation and rate limiting.
3. Auth Service (auth-service): Node.js / Express. Customer registration and OAuth token issuance.
4. Product Catalog Service (catalog-service): Go (Gin framework) high-read service.
5. Order Processing Service (order-service): NestJS with TypeScript. Manages transactional orders.
6. Payment Service (payment-service): Python FastAPI. Stripe API integration.
7. Notification Worker (notification-worker): Node.js event listener for receipts.

Section 3: Data Persistence & Event Pipeline
- Orders Database: PostgreSQL 16 ACID transactional relational store.
- Product Catalog DB: MongoDB 7.0 document store for flexible product variants.
- Redis Cache: In-memory session & shopping cart store.
- RabbitMQ Event Bus: AMQP message broker for 'order.created' and 'payment.settled' events.

Section 4: Key Transactional Execution Flows
Order Placement: Web Storefront -> API Gateway -> Order Service -> Orders DB & RabbitMQ -> Payment Service -> Stripe API.`,
    pageCount: 4,
    chunks: [
        {
            id: 'chk-ss-1',
            fileName: 'shopstream-cloud-architecture.pdf',
            fileType: 'pdf',
            pageOrSection: 'Page 1 - Executive Summary',
            content: 'ShopStream Cloud is a cloud-native e-commerce platform built for high-throughput retail operations with horizontal autoscaling and asynchronous domain messaging.',
            tokenEstimate: 70,
        },
        {
            id: 'chk-ss-2',
            fileName: 'shopstream-cloud-architecture.pdf',
            fileType: 'pdf',
            pageOrSection: 'Page 2 - Microservices Inventory',
            content: 'Core services: Web Storefront (Next.js 14), Kong API Gateway, Auth Service (Node.js/Express), Catalog Service (Go/Gin), Order Processing Service (NestJS), and Payment Service (Python FastAPI).',
            tokenEstimate: 95,
        },
        {
            id: 'chk-ss-3',
            fileName: 'shopstream-cloud-architecture.pdf',
            fileType: 'pdf',
            pageOrSection: 'Page 3 - Storage & Messaging',
            content: 'Storage hierarchy: Orders Database (PostgreSQL 16 for ACID financial integrity), Product Catalog (MongoDB 7.0 for schemaless product metadata), Redis 7.2 Cache, and RabbitMQ 3.12 Event Bus.',
            tokenEstimate: 85,
        },
        {
            id: 'chk-ss-4',
            fileName: 'shopstream-cloud-architecture.pdf',
            fileType: 'pdf',
            pageOrSection: 'Page 4 - Execution Flows',
            content: 'Checkout Flow: Storefront calls API Gateway via POST /api/v1/orders. Gateway routes via gRPC to Order Service. Order Service writes pending order to PostgreSQL and publishes order.created event to RabbitMQ.',
            tokenEstimate: 90,
        },
    ],
    project: {
        name: 'ShopStream Cloud',
        description: 'Distributed cloud-native e-commerce platform with event-driven microservices topology.',
        purpose: 'Provide high-throughput online retail, scalable catalog browsing, and reliable transactional checkout.',
        technologies: {
            frontend: ['Next.js 14', 'React', 'Tailwind CSS', 'TypeScript'],
            backend: ['Node.js (NestJS)', 'Go (Gin)', 'Python (FastAPI)', 'Express'],
            database: ['MongoDB 7.0', 'PostgreSQL 16', 'Redis 7.2'],
            infrastructure: ['Kong API Gateway', 'RabbitMQ 3.12', 'Docker'],
            apis_and_protocols: ['REST / HTTPS', 'gRPC', 'AMQP 0-9-1'],
        },
    },
    components: [
        {
            id: 'web-storefront',
            name: 'Web Storefront',
            type: 'frontend',
            description: 'Server-side rendered customer portal for catalog browsing, shopping cart, and checkout.',
            technology: 'Next.js 14, React, Tailwind CSS',
            confidence: 'explicit',
            source_reference: 'Page 2 - Section 2',
        },
        {
            id: 'api-gateway',
            name: 'Kong API Gateway',
            type: 'api_gateway',
            description: 'Edge reverse proxy handling TLS termination, rate limiting, and JWT authentication.',
            technology: 'Kong Gateway',
            confidence: 'explicit',
            source_reference: 'Page 2 - Section 2',
        },
        {
            id: 'auth-service',
            name: 'Auth & User Service',
            type: 'auth_provider',
            description: 'Customer authentication, credential verification, and JWT issuance.',
            technology: 'Node.js, Express, TypeScript',
            confidence: 'explicit',
            source_reference: 'Page 2 - Section 2',
        },
        {
            id: 'catalog-service',
            name: 'Product Catalog Service',
            type: 'backend_service',
            description: 'High-read product search, SKU pricing, and category hierarchies.',
            technology: 'Go, Gin framework',
            confidence: 'explicit',
            source_reference: 'Page 2 - Section 2',
        },
        {
            id: 'order-service',
            name: 'Order Processing Service',
            type: 'backend_service',
            description: 'Coordinates transactional checkout workflows and order state machines.',
            technology: 'NestJS, TypeScript',
            confidence: 'explicit',
            source_reference: 'Page 2 - Section 2',
        },
        {
            id: 'payment-service',
            name: 'Payment Service',
            type: 'external_service',
            description: 'Interacts with Stripe API for credit card tokenization and settlement.',
            technology: 'Python, FastAPI, Stripe SDK',
            confidence: 'explicit',
            source_reference: 'Page 2 - Section 2',
        },
        {
            id: 'orders-db',
            name: 'Orders Database',
            type: 'database',
            description: 'ACID-compliant relational database storing customer orders and transaction history.',
            technology: 'PostgreSQL 16',
            confidence: 'explicit',
            source_reference: 'Page 3 - Section 3',
        },
        {
            id: 'catalog-db',
            name: 'Product Catalog DB',
            type: 'database',
            description: 'Schemaless document store for dynamic product attributes and variants.',
            technology: 'MongoDB 7.0',
            confidence: 'explicit',
            source_reference: 'Page 3 - Section 3',
        },
        {
            id: 'redis-cache',
            name: 'Session Cache',
            type: 'cache',
            description: 'In-memory cache for user sessions and hot product listings.',
            technology: 'Redis 7.2',
            confidence: 'explicit',
            source_reference: 'Page 3 - Section 3',
        },
        {
            id: 'rabbitmq-broker',
            name: 'RabbitMQ Event Bus',
            type: 'message_broker',
            description: 'Asynchronous event bus distributing order and payment events across services.',
            technology: 'RabbitMQ 3.12 (AMQP)',
            confidence: 'explicit',
            source_reference: 'Page 3 - Section 3',
        },
    ],
    connections: [
        {
            source: 'web-storefront',
            target: 'api-gateway',
            relationship: 'Sends customer traffic',
            communication_method: 'HTTPS / REST',
            explanation: 'Storefront delegates all API queries through the edge Kong gateway.',
            source_reference: 'Page 2 - Section 2',
        },
        {
            source: 'api-gateway',
            target: 'auth-service',
            relationship: 'Routes login & registration',
            communication_method: 'gRPC / HTTP/2',
            explanation: 'Gateway forwards authentication payloads to Auth Service.',
            source_reference: 'Page 2 - Section 2',
        },
        {
            source: 'api-gateway',
            target: 'catalog-service',
            relationship: 'Routes product queries',
            communication_method: 'REST / HTTPS',
            explanation: 'Gateway forwards product catalog browse and search requests.',
            source_reference: 'Page 2 - Section 2',
        },
        {
            source: 'api-gateway',
            target: 'order-service',
            relationship: 'Routes checkout orders',
            communication_method: 'gRPC',
            explanation: 'Gateway routes authenticated checkout requests to Order Service.',
            source_reference: 'Page 2 - Section 2',
        },
        {
            source: 'catalog-service',
            target: 'catalog-db',
            relationship: 'Queries product documents',
            communication_method: 'MongoDB Wire Protocol',
            explanation: 'Catalog service reads and writes product catalogs in MongoDB.',
            source_reference: 'Page 3 - Section 3',
        },
        {
            source: 'order-service',
            target: 'orders-db',
            relationship: 'Persists order records',
            communication_method: 'SQL / TCP',
            explanation: 'Order service manages ACID transactional records in PostgreSQL.',
            source_reference: 'Page 3 - Section 3',
        },
        {
            source: 'order-service',
            target: 'rabbitmq-broker',
            relationship: 'Publishes order.created',
            communication_method: 'AMQP 0-9-1',
            explanation: 'Emits asynchronous order event for downstream payment settlement.',
            source_reference: 'Page 3 - Section 3',
        },
        {
            source: 'rabbitmq-broker',
            target: 'payment-service',
            relationship: 'Consumes order events',
            communication_method: 'AMQP 0-9-1',
            explanation: 'Payment service consumes order.created event to initiate payment flow.',
            source_reference: 'Page 3 - Section 3',
        },
        {
            source: 'auth-service',
            target: 'redis-cache',
            relationship: 'Caches JWT revocation lists',
            communication_method: 'Redis RESP',
            explanation: 'Validates active session tokens and revocation state in memory.',
            source_reference: 'Page 3 - Section 3',
        },
    ],
    databases: [
        {
            name: 'Orders Database',
            type: 'Relational (PostgreSQL 16)',
            purpose: 'ACID transactional logs and financial ledger for orders',
            source_reference: 'Page 3 - Section 3',
        },
        {
            name: 'Product Catalog Database',
            type: 'Document Store (MongoDB 7.0)',
            purpose: 'Dynamic schemaless product inventory, reviews, and specifications',
            source_reference: 'Page 3 - Section 3',
        },
        {
            name: 'Session & Cache Store',
            type: 'Key-Value (Redis 7.2)',
            purpose: 'Low-latency session authentication and transient product cache',
            source_reference: 'Page 3 - Section 3',
        },
    ],
    apis: [
        {
            name: 'User Login',
            method: 'POST',
            endpoint: '/api/v1/auth/login',
            purpose: 'Authenticate user credentials and issue JWT bearer token',
            source_reference: 'Page 2 - Section 2',
        },
        {
            name: 'Browse Catalog',
            method: 'GET',
            endpoint: '/api/v1/products',
            purpose: 'Retrieve paginated product catalog with category filters',
            source_reference: 'Page 2 - Section 2',
        },
        {
            name: 'Create Order',
            method: 'POST',
            endpoint: '/api/v1/orders',
            purpose: 'Initiate transactional customer order checkout',
            source_reference: 'Page 2 - Section 2',
        },
    ],
    data_flows: [
        {
            id: 'flow-checkout-ss',
            name: 'Customer Order Placement & Payment Settlement',
            description: 'End-to-end transactional workflow when a customer places an order.',
            steps: [
                {
                    step_number: 1,
                    component_id: 'web-storefront',
                    action: 'Customer submits cart checkout',
                    communication_method: 'HTTPS / REST',
                    details: 'Dispatches POST /api/v1/orders with cart items and shipping details.',
                },
                {
                    step_number: 2,
                    component_id: 'api-gateway',
                    action: 'Validate JWT & route request',
                    communication_method: 'gRPC',
                    details: 'Kong Gateway validates customer bearer token and routes to Order Service.',
                },
                {
                    step_number: 3,
                    component_id: 'order-service',
                    action: 'Persist pending order in PostgreSQL',
                    communication_method: 'SQL / TCP',
                    details: 'Writes pending order row to Orders Database and reserves inventory.',
                },
                {
                    step_number: 4,
                    component_id: 'order-service',
                    action: 'Publish order.created event to RabbitMQ',
                    communication_method: 'AMQP 0-9-1',
                    details: 'Publishes asynchronous event to RabbitMQ Event Bus for payment settlement.',
                },
                {
                    step_number: 5,
                    component_id: 'payment-service',
                    action: 'Consume event and charge Stripe API',
                    communication_method: 'HTTPS',
                    details: 'Payment Service consumes order event and executes credit card charge via Stripe.',
                },
            ],
            source_reference: 'Page 4 - Section 4',
        },
    ],
    unknowns: [
        {
            category: 'Search Engine',
            information: 'Search index clustering mechanism is not specified in documentation.',
            reason: 'Section 3.1 notes Elasticsearch or Algolia is omitted from documentation.',
        },
        {
            category: 'Disaster Recovery',
            information: 'Multi-region failover and database replica strategy is not detailed.',
            reason: 'Documentation lacks replication topology specification.',
        },
    ],
    observations: [
        'Asynchronous event-driven architecture using central RabbitMQ message bus.',
        'Polyglot database strategy cleanly isolating schemaless catalog from ACID financial records.',
        'Edge API Gateway decoupling public client traffic from internal gRPC microservices.',
    ],
    confidence_summary: {
        explicit_count: 10,
        inferred_count: 0,
        unknown_count: 2,
    },
};
exports.DEMO_PROJECT_COLLABCANVAS = {
    id: 'demo-collabcanvas-realtime',
    uploadedAt: new Date().toISOString(),
    fileName: 'collabcanvas-realtime-architecture.pdf',
    fileSize: 172340,
    documentText: `CollabCanvas Realtime - Technical Architecture Specification
Section 1: Executive Summary & Project Purpose
CollabCanvas is a high-performance, real-time vector whiteboard platform enabling thousands of simultaneous users
to sketch, annotate, diagram, and collaborate on shared infinite canvases with sub-20ms synchronization latency.

Section 2: Component Specifications
1. Canvas Client App (canvas-client): Flutter Web compiled to WebAssembly with Skia / CanvasKit GPU rendering.
2. Edge Connection Gateway (edge-gateway): Go with epoll-based Gorilla WebSocket server.
3. Room Coordination Cluster (room-coordinator): Elixir / Phoenix Framework running on the Erlang BEAM VM.
4. Vector Snapshot Worker (snapshot-worker): Rust with headless SVG rasterizer and Actix-web.
5. Account & Permissions API (accounts-api): Ruby on Rails 7 API mode.

Section 3: Storage & Memory Hierarchy
1. Live Board State Store: Redis 7 Cluster (In-Memory Key-Value & Pub/Sub for live room CRDT scene graph).
2. Relational Metadata Database: PostgreSQL 15 for accounts, workspaces, and team memberships.
3. Object Storage Depot: AWS S3 for exported canvas snapshots and images.

Section 4: Real-Time Vector Synchronization Flow
Client captures stylus stroke -> sends WSS /ws/canvas/join -> Edge Gateway -> Room Coordinator (Elixir GenServer) -> Redis Pub/Sub -> broadcast to peer clients.`,
    pageCount: 4,
    chunks: [
        {
            id: 'chk-cc-1',
            fileName: 'collabcanvas-realtime-architecture.pdf',
            fileType: 'pdf',
            pageOrSection: 'Page 1 - Executive Summary',
            content: 'CollabCanvas is a real-time vector whiteboard platform with sub-20ms sync latency, structured around continuous bidirectional streaming and CRDT state synchronization.',
            tokenEstimate: 75,
        },
        {
            id: 'chk-cc-2',
            fileName: 'collabcanvas-realtime-architecture.pdf',
            fileType: 'pdf',
            pageOrSection: 'Page 2 - Component Inventory',
            content: 'Components: Canvas Client App (Flutter Web/CanvasKit), Edge Connection Gateway (Go/Gorilla WebSocket), Room Coordination Cluster (Elixir/Phoenix), Vector Snapshot Worker (Rust), and Accounts API (Rails 7).',
            tokenEstimate: 95,
        },
        {
            id: 'chk-cc-3',
            fileName: 'collabcanvas-realtime-architecture.pdf',
            fileType: 'pdf',
            pageOrSection: 'Page 3 - Persistence & Streaming',
            content: 'Storage hierarchy: Redis 7 Cluster (live ephemeral CRDT state and peer pub/sub), PostgreSQL 15 (relational user accounts and workspaces), and Amazon S3 (long-term vector snapshots).',
            tokenEstimate: 85,
        },
    ],
    project: {
        name: 'CollabCanvas Realtime',
        description: 'High-performance real-time collaborative vector whiteboard with sub-20ms sync latency.',
        purpose: 'Enable thousands of simultaneous remote team members to sketch, diagram, and collaborate seamlessly.',
        technologies: {
            frontend: ['Flutter Web', 'Dart', 'WebAssembly', 'CanvasKit'],
            backend: ['Go (Gorilla)', 'Elixir (Phoenix)', 'Rust (Actix-web)', 'Ruby on Rails 7'],
            database: ['Redis 7 Cluster', 'PostgreSQL 15'],
            infrastructure: ['Amazon Web Services S3', 'Erlang BEAM VM'],
            apis_and_protocols: ['WSS / WebSockets', 'Protobuf', 'REST / HTTPS'],
        },
    },
    components: [
        {
            id: 'canvas-client',
            name: 'Canvas Client App',
            type: 'frontend',
            description: 'Flutter Web GPU canvas renderer capturing high-frequency pen strokes and gesture inputs.',
            technology: 'Flutter Web, Dart, CanvasKit',
            confidence: 'explicit',
            source_reference: 'Page 2 - Section 2',
        },
        {
            id: 'edge-gateway',
            name: 'Edge Connection Gateway',
            type: 'api_gateway',
            description: 'Go epoll WebSocket gateway terminating client persistent connections.',
            technology: 'Go, Gorilla WebSocket',
            confidence: 'explicit',
            source_reference: 'Page 2 - Section 2',
        },
        {
            id: 'room-coordinator',
            name: 'Room Coordination Cluster',
            type: 'backend_service',
            description: 'Elixir Phoenix GenServers managing active room presence, peer broadcast, and CRDT transforms.',
            technology: 'Elixir, Phoenix, Erlang BEAM',
            confidence: 'explicit',
            source_reference: 'Page 2 - Section 2',
        },
        {
            id: 'snapshot-worker',
            name: 'Vector Snapshot Worker',
            type: 'backend_service',
            description: 'Rust headless SVG vector rasterizer generating board snapshots for cold storage.',
            technology: 'Rust, Actix-web',
            confidence: 'explicit',
            source_reference: 'Page 2 - Section 2',
        },
        {
            id: 'accounts-api',
            name: 'Accounts & Permissions API',
            type: 'backend_service',
            description: 'Ruby on Rails API managing workspaces, billing licenses, and access control lists.',
            technology: 'Ruby on Rails 7',
            confidence: 'explicit',
            source_reference: 'Page 2 - Section 2',
        },
        {
            id: 'redis-state-store',
            name: 'Live Board State Store',
            type: 'cache',
            description: 'Redis Cluster storing live CRDT scene graphs, cursors, and pub/sub broadcast channels.',
            technology: 'Redis 7 Cluster',
            confidence: 'explicit',
            source_reference: 'Page 3 - Section 3',
        },
        {
            id: 'postgres-accounts-db',
            name: 'Relational Accounts DB',
            type: 'database',
            description: 'PostgreSQL database for tenant workspaces, user profiles, and organization hierarchy.',
            technology: 'PostgreSQL 15',
            confidence: 'explicit',
            source_reference: 'Page 3 - Section 3',
        },
        {
            id: 's3-asset-storage',
            name: 'S3 Asset Storage',
            type: 'storage',
            description: 'Amazon S3 object storage for frozen vector board snapshots and exported PDFs.',
            technology: 'Amazon Web Services S3',
            confidence: 'explicit',
            source_reference: 'Page 3 - Section 3',
        },
    ],
    connections: [
        {
            source: 'canvas-client',
            target: 'edge-gateway',
            relationship: 'Streams binary stroke deltas',
            communication_method: 'WSS / Binary WebSocket',
            explanation: 'Client streams pen coordinates and receives peer cursor updates over WebSocket.',
            source_reference: 'Page 2 - Section 2',
        },
        {
            source: 'edge-gateway',
            target: 'room-coordinator',
            relationship: 'Forwards room frames',
            communication_method: 'TCP Socket Streaming',
            explanation: 'Edge Gateway demultiplexes socket streams to active Elixir GenServer processes.',
            source_reference: 'Page 2 - Section 2',
        },
        {
            source: 'room-coordinator',
            target: 'redis-state-store',
            relationship: 'Publishes deltas & mutates state',
            communication_method: 'Redis RESP3 / Pub-Sub',
            explanation: 'Atomically updates room scene graph and triggers pub/sub distribution.',
            source_reference: 'Page 3 - Section 3',
        },
        {
            source: 'room-coordinator',
            target: 'snapshot-worker',
            relationship: 'Triggers snapshot jobs',
            communication_method: 'Internal RPC',
            explanation: 'Periodically signals Rust worker to generate canvas vector snapshots.',
            source_reference: 'Page 2 - Section 2',
        },
        {
            source: 'snapshot-worker',
            target: 's3-asset-storage',
            relationship: 'Uploads rendered snapshots',
            communication_method: 'AWS S3 REST API',
            explanation: 'Streams serialized PNG/SVG snapshots directly to S3 buckets.',
            source_reference: 'Page 3 - Section 3',
        },
        {
            source: 'canvas-client',
            target: 'accounts-api',
            relationship: 'Queries team workspaces',
            communication_method: 'HTTPS / REST',
            explanation: 'Queries workspace memberships and organization settings.',
            source_reference: 'Page 2 - Section 2',
        },
        {
            source: 'accounts-api',
            target: 'postgres-accounts-db',
            relationship: 'Persists user accounts',
            communication_method: 'SQL / TCP',
            explanation: 'Stores tenant accounts, permissions, and audit logs in PostgreSQL.',
            source_reference: 'Page 3 - Section 3',
        },
    ],
    databases: [
        {
            name: 'Redis State Store',
            type: 'In-Memory Key-Value & Pub/Sub (Redis 7)',
            purpose: 'Ephemeral vector scene graph, live room cursors, and peer broadcast channels',
            source_reference: 'Page 3 - Section 3',
        },
        {
            name: 'Relational Accounts Database',
            type: 'Relational Database (PostgreSQL 15)',
            purpose: 'Stores user identities, workspace permissions, team access lists, and audit logs',
            source_reference: 'Page 3 - Section 3',
        },
        {
            name: 'S3 Asset Depot',
            type: 'Cloud Object Store (Amazon S3)',
            purpose: 'Durable long-term archive for frozen board vector snapshots and high-res exports',
            source_reference: 'Page 3 - Section 3',
        },
    ],
    apis: [
        {
            name: 'Join Canvas Room',
            method: 'WSS',
            endpoint: '/ws/canvas/join',
            purpose: 'Establish bidirectional streaming session for live canvas synchronization',
            source_reference: 'Page 2 - Section 2',
        },
        {
            name: 'Create Workspace',
            method: 'POST',
            endpoint: '/api/v1/workspaces',
            purpose: 'Provision new organization collaborative whiteboard workspace',
            source_reference: 'Page 2 - Section 2',
        },
    ],
    data_flows: [
        {
            id: 'flow-draw-cc',
            name: 'Collaborative Vector Stroke Synchronization',
            description: 'Sub-20ms broadcast pipeline when a user sketches on the canvas.',
            steps: [
                {
                    step_number: 1,
                    component_id: 'canvas-client',
                    action: 'User stylus draws vector stroke',
                    communication_method: 'WSS / WebSocket',
                    details: 'Generates binary protobuf delta packet and sends via WebSocket.',
                },
                {
                    step_number: 2,
                    component_id: 'edge-gateway',
                    action: 'Demultiplex and route frame',
                    communication_method: 'TCP Streaming',
                    details: 'Go gateway validates session and forwards frame to Room Coordinator.',
                },
                {
                    step_number: 3,
                    component_id: 'room-coordinator',
                    action: 'Apply CRDT transform & write to Redis',
                    communication_method: 'Redis RESP3',
                    details: 'Elixir OTP GenServer merges delta into Redis room state.',
                },
                {
                    step_number: 4,
                    component_id: 'room-coordinator',
                    action: 'Broadcast delta to peer room participants',
                    communication_method: 'WebSocket Broadcast',
                    details: 'Dispatches transformed vector stroke to all active connected peer clients.',
                },
            ],
            source_reference: 'Page 4 - Section 4',
        },
    ],
    unknowns: [
        {
            category: 'CRDT Algorithm',
            information: 'Exact CRDT mathematical algorithm (Yjs vs Automerge) not specified.',
            reason: 'Documentation omits specific operational transform algorithm internals.',
        },
        {
            category: 'Voice Calling',
            information: 'Integrated audio/video conferencing capability is not documented.',
            reason: 'No WebRTC mesh or audio gateway is specified in technical docs.',
        },
    ],
    observations: [
        'Actor-based concurrency model using Erlang BEAM GenServers for per-room state isolation.',
        'Zero relational database dependency in the critical high-frequency rendering loop.',
        'Dedicated Rust worker for offloading CPU-heavy vector rasterization jobs.',
    ],
    confidence_summary: {
        explicit_count: 8,
        inferred_count: 0,
        unknown_count: 2,
    },
};
exports.DEMO_PROJECTS = [exports.DEMO_PROJECT_SHOPSTREAM, exports.DEMO_PROJECT_COLLABCANVAS];
