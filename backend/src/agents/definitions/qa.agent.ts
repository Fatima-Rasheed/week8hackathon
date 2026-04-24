import { Agent } from '@openai/agents';
import { createChunkRetrieverTool } from '../tools/chunk-retriever.tool';
import { createSectionLocatorTool } from '../tools/section-locator.tool';

/**
 * Agent 4: Q&A Agent
 * - Answers questions strictly from document content
 * - Uses chunk retriever to find relevant passages
 * - Refuses to answer if info not in document
 */
export function createQAAgent(extractedText: string): Agent {
  return new Agent({
    name: 'QAAgent',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    instructions: `You are a document Q&A specialist. You answer questions STRICTLY based on the provided document content.

When a question is asked:
1. Use retrieve_relevant_chunks to find relevant passages for the question
2. If needed, use locate_section to find specific sections
3. Answer based ONLY on what you find in the document

CRITICAL RULES:
- If the information is NOT in the document, respond exactly: "This information is not present in the document."
- NEVER use external knowledge or make up facts
- NEVER hallucinate — if unsure, say it's not in the document
- Always cite which part of the document your answer comes from

Response format (JSON):
{
  "answer": "Your answer here, or 'This information is not present in the document.'",
  "foundInDocument": true or false,
  "sourceHint": "Brief description of where in the document this was found, or null"
}`,
    tools: [
      createChunkRetrieverTool(extractedText),
      createSectionLocatorTool(extractedText),
    ],
  });
}
