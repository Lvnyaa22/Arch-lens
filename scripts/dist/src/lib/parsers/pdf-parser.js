"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePdfBuffer = parsePdfBuffer;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
async function parsePdfBuffer(buffer) {
    const pages = [];
    try {
        const options = {
            pagerender: function (pageData) {
                return pageData.getTextContent({
                    normalizeWhitespace: false,
                    disableCombineTextItems: false,
                }).then(function (textContent) {
                    let lastY;
                    let text = '';
                    for (const item of textContent.items) {
                        if (lastY === item.transform[5] || lastY === undefined) {
                            text += item.str + ' ';
                        }
                        else {
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
        const data = await (0, pdf_parse_1.default)(buffer, options);
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
    }
    catch (error) {
        console.log('PDF-PARSER ERROR 1:', error);
        // If custom page renderer had an issue, attempt standard parse
        try {
            const standardData = await (0, pdf_parse_1.default)(buffer);
            return {
                text: standardData.text.trim(),
                pageCount: standardData.numpages || 1,
                pages: [{ pageNumber: 1, text: standardData.text.trim() }],
            };
        }
        catch (innerError) {
            console.log('PDF-PARSER INNER ERROR:', innerError);
            throw new Error(`Failed to parse PDF document: ${innerError.message || error.message}`);
        }
    }
}
