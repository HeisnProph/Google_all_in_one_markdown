import React, { useState } from 'react';
import { PdfExportOptions } from '../types';
import { generatePdfFromElement, triggerBrowserPrint } from '../services/pdfExportService';
import {
  FileDown,
  Printer,
  X,
  Sliders,
  Check,
  FileCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  previewElement: HTMLElement | null;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  previewElement,
}) => {
  const [options, setOptions] = useState<PdfExportOptions>({
    paperSize: 'a4',
    orientation: 'portrait',
    marginSize: 'normal',
    theme: 'modern',
    showPageNumbers: true,
    showTitleHeader: true,
    customHeaderTitle: documentTitle,
    customFooterNote: 'Generated with Workspace Markdown Editor',
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportDownload = async () => {
    if (!previewElement) {
      setError('Preview element not available to export');
      return;
    }

    setIsExporting(true);
    setError(null);
    setExportSuccess(false);

    try {
      const filename = documentTitle.trim() ? `${documentTitle.trim()}.pdf` : 'document.pdf';
      await generatePdfFromElement(previewElement, options, filename);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('PDF export error:', err);
      setError(err.message || 'Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativePrint = () => {
    onClose();
    // Allow modal to close before triggering native print
    setTimeout(() => {
      triggerBrowserPrint();
    }, 150);
  };

  return (
    <div
      id="pdf-export-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
    >
      <div
        id="pdf-export-modal-content"
        className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl bg-white shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <FileDown className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Export Document to PDF</h2>
              <p className="text-xs text-gray-500">Configure page setup, layout, and styling</p>
            </div>
          </div>
          <button
            id="btn-close-pdf-modal"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-gray-700">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {exportSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs text-green-700 border border-green-200">
              <FileCheck className="h-4 w-4 shrink-0" />
              <span>PDF downloaded successfully!</span>
            </div>
          )}

          {/* Document Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Document Header Title
            </label>
            <input
              id="input-pdf-header-title"
              type="text"
              value={options.customHeaderTitle}
              onChange={(e) =>
                setOptions({ ...options, customHeaderTitle: e.target.value })
              }
              placeholder="Title displayed at top of PDF pages"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Grid for Paper Size & Orientation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Paper Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOptions({ ...options, paperSize: 'a4' })}
                  className={`rounded-lg border px-3 py-2 text-center text-xs font-medium transition-colors ${
                    options.paperSize === 'a4'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  A4 (210×297)
                </button>
                <button
                  type="button"
                  onClick={() => setOptions({ ...options, paperSize: 'letter' })}
                  className={`rounded-lg border px-3 py-2 text-center text-xs font-medium transition-colors ${
                    options.paperSize === 'letter'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  US Letter
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Orientation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOptions({ ...options, orientation: 'portrait' })}
                  className={`rounded-lg border px-3 py-2 text-center text-xs font-medium transition-colors ${
                    options.orientation === 'portrait'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Portrait
                </button>
                <button
                  type="button"
                  onClick={() => setOptions({ ...options, orientation: 'landscape' })}
                  className={`rounded-lg border px-3 py-2 text-center text-xs font-medium transition-colors ${
                    options.orientation === 'landscape'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Landscape
                </button>
              </div>
            </div>
          </div>

          {/* Typography Theme */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Typography Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'modern', label: 'Modern Sans' },
                { id: 'academic', label: 'Academic Serif' },
                { id: 'technical', label: 'Technical Mono' },
                { id: 'minimal', label: 'Clean Minimal' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setOptions({ ...options, theme: t.id as any })}
                  className={`rounded-lg border p-2 text-center text-xs font-medium transition-colors ${
                    options.theme === t.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Margins */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Page Margins
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'compact', label: 'Compact (24px)' },
                { id: 'normal', label: 'Standard (40px)' },
                { id: 'relaxed', label: 'Spacious (56px)' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setOptions({ ...options, marginSize: m.id as any })}
                  className={`rounded-lg border p-2 text-center text-xs font-medium transition-colors ${
                    options.marginSize === m.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="rounded-lg bg-gray-50 p-3 space-y-2 border border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.showTitleHeader}
                onChange={(e) =>
                  setOptions({ ...options, showTitleHeader: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-gray-700">
                Include Document Header bar & Date
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.showPageNumbers}
                onChange={(e) =>
                  setOptions({ ...options, showPageNumbers: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-gray-700">
                Add Page Numbers in footer (e.g. Page 1 of 3)
              </span>
            </label>
          </div>

          {/* Footer Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Custom Footer Note (Optional)
            </label>
            <input
              type="text"
              value={options.customFooterNote}
              onChange={(e) =>
                setOptions({ ...options, customFooterNote: e.target.value })
              }
              placeholder="e.g. Confidential • Workspace Markdown"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50/50">
          <button
            id="btn-pdf-print-vector"
            type="button"
            onClick={handleNativePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Printer className="h-4 w-4 text-gray-500" />
            <span>Browser Print / Vector PDF</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-pdf-download-file"
              type="button"
              disabled={isExporting}
              onClick={handleExportDownload}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isExporting ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  <span>Download .PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
