import React from 'react';
import { ShieldCheck, FileText, Mail, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenTerms }) => {
  return (
    <footer 
      id="app-global-footer"
      className="no-print border-t border-gray-200 bg-gray-50/80 py-4 px-4 text-xs text-gray-600 transition-colors select-none"
    >
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: App Identity and Purpose Statement */}
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2.5 text-center sm:text-left">
          <div className="flex items-center gap-1.5 font-bold text-gray-900">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white font-bold text-[10px]">
              M↓
            </span>
            <span>All in One markdown</span>
          </div>
          <span className="hidden sm:inline text-gray-300">•</span>
          <span className="text-gray-500 text-[11px]">
            The In-Place Markdown Editor with Google Drive Integration &amp; PDF Export.
          </span>
        </div>

        {/* Right: Legal & Compliance Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            id="footer-btn-privacy"
            type="button"
            onClick={onOpenPrivacy}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Privacy Policy</span>
          </button>

          <span className="text-gray-300">•</span>

          <button
            id="footer-btn-terms"
            type="button"
            onClick={onOpenTerms}
            className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
            <span>Terms of Service</span>
          </button>

          <span className="text-gray-300">•</span>

          <a
            href="mailto:jingx.z223@gmail.com"
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-gray-500" />
            <span>Support: jingx.z223@gmail.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
