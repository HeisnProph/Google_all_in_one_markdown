import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PdfExportOptions } from '../types';

export const DEFAULT_PDF_OPTIONS: PdfExportOptions = {
  paperSize: 'a4',
  orientation: 'portrait',
  marginSize: 'normal',
  theme: 'modern',
  showPageNumbers: true,
  showTitleHeader: true,
  customHeaderTitle: '',
  customFooterNote: 'Generated with Workspace Markdown Editor',
};

/**
 * Generate and download a PDF file from an HTML element using html2canvas & jsPDF
 */
export async function generatePdfFromElement(
  element: HTMLElement,
  options: PdfExportOptions,
  filename: string
): Promise<void> {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // Clone element into a hidden printable wrapper to avoid affecting current UI display
  const printWrapper = document.createElement('div');
  printWrapper.className = `pdf-export-render theme-${options.theme}`;
  printWrapper.style.position = 'absolute';
  printWrapper.style.left = '-9999px';
  printWrapper.style.top = '0';
  printWrapper.style.width = options.orientation === 'portrait' ? '794px' : '1123px'; // A4 width at 96 DPI
  printWrapper.style.backgroundColor = options.theme === 'minimal' ? '#ffffff' : '#ffffff';
  printWrapper.style.color = '#1f2937';
  printWrapper.style.padding =
    options.marginSize === 'compact' ? '24px 32px' : options.marginSize === 'relaxed' ? '56px 64px' : '40px 48px';
  printWrapper.style.fontFamily =
    options.theme === 'academic'
      ? '"Times New Roman", Times, Georgia, serif'
      : options.theme === 'technical'
      ? '"JetBrains Mono", Consolas, Menlo, monospace'
      : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  // Add custom header if requested
  if (options.showTitleHeader && (options.customHeaderTitle || filename)) {
    const headerDiv = document.createElement('div');
    headerDiv.style.borderBottom = '1px solid #e5e7eb';
    headerDiv.style.paddingBottom = '12px';
    headerDiv.style.marginBottom = '24px';
    headerDiv.style.display = 'flex';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.fontSize = '12px';
    headerDiv.style.color = '#6b7280';

    const titleSpan = document.createElement('span');
    titleSpan.style.fontWeight = '600';
    titleSpan.textContent = options.customHeaderTitle || filename.replace(/\.(md|markdown|txt)$/i, '');
    
    const dateSpan = document.createElement('span');
    dateSpan.textContent = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    headerDiv.appendChild(titleSpan);
    headerDiv.appendChild(dateSpan);
    printWrapper.appendChild(headerDiv);
  }

  // Clone content
  const clone = element.cloneNode(true) as HTMLElement;
  printWrapper.appendChild(clone);

  // Add custom footer if requested
  if (options.customFooterNote) {
    const footerDiv = document.createElement('div');
    footerDiv.style.borderTop = '1px solid #e5e7eb';
    footerDiv.style.paddingTop = '12px';
    footerDiv.style.marginTop = '32px';
    footerDiv.style.fontSize = '11px';
    footerDiv.style.color = '#9ca3af';
    footerDiv.style.textAlign = 'center';
    footerDiv.textContent = options.customFooterNote;
    printWrapper.appendChild(footerDiv);
  }

  document.body.appendChild(printWrapper);

  try {
    const canvas = await html2canvas(printWrapper, {
      scale: 2, // High DPI for clear vector-like appearance
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Page dimensions in mm
    const isA4 = options.paperSize === 'a4';
    const isPortrait = options.orientation === 'portrait';

    const pageWidth = isA4 ? (isPortrait ? 210 : 297) : (isPortrait ? 215.9 : 279.4);
    const pageHeight = isA4 ? (isPortrait ? 297 : 210) : (isPortrait ? 279.4 : 215.9);

    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.paperSize,
    });

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Remaining pages
    let pageNum = 1;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      pageNum++;
      heightLeft -= pageHeight;
    }

    // Add page numbers if requested
    if (options.showPageNumbers && pageNum > 1) {
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
      }
    }

    pdf.save(safeFilename);
  } finally {
    document.body.removeChild(printWrapper);
  }
}

/**
 * Trigger native browser print dialog with styling optimized for paper/PDF export
 */
export function triggerBrowserPrint(): void {
  window.print();
}
