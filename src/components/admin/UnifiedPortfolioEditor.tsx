import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Video, Layers, Image as ImageIcon, Star, X } from 'lucide-react';
import { ImageGalleryManager } from './ImageUploader';
import { ImageUploader } from './ImageUploader';
import { GalleryEditor } from './ProjectTemplateFields';
import { YouTubeVideosEditor } from './YouTubeVideosEditor';
import { SimpleAgencyEditor } from './SimpleAgencyEditor';

// Shared interfaces
interface KeyFeature {
  title: string;
  description: string;
}

interface ProcessStep {
  title: string;
  description: string;
  images?: string[];
  imageCaptions?: string[];
  image?: string; // For Rendering (single image)
}

interface TeamMember {
  name: string;
  role: string;
}

interface Metric {
  value: string;
  label: string;
}

interface AdditionalGallery {
  id: string;
  heading: string;
  description: string;
  images: Array<{
    url: string;
    caption: string;
    alt?: string;
  }>;
  layout: '1-col' | '2-col' | '3-col' | 'masonry';
}

interface RenderingGallery {
  heading: string;
  description: string;
  images: Array<{
    url: string;
    caption: string;
  }>;
  layout?: '1-col' | '2-col' | '3-col' | 'masonry';
}

interface UnifiedPortfolioEditorProps {
  category: string;
  data: any; // Full form data
  onChange: (updates: Record<string, any>) => void; // Updates specific fields
  currentCover?: string;
  onSetCover?: (url: string) => void;
  projectContext?: string;
}

export function UnifiedPortfolioEditor({
  category,
  data,
  onChange,
  currentCover,
  onSetCover,
  projectContext = '',
}: UnifiedPortfolioEditorProps) {
  // Determine Editor Mode
  // "Agency" Mode = Experiential, Rendering, Scenic Models (Uses Modal, Hero, Grid)
  const isAgency =
    category?.includes('Experiential') ||
    category?.includes('Rendering') ||
    category?.includes('Visualization') ||
    category?.includes('Model') ||
    data.subcategory?.includes('Model') ||
    data.subcategory === 'Scenic Models';

  // "Classic" Mode = Scenic Design (Uses ProjectDetailNew, Sections)
  const isClassic = !isAgency;

  const isRendering = category?.includes('Rendering');
  const videoField = isRendering ? 'videoUrls' : 'youtubeVideos';

  // Experiential-specific state
  const [expandedSections, setExpandedSections] = useState<string[]>(['stats', 'challenge']);

  // Rendering-specific state
  const [expandedGalleries, setExpandedGalleries] = useState<number[]>([0]);
  const [softwareInput, setSoftwareInput] = useState('');

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleGallery = (index: number) => {
    setExpandedGalleries(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };


  // EXPERIENTIAL DESIGN HANDLERS
  const addKeyFeature = () => {
    const newFeatures = [...(data.keyFeatures || []), { title: '', description: '' }];
    onChange({ keyFeatures: newFeatures });
  };

  const updateKeyFeature = (index: number, field: keyof KeyFeature, value: string) => {
    const newFeatures = [...(data.keyFeatures || [])];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange({ keyFeatures: newFeatures });
  };

  const removeKeyFeature = (index: number) => {
    const newFeatures = (data.keyFeatures || []).filter((_: any, i: number) => i !== index);
    onChange({ keyFeatures: newFeatures });
  };

  const addProcessStep = () => {
    const newProcess = [...(data.process || []), isRendering
      ? { title: '', description: '', image: '' }
      : { title: '', description: '', images: [], imageCaptions: [] }
    ];
    onChange({ process: newProcess });
  };

  const updateProcessStep = (index: number, field: keyof ProcessStep, value: any) => {
    const newProcess = [...(data.process || [])];
    newProcess[index] = { ...newProcess[index], [field]: value };
    onChange({ process: newProcess });
  };

  const removeProcessStep = (index: number) => {
    const newProcess = (data.process || []).filter((_: any, i: number) => i !== index);
    onChange({ process: newProcess });
  };

  const moveProcessStep = (index: number, direction: 'up' | 'down') => {
    const newProcess = [...(data.process || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProcess.length) return;
    [newProcess[index], newProcess[targetIndex]] = [newProcess[targetIndex], newProcess[index]];
    onChange({ process: newProcess });
  };

  const addTeamMember = () => {
    const newTeam = [...(data.team || []), { name: '', role: '' }];
    onChange({ team: newTeam });
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const newTeam = [...(data.team || [])];
    newTeam[index] = { ...newTeam[index], [field]: value };
    onChange({ team: newTeam });
  };

  const removeTeamMember = (index: number) => {
    const newTeam = (data.team || []).filter((_: any, i: number) => i !== index);
    onChange({ team: newTeam });
  };

  const addMetric = () => {
    const newMetrics = [...(data.metrics || []), { value: '', label: '' }];
    onChange({ metrics: newMetrics });
  };

  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    const newMetrics = [...(data.metrics || [])];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    onChange({ metrics: newMetrics });
  };

  const removeMetric = (index: number) => {
    const newMetrics = (data.metrics || []).filter((_: any, i: number) => i !== index);
    onChange({ metrics: newMetrics });
  };

  const addVideoUrl = () => {
    const newVideos = [...((data[videoField] as string[]) || []), ''];
    onChange({ [videoField]: newVideos });
  };

  const updateVideoUrl = (index: number, value: string) => {
    const newVideos = [...((data[videoField] as string[]) || [])];
    newVideos[index] = value;
    onChange({ [videoField]: newVideos });
  };

  const removeVideoUrl = (index: number) => {
    const newVideos = ((data[videoField] as string[]) || []).filter((_: any, i: number) => i !== index);
    onChange({ [videoField]: newVideos });
  };

  // Experiential: Additional Galleries
  const addAdditionalGallery = () => {
    const newGallery: AdditionalGallery = {
      id: crypto.randomUUID(),
      heading: 'New Gallery',
      description: '',
      images: [],
      layout: '3-col'
    };
    const galleries = data.galleries || {};
    onChange({
      galleries: {
        ...galleries,
        additional: [...(galleries.additional || []), newGallery]
      }
    });
  };

  const updateAdditionalGallery = (index: number, field: keyof AdditionalGallery, value: any) => {
    const galleries = data.galleries || {};
    const newAdditional = [...(galleries.additional || [])];
    newAdditional[index] = { ...newAdditional[index], [field]: value };
    onChange({
      galleries: {
        ...galleries,
        additional: newAdditional
      }
    });
  };

  const removeAdditionalGallery = (index: number) => {
    const galleries = data.galleries || {};
    const newAdditional = (galleries.additional || []).filter((_: any, i: number) => i !== index);
    onChange({
      galleries: {
        ...galleries,
        additional: newAdditional
      }
    });
  };

  const updateGalleryImages = (galleryIndex: number, newImages: Array<{ url: string; caption?: string; alt?: string; }>) => {
    const galleries = data.galleries || {};
    const newAdditional = [...(galleries.additional || [])];
    newAdditional[galleryIndex].images = newImages;
    onChange({
      galleries: {
        ...galleries,
        additional: newAdditional
      }
    });
  };

  // Rendering: Galleries
  const addRenderingGallery = () => {
    const newGalleries = [
      ...(Array.isArray(data.galleries) ? data.galleries : []),
      {
        heading: 'New Render Gallery',
        description: '',
        images: [],
        layout: '1-col' as const,
      }
    ];
    onChange({ galleries: newGalleries });
    setExpandedGalleries([...expandedGalleries, newGalleries.length - 1]);
  };

  const updateRenderingGallery = (index: number, field: keyof RenderingGallery, value: any) => {
    const newGalleries = [...(Array.isArray(data.galleries) ? data.galleries : [])];
    newGalleries[index] = { ...newGalleries[index], [field]: value };
    onChange({ galleries: newGalleries });
  };

  const removeRenderingGallery = (index: number) => {
    const newGalleries = (Array.isArray(data.galleries) ? data.galleries : []).filter((_: any, i: number) => i !== index);
    onChange({ galleries: newGalleries });
    setExpandedGalleries(expandedGalleries.filter(i => i !== index));
  };

  const moveRenderingGallery = (index: number, direction: 'up' | 'down') => {
    const newGalleries = [...(Array.isArray(data.galleries) ? data.galleries : [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newGalleries.length) return;
    [newGalleries[index], newGalleries[targetIndex]] = [newGalleries[targetIndex], newGalleries[index]];
    onChange({ galleries: newGalleries });
  };

  const updateRenderingImage = (galleryIndex: number, imageIndex: number, field: 'url' | 'caption', value: string) => {
    const newGalleries = [...(Array.isArray(data.galleries) ? data.galleries : [])];
    newGalleries[galleryIndex].images[imageIndex] = {
      ...newGalleries[galleryIndex].images[imageIndex],
      [field]: value,
    };
    onChange({ galleries: newGalleries });
  };

  const removeRenderingImage = (galleryIndex: number, imageIndex: number) => {
    const newGalleries = [...(Array.isArray(data.galleries) ? data.galleries : [])];
    newGalleries[galleryIndex].images = newGalleries[galleryIndex].images.filter((_: any, i: number) => i !== imageIndex);
    onChange({ galleries: newGalleries });
  };

  const addSoftware = () => {
    if (softwareInput.trim() && !data.softwareUsed?.includes(softwareInput.trim())) {
      const newSoftware = [...(data.softwareUsed || []), softwareInput.trim()];
      onChange({ softwareUsed: newSoftware });
      setSoftwareInput('');
    }
  };

  const removeSoftware = (item: string) => {
    const newSoftware = (data.softwareUsed || []).filter((s: string) => s !== item);
    onChange({ softwareUsed: newSoftware });
  };

  // Render based on category
  if (isAgency) {
    return (
      <SimpleAgencyEditor
        data={data}
        onChange={onChange}
        projectContext={projectContext}
      />
    );
  }


  // SCENIC DESIGN (default)
  return (
    <div className="space-y-8">
      <GalleryEditor
        label="Primary Gallery (Renderings & Design)"
        images={data.galleries?.hero || []}
        captions={data.galleries?.heroCaptions || []}
        altTexts={data.galleries?.heroAlt || []}
        projectContext={projectContext}
        onChange={(images, captions, altTexts) => {
          onChange({
            galleries: {
              ...(data.galleries || {}),
              hero: images,
              heroCaptions: captions,
              heroAlt: altTexts
            }
          });
        }}
        currentCover={currentCover}
        onSetCover={onSetCover}
      />

      <div className="h-px bg-border" />

      <GalleryEditor
        label="Secondary Gallery (Production Photos)"
        images={data.galleries?.process || []}
        captions={data.galleries?.processCaptions || []}
        altTexts={data.galleries?.processAlt || []}
        projectContext={projectContext}
        onChange={(images, captions, altTexts) => {
          onChange({
            galleries: {
              ...(data.galleries || {}),
              process: images,
              processCaptions: captions,
              processAlt: altTexts
            }
          });
        }}
        currentCover={currentCover}
        onSetCover={onSetCover}
      />

      <div className="h-px bg-border" />

      <YouTubeVideosEditor
        videos={(data[videoField] as string[]) || []}
        onChange={(videos) => onChange({ [videoField]: videos })}
      />
    </div>
  );
}

