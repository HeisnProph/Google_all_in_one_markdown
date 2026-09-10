import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, ExternalLink, Printer } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
  isStandalonePage?: boolean;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose, isStandalonePage = false }) => {
  if (!type) return null;

  const handlePrint = () => {
    window.print();
  };

  const content = (
    <div className="mx-auto max-w-4xl text-gray-800 leading-relaxed text-sm space-y-6">
      {type === 'privacy' ? (
        <div className="space-y-6">
          {/* Main Title & Metadata */}
          <div className="border-b border-gray-200 pb-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" /> Official Legal Disclosure
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
              Privacy Policy for All in One markdown
            </h1>
            <p className="text-xs text-gray-500 mt-2 font-mono">
              Effective Date: September 10, 2026 | Last Updated: September 10, 2026
            </p>
          </div>

          {/* Introduction */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">1. Overview &amp; Commitment</h2>
            <p>
              Welcome to <strong>All in One markdown</strong> (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;, or the &quot;Application&quot;), accessible via web browsers and integrated into Google Workspace. 
              We are committed to respecting and protecting the privacy of our users. This Privacy Policy comprehensively details our data handling practices, explaining what information we access, how it is processed, where it resides, and your rights concerning your data.
            </p>
            <p>
              All in One markdown is primarily an in-place, client-side Markdown editing and document conversion tool. We operate on a strict <strong>data-minimization and zero-unauthorized-storage architecture</strong>.
            </p>
          </section>

          {/* Google API Services User Data Policy - MANDATORY FOR GOOGLE VERIFICATION */}
          <section className="rounded-xl border border-blue-200 bg-blue-50/70 p-5 space-y-3">
            <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-700" />
              2. Google API Services User Data Policy &amp; Limited Use Disclosure
            </h2>
            <p className="text-xs text-blue-900 leading-relaxed">
              All in One markdown adheres strictly to the <strong>Google API Services User Data Policy</strong>, including the Limited Use requirements.
            </p>
            <blockquote className="border-l-4 border-blue-600 pl-3 py-1 my-2 text-xs font-medium text-blue-950 bg-blue-100/50 rounded-r">
              &quot;All in One markdown&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
              <a 
                href="https://developers.google.com/terms/api-services-user-data-policy" 
                target="_blank" 
                rel="noreferrer"
                className="underline font-semibold hover:text-blue-800"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.&quot;
            </blockquote>
            <p className="text-xs text-blue-900 leading-relaxed">
              We explicitly certify:
            </p>
            <ul className="list-disc list-inside text-xs text-blue-900 space-y-1 pl-1">
              <li>We do <strong>not</strong> transfer Google user data to any external parties unless necessary to provide or improve the core Markdown editing capabilities.</li>
              <li>We do <strong>not</strong> use or transfer Google user data for serving advertisements, including personalized, re-targeted, or interest-based advertising.</li>
              <li>We do <strong>not</strong> use Google user data to train, fine-tune, or develop artificial intelligence (AI) or machine learning (ML) models.</li>
              <li>We do <strong>not</strong> allow humans to read your document contents unless you have given explicit consent for troubleshooting, or if required for security purposes or compliance with applicable law.</li>
            </ul>
          </section>

          {/* Scopes and Data Collection */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">3. Google OAuth Scopes and Data We Access</h2>
            <p>
              When you choose to authenticate with your Google Account to connect Google Drive, the Application requests the following restricted permission scopes:
            </p>
            
            <div className="space-y-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3.5">
                <div className="font-mono text-xs font-semibold text-indigo-700">
                  https://www.googleapis.com/auth/drive.file
                </div>
                <div className="text-xs text-gray-700 mt-1">
                  <strong>Purpose:</strong> View, create, edit, and save ONLY files that are created with or opened by All in One markdown.
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  <strong>Scope Limitation:</strong> This is a restricted, security-friendly scope. It does <em>not</em> grant All in One markdown general access to your entire Google Drive or to any documents you have not explicitly opened with this app.
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3.5">
                <div className="font-mono text-xs font-semibold text-indigo-700">
                  https://www.googleapis.com/auth/drive.install
                </div>
                <div className="text-xs text-gray-700 mt-1">
                  <strong>Purpose:</strong> Allows All in One markdown to be registered in your Google Drive UI &quot;Open with&quot; menu so you can right-click Markdown files in Google Drive to launch them directly in the editor.
                </div>
              </div>
            </div>
          </section>

          {/* What Information We Access */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">4. Types of Information Processed</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-1">
              <li>
                <strong>Google User Profile:</strong> When logging in, we receive your basic Google account identity (Name, Email address, Profile Picture URL) through Google Identity Services solely to display your user avatar and manage your session.
              </li>
              <li>
                <strong>Document Content &amp; Metadata:</strong> The text content, title, and file ID of Markdown (.md/.txt) documents you open. This data is transferred securely via HTTPS directly between Google Drive servers and your browser client.
              </li>
              <li>
                <strong>Local Browser Storage:</strong> To prevent accidental work loss, the Application temporarily caches your active unsaved editor drafts, preferred view mode (Split / Live / All-in-One), and visual theme in your browser&apos;s <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-xs">localStorage</code>.
              </li>
              <li>
                <strong>Technical Connection Data:</strong> Standard server access logs (such as IP address, browser type, operating system, and timestamp) collected automatically by Google Cloud infrastructure for network security, rate limiting, and DDoS prevention.
              </li>
            </ul>
          </section>

          {/* How We Use the Information */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">5. How We Use the Information</h2>
            <p>Your information is used strictly and exclusively for:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 pl-1">
              <li>Parsing and rendering Markdown syntax (tables, code blocks, task lists, math equations) directly on your screen.</li>
              <li>Syncing your manual or auto-saved document edits back to your designated Google Drive file.</li>
              <li>Generating vector-grade PDF export files directly in your browser.</li>
              <li>Facilitating file opening and creating new files in your Google Drive.</li>
            </ul>
          </section>

          {/* Storage, Retention & Deletion */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">6. Data Storage, Retention, and Deletion</h2>
            <p>
              <strong>Zero External Document Storage:</strong> All in One markdown does NOT store your document contents or copies of your Google Drive files on any external server or database. The document text is loaded into memory in your browser session and saved back directly to Google Drive.
            </p>
            <p>
              <strong>Data Deletion Rights:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 pl-1">
              <li>
                <strong>Local Drafts:</strong> You can purge all locally cached drafts at any time by clearing your browser&apos;s site data or local storage.
              </li>
              <li>
                <strong>Google Drive Files:</strong> You maintain full ownership and can delete any document created with this application directly in Google Drive.
              </li>
              <li>
                <strong>Revoking Google OAuth Access:</strong> You can revoke All in One markdown&apos;s permission to access your Google account at any time by visiting{' '}
                <a 
                  href="https://myaccount.google.com/permissions" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-blue-600 underline font-medium inline-flex items-center gap-0.5"
                >
                  Google Account Security Settings <ExternalLink className="h-3 w-3" />
                </a>.
              </li>
            </ul>
          </section>

          {/* Third-Party Disclosure */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">7. Third-Party Disclosures &amp; Sharing</h2>
            <p>
              We do <strong>NOT</strong> sell, rent, lease, trade, or transfer your personal data or document content to any third parties, brokers, or marketing networks.
            </p>
            <p>
              We only interact with official Google Cloud and Google Workspace APIs via encrypted HTTPS connections to execute file read/write actions on your behalf.
            </p>
          </section>

          {/* Children Privacy */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">8. Children&apos;s Privacy</h2>
            <p>
              All in One markdown is not directed to children under the age of 13. We do not knowingly collect personal identifiable information from children under 13.
            </p>
          </section>

          {/* Contact Information */}
          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-1">
            <h2 className="text-base font-bold text-gray-900">9. Developer Contact Information</h2>
            <p className="text-xs text-gray-600">
              For any privacy inquiries, data deletion requests, or questions regarding this Privacy Policy, please contact the developer:
            </p>
            <div className="pt-2 text-xs">
              <p><strong>Application:</strong> All in One markdown</p>
              <p><strong>Maintainer &amp; Developer:</strong> Jingxuan Zhang</p>
              <p><strong>Support Email:</strong> <a href="mailto:jingx.z223@gmail.com" className="text-blue-600 underline font-medium">jingx.z223@gmail.com</a></p>
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Terms of Service */}
          <div className="border-b border-gray-200 pb-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
              <FileText className="h-3.5 w-3.5" /> Terms of Service
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
              Terms of Service for All in One markdown
            </h1>
            <p className="text-xs text-gray-500 mt-2 font-mono">
              Effective Date: September 10, 2026 | Last Updated: September 10, 2026
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using <strong>All in One markdown</strong> (the &quot;Service&quot;), you confirm that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, you must discontinue using the Service immediately.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">2. Permitted Use &amp; Service Scope</h2>
            <p>
              All in One markdown provides a web-based Markdown editing utility featuring real-time preview, in-place live formatting, Google Drive synchronization, and high-fidelity PDF exporting.
            </p>
            <p>You agree to use the Service only for lawful purposes in accordance with these Terms, and not to:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 pl-1">
              <li>Violate any applicable national or international laws or regulations.</li>
              <li>Attempt to reverse engineer, disrupt, compromise, or overload the Service or its underlying infrastructure.</li>
              <li>Violate Google&apos;s Acceptable Use Policies when connecting your Google Drive.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">3. User Content &amp; Intellectual Property</h2>
            <p>
              <strong>You retain 100% full ownership and intellectual property rights</strong> over any documents, text, code, or images you author, edit, or store using All in One markdown. We make no claim of ownership over your files.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">4. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an <strong>&quot;AS IS&quot; and &quot;AS AVAILABLE&quot;</strong> basis, without warranties of any kind, whether express, statutory, or implied. While we strive to maintain uninterrupted service and reliable file synchronization, we cannot guarantee that the service will be completely bug-free, continuous, or infallible. You are encouraged to maintain independent backups of critical documents.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, in no event shall the creators, developers, or distributors of All in One markdown be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">6. Modifications to the Service and Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms or update the Service at any time. Any changes will be posted directly to this page with an updated Effective Date. Continued use of the Service after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-1">
            <h2 className="text-base font-bold text-gray-900">7. Contact Information</h2>
            <p className="text-xs text-gray-600">
              For any questions regarding these Terms of Service, please contact:
            </p>
            <div className="pt-1 text-xs">
              <p><strong>Application:</strong> All in One markdown</p>
              <p><strong>Support Email:</strong> <a href="mailto:jingx.z223@gmail.com" className="text-blue-600 underline font-medium">jingx.z223@gmail.com</a></p>
            </div>
          </section>
        </div>
      )}
    </div>
  );

  // If viewed directly via standalone page URL (?view=privacy or ?view=terms)
  if (isStandalonePage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-xs px-4 py-3 sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs font-bold text-sm">
                M↓
              </div>
              <span className="font-bold text-gray-950 text-base sm:text-lg">All in One markdown</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Printer className="h-3.5 w-3.5 text-gray-500" />
                <span>Print Document</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Launch App</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12 flex-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-xs">
            {content}
          </div>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-gray-200 bg-white py-6 px-4 text-center text-xs text-gray-500">
          <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              © 2026 <strong>All in One markdown</strong>. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="?view=privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="?view=terms" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="mailto:jingx.z223@gmail.com" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Modal dialog view
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/70">
          <div className="flex items-center gap-2">
            {type === 'privacy' ? (
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            ) : (
              <FileText className="h-5 w-5 text-indigo-600" />
            )}
            <h2 className="text-base font-semibold text-gray-900">
              {type === 'privacy' ? 'Privacy Policy - All in One markdown' : 'Terms of Service - All in One markdown'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 bg-gray-200/60 hover:bg-gray-200 px-2.5 py-1 rounded-md transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Editor</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-6 text-sm text-gray-700 leading-relaxed">
          {content}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Dedicated URL: <span className="font-mono text-gray-700">?view={type}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
