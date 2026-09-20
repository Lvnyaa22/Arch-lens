"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkDocument = chunkDocument;
function chunkDocument(extracted, fileName, targetChunkChars = 1800, overlapChars = 250) {
    const chunks = [];
    const ext = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() || 'txt' : 'txt';
    let globalChunkIndex = 1;
    // If pages are present, chunk with page awareness
    if (extracted.pages && extracted.pages.length > 0) {
        for (const page of extracted.pages) {
            const pageText = page.text.trim();
            if (!pageText)
                continue;
            if (pageText.length <= targetChunkChars) {
                chunks.push({
                    id: `chk-${globalChunkIndex++}`,
                    fileName,
                    fileType: ext,
                    pageOrSection: `Page ${page.pageNumber}`,
                    content: pageText,
                    tokenEstimate: Math.ceil(pageText.length / 4),
                });
            }
            else {
                // Sliding window chunking within the page
                let start = 0;
                let subIndex = 1;
                while (start < pageText.length) {
                    const end = Math.min(start + targetChunkChars, pageText.length);
                    const chunkSlice = pageText.slice(start, end).trim();
                    if (chunkSlice) {
                        chunks.push({
                            id: `chk-${globalChunkIndex++}`,
                            fileName,
                            fileType: ext,
                            pageOrSection: `Page ${page.pageNumber} (Part ${subIndex++})`,
                            content: chunkSlice,
                            tokenEstimate: Math.ceil(chunkSlice.length / 4),
                        });
                    }
                    if (end >= pageText.length)
                        break;
                    start += targetChunkChars - overlapChars;
                }
            }
        }
    }
    else {
        // Fallback: chunk overall text
        const fullText = extracted.text.trim();
        let start = 0;
        while (start < fullText.length) {
            const end = Math.min(start + targetChunkChars, fullText.length);
            const chunkSlice = fullText.slice(start, end).trim();
            if (chunkSlice) {
                chunks.push({
                    id: `chk-${globalChunkIndex++}`,
                    fileName,
                    fileType: ext,
                    pageOrSection: `Section ${chunks.length + 1}`,
                    content: chunkSlice,
                    tokenEstimate: Math.ceil(chunkSlice.length / 4),
                });
            }
            if (end >= fullText.length)
                break;
            start += targetChunkChars - overlapChars;
        }
    }
    return chunks;
}
