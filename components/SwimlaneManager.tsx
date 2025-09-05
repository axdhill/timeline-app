'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Swimlane } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface SwimlaneManagerProps {
  swimlanes: Swimlane[];
  onUpdate: (swimlanes: Swimlane[]) => void;
}

export function SwimlaneManager({ swimlanes, onUpdate }: SwimlaneManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#60A5FA');

  const handleAdd = () => {
    if (!newName.trim()) return;
    
    const newSwimlane: Swimlane = {
      id: generateId(),
      name: newName,
      color: newColor,
      order: swimlanes.length,
    };
    
    onUpdate([...swimlanes, newSwimlane]);
    setNewName('');
    setNewColor('#60A5FA');
  };

  const handleEdit = (swimlane: Swimlane) => {
    setEditingId(swimlane.id);
    setEditName(swimlane.name);
    setEditColor(swimlane.color);
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editingId) return;
    
    const updated = swimlanes.map(s => 
      s.id === editingId 
        ? { ...s, name: editName, color: editColor }
        : s
    );
    
    onUpdate(updated);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const filtered = swimlanes.filter(s => s.id !== id);
    const reordered = filtered.map((s, index) => ({ ...s, order: index }));
    onUpdate(reordered);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSwimlanes = [...swimlanes];
    [newSwimlanes[index - 1], newSwimlanes[index]] = [newSwimlanes[index], newSwimlanes[index - 1]];
    const reordered = newSwimlanes.map((s, i) => ({ ...s, order: i }));
    onUpdate(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === swimlanes.length - 1) return;
    const newSwimlanes = [...swimlanes];
    [newSwimlanes[index], newSwimlanes[index + 1]] = [newSwimlanes[index + 1], newSwimlanes[index]];
    const reordered = newSwimlanes.map((s, i) => ({ ...s, order: i }));
    onUpdate(reordered);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Swimlanes</h3>
      
      <div className="space-y-2 mb-4">
        {swimlanes.map((swimlane, index) => (
          <div key={swimlane.id} className="flex items-center gap-2 p-2 border rounded">
            <GripVertical className="h-4 w-4 text-gray-600" />
            
            {editingId === swimlane.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm text-gray-900"
                />
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-8 h-8 cursor-pointer"
                />
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-900">{swimlane.name}</span>
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: swimlane.color }}
                />
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 text-gray-700 hover:text-gray-900 disabled:opacity-50"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === swimlanes.length - 1}
                  className="p-1 text-gray-700 hover:text-gray-900 disabled:opacity-50"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleEdit(swimlane)}
                  className="p-1 text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(swimlane.id)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New swimlane name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 px-3 py-2 border rounded text-sm text-gray-900"
        />
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="w-10 cursor-pointer"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
    </div>
  );
}