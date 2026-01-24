import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, ExternalLink, User, Building2, Briefcase, Globe, Linkedin, Instagram, X, Sparkles, Wand2, Edit2, Filter, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '../../utils/supabase/client';
import { PrimaryButton, SecondaryButton, SaveButton, CancelButton, IconButton, ActionButton } from './AdminButtons';
import {
  DarkInput,
  DarkTextarea,
  DarkLabel,
  formContainerClasses,
} from './DarkModeStyles';

const supabase = createClient();

interface Collaborator {
  id?: string;
  name: string;
  type?: 'person' | 'company' | 'theatre' | 'institution';
  role?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
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

  // Organization State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Collaborator; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc'
  });

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
        .from('collaborators' as any)
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
      // Clean up empty strings
      const cleanedData = {
        ...formData,
        role: formData.role || null,
        bio: formData.bio || null,
        website: formData.website || null,
        linkedin: formData.linkedin || null,
        instagram: formData.instagram || null,
      };

      if (editingCollaborator) {
        const { error } = await supabase
          .from('collaborators' as any)
          .update(cleanedData as any)
          .eq('id', editingCollaborator.id!);
        if (error) throw error;
        toast.success('Collaborator updated');
      } else {
        const { error } = await supabase
          .from('collaborators' as any)
          .insert(cleanedData as any);
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
      const { error } = await supabase.from('collaborators' as any).delete().eq('id', id);
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
      type: 'person',
      featured: false
    });
  };

  const startEdit = (collaborator: Collaborator) => {
    setEditingCollaborator(collaborator);
    setFormData(collaborator);
    setShowForm(true);
  };

  // AI Research Functionality
  const handleResearch = async () => {
    if (!formData.name) return;
    setResearching(true);
    try {
      // Mock for now until full migration
      toast.info('AI Research not yet fully migrated. Please fill details manually.');
    } catch (error) {
      toast.error('Research failed');
    } finally {
      setResearching(false);
    }
  };

  const handleScanProjects = async () => {
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

  const handleSort = (key: keyof Collaborator) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredCollaborators = collaborators
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.role || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || c.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const directionMultiplier = sortConfig.direction === 'asc' ? 1 : -1;
      const aValue = (a[sortConfig.key] || '').toString().toLowerCase();
      const bValue = (b[sortConfig.key] || '').toString().toLowerCase();
      return aValue.localeCompare(bValue) * directionMultiplier;
    });

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
              <button onClick={() => setShowScanner(false)} title="Close Scanner" aria-label="Close Scanner"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-2">
              {scanResults.length === 0 ? (
                <p className="text-gray-500">No new potential collaborators found in project credits.</p>
              ) : (
                scanResults.map(name => (
                  <div key={name} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-white">{name}</span>
                    <ActionButton onClick={() => importScanned(name)} icon={User} title="Import Collaborator">
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
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or role..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500/50 placeholder-gray-600"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter by type"
                className="pl-10 pr-8 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer hover:bg-gray-800/50 transition-colors capitalize min-w-[150px]"
              >
                <option value="all">All Types</option>
                {COLLABORATOR_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800/50 text-gray-400 uppercase text-xs tracking-wider font-medium">
                <tr>
                  <th
                    className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {sortConfig.key === 'name' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-400" /> : <ChevronDown className="w-3 h-3 text-blue-400" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-20" />}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-2">
                      Role / Type
                      {sortConfig.key === 'role' ? (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-400" /> : <ChevronDown className="w-3 h-3 text-blue-400" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-20" />}
                    </div>
                  </th>
                  <th className="px-6 py-4">Socials</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredCollaborators.map((collaborator) => {
                  const TypeIcon = COLLABORATOR_TYPES.find(t => t.value === collaborator.type)?.icon || User;

                  return (
                    <tr key={collaborator.id} className="hover:bg-gray-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${collaborator.featured ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-800 text-gray-400'}`}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{collaborator.name}</div>
                            {collaborator.featured && <div className="text-[10px] text-amber-500 font-medium uppercase tracking-wide">Featured</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-blue-400">{collaborator.role}</div>
                        <div className="text-gray-500 text-xs capitalize">{collaborator.type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {collaborator.website && (
                            <a href={collaborator.website} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" title="Website">
                              <Globe className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {collaborator.linkedin && (
                            <a href={collaborator.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-blue-900/30 text-gray-400 hover:text-blue-400 transition-colors" title="LinkedIn">
                              <Linkedin className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {collaborator.instagram && (
                            <a href={collaborator.instagram} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-pink-900/30 text-gray-400 hover:text-pink-400 transition-colors" title="Instagram">
                              <Instagram className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(collaborator)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(collaborator.id!)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredCollaborators.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No collaborators found matching your search.
              </div>
            )}
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
            <button onClick={resetForm} className="text-gray-400 hover:text-white" title="Close Form" aria-label="Close Form"><X className="w-6 h-6" /></button>
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
                    disabled={researching}
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

