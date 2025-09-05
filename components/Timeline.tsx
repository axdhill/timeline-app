'use client';

import React, { useRef, useEffect, forwardRef } from 'react';
import { format, differenceInMonths, addMonths, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { Project, Swimlane, TimelineSettings } from '@/lib/types';

interface TimelineProps {
  projects: Project[];
  swimlanes: Swimlane[];
  settings: TimelineSettings;
}

export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  ({ projects, swimlanes, settings }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const timelineStart = startOfMonth(settings.startDate);
    const timelineEnd = endOfMonth(settings.endDate);
    const totalMonths = differenceInMonths(timelineEnd, timelineStart) + 1;
    const totalDays = differenceInDays(timelineEnd, timelineStart) + 1;

    const MONTH_WIDTH = 120;
    const SWIMLANE_HEIGHT = 80;
    const HEADER_HEIGHT = 60;
    const YEAR_WIDTH = 60;
    const PADDING = 20;

    const canvasWidth = PADDING + (totalMonths * MONTH_WIDTH) + YEAR_WIDTH + PADDING;
    const canvasHeight = HEADER_HEIGHT + (swimlanes.length * SWIMLANE_HEIGHT) + PADDING;

    const drawTimeline = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Clear canvas
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw header with months
      ctx.strokeStyle = settings.gridColor;
      ctx.fillStyle = settings.textColor;
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.lineWidth = 1;

      let currentDate = new Date(timelineStart);
      for (let i = 0; i < totalMonths; i++) {
        const x = PADDING + (i * MONTH_WIDTH);
        
        // Draw month label
        const monthLabel = format(currentDate, settings.monthFormat === 'short' ? 'MMM' : 'MMMM');
        ctx.fillStyle = settings.textColor;
        ctx.textAlign = 'center';
        ctx.fillText(monthLabel, x + MONTH_WIDTH / 2, 25);
        
        // Draw vertical grid lines
        if (settings.showGrid) {
          ctx.strokeStyle = settings.gridColor;
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
          ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
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
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(swimlane.name, PADDING + 10, y + 20);
        
        // Draw horizontal grid line
        if (settings.showGrid) {
          ctx.strokeStyle = settings.gridColor;
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
            // Draw range bar
            const startDays = differenceInDays(project.startDate, timelineStart);
            const endDays = differenceInDays(project.endDate, timelineStart);
            const startX = PADDING + (startDays / totalDays) * (totalMonths * MONTH_WIDTH);
            const endX = PADDING + (endDays / totalDays) * (totalMonths * MONTH_WIDTH);
            const barY = y + SWIMLANE_HEIGHT / 2 - 10;
            
            ctx.fillStyle = project.color;
            ctx.fillRect(startX, barY, endX - startX, 20);
            
            // Draw project name
            ctx.fillStyle = '#ffffff';
            ctx.font = '11px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            const textWidth = ctx.measureText(project.name).width;
            if (textWidth < (endX - startX - 10)) {
              ctx.fillText(project.name, (startX + endX) / 2, barY + 14);
            }
          } else if (project.type === 'milestone' && project.deliveryDate) {
            // Draw milestone triangle
            const days = differenceInDays(project.deliveryDate, timelineStart);
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
            ctx.font = '10px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(project.name, x, triangleY + 22);
          }
        });
      });

      // Draw border
      ctx.strokeStyle = settings.gridColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(PADDING, HEADER_HEIGHT, totalMonths * MONTH_WIDTH, swimlanes.length * SWIMLANE_HEIGHT);
    };

    useEffect(() => {
      drawTimeline();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projects, swimlanes, settings]);

    return (
      <div ref={ref} className="overflow-auto bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-bold mb-4" style={{ color: settings.textColor }}>
          {settings.title}
        </h2>
        <div ref={containerRef} className="relative">
          <canvas 
            ref={canvasRef} 
            className="block"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>
    );
  }
);

Timeline.displayName = 'Timeline';