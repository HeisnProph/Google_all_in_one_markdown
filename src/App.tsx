/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from 'firebase/auth';
import { ViewMode, DocumentState, DriveFile, MarkdownTemplate } from './types';
import { MARKDOWN_TEMPLATES } from './data/templates';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/firebaseAuth';
import {
  getDriveFile,
  updateDriveFile,
  createDriveFile,
  extractDriveOpenWithFileId,
} from './services/googleDriveService';
import { Header } from './components/Header';
import { EditorToolbar } from './components/EditorToolbar';
import { MarkdownEditor } from './components/MarkdownEditor';
import { AllInOneEditor } from './components/AllInOneEditor';
import { MarkdownPreview } from './components/MarkdownPreview';
import { DriveFilePickerModal } from './components/DriveFilePickerModal';
import { PdfExportModal } from './components/PdfExportModal';
import { TemplatesModal } from './components/TemplatesModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Check, Info, AlertCircle } from 'lucide-react';

const LOCAL_STORAGE_DOC_KEY = 'workspace_markdown_doc_v1';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Document state
  const [doc, setDoc] = useState<DocumentState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DOC_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          id: parsed.id || null,
          name: parsed.name || 'Untitled Document.md',
          content: parsed.content || MARKDOWN_TEMPLATES[0].content,
          isDirty: false,
          lastSavedAt: parsed.lastSavedAt ? new Date(parsed.lastSavedAt) : null,
          source: parsed.source || 'local',
          driveFileMetadata: parsed.driveFileMetadata,
        };
      }
    } catch {
      // Fallback
    }
    return {
      id: null,
      name: 'Workspace-Guide.md',
      content: MARKDOWN_TEMPLATES[0].content,
      isDirty: false,
      lastSavedAt: null,
      source: 'template',
    };
  });

  // History stack for Undo/Redo
  const [history, setHistory] = useState<string[]>([doc.content]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isUndoRedoAction = useRef(false);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('hybrid');
  const [syncScroll, setSyncScroll] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modals state
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);

  // Confirm dialog state (Destructive operation check for Google Drive overwrite)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(
    null
  );

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Refs for scrolling and element export
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const isEditorScrolling = useRef(false);
  const isPreviewScrolling = useRef(false);

  // Save local draft to localStorage on content change
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_DOC_KEY,
        JSON.stringify({
          id: doc.id,
          name: doc.name,
          content: doc.content,
          lastSavedAt: doc.lastSavedAt,
          source: doc.source,
          driveFileMetadata: doc.driveFileMetadata,
        })
      );
    } catch (e) {
      console.warn('Could not save draft to local storage', e);
    }
  }, [doc]);

  // Initialize Firebase Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setIsAuthenticated(true);
        // Check if there is a pending Drive "Open with" file
        const driveFileId = extractDriveOpenWithFileId();
        if (driveFileId && token) {
          loadDriveFileById(driveFileId);
        }
      },
      () => {
        setUser(null);
        setIsAuthenticated(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setIsAuthenticated(true);
        showToast('Signed in to Google Workspace successfully!', 'success');

        // Check if opened with file ID
        const driveFileId = extractDriveOpenWithFileId();
        if (driveFileId) {
          await loadDriveFileById(driveFileId);
        }
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      showToast(err.message || 'Google sign-in failed. Please check popup permissions.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setIsAuthenticated(false);
      showToast('Signed out of Google Workspace.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error signing out', 'error');
    }
  };

  // Content change handler with history stack
  const handleContentChange = useCallback((newContent: string) => {
    setDoc((prev) => ({
      ...prev,
      content: newContent,
      isDirty: true,
    }));

    if (!isUndoRedoAction.current) {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        next.push(newContent);
        if (next.length > 50) next.shift(); // Limit history depth
        return next;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    }
    isUndoRedoAction.current = false;
  }, [historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prevContent = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setDoc((prev) => ({ ...prev, content: prevContent, isDirty: true }));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const nextContent = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setDoc((prev) => ({ ...prev, content: nextContent, isDirty: true }));
    }
  };

  // Synchronized Scrolling Logic
  const handleEditorScroll = (scrollTop: number, scrollHeight: number, clientHeight: number) => {
    if (!syncScroll || isPreviewScrolling.current || !previewRef.current) return;
    isEditorScrolling.current = true;

    const maxEditorScroll = scrollHeight - clientHeight;
    if (maxEditorScroll <= 0) return;
    const scrollPercentage = scrollTop / maxEditorScroll;

    const preview = previewRef.current;
    const maxPreviewScroll = preview.scrollHeight - preview.clientHeight;
    preview.scrollTop = scrollPercentage * maxPreviewScroll;

    setTimeout(() => {
      isEditorScrolling.current = false;
    }, 50);
  };

  const handlePreviewScroll = (scrollTop: number, scrollHeight: number, clientHeight: number) => {
    if (!syncScroll || isEditorScrolling.current || !editorRef.current) return;
    isPreviewScrolling.current = true;

    const maxPreviewScroll = scrollHeight - clientHeight;
    if (maxPreviewScroll <= 0) return;
    const scrollPercentage = scrollTop / maxPreviewScroll;

    const editor = editorRef.current;
    const maxEditorScroll = editor.scrollHeight - editor.clientHeight;
    editor.scrollTop = scrollPercentage * maxEditorScroll;

    setTimeout(() => {
      isPreviewScrolling.current = false;
    }, 50);
  };

  // Toolbar text insertion helper
  const handleInsertText = (before: string, after = '', defaultText = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = doc.content.substring(start, end) || defaultText;
    const replacement = before + selected + after;
    const updated = doc.content.substring(0, start) + replacement + doc.content.substring(end);

    handleContentChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 0);
  };

  // Interactive Task List Toggling from Preview
  const handleToggleTask = (taskIndex: number, currentChecked: boolean) => {
    let count = 0;
    const regex = /^(\s*[-*+]\s+\[)( |x|X)(\]\s+.*)$/gm;
    const newContent = doc.content.replace(regex, (match, prefix, check, suffix) => {
      if (count === taskIndex) {
        count++;
        return `${prefix}${currentChecked ? 'x' : ' '}${suffix}`;
      }
      count++;
      return match;
    });

    handleContentChange(newContent);
  };

  // Load a file from Google Drive by ID
  const loadDriveFileById = async (fileId: string) => {
    try {
      setIsSaving(true);
      const { metadata, content } = await getDriveFile(fileId);
      setDoc({
        id: metadata.id,
        name: metadata.name,
        content: content,
        isDirty: false,
        lastSavedAt: new Date(),
        source: 'drive',
        driveFileMetadata: metadata,
      });
      setHistory([content]);
      setHistoryIndex(0);
      showToast(`Opened "${metadata.name}" from Google Drive`, 'success');
    } catch (err: any) {
      console.error('Failed to load drive file:', err);
      showToast(err.message || 'Failed to load file from Drive', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save to Google Drive with Destructive Operation confirmation
  const handleSaveToDrive = async () => {
    if (!isAuthenticated) {
      handleSignIn();
      return;
    }

    // If file already exists in Drive, show confirmation dialog before overwriting!
    if (doc.id && doc.source === 'drive') {
      setConfirmDialog({
        isOpen: true,
        title: 'Save to Google Drive',
        message: `Are you sure you want to update and overwrite "${doc.name}" in Google Drive with your current edits? This action will replace the file on Drive.`,
        onConfirm: async () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          performDriveUpdate(doc.id!, doc.content, doc.name);
        },
      });
      return;
    }

    // Otherwise, create as a new file in Drive
    handleSaveAsNewToDrive();
  };

  const performDriveUpdate = async (fileId: string, content: string, name: string) => {
    setIsSaving(true);
    try {
      const updatedMeta = await updateDriveFile(fileId, content, name);
      setDoc((prev) => ({
        ...prev,
        isDirty: false,
        lastSavedAt: new Date(),
        driveFileMetadata: updatedMeta,
      }));
      showToast(`Saved changes to "${name}" on Google Drive`, 'success');
    } catch (err: any) {
      console.error('Error updating drive file:', err);
      showToast(err.message || 'Failed to save to Google Drive', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAsNewToDrive = async () => {
    if (!isAuthenticated) {
      handleSignIn();
      return;
    }

    const defaultTitle = doc.name.trim() || 'Untitled Document.md';
    const chosenName = window.prompt('Enter file name to save in Google Drive:', defaultTitle);
    if (!chosenName || !chosenName.trim()) return;

    setIsSaving(true);
    try {
      const created = await createDriveFile(chosenName.trim(), doc.content);
      setDoc((prev) => ({
        ...prev,
        id: created.id,
        name: created.name,
        isDirty: false,
        lastSavedAt: new Date(),
        source: 'drive',
        driveFileMetadata: created,
      }));
      showToast(`Created and saved "${created.name}" in Google Drive`, 'success');
    } catch (err: any) {
      console.error('Error creating drive file:', err);
      showToast(err.message || 'Failed to save new file in Drive', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Local File
  const handleOpenLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setDoc({
        id: null,
        name: file.name,
        content: text,
        isDirty: false,
        lastSavedAt: new Date(),
        source: 'local',
      });
      setHistory([text]);
      setHistoryIndex(0);
      showToast(`Loaded "${file.name}" locally`, 'success');
    };
    reader.readAsText(file);
    // Reset file input value so user can re-open same file if desired
    e.target.value = '';
  };

  // Drag and drop local file support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (
      file.name.endsWith('.md') ||
      file.name.endsWith('.markdown') ||
      file.name.endsWith('.txt')
    ) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setDoc({
          id: null,
          name: file.name,
          content: text,
          isDirty: false,
          lastSavedAt: new Date(),
          source: 'local',
        });
        setHistory([text]);
        setHistoryIndex(0);
        showToast(`Loaded "${file.name}"`, 'success');
      };
      reader.readAsText(file);
    } else {
      showToast('Please drop a Markdown (.md) or text (.txt) file.', 'info');
    }
  };

  // Download Markdown file locally
  const handleDownloadMarkdown = () => {
    const filename = doc.name.trim().endsWith('.md')
      ? doc.name.trim()
      : `${doc.name.trim() || 'document'}.md`;
    const blob = new Blob([doc.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded "${filename}"`, 'success');
  };

  // Select Template
  const handleSelectTemplate = (template: MarkdownTemplate) => {
    setDoc({
      id: null,
      name: `${template.title.replace(/\s+/g, '-')}.md`,
      content: template.content,
      isDirty: false,
      lastSavedAt: new Date(),
      source: 'template',
    });
    setHistory([template.content]);
    setHistoryIndex(0);
    showToast(`Loaded "${template.title}" template`, 'info');
  };

  return (
    <div
      id="workspace-markdown-app"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex h-screen w-screen flex-col overflow-hidden bg-gray-100 font-sans text-gray-900"
    >
      {/* Toast Notification */}
      {toast && (
        <div
          id="app-toast-notification"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {toast.type === 'success' && <Check className="h-4 w-4 text-green-400" />}
          {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-red-400" />}
          {toast.type === 'info' && <Info className="h-4 w-4 text-blue-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Workspace Header */}
      <Header
        document={doc}
        onTitleChange={(newTitle) => setDoc((prev) => ({ ...prev, name: newTitle, isDirty: true }))}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        syncScroll={syncScroll}
        onToggleSyncScroll={() => setSyncScroll(!syncScroll)}
        onOpenDriveModal={() => setIsDrivePickerOpen(true)}
        onSaveToDrive={handleSaveToDrive}
        onSaveAsNewToDrive={handleSaveAsNewToDrive}
        onOpenLocalFile={handleOpenLocalFile}
        onDownloadMarkdown={handleDownloadMarkdown}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        user={user}
        isAuthenticated={isAuthenticated}
        isLoggingIn={isLoggingIn}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isSaving={isSaving}
      />

      {/* Editor Toolbar (Visible in Split or Editor view) */}
      {viewMode !== 'preview' && (
        <EditorToolbar
          onInsertText={handleInsertText}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          content={doc.content}
        />
      )}

      {/* Main Content Workspace (All-in-One / Split / Editor / Preview) */}
      <main id="main-workspace" className="flex-1 flex overflow-hidden relative">
        {/* All-in-One Mode (In-place Click to Edit) */}
        {viewMode === 'hybrid' && (
          <div id="all-in-one-pane" className="h-full w-full overflow-hidden">
            <AllInOneEditor
              content={doc.content}
              onChange={handleContentChange}
              onSave={handleSaveToDrive}
              onExportPdf={() => setIsPdfModalOpen(true)}
            />
          </div>
        )}

        {/* Editor Pane */}
        {viewMode !== 'preview' && viewMode !== 'hybrid' && (
          <div
            id="editor-container-pane"
            className={`h-full overflow-hidden ${
              viewMode === 'split' ? 'w-full md:w-1/2 border-r border-gray-200' : 'w-full'
            }`}
          >
            <MarkdownEditor
              value={doc.content}
              onChange={handleContentChange}
              onScroll={handleEditorScroll}
              editorRef={editorRef}
              onSave={handleSaveToDrive}
              onExportPdf={() => setIsPdfModalOpen(true)}
            />
          </div>
        )}

        {/* Live Preview Pane */}
        {viewMode !== 'editor' && viewMode !== 'hybrid' && (
          <div
            id="preview-container-pane"
            className={`h-full overflow-hidden ${
              viewMode === 'split' ? 'hidden md:block md:w-1/2' : 'w-full'
            }`}
          >
            <MarkdownPreview
              content={doc.content}
              onScroll={handlePreviewScroll}
              previewRef={previewRef}
              onToggleTask={handleToggleTask}
            />
          </div>
        )}
      </main>

      {/* Google Drive Picker Modal */}
      <DriveFilePickerModal
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        onSelectFile={async (file) => {
          await loadDriveFileById(file.id);
        }}
        onFileCreated={(file, content) => {
          setDoc({
            id: file.id,
            name: file.name,
            content: content,
            isDirty: false,
            lastSavedAt: new Date(),
            source: 'drive',
            driveFileMetadata: file,
          });
          setHistory([content]);
          setHistoryIndex(0);
          showToast(`Created "${file.name}" in Google Drive`, 'success');
        }}
        isAuthenticated={isAuthenticated}
        onSignIn={handleSignIn}
      />

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        documentTitle={doc.name.replace(/\.(md|markdown|txt)$/i, '')}
        previewElement={
          document.getElementById('markdown-preview-content') ||
          document.getElementById('markdown-preview-container')
        }
      />

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Destructive Operation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="Save & Overwrite"
        cancelLabel="Cancel"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
