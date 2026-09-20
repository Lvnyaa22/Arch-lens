import { NextRequest, NextResponse } from 'next/server';
import { askProjectChat } from '@/lib/ai/gemini';
import { DocumentChunk, ExplanationMode } from '@/types/architecture';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const customApiKey = req.headers.get('x-gemini-api-key');
    const { question, projectSummary, documentContext, chunks, mode } = await req.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required.' },
        { status: 400 }
      );
    }

    if (!documentContext && !projectSummary && (!chunks || chunks.length === 0)) {
      return NextResponse.json(
        { error: 'Project context or chunks are required to answer questions.' },
        { status: 400 }
      );
    }

    const summaryStr = typeof projectSummary === 'string'
      ? projectSummary
      : JSON.stringify(projectSummary, null, 2);

    const docStr = documentContext || '';
    const chunkList: DocumentChunk[] = Array.isArray(chunks) ? chunks : [];
    const explanationMode: ExplanationMode = mode || 'developer';

    const result = await askProjectChat(
      summaryStr,
      chunkList,
      docStr,
      question,
      explanationMode,
      customApiKey
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const message = error.message || 'Failed to generate answer.';
    let status = 500;
    if (message.startsWith('MISSING_API_KEY')) status = 401;
    if (message.startsWith('INVALID_API_KEY')) status = 403;
    if (message.startsWith('RATE_LIMIT')) status = 429;
    return NextResponse.json({ error: message }, { status });
  }
}
