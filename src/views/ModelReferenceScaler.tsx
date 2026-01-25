import React, { useState, useRef, useEffect } from 'react';
import { Upload, Check, X, ZoomOut, ZoomIn, Hand, MousePointer2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { RelatedTools } from '../components/studio/RelatedTools';
import { AppStudioLoader } from '../components/AppStudioLoader';
import { PixelRuler, PixelScale } from '../components/icons/PixelIcons';

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
  originalSrc?: string; // Backup of original image for reset
}

const PAPER_SIZES = {
  'letter': { width: 8.5, height: 11, label: '8.5" × 11" (Letter)' },
  'tabloid': { width: 11, height: 17, label: '11" × 17" (Tabloid)' },
};

const SCALES = [
  { value: 1 / 4, label: '1/4" = 1\'-0"', ratio: 48 },
  { value: 1 / 2, label: '1/2" = 1\'-0"', ratio: 24 },
  { value: 3 / 8, label: '3/8" = 1\'-0"', ratio: 32 },
  { value: 1, label: '1" = 1\'-0"', ratio: 12 },
  { value: 1.5, label: '1-1/2" = 1\'-0"', ratio: 8 },
  { value: 3, label: '3" = 1\'-0"', ratio: 4 },
];


// --- HOMOGRAPHY / PERSPECTIVE MATH HELPERS ---

// Solve linear system Ax = B using Gaussian elimination
function solve(A: number[][], B: number[]): number[] {
  const n = A.length;
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxEl = Math.abs(A[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxEl) {
        maxEl = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    // Swap maximum row with current row
    for (let k = i; k < n; k++) {
      const tmp = A[maxRow][k];
      A[maxRow][k] = A[i][k];
      A[i][k] = tmp;
    }
    const tmp = B[maxRow];
    B[maxRow] = B[i];
    B[i] = tmp;

    // Make all rows below this one 0 in current column
    for (let k = i + 1; k < n; k++) {
      const c = -A[k][i] / A[i][i];
      for (let j = i; j < n; j++) {
        if (i === j) {
          A[k][j] = 0;
        } else {
          A[k][j] += c * A[i][j];
        }
      }
      B[k] += c * B[i];
    }
  }

  // Solve equation Ax=B for an upper triangular matrix A
  const x = new Array(n).fill(0);
  for (let i = n - 1; i > -1; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += A[i][j] * x[j];
    }
    x[i] = (B[i] - sum) / A[i][i];
  }
  return x;
}

// Compute 3x3 Homography Matrix mapping srcPoints to dstPoints
// Points format: [{x,y}, {x,y}, {x,y}, {x,y}]
function getHomographyMatrix(src: { x: number, y: number }[], dst: { x: number, y: number }[]) {
  const A: number[][] = [];
  const B: number[] = [];

  for (let i = 0; i < 4; i++) {
    const sx = src[i].x;
    const sy = src[i].y;
    const dx = dst[i].x;
    const dy = dst[i].y;

    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    B.push(dx);
    B.push(dy);
  }

  const h = solve(A, B);
  h.push(1); // h33 is 1
  return h;
}

// Transform point using homography matrix
function transformPoint(x: number, y: number, H: number[]) {
  const newX = (H[0] * x + H[1] * y + H[2]) / (H[6] * x + H[7] * y + H[8]);
  const newY = (H[3] * x + H[4] * y + H[5]) / (H[6] * x + H[7] * y + H[8]);
  return { x: newX, y: newY };
}

export function ModelReferenceScaler() {
  const [isLoading, setIsLoading] = useState(true);
  const [paperSize, setPaperSize] = useState<'letter' | 'tabloid'>('tabloid');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [selectedScale, setSelectedScale] = useState(SCALES[0]);
  const [images, setImages] = useState<ScaleImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettingScale, setIsSettingScale] = useState(false);
  const [scaleLineStart, setScaleLineStart] = useState<{ x: number, y: number } | null>(null);
  const [scaleLineEnd, setScaleLineEnd] = useState<{ x: number, y: number } | null>(null);
  const [realWorldDimension, setRealWorldDimension] = useState('');
  const [showDimensionInput, setShowDimensionInput] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measureLineStart, setMeasureLineStart] = useState<{ x: number, y: number } | null>(null);
  const [measureLineEnd, setMeasureLineEnd] = useState<{ x: number, y: number } | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number, y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number, y: number } | null>(null);
  const [showCropConfirm, setShowCropConfirm] = useState(false);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<{ x: number, y: number }[]>([]);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.75);
  const [pan, setPan] = useState({ x: 0, y: 0 }); // Pro nav: visual pan offset
  const [toolMode, setToolMode] = useState<'select' | 'pan'>('select'); // New tool mode

  // Loupe State
  const [loupe, setLoupe] = useState<{ x: number, y: number, src: string, imgX: number, imgY: number, width: number, height: number } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPanningRef = useRef(false); // Track if we are currently panning

  // Constants
  const STORAGE_KEY = 'model_scaler_v1';
  const paper = PAPER_SIZES[paperSize];
  const pixelsPerInch = 96; // Standard screen DPI

  // Calculate effective dimensions based on orientation
  const effectiveWidth = orientation === 'landscape' ? Math.max(paper.width, paper.height) : Math.min(paper.width, paper.height);
  const effectiveHeight = orientation === 'landscape' ? Math.min(paper.width, paper.height) : Math.max(paper.width, paper.height);

  const canvasWidth = effectiveWidth * pixelsPerInch;
  const canvasHeight = effectiveHeight * pixelsPerInch;

  // Load state from persistence with SANITIZATION
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        // Sanitize images
        if (parsed.images && Array.isArray(parsed.images)) {
          const validatedImages = parsed.images.filter((img: any) => {
            // Check for valid numbers
            return (
              !isNaN(img.x) && isFinite(img.x) &&
              !isNaN(img.y) && isFinite(img.y) &&
              !isNaN(img.width) && isFinite(img.width) && img.width > 0 &&
              !isNaN(img.height) && isFinite(img.height) && img.height > 0 &&
              !isNaN(img.scaleFactor) && isFinite(img.scaleFactor) &&
              img.src // Must have a source
            );
          });
          setImages(validatedImages);
        }

        if (parsed.paperSize && PAPER_SIZES[parsed.paperSize as keyof typeof PAPER_SIZES]) {
          setPaperSize(parsed.paperSize as 'letter' | 'tabloid');
        }

        if (parsed.orientation) {
          setOrientation(parsed.orientation as 'portrait' | 'landscape');
        }

        if (parsed.selectedScaleValue) {
          const s = SCALES.find(sc => sc.value === parsed.selectedScaleValue);
          if (s) setSelectedScale(s);
        }
      } catch (e) {
        console.error('Failed to load scaler state', e);
        // If state is corrupt, clear it to prevent persistent crash
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Save state to persistence
  useEffect(() => {
    if (isLoading) return;
    const state = {
      images,
      paperSize,
      orientation,
      selectedScaleValue: selectedScale.value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [images, paperSize, orientation, selectedScale, isLoading]);

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
            originalSrc: e.target?.result as string, // Store original
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

    // If panning, don't trigger click events
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }

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

    if (isSettingScale || isMeasuring) {
      // Find image under cursor for Loupe
      // Search in reverse order (topmost first)
      let foundImg = null;
      for (let i = images.length - 1; i >= 0; i--) {
        const img = images[i];
        if (x >= img.x && x <= img.x + img.width && y >= img.y && y <= img.y + img.height) {
          foundImg = img;
          break;
        }
      }

      if (foundImg) {
        setLoupe({
          x: e.clientX, // Screen pos
          y: e.clientY,
          src: foundImg.src,
          imgX: x - foundImg.x, // Relative pixels in displayed image
          imgY: y - foundImg.y,
          width: foundImg.width,
          height: foundImg.height
        });
      } else {
        setLoupe(null);
      }
      return;
    } else {
      setLoupe(null);
    }

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
    isPanningRef.current = false;
  };

  // Handle Wheel Events (Zoom & Pan)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // ZOOM
      // Calculate new zoom
      const delta = -e.deltaY * 0.001;
      const newZoom = Math.min(Math.max(0.1, zoom + delta), 5); // 10% to 500%

      // TODO: Zoom towards cursor position (complex math, sticking to center zoom for stability first)
      setZoom(newZoom);
    } else {
      // PAN
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  // Handle Canvas Mouse Down (Navigation vs Tool)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Middle click OR Spacebar held (simulated via tool mode) OR Pan Tool
    if (e.button === 1 || toolMode === 'pan') {
      e.preventDefault();
      isPanningRef.current = true;
      // Logic handled in MouseMove via isPanningRef check? 
      // Actually we need state to track start position for drag-pan, 
      // OR just use movementX/Y in mousemove
    } else {
      // Standard tool clicks usually handled in onClick, but drag starts here for selection
    }
  };

  // Enhanced Mouse Move for Panning
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Handle Navigation Pan
    if (isPanningRef.current) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
      return;
    }

    // Existing Image Drag Logic
    handleMouseMove(e);
  };

  // Apply scale based on user input
  const applyScale = () => {
    if (!scaleLineStart || !scaleLineEnd || !realWorldDimension || !selectedImageId) return;

    const pixelDistance = Math.sqrt(
      Math.pow(scaleLineEnd.x - scaleLineStart.x, 2) +
      Math.pow(scaleLineEnd.y - scaleLineStart.y, 2)
    );

    // Prevent division by zero / microscopic scaling
    if (pixelDistance < 5) {
      alert('Points are too close together. Please measure a larger distance.');
      return;
    }

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
  const applyCrop = (img: ScaleImage, start: { x: number, y: number }, end: { x: number, y: number }) => {
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

  // Apply true perspective correction using Homography
  const applyPerspectiveCorrection = (img: ScaleImage, points: { x: number, y: number }[]) => {
    if (points.length !== 4) return;

    // Convert from display size to original image size
    const scaleX = img.originalWidth / img.width;
    const scaleY = img.originalHeight / img.height;
    const srcPoints = points.map(p => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));

    // Calculate bounding box for destination size
    // We estimate the rectified size by averaging opposite side lengths
    const d1 = Math.hypot(srcPoints[1].x - srcPoints[0].x, srcPoints[1].y - srcPoints[0].y);
    const d2 = Math.hypot(srcPoints[2].x - srcPoints[3].x, srcPoints[2].y - srcPoints[3].y);
    const d3 = Math.hypot(srcPoints[3].x - srcPoints[0].x, srcPoints[3].y - srcPoints[0].y);
    const d4 = Math.hypot(srcPoints[2].x - srcPoints[1].x, srcPoints[2].y - srcPoints[1].y);

    const dstWidth = Math.max(d1, d2);
    const dstHeight = Math.max(d3, d4);

    // Destination points: Top-Left, Top-Right, Bottom-Right, Bottom-Left
    // Assuming user clicks in Z-order or consistent clockwise order. 
    // Ideally we'd sort points, but generic ordering:
    const dstPoints = [
      { x: 0, y: 0 },
      { x: dstWidth, y: 0 },
      { x: dstWidth, y: dstHeight },
      { x: 0, y: dstHeight }
    ];

    // Compute Homography (Inverse mapping: Dst -> Src is better for pixel filling, 
    // but here we have Src -> Dst computed. 
    // Actually, for inverse mapping we need H_inv. 
    // Let's comput H: Src -> Dst, then invert it? 
    // Or just compute H: Dst -> Src directly!)

    const H_inv = getHomographyMatrix(dstPoints, srcPoints);

    const canvas = document.createElement('canvas');
    canvas.width = dstWidth;
    canvas.height = dstHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    // Allow CORS if needed, though usually local file blobs
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      // Create Offscreen buffer for pixel manipulation
      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = img.originalWidth;
      srcCanvas.height = img.originalHeight;
      const srcCtx = srcCanvas.getContext('2d');
      if (!srcCtx) return;
      srcCtx.drawImage(image, 0, 0);
      const srcData = srcCtx.getImageData(0, 0, img.originalWidth, img.originalHeight).data;

      const dstImageData = ctx.createImageData(dstWidth, dstHeight);
      const dstData = dstImageData.data;

      // Backward Mappping: Iterate over destination pixels
      for (let y = 0; y < dstHeight; y++) {
        for (let x = 0; x < dstWidth; x++) {
          // Find corresponding source coordinate
          const srcPt = transformPoint(x, y, H_inv);
          const srcX = Math.round(srcPt.x);
          const srcY = Math.round(srcPt.y);

          // Check bounds
          if (srcX >= 0 && srcX < img.originalWidth && srcY >= 0 && srcY < img.originalHeight) {
            const dstIndex = (y * Math.ceil(dstWidth) + x) * 4;
            const srcIndex = (srcY * img.originalWidth + srcX) * 4;

            dstData[dstIndex] = srcData[srcIndex];     // R
            dstData[dstIndex + 1] = srcData[srcIndex + 1]; // G
            dstData[dstIndex + 2] = srcData[srcIndex + 2]; // B
            dstData[dstIndex + 3] = 255;                 // Alpha (Full opacity)
          }
        }
      }

      ctx.putImageData(dstImageData, 0, 0);
      const correctedSrc = canvas.toDataURL();

      setImages(prev => prev.map(i => {
        if (i.id === img.id) {
          return {
            ...i,
            src: correctedSrc,
            originalWidth: dstWidth,
            originalHeight: dstHeight,
            width: img.width, // Keep display size but update aspect
            height: img.width * (dstHeight / dstWidth),
          };
        }
        return i;
      }));

      setIsDrawingPolygon(false);
      setPolygonPoints([]);
    };
    image.src = img.src;
  };

  // Reset image to original state
  const resetImage = () => {
    if (!selectedImageId) return;

    setImages(prev => prev.map(img => {
      if (img.id === selectedImageId && img.originalSrc) {
        // Calculate dimensions based on reset src
        // We'll keep the current width/scale roughly but reset the aspect ratio
        const aspectRatio = img.originalHeight / img.originalWidth;

        return {
          ...img,
          src: img.originalSrc,
          // Reset dimensions to match original aspect ratio but keep current width
          height: img.width * aspectRatio,
          // Re-enable if we want full reset:
          // width: 200, 
          // height: 200 * aspectRatio,
          // scaleFactor: 1,
          referencePixels: undefined,
          referenceInches: undefined
        };
      }
      return img;
    }));
  };

  // Export to PDF using jsPDF (Async & Robust)
  const exportToPDF = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // UI Render breath

      // scaleFactor is strictly for the PDF coordinate system (inches)
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'in',
        format: paperSize
      });

      const pageWidth = orientation === 'landscape' ? Math.max(paper.width, paper.height) : Math.min(paper.width, paper.height);
      const pageHeight = orientation === 'landscape' ? Math.min(paper.width, paper.height) : Math.max(paper.width, paper.height);

      // 1. Fill background white
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // 2. Add images
      for (const img of images) {
        // Convert pixels to inches (96 DPI)
        const xInch = img.x / 96;
        const yInch = img.y / 96;
        const wInch = img.width / 96;
        const hInch = img.height / 96;

        // Ensure image data is valid
        if (img.src && img.src.startsWith('data:image')) {
          try {
            pdf.addImage(img.src, 'JPEG', xInch, yInch, wInch, hInch);
          } catch (innerError) {
            console.warn('Skipping invalid image during PDF generation', img.id);
          }
        }
      }

      // 3. Save
      pdf.save(`model-reference-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error("PDF Export Failed", e);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <AppStudioLoader appName="MODEL REFERENCE SCALER" onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 lg:px-12 print:p-0 print:m-0 print:overflow-hidden print:h-auto print:bg-white">
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: ${paperSize} ${orientation};
            margin: 0;
          }
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          /* Hide everything by default */
          body > * {
            display: none !important;
          }
          /* Show only our app root (but we need to target the specific content) */
          #root, #root > * {
            display: block !important;
            background: white !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide UI elements specifically */
          nav, header, footer, .no-print {
            display: none !important;
          }
          
          /* Canvas Container overrides for print */
          .print-container {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            display: block !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
            z-index: 9999 !important;
          }
          
          /* Force exact print size */
          .print-canvas {
            transform: none !important;
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            max-height: none !important;
            border: none !important;
            background: white !important;
            position: relative !important;
            left: auto !important;
            top: auto !important;
          }
        }
      `}</style>

      {/* Hero Section - Hide on print */}
      <div className="max-w-7xl mx-auto mb-8 no-print">
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

        {/* Controls - Hide on print */}
        <div className="grid md:grid-cols-3 gap-4 mb-6 no-print">

          {/* Paper Size */}
          <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6">
            <label className="block mb-3 font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase">
              Paper Size
            </label>
            <select
              aria-label="Paper Size"
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as 'letter' | 'tabloid')}
              className="w-full bg-background border border-neutral-500/20 rounded-2xl px-4 py-3 text-foreground focus:border-foreground outline-none transition-colors mb-3"
            >
              {Object.entries(PAPER_SIZES).map(([key, size]) => (
                <option key={key} value={key}>
                  {size.label}
                </option>
              ))}
            </select>

            <div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
              <button
                onClick={() => setOrientation('portrait')}
                className={`flex-1 py-1 text-xs rounded-lg transition-all ${orientation === 'portrait' ? 'bg-accent-brand text-black font-bold' : 'text-white/40 hover:text-white'}`}
              >
                PORTRAIT
              </button>
              <button
                onClick={() => setOrientation('landscape')}
                className={`flex-1 py-1 text-xs rounded-lg transition-all ${orientation === 'landscape' ? 'bg-accent-brand text-black font-bold' : 'text-white/40 hover:text-white'}`}
              >
                LANDSCAPE
              </button>
            </div>
          </div>

          {/* Scale Selection */}
          <div className="bg-neutral-500/10 backdrop-blur-md border border-neutral-500/20 rounded-3xl p-6">
            <label className="block mb-3 font-pixel text-[10px] tracking-[0.3em] text-foreground/60 uppercase">
              Drawing Scale
            </label>
            <select
              aria-label="Drawing Scale"
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
              aria-label="Upload Image"
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

          {/* Canvas Wrapper */}
          <div className="no-print border-2 border-neutral-800 bg-neutral-900/50 rounded-xl p-6 flex flex-col shadow-inner" style={{ height: 'calc(100vh - 350px)', minHeight: '600px' }}>
            <div className="mb-4 flex items-center justify-between flex-shrink-0">
              <div className="text-white/40 text-sm tracking-wider font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-brand"></div>
                WORKSPACE
              </div>
              <div className="flex items-center gap-4">
                {/* Tool Modes */}
                <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/5">
                  <button
                    onClick={() => setToolMode('select')}
                    className={`p-1.5 rounded-md transition-all ${toolMode === 'select' ? 'bg-accent-brand text-black shadow-sm' : 'text-white/40 hover:text-white'}`}
                    title="Select Tool"
                  >
                    <MousePointer2 size={16} />
                  </button>
                  <button
                    onClick={() => setToolMode('pan')}
                    className={`p-1.5 rounded-md transition-all ${toolMode === 'pan' ? 'bg-accent-brand text-black shadow-sm' : 'text-white/40 hover:text-white'}`}
                    title="Pan Tool (Space+Drag)"
                  >
                    <Hand size={16} />
                  </button>
                </div>

                {/* Zoom controls */}
                <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/5">
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
                  {effectiveWidth}" × {effectiveHeight}" | {selectedScale.label}
                </div>
              </div>
            </div>

            {/* Canvas Scroll Area - The "Desk" */}
            <div className="flex-1 overflow-auto bg-[#1a1a1a] rounded-lg shadow-inner relative flex items-center justify-center p-12">
              {/* Drop Zone / Canvas - The "Paper" */}
              <div
                ref={canvasRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleCanvasClick}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                className={`print-container print-canvas relative bg-white transition-shadow shadow-2xl ${isDragging ? 'ring-4 ring-accent-brand ring-offset-4 ring-offset-black' : ''
                  } ${isSettingScale || isMeasuring ? 'cursor-crosshair' : toolMode === 'pan' || isPanningRef.current ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                style={{
                  width: `${canvasWidth * zoom}px`,
                  height: `${canvasHeight * zoom}px`,
                  minWidth: `${canvasWidth * zoom}px`, // Prevent shrinking
                  minHeight: `${canvasHeight * zoom}px`,
                  transform: `translate(${pan.x}px, ${pan.y}px)`, // Apply PAN
                  transformOrigin: 'center center'
                }}
              >
                {/* RULERS */}
                <div className="absolute top-0 left-0 w-full h-6 bg-yellow-400/10 border-b border-yellow-400/30 flex pointer-events-none no-print overflow-hidden">
                  {/* Horizontal Ruler Markers (Simplified: Every inch) */}
                  {Array.from({ length: Math.ceil(effectiveWidth) }).map((_, i) => (
                    <div key={i} className="absolute bottom-0 h-2 border-l border-black/30 text-[8px] pl-0.5 text-black/50" style={{ left: `${i * 96 * zoom}px` }}>
                      {i}" ({(i * 12 / selectedScale.value).toFixed(0)}')
                    </div>
                  ))}
                </div>
                <div className="absolute top-0 left-0 h-full w-6 bg-yellow-400/10 border-r border-yellow-400/30 flex flex-col pointer-events-none no-print overflow-hidden">
                  {/* Vertical Ruler Markers */}
                  {Array.from({ length: Math.ceil(effectiveHeight) }).map((_, i) => (
                    <div key={i} className="absolute right-0 w-2 border-t border-black/30 text-[8px] pt-0.5 text-right pr-0.5 text-black/50" style={{ top: `${i * 96 * zoom}px` }}>
                      {i}
                    </div>
                  ))}
                </div>

                {/* Grid lines pattern for paper feeling */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)',
                    backgroundSize: `${96 * zoom}px ${96 * zoom}px`, // 1 inch grid
                    backgroundPosition: '0 0'
                  }}
                />
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
                    className={`absolute cursor-move border-2 ${selectedImageId === img.id ? 'border-accent-brand' : 'border-transparent'
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
                        title="Delete Image"
                        aria-label="Delete Image"
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
                  className={`w-full border-2 px-4 py-2 text-sm transition-all flex items-center justify-center gap-2 ${selectedImageId
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
                  className={`w-full border-2 px-4 py-2 text-sm transition-all flex items-center justify-center gap-2 ${isMeasuring
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
                  className={`w-full border-2 px-4 py-2 text-sm transition-all flex items-center justify-center gap-2 ${isCropping
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
                  className={`w-full border-2 px-4 py-2 text-sm transition-all flex items-center justify-center gap-2 ${isDrawingPolygon
                    ? 'border-accent-brand bg-accent-brand/20 text-accent-brand'
                    : selectedImageId
                      ? 'border-accent-brand/30 text-accent-brand hover:bg-accent-brand/10'
                      : 'border-white/10 text-white/30 cursor-not-allowed'
                    }`}
                >
                  {isDrawingPolygon ? `CLICK 4 CORNERS (${polygonPoints.length}/4)` : 'PERSPECTIVE FIX'}
                </button>

                <button
                  onClick={resetImage}
                  disabled={!selectedImageId || !images.find(i => i.id === selectedImageId)?.originalSrc}
                  className={`w-full border-2 px-4 py-2 text-sm transition-all flex items-center justify-center gap-2 ${selectedImageId && images.find(i => i.id === selectedImageId)?.originalSrc
                    ? 'border-accent-brand/30 text-accent-brand hover:bg-accent-brand/10'
                    : 'border-white/10 text-white/30 cursor-not-allowed'
                    }`}
                >
                  RESET IMAGE
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


        {/* Loupe Overlay */}
        {
          loupe && (
            <div
              className="fixed pointer-events-none rounded-full border-2 border-accent-brand overflow-hidden z-[100] bg-black shadow-2xl"
              style={{
                left: loupe.x + 20,
                top: loupe.y + 20,
                width: 140,
                height: 140,
              }}
            >
              <div className="relative w-full h-full">
                <img
                  src={loupe.src}
                  alt="zoom"
                  style={{
                    position: 'absolute',
                    left: -(loupe.imgX * 2) + 70, // 2x magnification, centered (70 = half size)
                    top: -(loupe.imgY * 2) + 70,
                    width: loupe.width * 2,
                    height: loupe.height * 2,
                    maxWidth: 'none',
                    maxHeight: 'none',
                    objectFit: 'fill'
                  }}
                />
                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-accent-brand/50"></div>
                  <div className="h-4 w-0.5 bg-accent-brand/50 absolute"></div>
                </div>
                <div className="absolute bottom-2 left-0 right-0 text-center text-[9px] font-pixel text-accent-brand bg-black/50">
                  2x ZOOM
                </div>
              </div>
            </div>
          )
        }
      </div>
      {/* Related Tools */}
      <RelatedTools currentToolId="model-reference-scaler" />
    </div>
  );
}

export default ModelReferenceScaler;
