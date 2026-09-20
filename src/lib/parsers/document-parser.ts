import { parsePdfBuffer, ExtractedDocument } from './pdf-parser';
import { parseTextContent } from './text-parser';
import { parseDocxBuffer } from './docx-parser';

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB limit

export const SUPPORTED_EXTENSIONS = [
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

export async function parseUploadedDocument(
  fileBuffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<ExtractedDocument> {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('Uploaded file is completely empty (0 bytes).');
  }

  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size (${(fileBuffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 25MB.`
    );
  }

  const lowerName = fileName.toLowerCase();

  // 1. PDF Documents
  if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
    return await parsePdfBuffer(fileBuffer);
  }

  // 2. Microsoft Word Documents (.docx)
  if (
    lowerName.endsWith('.docx') ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return await parseDocxBuffer(fileBuffer, fileName);
  }

  // 3. Text, Markdown, and Source Code files
  const isTextOrCode =
    SUPPORTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext) || lowerName === ext) ||
    mimeType?.startsWith('text/') ||
    mimeType === 'application/json' ||
    mimeType === 'application/javascript';

  if (isTextOrCode) {
    const text = fileBuffer.toString('utf-8');
    return await parseTextContent(text, fileName);
  }

  throw new Error(
    `Unsupported file format: "${fileName}". ArchLens supports PDF, DOCX, Markdown (.md), Plain text (.txt), and source code files (.ts, .py, .go, .java, etc.).`
  );
}
