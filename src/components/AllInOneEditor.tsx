import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseMarkdownBlocks, reconstructMarkdown, ParsedMarkdownBlock } from '../utils/markdownParser';
import { Edit3, Plus, CornerDownLeft, Sparkles, Copy, Check } from 'lucide-react';

interface AllInOneEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  onSave?: () => void;
  onExportPdf?: () => void;
  editorContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export const AllInOneEditor: React.FC<AllInOneEditorProps> = ({
  content,
  onChange,
  onSave,
  onExportPdf,
  editorContainerRef,
}) => {
  const blocks = React.useMemo(() => parseMarkdownBlocks(content), [content]);
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const activeInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Sync editing text whenever the active block changes
  useEffect(() => {
    if (activeBlockIndex !== null && blocks[activeBlockIndex]) {
      setEditingText(blocks[activeBlockIndex].rawText);
    }
  }, [activeBlockIndex]);

  // Focus and auto-adjust textarea height when editing begins
  useEffect(() => {
    if (activeBlockIndex !== null && activeInputRef.current) {
      const textarea = activeInputRef.current;
      textarea.focus();
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(40, textarea.scrollHeight)}px`;
    }
  }, [activeBlockIndex, editingText]);

  const commitBlockEdit = (index: number, newRawText: string) => {
    const updatedBlocks = [...blocks];
    if (updatedBlocks[index]) {
      updatedBlocks[index] = {
        ...updatedBlocks[index],
        rawText: newRawText,
      };
      const newContent = reconstructMarkdown(updatedBlocks);
      onChange(newContent);
    }
  };

  const handleStartEdit = (index: number) => {
    if (activeBlockIndex !== null && activeBlockIndex !== index) {
      commitBlockEdit(activeBlockIndex, editingText);
    }
    setActiveBlockIndex(index);
    if (blocks[index]) {
      setEditingText(blocks[index].rawText);
    }
  };

  const handleFinishEdit = (index: number) => {
    commitBlockEdit(index, editingText);
    setActiveBlockIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    // Save shortcut: Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      commitBlockEdit(index, editingText);
      if (onSave) onSave();
      return;
    }

    // PDF Export shortcut: Ctrl/Cmd + P
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      commitBlockEdit(index, editingText);
      if (onExportPdf) onExportPdf();
      return;
    }

    // Escape: Finish editing this block immediately
    if (e.key === 'Escape') {
      e.preventDefault();
      handleFinishEdit(index);
      return;
    }

    // Arrow Up: Move to previous block if cursor is at the beginning
    if (e.key === 'ArrowUp' && activeInputRef.current) {
      if (activeInputRef.current.selectionStart === 0 && index > 0) {
        e.preventDefault();
        commitBlockEdit(index, editingText);
        setActiveBlockIndex(index - 1);
        return;
      }
    }

    // Arrow Down: Move to next block if cursor is at the end
    if (e.key === 'ArrowDown' && activeInputRef.current) {
      if (
        activeInputRef.current.selectionEnd === editingText.length &&
        index < blocks.length - 1
      ) {
        e.preventDefault();
        commitBlockEdit(index, editingText);
        setActiveBlockIndex(index + 1);
        return;
      }
    }

    // Enter key handling (VS Code Markdown style newline and auto-continuation)
    if (e.key === 'Enter') {
      const currentBlock = blocks[index];

      // Shift+Enter or inside code/table blocks allows standard newline inside the textarea
      if (e.shiftKey || currentBlock.type === 'code' || currentBlock.type === 'table') {
        return;
      }

      e.preventDefault();

      // Check list continuation
      const listMatch = editingText.match(/^(\s*)([-*+]|\d+\.)(\s+\[[ xX]\])?\s+/);
      const isTaskList = /^(\s*[-*+]\s+\[[ xX]\]\s*)$/.test(editingText);
      const isBulletOnly = /^(\s*[-*+]\s*)$/.test(editingText);

      // Pressing enter on an empty bullet or checkbox clears it to a blank line
      if (isTaskList || isBulletOnly) {
        commitBlockEdit(index, '');
        return;
      }

      commitBlockEdit(index, editingText);

      let nextLinePrefix = '';
      if (listMatch) {
        const indent = listMatch[1];
        const marker = listMatch[2];
        const isNumbered = /^\d+\.$/.test(marker);
        const nextMarker = isNumbered ? `${parseInt(marker, 10) + 1}.` : marker;
        const taskBox = listMatch[3] ? '[ ] ' : '';
        nextLinePrefix = `${indent}${nextMarker} ${taskBox}`;
      }

      // Insert new block directly below
      const updatedBlocks = [...blocks];
      const newBlock: ParsedMarkdownBlock = {
        id: `block-new-${Date.now()}`,
        type: nextLinePrefix ? 'list' : 'paragraph',
        startLine: currentBlock.endLine + 1,
        endLine: currentBlock.endLine + 1,
        rawText: nextLinePrefix,
      };
      updatedBlocks.splice(index + 1, 0, newBlock);
      const newContent = reconstructMarkdown(updatedBlocks);
      onChange(newContent);
      setActiveBlockIndex(index + 1);
      setEditingText(nextLinePrefix);
      return;
    }

    // Backspace on an empty block removes the block and moves cursor to the preceding block
    if (e.key === 'Backspace' && editingText === '' && blocks.length > 1) {
      e.preventDefault();
      const updatedBlocks = blocks.filter((_, i) => i !== index);
      const newContent = reconstructMarkdown(updatedBlocks);
      onChange(newContent);
      setActiveBlockIndex(Math.max(0, index - 1));
      return;
    }

    // Tab key inserts 2 spaces indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = activeInputRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const updated = editingText.substring(0, start) + '  ' + editingText.substring(end);
      setEditingText(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleAppendBlankLine = () => {
    const newContent = content + '\n';
    onChange(newContent);
    setActiveBlockIndex(blocks.length);
    setEditingText('');
  };

  const handleCopyCode = (codeText: string, codeBlockId: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(codeBlockId);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2000);
  };

  return (
    <div
      id="all-in-one-markdown-container"
      ref={editorContainerRef}
      className="h-full w-full overflow-y-auto bg-white px-4 sm:px-12 py-8 select-text"
    >
      {/* Informative Header Banner */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between rounded-xl bg-blue-50/80 border border-blue-100 px-4 py-2.5 text-xs text-blue-900 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
          <span>
            <strong className="font-semibold text-blue-800">All-in-One 模式 (渲染与编辑合并):</strong> 默认显示渲染效果。鼠标点击任意行/块立即切换为纯文本编辑模式；光标移开或按回车自动恢复渲染。
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-blue-600 font-mono">
          <CornerDownLeft className="h-3 w-3" /> Enter = 换行 / Esc = 完成
        </span>
      </div>

      {/* Main Document Body */}
      <div
        id="markdown-preview-content"
        className="markdown-body max-w-4xl mx-auto space-y-1 pb-32 printable-content"
      >
        {blocks.map((block, index) => {
          const isEditing = activeBlockIndex === index;

          if (isEditing) {
            return (
              <div
                key={block.id}
                className="relative my-1.5 rounded-lg border-2 border-blue-500 bg-blue-50/25 p-2 shadow-sm transition-all"
              >
                {/* Visual badge indicator */}
                <div className="absolute right-2 top-2 flex items-center gap-1.5 z-10 text-[10px] font-mono text-blue-700 bg-blue-100/90 border border-blue-200 px-2 py-0.5 rounded shadow-xs select-none">
                  <Edit3 className="h-3 w-3 text-blue-600" />
                  <span>编辑纯文本 ({block.type})</span>
                </div>

                <textarea
                  ref={activeInputRef}
                  value={editingText}
                  onChange={(e) => {
                    setEditingText(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.max(40, e.target.scrollHeight)}px`;
                  }}
                  onBlur={() => handleFinishEdit(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder="在此输入 Markdown..."
                  className="w-full resize-none border-0 bg-transparent font-mono text-[13px] leading-6 text-gray-900 outline-none focus:ring-0 selection:bg-blue-200"
                  style={{
                    minHeight: block.type === 'code' || block.type === 'table' ? '90px' : '38px',
                  }}
                />
              </div>
            );
          }

          // Blank line rendering
          if (block.type === 'blank') {
            return (
              <div
                key={block.id}
                onClick={() => handleStartEdit(index)}
                title="点击在此处输入"
                className="group h-6 w-full cursor-text rounded hover:bg-blue-50/40 transition-colors flex items-center justify-start px-2"
              >
                <span className="opacity-0 group-hover:opacity-40 text-[11px] text-gray-400 font-mono select-none">
                  + 点击输入新行...
                </span>
              </div>
            );
          }

          // Rendered Markdown Block
          return (
            <div
              key={block.id}
              onClick={() => handleStartEdit(index)}
              title="点击编辑此行"
              className="group relative rounded-md px-2 py-0.5 hover:bg-blue-50/30 hover:ring-1 hover:ring-blue-300 cursor-text transition-all"
            >
              {/* Subtle hover edit cue */}
              <div className="absolute right-1 top-1 hidden group-hover:flex items-center gap-1 rounded bg-white/90 border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 shadow-xs select-none pointer-events-none">
                <Edit3 className="h-2.5 w-2.5 text-blue-600" />
                <span>点击编辑</span>
              </div>

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Code block styling
                  pre({ children, ...props }) {
                    const codeString = block.rawText.replace(/^```[a-zA-Z0-9_-]*\n?/, '').replace(/\n?```$/, '');
                    return (
                      <div className="relative group/code my-2 rounded-lg overflow-hidden border border-gray-800 bg-[#0f172a]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(codeString, block.id);
                          }}
                          className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded bg-gray-800/80 px-2 py-1 text-[10px] text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                          {copiedCodeId === block.id ? (
                            <>
                              <Check className="h-3 w-3 text-green-400" />
                              <span className="text-green-400">已复制</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 text-gray-400" />
                              <span>复制代码</span>
                            </>
                          )}
                        </button>
                        <pre {...props} className="p-4 overflow-x-auto text-[13px] leading-6 text-gray-100">
                          {children}
                        </pre>
                      </div>
                    );
                  },
                  // Task list checkbox
                  input({ type, checked, ...props }) {
                    if (type === 'checkbox') {
                      return (
                        <input
                          type="checkbox"
                          checked={!!checked}
                          onChange={(e) => {
                            e.stopPropagation();
                            const updated = block.rawText.replace(
                              /^(\s*[-*+]\s+\[)( |x|X)(\]\s+.*)$/,
                              `$1${!checked ? 'x' : ' '}$3`
                            );
                            commitBlockEdit(index, updated);
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer mr-2 align-middle"
                          {...props}
                        />
                      );
                    }
                    return <input type={type} {...props} />;
                  },
                  // Responsive images
                  img({ src, alt, ...props }) {
                    return (
                      <img
                        src={src}
                        alt={alt || 'Image'}
                        referrerPolicy="no-referrer"
                        className="my-3 max-w-full rounded-lg border border-gray-200 shadow-xs object-contain"
                        {...props}
                      />
                    );
                  },
                }}
              >
                {block.rawText}
              </ReactMarkdown>
            </div>
          );
        })}

        {/* Append button at bottom */}
        <div className="pt-6">
          <button
            type="button"
            onClick={handleAppendBlankLine}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-medium text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/30 transition-all w-full justify-center"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>点击在文档末尾添加新行</span>
          </button>
        </div>
      </div>
    </div>
  );
};
