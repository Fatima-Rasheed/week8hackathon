import { Injectable } from '@nestjs/common';
import { run, setDefaultOpenAIClient, setTracingDisabled } from '@openai/agents';
import OpenAI from 'openai';
import { DocumentsService } from '../documents/documents.service';
import { createRouterAgent } from './definitions/router.agent';
import { createDocumentAnalysisAgent } from './definitions/document-analysis.agent';
import { createSummaryAgent } from './definitions/summary.agent';
import { createQAAgent } from './definitions/qa.agent';
import { runInputGuardrail, runOutputGuardrail } from './guardrails/document-grounded.guardrail';

@Injectable()
export class AgentsService {
  constructor(private readonly documentsService: DocumentsService) {
    setDefaultOpenAIClient(
      new OpenAI({
        apiKey: process.env.GROQ_API_KEY || '',
        baseURL: 'https://api.groq.com/openai/v1',
      }) as any,
    );
    setTracingDisabled(true);
  }

  /**
   * Analyze a document — runs Document Analysis Agent
   */
  async analyzeDocument(documentId: string) {
    const doc = await this.documentsService.findById(documentId);

    const analysisAgent = createDocumentAnalysisAgent(doc.extractedText);
    const result = await run(analysisAgent, 'Analyze this document completely.', {
      maxTurns: 10,
      stream: false,
    } as any);

    let parsed: any = {};
    try {
      const raw = result.finalOutput as string;
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      parsed = { documentType: 'Unknown', sections: [], themes: [], entities: [] };
    }

    await this.documentsService.updateAnalysis(documentId, {
      documentType: parsed.documentType || 'Unknown',
      sections: parsed.sections || [],
      themes: parsed.themes || [],
      entities: parsed.entities || [],
      analysisResult: JSON.stringify(parsed),
    });

    return parsed;
  }

  /**
   * Main Q&A flow — Router → Specialized Agent
   * This is the mandatory handoff flow.
   */
  async chat(documentId: string, userQuery: string) {
    const doc = await this.documentsService.findById(documentId);

    // === GUARDRAIL: Input check (outside prompts) ===
    const inputCheck = runInputGuardrail(userQuery);
    if (!inputCheck.allowed) {
      return { answer: inputCheck.reason, intent: 'blocked', foundInDocument: false };
    }

    // === STEP 1: Router Agent — classify intent ===
    const routerAgent = createRouterAgent();
    const routerResult = await run(
      routerAgent,
      `User query: "${userQuery}"\nDocument type: "${doc.documentType || 'Unknown'}"`,
      { maxTurns: 3, stream: false } as any,
    );

    let routerOutput: { intent: string; reason: string; sanitizedQuery: string };
    try {
      const raw = routerResult.finalOutput as string;
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      routerOutput = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { intent: 'qa', reason: 'fallback', sanitizedQuery: userQuery };
    } catch {
      routerOutput = { intent: 'qa', reason: 'parse error fallback', sanitizedQuery: userQuery };
    }

    console.log(`[Router] Intent: ${routerOutput.intent} | Reason: ${routerOutput.reason}`);

    // === GUARDRAIL: Output check on router decision ===
    const outputCheck = runOutputGuardrail(routerResult.finalOutput as string, routerOutput.intent);
    if (!outputCheck.allowed) {
      return { answer: outputCheck.reason, intent: routerOutput.intent, foundInDocument: false };
    }

    // === STEP 2: Handoff to specialized agent based on router decision ===
    let finalAnswer: any = {};

    if (routerOutput.intent === 'summary') {
      // Handoff → Summary Agent
      console.log('[Handoff] Router → SummaryAgent');
      const summaryAgent = createSummaryAgent(doc.extractedText, doc.documentType || 'Unknown');
      const summaryResult = await run(summaryAgent, routerOutput.sanitizedQuery, { maxTurns: 8, stream: false } as any);
      try {
        const raw = summaryResult.finalOutput as string;
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        finalAnswer = jsonMatch ? JSON.parse(jsonMatch[0]) : { executiveSummary: raw };
      } catch {
        finalAnswer = { executiveSummary: summaryResult.finalOutput };
      }
      return { ...finalAnswer, intent: 'summary' };

    } else if (routerOutput.intent === 'analysis') {
      // Handoff → Document Analysis Agent
      console.log('[Handoff] Router → DocumentAnalysisAgent');
      const analysisAgent = createDocumentAnalysisAgent(doc.extractedText);
      const analysisResult = await run(analysisAgent, routerOutput.sanitizedQuery, { maxTurns: 10, stream: false } as any);
      try {
        const raw = analysisResult.finalOutput as string;
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        finalAnswer = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: raw };
      } catch {
        finalAnswer = { summary: analysisResult.finalOutput };
      }
      return { ...finalAnswer, intent: 'analysis' };

    } else {
      // Default: Handoff → Q&A Agent
      console.log('[Handoff] Router → QAAgent');
      const qaAgent = createQAAgent(doc.extractedText);
      const qaResult = await run(qaAgent, routerOutput.sanitizedQuery, { maxTurns: 8, stream: false } as any);
      try {
        const raw = qaResult.finalOutput as string;
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        finalAnswer = jsonMatch ? JSON.parse(jsonMatch[0]) : { answer: raw, foundInDocument: true };
      } catch {
        finalAnswer = { answer: qaResult.finalOutput, foundInDocument: true };
      }
      return { ...finalAnswer, intent: 'qa' };
    }
  }
}
