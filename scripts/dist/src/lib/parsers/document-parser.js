"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_EXTENSIONS = exports.MAX_FILE_SIZE_BYTES = void 0;
exports.parseUploadedDocument = parseUploadedDocument;
const pdf_parser_1 = require("./pdf-parser");
const text_parser_1 = require("./text-parser");
const docx_parser_1 = require("./docx-parser");
exports.MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB limit
exports.SUPPORTED_EXTENSIONS = [
    '.pdf',
    '.docx',
    '.txt',
    '.md',
    '.markdown',
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.py',
    '.go',
    '.java',
    '.rs',
    '.rb',
    '.json',
    '.yaml',
    '.yml',
    '.sql',
    '.html',
    '.css',
    '.env',
    '.dockerfile',
    'dockerfile',
    'readme',
];
async function parseUploadedDocument(fileBuffer, fileName, mimeType) {
    if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error('Uploaded file is completely empty (0 bytes).');
    }
    if (fileBuffer.length > exports.MAX_FILE_SIZE_BYTES) {
        throw new Error(`File size (${(fileBuffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 25MB.`);
    }
    const lowerName = fileName.toLowerCase();
    // 1. PDF Documents
    if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
        return await (0, pdf_parser_1.parsePdfBuffer)(fileBuffer);
    }
    // 2. Microsoft Word Documents (.docx)
    if (lowerName.endsWith('.docx') ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await (0, docx_parser_1.parseDocxBuffer)(fileBuffer, fileName);
    }
    // 3. Text, Markdown, and Source Code files
    const isTextOrCode = exports.SUPPORTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext) || lowerName === ext) ||
        mimeType?.startsWith('text/') ||
        mimeType === 'application/json' ||
        mimeType === 'application/javascript';
    if (isTextOrCode) {
        const text = fileBuffer.toString('utf-8');
        return await (0, text_parser_1.parseTextContent)(text, fileName);
    }
    throw new Error(`Unsupported file format: "${fileName}". ArchLens supports PDF, DOCX, Markdown (.md), Plain text (.txt), and source code files (.ts, .py, .go, .java, etc.).`);
}
