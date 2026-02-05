/**
 * Sanitizes user-supplied message content before sending to the LLM.
 * Reduces risk of prompt injection, control-character issues, and noise.
 */

const MAX_MESSAGE_LENGTH = 16_384;

/** Remove control characters except newline, carriage return, tab. */
function stripControlChars(s: string): string {
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/** Collapse multiple newlines/spaces into at most 2 newlines or 1 space. */
function normalizeWhitespace(s: string): string {
  return s
    .replace(/\r\n|\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Sanitizes a single message content from the client.
 * Applied to every user and assistant message (assistant content is client-sent history).
 */
export function sanitizeUserContent(raw: string): string {
  if (typeof raw !== 'string') return '';
  let out = stripControlChars(raw);
  out = normalizeWhitespace(out);
  if (out.length > MAX_MESSAGE_LENGTH) {
    out = out.slice(0, MAX_MESSAGE_LENGTH);
  }
  return out;
}
