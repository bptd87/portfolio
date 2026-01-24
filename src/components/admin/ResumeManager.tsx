/**
 * RESUME/CV MANAGER
 * 
 * Manage CV page content including contact info, productions, education, and skills.
 * Also supports PDF resume upload for download.
 */

import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Download, ExternalLink, AlertCircle, CheckCircle, Loader, Plus, Save, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { PrimaryButton } from './AdminButtons';
import { AdminTokens } from '../../styles/admin-tokens';

interface CVData {
  // Contact Information
  phone?: string;
  email?: string;
  location?: string;
  website?: string;

  // Productions (JSON arrays)
  upcomingProductions?: Array<{ production: string; director: string; company: string; year: string }>;
  recentProductions?: Array<{ production: string; director: string; company: string; year: string }>;
  assistantDesignProductions?: Array<{ production: string; designer: string; company: string; year: string }>;

  // Education
  education?: Array<{ degree: string; institution: string; year: string; details?: string }>;

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


  useEffect(() => {
    loadResumeData();
  }, []);

  const loadResumeData = async () => {
    try {
      setLoading(true);

      const { data } = await supabase
        .from('site_configuration')
        .select('value')
        .eq('key', 'site_settings')
        .single();

      if (data) {
        const settings = (data as any).value || {};
        setCVData({
          phone: settings.phone || '',
          email: settings.email || '',
          location: settings.location || '',
          website: settings.website || '',
          upcomingProductions: settings.upcomingProductions || [],
          recentProductions: settings.recentProductions || [],
          assistantDesignProductions: settings.assistantDesignProductions || [],
          education: settings.education || [],
          skills: settings.skills || [],
          resumeUrl: settings.resumeUrl,
          resumeFilename: settings.resumeFilename,
          lastUpdated: settings.resumeLastUpdated,
        });
      }
    } catch (error) {
      console.error('Error loading CV data:', error);
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

      // Upload to Supabase Storage - Always use distinct name 'resume.pdf' to support Vercel rewrite
      const filename = 'resume.pdf';

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filename, file, {
          cacheControl: '0', // Disable caching to ensure updates are seen
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filename);

      const url = urlData.publicUrl;

      // Load current settings first, then merge with resume data
      const { data: currentData } = await supabase
        .from('site_configuration')
        .select('value')
        .eq('key', 'site_settings')
        .single();

      const currentSettings = (currentData as any)?.value || {};

      // Save resume URL to settings
      const { error: saveError } = await supabase
        .from('site_configuration')
        .upsert({
          key: 'site_settings',
          value: {
            ...currentSettings,
            resumeUrl: `${url}?t=${Date.now()}`,
            // Only set default if not already set, otherwise preserve or set to "Download Resume"
            resumeFilename: currentSettings.resumeFilename || 'Download Resume',
            resumeLastUpdated: new Date().toISOString(),
          }
        } as any);

      if (saveError) throw saveError;

      setCVData(prev => ({
        ...prev,
        resumeUrl: `${url}?t=${Date.now()}`,
        resumeFilename: currentSettings.resumeFilename || 'Download Resume',
        lastUpdated: new Date().toISOString(),
      }));
      showMessage('success', 'Resume uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      showMessage('error', 'Failed to upload resume: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete current resume? This cannot be undone.')) return;

    try {
      // Load current settings first
      const { data: currentData } = await supabase
        .from('site_configuration')
        .select('value')
        .eq('key', 'site_settings')
        .single();

      const currentSettings = (currentData as any)?.value || {};

      // Update settings to remove resume references
      const { error } = await supabase
        .from('site_configuration')
        .upsert({
          key: 'site_settings',
          value: {
            ...currentSettings,
            resumeUrl: null,
            resumeFilename: null,
            resumeLastUpdated: null,
          }
        } as any);

      if (error) throw error;

      setCVData(prev => ({
        ...prev,
        resumeUrl: undefined,
        resumeFilename: undefined,
        lastUpdated: undefined,
      }));
      showMessage('success', 'Resume deleted');
    } catch (error: any) {
      console.error('Error deleting resume:', error);
      showMessage('error', 'Failed to delete resume: ' + error.message);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveContactInfo = async () => {
    try {
      setSaving(true);

      // Load current settings first
      const { data: currentData } = await supabase
        .from('site_configuration')
        .select('value')
        .eq('key', 'site_settings')
        .single();

      const currentSettings = (currentData as any)?.value || {};

      const { error } = await supabase
        .from('site_configuration')
        .upsert({
          key: 'site_settings',
          value: {
            ...currentSettings,
            phone: cvData.phone,
            email: cvData.email,
            location: cvData.location,
            website: cvData.website,
          }
        } as any);

      if (error) throw error;

      showMessage('success', 'Contact information saved successfully!');
    } catch (error: any) {
      console.error('Error saving contact info:', error);
      showMessage('error', 'Failed to save contact information: ' + error.message);
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
      setSaving(true);

      // Load current settings first
      const { data: currentData } = await supabase
        .from('site_configuration')
        .select('value')
        .eq('key', 'site_settings')
        .single();

      const currentSettings = (currentData as any)?.value || {};

      const { error } = await supabase
        .from('site_configuration')
        .upsert({
          key: 'site_settings',
          value: {
            ...currentSettings,
            upcomingProductions: cvData.upcomingProductions,
            recentProductions: cvData.recentProductions,
            assistantDesignProductions: cvData.assistantDesignProductions,
          }
        } as any);

      if (error) throw error;

      showMessage('success', 'Productions saved successfully!');
    } catch (error: any) {
      console.error('Error saving productions:', error);
      showMessage('error', 'Failed to save productions: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // One-click legacy import
  const handleImportLegacyProductions = async () => {
    try {
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

      // Load current settings first
      const { data: currentData } = await supabase
        .from('site_configuration')
        .select('value')
        .eq('key', 'site_settings')
        .single();

      const currentSettings = (currentData as any)?.value || {};

      const { error } = await supabase
        .from('site_configuration')
        .upsert({
          key: 'site_settings',
          value: {
            ...currentSettings,
            upcomingProductions,
            recentProductions,
            assistantDesignProductions
          }
        } as any);

      if (error) throw error;

      showMessage('success', 'Legacy productions imported successfully!');
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
          className={`mb-6 px-4 py-3 rounded-3xl border flex items-center gap-3 ${message.type === 'success'
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
            className={`px-4 py-3 text-sm tracking-wider uppercase transition-colors ${activeTab === tab.id
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
                          title="Move Up"
                          aria-label="Move Production Up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveProduction('upcoming', idx, 'down')}
                          disabled={idx === (cvData.upcomingProductions?.length || 0) - 1}
                          className={`${AdminTokens.text.accent} hover:text-blue-600 ${AdminTokens.text.disabled}`}
                          title="Move Down"
                          aria-label="Move Production Down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-2"><input type="text" aria-label="Production Name" value={prod.production} onChange={e => handleProductionChange('upcoming', idx, 'production', e.target.value)} className={AdminTokens.input.base} placeholder="Production Name" /></td>
                    <td className="p-2"><input type="text" aria-label="Director Name" value={prod.director} onChange={e => handleProductionChange('upcoming', idx, 'director', e.target.value)} className={AdminTokens.input.base} placeholder="Director" /></td>
                    <td className="p-2"><input type="text" aria-label="Company Name" value={prod.company} onChange={e => handleProductionChange('upcoming', idx, 'company', e.target.value)} className={AdminTokens.input.base} placeholder="Company" /></td>
                    <td className="p-2"><input type="text" aria-label="Production Year" value={prod.year} onChange={e => handleProductionChange('upcoming', idx, 'year', e.target.value)} className={AdminTokens.input.base} placeholder="Year" /></td>
                    <td className="p-2">
                      <button type="button" onClick={() => handleRemoveProduction('upcoming', idx)} className="text-red-400 hover:text-red-600" title="Remove Production" aria-label="Remove Production"><Trash2 className="w-4 h-4" /></button>
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
                          title="Move Up"
                          aria-label="Move Production Up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveProduction('recent', idx, 'down')}
                          disabled={idx === (cvData.recentProductions?.length || 0) - 1}
                          className="text-blue-400 hover:text-blue-600 disabled:text-gray-600 disabled:cursor-not-allowed"
                          title="Move Down"
                          aria-label="Move Production Down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-2"><input type="text" aria-label="Production Name" value={prod.production} onChange={e => handleProductionChange('recent', idx, 'production', e.target.value)} className={AdminTokens.input.base} placeholder="Production Name" /></td>
                    <td className="p-2"><input type="text" aria-label="Director Name" value={prod.director} onChange={e => handleProductionChange('recent', idx, 'director', e.target.value)} className={AdminTokens.input.base} placeholder="Director" /></td>
                    <td className="p-2"><input type="text" aria-label="Company Name" value={prod.company} onChange={e => handleProductionChange('recent', idx, 'company', e.target.value)} className={AdminTokens.input.base} placeholder="Company" /></td>
                    <td className="p-2"><input type="text" aria-label="Production Year" value={prod.year} onChange={e => handleProductionChange('recent', idx, 'year', e.target.value)} className={AdminTokens.input.base} placeholder="Year" /></td>
                    <td className="p-2">
                      <button type="button" onClick={() => handleRemoveProduction('recent', idx)} className="text-red-400 hover:text-red-600" title="Remove Production" aria-label="Remove Production"><Trash2 className="w-4 h-4" /></button>
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
                          title="Move Up"
                          aria-label="Move Production Up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveProduction('assistant', idx, 'down')}
                          disabled={idx === (cvData.assistantDesignProductions?.length || 0) - 1}
                          className="text-blue-400 hover:text-blue-600 disabled:text-gray-600 disabled:cursor-not-allowed"
                          title="Move Down"
                          aria-label="Move Production Down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-2"><input type="text" aria-label="Production Name" value={prod.production} onChange={e => handleProductionChange('assistant', idx, 'production', e.target.value)} className={AdminTokens.input.base} placeholder="Production Name" /></td>
                    <td className="p-2"><input type="text" aria-label="Designer Name" value={prod.designer} onChange={e => handleProductionChange('assistant', idx, 'designer', e.target.value)} className={AdminTokens.input.base} placeholder="Designer" /></td>
                    <td className="p-2"><input type="text" aria-label="Company Name" value={prod.company} onChange={e => handleProductionChange('assistant', idx, 'company', e.target.value)} className={AdminTokens.input.base} placeholder="Company" /></td>
                    <td className="p-2"><input type="text" aria-label="Production Year" value={prod.year} onChange={e => handleProductionChange('assistant', idx, 'year', e.target.value)} className={AdminTokens.input.base} placeholder="Year" /></td>
                    <td className="p-2">
                      <button type="button" onClick={() => handleRemoveProduction('assistant', idx)} className="text-red-400 hover:text-red-600" title="Remove Production" aria-label="Remove Production"><Trash2 className="w-4 h-4" /></button>
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
        <div className={AdminTokens.card.base}>
          <h3 className="text-lg text-white mb-6">Resume Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Manual URL Input */}
            <div>
              <label className={AdminTokens.text.secondary + ' block mb-2'}>
                Resume PDF URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cvData.resumeUrl || ''}
                  onChange={(e) => setCVData(prev => ({ ...prev, resumeUrl: e.target.value }))}
                  className={AdminTokens.input.base}
                  placeholder="https://..."
                />
                {cvData.resumeUrl && (
                  <a
                    href={cvData.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-blue-400 border border-zinc-700 hover:border-blue-500/50 transition-all"
                    title="Test Link"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Upload a file below or paste a link to an external PDF (e.g. Google Drive, Dropbox).
              </p>
            </div>

            {/* Button Label Input */}
            <div>
              <label className={AdminTokens.text.secondary + ' block mb-2'}>
                Button Label
              </label>
              <input
                type="text"
                value={cvData.resumeFilename || ''}
                onChange={(e) => setCVData(prev => ({ ...prev, resumeFilename: e.target.value }))}
                className={AdminTokens.input.base}
                placeholder="Download Resume"
              />
              <p className="text-xs text-zinc-500 mt-2">
                Text displayed on the button (e.g. "Download Resume").
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div className="border-t border-zinc-800 pt-6 mb-6">
            <label className={AdminTokens.text.secondary + ' block mb-4'}>
              Upload New File
            </label>
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploading ? 'border-blue-500/50 bg-blue-500/5' : 'border-zinc-700 hover:bg-zinc-800'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <>
                    <Loader className="w-8 h-8 text-blue-400 animate-spin mb-2" />
                    <p className="text-sm text-blue-400">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                    <p className="text-sm text-zinc-400">
                      <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">PDF (MAX. 10MB)</p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-zinc-800 pt-6">
            <PrimaryButton
              onClick={async () => {
                try {
                  setSaving(true);
                  // Save specific resume settings
                  const { data: currentData } = await supabase.from('site_configuration').select('value').eq('key', 'site_settings').single();
                  const currentSettings = (currentData as any)?.value || {};

                  const { error } = await supabase.from('site_configuration').upsert({
                    key: 'site_settings',
                    value: {
                      ...currentSettings,
                      resumeUrl: cvData.resumeUrl,
                      resumeFilename: cvData.resumeFilename || 'Download Resume',
                      resumeLastUpdated: new Date().toISOString()
                    }
                  } as any);

                  if (error) throw error;
                  showMessage('success', 'Resume settings saved!');
                } catch (e: any) {
                  showMessage('error', e.message);
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Settings
                </>
              )}
            </PrimaryButton>

            {cvData.resumeUrl && (
              <button
                onClick={handleDelete}
                className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove Resume
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

