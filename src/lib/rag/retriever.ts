import { DocumentChunk } from '@/types/architecture';

export interface ScoredChunk {
  chunk: DocumentChunk;
  score: number;
}

const STOP_WORDS = new Set([
  'how', 'does', 'work', 'what', 'when', 'where', 'is', 'are', 'the', 'and', 'or', 'in',
  'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'through', 'which', 'a', 'an', 'this',
  'that', 'these', 'those', 'can', 'could', 'should', 'would', 'do', 'did', 'done', 'system',
  'project', 'explain', 'tell', 'me', 'about', 'service', 'services'
]);

// Tokenize text into normalized word stems
function tokenize(text: string, filterStopWords: boolean = true): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (filterStopWords) {
    const filtered = words.filter((w) => !STOP_WORDS.has(w));
    return filtered.length > 0 ? filtered : words;
  }
  return words;
}

// In-Memory TF-IDF & Keyword BM25 Hybrid Retriever
export function retrieveRelevantChunks(
  query: string,
  chunks: DocumentChunk[],
  topK: number = 5
): ScoredChunk[] {
  if (!chunks || chunks.length === 0) return [];

  const queryTokens = tokenize(query, true);
  if (queryTokens.length === 0) {
    return chunks.slice(0, topK).map((c) => ({ chunk: c, score: 1.0 }));
  }

  // Calculate Document Frequencies (DF)
  const df: Record<string, number> = {};
  const chunkTokenSets = chunks.map((c) => {
    const tokens = new Set(tokenize(c.content + ' ' + c.pageOrSection + ' ' + c.fileName, false));
    tokens.forEach((t) => {
      df[t] = (df[t] || 0) + 1;
    });
    return tokens;
  });

  const N = chunks.length;

  const scored: ScoredChunk[] = chunks.map((chunk, idx) => {
    const tokenSet = chunkTokenSets[idx];
    const rawTokens = tokenize(chunk.content + ' ' + chunk.pageOrSection, false);
    const contentLower = (chunk.content + ' ' + chunk.pageOrSection).toLowerCase();
    const length = rawTokens.length || 1;

    // Term frequencies
    const tf: Record<string, number> = {};
    for (let i = 0; i < rawTokens.length; i++) {
      const t = rawTokens[i];
      tf[t] = (tf[t] || 0) + 1;
    }

    let score = 0;
    for (let j = 0; j < queryTokens.length; j++) {
      const q = queryTokens[j];

      // Exact token match
      if (tokenSet.has(q)) {
        const idf = Math.log((N - (df[q] || 0) + 0.5) / ((df[q] || 0) + 0.5) + 1);
        const termFreq = tf[q] || 0;
        const bm25Term = (termFreq * (1.2 + 1)) / (termFreq + 1.2 * (0.25 + 0.75 * (length / 250)));
        score += (idf + 1.5) * bm25Term * 2.5;
      } else {
        // Substring / prefix match (e.g. "auth" matches "authentication", "store" matches "storage")
        if (contentLower.includes(q) || (q.length >= 4 && contentLower.includes(q.slice(0, 4)))) {
          score += 1.5;
        }
      }
    }

    // Exact phrase bonus
    if (contentLower.includes(query.toLowerCase().trim())) {
      score += 5.0;
    }

    return { chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
