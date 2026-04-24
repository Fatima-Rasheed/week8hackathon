import { Agent } from '@openai/agents';
import { createPdfExtractorTool } from '../tools/pdf-extractor.tool';
import { createSectionLocatorTool } from '../tools/section-locator.tool';
import { createTokenCounterTool } from '../tools/token-counter.tool';

/**
 * Agent 2: Document Analysis Agent
 * - Reads the PDF text
 * - Identifies document type
 * - Extracts sections, themes, entities
 */
export function createDocumentAnalysisAgent(extractedText: string): Agent {
  return new Agent({
    name: 'DocumentAnalysisAgent',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    instructions: `You are a document analysis expert. Your job is to deeply analyze a PDF document.

Use the available tools to:
1. Call get_document_text to read the document content
2. Call count_tokens to understand document size
3. Call locate_section to find key sections like Abstract, Introduction, Conclusion

After using the tools, return a JSON object with this EXACT structure:
{
  "documentType": "Research Paper | Business Report | Legal/Policy | Manual/Guide | Other",
  "sections": ["list of section names found"],
  "themes": ["list of main themes/topics"],
  "entities": ["list of important names, organizations, dates, numbers"],
  "summary": "2-3 sentence overview of what this document is about"
}

Rules:
- ONLY use information from the document text
- Be specific and accurate
- Always return valid JSON`,
    tools: [
      createPdfExtractorTool(extractedText),
      createSectionLocatorTool(extractedText),
      createTokenCounterTool(extractedText),
    ],
  });
}
