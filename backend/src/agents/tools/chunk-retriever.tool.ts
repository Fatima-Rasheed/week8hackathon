import { tool } from '@openai/agents';
import { z } from 'zod';

/**
 * Tool 2: Chunk Retriever
 * Searches document text for chunks relevant to a query using keyword matching.
 */
export function createChunkRetrieverTool(extractedText: string) {
  return tool({
    name: 'retrieve_relevant_chunks',
    description:
      'Searches the document for text chunks relevant to a specific query or keyword. Use this to find specific information within the document.',
    parameters: z.object({
      query: z.string().describe('The search query or keywords to find in the document'),
    }),
    execute: async ({ query }) => {
      const chunkSize = 500;
      const chunks: string[] = [];

      for (let i = 0; i < extractedText.length; i += chunkSize) {
        chunks.push(extractedText.slice(i, i + chunkSize));
      }

      const queryWords = query.toLowerCase().split(/\s+/);
      const scored = chunks.map((chunk, idx) => {
        const lower = chunk.toLowerCase();
        const score = queryWords.reduce(
          (acc, word) => acc + (lower.includes(word) ? 1 : 0),
          0,
        );
        return { chunk, score, idx };
      });

      const relevant = scored
        .filter((c) => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map((c) => c.chunk);

      if (relevant.length === 0) {
        return JSON.stringify({ found: false, chunks: [], message: 'No relevant content found for this query.' });
      }

      return JSON.stringify({ found: true, chunks: relevant, count: relevant.length });
    },
  });
}
