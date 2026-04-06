import { PDFDocument } from 'pdf-lib';
import { convertToPdf, canConvertToPdf } from './file-conversion';

/**
 * Get page count from a PDF file using multiple detection methods
 */
export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { 
      ignoreEncryption: true
    });
    return pdfDoc.getPageCount();
  } catch (pdfError) {
    console.warn('PDFDocument.load failed, falling back to regex:', pdfError);
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          const content = new TextDecoder('latin1').decode(uint8Array);
          
          // Method 1: Count /Type /Page occurrences (most reliable regex)
          const pageMatches = content.match(/\/Type\s*\/Page(?![a-zA-Z])/g);
          if (pageMatches && pageMatches.length > 0) {
            resolve(pageMatches.length);
            return;
          }
          
          // Method 2: Look for /Count in page tree
          const countMatches = content.match(/\/Count\s+(\d+)/g);
          if (countMatches && countMatches.length > 0) {
            const counts = countMatches.map(match => {
              const num = match.match(/\/Count\s+(\d+)/);
              return num ? parseInt(num[1], 10) : 0;
            });
            const maxCount = Math.max(...counts);
            if (maxCount > 0) {
              resolve(maxCount);
              return;
            }
          }
          
          // Fallback: estimate based on file size
          const estimatedPages = Math.max(1, Math.ceil(file.size / (50 * 1024)));
          resolve(Math.min(estimatedPages, 100));
        } catch {
          resolve(1);
        }
      };
      reader.onerror = () => resolve(1);
      reader.readAsArrayBuffer(file);
    });
  }
}

export interface FileProcessResult {
  pageCount: number;
  pdfFile?: File;
}

/**
 * Get page count based on file type - converts to PDF first if needed
 * Returns both the page count and the converted PDF file if conversion happened
 */
export async function getFilePageCount(file: File): Promise<FileProcessResult> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  try {
    // If it's already a PDF, count pages directly
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      const pageCount = await getPdfPageCount(file);
      return { pageCount };
    }

    // For other supported formats, convert to PDF first then count pages
    if (canConvertToPdf(file)) {
      const pdfFile = await convertToPdf(file);
      const pageCount = await getPdfPageCount(pdfFile);
      return { pageCount, pdfFile };
    }

    // Fallback to estimation for unsupported formats
    return { pageCount: getEstimatedPageCount(file) };
  } catch (error) {
    console.warn('Error processing file, falling back to estimation:', error);
    return { pageCount: getEstimatedPageCount(file) };
  }
}

/**
 * Get estimated page count for unsupported formats (fallback)
 */
function getEstimatedPageCount(file: File): number {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Image files (1 page each)
  if (fileType.startsWith('image/') || 
      /\.(jpg|jpeg|png|gif|bmp|webp|tiff?)$/i.test(fileName)) {
    return 1;
  }

  // Word documents (estimate based on size)
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      fileName.endsWith('.docx') || 
      fileName.endsWith('.doc')) {
    const avgPageSize = 15 * 1024; // 15KB per page estimate for DOCX
    return Math.max(1, Math.ceil(file.size / avgPageSize));
  }

  // Text files (estimate based on size)
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    const avgPageSize = 2500; // ~2.5KB per page
    return Math.max(1, Math.ceil(file.size / avgPageSize));
  }

  // Default: 1 page
  return 1;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file type is supported
 */
export function isSupportedFileType(file: File): boolean {
  return canConvertToPdf(file);
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Create object URL for file preview
 */
export function createFilePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke object URL to free memory
 */
export function revokeFilePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
