/**
 * Guardrail: Document-Grounded Check
 * Runs OUTSIDE of prompts — validates that answers are document-grounded.
 * Blocks off-topic, unsafe, or hallucinated responses.
 */

const BLOCKED_PATTERNS = [
  /ignore (previous|all|above) instructions/i,
  /you are now/i,
  /pretend (you are|to be)/i,
  /jailbreak/i,
  /forget (your|the) (instructions|rules|context)/i,
];

const OFF_TOPIC_KEYWORDS = [
  'weather', 'stock price', 'sports score', 'celebrity', 'recipe',
  'lottery', 'horoscope', 'news today', 'current events',
];

export interface GuardrailResult {
  allowed: boolean;
  reason?: string;
}

export function runInputGuardrail(userQuery: string): GuardrailResult {
  // Check for prompt injection attempts
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(userQuery)) {
      return { allowed: false, reason: 'Prompt injection attempt detected. Request blocked.' };
    }
  }

  // Check for clearly off-topic queries
  const lowerQuery = userQuery.toLowerCase();
  for (const keyword of OFF_TOPIC_KEYWORDS) {
    if (lowerQuery.includes(keyword)) {
      return {
        allowed: false,
        reason: `This question appears unrelated to the document. I can only answer questions about the uploaded PDF.`,
      };
    }
  }

  return { allowed: true };
}

export function runOutputGuardrail(
  agentOutput: string,
  routerIntent: string,
): GuardrailResult {
  // If router said off_topic, block regardless of what agent returned
  if (routerIntent === 'off_topic') {
    return {
      allowed: false,
      reason: 'This question is not related to the document content. Please ask something about the uploaded PDF.',
    };
  }

  // Check if output is suspiciously short (possible failure)
  if (agentOutput.trim().length < 10) {
    return { allowed: false, reason: 'Agent returned an empty or invalid response.' };
  }

  return { allowed: true };
}
