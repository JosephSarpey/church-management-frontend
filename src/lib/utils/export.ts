import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export data to CSV file
 */
export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export HTML element to PDF
 */
export const exportToPDF = async (
  elementId: string, 
  filename: string,
  options?: {
    title?: string;
    orientation?: 'portrait' | 'landscape';
  }
) => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  try {
    // Capture the element as canvas with options to avoid color parsing issues
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        // Remove any elements that might have problematic CSS
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          // Remove all SVG elements as they often contain lab() colors
          const svgElements = clonedElement.querySelectorAll('svg');
          svgElements.forEach((svg) => {
            svg.remove();
          });

          // Force standard colors on all remaining elements
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            try {
              // Override any inline styles that might have lab() colors
              htmlEl.style.color = htmlEl.style.color || '';
              htmlEl.style.backgroundColor = htmlEl.style.backgroundColor || '';
              htmlEl.style.borderColor = htmlEl.style.borderColor || '';
            } catch {
              // Silently ignore style errors
            }
          });
        }
      },
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = options?.orientation === 'landscape' ? 297 : 210; // A4 size in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: options?.orientation || 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Add title if provided
    if (options?.title) {
      pdf.setFontSize(16);
      pdf.text(options.title, 15, 15);
      pdf.addImage(imgData, 'PNG', 10, 25, imgWidth - 20, imgHeight);
    } else {
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth - 20, imgHeight);
    }

    // Save PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Format date for filename
 */
export const getDateRangeFilename = (from?: Date, to?: Date): string => {
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  if (from && to) {
    return `${formatDate(from)}_to_${formatDate(to)}`;
  } else if (from) {
    return formatDate(from);
  } else {
    return new Date().toISOString().split('T')[0];
  }
};
