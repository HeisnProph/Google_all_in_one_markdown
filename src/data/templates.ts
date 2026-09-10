import { MarkdownTemplate } from '../types';

export const MARKDOWN_TEMPLATES: MarkdownTemplate[] = [
  {
    id: 'welcome-guide',
    title: 'Workspace Markdown Guide',
    description: 'Overview of features: real-time preview, Google Drive sync, formatting, and PDF export.',
    category: 'General',
    content: `# Workspace Markdown Editor

Welcome to **Workspace Markdown Editor** — designed for Google Workspace and Google Drive workflows. Easily create, edit, live-preview, and export Markdown documents directly to PDF.

---

## 🚀 Key Features

- **Real-time Live Preview**: View changes instantaneously with synchronized side-by-side editing.
- **Google Drive Integration**: Open existing files from Google Drive, create new ones, and save updates with one click.
- **High-Fidelity PDF Export**: Export to cleanly paginated A4 or Letter PDF documents with customizable themes and headers.
- **Rich GFM Markdown**: Full support for tables, checklists, inline code, code blocks, and blockquotes.

---

## 📋 Task Checklist

- [x] Sign in with Google to enable Google Drive access
- [x] Edit document content in real-time
- [ ] Try modifying this document and previewing live updates
- [ ] Click **Export PDF** in the top navigation to download as PDF
- [ ] Save back to Google Drive

---

## 📊 Sample Data Table

| Feature | Supported | Description |
| :--- | :---: | :--- |
| **Real-time Rendering** | ✅ Yes | Instant dual-pane rendering |
| **Google Drive Sync** | ✅ Yes | Direct OAuth integration |
| **PDF Export** | ✅ Yes | Native vector & high-res canvas |
| **Markdown Import** | ✅ Yes | Drag & drop or Drive picker |

---

## 💡 Code Sample

\`\`\`typescript
// Export markdown directly to PDF in Google Workspace
async function exportDocument(docName: string): Promise<void> {
  const content = document.getElementById('markdown-preview');
  console.log(\`Generating PDF for \${docName}...\`);
  await generatePdfFromElement(content, {
    paperSize: 'a4',
    theme: 'modern',
  });
}
\`\`\`

> **Pro Tip**: Use keyboard shortcuts like \`Ctrl/Cmd + B\` for bold, \`Ctrl/Cmd + I\` for italic, and \`Ctrl/Cmd + S\` to save!
`,
  },
  {
    id: 'project-spec',
    title: 'Software Design & Project Spec',
    description: 'Technical architecture specification with requirements, diagrams, and milestone tracking.',
    category: 'Engineering',
    content: `# Technical Architecture & System Specification

**Project Title**: Cloud Sync & Markdown Workspace Integration  
**Owner**: Google Workspace Engineering Team  
**Status**: \`Draft\` | **Version**: 1.2.0  
**Date**: September 2026  

---

## 1. Executive Summary

This document outlines the architecture for a high-performance Markdown editing tool built natively for Google Workspace users. The system delivers low-latency editing, seamless Google Drive file persistence, and publication-ready PDF exports.

### 1.1 Objectives & Non-Goals

#### Objectives
1. Provide zero-latency live preview of GitHub Flavored Markdown (GFM).
2. Direct integration with Google Drive files using minimal OAuth permissions (\`drive.file\`).
3. Generate standard compliant PDF documents with consistent pagination and print media queries.

#### Non-Goals
- Replacing full-fledged WYSIWYG word processors like Google Docs.
- Heavyweight server-side database storage when user Drive storage is available.

---

## 2. System Architecture

\`\`\`text
+-----------------------+         +----------------------------+
|  User Browser Client  | <=====> | Google Drive REST API (v3) |
| (React + Vite + GFM)  |         +----------------------------+
+-----------------------+                       |
           |                                    v
           +----------------------> [ User Drive Storage ]
           |
           v
+-----------------------+
|  PDF Generation Engine|
| (Vector Print / jsPDF)|
+-----------------------+
\`\`\`

### 2.1 Component Overview

- **Editor Engine**: Controlled input with history stacks and markdown hotkey bindings.
- **Live Preview Renderer**: GFM parsing pipeline including table alignments and checklist mutations.
- **Drive Connector**: OAuth token manager with in-memory caching and multipart upload protocol.
- **PDF Renderer**: Supports custom margins, typography presets, and pagination headers.

---

## 3. Milestones & Implementation Roadmap

- [x] Implement dual-pane split view with responsive breakpoints
- [x] Configure Google Drive OAuth client with \`drive.file\` scope
- [x] Build live Markdown syntax renderer with code highlight styling
- [ ] Add custom header & footer formatting for exported documents
- [ ] Support custom CSS print injection
`,
  },
  {
    id: 'meeting-notes',
    title: 'Meeting Notes & Action Items',
    description: 'Meeting agenda, attendee list, key discussion points, and decision log.',
    category: 'Workspace',
    content: `# Team Sprint Planning & Strategy Notes

**Date**: September 10, 2026  
**Time**: 10:00 AM – 11:00 AM PST  
**Meeting Lead**: Alex Rivera  
**Attendees**: Sarah Chen, Marcus Vance, Elena Rostova, David Kim  

---

## 🎯 Meeting Goals

1. Review Q3 deliverable status and deployment timeline.
2. Finalize feature specs for Workspace Marketplace submission.
3. Assign sprint action items and unblock cross-team dependencies.

---

## 📝 Discussion Topics

### Topic 1: Google Workspace Marketplace Requirements
- Reviewed asset guidelines, privacy policy links, and OAuth consent screen brand approval.
- Verified that requested scope is limited to \`https://www.googleapis.com/auth/drive.file\` for least privilege compliance.
- UI must follow Material Design and Google Workspace design tenets.

### Topic 2: PDF Export Formatting & Print Quality
- Discussed customer feedback requesting both instant PDF download and browser-native vector print dialog.
- Added presets for A4 and US Letter sizes to accommodate international enterprise customers.

---

## ✅ Action Items & Owners

- [ ] **Sarah**: Finalize Google Workspace Marketplace banner graphics (440x280 and 220x140).
- [ ] **Marcus**: Perform security check on token caching logic.
- [ ] **David**: Add unit tests for multipart file upload boundary handling.
- [ ] **Elena**: Review user documentation and prepare release notes.

---

## 📌 Decisions Log

| Decision ID | Summary | Rationale | Approved By |
| :--- | :--- | :--- | :--- |
| **DEC-104** | Use \`drive.file\` scope only | Minimize security footprint and ease approval | All Leads |
| **DEC-105** | Dual PDF engine | Support both direct download and print vector dialog | Engineering |
`,
  },
];
