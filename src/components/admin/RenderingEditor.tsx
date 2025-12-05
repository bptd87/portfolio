import React, { useState } from 'react';
import { Plus, X, Image as ImageIcon, ChevronUp, ChevronDown, Trash2, Star, Layers } from 'lucide-react';
import { ImageUploader } from './ImageUploader';

interface ImageWithCaption {
  url: string;
  caption: string;
}

interface Gallery {
  heading: string;
  description: string;
  images: ImageWithCaption[];
  layout?: '1-col' | '2-col' | '3-col' | 'masonry';
}

interface ProcessStep {
  title: string;
  description: string;
  image?: string;
}

interface RenderingProject {
  client?: string; // Or "Project Name" if different from title
  softwareUsed?: string[];
  renderResolution?: string; // e.g. "4K", "1080p"
  projectOverview?: string;
  galleries?: Gallery[];
  videoUrls?: string[];
  process?: ProcessStep[];
}

interface RenderingEditorProps {
  data: RenderingProject;
  onChange: (data: RenderingProject) => void;
  currentCover?: string;
  onSetCover?: (url: string) => void;
}

export function RenderingEditor({ 
  data, 
  onChange,
  currentCover,
  onSetCover,
}: RenderingEditorProps) {
  const [expandedGalleries, setExpandedGalleries] = useState<number[]>([0]);
  const [softwareInput, setSoftwareInput] = useState('');

  const toggleGallery = (index: number) => {
    setExpandedGalleries(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const addGallery = () => {
    const newGalleries = [
      ...(data.galleries || []),
      {
        heading: 'New Render Gallery',
        description: '',
        images: [],
        layout: '1-col' as const, // Default to 1-col for high-res renders
      }
    ];
    onChange({ ...data, galleries: newGalleries });
    setExpandedGalleries([...expandedGalleries, newGalleries.length - 1]);
  };

  const updateGallery = (index: number, field: keyof Gallery, value: any) => {
    const newGalleries = [...(data.galleries || [])];
    newGalleries[index] = {
      ...newGalleries[index],
      [field]: value,
    };
    onChange({ ...data, galleries: newGalleries });
  };

  const removeGallery = (index: number) => {
    const newGalleries = (data.galleries || []).filter((_, i) => i !== index);
    onChange({ ...data, galleries: newGalleries });
    setExpandedGalleries(expandedGalleries.filter(i => i !== index));
  };

  const moveGallery = (index: number, direction: 'up' | 'down') => {
    const newGalleries = [...(data.galleries || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newGalleries.length) return;
    
    [newGalleries[index], newGalleries[targetIndex]] = [newGalleries[targetIndex], newGalleries[index]];
    onChange({ ...data, galleries: newGalleries });
  };

  const updateImage = (galleryIndex: number, imageIndex: number, field: 'url' | 'caption', value: string) => {
    const newGalleries = [...(data.galleries || [])];
    newGalleries[galleryIndex].images[imageIndex] = {
      ...newGalleries[galleryIndex].images[imageIndex],
      [field]: value,
    };
    onChange({ ...data, galleries: newGalleries });
  };

  const removeImage = (galleryIndex: number, imageIndex: number) => {
    const newGalleries = [...(data.galleries || [])];
    newGalleries[galleryIndex].images = newGalleries[galleryIndex].images.filter((_, i) => i !== imageIndex);
    onChange({ ...data, galleries: newGalleries });
  };

  const addSoftware = () => {
    if (softwareInput.trim() && !data.softwareUsed?.includes(softwareInput.trim())) {
      const newSoftware = [...(data.softwareUsed || []), softwareInput.trim()];
      onChange({ ...data, softwareUsed: newSoftware });
      setSoftwareInput('');
    }
  };

  const removeSoftware = (item: string) => {
    const newSoftware = (data.softwareUsed || []).filter(s => s !== item);
    onChange({ ...data, softwareUsed: newSoftware });
  };

  const addVideoUrl = () => {
    const newVideos = [...(data.videoUrls || []), ''];
    onChange({ ...data, videoUrls: newVideos });
  };

  const updateVideoUrl = (index: number, value: string) => {
    const newVideos = [...(data.videoUrls || [])];
    newVideos[index] = value;
    onChange({ ...data, videoUrls: newVideos });
  };

  const removeVideoUrl = (index: number) => {
    const newVideos = (data.videoUrls || []).filter((_, i) => i !== index);
    onChange({ ...data, videoUrls: newVideos });
  };

  // Process Steps
  const addProcessStep = () => {
    const newProcess = [
      ...(data.process || []),
      { title: '', description: '', image: '' }
    ];
    onChange({ ...data, process: newProcess });
  };

  const updateProcessStep = (index: number, field: keyof ProcessStep, value: string) => {
    const newProcess = [...(data.process || [])];
    newProcess[index] = { ...newProcess[index], [field]: value };
    onChange({ ...data, process: newProcess });
  };

  const removeProcessStep = (index: number) => {
    const newProcess = (data.process || []).filter((_, i) => i !== index);
    onChange({ ...data, process: newProcess });
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-accent-brand/5 border border-accent-brand/20 p-4">
        <p className="text-xs tracking-wider uppercase opacity-60 mb-2">Rendering & Visualization Template</p>
        <p className="text-sm opacity-80">
          Showcase high-fidelity renderings, 3D visualizations, and flythroughs.
        </p>
      </div>

      {/* Client & Software */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">
            Client / Project Name
          </label>
          <input
            type="text"
            value={data.client || ''}
            onChange={(e) => onChange({ ...data, client: e.target.value })}
            placeholder="e.g., Architectural Client, Theater Company"
            className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">
            Software Used
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={softwareInput}
              onChange={(e) => setSoftwareInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSoftware())}
              placeholder="e.g. Cinema 4D, Vectorworks..."
              className="flex-1 px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
            />
            <button 
              type="button"
              onClick={addSoftware}
              className="px-3 bg-secondary border border-border hover:bg-accent-brand hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data.softwareUsed || []).map((soft, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary border border-border text-xs">
                {soft}
                <button type="button" onClick={() => removeSoftware(soft)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="mt-4">
        <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">
          Project Overview (Narrative)
        </label>
        <textarea
          value={data.projectOverview || ''}
          onChange={(e) => onChange({ ...data, projectOverview: e.target.value })}
          placeholder="Describe the visualization goals, challenges, and narrative..."
          rows={6}
          className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none"
        />
      </div>

      {/* Process & Wireframes */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm tracking-wider uppercase opacity-60 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Process & Wireframes
            </h3>
            <p className="text-xs opacity-40 mt-1">
              Show the evolution of the image (wireframes, lighting passes, etc.)
            </p>
          </div>
          <button type="button"
            onClick={addProcessStep}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent-brand text-white hover:opacity-90 transition-opacity text-xs tracking-wider uppercase"
          >
            <Plus className="w-3 h-3" />
            Add Step
          </button>
        </div>

        {(!data.process || data.process.length === 0) && (
          <div className="text-center py-6 border border-dashed border-border opacity-40">
            <p className="text-xs">No process steps added yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {(data.process || []).map((step, index) => (
            <div key={index} className="border border-border bg-card p-4">
              <div className="flex items-start gap-4">
                <div className="w-32 h-24 bg-secondary border border-border flex-shrink-0">
                  {step.image ? (
                    <img src={step.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageUploader onChange={(url) => updateProcessStep(index, 'image', url)} label="Add" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between">
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateProcessStep(index, 'title', e.target.value)}
                      placeholder="Step Title (e.g. Wireframe)"
                      className="w-full font-medium bg-transparent border-b border-border focus:border-accent-brand focus:outline-none pb-1 mr-4"
                    />
                    <button type="button" onClick={() => removeProcessStep(index)} className="opacity-40 hover:opacity-100 hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateProcessStep(index, 'description', e.target.value)}
                    placeholder="Description of this step..."
                    rows={2}
                    className="w-full bg-secondary border border-border p-2 text-sm focus:border-accent-brand focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Galleries Section */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm tracking-wider uppercase opacity-60">Additional Galleries</h3>
            <p className="text-xs opacity-40 mt-1">
              Group extra images by phase (e.g., Final Renders, Details)
            </p>
          </div>
          <button type="button"
            onClick={addGallery}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent-brand text-white hover:opacity-90 transition-opacity text-xs tracking-wider uppercase"
          >
            <Plus className="w-3 h-3" />
            Add Gallery
          </button>
        </div>

        {(!data.galleries || data.galleries.length === 0) && (
          <div className="text-center py-8 border border-dashed border-border opacity-40">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No galleries yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {(data.galleries || []).map((gallery, galleryIndex) => (
            <div key={galleryIndex} className="border border-border bg-card">
              {/* Gallery Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-secondary">
                <button type="button"
                  onClick={() => toggleGallery(galleryIndex)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <ImageIcon className="w-4 h-4 opacity-60" />
                  <div>
                    <p className="font-medium">{gallery.heading || `Gallery ${galleryIndex + 1}`}</p>
                    <p className="text-xs opacity-60 mt-0.5">
                      {gallery.images?.length || 0} images • {gallery.layout || '1-col'}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-1">
                  <button type="button"
                    onClick={() => moveGallery(galleryIndex, 'up')}
                    disabled={galleryIndex === 0}
                    className="p-1.5 opacity-40 hover:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button type="button"
                    onClick={() => moveGallery(galleryIndex, 'down')}
                    disabled={galleryIndex === (data.galleries?.length || 0) - 1}
                    className="p-1.5 opacity-40 hover:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button type="button"
                    onClick={() => removeGallery(galleryIndex)}
                    className="p-1.5 opacity-40 hover:opacity-100 hover:text-destructive"
                    title="Remove gallery"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Gallery Content */}
              {expandedGalleries.includes(galleryIndex) && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">
                        Gallery Title
                      </label>
                      <input
                        type="text"
                        value={gallery.heading}
                        onChange={(e) => updateGallery(galleryIndex, 'heading', e.target.value)}
                        placeholder="e.g., Final Renderings"
                        className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">
                        Layout Style
                      </label>
                      <select
                        value={gallery.layout || '1-col'}
                        onChange={(e) => updateGallery(galleryIndex, 'layout', e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
                      >
                        <option value="1-col">Full Width (1 Column)</option>
                        <option value="2-col">Grid (2 Columns)</option>
                        <option value="3-col">Grid (3 Columns)</option>
                        <option value="masonry">Masonry (Dynamic Height)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs tracking-wider uppercase opacity-60 mb-2">
                      Description
                    </label>
                    <textarea
                      value={gallery.description}
                      onChange={(e) => updateGallery(galleryIndex, 'description', e.target.value)}
                      placeholder="Describe this set of renderings..."
                      rows={3}
                      className="w-full px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none"
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs tracking-wider uppercase opacity-60">
                        Images
                      </label>
                    </div>

                    {/* Existing Images */}
                    {gallery.images && gallery.images.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {gallery.images.map((image, imageIndex) => (
                          <div key={imageIndex} className="border border-border p-3 bg-background space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 space-y-2">
                                <input
                                  type="text"
                                  value={image.caption}
                                  onChange={(e) => updateImage(galleryIndex, imageIndex, 'caption', e.target.value)}
                                  placeholder="Image caption (optional)"
                                  className="w-full px-3 py-1.5 bg-secondary border border-border focus:border-accent-brand focus:outline-none text-sm"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                {onSetCover && image.url && (
                                  <button type="button"
                                    onClick={() => onSetCover(image.url)}
                                    className={`p-1.5 border transition-colors ${
                                      currentCover === image.url
                                        ? 'bg-accent-brand text-white border-accent-brand'
                                        : 'border-border opacity-40 hover:opacity-100'
                                    }`}
                                    title={currentCover === image.url ? 'Current cover image' : 'Set as cover image'}
                                  >
                                    <Star className="w-4 h-4" />
                                  </button>
                                )}
                                <button type="button"
                                  onClick={() => removeImage(galleryIndex, imageIndex)}
                                  className="p-1.5 opacity-40 hover:opacity-100 hover:text-destructive"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {image.url && (
                              <img 
                                src={image.url} 
                                alt={image.caption || `Preview ${imageIndex + 1}`}
                                className="w-full h-48 object-cover border border-border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <ImageUploader
                      label="Add Render to Gallery"
                      onChange={(url) => {
                        const newGalleries = [...(data.galleries || [])];
                        newGalleries[galleryIndex].images.push({ url, caption: '' });
                        onChange({ ...data, galleries: newGalleries });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Video URLs */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm tracking-wider uppercase opacity-60">Flythroughs & Video</h3>
            <p className="text-xs opacity-40 mt-1">
              Add YouTube or Vimeo links for 3D flythroughs
            </p>
          </div>
          <button type="button"
            onClick={addVideoUrl}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent-brand text-white hover:opacity-90 transition-opacity text-xs tracking-wider uppercase"
          >
            <Plus className="w-3 h-3" />
            Add Video
          </button>
        </div>

        {(!data.videoUrls || data.videoUrls.length === 0) ? (
          <div className="text-center py-6 border border-dashed border-border opacity-40">
            <p className="text-xs">No videos yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.videoUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateVideoUrl(index, e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 px-4 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none"
                />
                <button type="button"
                  onClick={() => removeVideoUrl(index)}
                  className="p-2 opacity-40 hover:opacity-100 hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}