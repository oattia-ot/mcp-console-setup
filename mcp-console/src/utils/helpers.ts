import type { Tool } from '../types';

/**
 * Rough approximation: ~4 chars per token (GPT/Llama convention)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Generate a formatted tools list string for prompt injection.
 * This is a key professional pattern: making the LLM "tool-aware".
 */
export function generateToolsContext(tools: Tool[]): string {
  const enabledTools = tools.filter(t => t.enabled);
  if (enabledTools.length === 0) return 'No tools currently enabled.';

  return enabledTools
    .map(tool => `- ${tool.name} (${tool.category}): ${tool.desc}`)
    .join('\n');
}

/**
 * Simple ID generator for new entities (users, etc.)
 */
export function generateId(): number {
  return Date.now();
}

/**
 * Format timestamp for sync logs etc.
 */
export function getCurrentUTCTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}