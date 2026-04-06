// File conversion utilities for converting various formats to PDF

import { PDFDocument, rgb } from 'pdf-lib';

/**
 * Convert an image file to PDF
 */
export async function convertImageToPdf(file: File): Promise<File> {
  try {
    const pdfDoc = await PDFDocument.create();
    
    // Read the image file
    const imageBytes = await file.arrayBuffer();
    
    let image;
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(imageBytes);
    } else if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      image = await convertImageToEmbeddable(pdfDoc, file);
    }
    
    // Image dimensions
    const { width: imgWidth, height: imgHeight } = image.scale(1);
    const isLandscape = imgWidth > imgHeight;
    
    // Page dimensions (A4 in points)
    const baseWidth = 595.28;
    const baseHeight = 841.89;
    
    // Set page orientation based on image aspect ratio
    const pageWidth = isLandscape ? baseHeight : baseWidth;
    const pageHeight = isLandscape ? baseWidth : baseHeight;
    
    const margin = 36; // 0.5 inch margins
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);
    
    // Calculate scaling to fit available area
    const scaleX = availableWidth / imgWidth;
    const scaleY = availableHeight / imgHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't upscale unnecessarily
    
    const finalWidth = imgWidth * scale;
    const finalHeight = imgHeight * scale;
    
    // Center the image
    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;
    
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Draw the image on the page
    page.drawImage(image, {
      x,
      y,
      width: finalWidth,
      height: finalHeight,
    });
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Create a new File object
    const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const pdfFileName = file.name.replace(/\.[^/.]+$/, '') + '.pdf';
    
    return new File([pdfBlob], pdfFileName, { type: 'application/pdf' });
  } catch (error) {
    console.error('Error converting image to PDF:', error);
    throw new Error('Failed to convert image to PDF');
  }
}

/**
 * Convert other image formats to embeddable format
 */
async function convertImageToEmbeddable(pdfDoc: PDFDocument, file: File): Promise<ReturnType<PDFDocument['embedPng']>> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        // Convert to PNG
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const pngBytes = await blob.arrayBuffer();
              const image = await pdfDoc.embedPng(pngBytes);
              resolve(image);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('Failed to convert image'));
          }
        }, 'image/png');
      } else {
        reject(new Error('Canvas context not available'));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert text file to PDF
 */
export async function convertTextToPdf(file: File): Promise<File> {
  try {
    const text = await file.text();
    const pdfDoc = await PDFDocument.create();
    
    // Page settings
    const pageWidth = 595; // A4 width
    const pageHeight = 842; // A4 height
    const margin = 50;
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    const maxWidth = pageWidth - (margin * 2);
    
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;
    
    // Split text into lines
    const lines = text.split('\n');
    
    for (const line of lines) {
      // Word wrap long lines
      const words = line.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = testLine.length * (fontSize * 0.6); // Rough estimate
        
        if (textWidth > maxWidth && currentLine) {
          // Draw current line and start new one
          if (yPosition < margin + lineHeight) {
            // Need new page
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
          }
          
          currentPage.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            color: rgb(0, 0, 0),
          });
          
          yPosition -= lineHeight;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      // Draw remaining text
      if (currentLine) {
        if (yPosition < margin + lineHeight) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin;
        }
        
        currentPage.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
        
        yPosition -= lineHeight;
      }
    }
    
    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const pdfFileName = file.name.replace(/\.[^/.]+$/, '') + '.pdf';
    
    return new File([pdfBlob], pdfFileName, { type: 'application/pdf' });
  } catch (error) {
    console.error('Error converting text to PDF:', error);
    throw new Error('Failed to convert text to PDF');
  }
}

/**
 * Convert Word document to PDF using server-side conversion
 */
export async function convertWordToPdf(file: File): Promise<File> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${baseURL}/api/file-conversion/convert-word-to-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to convert Word document');
    }

    const result = await response.json();
    
    // Convert base64 PDF data back to File
    const pdfBytes = Uint8Array.from(atob(result.pdfData), c => c.charCodeAt(0));
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    return new File([pdfBlob], result.convertedName, { type: 'application/pdf' });
  } catch (error) {
    console.error('Error converting Word to PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to convert Word document: ${errorMessage}`);
  }
}

/**
 * Main conversion function that determines the appropriate conversion method
 */
export async function convertToPdf(file: File): Promise<File> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  // Already a PDF
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return file;
  }
  
  // Image files
  if (fileType.startsWith('image/') || 
      /\.(jpg|jpeg|png|gif|bmp|webp|tiff?)$/i.test(fileName)) {
    return convertImageToPdf(file);
  }
  
  // Text files
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return convertTextToPdf(file);
  }
  
  // Word documents (now supported via server-side conversion)
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      fileName.endsWith('.docx') || 
      fileName.endsWith('.doc')) {
    return convertWordToPdf(file);
  }
  
  // Unsupported format
  throw new Error(`Unsupported file format: ${fileType}`);
}

/**
 * Check if a file can be converted to PDF
 */
export function canConvertToPdf(file: File): boolean {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  // Already PDF
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return true;
  }
  
  // Supported image formats
  if (fileType.startsWith('image/') || 
      /\.(jpg|jpeg|png|gif|bmp|webp|tiff?)$/i.test(fileName)) {
    return true;
  }
  
  // Text files
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return true;
  }
  
  // Word documents (now supported via server-side conversion)
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      fileName.endsWith('.docx') || 
      fileName.endsWith('.doc')) {
    return true;
  }
  
  return false;
}