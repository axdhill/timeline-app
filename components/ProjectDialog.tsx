'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import * as Select from '@radix-ui/react-select';
import { X, ChevronDown, Calendar, Triangle, AlertCircle } from 'lucide-react';
import { Project, Swimlane } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { formatDateForInput, safeDateParse, validateDateRange, parseDate } from '@/lib/dateUtils';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  swimlanes: Swimlane[];
  onSave: (project: Project) => void;
  project?: Project | null;
}

export function ProjectDialog({ open, onOpenChange, swimlanes, onSave, project }: ProjectDialogProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    swimlaneId: swimlanes[0]?.id || '',
    type: 'range',
    color: '#3B82F6',
    description: '',
  });

  const [dateStrings, setDateStrings] = useState({
    startDate: '',
    endDate: '',
    deliveryDate: ''
  });

  const [dateError, setDateError] = useState<string>('');

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        startDate: parseDate(project.startDate) || undefined,
        endDate: parseDate(project.endDate) || undefined,
        deliveryDate: parseDate(project.deliveryDate) || undefined,
      });
      setDateStrings({
        startDate: formatDateForInput(parseDate(project.startDate)),
        endDate: formatDateForInput(parseDate(project.endDate)),
        deliveryDate: formatDateForInput(parseDate(project.deliveryDate))
      });
    } else {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      
      setFormData({
        name: '',
        swimlaneId: swimlanes[0]?.id || '',
        type: 'range',
        color: '#3B82F6',
        description: '',
        startDate: today,
        endDate: nextMonth,
        deliveryDate: today
      });
      setDateStrings({
        startDate: formatDateForInput(today),
        endDate: formatDateForInput(nextMonth),
        deliveryDate: formatDateForInput(today)
      });
    }
    setDateError('');
  }, [project, swimlanes, open]);

  const handleDateChange = (field: 'startDate' | 'endDate' | 'deliveryDate', value: string) => {
    // Update the string value immediately
    setDateStrings(prev => ({ ...prev, [field]: value }));
    setDateError('');

    // Try to parse the date
    const parsedDate = safeDateParse(value);
    
    if (parsedDate) {
      const newFormData = { ...formData, [field]: parsedDate };
      
      // Validate date range if it's a range type
      if (formData.type === 'range' && field !== 'deliveryDate') {
        const startDate = field === 'startDate' ? parsedDate : formData.startDate;
        const endDate = field === 'endDate' ? parsedDate : formData.endDate;
        
        if (startDate && endDate) {
          const validation = validateDateRange(startDate, endDate);
          if (!validation.isValid) {
            setDateError(validation.error || 'Invalid date range');
            return;
          }
        }
      }
      
      setFormData(newFormData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submit
    if (formData.type === 'range') {
      const validation = validateDateRange(formData.startDate || null, formData.endDate || null);
      if (!validation.isValid) {
        setDateError(validation.error || 'Please enter valid dates');
        return;
      }
    } else if (!formData.deliveryDate) {
      setDateError('Please enter a delivery date');
      return;
    }
    
    const projectData: Project = {
      id: project?.id || generateId(),
      name: formData.name || 'Untitled Project',
      swimlaneId: formData.swimlaneId || swimlanes[0]?.id || '',
      type: formData.type || 'range',
      color: formData.color || '#3B82F6',
      description: formData.description,
      startDate: formData.type === 'range' ? formData.startDate : undefined,
      endDate: formData.type === 'range' ? formData.endDate : undefined,
      deliveryDate: formData.type === 'milestone' ? formData.deliveryDate : undefined,
    };
    
    onSave(projectData);
    onOpenChange(false);
  };

  const handleTypeChange = (newType: 'range' | 'milestone') => {
    setFormData({ ...formData, type: newType });
    setDateError('');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            {project ? 'Edit Project' : 'Add New Project'}
          </Dialog.Title>
          <Dialog.Description className="mt-2 mb-4 text-sm text-gray-700">
            {project ? 'Update the project details below.' : 'Create a new project for your timeline.'}
          </Dialog.Description>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label.Root htmlFor="name" className="text-sm font-medium text-gray-900">
                Project Name
              </Label.Root>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <Label.Root htmlFor="swimlane" className="text-sm font-medium text-gray-900">
                Swimlane
              </Label.Root>
              <Select.Root value={formData.swimlaneId} onValueChange={(value) => setFormData({ ...formData, swimlaneId: value })}>
                <Select.Trigger className="mt-1 inline-flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <Select.Value />
                  <Select.Icon>
                    <ChevronDown className="h-4 w-4" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="overflow-hidden rounded-md bg-white shadow-lg">
                    <Select.Viewport className="p-1">
                      {swimlanes.map((swimlane) => (
                        <Select.Item
                          key={swimlane.id}
                          value={swimlane.id}
                          className="relative flex items-center px-8 py-2 text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          <Select.ItemText>{swimlane.name}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
            
            <div>
              <Label.Root className="text-sm font-medium text-gray-900">Project Type</Label.Root>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="range"
                    checked={formData.type === 'range'}
                    onChange={() => handleTypeChange('range')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm text-gray-900">Date Range</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="milestone"
                    checked={formData.type === 'milestone'}
                    onChange={() => handleTypeChange('milestone')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Triangle className="h-4 w-4" />
                  <span className="text-sm text-gray-900">Milestone</span>
                </label>
              </div>
            </div>
            
            {formData.type === 'range' ? (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label.Root htmlFor="startDate" className="text-sm font-medium text-gray-900">
                      Start Date
                    </Label.Root>
                    <input
                      id="startDate"
                      type="date"
                      value={dateStrings.startDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      min="1900-01-01"
                      max="2100-12-31"
                      className={`mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        dateError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <Label.Root htmlFor="endDate" className="text-sm font-medium text-gray-900">
                      End Date
                    </Label.Root>
                    <input
                      id="endDate"
                      type="date"
                      value={dateStrings.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      min="1900-01-01"
                      max="2100-12-31"
                      className={`mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        dateError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
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
            ) : (
              <div>
                <Label.Root htmlFor="deliveryDate" className="text-sm font-medium text-gray-900">
                  Delivery Date
                </Label.Root>
                <input
                  id="deliveryDate"
                  type="date"
                  value={dateStrings.deliveryDate}
                  onChange={(e) => handleDateChange('deliveryDate', e.target.value)}
                  min="1900-01-01"
                  max="2100-12-31"
                  className={`mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    dateError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {dateError && (
                  <div className="mt-2 flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs">{dateError}</span>
                  </div>
                )}
              </div>
            )}
            
            <div>
              <Label.Root htmlFor="color" className="text-sm font-medium text-gray-900">
                Color
              </Label.Root>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-20 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <Label.Root htmlFor="description" className="text-sm font-medium text-gray-900">
                Description (Optional)
              </Label.Root>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {project ? 'Update' : 'Create'} Project
              </button>
            </div>
          </form>
          
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}