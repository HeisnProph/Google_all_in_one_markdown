import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface MarkdownPreviewProps {
  content: string;
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
  previewRef?: React.RefObject<HTMLDivElement | null>;
  onToggleTask?: (taskIndex: number, currentStatus: boolean) => void;
  theme?: 'modern' | 'academic' | 'technical' | 'minimal';
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  onScroll,
  previewRef,
  onToggleTask,
  theme = 'modern',
}) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2000);
  };

  const themeClasses = {
    modern: 'font-sans text-gray-800',
    academic: 'font-serif text-gray-900',
    technical: 'font-mono text-gray-900',
    minimal: 'font-sans text-gray-700',
  }[theme];

  let taskCounter = 0;

  return (
    <div
      id="markdown-preview-container"
      ref={previewRef}
      onScroll={(e) => {
        if (onScroll) {
          const target = e.currentTarget;
          onScroll(target.scrollTop, target.scrollHeight, target.clientHeight);
        }
      }}
      className={`h-full w-full overflow-y-auto bg-white p-6 sm:p-10 ${themeClasses} selection:bg-blue-100`}
    >
      <div
        id="markdown-preview-content"
        className="markdown-body max-w-4xl mx-auto printable-content"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom code block with copy button
            pre({ children, ...props }) {
              return (
                <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-800 bg-[#0f172a]">
                  <pre {...props} className="p-4 overflow-x-auto text-[13px] leading-6">
                    {children}
                  </pre>
                </div>
              );
            },
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const codeString = String(children).replace(/\n$/, '');
              const isInline = !match && !String(children).includes('\n');

              if (isInline) {
                return (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              }

              const codeId = `code-${Math.random().toString(36).substring(2, 8)}`;
              return (
                <div className="relative">
                  {match && (
                    <div className="absolute top-2 right-12 text-[10px] font-mono uppercase tracking-wider text-gray-400 select-none">
                      {match[1]}
                    </div>
                  )}
                  <button
                    type="button"
                    title="Copy code"
                    onClick={() => handleCopy(codeString, codeId)}
                    className="absolute top-2 right-2 rounded p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    {copiedCodeId === codeId ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </div>
              );
            },

            // Custom table wrapper
            table({ children, ...props }) {
              return (
                <div className="overflow-x-auto my-4 rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200" {...props}>
                    {children}
                  </table>
                </div>
              );
            },

            // Safe links
            a({ href, children, ...props }) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                  {...props}
                >
                  {children}
                  <ExternalLink className="h-3 w-3 inline-block opacity-70" />
                </a>
              );
            },

            // Interactive task checkboxes
            li({ children, ...props }) {
              // Check if children contain a task checkbox
              return (
                <li {...props} className="task-list-item my-1">
                  {children}
                </li>
              );
            },
            input({ type, checked, ...props }) {
              if (type === 'checkbox') {
                const currentIdx = taskCounter++;
                return (
                  <input
                    type="checkbox"
                    checked={!!checked}
                    onChange={() => {
                      if (onToggleTask) {
                        onToggleTask(currentIdx, !checked);
                      }
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
                  className="my-4 max-w-full rounded-lg border border-gray-200 shadow-xs object-contain"
                  {...props}
                />
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
