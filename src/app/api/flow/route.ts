import { NextRequest, NextResponse } from 'next/server';
import { generateAdHocFlow } from '@/lib/ai/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const customApiKey = req.headers.get('x-gemini-api-key');
    const { query, projectSummary, documentContext } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Flow query description is required.' },
        { status: 400 }
      );
    }

    const summaryStr = typeof projectSummary === 'string'
      ? projectSummary
      : JSON.stringify(projectSummary, null, 2);

    const docStr = documentContext || '';

    const flow = await generateAdHocFlow(
      summaryStr,
      docStr,
      query,
      customApiKey
    );

    return NextResponse.json(flow, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/flow:', error);
    const message = error.message || 'Failed to generate flow.';
    let status = 500;
    if (message.startsWith('MISSING_API_KEY')) status = 401;
    if (message.startsWith('INVALID_API_KEY')) status = 403;
    if (message.startsWith('RATE_LIMIT')) status = 429;
    return NextResponse.json({ error: message }, { status });
  }
}
