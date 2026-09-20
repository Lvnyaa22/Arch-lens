"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const document_parser_1 = require("../src/lib/parsers/document-parser");
const chunker_1 = require("../src/lib/rag/chunker");
const retriever_1 = require("../src/lib/rag/retriever");
const schema_1 = require("../src/lib/ai/schema");
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
async function runAllTests() {
    console.log('\n======================================================');
    console.log('ArchLens AI - Comprehensive Verification & Test Suite');
    console.log('======================================================\n');
    // TEST GROUP 1: PDF Extraction & Page Tracking
    console.log('[TEST GROUP 1]: Project A (ShopStream) PDF Extraction');
    const pdfAPath = path_1.default.resolve('test-docs/project-a-shopstream.pdf');
    const bufferA = fs_1.default.readFileSync(pdfAPath);
    const docA = await (0, document_parser_1.parseUploadedDocument)(bufferA, 'project-a-shopstream.pdf');
    assert(docA.pageCount === 4, 'Project A should extract exactly 4 pages', `Extracted: ${docA.pageCount}`);
    assert(docA.text.includes('ShopStream Cloud'), 'Project A text contains "ShopStream Cloud"');
    assert(docA.text.includes('[Page 1]'), 'Project A preserves [Page 1] marker');
    assert(docA.text.includes('[Page 2]'), 'Project A preserves [Page 2] marker');
    assert(docA.text.includes('RabbitMQ'), 'Project A contains RabbitMQ');
    assert(docA.text.includes('MongoDB 7.0'), 'Project A contains MongoDB 7.0');
    // TEST GROUP 2: Project B (CollabCanvas) PDF Extraction
    console.log('\n[TEST GROUP 2]: Project B (CollabCanvas) PDF Extraction');
    const pdfBPath = path_1.default.resolve('test-docs/project-b-collabcanvas.pdf');
    const bufferB = fs_1.default.readFileSync(pdfBPath);
    const docB = await (0, document_parser_1.parseUploadedDocument)(bufferB, 'project-b-collabcanvas.pdf');
    assert(docB.pageCount === 4, 'Project B should extract exactly 4 pages', `Extracted: ${docB.pageCount}`);
    assert(docB.text.includes('CollabCanvas Realtime'), 'Project B text contains "CollabCanvas Realtime"');
    assert(docB.text.includes('Flutter Web'), 'Project B text contains "Flutter Web"');
    assert(docB.text.includes('Phoenix Channels'), 'Project B text contains "Phoenix Channels"');
    assert(docB.text.includes('Amazon Web Services S3'), 'Project B contains AWS S3');
    assert(docB.text.includes('WSS /ws/canvas/join'), 'Project B contains WebSocket endpoint');
    // TEST GROUP 3: File Validation & Error Rejection
    console.log('\n[TEST GROUP 3]: Upload Validation & Error Rejection');
    try {
        await (0, document_parser_1.parseUploadedDocument)(Buffer.from(''), 'empty.pdf');
        assert(false, 'Empty buffer should throw an error');
    }
    catch (err) {
        assert(err.message.includes('empty'), 'Rejects empty 0-byte document correctly');
    }
    try {
        await (0, document_parser_1.parseUploadedDocument)(Buffer.from('binary-data'), 'malicious.exe');
        assert(false, 'Unsupported file extension should throw error');
    }
    catch (err) {
        assert(err.message.includes('Unsupported file format'), 'Rejects unsupported file format correctly');
    }
    // TEST GROUP 4: Multi-Format & Source Code File Parsing
    console.log('\n[TEST GROUP 4]: Source Code and Markdown Parsing');
    const tsCode = `
import { Router } from 'express';
export const authRouter = Router();
authRouter.post('/login', async (req, res) => {
  // Validate credentials and issue JWT
  const { username, password } = req.body;
  res.json({ token: 'jwt-bearer-token' });
});
`;
    const codeDoc = await (0, document_parser_1.parseUploadedDocument)(Buffer.from(tsCode), 'authRouter.ts', 'text/typescript');
    assert(codeDoc.text.includes('authRouter.post'), 'Extracts TypeScript code structure');
    const pyCode = `
from fastapi import FastAPI
app = FastAPI()
@app.post('/charge')
def charge_payment():
    return {"status": "success"}
`;
    const pyDoc = await (0, document_parser_1.parseUploadedDocument)(Buffer.from(pyCode), 'payment.py', 'text/x-python');
    assert(pyDoc.text.includes('charge_payment'), 'Extracts Python code content');
    // TEST GROUP 5: RAG Semantic Chunking with Metadata
    console.log('\n[TEST GROUP 5]: Semantic Chunking Pipeline');
    const chunksA = (0, chunker_1.chunkDocument)(docA, 'project-a-shopstream.pdf');
    assert(chunksA.length >= 4, `Generates at least 4 chunks for 4-page PDF (got ${chunksA.length})`);
    assert(Boolean(chunksA[0].id && chunksA[0].pageOrSection && chunksA[0].tokenEstimate), 'Chunks retain id, pageOrSection, and tokenEstimate metadata');
    // TEST GROUP 6: In-Memory Hybrid RAG Retriever
    console.log('\n[TEST GROUP 6]: In-Memory Hybrid RAG Retriever');
    const query1 = 'Where are orders stored?';
    const retrieved1 = (0, retriever_1.retrieveRelevantChunks)(query1, chunksA, 3);
    assert(retrieved1.length > 0, 'Retrieves relevant chunks for orders query');
    assert(retrieved1[0].chunk.content.toLowerCase().includes('order'), 'Top chunk contains "order"');
    const query2 = 'RabbitMQ event bus';
    const retrieved2 = (0, retriever_1.retrieveRelevantChunks)(query2, chunksA, 3);
    assert(retrieved2[0].chunk.content.includes('RabbitMQ'), 'Top chunk for "RabbitMQ" query ranks RabbitMQ excerpt highest');
    // TEST GROUP 7: AI Explanation Modes
    console.log('\n[TEST GROUP 7]: AI Explanation Modes');
    const devPrompt = (0, prompts_1.buildChatSystemPrompt)('{}', 'sample context', 'developer');
    assert(devPrompt.includes('PROFESSIONAL DEVELOPER'), 'Developer mode contains developer prompt instructions');
    const begPrompt = (0, prompts_1.buildChatSystemPrompt)('{}', 'sample context', 'beginner');
    assert(begPrompt.includes('BEGINNER / CONCEPTUAL'), 'Beginner mode contains plain language instructions');
    const intPrompt = (0, prompts_1.buildChatSystemPrompt)('{}', 'sample context', 'interview');
    assert(intPrompt.includes('SYSTEM DESIGN INTERVIEW'), 'Interview mode contains scalability & trade-offs instructions');
    // TEST GROUP 8: Dynamic Distinctness Verification (Project A vs Project B)
    console.log('\n[TEST GROUP 8]: Dynamic Distinctness Verification (Project A vs Project B)');
    const compIdsA = demo_projects_1.DEMO_PROJECT_SHOPSTREAM.components.map((c) => c.id);
    const compIdsB = demo_projects_1.DEMO_PROJECT_COLLABCANVAS.components.map((c) => c.id);
    const sharedCompIds = compIdsA.filter((id) => compIdsB.includes(id));
    assert(sharedCompIds.length === 0, 'Project A and Project B have 0 overlapping component IDs');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.project.name !== demo_projects_1.DEMO_PROJECT_COLLABCANVAS.project.name, 'Project names are completely distinct');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.project.technologies.frontend[0] !== demo_projects_1.DEMO_PROJECT_COLLABCANVAS.project.technologies.frontend[0], 'Frontends are distinct (Next.js vs Flutter)');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.connections[0].communication_method !== demo_projects_1.DEMO_PROJECT_COLLABCANVAS.connections[0].communication_method, 'Protocols are distinct (HTTPS vs WSS)');
    assert(demo_projects_1.DEMO_PROJECT_SHOPSTREAM.databases[0].name !== demo_projects_1.DEMO_PROJECT_COLLABCANVAS.databases[0].name, 'Databases are distinct (PostgreSQL/MongoDB vs Redis State Store)');
    // TEST GROUP 9: Architecture Schema Validation (Zod)
    console.log('\n[TEST GROUP 9]: Architecture Schema Validation (Zod)');
    const parsedA = schema_1.ArchitectureOutputSchema.safeParse({
        project: demo_projects_1.DEMO_PROJECT_SHOPSTREAM.project,
        components: demo_projects_1.DEMO_PROJECT_SHOPSTREAM.components,
        connections: demo_projects_1.DEMO_PROJECT_SHOPSTREAM.connections,
        databases: demo_projects_1.DEMO_PROJECT_SHOPSTREAM.databases,
        apis: demo_projects_1.DEMO_PROJECT_SHOPSTREAM.apis,
        data_flows: demo_projects_1.DEMO_PROJECT_SHOPSTREAM.data_flows,
        unknowns: demo_projects_1.DEMO_PROJECT_SHOPSTREAM.unknowns,
        observations: demo_projects_1.DEMO_PROJECT_SHOPSTREAM.observations,
    });
    assert(parsedA.success, 'Project A data passes Zod validation');
    const parsedB = schema_1.ArchitectureOutputSchema.safeParse({
        project: demo_projects_1.DEMO_PROJECT_COLLABCANVAS.project,
        components: demo_projects_1.DEMO_PROJECT_COLLABCANVAS.components,
        connections: demo_projects_1.DEMO_PROJECT_COLLABCANVAS.connections,
        databases: demo_projects_1.DEMO_PROJECT_COLLABCANVAS.databases,
        apis: demo_projects_1.DEMO_PROJECT_COLLABCANVAS.apis,
        data_flows: demo_projects_1.DEMO_PROJECT_COLLABCANVAS.data_flows,
        unknowns: demo_projects_1.DEMO_PROJECT_COLLABCANVAS.unknowns,
        observations: demo_projects_1.DEMO_PROJECT_COLLABCANVAS.observations,
    });
    assert(parsedB.success, 'Project B data passes Zod validation');
    console.log('\n======================================================');
    console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');
    if (failed > 0) {
        process.exit(1);
    }
}
runAllTests().catch((err) => {
    console.error('Test suite error:', err);
    process.exit(1);
});
