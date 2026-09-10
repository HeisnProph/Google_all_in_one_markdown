export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
}

export type ViewMode = 'hybrid' | 'split' | 'editor' | 'preview';

export interface DocumentState {
  id: string | null; // Google Drive file ID if connected, or null for local
  name: string;
  content: string;
  isDirty: boolean;
  lastSavedAt: Date | null;
  source: 'drive' | 'local' | 'template';
  driveFileMetadata?: DriveFile;
}

export interface PdfExportOptions {
  paperSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  marginSize: 'compact' | 'normal' | 'relaxed';
  theme: 'modern' | 'academic' | 'technical' | 'minimal';
  showPageNumbers: boolean;
  showTitleHeader: boolean;
  customHeaderTitle: string;
  customFooterNote: string;
}

export interface MarkdownTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Workspace' | 'Engineering' | 'General';
  content: string;
}
