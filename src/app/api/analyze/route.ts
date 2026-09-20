import { NextRequest, NextResponse } from 'next/server';
import { parseUploadedDocument } from '@/lib/parsers/document-parser';
import { analyzeProjectDocumentation } from '@/lib/ai/gemini';
import { chunkDocument } from '@/lib/rag/chunker';
import { ArchitectureAnalysis } from '@/types/architecture';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const customApiKey = req.headers.get('x-gemini-api-key');

    let fileBuffer: Buffer | null = null;
    let fileName = 'uploaded-document.pdf';
    let mimeType = 'application/pdf';
    let rawText: string | null = null;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { error: 'No file was provided in the upload form.' },
          { status: 400 }
        );
      }

      fileName = file.name;
      mimeType = file.type;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes('application/json')) {
      const json = await req.json();
      if (!json.text) {
        return NextResponse.json(
          { error: 'Invalid JSON request: "text" field is required.' },
          { status: 400 }
        );
      }
      rawText = json.text;
      fileName = json.fileName || 'project-document.txt';
    } else {
      return NextResponse.json(
        { error: 'Unsupported Content-Type. Please use multipart/form-data or application/json.' },
        { status: 400 }
      );
    }

    // Extract text from document
    let extracted;
    if (fileBuffer) {
      extracted = await parseUploadedDocument(fileBuffer, fileName, mimeType);
    } else if (rawText) {
      extracted = {
        text: rawText,
        pageCount: 1,
        pages: [{ pageNumber: 1, text: rawText }],
      };
    } else {
      return NextResponse.json(
        { error: 'Unable to extract document content.' },
        { status: 400 }
      );
    }

    if (!extracted.text || extracted.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'The document does not contain readable text content.' },
        { status: 400 }
      );
    }

    // Generate semantic chunks for vector / RAG retrieval
    const chunks = chunkDocument(extracted, fileName);

    // Call Gemini for structured architecture extraction
    const aiResult = await analyzeProjectDocumentation(
      extracted.text,
      fileName,
      customApiKey
    );

    // Calculate confidence metrics
    const explicitCount = aiResult.components.filter((c) => c.confidence === 'explicit').length;
    const inferredCount = aiResult.components.filter((c) => c.confidence === 'inferred').length;
    const unknownCount = aiResult.unknowns.length;

    const fullAnalysis: ArchitectureAnalysis = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      uploadedAt: new Date().toISOString(),
      fileName,
      fileSize: fileBuffer ? fileBuffer.length : (rawText?.length || 0),
      documentText: extracted.text,
      pageCount: extracted.pageCount,
      chunks,
      project: aiResult.project,
      components: aiResult.components,
      connections: aiResult.connections,
      databases: aiResult.databases,
      apis: aiResult.apis,
      data_flows: aiResult.data_flows,
      unknowns: aiResult.unknowns,
      observations: aiResult.observations,
      confidence_summary: {
        explicit_count: explicitCount,
        inferred_count: inferredCount,
        unknown_count: unknownCount,
      },
    };

    return NextResponse.json(fullAnalysis, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/analyze:', error);
    const message = error.message || 'Internal server error while processing document.';

    let status = 500;
    if (message.startsWith('MISSING_API_KEY')) status = 401;
    if (message.startsWith('INVALID_API_KEY')) status = 403;
    if (message.startsWith('RATE_LIMIT')) status = 429;
    if (message.includes('exceeds maximum limit') || message.includes('empty')) status = 400;

    return NextResponse.json({ error: message }, { status });
  }
}
