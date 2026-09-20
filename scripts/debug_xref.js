const fs = require('fs');
const path = require('path');
const { parseUploadedDocument } = require('./dist/src/lib/parsers/document-parser');
const { chunkDocument } = require('./dist/src/lib/rag/chunker');
const { retrieveRelevantChunks } = require('./dist/src/lib/rag/retriever');
const { ArchitectureOutputSchema } = require('./dist/src/lib/ai/schema');
const { buildChatSystemPrompt } = require('./dist/src/lib/ai/prompts');
const { DEMO_PROJECT_SHOPSTREAM, DEMO_PROJECT_COLLABCANVAS } = require('./dist/src/lib/demo/demo-projects');

let passed = 0;
let failed = 0;

function assert(condition, testName, detail) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
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
  const pdfAPath = path.resolve('test-docs/project-a-shopstream.pdf');
  const bufferA = fs.readFileSync(pdfAPath);
  const docA = await parseUploadedDocument(bufferA, 'project-a-shopstream.pdf');

  assert(docA.pageCount === 4, 'Project A should extract exactly 4 pages', `Extracted: ${docA.pageCount}`);
  assert(docA.text.includes('ShopStream Cloud'), 'Project A text contains "ShopStream Cloud"');
  assert(docA.text.includes('[Page 1]'), 'Project A preserves [Page 1] marker');
  assert(docA.text.includes('[Page 2]'), 'Project A preserves [Page 2] marker');
  assert(docA.text.includes('RabbitMQ'), 'Project A contains RabbitMQ');
  assert(docA.text.includes('MongoDB 7.0'), 'Project A contains MongoDB 7.0');

  console.log('Test 1 finished successfully');
}

runAllTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
