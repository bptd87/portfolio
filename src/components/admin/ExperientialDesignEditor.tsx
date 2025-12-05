import React, { useState } from 'react';
import { Plus, X, Trash2, ChevronUp, ChevronDown, Star } from 'lucide-react';
import { ImageUploader } from './ImageUploader';

interface KeyFeature {
  title: string;
  description: string;
}

interface ProcessStep {
  title: string;
  description: string;
  image?: string;
}

interface TeamMember {
  name: string;
  role: string;
}

interface Metric {
  value: string;
  label: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

interface ContentBlock {
  type: 'text' | 'image' | 'gallery' | 'heading' | 'youtube';
  content?: string;
  src?: string;
  caption?: string;
  images?: string[];
  captions?: string[];
  layout?: 'grid' | 'masonry';
  videoId?: string;
  title?: string;
}

interface ExperientialProject {
  // Agency stats
  clientName?: string;
  role?: string;
  duration?: string;
  
  // Main content
  challenge?: string;
  solution?: string;
  
  // Key features
  keyFeatures?: KeyFeature[];
  
  // Process timeline
  process?: ProcessStep[];
  
  // Team
  team?: TeamMember[];
  
  // Metrics
  metrics?: Metric[];
  
  // Testimonial
  testimonial?: Testimonial;
  
  // Additional content blocks
  content?: ContentBlock[];
}

interface ExperientialDesignEditorProps {
  data: ExperientialProject;
  onChange: (data: ExperientialProject) => void;
  currentCover?: string;
  onSetCover?: (url: string) => void;
}

export function ExperientialDesignEditor({ 
  data, 
  onChange,
  currentCover,
  onSetCover,
}: ExperientialDesignEditorProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['stats', 'challenge']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Key Features handlers
  const addKeyFeature = () => {
    const newFeatures = [...(data.keyFeatures || []), { title: '', description: '' }];
    onChange({ ...data, keyFeatures: newFeatures });
  };

  const updateKeyFeature = (index: number, field: keyof KeyFeature, value: string) => {
    const newFeatures = [...(data.keyFeatures || [])];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange({ ...data, keyFeatures: newFeatures });
  };

  const removeKeyFeature = (index: number) => {
    const newFeatures = (data.keyFeatures || []).filter((_, i) => i !== index);
    onChange({ ...data, keyFeatures: newFeatures });
  };

  // Process handlers
  const addProcessStep = () => {
    const newProcess = [...(data.process || []), { title: '', description: '', image: '' }];
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

  const moveProcessStep = (index: number, direction: 'up' | 'down') => {
    const newProcess = [...(data.process || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newProcess.length) return;
    
    [newProcess[index], newProcess[targetIndex]] = [newProcess[targetIndex], newProcess[index]];
    onChange({ ...data, process: newProcess });
  };

  // Team handlers
  const addTeamMember = () => {
    const newTeam = [...(data.team || []), { name: '', role: '' }];
    onChange({ ...data, team: newTeam });
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const newTeam = [...(data.team || [])];
    newTeam[index] = { ...newTeam[index], [field]: value };
    onChange({ ...data, team: newTeam });
  };

  const removeTeamMember = (index: number) => {
    const newTeam = (data.team || []).filter((_, i) => i !== index);
    onChange({ ...data, team: newTeam });
  };

  // Metrics handlers
  const addMetric = () => {
    const newMetrics = [...(data.metrics || []), { value: '', label: '' }];
    onChange({ ...data, metrics: newMetrics });
  };

  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    const newMetrics = [...(data.metrics || [])];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    onChange({ ...data, metrics: newMetrics });
  };

  const removeMetric = (index: number) => {
    const newMetrics = (data.metrics || []).filter((_, i) => i !== index);
    onChange({ ...data, metrics: newMetrics });
  };

  // Content blocks handlers
  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = { type };
    if (type === 'gallery') {
      newBlock.images = [];
      newBlock.captions = [];
      newBlock.layout = 'grid';
    }
    const newContent = [...(data.content || []), newBlock];
    onChange({ ...data, content: newContent });
  };

  const updateContentBlock = (index: number, updates: Partial<ContentBlock>) => {
    const newContent = [...(data.content || [])];
    newContent[index] = { ...newContent[index], ...updates };
    onChange({ ...data, content: newContent });
  };

  const removeContentBlock = (index: number) => {
    const newContent = (data.content || []).filter((_, i) => i !== index);
    onChange({ ...data, content: newContent });
  };

  const addImageToGallery = (blockIndex: number) => {
    const block = data.content?.[blockIndex];
    if (block?.type === 'gallery') {
      const newImages = [...(block.images || []), ''];
      const newCaptions = [...(block.captions || []), ''];
      updateContentBlock(blockIndex, { images: newImages, captions: newCaptions });
    }
  };

  const updateGalleryImage = (blockIndex: number, imageIndex: number, field: 'url' | 'caption', value: string) => {
    const block = data.content?.[blockIndex];
    if (block?.type === 'gallery') {
      if (field === 'url') {
        const newImages = [...(block.images || [])];
        newImages[imageIndex] = value;
        updateContentBlock(blockIndex, { images: newImages });
      } else {
        const newCaptions = [...(block.captions || [])];
        newCaptions[imageIndex] = value;
        updateContentBlock(blockIndex, { captions: newCaptions });
      }
    }
  };

  const removeGalleryImage = (blockIndex: number, imageIndex: number) => {
    const block = data.content?.[blockIndex];
    if (block?.type === 'gallery') {
      const newImages = (block.images || []).filter((_, i) => i !== imageIndex);
      const newCaptions = (block.captions || []).filter((_, i) => i !== imageIndex);
      updateContentBlock(blockIndex, { images: newImages, captions: newCaptions });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-accent-brand/5 border border-accent-brand/20 p-4">
        <p className="text-xs tracking-wider uppercase text-gray-400 mb-2">Experiential Design - Agency Template</p>
        <p className="text-sm text-gray-300">
          Complete agency-style case study format with stats, challenge, solution, process timeline, team, metrics, and testimonials.
        </p>
      </div>

      {/* Agency Stats Section */}
      <div>
        <button type="button"
          onClick={() => toggleSection('stats')}
          className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
        >
          <span className="text-xs tracking-wider uppercase font-medium">Hero Stats (Client, Role, Timeline)</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('stats') ? 'rotate-180' : ''}`} />
        </button>
        
        {expandedSections.includes('stats') && (
          <div className="border border-t-0 border-accent-brand/20 p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Client Name</label>
                <input
                  type="text"
                  value={data.clientName || ''}
                  onChange={(e) => onChange({ ...data, clientName: e.target.value })}
                  placeholder="e.g., Global Tech Innovations"
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Your Role</label>
                <input
                  type="text"
                  value={data.role || ''}
                  onChange={(e) => onChange({ ...data, role: e.target.value })}
                  placeholder="e.g., Lead Experience Designer"
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Timeline/Duration</label>
                <input
                  type="text"
                  value={data.duration || ''}
                  onChange={(e) => onChange({ ...data, duration: e.target.value })}
                  placeholder="e.g., 6 Months"
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Challenge Section */}
      <div>
        <button type="button"
          onClick={() => toggleSection('challenge')}
          className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
        >
          <span className="text-xs tracking-wider uppercase font-medium">The Challenge</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('challenge') ? 'rotate-180' : ''}`} />
        </button>
        
        {expandedSections.includes('challenge') && (
          <div className="border border-t-0 border-accent-brand/20 p-4">
            <textarea
              value={data.challenge || ''}
              onChange={(e) => onChange({ ...data, challenge: e.target.value })}
              placeholder="What was the main challenge or problem to solve? This will display in large italic text."
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none text-sm"
            />
          </div>
        )}
      </div>

      {/* Solution Section */}
      <div>
        <button type="button"
          onClick={() => toggleSection('solution')}
          className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
        >
          <span className="text-xs tracking-wider uppercase font-medium">Our Approach / Solution</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('solution') ? 'rotate-180' : ''}`} />
        </button>
        
        {expandedSections.includes('solution') && (
          <div className="border border-t-0 border-accent-brand/20 p-4">
            <textarea
              value={data.solution || ''}
              onChange={(e) => onChange({ ...data, solution: e.target.value })}
              placeholder="How did you approach the challenge? What was your solution? Use double line breaks (press Enter twice) to create multiple paragraphs."
              rows={6}
              className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none text-sm"
            />
          </div>
        )}
      </div>

      {/* Key Features Section */}
      <div>
        <button type="button"
          onClick={() => toggleSection('features')}
          className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
        >
          <span className="text-xs tracking-wider uppercase font-medium">Key Features ({(data.keyFeatures || []).length})</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('features') ? 'rotate-180' : ''}`} />
        </button>
        
        {expandedSections.includes('features') && (
          <div className="border border-t-0 border-accent-brand/20 p-4 space-y-4">
            {(data.keyFeatures || []).map((feature, index) => (
              <div key={index} className="p-4 bg-background border border-border space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Feature {index + 1}</span>
                  <button type="button"
                    onClick={() => removeKeyFeature(index)}
                    className="p-1 opacity-60 hover:opacity-100 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={feature.title}
                  onChange={(e) => updateKeyFeature(index, 'title', e.target.value)}
                  placeholder="Feature title"
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                />
                <textarea
                  value={feature.description}
                  onChange={(e) => updateKeyFeature(index, 'description', e.target.value)}
                  placeholder="Feature description"
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none text-sm"
                />
              </div>
            ))}
            <button type="button"
              onClick={addKeyFeature}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border hover:border-accent-brand transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Key Feature
            </button>
          </div>
        )}
      </div>

      {/* Process Timeline Section */}
      <div>
        <button type="button"
          onClick={() => toggleSection('process')}
          className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
        >
          <span className="text-xs tracking-wider uppercase font-medium">Process Timeline ({(data.process || []).length} steps)</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('process') ? 'rotate-180' : ''}`} />
        </button>
        
        {expandedSections.includes('process') && (
          <div className="border border-t-0 border-accent-brand/20 p-4 space-y-4">
            {(data.process || []).map((step, index) => (
              <div key={index} className="p-4 bg-background border border-border space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Step {index + 1}</span>
                  <div className="flex items-center gap-2">
                    {index > 0 && (
                      <button type="button"
                        onClick={() => moveProcessStep(index, 'up')}
                        className="p-1 opacity-60 hover:opacity-100 transition-all"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                    )}
                    {index < (data.process || []).length - 1 && (
                      <button type="button"
                        onClick={() => moveProcessStep(index, 'down')}
                        className="p-1 opacity-60 hover:opacity-100 transition-all"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    )}
                    <button type="button"
                      onClick={() => removeProcessStep(index)}
                      className="p-1 opacity-60 hover:opacity-100 hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => updateProcessStep(index, 'title', e.target.value)}
                  placeholder="Step title"
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                />
                <textarea
                  value={step.description}
                  onChange={(e) => updateProcessStep(index, 'description', e.target.value)}
                  placeholder="Step description"
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none text-sm"
                />
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Step Image (Optional)</label>
                  <ImageUploader
                    value={step.image || ''}
                    onChange={(url) => updateProcessStep(index, 'image', url)}
                    label="Upload or drag image here"
                  />
                </div>
              </div>
            ))}
            <button type="button"
              onClick={addProcessStep}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border hover:border-accent-brand transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Process Step
            </button>
          </div>
        )}
      </div>

      {/* Team Section */}
      <div>
        <button type="button"
          onClick={() => toggleSection('team')}
          className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
        >
          <span className="text-xs tracking-wider uppercase font-medium">Team & Collaborators ({(data.team || []).length})</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('team') ? 'rotate-180' : ''}`} />
        </button>
        
        {expandedSections.includes('team') && (
          <div className="border border-t-0 border-accent-brand/20 p-4 space-y-3">
            {(data.team || []).map((member, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                  placeholder="Name"
                  className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                />
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                  placeholder="Role"
                  className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                />
                <button type="button"
                  onClick={() => removeTeamMember(index)}
                  className="p-2 opacity-60 hover:opacity-100 hover:text-destructive transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button"
              onClick={addTeamMember}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border hover:border-accent-brand transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Team Member
            </button>
          </div>
        )}
      </div>

      {/* Metrics Section */}
      <div>
        <button type="button"
          onClick={() => toggleSection('metrics')}
          className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
        >
          <span className="text-xs tracking-wider uppercase font-medium">Impact & Results Metrics ({(data.metrics || []).length})</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('metrics') ? 'rotate-180' : ''}`} />
        </button>
        
        {expandedSections.includes('metrics') && (
          <div className="border border-t-0 border-accent-brand/20 p-4 space-y-3">
            <p className="text-xs text-gray-400 mb-3">These display as large dramatic numbers with labels</p>
            {(data.metrics || []).map((metric, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={metric.value}
                  onChange={(e) => updateMetric(index, 'value', e.target.value)}
                  placeholder="e.g., 10,000+ or 94%"
                  className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                />
                <input
                  type="text"
                  value={metric.label}
                  onChange={(e) => updateMetric(index, 'label', e.target.value)}
                  placeholder="e.g., VISITORS"
                  className="flex-1 px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                />
                <button type="button"
                  onClick={() => removeMetric(index)}
                  className="p-2 opacity-60 hover:opacity-100 hover:text-destructive transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button"
              onClick={addMetric}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border hover:border-accent-brand transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Metric
            </button>
          </div>
        )}
      </div>

      {/* Testimonial Section */}
      <div>
        <button type="button"
          onClick={() => toggleSection('testimonial')}
          className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
        >
          <span className="text-xs tracking-wider uppercase font-medium">Client Testimonial</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('testimonial') ? 'rotate-180' : ''}`} />
        </button>
        
        {expandedSections.includes('testimonial') && (
          <div className="border border-t-0 border-accent-brand/20 p-4 space-y-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Quote</label>
              <textarea
                value={data.testimonial?.quote || ''}
                onChange={(e) => onChange({ 
                  ...data, 
                  testimonial: { ...(data.testimonial || { quote: '', author: '', role: '' }), quote: e.target.value }
                })}
                placeholder="The testimonial quote (without quotation marks)"
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Author Name</label>
                <input
                  type="text"
                  value={data.testimonial?.author || ''}
                  onChange={(e) => onChange({ 
                    ...data, 
                    testimonial: { ...(data.testimonial || { quote: '', author: '', role: '' }), author: e.target.value }
                  })}
                  placeholder="e.g., Jennifer Martinez"
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase text-gray-300 mb-2">Author Role</label>
                <input
                  type="text"
                  value={data.testimonial?.role || ''}
                  onChange={(e) => onChange({ 
                    ...data, 
                    testimonial: { ...(data.testimonial || { quote: '', author: '', role: '' }), role: e.target.value }
                  })}
                  placeholder="e.g., VP of Brand Experience"
                  className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Content Blocks Section */}
      <div>
        <button type="button"
          onClick={() => toggleSection('content')}
          className="w-full flex items-center justify-between p-3 bg-accent-brand/5 border border-accent-brand/20 hover:bg-accent-brand/10 transition-colors"
        >
          <span className="text-xs tracking-wider uppercase font-medium">Additional Content Blocks ({(data.content || []).length})</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes('content') ? 'rotate-180' : ''}`} />
        </button>
        
        {expandedSections.includes('content') && (
          <div className="border border-t-0 border-accent-brand/20 p-4 space-y-4">
            <p className="text-xs text-gray-400 mb-3">Add headings, text, images, galleries, and videos</p>
            
            {/* Content blocks */}
            {(data.content || []).map((block, blockIndex) => (
              <div key={blockIndex} className="p-4 bg-background border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-wider uppercase opacity-60">{block.type}</span>
                  <button type="button"
                    onClick={() => removeContentBlock(blockIndex)}
                    className="p-1 opacity-60 hover:opacity-100 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {block.type === 'heading' && (
                  <input
                    type="text"
                    value={block.content || ''}
                    onChange={(e) => updateContentBlock(blockIndex, { content: e.target.value })}
                    placeholder="Section heading (uppercase)"
                    className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                  />
                )}

                {block.type === 'text' && (
                  <textarea
                    value={block.content || ''}
                    onChange={(e) => updateContentBlock(blockIndex, { content: e.target.value })}
                    placeholder="Text content. Use double line breaks for paragraphs."
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none resize-none text-sm"
                  />
                )}

                {block.type === 'image' && (
                  <>
                    <ImageUploader
                      value={block.src || ''}
                      onChange={(url) => updateContentBlock(blockIndex, { src: url })}
                      label="Upload or drag image here"
                    />
                    <input
                      type="text"
                      value={block.caption || ''}
                      onChange={(e) => updateContentBlock(blockIndex, { caption: e.target.value })}
                      placeholder="Image caption (optional)"
                      className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                    />
                  </>
                )}

                {block.type === 'gallery' && (
                  <>
                    <div className="space-y-2">
                      {(block.images || []).map((img, imgIndex) => (
                        <div key={imgIndex} className="flex items-start gap-2">
                          <div className="flex-1 space-y-2">
                            <ImageUploader
                              value={img}
                              onChange={(url) => updateGalleryImage(blockIndex, imgIndex, 'url', url)}
                              label={`Image ${imgIndex + 1}`}
                            />
                            <input
                              type="text"
                              value={block.captions?.[imgIndex] || ''}
                              onChange={(e) => updateGalleryImage(blockIndex, imgIndex, 'caption', e.target.value)}
                              placeholder="Caption"
                              className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                            />
                          </div>
                          <button type="button"
                            onClick={() => removeGalleryImage(blockIndex, imgIndex)}
                            className="p-2 opacity-60 hover:opacity-100 hover:text-destructive transition-all mt-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button type="button"
                      onClick={() => addImageToGallery(blockIndex)}
                      className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-border hover:border-accent-brand transition-colors text-xs"
                    >
                      <Plus className="w-3 h-3" />
                      Add Image to Gallery
                    </button>
                    <select
                      value={block.layout || 'grid'}
                      onChange={(e) => updateContentBlock(blockIndex, { layout: e.target.value as 'grid' | 'masonry' })}
                      className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                    >
                      <option value="grid">Grid Layout</option>
                      <option value="masonry">Masonry Layout</option>
                    </select>
                  </>
                )}

                {block.type === 'youtube' && (
                  <>
                    <input
                      type="text"
                      value={block.videoId || ''}
                      onChange={(e) => updateContentBlock(blockIndex, { videoId: e.target.value })}
                      placeholder="YouTube Video ID (e.g., dQw4w9WgXcQ)"
                      className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                    />
                    <input
                      type="text"
                      value={block.title || ''}
                      onChange={(e) => updateContentBlock(blockIndex, { title: e.target.value })}
                      placeholder="Video title (optional)"
                      className="w-full px-3 py-2 bg-background border border-border focus:border-accent-brand focus:outline-none text-sm"
                    />
                  </>
                )}
              </div>
            ))}

            {/* Add block buttons */}
            <div className="grid grid-cols-5 gap-2">
              <button type="button"
                onClick={() => addContentBlock('heading')}
                className="p-2 border border-dashed border-border hover:border-accent-brand transition-colors text-xs"
              >
                + Heading
              </button>
              <button type="button"
                onClick={() => addContentBlock('text')}
                className="p-2 border border-dashed border-border hover:border-accent-brand transition-colors text-xs"
              >
                + Text
              </button>
              <button type="button"
                onClick={() => addContentBlock('image')}
                className="p-2 border border-dashed border-border hover:border-accent-brand transition-colors text-xs"
              >
                + Image
              </button>
              <button type="button"
                onClick={() => addContentBlock('gallery')}
                className="p-2 border border-dashed border-border hover:border-accent-brand transition-colors text-xs"
              >
                + Gallery
              </button>
              <button type="button"
                onClick={() => addContentBlock('youtube')}
                className="p-2 border border-dashed border-border hover:border-accent-brand transition-colors text-xs"
              >
                + YouTube
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
