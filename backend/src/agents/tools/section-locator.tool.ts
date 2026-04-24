import { tool } from '@openai/agents';
import { z } from 'zod';

/**
 * Tool 3: Section Locator
 * Finds and extracts a named section from the document.
 */
export function createSectionLocatorTool(extractedText: string) {
  return tool({
    name: 'locate_section',
    description:
      'Finds a specific named section in the document (e.g., "Introduction", "Conclusion", "Methodology", "Abstract"). Returns the section content.',
    parameters: z.object({
      sectionName: z.string().describe('The name of the section to locate'),
    }),
    execute: async ({ sectionName }) => {
      const lower = extractedText.toLowerCase();
      const sectionLower = sectionName.toLowerCase();

      const idx = lower.indexOf(sectionLower);
      if (idx === -1) {
        return JSON.stringify({ found: false, content: null, message: `Section "${sectionName}" not found in document.` });
      }

      // Extract ~1000 chars after the section heading
      const content = extractedText.slice(idx, idx + 1000).trim();
      return JSON.stringify({ found: true, sectionName, content });
    },
  });
}
