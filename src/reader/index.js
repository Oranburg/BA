/**
 * Casebook Reader Utility
 * Parses Markdown text and handles paragraph-level ID anchors.
 * IDs follow the pattern: digits followed by 'B' (e.g., 61B, 3689B)
 */

/**
 * Parse a Markdown string and inject anchor IDs for paragraph-level deep-linking.
 * @param {string} markdown - Raw markdown text
 * @returns {{ id: string|null, text: string }[]} Array of paragraph objects
 */
export function parseParaIDs(markdown) {
  const paragraphs = markdown.split(/\n\n+/);
  return paragraphs.map((para) => {
    const match = para.match(/^(\d+B)\s+([\s\S]*)/);
    if (match) {
      return { id: match[1], text: match[2].trim() };
    }
    return { id: null, text: para.trim() };
  });
}

/**
 * Generate a URL hash for a paragraph ID.
 * @param {string} paraId - e.g. "3689B"
 * @returns {string} e.g. "#para-3689B"
 */
export function paraAnchor(paraId) {
  return `#para-${paraId}`;
}
