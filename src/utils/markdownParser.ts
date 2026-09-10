export interface ParsedMarkdownBlock {
  id: string;
  type: 'heading' | 'code' | 'table' | 'list' | 'quote' | 'hr' | 'paragraph' | 'blank';
  startLine: number;
  endLine: number;
  rawText: string;
}

/**
 * Parses markdown string into discrete, editable blocks.
 * Multi-line constructs (code fences, tables, blockquotes) stay cohesive,
 * while headings, list items, blank lines, and paragraphs are broken down
 * so that clicking any line allows in-place editing.
 */
export function parseMarkdownBlocks(markdown: string): ParsedMarkdownBlock[] {
  const lines = markdown.split('\n');
  const blocks: ParsedMarkdownBlock[] = [];

  let i = 0;
  let blockIndex = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code Fence (``` or ~~~)
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      const fenceMarker = trimmed.slice(0, 3);
      const startLine = i;
      const codeLines = [line];
      i++;

      while (i < lines.length) {
        codeLines.push(lines[i]);
        if (lines[i].trim().startsWith(fenceMarker)) {
          i++;
          break;
        }
        i++;
      }

      blocks.push({
        id: `block-${blockIndex++}`,
        type: 'code',
        startLine,
        endLine: i - 1,
        rawText: codeLines.join('\n'),
      });
      continue;
    }

    // 2. Table Block
    if (trimmed.startsWith('|') || (trimmed.includes('|') && lines[i + 1]?.trim().match(/^\|?[-:| ]+\|?$/))) {
      const startLine = i;
      const tableLines: string[] = [];

      while (i < lines.length && (lines[i].trim().includes('|') || lines[i].trim() === '')) {
        if (lines[i].trim() === '') break;
        tableLines.push(lines[i]);
        i++;
      }

      blocks.push({
        id: `block-${blockIndex++}`,
        type: 'table',
        startLine,
        endLine: i - 1,
        rawText: tableLines.join('\n'),
      });
      continue;
    }

    // 3. Heading (#, ##, etc.)
    if (/^#{1,6}\s+/.test(trimmed)) {
      blocks.push({
        id: `block-${blockIndex++}`,
        type: 'heading',
        startLine: i,
        endLine: i,
        rawText: line,
      });
      i++;
      continue;
    }

    // 4. Horizontal Rule (---, ***, ___)
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({
        id: `block-${blockIndex++}`,
        type: 'hr',
        startLine: i,
        endLine: i,
        rawText: line,
      });
      i++;
      continue;
    }

    // 5. Blockquote (> ...)
    if (trimmed.startsWith('>')) {
      const startLine = i;
      const quoteLines = [line];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i]);
        i++;
      }

      blocks.push({
        id: `block-${blockIndex++}`,
        type: 'quote',
        startLine,
        endLine: i - 1,
        rawText: quoteLines.join('\n'),
      });
      continue;
    }

    // 6. List Item (bullet, numbered, task checkbox)
    if (/^(\s*[-*+]\s+|\s*\d+\.\s+)/.test(line)) {
      blocks.push({
        id: `block-${blockIndex++}`,
        type: 'list',
        startLine: i,
        endLine: i,
        rawText: line,
      });
      i++;
      continue;
    }

    // 7. Blank Line
    if (trimmed === '') {
      blocks.push({
        id: `block-${blockIndex++}`,
        type: 'blank',
        startLine: i,
        endLine: i,
        rawText: line,
      });
      i++;
      continue;
    }

    // 8. Normal Paragraph line
    blocks.push({
      id: `block-${blockIndex++}`,
      type: 'paragraph',
      startLine: i,
      endLine: i,
      rawText: line,
    });
    i++;
  }

  return blocks;
}

/**
 * Recombines blocks back into a continuous raw markdown document string
 */
export function reconstructMarkdown(blocks: ParsedMarkdownBlock[]): string {
  return blocks.map((b) => b.rawText).join('\n');
}
