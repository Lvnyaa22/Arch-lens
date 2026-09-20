# ArchLens AI — AI-Powered Project Architecture Explainer

ArchLens AI is a professional, developer-grade web application that dynamically analyzes uploaded software project documentation (PDF, Word DOCX, Markdown, plain text) and source-code-related files to explain, trace, and visualize the project's true architecture using Generative AI (Google Gemini).

---

## 🎯 Project Purpose

Software architecture is often buried across multi-page technical design documents, READMEs, or legacy specification PDFs. ArchLens AI ingests these unstructured files, extracts system topology, indexes semantic document chunks, and provides:

- **Component Inventory**: What services, frontends, databases, gateways, and message brokers exist.
- **Inter-Component Relationships**: How components communicate (protocols, directions, explanations).
- **Interactive Architecture Graph**: Visual directed acyclic graph (DAG) rendered with React Flow and auto-layout.
- **Execution & Data Flow Tracer**: Step-by-step sequential traces for specific operations (e.g. login, checkout, vector sync).
- **Grounded AI RAG Chat**: Context-aware Q&A with 3 explanation modes (*Developer*, *Beginner*, *Interview*) with clickable source citations.
- **Architecture Specification Dossier**: Exportable high-resolution PDF report and printable documentation.

---

## 🏗️ Architecture & Technology Stack

```
   ┌────────────────────────────────────────────────────────┐
   │                  Uploaded Document                     │
   │           (PDF / DOCX / MD / TXT / Code)               │
   └───────────────────────────┬────────────────────────────┘
                               │
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │             Sandboxed Text & AST Extraction            │
   │         (pdf-parse / mammoth / text-parser)            │
   └───────────────────────────┬────────────────────────────┘
                               │
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │             Semantic Document Chunking                 │
   │       (Page markers, Section headers, Tokens)          │
   └─────────────┬────────────────────────────┬─────────────┘
                 │                            │
                 ▼                            ▼
   ┌───────────────────────────┐ ┌──────────────────────────┐
   │  Gemini Architecture Gen  │ │ In-Memory BM25+TF-IDF    │
   │  Structured JSON + Zod    │ │ RAG Hybrid Retriever     │
   └─────────────┬─────────────┘ └────────────┬─────────────┘
                 │                            │
                 ▼                            ▼
   ┌───────────────────────────┐ ┌──────────────────────────┐
   │ Interactive React Flow    │ │ Grounded AI Assistant    │
   │ Directed Topology & Nodes │ │ Developer/Beginner/Inter.│
   └───────────────────────────┘ └──────────────────────────┘
```

### Core Technologies:
- **Framework**: Next.js 14 (App Router, TypeScript, React 18)
- **Styling**: Tailwind CSS, Lucide Icons, Custom Developer Slate Theme
- **Diagramming & Graph**: `@xyflow/react` (React Flow) + `@dagrejs/dagre` auto-layout
- **AI / LLM Integration**: Google Gemini API via `@google/generative-ai` SDK
- **Schema Validation**: `zod` for strict structured JSON outputs
- **Document Extractors**: `pdf-parse` (PDF with page preservation), `mammoth` (DOCX), native text & code parsers
- **Export**: `jspdf` + `html2canvas` for PDF report generation

---

## ✨ Implemented Core Features

1. **Multi-Format Upload Pipeline**
   - Ingests `.pdf`, `.docx`, `.md`, `.txt`, `.ts`, `.py`, `.go`, `.java`, `.rs`, `.json`, `.sql`, etc.
   - Validates file size (up to 25MB), detects empty/corrupted files, and provides real-time progress indicators.

2. **In-Memory Semantic Chunking & Hybrid Retrieval**
   - Retains chunk IDs, filenames, page numbers, and token estimates.
   - BM25 + TF-IDF cosine relevance ranking retrieves top context chunks for questions without requiring external vector databases.

3. **Dynamic Architecture Diagram**
   - Auto-layout directed topology graph with typed nodes (Frontend, Gateway, Service, Database, Cache, Message Broker, Storage).
   - Dynamic edge labels showing protocols (`REST / HTTPS`, `gRPC`, `WebSocket`, `AMQP`, `SQL`).
   - Click-to-inspect component detail drawer.

4. **Interactive Data Flow Tracer**
   - Traces sequential execution steps from customer actions to database mutations.
   - Supports ad-hoc custom queries (e.g., *"How does user login work?"*).

5. **Grounded AI RAG Chat with 3 Explanation Modes**
   - **Developer Mode**: Deep technical architecture details with endpoints and protocols.
   - **Beginner Mode**: Plain-English intuitive analogies with minimal jargon.
   - **Interview Mode**: System design interview perspective (trade-offs, scalability, bottlenecks).
   - **Clickable Source Citations**: Open the exact document chunk in the Source Inspector modal.
   - **Chat History**: Thread persistence per project.

6. **Component & Relationship Matrix**
   - Filterable catalog by component type, communication method, or search keywords.

7. **Project-Wide Search**
   - Search across Components, APIs, Databases, Execution Flows, and Document Chunks.

8. **Document & Chunk Explorer**
   - Inspect indexed chunks, page boundaries, and full extracted text.

9. **PDF Export & Architecture Dossier**
   - Downloadable and printable engineering report.

10. **One-Click Pre-Indexed Demo Projects**
    - **ShopStream Cloud**: Distributed e-commerce microservices (Next.js + NestJS + Go + MongoDB + PostgreSQL + RabbitMQ).
    - **CollabCanvas Realtime**: Real-time vector whiteboard (Flutter Web + Go WebSocket + Elixir Phoenix + Rust + Redis + AWS S3).

---

## 🔒 Security Practices

- **Zero Client Key Exposure**: Gemini API calls are strictly handled server-side.
- **Untrusted File Sandboxing**: Uploaded files are parsed as raw data streams; uploaded scripts are never executed.
- **Strict Anti-Hallucination**: If documentation lacks information, ArchLens explicitly answers: *"I couldn't find enough information in the uploaded project to answer this confidently."*

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ (tested on Node v20.18.0)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: You can also enter or switch your Gemini API key dynamically in the web UI using the Key icon in the navigation header).*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🧪 Automated Verification & Test Suite

Run the comprehensive test suite:
```bash
node scripts/dist/scripts/test_engine.js
```

### Test Results:
```
======================================================
ArchLens AI - Comprehensive Verification & Test Suite
======================================================

[TEST GROUP 1]: Project A (ShopStream) PDF Extraction
  ✓ PASS: Project A should extract exactly 4 pages
  ✓ PASS: Project A text contains "ShopStream Cloud"
  ✓ PASS: Project A preserves [Page 1] marker
  ✓ PASS: Project A preserves [Page 2] marker
  ✓ PASS: Project A contains RabbitMQ
  ✓ PASS: Project A contains MongoDB 7.0

[TEST GROUP 2]: Project B (CollabCanvas) PDF Extraction
  ✓ PASS: Project B should extract exactly 4 pages
  ✓ PASS: Project B text contains "CollabCanvas Realtime"
  ✓ PASS: Project B text contains "Flutter Web"
  ✓ PASS: Project B text contains "Phoenix Channels"
  ✓ PASS: Project B contains AWS S3
  ✓ PASS: Project B contains WebSocket endpoint

[TEST GROUP 3]: Upload Validation & Error Rejection
  ✓ PASS: Rejects empty 0-byte document correctly
  ✓ PASS: Rejects unsupported file format correctly

[TEST GROUP 4]: Source Code and Markdown Parsing
  ✓ PASS: Extracts TypeScript code structure
  ✓ PASS: Extracts Python code content

[TEST GROUP 5]: Semantic Chunking Pipeline
  ✓ PASS: Generates at least 4 chunks for 4-page PDF
  ✓ PASS: Chunks retain id, pageOrSection, and tokenEstimate metadata

[TEST GROUP 6]: In-Memory Hybrid RAG Retriever
  ✓ PASS: Retrieves relevant chunks for orders query
  ✓ PASS: Top chunk contains "order"
  ✓ PASS: Top chunk for "RabbitMQ" query ranks RabbitMQ excerpt highest

[TEST GROUP 7]: AI Explanation Modes
  ✓ PASS: Developer mode contains developer prompt instructions
  ✓ PASS: Beginner mode contains plain language instructions
  ✓ PASS: Interview mode contains scalability & trade-offs instructions

[TEST GROUP 8]: Dynamic Distinctness Verification (Project A vs Project B)
  ✓ PASS: Project A and Project B have 0 overlapping component IDs
  ✓ PASS: Project names are completely distinct
  ✓ PASS: Frontends are distinct (Next.js vs Flutter)
  ✓ PASS: Protocols are distinct (HTTPS vs WSS)
  ✓ PASS: Databases are distinct (PostgreSQL/MongoDB vs Redis State Store)

[TEST GROUP 9]: Architecture Schema Validation (Zod)
  ✓ PASS: Project A data passes Zod validation
  ✓ PASS: Project B data passes Zod validation

======================================================
Test Execution Finished: 31 Passed, 0 Failed
======================================================
```
