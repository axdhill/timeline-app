'use client';

import React, { useState, useRef } from 'react';
import { Timeline } from '@/components/Timeline';
import { ProjectDialog } from '@/components/ProjectDialog';
import { SwimlaneManager } from '@/components/SwimlaneManager';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ExportButton } from '@/components/ExportButton';
import { Project, Swimlane, TimelineSettings } from '@/lib/types';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { generateId } from '@/lib/utils';

export default function Home() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Project Alpha',
      swimlaneId: '1',
      type: 'range',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-30'),
      color: '#3B82F6',
    },
    {
      id: '2',
      name: 'Release v2.0',
      swimlaneId: '2',
      type: 'milestone',
      deliveryDate: new Date('2024-02-15'),
      color: '#EF4444',
    },
  ]);
  
  const [swimlanes, setSwimlanes] = useState<Swimlane[]>([
    { id: '1', name: 'Development', color: '#3B82F6', order: 0 },
    { id: '2', name: 'Marketing', color: '#10B981', order: 1 },
  ]);
  
  const [settings, setSettings] = useState<TimelineSettings>({
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    title: 'Project Timeline 2024',
    backgroundColor: '#ffffff',
    gridColor: '#d1d5db',
    textColor: '#111827',
    showGrid: true,
    showYearLabels: true,
    showCurrentDate: true,
    currentDateColor: '#ef4444',
    monthFormat: 'short',
  });

  const handleAddProject = () => {
    setEditingProject(null);
    setProjectDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectDialogOpen(true);
  };

  const handleSaveProject = (project: Project) => {
    if (editingProject) {
      setProjects(projects.map(p => p.id === project.id ? project : p));
    } else {
      setProjects([...projects, project]);
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  // Ensure at least one swimlane exists
  React.useEffect(() => {
    if (swimlanes.length === 0) {
      setSwimlanes([{ id: generateId(), name: 'Default', color: '#3B82F6', order: 0 }]);
    }
  }, [swimlanes]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Timeline Creator</h1>
          <p className="text-gray-800">Create beautiful Gantt-like timelines with customizable projects and swimlanes</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                <button
                  onClick={handleAddProject}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Project
                </button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {projects.length === 0 ? (
                  <p className="text-gray-700 text-center py-8">No projects yet. Click &quot;Add Project&quot; to get started.</p>
                ) : (
                  projects.map(project => (
                    <div key={project.id} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: project.color }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{project.name}</div>
                        <div className="text-xs text-gray-700">
                          {project.type === 'range' 
                            ? `${project.startDate?.toLocaleDateString()} - ${project.endDate?.toLocaleDateString()}`
                            : project.deliveryDate?.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-xs text-gray-700">
                        {swimlanes.find(s => s.id === project.swimlaneId)?.name}
                      </div>
                      <button
                        onClick={() => handleEditProject(project)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <SwimlaneManager swimlanes={swimlanes} onUpdate={setSwimlanes} />
          </div>
          
          <div className="space-y-6">
            <SettingsPanel settings={settings} onUpdate={setSettings} />
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export</h3>
              <ExportButton timelineRef={timelineRef} filename={settings.title.replace(/\s+/g, '_')} />
            </div>
          </div>
        </div>
        
        <Timeline 
          ref={timelineRef}
          projects={projects} 
          swimlanes={swimlanes} 
          settings={settings} 
        />
        
        <ProjectDialog
          open={projectDialogOpen}
          onOpenChange={setProjectDialogOpen}
          swimlanes={swimlanes}
          onSave={handleSaveProject}
          project={editingProject}
        />
      </div>
    </main>
  );
}
