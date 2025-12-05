import React, { useState } from 'react';
import { Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';

interface Credit {
  role: string;
  name: string;
}

interface CreditsManagerProps {
  credits: Credit[] | Record<string, string>;
  onChange: (credits: Credit[]) => void;
}

export function CreditsManager({ credits, onChange }: CreditsManagerProps) {
  // Convert old object format to new array format
  const creditsArray: Credit[] = Array.isArray(credits) 
    ? credits 
    : Object.entries(credits || {})
        .filter(([_, value]) => value) // Filter out empty values
        .map(([role, name]) => ({
          role: role.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase()), // Convert camelCase to Title Case
          name: name as string
        }));

  const handleAdd = () => {
    onChange([...creditsArray, { role: '', name: '' }]);
  };

  const handleUpdate = (index: number, field: 'role' | 'name', value: string) => {
    const updated = [...creditsArray];
    updated[index][field] = value;
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(creditsArray.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newCredits = [...creditsArray];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < creditsArray.length) {
      [newCredits[index], newCredits[newIndex]] = [newCredits[newIndex], newCredits[index]];
      onChange(newCredits);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs tracking-wider uppercase text-gray-300">
          Creative Team
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 px-2 py-1 text-xs border border-border hover:border-accent-brand transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Credit
        </button>
      </div>

      <div className="space-y-2">
        {creditsArray.length === 0 && (
          <div className="text-center py-6 opacity-40 text-sm">
            No credits yet. Add a credit to get started.
          </div>
        )}
        {creditsArray.map((credit, index) => (
          <div key={index} className="flex items-start gap-2 p-3 border border-border bg-card">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <input
                type="text"
                value={credit.role}
                onChange={(e) => handleUpdate(index, 'role', e.target.value)}
                placeholder="Role (e.g., Director)"
                className="px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
              />
              <input
                type="text"
                value={credit.name}
                onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                placeholder="Name"
                className="px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handleMove(index, 'up')}
                disabled={index === 0}
                className="p-1 opacity-40 hover:opacity-100 disabled:opacity-20"
              >
                <MoveUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleMove(index, 'down')}
                disabled={index === creditsArray.length - 1}
                className="p-1 opacity-40 hover:opacity-100 disabled:opacity-20"
              >
                <MoveDown className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="p-1 opacity-40 hover:opacity-100 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}