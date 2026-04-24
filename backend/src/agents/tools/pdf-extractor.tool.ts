import { tool } from '@openai/agents';
import { z } from 'zod';

/**
 * Tool 1: PDF Text Extractor
 * Returns the full extracted text of a document (already stored in DB).
 * The text is injected at runtime via closure.
 */
export function createPdfExtractorTool(extractedText: string) {
  return tool({
    name: 'get_document_text',
    description: 'Returns the full extracted text content of the uploaded PDF document.',
    parameters: z.object({}),
    execute: async () => {
      const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
      return JSON.stringify({
        text: extractedText.slice(0, 8000), // cap to avoid token overflow
        totalWords: wordCount,
        truncated: extractedText.length > 8000,
      });
    },
  });
}
