import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ArchitectureOutputSchema,
  ArchitectureOutput,
  DataFlowSchema,
} from './schema';
import {
  ARCHITECTURE_ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisUserPrompt,
  buildChatSystemPrompt,
  buildAdHocFlowPrompt,
} from './prompts';
import { DocumentChunk, ExplanationMode } from '@/types/architecture';
import { retrieveRelevantChunks } from '../rag/retriever';

export function getGeminiApiKey(customKey?: string | null): string {
  const key =
    customKey ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;

  if (!key || key.trim() === '') {
    throw new Error(
      'MISSING_API_KEY: Google Gemini API key is not configured. Please set GEMINI_API_KEY in .env.local or enter your API key using the Key icon in the ArchLens navigation bar.'
    );
  }
  return key.trim();
}

export function createGeminiClient(customKey?: string | null) {
  const apiKey = getGeminiApiKey(customKey);
  return new GoogleGenerativeAI(apiKey);
}

// Clean JSON markdown blocks if model wraps output
export function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

export async function analyzeProjectDocumentation(
  documentText: string,
  fileName: string,
  customApiKey?: string | null
): Promise<ArchitectureOutput> {
  const genAI = createGeminiClient(customApiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: ARCHITECTURE_ANALYSIS_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1, // low temperature for precise factual extraction
    },
  });

  const prompt = buildAnalysisUserPrompt(documentText, fileName);

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = cleanJsonString(text);
    const parsedJson = JSON.parse(cleaned);

    // Validate with Zod
    const validated = ArchitectureOutputSchema.parse(parsedJson);

    // Ensure all connections refer to valid component IDs
    const componentIds = new Set(validated.components.map((c) => c.id));
    const validConnections = validated.connections.filter((conn) => {
      return componentIds.has(conn.source) && componentIds.has(conn.target);
    });

    return {
      ...validated,
      connections: validConnections,
    };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw new Error(`AI generated invalid schema structure: ${error.message}`);
    }
    if (error.message?.includes('API_KEY_INVALID') || error.status === 400) {
      throw new Error('INVALID_API_KEY: The provided Gemini API Key is invalid or expired.');
    }
    if (error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('RATE_LIMIT: Gemini API rate limit exceeded. Please retry in a few seconds.');
    }
    throw error;
  }
}

export async function askProjectChat(
  projectSummaryJson: string,
  chunks: DocumentChunk[],
  rawDocumentText: string,
  userQuestion: string,
  mode: ExplanationMode = 'developer',
  customApiKey?: string | null
): Promise<{ answer: string; citations: string[]; referencedChunks: DocumentChunk[] }> {
  const genAI = createGeminiClient(customApiKey);

  // RAG: Retrieve top-6 most relevant chunks for this specific question
  const scored = retrieveRelevantChunks(userQuestion, chunks, 6);
  const referencedChunks = scored.map((s) => s.chunk);

  let contextSnippet = '';
  if (referencedChunks.length > 0) {
    contextSnippet = referencedChunks
      .map((c) => `[Chunk: ${c.id} | ${c.fileName} (${c.pageOrSection})]\n${c.content}`)
      .join('\n\n---\n\n');
  } else {
    contextSnippet = rawDocumentText.slice(0, 25000);
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: buildChatSystemPrompt(projectSummaryJson, contextSnippet, mode),
    generationConfig: {
      temperature: mode === 'beginner' ? 0.3 : 0.15,
    },
  });

  try {
    const result = await model.generateContent(userQuestion);
    const answer = result.response.text();

    // Extract citations
    const citations: string[] = [];
    const matches = answer.match(/\[(?:Source:\s*)?([^\]]+)\]/gi);
    if (matches) {
      for (const m of matches) {
        if (!citations.includes(m)) citations.push(m);
      }
    }

    // Add source files/pages from referenced chunks if not already present
    for (const c of referencedChunks) {
      const citeStr = `${c.fileName} (${c.pageOrSection})`;
      if (!citations.includes(citeStr)) {
        citations.push(citeStr);
      }
    }

    return { answer, citations, referencedChunks };
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Gemini rate limit reached. Please wait a moment before sending another query.');
    }
    throw error;
  }
}

export async function generateAdHocFlow(
  projectSummaryJson: string,
  documentContext: string,
  query: string,
  customApiKey?: string | null
) {
  const genAI = createGeminiClient(customApiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  const prompt = buildAdHocFlowPrompt(projectSummaryJson, documentContext, query);

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = cleanJsonString(text);
    const parsed = JSON.parse(cleaned);
    return DataFlowSchema.parse(parsed);
  } catch (error: any) {
    throw new Error(`Failed to generate custom flow: ${error.message}`);
  }
}
