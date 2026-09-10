import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { ViewMode, DocumentState } from '../types';
import {
  FileText,
  HardDrive,
  Save,
  Download,
  FileDown,
  BookOpen,
  FolderOpen,
  Columns,
  Square,
  Eye,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  LogOut,
  Upload,
  Layers,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  document: DocumentState;
  onTitleChange: (newTitle: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  syncScroll: boolean;
  onToggleSyncScroll: () => void;
  // Google Drive & Local Actions
  onOpenDriveModal: () => void;
  onSaveToDrive: () => void;
  onSaveAsNewToDrive: () => void;
  onOpenLocalFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadMarkdown: () => void;
  onOpenTemplates: () => void;
  onOpenPdfModal: () => void;
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  isSaving: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  document,
  onTitleChange,
  viewMode,
  onViewModeChange,
  syncScroll,
  onToggleSyncScroll,
  onOpenDriveModal,
  onSaveToDrive,
  onSaveAsNewToDrive,
  onOpenLocalFile,
  onDownloadMarkdown,
  onOpenTemplates,
  onOpenPdfModal,
  user,
  isAuthenticated,
  isLoggingIn,
  onSignIn,
  onSignOut,
  isSaving,
}) => {
  const [isDriveMenuOpen, setIsDriveMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(document.name);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const driveMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTempTitle(document.name);
  }, [document.name]);

  // Click outside listener for dropdown menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (driveMenuRef.current && !driveMenuRef.current.contains(e.target as Node)) {
        setIsDriveMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim() && tempTitle.trim() !== document.name) {
      onTitleChange(tempTitle.trim());
    } else {
      setTempTitle(document.name);
    }
  };

  return (
    <header
      id="app-header"
      className="no-print border-b border-gray-200 bg-white select-none z-20"
    >
      {/* Top Workspace App Bar */}
      <div className="flex h-14 items-center justify-between px-3 sm:px-4 gap-2">
        {/* Left: App Logo & Document Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Workspace Markdown Brand Icon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <FileText className="h-5 w-5" />
          </div>

          <div className="flex flex-col min-w-0 flex-1 max-w-sm sm:max-w-md">
            {/* Document Title (Editable) */}
            <div className="flex items-center gap-1.5 min-w-0">
              {isEditingTitle ? (
                <input
                  id="input-document-title"
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSubmit();
                    if (e.key === 'Escape') {
                      setTempTitle(document.name);
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="rounded border border-blue-500 bg-blue-50/50 px-1.5 py-0.5 text-sm font-semibold text-gray-900 outline-none w-full"
                />
              ) : (
                <h1
                  id="display-document-title"
                  onClick={() => setIsEditingTitle(true)}
                  title="Click to rename document"
                  className="truncate text-sm font-semibold text-gray-900 hover:bg-gray-100 rounded px-1.5 py-0.5 cursor-pointer transition-colors"
                >
                  {document.name}
                </h1>
              )}

              {/* Status Pill */}
              <div className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-gray-500">
                {isSaving ? (
                  <span className="flex items-center gap-1 text-blue-600">
                    <div className="h-2 w-2 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                    <span>Saving...</span>
                  </span>
                ) : document.source === 'drive' ? (
                  document.isDirty ? (
                    <span className="flex items-center gap-1 text-amber-600" title="Unsaved changes">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span className="hidden sm:inline">Unsaved</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-700" title="Saved in Google Drive">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span className="hidden sm:inline">Drive synced</span>
                    </span>
                  )
                ) : (
                  <span className="flex items-center gap-1 text-gray-400" title="Stored in local browser draft">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                    <span className="hidden sm:inline">Local draft</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Menubar row */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-600">
              {/* Drive Dropdown */}
              <div className="relative" ref={driveMenuRef}>
                <button
                  id="btn-menu-drive"
                  type="button"
                  onClick={() => setIsDriveMenuOpen(!isDriveMenuOpen)}
                  className="flex items-center gap-1 rounded px-2 py-0.5 hover:bg-gray-100 font-medium text-gray-700 transition-colors"
                >
                  <HardDrive className="h-3 w-3 text-blue-600" />
                  <span>Google Drive</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {isDriveMenuOpen && (
                  <div className="absolute left-0 top-full mt-1 w-52 rounded-xl bg-white p-1.5 shadow-xl border border-gray-100 z-50 text-xs">
                    <button
                      id="btn-menu-open-drive"
                      type="button"
                      onClick={() => {
                        setIsDriveMenuOpen(false);
                        onOpenDriveModal();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <FolderOpen className="h-3.5 w-3.5 text-blue-600" />
                      <span>Open from Drive...</span>
                    </button>
                    <button
                      id="btn-menu-save-drive"
                      type="button"
                      onClick={() => {
                        setIsDriveMenuOpen(false);
                        onSaveToDrive();
                      }}
                      disabled={isSaving}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Save className="h-3.5 w-3.5 text-green-600" />
                      <span>Save to Google Drive</span>
                    </button>
                    <button
                      id="btn-menu-save-as-drive"
                      type="button"
                      onClick={() => {
                        setIsDriveMenuOpen(false);
                        onSaveAsNewToDrive();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <FileDown className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Save as New File in Drive</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Local File Open */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={onOpenLocalFile}
                accept=".md,.markdown,.txt"
                className="hidden"
              />
              <button
                id="btn-open-local"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded px-2 py-0.5 hover:bg-gray-100 text-gray-700 transition-colors flex items-center gap-1"
              >
                <Upload className="h-3 w-3 text-gray-500" />
                <span>Open Local</span>
              </button>

              {/* Download .md */}
              <button
                id="btn-download-md"
                type="button"
                onClick={onDownloadMarkdown}
                className="rounded px-2 py-0.5 hover:bg-gray-100 text-gray-700 transition-colors flex items-center gap-1"
              >
                <Download className="h-3 w-3 text-gray-500" />
                <span>Download .md</span>
              </button>

              {/* Templates */}
              <button
                id="btn-open-templates"
                type="button"
                onClick={onOpenTemplates}
                className="rounded px-2 py-0.5 hover:bg-gray-100 text-gray-700 transition-colors flex items-center gap-1"
              >
                <BookOpen className="h-3 w-3 text-indigo-600" />
                <span>Templates</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center/Right: View Mode Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Synchronized Scrolling Toggle */}
          {viewMode === 'split' && (
            <button
              id="btn-toggle-sync-scroll"
              type="button"
              onClick={onToggleSyncScroll}
              title={syncScroll ? 'Sync Scrolling: ON' : 'Sync Scrolling: OFF'}
              className={`hidden md:flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                syncScroll
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Sync Scroll</span>
            </button>
          )}

          {/* View Mode Segmented Control */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-gray-600 shadow-xs">
            <button
              id="btn-view-hybrid"
              type="button"
              title="All-in-One (点击行进入纯文本编辑，离开恢复渲染)"
              onClick={() => onViewModeChange('hybrid')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                viewMode === 'hybrid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'hover:text-gray-900 text-gray-600'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>All-in-One</span>
            </button>
            <button
              id="btn-view-split"
              type="button"
              title="Split View (Editor + Preview)"
              onClick={() => onViewModeChange('split')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                viewMode === 'split'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'hover:text-gray-900 text-gray-600'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              id="btn-view-editor"
              type="button"
              title="Editor Only"
              onClick={() => onViewModeChange('editor')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                viewMode === 'editor'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'hover:text-gray-900 text-gray-600'
              }`}
            >
              <Square className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Editor</span>
            </button>
            <button
              id="btn-view-preview"
              type="button"
              title="Preview Only"
              onClick={() => onViewModeChange('preview')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                viewMode === 'preview'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'hover:text-gray-900 text-gray-600'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          {/* Export PDF Button (Key Requirement) */}
          <button
            id="btn-header-export-pdf"
            type="button"
            onClick={onOpenPdfModal}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 sm:px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-red-700 transition-colors whitespace-nowrap"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Export PDF</span>
          </button>

          {/* User Sign In / Profile */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                id="btn-user-avatar"
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 rounded-full p-0.5 hover:ring-2 hover:ring-blue-400 transition-all"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google Account'}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'G'}
                  </div>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-white p-3 shadow-xl border border-gray-100 z-50 text-xs">
                  <div className="border-b border-gray-100 pb-2 mb-2">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.displayName || 'Google Workspace User'}
                    </p>
                    <p className="text-gray-500 truncate">{user.email}</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded font-medium">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Google Drive Connected
                    </span>
                  </div>

                  <button
                    id="btn-header-signout"
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onSignOut();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-header-signin"
              type="button"
              disabled={isLoggingIn}
              onClick={onSignIn}
              className="gsi-material-button !h-8 !px-3"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon !h-4 !w-4 !mr-1.5">
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
                <span className="gsi-material-button-contents !text-xs">Sign in</span>
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
