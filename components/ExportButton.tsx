'use client';

import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  timelineRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
}

export function ExportButton({ timelineRef, filename = 'timeline' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!timelineRef.current) return;
    
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(timelineRef.current, {
        scale: 3, // High DPI
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Download className="h-4 w-4" />
      {isExporting ? 'Exporting...' : 'Export as PNG'}
    </button>
  );
}