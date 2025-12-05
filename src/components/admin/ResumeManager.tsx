/**
 * RESUME/CV MANAGER
 * 
 * Manage CV page content including contact info, productions, education, and skills.
 * Also supports PDF resume upload for download.
 */

import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Download, ExternalLink, AlertCircle, CheckCircle, Loader, Plus, Edit2, X, Save, ChevronUp, ChevronDown } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { PrimaryButton, SecondaryButton } from './AdminButtons';
import { AdminTokens } from '../../styles/admin-tokens';

interface CVData {
  // Contact Information
  phone?: string;
  email?: string;
  location?: string;
  website?: string;

  // Productions (JSON arrays)
  upcomingProductions?: Array<{production: string; director: string; company: string; year: string}>;
  recentProductions?: Array<{production: string; director: string; company: string; year: string}>;
  assistantDesignProductions?: Array<{production: string; designer: string; company: string; year: string}>;
  
  // Education
  education?: Array<{degree: string; institution: string; year: string; details?: string}>;
  
  // Skills & Specialties
  skills?: string[];
  
  // Resume PDF
  resumeUrl?: string;
  resumeFilename?: string;
  lastUpdated?: string;
}

export function ResumeManager() {
  const [cvData, setCVData] = useState<CVData>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'contact' | 'productions' | 'education' | 'pdf'>('contact');
  const adminToken = sessionStorage.getItem('admin_token');

  useEffect(() => {
    loadResumeData();
  }, []);

  const loadResumeData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/settings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setCVData({
            phone: data.settings.phone || '',
            email: data.settings.email || '',
            location: data.settings.location || '',
            website: data.settings.website || '',
            upcomingProductions: data.settings.upcomingProductions || [],
            recentProductions: data.settings.recentProductions || [],
            assistantDesignProductions: data.settings.assistantDesignProductions || [],
            education: data.settings.education || [],
            skills: data.settings.skills || [],
            resumeUrl: data.settings.resumeUrl,
            resumeFilename: data.settings.resumeFilename,
            lastUpdated: data.settings.resumeLastUpdated,
          });
        }
      }
    } catch (error) {
      showMessage('error', 'Failed to load CV information');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.pdf')) {
      showMessage('error', 'Only PDF files are supported');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showMessage('error', 'File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);

      if (!adminToken) {
        alert('You are not logged in. Please log in to the admin panel first.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'resume');

      const uploadResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await uploadResponse.json();

      // Save resume URL to settings
      const saveResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header
          },
          body: JSON.stringify({
            resumeUrl: url,
            resumeFilename: file.name,
            resumeLastUpdated: new Date().toISOString(),
          }),
        }
      );

      if (saveResponse.ok) {
        setCVData(prev => ({
          ...prev,
          resumeUrl: url,
          resumeFilename: file.name,
          lastUpdated: new Date().toISOString(),
        }));
        showMessage('success', 'Resume uploaded successfully!');
      } else {
        showMessage('error', 'Failed to save resume information');
      }
    } catch (error) {
      showMessage('error', 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete current resume? This cannot be undone.')) return;

    try {
      if (!adminToken) {
        alert('You are not logged in.');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header
          },
          body: JSON.stringify({
            resumeUrl: null,
            resumeFilename: null,
            resumeLastUpdated: null,
          }),
        }
      );

      if (response.ok) {
        setCVData(prev => ({
          ...prev,
          resumeUrl: undefined,
          resumeFilename: undefined,
          lastUpdated: undefined,
        }));
        showMessage('success', 'Resume deleted');
      } else {
        showMessage('error', 'Failed to delete resume');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete resume');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveContactInfo = async () => {
    try {
      if (!adminToken) {
        alert('You are not logged in.');
        return;
      }

      setSaving(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header
          },
          body: JSON.stringify({
            phone: cvData.phone,
            email: cvData.email,
            location: cvData.location,
            website: cvData.website,
          }),
        }
      );

      if (response.ok) {
        showMessage('success', 'Contact information saved successfully!');
      } else {
        showMessage('error', 'Failed to save contact information');
      }
    } catch (error) {
      showMessage('error', 'Failed to save contact information');
    } finally {
      setSaving(false);
    }
  };

  // Productions CRUD handlers
  const handleAddProduction = (type: 'recent' | 'assistant' | 'upcoming') => {
    setCVData(prev => {
      if (type === 'recent') {
        return {
          ...prev,
          recentProductions: [{ production: '', director: '', company: '', year: '' }, ...(prev.recentProductions || [])],
        };
      } else if (type === 'assistant') {
        return {
          ...prev,
          assistantDesignProductions: [{ production: '', designer: '', company: '', year: '' }, ...(prev.assistantDesignProductions || [])],
        };
      } else {
        return {
          ...prev,
          upcomingProductions: [{ production: '', director: '', company: '', year: '' }, ...(prev.upcomingProductions || [])],
        };
      }
    });
  };

  const handleRemoveProduction = (type: 'recent' | 'assistant' | 'upcoming', idx: number) => {
    setCVData(prev => {
      if (type === 'recent') {
        const arr = [...(prev.recentProductions || [])];
        arr.splice(idx, 1);
        return { ...prev, recentProductions: arr };
      } else if (type === 'assistant') {
        const arr = [...(prev.assistantDesignProductions || [])];
        arr.splice(idx, 1);
        return { ...prev, assistantDesignProductions: arr };
      } else {
        const arr = [...(prev.upcomingProductions || [])];
        arr.splice(idx, 1);
        return { ...prev, upcomingProductions: arr };
      }
    });
  };

  const handleProductionChange = (type: 'recent' | 'assistant' | 'upcoming', idx: number, field: string, value: string) => {
    setCVData(prev => {
      if (type === 'recent') {
        const arr = [...(prev.recentProductions || [])];
        arr[idx] = { ...arr[idx], [field]: value };
        return { ...prev, recentProductions: arr };
      } else if (type === 'assistant') {
        const arr = [...(prev.assistantDesignProductions || [])];
        arr[idx] = { ...arr[idx], [field]: value };
        return { ...prev, assistantDesignProductions: arr };
      } else {
        const arr = [...(prev.upcomingProductions || [])];
        arr[idx] = { ...arr[idx], [field]: value };
        return { ...prev, upcomingProductions: arr };
      }
    });
  };

  const handleMoveProduction = (type: 'recent' | 'assistant' | 'upcoming', idx: number, direction: 'up' | 'down') => {
    setCVData(prev => {
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      
      if (type === 'recent') {
        const arr = [...(prev.recentProductions || [])];
        if (newIdx < 0 || newIdx >= arr.length) return prev;
        [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
        return { ...prev, recentProductions: arr };
      } else if (type === 'assistant') {
        const arr = [...(prev.assistantDesignProductions || [])];
        if (newIdx < 0 || newIdx >= arr.length) return prev;
        [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
        return { ...prev, assistantDesignProductions: arr };
      } else {
        const arr = [...(prev.upcomingProductions || [])];
        if (newIdx < 0 || newIdx >= arr.length) return prev;
        [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
        return { ...prev, upcomingProductions: arr };
      }
    });
  };

  const handleSaveProductions = async () => {
    try {
      if (!adminToken) {
        alert('You are not logged in.');
        return;
      }
      setSaving(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header
          },
          body: JSON.stringify({
            upcomingProductions: cvData.upcomingProductions,
            recentProductions: cvData.recentProductions,
            assistantDesignProductions: cvData.assistantDesignProductions,
          }),
        }
      );
      if (response.ok) {
        showMessage('success', 'Productions saved successfully!');
      } else {
        showMessage('error', 'Failed to save productions');
      }
    } catch (error) {
      showMessage('error', 'Failed to save productions');
    } finally {
      setSaving(false);
    }
  };

  // One-click legacy import
  const handleImportLegacyProductions = async () => {
    try {
      if (!adminToken) {
        alert('You are not logged in.');
        return;
      }
      if (!window.confirm('Import all 41 legacy productions? This replaces current lists.')) return;
      setSaving(true);

      const upcomingProductions = [
        { production: 'The Glass Menagerie', director: 'Kimberly Braun', company: 'Maples Repertory Theatre', year: '2025' },
        { production: 'Million Dollar Quartet', director: 'James Moye', company: 'South Coast Repertory Theatre', year: '2025' },
        { production: 'How to Succeed in Business', director: 'Bernie Monroe', company: 'Okoboji Summer Theatre', year: '2025' },
        { production: 'Deathtrap', director: 'Fred Rubeck', company: 'Okoboji Summer Theatre', year: '2025' },
        { production: 'Bell, Book, and Candle', director: 'Richard Biever', company: 'Okoboji Summer Theatre', year: '2025' },
        { production: "All's Well That Ends Well", director: 'Rob Salas', company: 'New Swan Theatre Festival', year: '2025' },
        { production: 'Much Ado About Nothing', director: 'Eli Simon', company: 'New Swan Theatre Festival', year: '2025' },
        { production: 'Less Miserable', director: 'John Keating', company: 'The Great American Melodrama', year: '2025' },
        { production: 'Romero', director: 'David Crespy', company: 'University of Missouri', year: '2025' },
        { production: 'Shut Up, Sherlock!', director: 'Eric Hoit', company: 'The Great American Melodrama', year: '2025' },
        { production: 'Guys on Ice', director: 'Dan Kalrer', company: 'The Great American Melodrama', year: '2025' },
      ];

      const recentProductions = [
        { production: 'Clue On Stage', director: 'John Hemphill', company: 'Stephens College', year: '2024' },
        { production: 'Urinetown', director: 'Joy Powell', company: 'University of Missouri', year: '2024' },
        { production: 'The Music Man', director: 'Bernie Monroe', company: 'Okoboji Summer Theatre', year: '2024' },
        { production: 'Barefoot in The Park', director: 'Brett Olson', company: 'Okoboji Summer Theatre', year: '2024' },
        { production: 'Freaky Friday', director: 'Josh Walden', company: 'Okoboji Summer Theatre', year: '2024' },
        { production: 'Baskerville: A Sherlock Holmes Mystery', director: 'Stephen Brotebeck', company: 'Okoboji Summer Theatre', year: '2024' },
        { production: '9 to 5', director: 'Brandon Riley', company: 'University of Missouri', year: '2024' },
        { production: 'Footloose', director: 'Jamey Grisham', company: 'Stephens College', year: '2024' },
        { production: 'Boeing, Boeing', director: 'John Hemphill', company: 'Stephens College', year: '2024' },
        { production: 'Bright Star', director: "Andre' Rodriguez", company: 'Denver School of the Arts', year: '2024' },
        { production: 'Christmas Carol', director: 'Courtney Crouse', company: 'Stephens College', year: '2023' },
        { production: 'An Enemy of The People', director: 'LR Hults', company: 'Stephens College', year: '2023' },
        { production: 'Songs For a New World', director: 'Lisa Brescia', company: 'Stephens College', year: '2023' },
        { production: 'The Wedding Singer', director: 'Bernie Monroe', company: 'Okoboji Summer Theatre', year: '2023' },
        { production: 'Dial "M" For Murder', director: 'Fred Rubeck', company: 'Okoboji Summer Theatre', year: '2023' },
        { production: 'Cole', director: 'Alison Morooney', company: 'Okoboji Summer Theatre', year: '2023' },
        { production: 'Head Over Heels', director: 'Josh Walden', company: 'Theatre SilCo', year: '2023' },
        { production: 'Curtain Up! Stephens', director: 'Lisa Brescia', company: 'Stephens College', year: '2023' },
        { production: 'Lotería', director: 'Sara Rodriguez', company: 'Theatre SilCo', year: '2023' },
        { production: 'Spelling Bee', director: 'Todd Davidson', company: 'Stephens College', year: '2023' }
      ];

      const assistantDesignProductions = [
        { production: 'The Play that Goes Wrong', designer: 'Tom Buderwitz', company: 'Seattle Rep', year: '2025' },
        { production: 'The Importance of Being Earnest', designer: 'Jo Winiarski', company: 'Utah Shakespeare Festival', year: '2025' },
        { production: "A Gentlemen's Guide to Love and Murder", designer: 'Jo Winiarski', company: 'Utah Shakespeare Festival', year: '2025' },
        { production: 'Steel Magnolias', designer: 'Jo Winiarski', company: 'Utah Shakespeare Festival', year: '2025' },
        { production: 'The Book Club Play', designer: 'Jo Winiarski', company: 'Cincinnati Playhouse in the Park', year: '2025' },
        { production: 'Souvenir', designer: 'Jo Winiarski', company: 'Pioneer Theatre', year: '2024' },
        { production: 'Ragtime', designer: 'Jo Winiarski', company: 'The Ruth: Hale Orem', year: '2024' },
        { production: 'Natasha, Pierre, and the Great Comet of 1812', designer: 'Jo Winiarski', company: 'Pioneer Theatre Company', year: '2024' },
        { production: 'Jersey Boys', designer: 'Jo Winiarski', company: 'Pioneer Theatre Company', year: '2024' },
        { production: 'Matilda', designer: 'Jo Winiarski', company: 'Pioneer Theatre Company', year: '2023' }
      ];

      // Update state immediately so UI reflects pending import
      setCVData(prev => ({
        ...prev,
        upcomingProductions,
        recentProductions,
        assistantDesignProductions
      }));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74296234/api/admin/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            // Token in Authorization header
          },
          body: JSON.stringify({
            upcomingProductions,
            recentProductions,
            assistantDesignProductions
          }),
        }
      );

      if (response.ok) {
        showMessage('success', 'Legacy productions imported successfully!');
      } else {
        const txt = await response.text();
        showMessage('error', 'Failed to import legacy productions');
      }
    } catch (e) {
      showMessage('error', 'Import failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl tracking-tight mb-2 ${AdminTokens.text.primary}`}>Resume / CV</h1>
        <p className={AdminTokens.text.secondary}>Upload and manage your resume or curriculum vitae</p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-3xl border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className={`mb-6 flex gap-2 border-b ${AdminTokens.border.disabled}`}>
        {([
          { id: 'contact', label: 'Contact Info' },
          { id: 'productions', label: 'Productions' },
          { id: 'pdf', label: 'Resume PDF' },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-3 text-sm tracking-wider uppercase transition-colors ${
              activeTab === tab.id
                ? `${AdminTokens.text.primary} border-b-2 border-blue-500`
                : `${AdminTokens.text.secondary} hover:text-white`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contact Info Tab */}
      {activeTab === 'contact' && (
        <div className={AdminTokens.card.base}>
          <h3 className="text-lg text-white mb-6">Contact Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className={AdminTokens.text.secondary + ' block mb-2'}>
                Phone
              </label>
              <input
                type="tel"
                value={cvData.phone || ''}
                onChange={(e) => setCVData(prev => ({ ...prev, phone: e.target.value }))}
                className={AdminTokens.input.base}
                placeholder="(573) 881-0430"
              />
            </div>

            <div>
              <label className={AdminTokens.text.secondary + ' block mb-2'}>
                Email
              </label>
              <input
                type="email"
                value={cvData.email || ''}
                onChange={(e) => setCVData(prev => ({ ...prev, email: e.target.value }))}
                className={AdminTokens.input.base}
                placeholder="brandon@brandonptdavis.com"
              />
            </div>

            <div>
              <label className={AdminTokens.text.secondary + ' block mb-2'}>
                Location
              </label>
              <input
                type="text"
                value={cvData.location || ''}
                onChange={(e) => setCVData(prev => ({ ...prev, location: e.target.value }))}
                className={AdminTokens.input.base}
                placeholder="Irvine, CA"
              />
            </div>

            <div>
              <label className={AdminTokens.text.secondary + ' block mb-2'}>
                Website
              </label>
              <input
                type="url"
                value={cvData.website || ''}
                onChange={(e) => setCVData(prev => ({ ...prev, website: e.target.value }))}
                className={AdminTokens.input.base}
                placeholder="https://brandonptdavis.com"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <PrimaryButton
              onClick={handleSaveContactInfo}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Contact Info
                </>
              )}
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Productions Tab */}
      {activeTab === 'productions' && (
        <div className={AdminTokens.card.base}>
          <h3 className="text-lg text-white mb-6">Productions</h3>
          <div className="mb-8">
            <h4 className={`text-md ${AdminTokens.text.accent} mb-2`}>Upcoming Productions</h4>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className={AdminTokens.text.secondary}>
                  <th className="p-2 w-12">Order</th>
                  <th className="p-2">Production</th>
                  <th className="p-2">Director</th>
                  <th className="p-2">Company</th>
                  <th className="p-2">Year</th>
                  <th className="p-2 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cvData.upcomingProductions?.map((prod, idx) => (
                  <tr key={idx} className={`border-b ${AdminTokens.border.disabled}`}>
                    <td className="p-2">
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => handleMoveProduction('upcoming', idx, 'up')} 
                          disabled={idx === 0}
                          className={`${AdminTokens.text.accent} hover:text-blue-600 ${AdminTokens.text.disabled}`}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleMoveProduction('upcoming', idx, 'down')} 
                          disabled={idx === (cvData.upcomingProductions?.length || 0) - 1}
                          className={`${AdminTokens.text.accent} hover:text-blue-600 ${AdminTokens.text.disabled}`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-2"><input type="text" value={prod.production} onChange={e => handleProductionChange('upcoming', idx, 'production', e.target.value)} className={AdminTokens.input.base} /></td>
                    <td className="p-2"><input type="text" value={prod.director} onChange={e => handleProductionChange('upcoming', idx, 'director', e.target.value)} className={AdminTokens.input.base} /></td>
                    <td className="p-2"><input type="text" value={prod.company} onChange={e => handleProductionChange('upcoming', idx, 'company', e.target.value)} className={AdminTokens.input.base} /></td>
                    <td className="p-2"><input type="text" value={prod.year} onChange={e => handleProductionChange('upcoming', idx, 'year', e.target.value)} className={AdminTokens.input.base} /></td>
                    <td className="p-2">
                      <button type="button" onClick={() => handleRemoveProduction('upcoming', idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PrimaryButton onClick={() => handleAddProduction('upcoming')}><Plus className="w-4 h-4" /> Add Upcoming Production</PrimaryButton>
          </div>
          <div className="mb-8">
            <h4 className="text-md text-blue-400 mb-2">Recent Productions</h4>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-gray-400">
                  <th className="p-2 w-12">Order</th>
                  <th className="p-2">Production</th>
                  <th className="p-2">Director</th>
                  <th className="p-2">Company</th>
                  <th className="p-2">Year</th>
                  <th className="p-2 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cvData.recentProductions?.map((prod, idx) => (
                  <tr key={idx} className="border-b border-gray-800">
                    <td className="p-2">
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => handleMoveProduction('recent', idx, 'up')} 
                          disabled={idx === 0}
                          className="text-blue-400 hover:text-blue-600 disabled:text-gray-600 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleMoveProduction('recent', idx, 'down')} 
                          disabled={idx === (cvData.recentProductions?.length || 0) - 1}
                          className="text-blue-400 hover:text-blue-600 disabled:text-gray-600 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-2"><input type="text" value={prod.production} onChange={e => handleProductionChange('recent', idx, 'production', e.target.value)} className={AdminTokens.input.base} /></td>
                    <td className="p-2"><input type="text" value={prod.director} onChange={e => handleProductionChange('recent', idx, 'director', e.target.value)} className={AdminTokens.input.base} /></td>
                    <td className="p-2"><input type="text" value={prod.company} onChange={e => handleProductionChange('recent', idx, 'company', e.target.value)} className={AdminTokens.input.base} /></td>
                    <td className="p-2"><input type="text" value={prod.year} onChange={e => handleProductionChange('recent', idx, 'year', e.target.value)} className={AdminTokens.input.base} /></td>
                    <td className="p-2">
                      <button type="button" onClick={() => handleRemoveProduction('recent', idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PrimaryButton onClick={() => handleAddProduction('recent')}><Plus className="w-4 h-4" /> Add Production</PrimaryButton>
          </div>
          <div className="mb-8">
            <h4 className="text-md text-blue-400 mb-2">Assistant Design Productions</h4>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-gray-400">
                  <th className="p-2 w-12">Order</th>
                  <th className="p-2">Production</th>
                  <th className="p-2">Designer</th>
                  <th className="p-2">Company</th>
                  <th className="p-2">Year</th>
                  <th className="p-2 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cvData.assistantDesignProductions?.map((prod, idx) => (
                  <tr key={idx} className="border-b border-gray-800">
                    <td className="p-2">
                      <div className="flex flex-col gap-1">
                        <button 
                          type="button"
                          onClick={() => handleMoveProduction('assistant', idx, 'up')} 
                          disabled={idx === 0}
                          className="text-blue-400 hover:text-blue-600 disabled:text-gray-600 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleMoveProduction('assistant', idx, 'down')} 
                          disabled={idx === (cvData.assistantDesignProductions?.length || 0) - 1}
                          className="text-blue-400 hover:text-blue-600 disabled:text-gray-600 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-2"><input type="text" value={prod.production} onChange={e => handleProductionChange('assistant', idx, 'production', e.target.value)} className={AdminTokens.input.base} /></td>
                    <td className="p-2"><input type="text" value={prod.designer} onChange={e => handleProductionChange('assistant', idx, 'designer', e.target.value)} className={AdminTokens.input.base} /></td>
                    <td className="p-2"><input type="text" value={prod.company} onChange={e => handleProductionChange('assistant', idx, 'company', e.target.value)} className={AdminTokens.input.base} /></td>
                    <td className="p-2"><input type="text" value={prod.year} onChange={e => handleProductionChange('assistant', idx, 'year', e.target.value)} className={AdminTokens.input.base} /></td>
                    <td className="p-2">
                      <button type="button" onClick={() => handleRemoveProduction('assistant', idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PrimaryButton onClick={() => handleAddProduction('assistant')}><Plus className="w-4 h-4" /> Add Assistant Production</PrimaryButton>
          </div>

          {/* Legacy Import Utility */}
          <div className="mt-10 p-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10">
            <h4 className="text-sm font-medium tracking-wide text-yellow-300 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Import Legacy Production Data
            </h4>
            <p className="text-xs text-yellow-200/80 leading-relaxed mb-4">
              Use this one‑click tool to populate all 41 historical productions (Upcoming, Recent, Assistant Design). This will overwrite current production lists. Only run once after a reset. Ordering can be adjusted after import.
            </p>
            <PrimaryButton disabled={saving} onClick={handleImportLegacyProductions}>
              {saving ? (<><Loader className="w-4 h-4 animate-spin" /> Importing...</>) : (<><Upload className="w-4 h-4" /> Import 41 Legacy Productions</>)}
            </PrimaryButton>
          </div>
          <div className="flex gap-3 mt-6">
            <PrimaryButton onClick={handleSaveProductions} disabled={saving}>
              {saving ? (<><Loader className="w-4 h-4 animate-spin" /> Saving...</>) : (<><Save className="w-4 h-4" /> Save Productions</>)}
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* PDF Tab */}
      {activeTab === 'pdf' && (
        <div>
      {/* Current Resume */}
      {cvData.resumeUrl ? (
        <div className={AdminTokens.card.base + ' mb-6'}>
          <h3 className="text-lg text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Current Resume
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium mb-1">{cvData.resumeFilename}</p>
                  {cvData.lastUpdated && (
                    <p className="text-xs text-gray-400">
                      Last updated: {new Date(cvData.lastUpdated).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <a
                    href={cvData.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-blue-500/20 rounded-xl transition-colors"
                    title="View resume"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                  </a>
                  <a
                    href={cvData.resumeUrl}
                    download
                    className="p-2 hover:bg-blue-500/20 rounded-xl transition-colors"
                    title="Download resume"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                  </a>
                  <button
                    onClick={handleDelete}
                    className="p-2 hover:bg-red-500/20 rounded-xl transition-colors"
                    title="Delete resume"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              To update your resume, upload a new file below. This will replace the current version.
            </p>
          </div>
        </div>
      ) : (
        <div className={AdminTokens.card.base + ' mb-6'}>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-1">No resume uploaded yet</p>
            <p className="text-xs text-gray-500">Upload a PDF below to get started</p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className={AdminTokens.card.base}>
        <h3 className="text-lg text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-400" />
          {cvData.resumeUrl ? 'Upload New Resume' : 'Upload Resume'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className={`block text-xs tracking-wider uppercase ${AdminTokens.text.secondary} mb-2`}>
              Resume File (PDF only, max 10MB)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:tracking-wider file:uppercase file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:transition-colors disabled:opacity-50"
            />
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-blue-400">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Uploading resume...</span>
            </div>
          )}

          <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-white">Tips:</strong><br />
              • Use a professionally formatted PDF<br />
              • Keep file size under 10MB for faster loading<br />
              • Update regularly to reflect your latest experience
            </p>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}

