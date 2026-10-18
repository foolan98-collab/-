import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sliders,
  Image as ImageIcon,
  RotateCcw,
  Maximize2,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFileSize } from './FileUploadDropzone';

type TargetPreset = '2k' | '4k' | '8k' | 'custom';

export const ImageUpscalerWorkspace: React.FC = () => {
  const { settings, lang } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number } | null>(null);

  const [preset, setPreset] = useState<TargetPreset>('2k');
  const [targetWidth, setTargetWidth] = useState<number>(2048);
  const [targetHeight, setTargetHeight] = useState<number>(1152);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [sharpenIntensity, setSharpenIntensity] = useState<number>(30); // 0 to 100
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [outputQuality, setOutputQuality] = useState<number>(92); // for jpeg/webp

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedBlobUrl, setProcessedBlobUrl] = useState<string>('');
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'processed' | 'split'>('processed');

  // Load image dimensions upon file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(isEn ? 'Please select a valid image file (PNG, JPG, WebP).' : 'يرجى اختيار ملف صورة صالح (PNG, JPG, WebP).');
      return;
    }

    if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
    if (processedBlobUrl) URL.revokeObjectURL(processedBlobUrl);

    setSelectedFile(file);
    setErrorMsg('');
    setProcessedBlobUrl('');
    setProcessedSize(0);

    const objectUrl = URL.createObjectURL(file);
    setOriginalImageUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      setOrigDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      calculatePresetDimensions('2k', img.naturalWidth, img.naturalHeight);
    };
    img.src = objectUrl;
  };

  const calculatePresetDimensions = (p: TargetPreset, origW: number, origH: number) => {
    let longestSide = 2048;
    if (p === '2k') longestSide = 2048;
    else if (p === '4k') longestSide = 3840;
    else if (p === '8k') longestSide = 7680;
    else return;

    const aspect = origW / origH;
    let newW = 0;
    let newH = 0;

    if (origW >= origH) {
      newW = longestSide;
      newH = Math.round(longestSide / aspect);
    } else {
      newH = longestSide;
      newW = Math.round(longestSide * aspect);
    }

    setTargetWidth(newW);
    setTargetHeight(newH);
  };

  const handlePresetClick = (p: TargetPreset) => {
    setPreset(p);
    if (p !== 'custom' && origDimensions) {
      calculatePresetDimensions(p, origDimensions.width, origDimensions.height);
    }
  };

  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockAspectRatio && origDimensions && w > 0) {
      const aspect = origDimensions.width / origDimensions.height;
      setTargetHeight(Math.round(w / aspect));
    }
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockAspectRatio && origDimensions && h > 0) {
      const aspect = origDimensions.width / origDimensions.height;
      setTargetWidth(Math.round(h * aspect));
    }
  };

  const handleUpscaleImage = async () => {
    if (!originalImageUrl || !origDimensions) return;
    setErrorMsg('');
    setIsProcessing(true);

    try {
      // Memory check for 8K or large canvas
      const totalPixels = targetWidth * targetHeight;
      if (totalPixels > 70000000) {
        throw new Error(
          isEn
            ? 'Requested resolution exceeds browser memory safety limits. Please choose 4K or lower.'
            : 'الأبعاد المطلوبة تتجاوز الحد الأقصى الآمن لذاكرة المتصفح. يرجى اختيار 4K أو أبعاد أقل لحماية استقرار جهازك.'
        );
      }

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load source image into canvas.'));
        img.src = originalImageUrl;
      });

      // Multi-pass scaling for superior sharpness
      const offscreen = document.createElement('canvas');
      offscreen.width = targetWidth;
      offscreen.height = targetHeight;
      const ctx = offscreen.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        throw new Error('Canvas 2D context not supported by your browser.');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Algorithmic unsharp mask filter if sharpening enabled
      if (sharpenIntensity > 0 && targetWidth <= 4096 && targetHeight <= 4096) {
        try {
          const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
          const data = imgData.data;
          const factor = (sharpenIntensity / 100) * 0.35; // gentle unsharp amount

          // Fast 3x3 Laplacian sharpening kernel
          const copy = new Uint8ClampedArray(data);
          const w = targetWidth;
          const h = targetHeight;

          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const idx = (y * w + x) * 4;
              for (let c = 0; c < 3; c++) {
                const current = copy[idx + c];
                const up = copy[((y - 1) * w + x) * 4 + c];
                const down = copy[((y + 1) * w + x) * 4 + c];
                const left = copy[(y * w + (x - 1)) * 4 + c];
                const right = copy[(y * w + (x + 1)) * 4 + c];

                const laplacian = 4 * current - (up + down + left + right);
                data[idx + c] = Math.min(255, Math.max(0, current + laplacian * factor));
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch {
          // If ImageData fails on ultra large canvas, gracefully keep smoothed draw
        }
      }

      // Export Blob
      const qualityRatio = outputQuality / 100;
      const blob = await new Promise<Blob | null>((resolve) => {
        offscreen.toBlob(
          (b) => resolve(b),
          outputFormat,
          outputFormat === 'image/png' ? undefined : qualityRatio
        );
      });

      if (!blob) throw new Error('Failed to generate high-resolution image blob.');

      if (processedBlobUrl) URL.revokeObjectURL(processedBlobUrl);
      const url = URL.createObjectURL(blob);
      setProcessedBlobUrl(url);
      setProcessedSize(blob.size);
    } catch (err: any) {
      setErrorMsg(err?.message || (isEn ? 'Upscaling failed.' : 'تعذر تكبير الصورة.'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Upload Drop Area */}
      {!selectedFile ? (
        <label
          className={`flex flex-col items-center justify-center p-10 sm:p-14 rounded-3xl border-2 border-dashed transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-900/60 border-slate-700 hover:border-[#1769FF]'
              : 'bg-white border-[#DCE7F5] hover:border-[#1769FF] shadow-[0_4px_24px_rgba(23,105,255,0.04)]'
          }`}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] flex items-center justify-center mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#172B4D] dark:text-white mb-1">
            {isEn ? 'Select Image to Upscale & Enhance' : 'اختر صورة لتكبيرها وتحسين دقتها'}
          </h3>
          <p className="text-xs text-[#687A96] dark:text-slate-400">
            {isEn ? 'Supports PNG, JPG, and WebP up to 2K, 4K, and 8K' : 'يدعم صيغ PNG و JPG و WebP حتى دقة 2K و 4K و 8K'}
          </p>
        </label>
      ) : (
        <div
          className={`rounded-3xl border p-6 sm:p-8 space-y-6 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
          }`}
        >
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-[#DCE7F5] dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1769FF]/10 text-[#1769FF] flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#172B4D] dark:text-white truncate max-w-xs">
                  {selectedFile.name}
                </h3>
                {origDimensions && (
                  <p className="text-xs text-[#687A96] font-mono">
                    الأبعاد الأصلية: {origDimensions.width} × {origDimensions.height} بكسل ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
            </div>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE7F5] dark:border-slate-700 text-xs font-bold text-[#1769FF] hover:bg-[#EAF3FF] dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEn ? 'Change Image' : 'تغيير الصورة'}</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold block text-[#172B4D] dark:text-slate-200">
              {isEn ? 'Target Upscale Preset' : 'دقة التكبير المستهدفة:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: '2k', label: '2K QHD', sub: '2048px' },
                { id: '4k', label: '4K Ultra HD', sub: '3840px' },
                { id: '8k', label: '8K Extreme', sub: '7680px' },
                { id: 'custom', label: 'أبعاد مخصصة', sub: 'Custom' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePresetClick(item.id as TargetPreset)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    preset === item.id
                      ? 'border-[#1769FF] bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] font-extrabold ring-2 ring-[#1769FF]/15'
                      : isDark
                      ? 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      : 'border-[#DCE7F5] bg-[#F5F9FF] text-[#172B4D] hover:border-[#1769FF]/40'
                  }`}
                >
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="text-[11px] text-[#687A96]">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold block">العرض الجديد (Width):</label>
              <input
                type="number"
                min="50"
                max="8192"
                value={targetWidth}
                onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                className={`w-full rounded-2xl px-4 py-2.5 text-sm font-mono border focus:outline-none focus:border-[#1769FF] ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                }`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold block">الارتفاع الجديد (Height):</label>
              <input
                type="number"
                min="50"
                max="8192"
                value={targetHeight}
                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                className={`w-full rounded-2xl px-4 py-2.5 text-sm font-mono border focus:outline-none focus:border-[#1769FF] ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                }`}
              />
            </div>
          </div>

          {/* Aspect Ratio Lock & Sharpen Intensity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={lockAspectRatio}
                onChange={(e) => setLockAspectRatio(e.target.checked)}
                className="w-4 h-4 accent-[#1769FF] rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-[#172B4D] dark:text-slate-200">
                الحفاظ على نسبة العرض إلى الارتفاع (Aspect Ratio)
              </span>
            </label>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>حدة الحواف (Unsharp Mask):</span>
                <span className="font-mono text-[#1769FF]">{sharpenIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sharpenIntensity}
                onChange={(e) => setSharpenIntensity(parseInt(e.target.value))}
                className="w-full accent-[#1769FF] cursor-pointer"
              />
            </div>
          </div>

          {/* Format & Quality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold block">صيغة الحفظ:</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as any)}
                className={`w-full rounded-2xl px-4 py-2.5 text-xs font-bold border focus:outline-none focus:border-[#1769FF] ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                }`}
              >
                <option value="image/png">PNG (دقة قصوى بدون فقدان تفاصيل)</option>
                <option value="image/jpeg">JPG (حجم ملف أخف)</option>
                <option value="image/webp">WebP (مضغوط وعالي الجودة)</option>
              </select>
            </div>

            {outputFormat !== 'image/png' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>جودة الضغط:</span>
                  <span className="font-mono text-[#1769FF]">{outputQuality}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={outputQuality}
                  onChange={(e) => setOutputQuality(parseInt(e.target.value))}
                  className="w-full accent-[#1769FF] cursor-pointer pt-2"
                />
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Trigger */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleUpscaleImage}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#1769FF] hover:bg-[#0755E9] disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#1769FF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>
              {isProcessing
                ? isEn ? 'Upscaling & Sharpening Image...' : 'جارٍ معالجة وتكبير الصورة...'
                : isEn ? `Upscale to ${targetWidth} × ${targetHeight}` : `بدء التكبير إلى ${targetWidth} × ${targetHeight} بكسل`}
            </span>
          </button>

          {/* Processed Result Preview & Download */}
          {processedBlobUrl && (
            <div className="pt-6 border-t border-[#DCE7F5] dark:border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    تم تكبير الصورة بنجاح! الأبعاد الجديدة: {targetWidth} × {targetHeight} ({formatFileSize(processedSize)})
                  </span>
                </div>

                <a
                  href={processedBlobUrl}
                  download={`fares-tools-upscaled-${targetWidth}x${targetHeight}.${outputFormat.split('/')[1]}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل الصورة بدقة فائقة</span>
                </a>
              </div>

              {/* Preview Box */}
              <div className="rounded-2xl border p-2 bg-slate-950 flex items-center justify-center max-h-[500px] overflow-hidden">
                <img
                  src={processedBlobUrl}
                  alt="Upscaled Preview"
                  className="max-h-[480px] w-auto object-contain rounded-xl"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Integrity Transparency Card */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 space-y-2.5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-bold text-[#1769FF]">
          <ShieldCheck className="w-4 h-4" />
          <span>شفافية هندسية في المعالجة:</span>
        </div>
        <p className="text-xs sm:text-sm text-[#687A96] dark:text-slate-300 leading-relaxed">
          تعتمد هذه الأداة على خوارزميات الاستيفاء عالي الجودة (High-Order Bicubic Smoothing) مع مرشح حدة الحواف الرياضي (Unsharp Masking Kernel) محلياً داخل متصفحك. لا نزعم أن الصورة خضعت لتوليد خيالي بالذكاء الاصطناعي، وتتم المعالجة بنسبة 100% على جهازك دون رفع صورتك إلى أي خادم خارجي.
        </p>
      </div>
    </div>
  );
};
