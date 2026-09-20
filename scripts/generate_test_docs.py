import os

def build_pdf(pages_text, output_path):
    objects = []
    def add_obj(content):
        objects.append(content)
        return len(objects)

    font_id = add_obj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
    page_ids = []
    content_ids = []

    for text in pages_text:
        lines = text.strip().split('\n')
        stream_parts = ['BT', '/F1 10 Tf', '50 750 Td', '13 TL']
        for line in lines:
            safe_line = line.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
            stream_parts.append(f'({safe_line}) \'')
        stream_parts.append('ET')
        stream_content = '\n'.join(stream_parts)
        stream_obj = f'<< /Length {len(stream_content)} >>\nstream\n{stream_content}\nendstream'
        cid = add_obj(stream_obj)
        content_ids.append(cid)

    pages_root_id = len(objects) + len(pages_text) + 1
    for cid in content_ids:
        p_obj = f'<< /Type /Page /Parent {pages_root_id} 0 R /MediaBox [0 0 612 792] /Contents {cid} 0 R /Resources << /Font << /F1 {font_id} 0 R >> >> >>'
        pid = add_obj(p_obj)
        page_ids.append(pid)

    kids_str = ' '.join(f'{pid} 0 R' for pid in page_ids)
    pages_root = f'<< /Type /Pages /Kids [{kids_str}] /Count {len(page_ids)} >>'
    assert add_obj(pages_root) == pages_root_id

    catalog_id = add_obj(f'<< /Type /Catalog /Pages {pages_root_id} 0 R >>')

    pdf = ['%PDF-1.4']
    offsets = []
    for i, obj in enumerate(objects):
        offset = sum(len(x.encode('latin1')) + 1 for x in pdf)
        offsets.append(offset)
        pdf.append(f'{i+1} 0 obj\n{obj}\nendobj')

    xref_offset = sum(len(x.encode('latin1')) + 1 for x in pdf)
    pdf.append(f'xref\n0 {len(objects)+1}\n0000000000 65535 f ')
    for off in offsets:
        pdf.append(f'{off:010d} 00000 n ')
    pdf.append(f'trailer\n<< /Size {len(objects)+1} /Root {catalog_id} 0 R >>\nstartxref\n{xref_offset}\n%%EOF')

    with open(output_path, 'wb') as f:
        f.write('\n'.join(pdf).encode('latin1'))

os.makedirs('test-docs', exist_ok=True)

# Project A: ShopStream Cloud (E-Commerce Microservices)
shopstream_pages = [
    """ShopStream Cloud - Technical Architecture Specification
Section 1: Executive Summary & Project Purpose
ShopStream is a cloud-native, distributed e-commerce platform built for high-throughput retail operations.
The system provides scalable product browsing, secure user authentication, order placement, and payment settlement.

Section 1.1: Core Architecture Principles
The platform adopts an asynchronous microservices topology designed for horizontal autoscaling.
Frontend clients interact exclusively through an edge API Gateway which routes requests to internal domain services.
All services emit domain events onto a central messaging backbone to ensure decoupling.
Explicit Tech Stack Overview:
- Frontend: Next.js 14, React, Tailwind CSS
- Gateway: Kong API Gateway
- Microservices: Node.js (NestJS), Go (Gin), Python (FastAPI)
- Databases: MongoDB 7.0, PostgreSQL 16
- Caching & Events: Redis 7.2, RabbitMQ 3.12""",

    """ShopStream Cloud - System Architecture
Section 2: Microservices & Component Inventory
The platform consists of five primary software services:

1. Web Storefront (web-storefront)
Technology: Next.js 14 with TypeScript and Tailwind CSS.
Provides server-side rendered storefront catalog, shopping cart, and customer checkout portal.
Communicates with the API Gateway via HTTPS / REST.

2. API Gateway (api-gateway)
Technology: Kong Gateway with reverse proxy routing and JWT rate limiting.
Terminates public TLS traffic and authenticates customer sessions using Redis token validation.
Routes requests to internal microservices via internal gRPC and HTTP/2.

3. Authentication & User Service (auth-service)
Technology: Node.js with Express and TypeScript.
Handles customer registration, credential verification, and OAuth token issuance.
Persists customer profile data in the PostgreSQL Users table.
Exposes endpoints: POST /api/v1/auth/register, POST /api/v1/auth/login.

4. Product Catalog Service (catalog-service)
Technology: Go (Gin framework) optimized for high-read throughput.
Manages category hierarchies, search indexes, SKU pricing, and inventory quantities.
Reads and writes directly to MongoDB Document Store.
Exposes endpoints: GET /api/v1/products, GET /api/v1/products/:id.

5. Order Processing Service (order-service)
Technology: NestJS framework with TypeScript.
Coordinates transactional checkout workflows, cart validation, and order state machines.
Stores orders, line items, and invoice states in PostgreSQL.
Publishes 'order.created' events to the RabbitMQ Event Bus.
Exposes endpoint: POST /api/v1/orders.""",

    """ShopStream Cloud - Data Storage & Messaging
Section 3: Persistence Layer & Event Pipeline

1. Orders Database (orders-db)
Type: Relational Database (PostgreSQL 16).
Purpose: Strictly ACID-compliant storage for financial transactions, customer orders, and line items.
Utilizes read-replicas for historical order analytics.

2. Product Catalog Database (catalog-db)
Type: Document Store (MongoDB 7.0).
Purpose: Flexible schemaless storage for dynamic product attributes, variants, reviews, and dimensions.

3. Session & Cache Store (redis-cache)
Type: In-Memory Key-Value Store (Redis 7.2).
Purpose: Transient caching of product listings, shopping carts, and validated JWT revocation lists.

4. Asynchronous Event Bus (rabbitmq-broker)
Type: Message Broker (RabbitMQ).
Purpose: Reliable event distribution for decoupled background operations:
- Event 'order.created': Consumed by Payment Integration Service.
- Event 'payment.settled': Consumed by Notification Service to dispatch receipts.

Section 3.1: External Integrations
Stripe Payment Gateway: Accessed by Payment Service over external HTTPS for credit card tokenization.
Note: The documentation does not specify the search engine clustering mechanism (Elasticsearch or Algolia is not stated).""",

    """ShopStream Cloud - Data Flow Walkthrough
Section 4: Key Transactional Execution Flows

Flow 1: Customer Order Placement & Payment Settlement
Step 1: Web Storefront submits checkout payload to API Gateway via POST /api/v1/orders over HTTPS.
Step 2: API Gateway validates bearer JWT and forwards request to Order Processing Service via gRPC.
Step 3: Order Processing Service validates cart items with Catalog Service and persists pending order in Orders Database (PostgreSQL).
Step 4: Order Processing Service publishes 'order.created' message to RabbitMQ Event Bus.
Step 5: Payment Service consumes message from RabbitMQ, calls Stripe API via HTTPS, and settles payment.
Step 6: Payment Service publishes 'payment.settled' event; Notification Service dispatches confirmation email.

Section 4.1: Known Limitations & Architecture Gaps
1. Disaster recovery multi-region replication strategy is not specified in this document.
2. Search indexing mechanism for catalog items is omitted from documentation.
3. Cold storage archiving for legacy orders older than 5 years is not defined."""
]

# Project B: CollabCanvas Realtime (Real-Time Collaborative Whiteboard)
collabcanvas_pages = [
    """CollabCanvas Realtime - Technical Architecture Specification
Section 1: Executive Summary & Project Purpose
CollabCanvas is a high-performance, real-time vector whiteboard platform enabling thousands of simultaneous users
to sketch, annotate, diagram, and collaborate on shared infinite canvases with sub-20ms synchronization latency.

Section 1.1: Architectural Tenets
Unlike traditional CRUD applications, CollabCanvas is structured around continuous bidirectional streaming.
State synchronization utilizes operational transformation and conflict-free replicated data types (CRDTs).
Explicit Tech Stack Overview:
- Frontend Client: Flutter Web (Dart), Skia / CanvasKit GPU renderer
- Streaming Gateway: Go (Gorilla WebSocket engine)
- Coordination Cluster: Elixir (Phoenix Channels on the Erlang BEAM VM)
- Background Worker: Rust (Actix-web vector rasterizer)
- Metadata API: Ruby on Rails 7
- Persistence: Redis Cluster (live board state), PostgreSQL (tenants & accounts), AWS S3 (snapshots)""",

    """CollabCanvas Realtime - System Components & Topology
Section 2: Component Specifications

1. Canvas Client App (canvas-client)
Technology: Flutter Web compiled to WebAssembly with CanvasKit rendering.
Captures high-frequency pen strokes, vector bezier curves, gestures, and cursor positions.
Maintains an optimistic local vector scene graph and streams delta patches over WebSockets.

2. Edge Connection Gateway (edge-gateway)
Technology: Go with epoll-based Gorilla WebSocket server.
Manages persistent TLS WebSocket handshakes from clients.
Maintains heartbeat liveness and demultiplexes incoming binary stroke payloads.
Routes stroke frames to Room Coordination Cluster via internal low-latency TCP sockets.
Exposes endpoint: WSS /ws/canvas/join.

3. Room Coordination Cluster (room-coordinator)
Technology: Elixir / Phoenix Framework running on BEAM.
Utilizes lightweight OTP GenServers per active canvas room.
Coordinates room presence, peer broadcast, and merges vector conflict states.
Writes atomic delta operations to Redis Cluster and dispatches peer broadcast packets.

4. Vector Snapshot Worker (snapshot-worker)
Technology: Rust with headless SVG rasterizer and Actix-web.
Periodically drains room mutation streams, constructs lossless SVG / PNG vector thumbnails,
and streams serialized board snapshots directly to Amazon S3.

5. Account & Permissions API (accounts-api)
Technology: Ruby on Rails 7 API mode.
Manages organization workspaces, billing licenses, user roles, and team invites.
Persists relational enterprise data to PostgreSQL.
Exposes endpoints: POST /api/v1/workspaces, GET /api/v1/workspaces/:id/members.""",

    """CollabCanvas Realtime - Data Persistence & Streaming Topology
Section 3: Storage & Memory Hierarchy

1. Live Board State Store (redis-state-store)
Type: In-Memory Key-Value & Pub/Sub (Redis 7 Cluster).
Purpose: Holds ephemeral vector scene graphs, active room cursors, and pub/sub channels for inter-node broadcasting.

2. Relational Metadata Database (postgres-accounts-db)
Type: Relational Database (PostgreSQL 15).
Purpose: Stores organization hierarchy, user credentials, team access control lists, and audit logs.

3. Object Storage Depot (s3-asset-storage)
Type: Cloud Object Store (Amazon Web Services S3).
Purpose: Long-term durable storage for frozen board snapshots, imported vector PDFs, and exportable high-res PNGs.

Section 3.1: Communication Matrix
- Client -> Edge Gateway: WSS /ws/canvas/join (Binary Protobuf over WebSocket)
- Edge Gateway -> Room Coordinator: Internal TCP Socket streaming
- Room Coordinator -> Redis State Store: Redis RESP3 commands & Pub/Sub
- Snapshot Worker -> S3 Asset Storage: AWS S3 REST API (HTTPS)
- Client -> Accounts API: HTTPS / REST for organization settings""",

    """CollabCanvas Realtime - Data Flow & Operational Analysis
Section 4: Real-Time Vector Synchronization Flow

Flow 1: Collaborative Vector Stroke Synchronization
Step 1: Canvas Client App captures stylus input, generates delta vector packet, and sends via WSS to Edge Gateway.
Step 2: Edge Gateway verifies room session token and passes binary frame to Room Coordination Cluster.
Step 3: Room Coordination Cluster OTP GenServer applies CRDT transform and writes delta to Redis State Store.
Step 4: Room Coordination Cluster broadcasts transformed delta stroke to all other connected room participants over WebSocket.
Step 5: Receiving Canvas Clients update their local Skia scene graphs with zero full-page reload.

Section 4.1: Documented Gaps & Unknowns
1. The exact CRDT mathematical algorithm (Yjs vs Automerge vs custom LWW-element-set) is not specified in this document.
2. WebRTC peer-to-peer mesh fallback is not detailed.
3. Voice / audio conferencing integration is not mentioned in documentation."""
]

build_pdf(shopstream_pages, 'test-docs/project-a-shopstream.pdf')
build_pdf(collabcanvas_pages, 'test-docs/project-b-collabcanvas.pdf')

print("Successfully generated:")
print("1. test-docs/project-a-shopstream.pdf (4 pages)")
print("2. test-docs/project-b-collabcanvas.pdf (4 pages)")
