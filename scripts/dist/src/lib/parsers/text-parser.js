"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTextContent = parseTextContent;
async function parseTextContent(content, fileName) {
    const cleanContent = content.trim();
    if (!cleanContent) {
        throw new Error('Document content is empty');
    }
    // Break text into logical pages if large (e.g. ~3000 chars or section headers)
    // or preserve markdown headers as sections
    const lines = cleanContent.split('\n');
    const pages = [];
    let currentPageText = [];
    let pageNum = 1;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        currentPageText.push(line);
        // If section header or ~60 lines reached
        if (currentPageText.length >= 60 || (line.startsWith('# ') && currentPageText.length > 20)) {
            pages.push({
                pageNumber: pageNum,
                text: currentPageText.join('\n').trim(),
            });
            pageNum++;
            currentPageText = [];
        }
    }
    if (currentPageText.length > 0) {
        pages.push({
            pageNumber: pageNum,
            text: currentPageText.join('\n').trim(),
        });
    }
    const annotatedText = pages
        .map((p) => `\n\n--- [Page ${p.pageNumber}] ---\n\n${p.text}`)
        .join('\n');
    return {
        text: annotatedText.trim(),
        pageCount: pages.length,
        pages,
    };
}
