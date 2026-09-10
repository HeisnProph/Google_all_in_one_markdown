import React from 'react';
import { MarkdownTemplate } from '../types';
import { MARKDOWN_TEMPLATES } from '../data/templates';
import { BookOpen, X, FileText, Check } from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: MarkdownTemplate) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="templates-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
    >
      <div
        id="templates-modal-content"
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Markdown Templates</h2>
              <p className="text-xs text-gray-500">Pick a starting document for your Google Workspace project</p>
            </div>
          </div>
          <button
            id="btn-close-templates-modal"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MARKDOWN_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="group flex flex-col justify-between rounded-xl border border-gray-200 p-5 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer bg-white"
                onClick={() => {
                  onSelectTemplate(tpl);
                  onClose();
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                      {tpl.category}
                    </span>
                    <FileText className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {tpl.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-blue-600 group-hover:underline">
                    Use Template →
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {tpl.content.split('\n').length} lines
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-200 px-6 py-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
