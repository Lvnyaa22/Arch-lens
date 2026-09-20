"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeminiApiKey = getGeminiApiKey;
exports.createGeminiClient = createGeminiClient;
exports.cleanJsonString = cleanJsonString;
exports.analyzeProjectDocumentation = analyzeProjectDocumentation;
exports.askProjectChat = askProjectChat;
exports.generateAdHocFlow = generateAdHocFlow;
const generative_ai_1 = require("@google/generative-ai");
const schema_1 = require("./schema");
const prompts_1 = require("./prompts");
function getGeminiApiKey(customKey) {
    const key = customKey ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.GOOGLE_GENAI_API_KEY;
    if (!key || key.trim() === '') {
        throw new Error('MISSING_API_KEY: Google Gemini API key is not configured. Please set GEMINI_API_KEY in .env.local or enter your API key using the Key icon in the ArchLens navigation bar.');
    }
    return key.trim();
}
function createGeminiClient(customKey) {
    const apiKey = getGeminiApiKey(customKey);
    return new generative_ai_1.GoogleGenerativeAI(apiKey);
}
// Clean JSON markdown blocks if model wraps output
function cleanJsonString(raw) {
    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
    }
    else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
    }
    return cleaned.trim();
}
async function analyzeProjectDocumentation(documentText, fileName, customApiKey) {
    const genAI = createGeminiClient(customApiKey);
    // Default to gemini-1.5-flash which is widely supported and fast
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: prompts_1.ARCHITECTURE_ANALYSIS_SYSTEM_PROMPT,
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1, // low temperature for precise factual extraction
        },
    });
    const prompt = (0, prompts_1.buildAnalysisUserPrompt)(documentText, fileName);
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = cleanJsonString(text);
        const parsedJson = JSON.parse(cleaned);
        // Validate with Zod
        const validated = schema_1.ArchitectureOutputSchema.parse(parsedJson);
        // Ensure all connections refer to valid component IDs
        const componentIds = new Set(validated.components.map((c) => c.id));
        const validConnections = validated.connections.filter((conn) => {
            return componentIds.has(conn.source) && componentIds.has(conn.target);
        });
        return {
            ...validated,
            connections: validConnections,
        };
    }
    catch (error) {
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
async function askProjectChat(projectSummaryJson, documentContext, userQuestion, customApiKey) {
    const genAI = createGeminiClient(customApiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: (0, prompts_1.buildChatSystemPrompt)(projectSummaryJson, documentContext),
        generationConfig: {
            temperature: 0.2,
        },
    });
    try {
        const result = await model.generateContent(userQuestion);
        const answer = result.response.text();
        // Extract citations like [Page X] or [Source: Page X]
        const citations = [];
        const matches = answer.match(/\[(?:Source:\s*)?Page\s*(\d+)[^\]]*\]/gi);
        if (matches) {
            for (const m of matches) {
                if (!citations.includes(m))
                    citations.push(m);
            }
        }
        return { answer, citations };
    }
    catch (error) {
        if (error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('Gemini rate limit reached. Please wait a moment before sending another query.');
        }
        throw error;
    }
}
async function generateAdHocFlow(projectSummaryJson, documentContext, query, customApiKey) {
    const genAI = createGeminiClient(customApiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
        },
    });
    const prompt = (0, prompts_1.buildAdHocFlowPrompt)(projectSummaryJson, documentContext, query);
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = cleanJsonString(text);
        const parsed = JSON.parse(cleaned);
        return schema_1.DataFlowSchema.parse(parsed);
    }
    catch (error) {
        throw new Error(`Failed to generate custom flow: ${error.message}`);
    }
}
