import pdfParse from 'pdf-parse';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedDocument {
  text: string;
  pageCount: number;
  pages: ExtractedPage[];
}

export async function parsePdfBuffer(buffer: Buffer): Promise<ExtractedDocument> {
  const pages: ExtractedPage[] = [];

  try {
    const options = {
      pagerender: function (pageData: any) {
        return pageData.getTextContent({
          normalizeWhitespace: false,
          disableCombineTextItems: false,
        }).then(function (textContent: any) {
          let lastY: number | undefined;
          let text = '';
          for (const item of textContent.items) {
            if (lastY === item.transform[5] || lastY === undefined) {
              text += item.str + ' ';
            } else {
              text += '\n' + item.str + ' ';
            }
            lastY = item.transform[5];
          }

          const pageNum = (pageData.pageIndex ?? pages.length) + 1;
          const cleanText = text.trim();
          pages.push({
            pageNumber: pageNum,
            text: cleanText,
          });

          return `\n\n--- [Page ${pageNum}] ---\n\n${cleanText}\n`;
        });
      },
    };

    const data = await pdfParse(buffer, options);

    // Fallback if pages array didn't populate for any reason
    if (pages.length === 0 && data.text) {
      pages.push({
        pageNumber: 1,
        text: data.text.trim(),
      });
    }

    return {
      text: data.text.trim(),
      pageCount: data.numpages || (pages.length > 0 ? pages.length : 1),
      pages,
    };
  } catch (error: any) {
    console.error('Initial pdfParse error:', error);
    // If custom page renderer had an issue, attempt standard parse
    try {
      const standardData = await pdfParse(buffer);
      return {
        text: standardData.text.trim(),
        pageCount: standardData.numpages || 1,
        pages: [{ pageNumber: 1, text: standardData.text.trim() }],
      };
    } catch (innerError: any) {
      console.error('Inner pdfParse error:', innerError);
      throw new Error(`Failed to parse PDF document: ${innerError.message || error.message}`);
    }
  }
}
