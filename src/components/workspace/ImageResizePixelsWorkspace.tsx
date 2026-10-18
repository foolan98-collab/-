import React, { useState } from 'react';
import {
  Scaling,
  Upload,
  Download,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFileSize } from './FileUploadDropzone';

interface PresetOption {
  label: string;
  w: number;
  h: number;
}

const COMMON_PRESETS: PresetOption[] = [
  { label: 'Full HD (1920 × 1080)', w: 1920, h: 1080 },
  { label: 'HD (1280 × 720)', w: 1280, h: 720 },
  { label: 'مربع إنستغرام (1080 × 1080)', w: 1080, h: 1080 },
  { label: 'بورتريه إنستغرام (1080 × 1350)', w: 1080, h: 1350 },
  { label: 'صورة شخصية (500 × 500)', w: 500, h: 500 },
  { label: 'مشاركة ويب (1200 × 630)', w: 1200, h: 630 },
];

export const ImageResizePixelsWorkspace: React.FC = () => {
  const { settings, lang } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number } | null>(null);

  const [width, setWidth] = useState<number>(1280);
  const [height, setHeight] = useState<number>(720);
  const [aspectLocked, setAspectLocked] = useState<boolean>(true);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState<number>(90);

  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizedBlobUrl, setResizedBlobUrl] = useState<string>('');
  const [resizedSize, setResizedSize] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(isEn ? 'Please choose an image file (PNG, JPG, WebP).' : 'يرجى اختيار ملف صورة صالح (PNG, JPG, WebP).');
      return;
    }

    if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
    if (resizedBlobUrl) URL.revokeObjectURL(resizedBlobUrl);

    setSelectedFile(file);
    setErrorMsg('');
    setResizedBlobUrl('');
    setResizedSize(0);

    const objUrl = URL.createObjectURL(file);
    setOriginalImageUrl(objUrl);

    const img = new Image();
    img.onload = () => {
      setOrigDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = objUrl;
  };

  const handleWidthInput = (val: number) => {
    setWidth(val);
    if (aspectLocked && origDimensions && val > 0) {
      const ratio = origDimensions.height / origDimensions.width;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightInput = (val: number) => {
    setHeight(val);
    if (aspectLocked && origDimensions && val > 0) {
      const ratio = origDimensions.width / origDimensions.height;
      setWidth(Math.round(val * ratio));
    }
  };

  const applyPreset = (p: PresetOption) => {
    setWidth(p.w);
    setHeight(p.h);
    setAspectLocked(false);
  };

  const handleExecuteResize = async () => {
    if (!originalImageUrl || !origDimensions) return;
    setErrorMsg('');

    if (width <= 0 || height <= 0 || isNaN(width) || isNaN(height)) {
      setErrorMsg(isEn ? 'Width and height must be positive numbers.' : 'يجب أن يكون العرض والارتفاع أرقاماً موجبة صحيحة.');
      return;
    }

    if (width > 12000 || height > 12000) {
      setErrorMsg(isEn ? 'Dimensions cannot exceed 12,000 pixels.' : 'الأبعاد المحددة كبيرة جداً (أقصى حد هو 12,000 بكسل).');
      return;
    }

    setIsResizing(true);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = originalImageUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported.');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (b) => resolve(b),
          format,
          format === 'image/png' ? undefined : quality / 100
        );
      });

      if (!blob) throw new Error('Resize conversion failed.');

      if (resizedBlobUrl) URL.revokeObjectURL(resizedBlobUrl);
      const url = URL.createObjectURL(blob);
      setResizedBlobUrl(url);
      setResizedSize(blob.size);
    } catch (err: any) {
      setErrorMsg(err?.message || (isEn ? 'Resizing failed.' : 'حدث خطأ أثناء تغيير الأبعاد.'));
    } finally {
      setIsResizing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
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
            <Scaling className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#172B4D] dark:text-white mb-1">
            {isEn ? 'Select Image to Resize by Pixels' : 'اختر صورة لتغيير أبعادها بالبكسل'}
          </h3>
          <p className="text-xs text-[#687A96] dark:text-slate-400">
            {isEn ? 'Customize exact width and height in pixels' : 'حدد العرض والارتفاع الدقيق بالبكسل مع قفل النسبة أو الأبعاد الحرة'}
          </p>
        </label>
      ) : (
        <div
          className={`rounded-3xl border p-6 sm:p-8 space-y-6 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
          }`}
        >
          {/* Header Bar */}
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
                    الأبعاد الحالية: {origDimensions.width} × {origDimensions.height} بكسل ({formatFileSize(selectedFile.size)})
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

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold block text-[#172B4D] dark:text-slate-200">
              {isEn ? 'Common Preset Dimensions' : 'أبعاد وأحجام شائعة وجاهزة:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-start transition-colors cursor-pointer ${
                    width === p.w && height === p.h
                      ? 'border-[#1769FF] bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF]'
                      : isDark
                      ? 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      : 'border-[#DCE7F5] bg-[#F5F9FF] text-[#172B4D] hover:border-[#1769FF]/40'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Pixel Inputs with Lock Toggle */}
          <div className="p-4 rounded-2xl bg-[#1769FF]/5 border border-[#1769FF]/15 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-extrabold text-[#1769FF]">
                تخصيص الأبعاد الدقيقة (بالبكسل):
              </span>
              <button
                type="button"
                onClick={() => setAspectLocked(!aspectLocked)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  aspectLocked
                    ? 'border-[#1769FF] bg-[#1769FF] text-white'
                    : isDark
                    ? 'border-slate-700 text-slate-300'
                    : 'border-[#DCE7F5] text-[#172B4D] bg-white'
                }`}
              >
                {aspectLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{aspectLocked ? 'نسبة الأبعاد مقفلة (تلقائي)' : 'نسبة الأبعاد حرة'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold block">العرض (Width - px):</label>
                <input
                  type="number"
                  min="1"
                  max="12000"
                  value={width}
                  onChange={(e) => handleWidthInput(parseInt(e.target.value) || 0)}
                  className={`w-full rounded-2xl px-4 py-2.5 text-sm font-mono border focus:outline-none focus:border-[#1769FF] ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-[#DCE7F5] text-[#172B4D]'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold block">الارتفاع (Height - px):</label>
                <input
                  type="number"
                  min="1"
                  max="12000"
                  value={height}
                  onChange={(e) => handleHeightInput(parseInt(e.target.value) || 0)}
                  className={`w-full rounded-2xl px-4 py-2.5 text-sm font-mono border focus:outline-none focus:border-[#1769FF] ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-[#DCE7F5] text-[#172B4D]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold block">صيغة الصورة الناتجة:</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className={`w-full rounded-2xl px-4 py-2.5 text-xs font-bold border focus:outline-none focus:border-[#1769FF] ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                }`}
              >
                <option value="image/jpeg">JPG (الأكثر انتشاراً وحجماً خفيفاً)</option>
                <option value="image/png">PNG (يدعم الشفافية وجودة فائقة)</option>
                <option value="image/webp">WebP (أحدث معيار للويب)</option>
              </select>
            </div>

            {format !== 'image/png' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>جودة الحفظ:</span>
                  <span className="font-mono text-[#1769FF]">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
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

          {/* Execute Button */}
          <button
            type="button"
            disabled={isResizing}
            onClick={handleExecuteResize}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#1769FF] hover:bg-[#0755E9] disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#1769FF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Scaling className="w-5 h-5" />
            <span>
              {isResizing
                ? isEn ? 'Resizing Image...' : 'جارٍ تغيير الأبعاد...'
                : isEn ? `Resize to ${width} × ${height} px` : `تغيير الأبعاد إلى ${width} × ${height} بكسل`}
            </span>
          </button>

          {/* Result Output Preview */}
          {resizedBlobUrl && (
            <div className="pt-6 border-t border-[#DCE7F5] dark:border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    تم تغيير الأبعاد بنجاح! ({width} × {height} بكسل) — {formatFileSize(resizedSize)}
                  </span>
                </div>

                <a
                  href={resizedBlobUrl}
                  download={`fares-tools-resized-${width}x${height}.${format.split('/')[1]}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل الصورة المعدلة</span>
                </a>
              </div>

              <div className="rounded-2xl border p-2 bg-slate-950 flex items-center justify-center max-h-[420px] overflow-hidden">
                <img
                  src={resizedBlobUrl}
                  alt="Resized Result Preview"
                  className="max-h-[400px] w-auto object-contain rounded-xl"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
