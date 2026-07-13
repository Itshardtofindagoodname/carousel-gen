export const greeting = 'Hello from common';

export interface WrappedText {
  lines: string[];
  lineHeightInPx: number;
  totalHeight: number;
}

/**
 * Heuristically wraps text to a max width based on font-size.
 * Returns the wrapped lines, the height per line, and the estimated total height.
 */
export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  lineHeight: number,
): WrappedText {
  const avgCharWidth = fontSize * 0.52; // Heuristic for typical sans-serif fonts like Inter/Roboto
  const maxCharsPerLine = Math.max(1, Math.floor(maxWidth / avgCharWidth));

  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    if (para.trim() === '') {
      lines.push('');
      continue;
    }

    const words = para.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length > maxCharsPerLine) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // If a single word exceeds the line length, put it on its own line
          lines.push(word);
          currentLine = '';
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  const lineHeightInPx = fontSize * lineHeight;
  const totalHeight = lines.length * lineHeightInPx;

  return {
    lines,
    lineHeightInPx,
    totalHeight,
  };
}
