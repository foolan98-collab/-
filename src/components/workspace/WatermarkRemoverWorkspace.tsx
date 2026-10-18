import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Paintbrush,
  Square,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Undo2,
  Redo2,
  Trash2,
  Sparkles,
  Download,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sliders,
  SplitSquareVertical,
  Columns,
  Eye,
  Loader2,
  FileImage,
  UploadCloud,
  ChevronDown,
} from 'lucide-react';
import { ToolItem } from '../../types/tools';
import { useApp } from '../../context/AppContext';
import { formatFileSize } from './FileUploadDropzone';
import {
  processCanvasInpainting,
  InpaintAlgorithm,
} from '../../utils/watermarkInpainter';

interface WatermarkRemoverWorkspaceProps {
  tool: ToolItem;
}

type SelectionTool = 'brush' | 'rectangle';
type ComparisonView = 'split' | 'side-by-side' | 'result-only';

interface ActionStep {
  maskData: Uint8Array;
}

export const WatermarkRemoverWorkspace: React.FC<WatermarkRemoverWorkspaceProps> = ({
  tool,
}) => {
  const { lang, t, settings, saveToolDraft, clearToolDraft } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';

  // File & Image state
  const [file, setFile] = useState<File | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Tools & Canvas Interaction
  const [activeTool, setActiveTool] = useState<SelectionTool>('brush');
  const [brushRadius, setBrushRadius] = useState<number>(24);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [maskArray, setMaskArray] = useState<Uint8Array | null>(null);
  const [hasMaskSelection, setHasMaskSelection] = useState<boolean>(false);

  // Undo / Redo history stack
  const [undoStack, setUndoStack] = useState<ActionStep[]>([]);
  const [redoStack, setRedoStack] = useState<ActionStep[]>([]);

  // Inpainting Algorithm Settings
  const [algorithm, setAlgorithm] = useState<InpaintAlgorithm>('diffusion');
  const [dilationRadius, setDilationRadius] = useState<number>(3);
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [jpegQuality, setJpegQuality] = useState<number>(90);

  // Processing & Results
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string>('');
  const [resultCanvas, setResultCanvas] = useState<HTMLCanvasElement | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultBlobUrl, setResultBlobUrl] = useState<string>('');
  const [comparisonMode, setComparisonMode] = useState<ComparisonView>('split');
  const [splitSliderPos, setSplitSliderPos] = useState<number>(50); // 0 to 100%

  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Canvas Refs
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pointer state for drawing
  const isDrawingRef = useRef<boolean>(false);
  const rectStartRef = useRef<{ x: number; y: number } | null>(null);

  // Clean up Object URLs
  useEffect(() => {
    return () => {
      if (resultBlobUrl) {
        URL.revokeObjectURL(resultBlobUrl);
      }
    };
  }, [resultBlobUrl]);

  // Handle image load
  const loadFile = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setProcessingError(isEn ? 'Please choose a valid image file (PNG, JPG, WebP).' : 'يرجى اختيار ملف صورة صالح (PNG, JPG, WebP).');
      return;
    }

    setProcessingError('');
    setResultCanvas(null);
    if (resultBlobUrl) {
      URL.revokeObjectURL(resultBlobUrl);
      setResultBlobUrl('');
    }
    setResultBlob(null);

    const objectUrl = URL.createObjectURL(selectedFile);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      setFile(selectedFile);
      setImageElement(img);
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setZoomLevel(1);

      // Initialize blank mask
      const emptyMask = new Uint8Array(img.naturalWidth * img.naturalHeight);
      setMaskArray(emptyMask);
      setHasMaskSelection(false);
      setUndoStack([]);
      setRedoStack([]);

      // Save draft
      saveToolDraft(tool.slug, {
        files: [selectedFile],
        optionValues: { algorithm: 'diffusion', dilationRadius: 3, outputFormat: 'image/png' },
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setProcessingError(isEn ? 'Failed to read image file.' : 'تعذر تحميل ملف الصورة، تأكد من سلامة الملف.');
    };
    img.src = objectUrl;
  }, [isEn, resultBlobUrl, saveToolDraft, tool.slug]);

  // Redraw main image canvas when imageElement changes
  useEffect(() => {
    if (!imageElement || !imageCanvasRef.current) return;
    const canvas = imageCanvasRef.current;
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(imageElement, 0, 0);
    }
  }, [imageElement]);

  // Redraw overlay mask canvas when maskArray or dimensions change
  const redrawOverlay = useCallback((mask: Uint8Array, width: number, height: number) => {
    if (!overlayCanvasRef.current) return;
    const canvas = overlayCanvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Create semi-transparent red/amber mask image
    const overlayImgData = ctx.createImageData(width, height);
    const data = overlayImgData.data;

    let count = 0;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 1) {
        count++;
        const pIdx = i * 4;
        data[pIdx] = 239;     // R (Tailwind Red 500)
        data[pIdx + 1] = 68;  // G
        data[pIdx + 2] = 68;  // B
        data[pIdx + 3] = 165; // A (semi-transparent glowing red highlight)
      }
    }

    ctx.putImageData(overlayImgData, 0, 0);
    setHasMaskSelection(count > 0);
  }, []);

  useEffect(() => {
    if (maskArray && naturalDimensions.width > 0) {
      redrawOverlay(maskArray, naturalDimensions.width, naturalDimensions.height);
    }
  }, [maskArray, naturalDimensions, redrawOverlay]);

  // Convert Pointer event clientX/clientY to natural image coordinates accurately
  const getNaturalCoords = useCallback((e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    if (!overlayCanvasRef.current || !naturalDimensions.width) return null;
    const rect = overlayCanvasRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const scaleX = naturalDimensions.width / rect.width;
    const scaleY = naturalDimensions.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    return {
      x: Math.max(0, Math.min(naturalDimensions.width - 1, x)),
      y: Math.max(0, Math.min(naturalDimensions.height - 1, y)),
    };
  }, [naturalDimensions]);

  // Push current mask to undo stack
  const pushUndo = useCallback((currentMask: Uint8Array) => {
    setUndoStack((prev) => [...prev.slice(-15), { maskData: new Uint8Array(currentMask) }]);
    setRedoStack([]); // Clear redo on new action
  }, []);

  // Brush paint point
  const paintCircle = useCallback((mask: Uint8Array, cx: number, cy: number, radius: number) => {
    const width = naturalDimensions.width;
    const height = naturalDimensions.height;
    const r2 = radius * radius;

    const x1 = Math.max(0, cx - radius);
    const x2 = Math.min(width - 1, cx + radius);
    const y1 = Math.max(0, cy - radius);
    const y2 = Math.min(height - 1, cy + radius);

    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) {
          mask[y * width + x] = 1;
        }
      }
    }
  }, [naturalDimensions]);

  // Line interpolation between two points for continuous brush strokes
  const paintLine = useCallback((
    mask: Uint8Array,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    radius: number
  ) => {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let curX = x0;
    let curY = y0;

    while (true) {
      paintCircle(mask, curX, curY, radius);
      if (curX === x1 && curY === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        curX += sx;
      }
      if (e2 < dx) {
        err += dx;
        curY += sy;
      }
    }
  }, [paintCircle]);

  // Fill rectangle on mask
  const paintRect = useCallback((
    mask: Uint8Array,
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ) => {
    const width = naturalDimensions.width;
    const height = naturalDimensions.height;

    const rx1 = Math.max(0, Math.min(x0, x1));
    const rx2 = Math.min(width - 1, Math.max(x0, x1));
    const ry1 = Math.max(0, Math.min(y0, y1));
    const ry2 = Math.min(height - 1, Math.max(y0, y1));

    for (let y = ry1; y <= ry2; y++) {
      for (let x = rx1; x <= rx2; x++) {
        mask[y * width + x] = 1;
      }
    }
  }, [naturalDimensions]);

  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!maskArray) return;
    const coords = getNaturalCoords(e);
    if (!coords) return;

    // Capture pointer
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = coords;

    pushUndo(maskArray);

    if (activeTool === 'brush') {
      const nextMask = new Uint8Array(maskArray);
      paintCircle(nextMask, coords.x, coords.y, brushRadius);
      setMaskArray(nextMask);
    } else if (activeTool === 'rectangle') {
      rectStartRef.current = coords;
    }
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !maskArray) return;
    const coords = getNaturalCoords(e);
    if (!coords) return;

    if (activeTool === 'brush' && lastPointRef.current) {
      const nextMask = new Uint8Array(maskArray);
      paintLine(
        nextMask,
        lastPointRef.current.x,
        lastPointRef.current.y,
        coords.x,
        coords.y,
        brushRadius
      );
      lastPointRef.current = coords;
      setMaskArray(nextMask);
    } else if (activeTool === 'rectangle' && rectStartRef.current && overlayCanvasRef.current) {
      // Draw temporary rectangle preview onto overlay
      const ctx = overlayCanvasRef.current.getContext('2d');
      if (ctx) {
        redrawOverlay(maskArray, naturalDimensions.width, naturalDimensions.height);
        const x = Math.min(rectStartRef.current.x, coords.x);
        const y = Math.min(rectStartRef.current.y, coords.y);
        const w = Math.abs(coords.x - rectStartRef.current.x);
        const h = Math.abs(coords.y - rectStartRef.current.y);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
      }
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;

    if (activeTool === 'rectangle' && rectStartRef.current && maskArray) {
      const coords = getNaturalCoords(e);
      if (coords) {
        const nextMask = new Uint8Array(maskArray);
        paintRect(
          nextMask,
          rectStartRef.current.x,
          rectStartRef.current.y,
          coords.x,
          coords.y
        );
        setMaskArray(nextMask);
      }
      rectStartRef.current = null;
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Undo
  const handleUndo = () => {
    if (undoStack.length === 0 || !maskArray) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, { maskData: new Uint8Array(maskArray) }]);
    setMaskArray(new Uint8Array(previous.maskData));
    setUndoStack((prev) => prev.slice(0, -1));
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0 || !maskArray) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, { maskData: new Uint8Array(maskArray) }]);
    setMaskArray(new Uint8Array(next.maskData));
    setRedoStack((prev) => prev.slice(0, -1));
  };

  // Clear Selection
  const handleClearSelection = () => {
    if (!maskArray || !hasMaskSelection) return;
    pushUndo(maskArray);
    const emptyMask = new Uint8Array(naturalDimensions.width * naturalDimensions.height);
    setMaskArray(emptyMask);
  };

  // Reset Everything & Choose Another Image
  const handleReset = () => {
    setFile(null);
    setImageElement(null);
    setResultCanvas(null);
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    setResultBlobUrl('');
    setResultBlob(null);
    setMaskArray(null);
    setHasMaskSelection(false);
    setUndoStack([]);
    setRedoStack([]);
    setProcessingError('');
    clearToolDraft(tool.slug);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Run Inpainting
  const handleExecuteRemoval = async () => {
    if (!imageElement || !imageCanvasRef.current || !maskArray) return;
    if (!hasMaskSelection) {
      setProcessingError(t.noMaskSelectedWarning);
      return;
    }

    setIsProcessing(true);
    setProcessingError('');

    try {
      // Yield to let React show loading spinner
      await new Promise((r) => setTimeout(r, 60));

      const { resultCanvas: resCanvas, blob, dataUrl } = await processCanvasInpainting(
        imageCanvasRef.current,
        maskArray,
        {
          algorithm,
          dilationRadius,
          featherRadius: 2,
          outputFormat,
          jpegQuality: jpegQuality / 100,
        }
      );

      // Verify the result is not blank or empty
      if (blob.size === 0) {
        throw new Error(isEn ? 'Processing yielded an invalid empty file.' : 'فشلت المعالجة: الصورة الناتجة فارغة.');
      }

      setResultCanvas(resCanvas);
      setResultBlob(blob);
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
      const newUrl = URL.createObjectURL(blob);
      setResultBlobUrl(newUrl);

      // Scroll smoothly to result comparison
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : isEn ? 'An error occurred during inpainting.' : 'حدث خطأ أثناء معالجة الصورة.';
      setProcessingError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in an input, don't trigger shortcuts
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Escape') {
        handleClearSelection();
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel((z) => Math.min(3, +(z + 0.25).toFixed(2)));
      } else if (e.key === '-') {
        setZoomLevel((z) => Math.max(0.5, +(z - 0.25).toFixed(2)));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, maskArray, hasMaskSelection]);

  // Export File Name
  const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'image';
  const downloadFileName = `${settings.defaultExportPrefix}${baseName}-clean.${outputFormat === 'image/jpeg' ? 'jpg' : 'png'}`;

  return (
    <div ref={containerRef} className="space-y-6 animate-fade-in-up">
      {/* 1. Legal & Responsible Use Banner (Clear & Professional) */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 flex items-start gap-3.5 ${
          isDark
            ? 'bg-blue-950/20 border-blue-800/40 text-blue-200'
            : 'bg-blue-50/80 border-blue-200 text-blue-900'
        }`}
      >
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm">
          <h3 className="font-extrabold">{t.responsibleUseTitle}</h3>
          <p className="leading-relaxed opacity-90">{t.responsibleUseNotice}</p>
        </div>
      </div>

      {/* 2. Drag & Drop File Upload Stage (if no image chosen) */}
      {!file && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) {
              loadFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-[#1769FF] bg-[#EAF3FF] dark:bg-[#1769FF]/15 scale-[1.008]'
              : isDark
              ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
              : 'border-[#DCE7F5] bg-white hover:border-[#1769FF]/50 hover:bg-[#F5F9FF] shadow-[0_8px_30px_rgba(23,105,255,0.04)]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                loadFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-16 h-16 rounded-2xl bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] dark:text-[#38A5FF] flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h2 className={`text-lg sm:text-xl font-extrabold mb-1.5 ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
            {t.dragDropFiles}
          </h2>
          <p className="text-xs sm:text-sm text-[#687A96] dark:text-slate-400 max-w-md mx-auto mb-4">
            {isEn
              ? 'Upload JPEG, PNG, or WebP image to select and remove watermarks or unwanted stamps.'
              : 'ارفع صورة JPG أو PNG أو WebP لتحديد وإزالة العلامات المائية أو الشعارات غير المرغوبة.'}
          </p>

          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors">
            <FileImage className="w-4 h-4" />
            <span>{t.chooseFiles}</span>
          </span>
        </div>
      )}

      {/* 3. Interactive Masking Workspace (when image is loaded) */}
      {file && (
        <div className="space-y-5">
          {/* Top Control Bar: Tool selection, brush size, zoom, undo/redo */}
          <div
            className={`rounded-2xl border p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5] shadow-xs'
            }`}
          >
            {/* Tool Modes (Brush vs Rectangle) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTool('brush')}
                aria-pressed={activeTool === 'brush'}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  activeTool === 'brush'
                    ? 'bg-[#1769FF] text-white shadow-xs'
                    : isDark
                    ? 'hover:bg-slate-800 text-slate-300'
                    : 'hover:bg-[#F5F9FF] text-[#687A96]'
                }`}
                title={t.brushTool}
              >
                <Paintbrush className="w-4 h-4" />
                <span className="hidden sm:inline">{t.brushTool}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('rectangle')}
                aria-pressed={activeTool === 'rectangle'}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  activeTool === 'rectangle'
                    ? 'bg-[#1769FF] text-white shadow-xs'
                    : isDark
                    ? 'hover:bg-slate-800 text-slate-300'
                    : 'hover:bg-[#F5F9FF] text-[#687A96]'
                }`}
                title={t.rectangleTool}
              >
                <Square className="w-4 h-4" />
                <span className="hidden sm:inline">{t.rectangleTool}</span>
              </button>

              {/* Brush Size Slider (shown when Brush is active) */}
              {activeTool === 'brush' && (
                <div className="flex items-center gap-2 px-2.5 py-1 text-xs text-[#687A96]">
                  <span className="hidden md:inline whitespace-nowrap">{t.brushSize}:</span>
                  <input
                    type="range"
                    min="6"
                    max="80"
                    step="2"
                    value={brushRadius}
                    onChange={(e) => setBrushRadius(Number(e.target.value))}
                    className="w-18 sm:w-28 accent-[#1769FF] cursor-pointer"
                    aria-label={t.brushSize}
                  />
                  <span className="font-mono text-[11px] tabular-nums font-bold w-6">{brushRadius}px</span>
                </div>
              )}
            </div>

            {/* Middle: Undo / Redo / Clear */}
            <div className="flex items-center gap-1 border-x border-[#DCE7F5] dark:border-slate-800 px-2 sm:px-3">
              <button
                type="button"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="p-2 rounded-xl border border-transparent hover:border-[#DCE7F5] dark:hover:border-slate-700 disabled:opacity-40 disabled:hover:border-transparent transition-colors cursor-pointer text-[#687A96] hover:text-[#172B4D] dark:hover:text-white"
                title={`${t.undoAction} (Ctrl+Z)`}
                aria-label={t.undoAction}
              >
                <Undo2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="p-2 rounded-xl border border-transparent hover:border-[#DCE7F5] dark:hover:border-slate-700 disabled:opacity-40 disabled:hover:border-transparent transition-colors cursor-pointer text-[#687A96] hover:text-[#172B4D] dark:hover:text-white"
                title={`${t.redoAction} (Ctrl+Y)`}
                aria-label={t.redoAction}
              >
                <Redo2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                disabled={!hasMaskSelection}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40 transition-colors cursor-pointer"
                title={`${t.clearSelection} (Esc)`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.clearSelection}</span>
              </button>
            </div>

            {/* Right: Zoom controls & Reset */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                className="p-2 rounded-xl border border-[#DCE7F5] dark:border-slate-800 hover:bg-[#F5F9FF] dark:hover:bg-slate-800 transition-colors cursor-pointer text-[#687A96]"
                title={t.zoomOut}
                aria-label={t.zoomOut}
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs font-bold text-[#687A96] px-1 tabular-nums">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                className="p-2 rounded-xl border border-[#DCE7F5] dark:border-slate-800 hover:bg-[#F5F9FF] dark:hover:bg-slate-800 transition-colors cursor-pointer text-[#687A96]"
                title={t.zoomIn}
                aria-label={t.zoomIn}
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-2 rounded-xl border border-[#DCE7F5] dark:border-slate-800 hover:bg-[#F5F9FF] dark:hover:bg-slate-800 transition-colors cursor-pointer text-[#687A96]"
                title={t.resetZoom}
                aria-label={t.resetZoom}
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#DCE7F5] dark:border-slate-700 hover:bg-[#F5F9FF] dark:hover:bg-slate-800 text-[#687A96] transition-colors cursor-pointer ml-1"
                title={t.chooseAnotherFile}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t.chooseAnotherFile}</span>
              </button>
            </div>
          </div>

          {/* Interactive Mask Canvas Stage */}
          <div
            className={`relative rounded-3xl border overflow-hidden p-4 sm:p-6 flex items-center justify-center min-h-[380px] max-h-[640px] overflow-auto select-none ${
              isDark
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-slate-100/90 border-[#DCE7F5]'
            }`}
            style={{
              backgroundImage: isDark
                ? 'radial-gradient(#334155 1px, transparent 1px)'
                : 'radial-gradient(#CBD5E1 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            {/* Canvases Container (Source + Overlay Mask) */}
            <div
              className="relative inline-block shadow-2xl rounded-lg overflow-hidden transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
              }}
            >
              {/* Underlying Base Image Canvas */}
              <canvas
                ref={imageCanvasRef}
                className="block max-w-full h-auto pointer-events-none"
              />

              {/* Overlay Interactive Drawing Canvas */}
              <canvas
                ref={overlayCanvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`absolute inset-0 w-full h-full touch-none ${
                  activeTool === 'brush' ? 'cursor-crosshair' : 'cursor-cell'
                }`}
              />
            </div>

            {/* Prompt overlay hint when nothing is selected */}
            {!hasMaskSelection && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none bg-black/75 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <Paintbrush className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.selectWatermarkFirstPrompt}</span>
              </div>
            )}
          </div>

          {/* Algorithm & Quality Tuning Bar */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
            }`}
          >
            {/* Algorithm Select */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-[#687A96] block">
                {isEn ? 'Inpainting Method:' : 'خوارزمية المعالجة:'}
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as InpaintAlgorithm)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                }`}
              >
                <option value="diffusion">
                  {isEn ? 'Harmonic Boundary Diffusion (Recommended)' : 'استعادة توافقية بالحدود (موصى به)'}
                </option>
                <option value="patch">
                  {isEn ? 'Surrounding Texture Synthesis' : 'استنساخ الأنسجة المحيطة (للنقوش)'}
                </option>
                <option value="smooth">
                  {isEn ? 'Smooth Surface Propagation' : 'تنعيم السطح (للألوان الموحدة)'}
                </option>
              </select>
            </div>

            {/* Mask Edge Dilation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-[#687A96]">
                  {isEn ? 'Mask Boundary Dilation:' : 'توسيع حواف التحديد:'}
                </label>
                <span className="font-mono text-xs font-bold tabular-nums text-[#1769FF]">{dilationRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={dilationRadius}
                onChange={(e) => setDilationRadius(Number(e.target.value))}
                className="w-full accent-[#1769FF] cursor-pointer"
              />
              <p className="text-[11px] text-[#687A96] opacity-80">
                {isEn ? 'Eradicates semi-transparent border halos.' : 'يضمن إزالة الحواف الباهتة المحيطة بالشعار.'}
              </p>
            </div>

            {/* Output Format */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-[#687A96] block">
                {isEn ? 'Export Format:' : 'صيغة الصورة الناتجة:'}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOutputFormat('image/png')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer text-center ${
                    outputFormat === 'image/png'
                      ? 'bg-[#1769FF] text-white border-[#1769FF]'
                      : isDark
                      ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                      : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#687A96]'
                  }`}
                >
                  PNG (Lossless)
                </button>
                <button
                  type="button"
                  onClick={() => setOutputFormat('image/jpeg')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer text-center ${
                    outputFormat === 'image/jpeg'
                      ? 'bg-[#1769FF] text-white border-[#1769FF]'
                      : isDark
                      ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                      : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#687A96]'
                  }`}
                >
                  JPEG
                </button>
              </div>
            </div>
          </div>

          {/* Error alert if processing failed */}
          {processingError && (
            <div
              role="alert"
              className="rounded-2xl border p-4 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{processingError}</span>
            </div>
          )}

          {/* Primary Action Button: "إزالة العلامة المائية" */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5] shadow-xs'
            }`}
          >
            <div className="text-xs text-[#687A96] space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#172B4D] dark:text-white font-en" dir="ltr">
                  {file.name}
                </span>
                <span>({formatFileSize(file.size)})</span>
              </div>
              <div>
                {isEn ? 'Natural resolution:' : 'الأبعاد الأصلية:'}{' '}
                <span className="font-mono font-bold text-[#1769FF] tabular-nums">
                  {naturalDimensions.width} × {naturalDimensions.height} px
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing || !hasMaskSelection}
              onClick={handleExecuteRemoval}
              className="inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm sm:text-base shadow-[0_8px_25px_rgba(23,105,255,0.25)] hover:shadow-[0_12px_28px_rgba(23,105,255,0.35)] transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isEn ? 'Reconstructing background...' : 'جارٍ معالجة واستعادة الخلفية...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{t.executeWatermarkRemoval}</span>
                </>
              )}
            </button>
          </div>

          {/* 4. Result Preview & Comparison Stage (when result is ready) */}
          {resultCanvas && resultBlobUrl && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 space-y-6 ${
                isDark ? 'bg-slate-900 border-emerald-800/50' : 'bg-white border-emerald-200 shadow-sm'
              }`}
            >
              {/* Header: Success & View Mode Toggles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE7F5] dark:border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-extrabold ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
                      {t.watermarkRemovedSuccess}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#687A96] dark:text-slate-400">
                      {isEn
                        ? `Processed at ${naturalDimensions.width}×${naturalDimensions.height} px (${formatFileSize(resultBlob?.size || 0)})`
                        : `تمت المعالجة بدقة ${naturalDimensions.width}×${naturalDimensions.height} بكسل (${formatFileSize(resultBlob?.size || 0)})`}
                    </p>
                  </div>
                </div>

                {/* View Mode Selector: Split Slider, Side-by-side, Result only */}
                <div className="flex items-center gap-1.5 bg-[#F5F9FF] dark:bg-slate-800 p-1.5 rounded-2xl border border-[#DCE7F5] dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setComparisonMode('split')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      comparisonMode === 'split'
                        ? 'bg-white dark:bg-slate-900 text-[#1769FF] dark:text-[#38A5FF] shadow-xs'
                        : 'text-[#687A96]'
                    }`}
                  >
                    <SplitSquareVertical className="w-3.5 h-3.5" />
                    <span>{t.splitSliderView}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComparisonMode('side-by-side')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      comparisonMode === 'side-by-side'
                        ? 'bg-white dark:bg-slate-900 text-[#1769FF] dark:text-[#38A5FF] shadow-xs'
                        : 'text-[#687A96]'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>{t.sideBySideView}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComparisonMode('result-only')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      comparisonMode === 'result-only'
                        ? 'bg-white dark:bg-slate-900 text-[#1769FF] dark:text-[#38A5FF] shadow-xs'
                        : 'text-[#687A96]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t.resultOnlyView}</span>
                  </button>
                </div>
              </div>

              {/* View 1: Split Slider Comparison (Interactive swipe) */}
              {comparisonMode === 'split' && (
                <div className="space-y-2">
                  <div className="relative rounded-2xl overflow-hidden max-w-3xl mx-auto border border-[#DCE7F5] dark:border-slate-800 select-none shadow-md">
                    {/* Underlying Result Image */}
                    <img
                      src={resultBlobUrl}
                      alt={t.cleanedImageLabel}
                      className="block w-full h-auto"
                    />

                    {/* Overlaid Original Image clipped by split percentage */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - splitSliderPos}% 0 0)` }}
                    >
                      {imageElement && (
                        <img
                          src={imageElement.src}
                          alt={t.originalImageLabel}
                          className="block w-full h-auto"
                        />
                      )}
                    </div>

                    {/* Draggable Divider Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center -translate-x-1/2"
                      style={{ left: `${splitSliderPos}%` }}
                    >
                      <div className="w-7 h-7 rounded-full bg-white text-[#172B4D] shadow-lg flex items-center justify-center text-xs font-black">
                        ↔
                      </div>
                    </div>

                    {/* Labels */}
                    <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      {t.originalImageLabel}
                    </span>
                    <span className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      {t.cleanedImageLabel}
                    </span>
                  </div>

                  {/* Range slider input */}
                  <div className="max-w-md mx-auto pt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={splitSliderPos}
                      onChange={(e) => setSplitSliderPos(Number(e.target.value))}
                      className="w-full accent-[#1769FF] cursor-ew-resize"
                      aria-label="Split slider position"
                    />
                  </div>
                </div>
              )}

              {/* View 2: Side by Side (when screen allows) */}
              {comparisonMode === 'side-by-side' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-[#687A96] block text-center">
                      {t.originalImageLabel}
                    </span>
                    <div className="rounded-2xl overflow-hidden border border-[#DCE7F5] dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 flex items-center justify-center">
                      {imageElement && (
                        <img
                          src={imageElement.src}
                          alt={t.originalImageLabel}
                          className="max-h-72 w-auto object-contain rounded-lg"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block text-center">
                      {t.cleanedImageLabel}
                    </span>
                    <div className="rounded-2xl overflow-hidden border border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-slate-950 p-2 flex items-center justify-center">
                      <img
                        src={resultBlobUrl}
                        alt={t.cleanedImageLabel}
                        className="max-h-72 w-auto object-contain rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* View 3: Result Only */}
              {comparisonMode === 'result-only' && (
                <div className="rounded-2xl overflow-hidden border border-[#DCE7F5] dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 flex items-center justify-center max-h-[500px]">
                  <img
                    src={resultBlobUrl}
                    alt={t.cleanedImageLabel}
                    className="max-h-[460px] w-auto object-contain rounded-lg shadow-sm"
                  />
                </div>
              )}

              {/* Download & Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DCE7F5] dark:border-slate-800">
                <div className="text-xs text-[#687A96] space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span>{t.outputFileName}:</span>
                    <span className="font-semibold font-en" dir="ltr">
                      {downloadFileName}
                    </span>
                  </div>
                  <div>
                    <span>{t.outputFileSize}:</span>{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatFileSize(resultBlob?.size || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={resultBlobUrl}
                    download={downloadFileName}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.downloadCleanedImage}</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleReset}
                    className={`inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                        : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#687A96]'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t.chooseAnotherFile}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. Honest Technical Limitations Callout */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 flex items-start gap-3.5 ${
              isDark
                ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <h4 className="font-extrabold">{t.technicalLimitsTitle}</h4>
              <p className="leading-relaxed opacity-90">{t.technicalLimitsNotice}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
