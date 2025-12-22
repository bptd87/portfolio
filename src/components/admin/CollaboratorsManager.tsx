import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, ExternalLink, User, Building2, Briefcase, Mail, Globe, Linkedin, Instagram, GripVertical, Image as ImageIcon, X, Sparkles, Wand2 } from 'lucide-react';
import { Reorder } from 'motion/react';
import { toast } from 'sonner';
import { createClient } from '../../utils/supabase/client';
import { PrimaryButton, SecondaryButton, SaveButton, CancelButton, IconButton, ActionButton } from './AdminButtons';
import {
  DarkInput,
  DarkTextarea,
  DarkSelect,
  DarkLabel,
  formContainerClasses,
  listItemClasses,
  badgeClasses
} from './DarkModeStyles';

const supabase = createClient();

interface Collaborator {
  id?: string;
  name: string;
  type?: 'person' | 'company' | 'theatre';
  role?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  image_url?: string;
  featured?: boolean;
  project_count?: number;
  projects?: string[];
  created_at?: string;
  updated_at?: string;
}

const COLLABORATOR_TYPES = [
  { value: 'person', label: 'Person', icon: User },
  { value: 'company', label: 'Company', icon: Building2 },
  { value: 'institution', label: 'Institution', icon: Briefcase },
];

export function CollaboratorsManager() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [formData, setFormData] = useState<Partial<Collaborator>>({
    name: '',
    role: '',
    bio: '',
    website: '',
    linkedin: '',
    instagram: '',
    image_url: '',
    type: 'person',
    featured: false
  });

  // AI Research state
  const [researching, setResearching] = useState(false);
  const [scanResults, setScanResults] = useState<string[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      toast.error('Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    try {
      if (editingCollaborator) {
        const { error } = await supabase
          .from('collaborators')
          .update(formData as any)
          .eq('id', editingCollaborator.id!);
        if (error) throw error;
        toast.success('Collaborator updated');
      } else {
        const { error } = await supabase
          .from('collaborators')
          .insert(formData as any);
        if (error) throw error;
        toast.success('Collaborator added');
      }

      await fetchCollaborators();
      resetForm();
    } catch (error: any) {
      toast.error(`Error saving collaborator: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collaborator?')) return;

    try {
      const { error } = await supabase.from('collaborators').delete().eq('id', id);
      if (error) throw error;
      setCollaborators(prev => prev.filter(c => c.id !== id));
      toast.success('Collaborator deleted');
    } catch (error: any) {
      toast.error(`Error deleting collaborator: ${error.message}`);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCollaborator(null);
    setFormData({
      name: '',
      role: '',
      bio: '',
      website: '',
      linkedin: '',
      instagram: '',
      image_url: '',
      type: 'person',
      featured: false
    });
  };

  const startEdit = (collaborator: Collaborator) => {
    setEditingCollaborator(collaborator);
    setFormData(collaborator);
    setShowForm(true);
  };

  // AI Research Functionality - calling the Edge Function specifically for AI
  const handleResearch = async () => {
    if (!formData.name) return;
    setResearching(true);
    try {
      // Use the dedicated research endpoint if available, or just mocking for now since the user wants to unlock data first
      // The original code called /api/collaborators/research
      // We can keep using the edge function for this specific AI task if it exists, or disable it.
      // Assuming the 'make-server' function has a research endpoint we can leverage:

      // For now, let's just do a simple search or placeholder as the core goal is CRUD
      toast.info('AI Research not yet fully migrated. Please fill details manually.');

      // FUTURE: Re-enable this by calling a specific 'research' function
      /*
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/research`, {
          method: 'POST',
          body: JSON.stringify({ query: formData.name })
      });
      */
    } catch (error) {
      toast.error('Research failed');
    } finally {
      setResearching(false);
    }
  };

  const handleScanProjects = async () => {
    // This previously scanned the project credits to find new people
    // We can implement this client-side!
    try {
      const { data: projects } = await supabase.from('portfolio_projects').select('credits');
      if (!projects) return;

      const foundNames = new Set<string>();
      projects.forEach((p: any) => {
        if (Array.isArray(p.credits)) {
          p.credits.forEach((c: any) => {
            if (c.name && !collaborators.find(existing => existing.name === c.name)) {
              foundNames.add(c.name);
            }
          });
        }
      });
      setScanResults(Array.from(foundNames));
      setShowScanner(true);
    } catch (err) {
      toast.error('Failed to scan projects');
    }
  };

  const importScanned = (name: string) => {
    setFormData({ ...formData, name });
    setShowForm(true);
    setShowScanner(false);
  };

  const filteredCollaborators = collaborators.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.role.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display italic text-white">Collaborators</h2>
          <p className="text-sm text-gray-400 mt-1">Manage network and credits</p>
        </div>
        <div className="flex gap-2">
          <SecondaryButton onClick={handleScanProjects}>
            <Sparkles className="w-4 h-4 mr-2" />
            Scan Projects
          </SecondaryButton>
          <PrimaryButton onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Collaborator
          </PrimaryButton>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-white">Found in Credits</h3>
              <button onClick={() => setShowScanner(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-2">
              {scanResults.length === 0 ? (
                <p className="text-gray-500">No new potential collaborators found in project credits.</p>
              ) : (
                scanResults.map(name => (
                  <div key={name} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-white">{name}</span>
                    <ActionButton onClick={() => importScanned(name)} icon={User}>
                      Import
                    </ActionButton>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main List View */}
      {!showForm && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search collaborators..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollaborators.map(collaborator => (
              <div key={collaborator.id} className="group relative bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 hover:border-gray-700 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    {collaborator.image_url ? (
                      <img src={collaborator.image_url} alt={collaborator.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate pr-6">{collaborator.name}</h3>
                    <p className="text-sm text-blue-400 truncate">{collaborator.role}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{collaborator.bio}</p>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton onClick={() => startEdit(collaborator)} title="Edit">
                      <ExternalLink className="w-4 h-4" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(collaborator.id)} title="Delete" variant="danger">
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Form */}
      {showForm && (
        <div className={formContainerClasses}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-white">
              {editingCollaborator ? 'Edit Collaborator' : 'New Collaborator'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <DarkLabel>Name</DarkLabel>
                <div className="flex gap-2">
                  <DarkInput
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full Name"
                  />
                  <SecondaryButton onClick={handleResearch} disabled={researching || !formData.name}>
                    {researching ? <Sparkles className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  </SecondaryButton>
                </div>
              </div>

              <div>
                <DarkLabel>Role</DarkLabel>
                <DarkInput
                  value={formData.role || ''}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Lighting Designer"
                />
              </div>

              <div>
                <DarkLabel>Type</DarkLabel>
                <div className="flex gap-2">
                  {COLLABORATOR_TYPES.map(type => {
                    const Icon = type.icon;
                    const isSelected = formData.type === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value as any })}
                        className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${isSelected
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                          }`}
                      >
                        <Icon className="w-5 h-5 mb-1" />
                        <span className="text-xs">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <DarkLabel>Avatar URL</DarkLabel>
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 overflow-hidden shrink-0">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <DarkInput
                    value={formData.image_url || ''}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="h-10 my-auto"
                  />
                </div>
              </div>


              <div>
                <DarkLabel>Bio</DarkLabel>
                <DarkTextarea
                  rows={4}
                  value={formData.bio || ''}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Short biography..."
                />
              </div>

              {/* Social Links */}
              <div className="space-y-3">
                <DarkLabel>Social Links</DarkLabel>

                {/* Website */}
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                  <DarkInput
                    value={formData.website || ''}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    placeholder="Website URL"
                  />
                </div>

                {/* LinkedIn */}
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-gray-400 shrink-0" />
                  <DarkInput
                    value={formData.linkedin || ''}
                    onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="LinkedIn URL"
                  />
                </div>

                {/* Instagram */}
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-gray-400 shrink-0" />
                  <DarkInput
                    value={formData.instagram || ''}
                    onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="Instagram URL"
                  />
                </div>
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured || false}
                  onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="featured" className="text-sm text-white cursor-pointer">
                  Featured Collaborator
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-800">
            <CancelButton onClick={resetForm}>Cancel</CancelButton>
            <SaveButton onClick={handleSave}>
              {editingCollaborator ? 'Update Collaborator' : 'Save Collaborator'}
            </SaveButton>
          </div>
        </div>
      )}
    </div>
  );
}

