
# Workspace Markdown Editor

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

```typescript
// Export markdown directly to PDF in Google Workspace
async function exportDocument(docName: string): Promise<void> {
  const content = document.getElementById('markdown-preview');
  console.log(`Generating PDF for ${docName}...`);
  await generatePdfFromElement(content, {
    paperSize: 'a4',
    theme: 'modern',
  });
}
```

> **Pro Tip**: Use keyboard shortcuts like `Ctrl/Cmd + B` for bold, `Ctrl/Cmd + I` for italic, and `Ctrl/Cmd + S` to save!


