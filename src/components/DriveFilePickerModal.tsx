import React, { useState, useEffect } from 'react';
import { DriveFile } from '../types';
import { listDriveMarkdownFiles, createDriveFile } from '../services/googleDriveService';
import {
  Search,
  RefreshCw,
  FileText,
  Plus,
  ExternalLink,
  X,
  AlertCircle,
  HardDrive,
  Clock,
} from 'lucide-react';

interface DriveFilePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (file: DriveFile) => void;
  onFileCreated?: (file: DriveFile, content: string) => void;
  isAuthenticated: boolean;
  onSignIn: () => void;
}

export const DriveFilePickerModal: React.FC<DriveFilePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectFile,
  onFileCreated,
  isAuthenticated,
  onSignIn,
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const loadFiles = async (query?: string) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const driveFiles = await listDriveMarkdownFiles(query);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Error fetching drive files:', err);
      setError(err.message || 'Failed to load files from Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadFiles();
    }
  }, [isOpen, isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadFiles(searchQuery);
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    setIsLoading(true);
    try {
      const initialContent = `# ${newFileName.trim()}\n\nStart writing your document here...\n`;
      const created = await createDriveFile(newFileName.trim(), initialContent);
      if (onFileCreated) {
        onFileCreated(created, initialContent);
      } else {
        onSelectFile(created);
      }
      onClose();
      setIsCreating(false);
      setNewFileName('');
    } catch (err: any) {
      setError(err.message || 'Failed to create new file in Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '—';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '—';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="drive-picker-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
    >
      <div
        id="drive-picker-modal-content"
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <HardDrive className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Google Drive Files</h2>
              <p className="text-xs text-gray-500">Open or create Markdown documents in your Drive</p>
            </div>
          </div>
          <button
            id="btn-close-drive-modal"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HardDrive className="h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">
                Google Drive Sign-in Required
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mb-6">
                Sign in with your Google account to access, open, and save Markdown files directly to your Google Drive.
              </p>
              <button
                id="btn-modal-gsi"
                type="button"
                onClick={onSignIn}
                className="gsi-material-button"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">Sign in with Google</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Actions Bar: Search + Create */}
              <div className="flex flex-col sm:flex-row gap-2">
                <form onSubmit={handleSearch} className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="input-search-drive"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Markdown files in Drive..."
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </form>

                <div className="flex gap-2">
                  <button
                    id="btn-refresh-drive"
                    type="button"
                    onClick={() => loadFiles(searchQuery)}
                    title="Refresh file list"
                    className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    id="btn-toggle-create-drive"
                    type="button"
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-xs transition-colors whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New in Drive</span>
                  </button>
                </div>
              </div>

              {/* Create new file inline form */}
              {isCreating && (
                <form
                  onSubmit={handleCreateNew}
                  className="rounded-lg border border-blue-100 bg-blue-50/50 p-3.5 flex flex-col sm:flex-row gap-2 items-center"
                >
                  <input
                    id="input-new-drive-filename"
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Document Title (e.g. Project-Plan.md)"
                    autoFocus
                    required
                    className="flex-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200/50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newFileName.trim() || isLoading}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Create & Open
                    </button>
                  </div>
                </form>
              )}

              {/* Error Banner */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* File List */}
              <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 min-h-[220px] max-h-[380px] overflow-y-auto">
                {isLoading && files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-gray-500">
                    <RefreshCw className="h-6 w-6 animate-spin mb-2 text-blue-600" />
                    <span className="text-xs">Loading files from Google Drive...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center px-4">
                    <FileText className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-700">No Markdown files found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchQuery
                        ? 'No files matching your search query'
                        : 'Click "New in Drive" above to create your first Markdown document.'}
                    </p>
                  </div>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="group flex items-center justify-between p-3 hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(file.modifiedTime)}
                            </span>
                            <span>{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in Google Drive tab"
                            className="rounded p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectFile(file);
                            onClose();
                          }}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 bg-gray-50/50 text-xs text-gray-500">
          <span>Supported extensions: .md, .markdown, .txt</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-200/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
