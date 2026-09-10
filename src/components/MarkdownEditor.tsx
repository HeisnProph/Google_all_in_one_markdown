import React, { useRef, useEffect } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
  editorRef?: React.RefObject<HTMLTextAreaElement | null>;
  onSave?: () => void;
  onExportPdf?: () => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onScroll,
  editorRef: externalRef,
  onSave,
  onExportPdf,
}) => {
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaRef = externalRef || internalRef;
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);

  // Calculate line numbers
  const lineCount = React.useMemo(() => {
    return Math.max(1, value.split('\n').length);
  }, [value]);

  const lineNumbers = React.useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => i + 1);
  }, [lineCount]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = target.scrollTop;
    }
    if (onScroll) {
      onScroll(target.scrollTop, target.scrollHeight, target.clientHeight);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Save shortcut: Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (onSave) onSave();
      return;
    }

    // PDF Export shortcut: Ctrl/Cmd + P
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      if (onExportPdf) onExportPdf();
      return;
    }

    // Tab key support (indent with 2 spaces)
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // Bold shortcut: Ctrl/Cmd + B
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      wrapSelection('**', '**', 'bold text');
      return;
    }

    // Italic shortcut: Ctrl/Cmd + I
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      wrapSelection('*', '*', 'italic text');
      return;
    }

    // Link shortcut: Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      wrapSelection('[', '](https://)', 'link text');
      return;
    }
  };

  const wrapSelection = (before: string, after: string, defaultText: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || defaultText;
    const replacement = before + selected + after;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 0);
  };

  return (
    <div
      id="markdown-editor-pane"
      className="editor-pane relative flex h-full w-full overflow-hidden bg-white select-text"
    >
      {/* Line Numbers Gutter */}
      <div
        id="editor-line-numbers"
        ref={lineNumbersRef}
        className="hidden sm:block select-none overflow-hidden bg-gray-50/60 px-3 py-4 text-right font-mono text-[13px] leading-6 text-gray-400 border-r border-gray-200 shrink-0"
        style={{ width: lineCount > 999 ? '60px' : '48px' }}
        aria-hidden="true"
      >
        {lineNumbers.map((num) => (
          <div key={num} className="h-6">
            {num}
          </div>
        ))}
      </div>

      {/* Real-time Input Textarea */}
      <textarea
        id="markdown-raw-textarea"
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        placeholder="Start writing or paste your Markdown here... You can also open files directly from Google Drive or local storage."
        spellCheck="false"
        className="h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-[13px] leading-6 text-gray-800 placeholder-gray-400 outline-none focus:ring-0 overflow-y-auto"
        style={{
          tabSize: 2,
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        }}
      />
    </div>
  );
};
