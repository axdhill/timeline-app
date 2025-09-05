'use client';

import React, { useRef, useEffect, forwardRef } from 'react';
import { format, differenceInMonths, addMonths, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { Project, Swimlane, TimelineSettings } from '@/lib/types';
import { parseDate } from '@/lib/dateUtils';

interface TimelineProps {
  projects: Project[];
  swimlanes: Swimlane[];
  settings: TimelineSettings;
  scaleFactor?: number; // For high-DPI export
}

export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  ({ projects, swimlanes, settings, scaleFactor = 1 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Validate and safely parse dates
    const validStartDate = parseDate(settings.startDate) || new Date();
    const validEndDate = parseDate(settings.endDate) || new Date(new Date().getFullYear(), 11, 31);
    
    const timelineStart = startOfMonth(validStartDate);
    const timelineEnd = endOfMonth(validEndDate);
    const totalMonths = Math.max(1, differenceInMonths(timelineEnd, timelineStart) + 1);
    const totalDays = Math.max(1, differenceInDays(timelineEnd, timelineStart) + 1);

    // Scale dimensions for high-DPI
    const scale = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) * scaleFactor;
    const MONTH_WIDTH = 120;
    const SWIMLANE_HEIGHT = 80;
    const HEADER_HEIGHT = 60;
    const YEAR_WIDTH = 60;
    const PADDING = 20;

    const canvasWidth = PADDING + (totalMonths * MONTH_WIDTH) + YEAR_WIDTH + PADDING;
    const canvasHeight = HEADER_HEIGHT + (swimlanes.length * SWIMLANE_HEIGHT) + PADDING;

    const drawTimeline = (exportScale: number = 1) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d', { alpha: false });
      if (!canvas || !ctx) return;

      // Set actual canvas size (scaled for high DPI)
      const actualScale = exportScale || scale;
      canvas.width = canvasWidth * actualScale;
      canvas.height = canvasHeight * actualScale;

      // Set display size (CSS pixels)
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      // Scale context for high DPI
      ctx.scale(actualScale, actualScale);

      // Enable better text rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Clear canvas with background
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Set better font rendering
      const baseFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      
      // Draw header with months
      ctx.strokeStyle = settings.gridColor;
      ctx.fillStyle = settings.textColor;
      ctx.font = `600 14px ${baseFont}`;
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 1;

      let currentDate = new Date(timelineStart);
      for (let i = 0; i < totalMonths; i++) {
        const x = PADDING + (i * MONTH_WIDTH);
        
        // Draw month label
        const monthLabel = format(currentDate, settings.monthFormat === 'short' ? 'MMM' : 'MMMM');
        ctx.fillStyle = settings.textColor;
        ctx.textAlign = 'center';
        ctx.font = `600 14px ${baseFont}`;
        ctx.fillText(monthLabel, x + MONTH_WIDTH / 2, 25);
        
        // Draw vertical grid lines
        if (settings.showGrid) {
          ctx.strokeStyle = settings.gridColor;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(x, HEADER_HEIGHT);
          ctx.lineTo(x, canvasHeight);
          ctx.stroke();
        }
        
        currentDate = addMonths(currentDate, 1);
      }

      // Draw year labels
      if (settings.showYearLabels) {
        const years = new Set<number>();
        currentDate = new Date(timelineStart);
        for (let i = 0; i < totalMonths; i++) {
          years.add(currentDate.getFullYear());
          currentDate = addMonths(currentDate, 1);
        }
        
        let yOffset = 0;
        years.forEach(year => {
          ctx.fillStyle = settings.textColor;
          ctx.font = `700 16px ${baseFont}`;
          ctx.textAlign = 'left';
          ctx.fillText(year.toString(), canvasWidth - YEAR_WIDTH + 10, HEADER_HEIGHT + 30 + (yOffset * 30));
          yOffset++;
        });
      }

      // Draw swimlanes
      const sortedSwimlanes = [...swimlanes].sort((a, b) => a.order - b.order);
      sortedSwimlanes.forEach((swimlane, index) => {
        const y = HEADER_HEIGHT + (index * SWIMLANE_HEIGHT);
        
        // Draw swimlane background
        ctx.fillStyle = swimlane.color + '10';
        ctx.fillRect(PADDING, y, totalMonths * MONTH_WIDTH, SWIMLANE_HEIGHT);
        
        // Draw swimlane label
        ctx.fillStyle = settings.textColor;
        ctx.font = `700 14px ${baseFont}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(swimlane.name, PADDING + 10, y + 8);
        
        // Draw horizontal grid line
        if (settings.showGrid) {
          ctx.strokeStyle = settings.gridColor;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(PADDING, y);
          ctx.lineTo(PADDING + totalMonths * MONTH_WIDTH, y);
          ctx.stroke();
        }
        
        // Draw ticker tape for this swimlane
        currentDate = new Date(timelineStart);
        for (let i = 0; i < totalMonths; i++) {
          const x = PADDING + (i * MONTH_WIDTH);
          
          // Draw month ticks
          for (let tick = 0; tick < 4; tick++) {
            const tickX = x + (tick * MONTH_WIDTH / 4);
            ctx.strokeStyle = settings.gridColor;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(tickX, y + SWIMLANE_HEIGHT - 10);
            ctx.lineTo(tickX, y + SWIMLANE_HEIGHT - 5);
            ctx.stroke();
          }
          
          currentDate = addMonths(currentDate, 1);
        }
        
        // Draw projects in this swimlane
        const swimlaneProjects = projects.filter(p => p.swimlaneId === swimlane.id);
        swimlaneProjects.forEach(project => {
          if (project.type === 'range' && project.startDate && project.endDate) {
            // Validate project dates
            const validStartDate = parseDate(project.startDate);
            const validEndDate = parseDate(project.endDate);
            
            if (!validStartDate || !validEndDate) return;
            
            // Draw range bar
            const startDays = differenceInDays(validStartDate, timelineStart);
            const endDays = differenceInDays(validEndDate, timelineStart);
            const startX = PADDING + (startDays / totalDays) * (totalMonths * MONTH_WIDTH);
            const endX = PADDING + (endDays / totalDays) * (totalMonths * MONTH_WIDTH);
            const barY = y + SWIMLANE_HEIGHT / 2 - 10;
            
            // Draw bar with slight rounding
            const radius = 2;
            ctx.fillStyle = project.color;
            ctx.beginPath();
            ctx.moveTo(startX + radius, barY);
            ctx.lineTo(endX - radius, barY);
            ctx.quadraticCurveTo(endX, barY, endX, barY + radius);
            ctx.lineTo(endX, barY + 20 - radius);
            ctx.quadraticCurveTo(endX, barY + 20, endX - radius, barY + 20);
            ctx.lineTo(startX + radius, barY + 20);
            ctx.quadraticCurveTo(startX, barY + 20, startX, barY + 20 - radius);
            ctx.lineTo(startX, barY + radius);
            ctx.quadraticCurveTo(startX, barY, startX + radius, barY);
            ctx.closePath();
            ctx.fill();
            
            // Draw project name
            ctx.fillStyle = '#ffffff';
            ctx.font = `600 12px ${baseFont}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textWidth = ctx.measureText(project.name).width;
            if (textWidth < (endX - startX - 10)) {
              ctx.fillText(project.name, (startX + endX) / 2, barY + 10);
            }
          } else if (project.type === 'milestone' && project.deliveryDate) {
            // Validate delivery date
            const validDeliveryDate = parseDate(project.deliveryDate);
            
            if (!validDeliveryDate) return;
            
            // Draw milestone triangle
            const days = differenceInDays(validDeliveryDate, timelineStart);
            const x = PADDING + (days / totalDays) * (totalMonths * MONTH_WIDTH);
            const triangleY = y + SWIMLANE_HEIGHT / 2;
            
            ctx.fillStyle = project.color;
            ctx.beginPath();
            ctx.moveTo(x, triangleY - 12);
            ctx.lineTo(x - 8, triangleY + 8);
            ctx.lineTo(x + 8, triangleY + 8);
            ctx.closePath();
            ctx.fill();
            
            // Draw project name
            ctx.fillStyle = settings.textColor;
            ctx.font = `600 11px ${baseFont}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(project.name, x, triangleY + 12);
          }
        });
      });

      // Draw border
      ctx.strokeStyle = settings.gridColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(PADDING, HEADER_HEIGHT, totalMonths * MONTH_WIDTH, swimlanes.length * SWIMLANE_HEIGHT);
    };

    useEffect(() => {
      drawTimeline();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projects, swimlanes, settings]);

    // Expose draw method for high-quality export
    useEffect(() => {
      if (ref && typeof ref === 'object' && ref.current) {
        (ref.current as HTMLDivElement & { exportHighQuality?: () => HTMLCanvasElement | null }).exportHighQuality = () => {
          drawTimeline(4); // 4x scale for export
          return canvasRef.current;
        };
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref]);

    return (
      <div ref={ref} className="overflow-auto bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-bold mb-4" style={{ color: settings.textColor }}>
          {settings.title}
        </h2>
        <div ref={containerRef} className="relative">
          <canvas 
            ref={canvasRef} 
            className="block"
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              imageRendering: 'crisp-edges'
            }}
          />
        </div>
      </div>
    );
  }
);

Timeline.displayName = 'Timeline';