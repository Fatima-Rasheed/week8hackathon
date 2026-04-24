import { Agent } from '@openai/agents';
import { createPdfExtractorTool } from '../tools/pdf-extractor.tool';
import { createSectionLocatorTool } from '../tools/section-locator.tool';

/**
 * Agent 3: Summary Agent
 * - Generates executive summary
 * - Adapts style to document type
 * - Produces bullet highlights
 */
export function createSummaryAgent(extractedText: string, documentType: string): Agent {
  return new Agent({
    name: 'SummaryAgent',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    instructions: `You are a professional document summarizer. The document type is: "${documentType}".

Use the available tools to read the document, then produce a summary adapted to the document type:

- Research Paper → Academic summary with methodology and findings
- Business Report → Executive summary with key metrics and recommendations  
- Legal/Policy → Key clauses, obligations, and important dates
- Manual/Guide → Main steps, purpose, and key instructions
- Other → General summary

Your response must be a JSON object:
{
  "executiveSummary": "3-5 sentence executive summary",
  "bulletHighlights": ["key point 1", "key point 2", "key point 3", "key point 4", "key point 5"],
  "documentType": "${documentType}",
  "keyTakeaway": "The single most important thing to know about this document"
}

Rules:
- ONLY use information from the document
- Do NOT invent facts
- Adapt tone to document type`,
    tools: [
      createPdfExtractorTool(extractedText),
      createSectionLocatorTool(extractedText),
    ],
  });
}
