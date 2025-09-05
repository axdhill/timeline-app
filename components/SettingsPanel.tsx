'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { TimelineSettings } from '@/lib/types';
import { format } from 'date-fns';

interface SettingsPanelProps {
  settings: TimelineSettings;
  onUpdate: (settings: TimelineSettings) => void;
}

export function SettingsPanel({ settings, onUpdate }: SettingsPanelProps) {
  const handleChange = (key: keyof TimelineSettings, value: string | boolean | Date) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Timeline Settings</h3>
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
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
            <input
              type="date"
              value={format(settings.startDate, 'yyyy-MM-dd')}
              onChange={(e) => handleChange('startDate', new Date(e.target.value))}
              className="w-full px-3 py-2 border rounded text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">End Date</label>
            <input
              type="date"
              value={format(settings.endDate, 'yyyy-MM-dd')}
              onChange={(e) => handleChange('endDate', new Date(e.target.value))}
              className="w-full px-3 py-2 border rounded text-sm text-gray-900"
            />
          </div>
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
        </div>
      </div>
    </div>
  );
}