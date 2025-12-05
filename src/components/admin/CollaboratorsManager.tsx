import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Building2, Briefcase, Sparkles, Save, X, Upload, Globe, Linkedin, Instagram, Star, Filter, ChevronDown } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { AdminTokens } from '../../styles/admin-tokens';
import { PrimaryButton, SecondaryButton, SaveButton, CancelButton, IconButton } from './AdminButtons';
import { InfoBanner } from './InfoBanner';
import { 
  DarkInput, 
  DarkTextarea, 
  DarkSelect, 
  DarkLabel,
  formContainerClasses,
  listItemClasses,
  badgeClasses,
  checkboxLabelClasses
} from './DarkModeStyles';

interface Collaborator {
  id: string;
  name: string;
  type: 'person' | 'company' | 'theatre';
  role: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  avatar?: string;
  featured: boolean;
  projectCount?: number;
  projects?: string[];
}

// Common role categories for filtering
const ROLE_CATEGORIES = [
  'All Roles',
  'Director',
  'Scenic Designer',
  'Lighting Designer',
  'Costume Designer',
  'Sound Designer',
  'Projection Designer',
  'Production Manager',
  'Technical Director',
  'Props Designer',
  'Choreographer',
  'Music Director',
  'Theatre',
  'Production Company',
  'Other'
];

export function CollaboratorsManager() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Collaborator | null>(null);
  const [aiResearching, setAiResearching] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [filterRole, setFilterRole] = useState('All Roles');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'projects' | 'featured'>('featured');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const emptyCollaborator: Collaborator = {
    id: '',
    name: '',
    type: 'person',
    role: '',
    bio: '',
    website: '',
    linkedin: '',
    instagram: '',
    avatar: '',
    featured: false,
    projectCount: 0,
    projects: []
  };

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/collaborators`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators || []);
      }
    } catch (err) {
      } finally {
      setLoading(false);
    }
  };

  const handleAiResearch = async () => {
    if (!editing?.name) {
      alert('Please enter a name first');
      return;
    }

    setAiResearching(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/collaborators/research`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header,
          },
          body: JSON.stringify({
            name: editing.name,
            type: editing.type,
            role: editing.role
          }),
        }
      );

      const responseText = await response.text();
      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          setEditing({
            ...editing,
            bio: data.bio || editing.bio,
            website: data.website || editing.website,
            linkedin: data.linkedin || editing.linkedin,
            instagram: data.instagram || editing.instagram,
            role: data.role || editing.role
          });
          alert('AI Research Complete! Review and edit the suggested information.');
        } catch (parseErr) {
          alert(`Server returned invalid response: ${responseText.substring(0, 100)}`);
        }
      } else {
        alert(`AI research failed (${response.status}): ${responseText.substring(0, 200)}`);
      }
    } catch (err) {
      alert(`AI research failed: ${err}`);
    } finally {
      setAiResearching(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      if (!token) {
        alert('Admin session expired. Please refresh the page and log in again.');
        setUploadingImage(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header
          },
          body: formData,
        }
      );

      const responseText = await response.text();
      if (response.ok) {
        const data = JSON.parse(responseText);
        setEditing(editing ? { ...editing, avatar: data.url } : null);
        alert('Image uploaded successfully!');
      } else {
        alert(`Image upload failed: ${responseText}`);
      }
    } catch (err) {
      alert(`Image upload failed: ${err}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;

    try {
      const token = sessionStorage.getItem('admin_token');
      const url = editing.id
        ? `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/collaborators/${editing.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/collaborators`;

      const response = await fetch(url, {
        method: editing.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          // Token in Authorization header,
        },
        body: JSON.stringify(editing),
      });

      const responseText = await response.text();
      if (response.ok) {
        await fetchCollaborators();
        setEditing(null);
      } else {
        alert(`Failed to save collaborator (${response.status}): ${responseText.substring(0, 200)}`);
      }
    } catch (err) {
      alert(`Failed to save collaborator: ${err}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collaborator?')) return;

    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/collaborators/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header,
          },
        }
      );

      if (response.ok) {
        await fetchCollaborators();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete collaborator: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      }
  };

  if (loading) {
    return <div className="text-center py-12">Loading collaborators...</div>;
  }

  // Filter and sort collaborators
  const getFilteredAndSortedCollaborators = () => {
    let filtered = collaborators;

    // Filter by role
    if (filterRole !== 'All Roles') {
      filtered = filtered.filter(c => c.role === filterRole || c.role.toLowerCase().includes(filterRole.toLowerCase()));
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'featured') {
        // Featured first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // Then by name
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'role') {
        return a.role.localeCompare(b.role);
      }
      if (sortBy === 'projects') {
        return (b.projectCount || 0) - (a.projectCount || 0);
      }
      return 0;
    });

    return sorted;
  };

  const filteredCollaborators = getFilteredAndSortedCollaborators();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl tracking-tight mb-2 ${AdminTokens.text.primary}`}>Collaborators Manager</h2>
          <p className={`text-sm ${AdminTokens.text.secondary}`}>
            Manage your creative partners, venues, and companies. Use AI to research and auto-fill details.
          </p>
        </div>
        <PrimaryButton
          onClick={() => setEditing(emptyCollaborator)}
        >
          <Plus className="w-4 h-4" />
          Add Collaborator
        </PrimaryButton>
      </div>

      {/* Editor Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${AdminTokens.bg.secondary} border ${AdminTokens.border.disabled} ${AdminTokens.radius.lg} max-w-2xl w-full my-8`}>
            <div className={`p-6 border-b ${AdminTokens.border.disabled}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xl tracking-tight ${AdminTokens.text.primary}`}>
                  {editing.id ? 'Edit Collaborator' : 'New Collaborator'}
                </h3>
                <IconButton
                  onClick={() => setEditing(null)}
                >
                  <X className="w-5 h-5" />
                </IconButton>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Name & AI Research */}
              <div>
                <DarkLabel>
                  Name *
                </DarkLabel>
                <div className="flex gap-2">
                  <DarkInput
                    type="text"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="e.g., John Smith"
                    className="flex-1"
                  />
                  <button
                    onClick={handleAiResearch}
                    disabled={aiResearching || !editing.name}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-xs tracking-wider uppercase hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    {aiResearching ? 'Researching...' : 'AI Research'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Enter a name and click AI Research to auto-fill details
                </p>
              </div>

              {/* Type */}
              <div>
                <DarkLabel>
                  Type *
                </DarkLabel>
                <div className="flex gap-2">
                  {[
                    { value: 'person', label: 'Person', icon: Users },
                    { value: 'theatre', label: 'Theatre', icon: Building2 },
                    { value: 'company', label: 'Company', icon: Briefcase },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setEditing({ ...editing, type: value as any })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        editing.type === value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role */}
              <div>
                <DarkLabel>
                  Role *
                </DarkLabel>
                <DarkInput
                  type="text"
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                  placeholder="e.g., Director, Regional Theatre, Production Company"
                />
              </div>

              {/* Bio */}
              <div>
                <DarkLabel>
                  Bio
                </DarkLabel>
                <DarkTextarea
                  value={editing.bio}
                  onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                  rows={4}
                  placeholder="Brief description..."
                />
              </div>

              {/* Avatar/Logo */}
              <div>
                <DarkLabel>
                  Avatar / Logo
                </DarkLabel>
                <div className="flex gap-4 items-start">
                  {editing.avatar && (
                    editing.type === 'person' ? (
                      <img
                        src={editing.avatar}
                        alt="Preview"
                        className="w-24 h-30 object-cover object-top rounded-lg border border-gray-300"
                      />
                    ) : (
                      <img
                        src={editing.avatar}
                        alt="Preview"
                        className="w-40 h-[90px] object-cover object-center rounded-lg border border-gray-300"
                      />
                    )
                  )}
                  <div className="flex-1">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-gray-900">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                      </div>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {editing.type === 'person' 
                        ? 'Portrait headshots work best (8:10 aspect ratio)'
                        : 'Landscape images work best (16:9 aspect ratio)'}\n                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-3">
                <DarkLabel>
                  Social Links
                </DarkLabel>
                
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <DarkInput
                    type="url"
                    value={editing.website}
                    onChange={(e) => setEditing({ ...editing, website: e.target.value })}
                    placeholder="Website URL"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-gray-400" />
                  <DarkInput
                    type="url"
                    value={editing.linkedin}
                    onChange={(e) => setEditing({ ...editing, linkedin: e.target.value })}
                    placeholder="LinkedIn URL"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-gray-400" />
                  <DarkInput
                    type="url"
                    value={editing.instagram}
                    onChange={(e) => setEditing({ ...editing, instagram: e.target.value })}
                    placeholder="Instagram URL"
                  />
                </div>
              </div>

              {/* Project Count */}
              <div>
                <DarkLabel>
                  Number of Projects Together
                </DarkLabel>
                <DarkInput
                  type="number"
                  min="0"
                  value={editing.projectCount || 0}
                  onChange={(e) => setEditing({ ...editing, projectCount: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditing({ ...editing, featured: !editing.featured })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    editing.featured
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  <span className="text-xs tracking-wider uppercase">
                    {editing.featured ? 'Featured' : 'Not Featured'}
                  </span>
                </button>
                <p className="text-xs text-gray-400">
                  Featured collaborators appear first in the list
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
              <CancelButton
                onClick={() => setEditing(null)}
              >
                Cancel
              </CancelButton>
              <SaveButton
                onClick={handleSave}
                disabled={!editing.name || !editing.role}
              >
                <Save className="w-4 h-4" />
                Save
              </SaveButton>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Sort Controls */}
      <div className="flex items-center gap-4 p-4 bg-gray-900/50 backdrop-blur border border-gray-800 rounded-3xl">
        {/* Role Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 min-w-[200px] justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{filterRole}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          
          {showRoleDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
              {ROLE_CATEGORIES.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setFilterRole(role);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
                    filterRole === role ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs tracking-wider uppercase text-gray-400">Sort by:</span>
          {[
            { value: 'featured', label: 'Featured' },
            { value: 'name', label: 'Name' },
            { value: 'role', label: 'Role' },
            { value: 'projects', label: 'Projects' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSortBy(value as any)}
              className={`px-3 py-1.5 rounded text-xs tracking-wider uppercase transition-colors ${
                sortBy === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="ml-auto text-sm text-gray-400">
          {filteredCollaborators.length} {filteredCollaborators.length === 1 ? 'collaborator' : 'collaborators'}
        </div>
      </div>

      {/* Collaborators List */}
      <div className="bg-gray-900/30 backdrop-blur border border-gray-800 rounded-3xl overflow-hidden">
        <table className="w-full text-sm text-gray-300">
          <thead className="bg-gray-800/50 border-b border-gray-700">
            <tr>
              <th className="text-left px-6 py-3 text-xs tracking-wider uppercase text-gray-400">Name</th>
              <th className="text-left px-6 py-3 text-xs tracking-wider uppercase text-gray-400">Type</th>
              <th className="text-left px-6 py-3 text-xs tracking-wider uppercase text-gray-400">Role</th>
              <th className="text-left px-6 py-3 text-xs tracking-wider uppercase text-gray-400">Projects</th>
              <th className="text-left px-6 py-3 text-xs tracking-wider uppercase text-gray-400">Status</th>
              <th className="text-right px-6 py-3 text-xs tracking-wider uppercase text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredCollaborators.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No collaborators yet. Click "Add Collaborator" to get started.
                </td>
              </tr>
            ) : (
              filteredCollaborators.map((collab) => (
                <tr key={collab.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {collab.avatar ? (
                        collab.type === 'person' ? (
                          <img src={collab.avatar} alt="" className="w-8 h-10 rounded-lg object-cover object-top" />
                        ) : (
                          <img src={collab.avatar} alt="" className="w-16 h-9 rounded-lg object-cover object-center" />
                        )
                      ) : (
                        <div className={`rounded-lg bg-gray-800 flex items-center justify-center ${
                          collab.type === 'person' ? 'w-8 h-10' : 'w-16 h-9'
                        }`}>
                          {collab.type === 'person' && <Users className="w-5 h-5 text-gray-400" />}
                          {collab.type === 'theatre' && <Building2 className="w-5 h-5 text-gray-400" />}
                          {collab.type === 'company' && <Briefcase className="w-5 h-5 text-gray-400" />}
                        </div>
                      )}
                      <span className="font-medium text-white">{collab.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                      {collab.type === 'person' && <Users className="w-3 h-3" />}
                      {collab.type === 'theatre' && <Building2 className="w-3 h-3" />}
                      {collab.type === 'company' && <Briefcase className="w-3 h-3" />}
                      {collab.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{collab.role}</td>
                  <td className="px-6 py-4 text-gray-400">{collab.projectCount || 0}</td>
                  <td className="px-6 py-4">
                    {collab.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <IconButton
                        onClick={() => setEditing(collab)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(collab.id)}
                        variant="danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
