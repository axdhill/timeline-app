'use client';

import React, { useState } from 'react';
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
      // Try to use the high-quality export method if available
      const timeline = timelineRef.current as HTMLDivElement & { exportHighQuality?: () => HTMLCanvasElement | null };
      let canvas: HTMLCanvasElement | null = null;
      
      if (timeline.exportHighQuality) {
        // Use the high-quality export method from Timeline component
        canvas = timeline.exportHighQuality();
      } else {
        // Fallback to finding the canvas directly
        canvas = timelineRef.current.querySelector('canvas');
      }
      
      if (!canvas) {
        console.error('Canvas not found');
        setIsExporting(false);
        return;
      }
      
      // Convert canvas to blob with maximum quality
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
      // Give some time for the export to complete before resetting
      setTimeout(() => setIsExporting(false), 500);
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