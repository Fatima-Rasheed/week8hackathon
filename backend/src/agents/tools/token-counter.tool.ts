import { tool } from '@openai/agents';
import { z } from 'zod';

/**
 * Tool 4: Token / Word Counter
 * Returns word count and estimated token count for the document.
 */
export function createTokenCounterTool(extractedText: string) {
  return tool({
    name: 'count_tokens',
    description: 'Returns the word count and estimated token count of the document. Useful for understanding document size.',
    parameters: z.object({}),
    execute: async () => {
      const words = extractedText.split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const estimatedTokens = Math.ceil(wordCount * 1.33); // rough GPT token estimate
      const charCount = extractedText.length;
      const sentences = extractedText.split(/[.!?]+/).filter(Boolean).length;

      return JSON.stringify({ wordCount, estimatedTokens, charCount, sentences });
    },
  });
}
