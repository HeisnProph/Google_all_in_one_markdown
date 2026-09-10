import React from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Undo2,
  Redo2,
  FileText,
  Clock,
  Scissors,
} from 'lucide-react';

interface EditorToolbarProps {
  onInsertText: (before: string, after?: string, defaultText?: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  content: string;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onInsertText,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  content,
}) => {
  // Statistics
  const words = React.useMemo(() => {
    const trimmed = content.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [content]);

  const chars = content.length;
  const readingTimeMin = Math.max(1, Math.ceil(words / 200));

  const insertTable = () => {
    const tableTemplate = `\n| Header 1 | Header 2 | Header 3 |\n| :--- | :---: | ---: |\n| Row 1 Col 1 | Row 1 Col 2 | Row 1 Col 3 |\n| Row 2 Col 1 | Row 2 Col 2 | Row 2 Col 3 |\n\n`;
    onInsertText(tableTemplate, '');
  };

  const insertPageBreak = () => {
    onInsertText('\n\n<div style="page-break-after: always;"></div>\n\n', '');
  };

  return (
    <div
      id="editor-toolbar"
      className="toolbar-container flex flex-wrap items-center justify-between gap-1 border-b border-gray-200 bg-gray-50/80 px-3 py-1.5 text-gray-700 select-none text-xs"
    >
      <div className="flex flex-wrap items-center gap-0.5">
        {/* Undo / Redo */}
        <button
          id="btn-toolbar-undo"
          type="button"
          title="Undo (Ctrl+Z)"
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded p-1.5 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          id="btn-toolbar-redo"
          type="button"
          title="Redo (Ctrl+Y)"
          onClick={onRedo}
          disabled={!canRedo}
          className="rounded p-1.5 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>

        <div className="mx-1.5 h-4 w-px bg-gray-300" />

        {/* Headings */}
        <button
          id="btn-toolbar-h1"
          type="button"
          title="Heading 1"
          onClick={() => onInsertText('# ', '', 'Heading 1')}
          className="rounded px-2 py-1 font-bold hover:bg-gray-200 transition-colors"
        >
          H1
        </button>
        <button
          id="btn-toolbar-h2"
          type="button"
          title="Heading 2"
          onClick={() => onInsertText('## ', '', 'Heading 2')}
          className="rounded px-2 py-1 font-bold hover:bg-gray-200 transition-colors"
        >
          H2
        </button>
        <button
          id="btn-toolbar-h3"
          type="button"
          title="Heading 3"
          onClick={() => onInsertText('### ', '', 'Heading 3')}
          className="rounded px-2 py-1 font-semibold hover:bg-gray-200 transition-colors"
        >
          H3
        </button>

        <div className="mx-1.5 h-4 w-px bg-gray-300" />

        {/* Text styling */}
        <button
          id="btn-toolbar-bold"
          type="button"
          title="Bold (Ctrl+B)"
          onClick={() => onInsertText('**', '**', 'bold text')}
          className="rounded p-1.5 hover:bg-gray-200 transition-colors"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          id="btn-toolbar-italic"
          type="button"
          title="Italic (Ctrl+I)"
          onClick={() => onInsertText('*', '*', 'italic text')}
          className="rounded p-1.5 hover:bg-gray-200 transition-colors"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          id="btn-toolbar-strike"
          type="button"
          title="Strikethrough"
          onClick={() => onInsertText('~~', '~~', 'strikethrough text')}
          className="rounded p-1.5 hover:bg-gray-200 transition-colors"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>
        <button
          id="btn-toolbar-code"
          type="button"
          title="Inline Code"
          onClick={() => onInsertText('`', '`', 'code')}
          className="rounded p-1.5 hover:bg-gray-200 transition-colors"
        >
          <Code className="h-3.5 w-3.5" />
        </button>

        <div className="mx-1.5 h-4 w-px bg-gray-300" />

        {/* Lists & Quotes */}
        <button
          id="btn-toolbar-bullet-list"
          type="button"
          title="Bullet List"
          onClick={() => onInsertText('- ', '', 'List item')}
          className="rounded p-1.5 hover:bg-gray-200 transition-colors"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          id="btn-toolbar-ordered-list"
          type="button"
          title="Numbered List"
          onClick={() => onInsertText('1. ', '', 'List item')}
          className="rounded p-1.5 hover:bg-gray-200 transition-colors"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <button
          id="btn-toolbar-task-list"
          type="button"
          title="Task Checklist"
          onClick={() => onInsertText('- [ ] ', '', 'Task item')}
          className="rounded p-1.5 hover:bg-gray-200 transition-colors"
        >
          <CheckSquare className="h-3.5 w-3.5" />
        </button>
        <button
          id="btn-toolbar-quote"
          type="button"
          title="Blockquote"
          onClick={() => onInsertText('> ', '', 'Quote text')}
          className="rounded p-1.5 hover:bg-gray-200 transition-colors"
        >
          <Quote className="h-3.5 w-3.5" />
        </button>

        <div className="mx-1.5 h-4 w-px bg-gray-300" />

        {/* Inserts: Table, Link, Image, HR, PageBreak */}
        <button
          id="btn-toolbar-table"
          type="button"
          title="Insert Table"
          onClick={insertTable}
          className="rounded p-1.5 hover:bg-gray-200 transition-colors"
        >
          <TableIcon className="h-3.5 w-3.5" />
        </button>
        <button
          id="btn-toolbar-link"
          type="button"
          title="Insert Link"
          onClick={() => onInsertText('[', '](https://example.com)', 'link text')}
          className="rounded p-1.5 hover:bg-gray-200 transition-colors"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </button>
        <button
          id="btn-toolbar-image"
          type="button"
          title="Insert Image"
          onClick={() => onInsertText('![', '](https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600)', 'Alt text')}
          className="rounded p-1.5 hover:bg-gray-200 transition-colors"
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </button>
        <button
          id="btn-toolbar-hr"
          type="button"
          title="Horizontal Rule"
          onClick={() => onInsertText('\n\n---\n\n', '')}
          className="rounded p-1.5 hover:bg-gray-200 transition-colors"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          id="btn-toolbar-page-break"
          type="button"
          title="Insert PDF Page Break"
          onClick={insertPageBreak}
          className="rounded p-1.5 hover:bg-gray-200 transition-colors text-blue-600 flex items-center gap-1"
        >
          <Scissors className="h-3.5 w-3.5" />
          <span className="hidden sm:inline font-mono text-[10px]">Page Break</span>
        </button>
      </div>

      {/* Document Stats */}
      <div className="hidden lg:flex items-center gap-3 text-gray-500 text-[11px]">
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          <span>{words} words</span>
          <span className="text-gray-300">•</span>
          <span>{chars} chars</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>~{readingTimeMin} min read</span>
        </span>
      </div>
    </div>
  );
};
