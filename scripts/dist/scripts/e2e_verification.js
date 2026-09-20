"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const document_parser_1 = require("../src/lib/parsers/document-parser");
const retriever_1 = require("../src/lib/rag/retriever");
const layout_dagre_1 = require("../src/components/diagram/layout-dagre");
const prompts_1 = require("../src/lib/ai/prompts");
const demo_projects_1 = require("../src/lib/demo/demo-projects");
let passed = 0;
let failed = 0;
function assert(condition, testName, detail) {
    if (condition) {
        console.log(`  ✓ PASS: ${testName}`);
        passed++;
    }
    else {
        console.error(`  ✗ FAIL: ${testName}`, detail || '');
        failed++;
    }
}
async function runEndToEndVerification() {
    console.log('\n================================================================');
    console.log('ArchLens AI — Comprehensive End-to-End System & UI Engine Tests');
    console.log('================================================================\n');
    // 1. DASHBOARD & DEMO LOADER VERIFICATION
    console.log('[SECTION 1]: Dashboard & Demo Projects Integrity');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.id === 'demo-shopstream-cloud', 'ShopStream Demo Project ID is valid');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.components.length === 10, 'ShopStream contains exactly 10 microservice components');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.connections.length === 9, 'ShopStream contains 9 inter-service connections');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.databases.length === 3, 'ShopStream contains 3 persistence stores (PostgreSQL, MongoDB, Redis)');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.apis.length === 3, 'ShopStream contains 3 documented API endpoints');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.data_flows.length >= 1, 'ShopStream contains pre-analyzed order placement flow');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.chunks.length === 4, 'ShopStream contains 4 indexed document chunks');
    assert(demo_projects_1.DEMO_PROJECT_COLLABCANVAS.id === 'demo-collabcanvas-realtime', 'CollabCanvas Demo Project ID is valid');
    assert(demo_projects_1.DEMO_PROJECT_COLLABCANVAS.components.length === 8, 'CollabCanvas contains 8 realtime components');
    assert(demo_projects_1.DEMO_PROJECT_COLLABCANVAS.connections.length === 7, 'CollabCanvas contains 7 communication edges');
    assert(demo_projects_1.DEMO_PROJECT_COLLABCANVAS.databases.length === 3, 'CollabCanvas contains 3 storage entities (Redis, Postgres, S3)');
    assert(demo_projects_1.DEMO_PROJECT_COLLABCANVAS.chunks.length === 3, 'CollabCanvas contains 3 indexed document chunks');
    // 2. ARCHITECTURE GRAPH & DAGRE AUTO-LAYOUT
    console.log('\n[SECTION 2]: Architecture Topology Graph & Dagre Layout');
    const shopstreamLayoutLR = (0, layout_dagre_1.buildFlowElements)(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.components, demo_projects_1.DEMO_PROJECT_SHOPSTREAM.connections, 'LR');
    assert(shopstreamLayoutLR.nodes.length === 10, 'Generated 10 React Flow nodes for ShopStream');
    assert(shopstreamLayoutLR.edges.length === 9, 'Generated 9 React Flow edges for ShopStream');
    assert(shopstreamLayoutLR.nodes.every((n) => typeof n.position.x === 'number' && typeof n.position.y === 'number'), 'All node positions are valid numbers (no NaN)');
    assert(shopstreamLayoutLR.edges.every((e) => Boolean(e.label && e.source && e.target)), 'All edges have source, target, and protocol labels');
    const collabLayoutTB = (0, layout_dagre_1.buildFlowElements)(demo_projects_1.DEMO_PROJECT_COLLABCANVAS.components, demo_projects_1.DEMO_PROJECT_COLLABCANVAS.connections, 'TB');
    assert(collabLayoutTB.nodes.length === 8, 'Generated 8 React Flow nodes for CollabCanvas');
    assert(collabLayoutTB.edges.length === 7, 'Generated 7 React Flow edges for CollabCanvas');
    assert(collabLayoutTB.edges.some((e) => String(e.label).includes('WSS') || String(e.label).includes('WebSocket')), 'Edge labels correctly display WSS protocol');
    // 3. RAG CHAT & 5 USER QUESTIONS RETRIEVAL
    console.log('\n[SECTION 3]: RAG Chunk Retrieval for 5 Real Questions');
    const chunksSS = demo_projects_1.DEMO_PROJECT_SHOPSTREAM.chunks;
    // Q1: Authentication
    const q1 = 'How does authentication work?';
    const ret1 = (0, retriever_1.retrieveRelevantChunks)(q1, chunksSS, 3);
    assert(ret1.length > 0 && ret1.some((r) => r.chunk.content.includes('Auth') || r.chunk.content.includes('Kong')), 'Q1 (Auth) retrieves Auth/Kong chunks');
    // Q2: Order Placement
    const q2 = 'What happens when a user places an order?';
    const ret2 = (0, retriever_1.retrieveRelevantChunks)(q2, chunksSS, 3);
    assert(ret2.length > 0 && ret2.some((r) => r.chunk.content.includes('Order')), 'Q2 (Order) retrieves Order Processing chunk');
    // Q3: RabbitMQ
    const q3 = 'Which services communicate through RabbitMQ?';
    const ret3 = (0, retriever_1.retrieveRelevantChunks)(q3, chunksSS, 3);
    assert(ret3.length > 0 && ret3.some((r) => r.chunk.content.includes('RabbitMQ')), 'Q3 (RabbitMQ) retrieves RabbitMQ chunk');
    // Q4: Database Storage
    const q4 = 'Where is user data stored?';
    const ret4 = (0, retriever_1.retrieveRelevantChunks)(q4, chunksSS, 3);
    assert(ret4.length > 0 && ret4.some((r) => r.chunk.content.includes('PostgreSQL') || r.chunk.content.includes('MongoDB') || r.chunk.content.includes('Storage')), 'Q4 (Storage) retrieves PostgreSQL/MongoDB storage chunks');
    // Q5: Complete request flow
    const q5 = 'Explain the complete request flow.';
    const ret5 = (0, retriever_1.retrieveRelevantChunks)(q5, chunksSS, 3);
    assert(ret5.length > 0 && ret5.some((r) => r.chunk.content.includes('Flow') || r.chunk.content.includes('Order')), 'Q5 (Request flow) retrieves execution flow chunks');
    // 4. AI EXPLANATION MODES
    console.log('\n[SECTION 4]: AI Explanation Modes (Developer / Beginner / Interview)');
    const devPrompt = (0, prompts_1.buildChatSystemPrompt)('{}', 'context', 'developer');
    assert(devPrompt.includes('PROFESSIONAL DEVELOPER') && devPrompt.includes('protocols (gRPC, REST, WebSocket)'), 'Developer prompt enforces protocol & endpoint precision');
    const begPrompt = (0, prompts_1.buildChatSystemPrompt)('{}', 'context', 'beginner');
    assert(begPrompt.includes('BEGINNER / CONCEPTUAL') && begPrompt.includes('everyday concepts'), 'Beginner prompt enforces analogies & plain language');
    const intPrompt = (0, prompts_1.buildChatSystemPrompt)('{}', 'context', 'interview');
    assert(intPrompt.includes('SYSTEM DESIGN INTERVIEW') && intPrompt.includes('bottlenecks, trade-offs'), 'Interview prompt enforces system design trade-offs');
    // 5. DATA FLOW TRACER EXECUTION
    console.log('\n[SECTION 5]: Data Flow Tracer Verification');
    const flow = demo_projects_1.DEMO_PROJECT_SHOPSTREAM.data_flows[0];
    assert(flow.steps.length === 5, 'ShopStream order flow has 5 sequential steps');
    assert(flow.steps[0].component_id === 'web-storefront', 'Step 1 starts at web-storefront');
    assert(flow.steps[1].component_id === 'api-gateway', 'Step 2 routes through api-gateway');
    assert(flow.steps[2].component_id === 'order-service', 'Step 3 processes in order-service');
    assert(flow.steps[3].communication_method?.includes('AMQP'), 'Step 4 publishes via AMQP (RabbitMQ)');
    assert(flow.steps[4].component_id === 'payment-service', 'Step 5 settles in payment-service');
    // Ad-hoc prompt check
    const adHocPrompt = (0, prompts_1.buildAdHocFlowPrompt)('{}', 'doc context', 'How does user login work?');
    assert(adHocPrompt.includes('How does user login work?') && adHocPrompt.includes('step_number'), 'Ad-hoc flow prompt structures sequential step generation');
    // 6. SEARCH ENGINE VERIFICATION
    console.log('\n[SECTION 6]: Project-Wide Search Engine');
    const searchQueries = ['RabbitMQ', 'MongoDB', 'authentication', 'order', 'api'];
    for (const q of searchQueries) {
        const qLower = q.toLowerCase();
        const matchComp = demo_projects_1.DEMO_PROJECT_SHOPSTREAM.components.filter((c) => c.name.toLowerCase().includes(qLower) || c.description.toLowerCase().includes(qLower) || c.technology?.toLowerCase().includes(qLower));
        const matchChunk = demo_projects_1.DEMO_PROJECT_SHOPSTREAM.chunks.filter((c) => c.content.toLowerCase().includes(qLower));
        assert(matchComp.length > 0 || matchChunk.length > 0, `Search for "${q}" matches components or chunks in ShopStream`);
    }
    // 7. MULTI-FORMAT UPLOAD & EXTRACTION PIPELINE
    console.log('\n[SECTION 7]: Multi-Format Document Ingestion Pipeline');
    // PDF
    const pdfDoc = await (0, document_parser_1.parseUploadedDocument)(fs_1.default.readFileSync('test-docs/project-a-shopstream.pdf'), 'shopstream.pdf');
    assert(pdfDoc.pageCount === 4, 'PDF parsing extracts 4 pages with page markers');
    // Markdown
    const mdDoc = await (0, document_parser_1.parseUploadedDocument)(Buffer.from('# Architecture\n\n### Service A\nNode.js service.\n\n### Service B\nPostgreSQL db.'), 'arch.md');
    assert(mdDoc.text.includes('Service A') && mdDoc.pageCount >= 1, 'Markdown parsing extracts headings and text');
    // Plain Text
    const txtDoc = await (0, document_parser_1.parseUploadedDocument)(Buffer.from('CollabCanvas Architecture\nPage 1\nWebSocket server with Go.'), 'spec.txt');
    assert(txtDoc.text.includes('WebSocket') && txtDoc.pageCount >= 1, 'Plain text parsing works');
    // Source Code (TypeScript)
    const codeDoc = await (0, document_parser_1.parseUploadedDocument)(Buffer.from('export interface User { id: string; email: string; }\nexport const login = () => {};'), 'user.ts');
    assert(codeDoc.text.includes('export interface User'), 'TypeScript source code parsed as data stream');
    // Security: Rejection of invalid / empty
    try {
        await (0, document_parser_1.parseUploadedDocument)(Buffer.from(''), 'empty.pdf');
        assert(false, 'Should reject 0-byte file');
    }
    catch (err) {
        assert(err.message.includes('empty'), 'Security: Rejects empty file');
    }
    try {
        await (0, document_parser_1.parseUploadedDocument)(Buffer.from('bin-data'), 'exploit.sh');
        assert(false, 'Should reject unapproved executable scripts');
    }
    catch (err) {
        assert(err.message.includes('Unsupported file format'), 'Security: Rejects unauthorized file extensions');
    }
    // 8. ARCHITECTURE REPORT & DOSSIER INTEGRITY
    console.log('\n[SECTION 8]: Architecture Report & Dossier Integrity');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.project.technologies.frontend.length > 0, 'Report frontend technologies populated');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.project.technologies.backend.length > 0, 'Report backend technologies populated');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.project.technologies.database.length > 0, 'Report database technologies populated');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.unknowns.length > 0, 'Report unknowns matrix explicitly documents missing specs');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.observations.length > 0, 'Report architectural observations documented');
    console.log('\n================================================================');
    console.log(`End-to-End Verification Complete: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================\n');
    if (failed > 0) {
        process.exit(1);
    }
}
runEndToEndVerification().catch((err) => {
    console.error('E2E Verification error:', err);
    process.exit(1);
});
