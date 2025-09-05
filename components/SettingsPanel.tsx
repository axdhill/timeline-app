'use client';

import React, { useState } from 'react';
import { Settings, AlertCircle } from 'lucide-react';
import { TimelineSettings } from '@/lib/types';
import { formatDateForInput, safeDateParse, validateDateRange } from '@/lib/dateUtils';

interface SettingsPanelProps {
  settings: TimelineSettings;
  onUpdate: (settings: TimelineSettings) => void;
}

export function SettingsPanel({ settings, onUpdate }: SettingsPanelProps) {
  const [dateError, setDateError] = useState<string>('');
  const [tempStartDate, setTempStartDate] = useState(formatDateForInput(settings.startDate));
  const [tempEndDate, setTempEndDate] = useState(formatDateForInput(settings.endDate));

  const handleChange = (key: keyof TimelineSettings, value: string | boolean) => {
    onUpdate({ ...settings, [key]: value });
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    // Update temp value immediately for smooth typing
    if (type === 'start') {
      setTempStartDate(value);
    } else {
      setTempEndDate(value);
    }

    // Clear error when user is typing
    setDateError('');

    // Try to parse the date
    const parsedDate = safeDateParse(value);
    
    if (parsedDate) {
      const newStartDate = type === 'start' ? parsedDate : settings.startDate;
      const newEndDate = type === 'end' ? parsedDate : settings.endDate;
      
      const validation = validateDateRange(newStartDate, newEndDate);
      
      if (validation.isValid) {
        onUpdate({
          ...settings,
          startDate: newStartDate,
          endDate: newEndDate
        });
      } else {
        setDateError(validation.error || 'Invalid date range');
      }
    }
  };

  const handleDateBlur = () => {
    // On blur, reset to valid dates if current values are invalid
    const startParsed = safeDateParse(tempStartDate);
    const endParsed = safeDateParse(tempEndDate);
    
    if (!startParsed || !endParsed) {
      setTempStartDate(formatDateForInput(settings.startDate));
      setTempEndDate(formatDateForInput(settings.endDate));
      setDateError('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-gray-900" />
        <h3 className="text-lg font-semibold text-gray-900">Timeline Settings</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Title</label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm text-gray-900"
          />
        </div>
        
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
              <input
                type="date"
                value={tempStartDate}
                onChange={(e) => handleDateChange('start', e.target.value)}
                onBlur={handleDateBlur}
                min="1900-01-01"
                max="2100-12-31"
                className={`w-full px-3 py-2 border rounded text-sm text-gray-900 ${
                  dateError ? 'border-red-500' : ''
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">End Date</label>
              <input
                type="date"
                value={tempEndDate}
                onChange={(e) => handleDateChange('end', e.target.value)}
                onBlur={handleDateBlur}
                min="1900-01-01"
                max="2100-12-31"
                className={`w-full px-3 py-2 border rounded text-sm text-gray-900 ${
                  dateError ? 'border-red-500' : ''
                }`}
              />
            </div>
          </div>
          {dateError && (
            <div className="mt-2 flex items-center gap-1 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs">{dateError}</span>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Month Format</label>
          <select
            value={settings.monthFormat}
            onChange={(e) => handleChange('monthFormat', e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm text-gray-900"
          >
            <option value="short">Short (Jan, Feb, Mar)</option>
            <option value="long">Long (January, February, March)</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Background</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="w-12 h-8 cursor-pointer"
              />
              <input
                type="text"
                value={settings.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-sm text-gray-900"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.textColor}
                onChange={(e) => handleChange('textColor', e.target.value)}
                className="w-12 h-8 cursor-pointer"
              />
              <input
                type="text"
                value={settings.textColor}
                onChange={(e) => handleChange('textColor', e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-sm text-gray-900"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Grid Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={settings.gridColor}
              onChange={(e) => handleChange('gridColor', e.target.value)}
              className="w-12 h-8 cursor-pointer"
            />
            <input
              type="text"
              value={settings.gridColor}
              onChange={(e) => handleChange('gridColor', e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm text-gray-900"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showGrid}
              onChange={(e) => handleChange('showGrid', e.target.checked)}
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-900">Show Grid Lines</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showYearLabels}
              onChange={(e) => handleChange('showYearLabels', e.target.checked)}
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-900">Show Year Labels</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showCurrentDate}
              onChange={(e) => handleChange('showCurrentDate', e.target.checked)}
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-900">Show Current Date Line</span>
          </label>
        </div>
        
        {settings.showCurrentDate && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Current Date Line Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.currentDateColor}
                onChange={(e) => handleChange('currentDateColor', e.target.value)}
                className="w-12 h-8 cursor-pointer"
              />
              <input
                type="text"
                value={settings.currentDateColor}
                onChange={(e) => handleChange('currentDateColor', e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-sm text-gray-900"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}