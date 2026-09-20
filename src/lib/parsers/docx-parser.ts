import mammoth from 'mammoth';
import { ExtractedDocument, ExtractedPage } from './pdf-parser';

export async function parseDocxBuffer(buffer: Buffer, fileName: string): Promise<ExtractedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const fullText = result.value.trim();

    if (!fullText) {
      throw new Error('DOCX document contains no readable text.');
    }

    // Split paragraphs into sections / pages
    const paragraphs = fullText.split(/\n\s*\n/);
    const pages: ExtractedPage[] = [];
    let currentParagraphs: string[] = [];
    let pageNum = 1;

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;
      currentParagraphs.push(trimmed);

      if (currentParagraphs.length >= 8 || currentParagraphs.join('\n').length > 2500) {
        pages.push({
          pageNumber: pageNum,
          text: currentParagraphs.join('\n\n'),
        });
        pageNum++;
        currentParagraphs = [];
      }
    }

    if (currentParagraphs.length > 0) {
      pages.push({
        pageNumber: pageNum,
        text: currentParagraphs.join('\n\n'),
      });
    }

    const annotatedText = pages
      .map((p) => `\n\n--- [Page ${p.pageNumber}] ---\n\n${p.text}`)
      .join('\n');

    return {
      text: annotatedText.trim(),
      pageCount: pages.length || 1,
      pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: fullText }],
    };
  } catch (error: any) {
    throw new Error(`Failed to parse DOCX document: ${error.message}`);
  }
}
