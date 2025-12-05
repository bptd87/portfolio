import React, { useState, useRef, useEffect } from 'react';
import { Upload, Check, X, ZoomOut, ZoomIn } from 'lucide-react';
import { AppStudioLoader } from '../components/AppStudioLoader';
import { PixelRuler, PixelScale, PixelMagnifier } from '../components/icons/PixelIcons';

interface ScaleImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  scaleFactor: number;
  name: string;
  // Store real-world calibration data
  referencePixels?: number; // The pixel distance measured
  referenceInches?: number; // The real-world inches
}

const PAPER_SIZES = {
  'letter': { width: 8.5, height: 11, label: '8.5" × 11" (Letter)' },
  'tabloid': { width: 11, height: 17, label: '11" × 17" (Tabloid)' },
};

const SCALES = [
  { value: 1/4, label: '1/4" = 1\'-0"', ratio: 48 },
  { value: 1/2, label: '1/2" = 1\'-0"', ratio: 24 },
  { value: 3/8, label: '3/8" = 1\'-0"', ratio: 32 },
  { value: 1, label: '1" = 1\'-0"', ratio: 12 },
  { value: 1.5, label: '1-1/2" = 1\'-0"', ratio: 8 },
  { value: 3, label: '3" = 1\'-0"', ratio: 4 },
];

export function ModelReferenceScaler() {
  const [isLoading, setIsLoading] = useState(true);
  const [paperSize, setPaperSize] = useState<'letter' | 'tabloid'>('tabloid');
  const [selectedScale, setSelectedScale] = useState(SCALES[0]);
  const [images, setImages] = useState<ScaleImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettingScale, setIsSettingScale] = useState(false);
  const [scaleLineStart, setScaleLineStart] = useState<{x: number, y: number} | null>(null);
  const [scaleLineEnd, setScaleLineEnd] = useState<{x: number, y: number} | null>(null);
  const [realWorldDimension, setRealWorldDimension] = useState('');
  const [showDimensionInput, setShowDimensionInput] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measureLineStart, setMeasureLineStart] = useState<{x: number, y: number} | null>(null);
  const [measureLineEnd, setMeasureLineEnd] = useState<{x: number, y: number} | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{x: number, y: number} | null>(null);
  const [cropEnd, setCropEnd] = useState<{x: number, y: number} | null>(null);
  const [showCropConfirm, setShowCropConfirm] = useState(false);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<{x: number, y: number}[]>([]);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.75);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const paper = PAPER_SIZES[paperSize];
  const pixelsPerInch = 96; // Standard screen DPI
  const canvasWidth = paper.width * pixelsPerInch;
  const canvasHeight = paper.height * pixelsPerInch;

  // Recalculate all image sizes when scale changes
  useEffect(() => {
    setImages(prev => prev.map(img => {
      // Only recalculate if this image has been scaled (has reference data)
      if (img.referencePixels && img.referenceInches) {
        // Calculate new target size based on new scale
        const scaleInches = img.referenceInches * selectedScale.value / 12;
        const targetPixels = scaleInches * 96; // Use constant 96 DPI
        const newScaleFactor = targetPixels / img.referencePixels;
        
        // Calculate new dimensions based on original size
        const aspectRatio = img.originalHeight / img.originalWidth;
        const baseWidth = 200; // Initial display size
        const baseHeight = baseWidth * aspectRatio;
        
        return {
          ...img,
          width: baseWidth * newScaleFactor,
          height: baseHeight * newScaleFactor,
          scaleFactor: newScaleFactor,
        };
      }
      return img;
    }));
  }, [selectedScale.value]); // Only depend on the scale value

  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const newImage: ScaleImage = {
            id: Math.random().toString(36),
            src: e.target?.result as string,
            x: 50,
            y: 50,
            width: 200,
            height: (200 / img.width) * img.height,
            originalWidth: img.width,
            originalHeight: img.height,
            scaleFactor: 1,
            name: file.name,
          };
          setImages(prev => [...prev, newImage]);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Delete image
  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedImageId === id) setSelectedImageId(null);
  };

  // Function to convert pixels to real-world dimensions in feet and inches
  const pixelsToRealWorld = (pixels: number) => {
    if (!selectedScale) return { feet: 0, inches: 0, display: "0'-0\"" };
    
    // Calculate real-world inches
    const realWorldInches = pixels / (selectedScale.value * pixelsPerInch / 12);
    const feet = Math.floor(realWorldInches / 12);
    const inches = Math.round(realWorldInches % 12);
    
    return {
      feet,
      inches,
      display: `${feet}'-${inches}"`
    };
  };

  // Parse user input for dimensions (accepts "12'6" or "150")
  const parseDimensionInput = (input: string): number | null => {
    const trimmed = input.trim();
    
    // Match patterns like "12'6" or "12'-6"" or "12' 6"
    const feetInchesMatch = trimmed.match(/^(\d+)['']?\s*[-]?\s*(\d+)[""]?$/);
    if (feetInchesMatch) {
      const feet = parseInt(feetInchesMatch[1]);
      const inches = parseInt(feetInchesMatch[2]);
      return feet * 12 + inches;
    }
    
    // Match patterns like "12'" (just feet)
    const feetOnlyMatch = trimmed.match(/^(\d+)['']$/);
    if (feetOnlyMatch) {
      return parseInt(feetOnlyMatch[1]) * 12;
    }
    
    // Just a number (assume inches)
    const number = parseFloat(trimmed);
    if (!isNaN(number)) {
      return number;
    }
    
    return null;
  };

  // Start scale setting mode
  const startScaleSetting = () => {
    if (!selectedImageId) {
      alert('Please select an image first');
      return;
    }
    setIsSettingScale(true);
    setScaleLineStart(null);
    setScaleLineEnd(null);
  };

  // Handle canvas click for scale setting
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    // Handle scale setting mode
    if (isSettingScale) {
      if (!scaleLineStart) {
        setScaleLineStart({ x, y });
      } else {
        setScaleLineEnd({ x, y });
        setShowDimensionInput(true);
      }
      return;
    }

    // Handle measure mode
    if (isMeasuring) {
      if (!measureLineStart) {
        setMeasureLineStart({ x, y });
      } else {
        setMeasureLineEnd({ x, y });
      }
      return;
    }

    // Handle crop mode
    if (isCropping && selectedImageId) {
      const img = images.find(i => i.id === selectedImageId);
      if (!img) return;

      // Convert click to image-relative coordinates
      const imgX = x - img.x;
      const imgY = y - img.y;

      // Check if click is within image bounds
      if (imgX >= 0 && imgX <= img.width && imgY >= 0 && imgY <= img.height) {
        if (!cropStart) {
          setCropStart({ x: imgX, y: imgY });
        } else if (!cropEnd) {
          setCropEnd({ x: imgX, y: imgY });
          // Show confirmation dialog instead of auto-applying
          setShowCropConfirm(true);
        }
      }
      return;
    }

    // Handle polygon correction mode
    if (isDrawingPolygon && selectedImageId) {
      const img = images.find(i => i.id === selectedImageId);
      if (!img) return;

      // Convert click to image-relative coordinates
      const imgX = x - img.x;
      const imgY = y - img.y;

      // Check if click is within image bounds
      if (imgX >= 0 && imgX <= img.width && imgY >= 0 && imgY <= img.height) {
        const newPoints = [...polygonPoints, { x: imgX, y: imgY }];
        setPolygonPoints(newPoints);

        // If we have 4 points, apply perspective correction
        if (newPoints.length === 4) {
          applyPerspectiveCorrection(img, newPoints);
        }
      }
      return;
    }
  };

  // Handle image mouse down for dragging
  const handleImageMouseDown = (e: React.MouseEvent, imgId: string) => {
    if (isSettingScale || isMeasuring) return;
    
    e.stopPropagation();
    setSelectedImageId(imgId);
    setIsDraggingImage(true);
    setDraggedImageId(imgId);

    const img = images.find(i => i.id === imgId);
    if (!img || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setDragOffset({
      x: x - img.x,
      y: y - img.y,
    });
  };

  // Handle mouse move for dragging images
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingImage || !draggedImageId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setImages(prev => prev.map(img => {
      if (img.id === draggedImageId) {
        return {
          ...img,
          x: x - dragOffset.x,
          y: y - dragOffset.y,
        };
      }
      return img;
    }));
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDraggingImage(false);
    setDraggedImageId(null);
  };

  // Apply scale based on user input
  const applyScale = () => {
    if (!scaleLineStart || !scaleLineEnd || !realWorldDimension || !selectedImageId) return;

    const pixelDistance = Math.sqrt(
      Math.pow(scaleLineEnd.x - scaleLineStart.x, 2) + 
      Math.pow(scaleLineEnd.y - scaleLineStart.y, 2)
    );

    const realInches = parseDimensionInput(realWorldDimension);
    if (realInches === null || realInches <= 0) {
      alert('Please enter a valid dimension in inches');
      return;
    }

    // Calculate how many inches this should be on paper at the selected scale
    const scaleInches = realInches * selectedScale.value / 12; // e.g., 80" * (1/4) / 12 = 1.67"
    
    // Convert paper inches to screen pixels (96 DPI)
    const targetPixels = scaleInches * 96; // e.g., 1.67 * 96 = 160px
    
    // Calculate scale factor to apply
    const scaleFactor = targetPixels / pixelDistance; // e.g., 160 / 145 = 1.10x

    setImages(prev => prev.map(img => {
      if (img.id === selectedImageId) {
        return {
          ...img,
          width: img.width * scaleFactor,
          height: img.height * scaleFactor,
          scaleFactor: img.scaleFactor * scaleFactor,
          referencePixels: pixelDistance,
          referenceInches: realInches,
        };
      }
      return img;
    }));

    // Reset
    setIsSettingScale(false);
    setScaleLineStart(null);
    setScaleLineEnd(null);
    setRealWorldDimension('');
    setShowDimensionInput(false);
  };

  // Cancel scale setting
  const cancelScaleSetting = () => {
    setIsSettingScale(false);
    setScaleLineStart(null);
    setScaleLineEnd(null);
    setRealWorldDimension('');
    setShowDimensionInput(false);
  };

  // Apply crop to image
  const applyCrop = (img: ScaleImage, start: {x: number, y: number}, end: {x: number, y: number}) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate crop rectangle (normalized to 0-1 range based on displayed image size)
    const cropX = Math.min(start.x, end.x);
    const cropY = Math.min(start.y, end.y);
    const cropWidth = Math.abs(end.x - start.x);
    const cropHeight = Math.abs(end.y - start.y);

    if (cropWidth < 10 || cropHeight < 10) {
      alert('Crop area too small');
      setIsCropping(false);
      setCropStart(null);
      setCropEnd(null);
      return;
    }

    // Convert from display size to original image size
    const scaleX = img.originalWidth / img.width;
    const scaleY = img.originalHeight / img.height;

    const srcX = cropX * scaleX;
    const srcY = cropY * scaleY;
    const srcWidth = cropWidth * scaleX;
    const srcHeight = cropHeight * scaleY;

    canvas.width = srcWidth;
    canvas.height = srcHeight;

    // Load and crop the image
    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, srcX, srcY, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight);
      const croppedSrc = canvas.toDataURL();

      // Update image with cropped version
      setImages(prev => prev.map(i => {
        if (i.id === img.id) {
          const aspectRatio = srcHeight / srcWidth;
          return {
            ...i,
            src: croppedSrc,
            originalWidth: srcWidth,
            originalHeight: srcHeight,
            width: img.width * (cropWidth / img.width),
            height: img.width * (cropWidth / img.width) * aspectRatio,
          };
        }
        return i;
      }));

      // Reset crop mode
      setIsCropping(false);
      setCropStart(null);
      setCropEnd(null);
    };
    image.src = img.src;
  };

  // Apply perspective correction to image
  const applyPerspectiveCorrection = (img: ScaleImage, points: {x: number, y: number}[]) => {
    if (points.length !== 4) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Convert from display size to original image size
    const scaleX = img.originalWidth / img.width;
    const scaleY = img.originalHeight / img.height;

    const srcPoints = points.map(p => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));

    // Calculate bounding box of the quadrilateral
    const minX = Math.min(...srcPoints.map(p => p.x));
    const maxX = Math.max(...srcPoints.map(p => p.x));
    const minY = Math.min(...srcPoints.map(p => p.y));
    const maxY = Math.max(...srcPoints.map(p => p.y));
    
    const width = maxX - minX;
    const height = maxY - minY;

    canvas.width = width;
    canvas.height = height;

    // Load image and apply simple transform
    // Note: True perspective correction requires complex matrix math
    // This is a simplified version that works for mild distortions
    const image = new Image();
    image.onload = () => {
      // Draw the selected quadrilateral area
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(srcPoints[0].x - minX, srcPoints[0].y - minY);
      for (let i = 1; i < srcPoints.length; i++) {
        ctx.lineTo(srcPoints[i].x - minX, srcPoints[i].y - minY);
      }
      ctx.closePath();
      ctx.clip();
      
      ctx.drawImage(image, -minX, -minY);
      ctx.restore();
      
      const correctedSrc = canvas.toDataURL();

      // Update image with corrected version
      setImages(prev => prev.map(i => {
        if (i.id === img.id) {
          return {
            ...i,
            src: correctedSrc,
            originalWidth: width,
            originalHeight: height,
            width: img.width,
            height: img.width * (height / width),
          };
        }
        return i;
      }));

      // Reset polygon mode
      setIsDrawingPolygon(false);
      setPolygonPoints([]);
    };
    image.src = img.src;
  };

  // Export to PDF (using browser print)
  const exportToPDF = () => {
    window.print();
  };

  if (isLoading) {
    return <AppStudioLoader appName="MODEL REFERENCE SCALER" onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-12">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-8 md:p-12">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div className="inline-block mb-4">
                <div className="bg-foreground text-background px-3 py-1.5 rounded-full font-pixel text-[10px] tracking-[0.3em]">
                  MODEL MAKING
                </div>
              </div>
              <h1 className="font-serif italic text-5xl md:text-6xl mb-4">
                Model Reference Scaler
              </h1>
              <p className="text-foreground/70 text-lg leading-relaxed mb-6">
                Scale reference photos for architectural and scenic model making. Upload images, set scale, and export to PDF at precise dimensions.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-foreground/60">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
                  <span>Upload & Scale Images</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
                  <span>Measure Dimensions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
                  <span>Export to PDF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">

        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          
          {/* Paper Size */}
          <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6">
            <label className="block mb-3 font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase">
              Paper Size
            </label>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as 'letter' | 'tabloid')}
              className="w-full bg-background border border-neutral-500/20 rounded-2xl px-4 py-3 text-foreground focus:border-foreground outline-none transition-colors"
            >
              {Object.entries(PAPER_SIZES).map(([key, size]) => (
                <option key={key} value={key}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>

          {/* Scale Selection */}
          <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6">
            <label className="block mb-3 font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase">
              Drawing Scale
            </label>
            <select
              value={selectedScale.value}
              onChange={(e) => {
                const scale = SCALES.find(s => s.value === parseFloat(e.target.value));
                if (scale) setSelectedScale(scale);
              }}
              className="w-full bg-background border border-neutral-500/20 rounded-2xl px-4 py-3 text-foreground focus:border-foreground outline-none transition-colors"
            >
              {SCALES.map((scale) => (
                <option key={scale.value} value={scale.value}>
                  {scale.label}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Images */}
          <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6">
            <label className="block mb-3 font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase">
              Upload Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-neutral-500/20 bg-background hover:bg-foreground/5 rounded-2xl px-4 py-3 text-foreground transition-all flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              <span className="font-pixel text-[10px] tracking-wider">SELECT FILES</span>
            </button>
          </div>

        </div>

        {/* Main Canvas Area */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
          
          {/* Canvas */}
          <div className="border-2 border-accent-brand bg-black/95 p-6 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 350px)', minHeight: '600px', maxWidth: '100%' }}>
            <div className="mb-4 flex items-center justify-between flex-shrink-0">
              <div className="text-accent-brand text-sm tracking-wider">{'>'} WORKSPACE</div>
              <div className="flex items-center gap-4">
                {/* Zoom controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                    className="border border-accent-brand/30 bg-black hover:bg-accent-brand/10 p-1.5 text-accent-brand transition-all"
                    title="Zoom Out"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <div className="text-xs text-white/60 min-w-[60px] text-center">
                    {(zoom * 100).toFixed(0)}%
                  </div>
                  <button
                    onClick={() => setZoom(Math.min(4, zoom + 0.25))}
                    className="border border-accent-brand/30 bg-black hover:bg-accent-brand/10 p-1.5 text-accent-brand transition-all"
                    title="Zoom In"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    onClick={() => setZoom(1)}
                    className="border border-accent-brand/30 bg-black hover:bg-accent-brand/10 px-2 py-1.5 text-accent-brand text-xs transition-all"
                    title="Reset Zoom"
                  >
                    RESET
                  </button>
                </div>
                <div className="text-xs text-white/60">
                  {paper.width}" × {paper.height}" | {selectedScale.label}
                </div>
              </div>
            </div>

            {/* Canvas Wrapper with Overflow - FIXED HEIGHT */}
            <div className="flex-1 overflow-auto border-2 border-accent-brand/30 bg-black print:bg-white min-h-0">
              {/* Drop Zone / Canvas */}
              <div
                ref={canvasRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className={`relative bg-black/50 print:bg-white transition-all ${
                  isDragging ? 'border-2 border-accent-brand border-dashed' : ''
                } ${isSettingScale || isMeasuring ? 'cursor-crosshair' : 'cursor-default'}`}
                style={{
                  width: `${canvasWidth * zoom}px`,
                  height: `${canvasHeight * zoom}px`,
                }}
              >
                {/* Drop overlay */}
                {isDragging && (
                  <div className="absolute inset-0 bg-accent-brand/10 flex items-center justify-center z-50">
                    <div className="text-center">
                      <Upload size={48} className="mx-auto mb-2 text-accent-brand" />
                      <div className="text-accent-brand text-sm">DROP IMAGES HERE</div>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {images.length === 0 && !isDragging && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white/30">
                      <Upload size={48} className="mx-auto mb-2" />
                      <div className="text-sm">DRAG & DROP IMAGES</div>
                      <div className="text-xs mt-1">or click "SELECT FILES"</div>
                    </div>
                  </div>
                )}

                {/* Render images */}
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={`absolute cursor-move border-2 ${
                      selectedImageId === img.id ? 'border-accent-brand' : 'border-transparent'
                    }`}
                    style={{
                      left: `${img.x * zoom}px`,
                      top: `${img.y * zoom}px`,
                      width: `${img.width * zoom}px`,
                      height: `${img.height * zoom}px`,
                    }}
                    onMouseDown={(e) => handleImageMouseDown(e, img.id)}
                  >
                    <img
                      src={img.src}
                      alt={img.name}
                      className="w-full h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                    {selectedImageId === img.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteImage(img.id);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}

                {/* Scale line visualization */}
                {isSettingScale && scaleLineStart && (
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <line
                      x1={scaleLineStart.x * zoom}
                      y1={scaleLineStart.y * zoom}
                      x2={scaleLineEnd ? scaleLineEnd.x * zoom : scaleLineStart.x * zoom}
                      y2={scaleLineEnd ? scaleLineEnd.y * zoom : scaleLineStart.y * zoom}
                      stroke="rgb(var(--accent-brand-rgb))"
                      strokeWidth="2"
                    />
                    <circle
                      cx={scaleLineStart.x * zoom}
                      cy={scaleLineStart.y * zoom}
                      r="4"
                      fill="rgb(var(--accent-brand-rgb))"
                    />
                    {scaleLineEnd && (
                      <circle
                        cx={scaleLineEnd.x * zoom}
                        cy={scaleLineEnd.y * zoom}
                        r="4"
                        fill="rgb(var(--accent-brand-rgb))"
                      />
                    )}
                  </svg>
                )}

                {/* Measure line visualization */}
                {isMeasuring && measureLineStart && (
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <line
                      x1={measureLineStart.x * zoom}
                      y1={measureLineStart.y * zoom}
                      x2={measureLineEnd ? measureLineEnd.x * zoom : measureLineStart.x * zoom}
                      y2={measureLineEnd ? measureLineEnd.y * zoom : measureLineStart.y * zoom}
                      stroke="yellow"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    {measureLineEnd && (
                      <text
                        x={(measureLineStart.x + measureLineEnd.x) / 2 * zoom}
                        y={(measureLineStart.y + measureLineEnd.y) / 2 * zoom - 10}
                        fill="yellow"
                        fontSize="12"
                        textAnchor="middle"
                      >
                        {pixelsToRealWorld(
                          Math.sqrt(
                            Math.pow(measureLineEnd.x - measureLineStart.x, 2) +
                            Math.pow(measureLineEnd.y - measureLineStart.y, 2)
                          )
                        ).display}
                      </text>
                    )}
                  </svg>
                )}

                {/* Crop rectangle visualization */}
                {isCropping && selectedImageId && cropStart && (
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {cropEnd && (() => {
                      const img = images.find(i => i.id === selectedImageId);
                      if (!img) return null;
                      const x = Math.min(cropStart.x, cropEnd.x) + img.x;
                      const y = Math.min(cropStart.y, cropEnd.y) + img.y;
                      const w = Math.abs(cropEnd.x - cropStart.x);
                      const h = Math.abs(cropEnd.y - cropStart.y);
                      return (
                        <rect
                          x={x * zoom}
                          y={y * zoom}
                          width={w * zoom}
                          height={h * zoom}
                          stroke="cyan"
                          strokeWidth="2"
                          fill="cyan"
                          fillOpacity="0.1"
                          strokeDasharray="5,5"
                        />
                      );
                    })()}
                  </svg>
                )}

                {/* Polygon points visualization */}
                {isDrawingPolygon && selectedImageId && polygonPoints.length > 0 && (() => {
                  const img = images.find(i => i.id === selectedImageId);
                  if (!img) return null;
                  return (
                    <svg
                      className="absolute inset-0 pointer-events-none"
                      style={{ width: '100%', height: '100%' }}
                    >
                      {polygonPoints.map((point, index) => (
                        <circle
                          key={index}
                          cx={(point.x + img.x) * zoom}
                          cy={(point.y + img.y) * zoom}
                          r="5"
                          fill="magenta"
                        />
                      ))}
                      {polygonPoints.length > 1 && (
                        <polyline
                          points={polygonPoints.map(p => `${(p.x + img.x) * zoom},${(p.y + img.y) * zoom}`).join(' ')}
                          stroke="magenta"
                          strokeWidth="2"
                          fill="none"
                        />
                      )}
                    </svg>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Tools Panel */}
          <div className="space-y-4">
            <div className="border-2 border-accent-brand/50 bg-black/95 p-6">
              <div className="text-accent-brand text-sm tracking-wider mb-4">{'>'} TOOLS</div>
              
              <div className="space-y-3">
                <button
                  onClick={startScaleSetting}
                  disabled={!selectedImageId}
                  className={`w-full border-2 px-4 py-2 text-sm transition-all flex items-center justify-center gap-2 ${
                    selectedImageId
                      ? 'border-accent-brand/30 text-accent-brand hover:bg-accent-brand/10'
                      : 'border-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <PixelScale size={16} />
                  SET SCALE
                </button>

                <button
                  onClick={() => {
                    setIsMeasuring(!isMeasuring);
                    setMeasureLineStart(null);
                    setMeasureLineEnd(null);
                  }}
                  disabled={!selectedImageId}
                  className={`w-full border-2 px-4 py-2 text-sm transition-all flex items-center justify-center gap-2 ${
                    isMeasuring
                      ? 'border-accent-brand bg-accent-brand/20 text-accent-brand'
                      : selectedImageId
                      ? 'border-accent-brand/30 text-accent-brand hover:bg-accent-brand/10'
                      : 'border-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <PixelRuler size={16} />
                  {isMeasuring ? 'MEASURING...' : 'MEASURE'}
                </button>

                <button
                  onClick={() => {
                    setIsCropping(!isCropping);
                    setCropStart(null);
                    setCropEnd(null);
                  }}
                  disabled={!selectedImageId}
                  className={`w-full border-2 px-4 py-2 text-sm transition-all flex items-center justify-center gap-2 ${
                    isCropping
                      ? 'border-accent-brand bg-accent-brand/20 text-accent-brand'
                      : selectedImageId
                      ? 'border-accent-brand/30 text-accent-brand hover:bg-accent-brand/10'
                      : 'border-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  {isCropping ? 'CROPPING...' : 'CROP IMAGE'}
                </button>

                <button
                  onClick={() => {
                    setIsDrawingPolygon(!isDrawingPolygon);
                    setPolygonPoints([]);
                  }}
                  disabled={!selectedImageId}
                  className={`w-full border-2 px-4 py-2 text-sm transition-all flex items-center justify-center gap-2 ${
                    isDrawingPolygon
                      ? 'border-accent-brand bg-accent-brand/20 text-accent-brand'
                      : selectedImageId
                      ? 'border-accent-brand/30 text-accent-brand hover:bg-accent-brand/10'
                      : 'border-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  {isDrawingPolygon ? `CLICK 4 CORNERS (${polygonPoints.length}/4)` : 'PERSPECTIVE FIX'}
                </button>

                <button
                  onClick={exportToPDF}
                  className="w-full border-2 border-accent-brand/30 bg-black hover:bg-accent-brand/10 px-4 py-2 text-accent-brand text-sm transition-all"
                >
                  PRINT / EXPORT
                </button>
              </div>
            </div>

            {/* Selected Image Info */}
            {selectedImageId && (() => {
              const img = images.find(i => i.id === selectedImageId);
              if (!img) return null;
              return (
                <div className="border-2 border-accent-brand/50 bg-black/95 p-6">
                  <div className="text-accent-brand text-sm tracking-wider mb-4">{'>'} IMAGE INFO</div>
                  <div className="space-y-2 text-xs text-white/70">
                    <div>Name: {img.name}</div>
                    <div>Scale: {(img.scaleFactor * 100).toFixed(0)}%</div>
                    {img.referenceInches && (
                      <div className="text-accent-brand">
                        ✓ Calibrated to {selectedScale.label}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Instructions */}
            <div className="border-2 border-accent-brand/50 bg-black/95 p-6">
              <div className="text-accent-brand text-sm tracking-wider mb-4">{'>'} INSTRUCTIONS</div>
              <div className="space-y-2 text-xs text-white/60">
                <div>1. Upload reference images</div>
                <div>2. Select an image</div>
                <div>3. Click "SET SCALE"</div>
                <div>4. Click two points on a known dimension</div>
                <div>5. Enter the real-world size</div>
                <div>6. Use "MEASURE" to verify dimensions</div>
                <div>7. Print to export at scale</div>
              </div>
            </div>
          </div>

        </div>

        {/* Dimension Input Modal */}
        {showDimensionInput && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="border-2 border-accent-brand bg-black p-8 max-w-md w-full mx-4">
              <div className="text-accent-brand text-sm tracking-wider mb-4">ENTER REAL-WORLD DIMENSION</div>
              <input
                type="text"
                value={realWorldDimension}
                onChange={(e) => setRealWorldDimension(e.target.value)}
                placeholder="e.g., 8' or 96 (inches)"
                className="w-full bg-black border-2 border-accent-brand/30 px-4 py-2 text-white text-sm mb-4 focus:border-accent-brand outline-none"
                autoFocus
              />
              <div className="text-xs text-white/60 mb-4">
                Enter as feet (8'), feet-inches (8'6"), or just inches (102)
              </div>
              <div className="flex gap-3">
                <button
                  onClick={applyScale}
                  className="flex-1 border-2 border-accent-brand bg-black hover:bg-accent-brand/10 px-4 py-2 text-accent-brand text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  APPLY
                </button>
                <button
                  onClick={cancelScaleSetting}
                  className="flex-1 border-2 border-accent-brand/30 bg-black hover:bg-accent-brand/10 px-4 py-2 text-white/70 text-sm transition-all flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Crop Confirmation Modal */}
        {showCropConfirm && cropStart && cropEnd && selectedImageId && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="border-2 border-accent-brand bg-black p-8 max-w-md w-full mx-4">
              <div className="text-accent-brand text-sm tracking-wider mb-4">CONFIRM CROP</div>
              <div className="text-white/70 text-sm mb-6">
                This will permanently crop the image. Continue?
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const img = images.find(i => i.id === selectedImageId);
                    if (img && cropStart && cropEnd) {
                      applyCrop(img, cropStart, cropEnd);
                    }
                    setShowCropConfirm(false);
                  }}
                  className="flex-1 border-2 border-accent-brand bg-black hover:bg-accent-brand/10 px-4 py-2 text-accent-brand text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  CROP
                </button>
                <button
                  onClick={() => {
                    setShowCropConfirm(false);
                    setCropStart(null);
                    setCropEnd(null);
                  }}
                  className="flex-1 border-2 border-accent-brand/30 bg-black hover:bg-accent-brand/10 px-4 py-2 text-white/70 text-sm transition-all flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ModelReferenceScaler;
