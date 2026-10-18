import React from 'react';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Download,
  RotateCcw,
  Wrench,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFileSize } from './FileUploadDropzone';

export interface SecondaryProcessedItem {
  label: string;
  fileName: string;
  blobUrl: string;
  fileSize: number;
  previewType?: 'image' | 'pdf';
}

export interface ProcessedOutput {
  blobUrl: string;
  fileName: string;
  fileSize: number;
  originalSize?: number;
  summaryText: string;
  warningNotice?: string;
  previewType?: 'image' | 'audio' | 'pdf' | 'text' | 'none';
  textContent?: string;
  secondaryItems?: SecondaryProcessedItem[];
}

interface ProcessingStateProps {
  message?: string;
}

export const ProcessingView: React.FC<ProcessingStateProps> = ({
  message = 'جاري معالجة الملف محلياً داخل متصفحك...',
}) => {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-2xl border p-8 text-center space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#EAF3FF] text-[#1769FF] flex items-center justify-center mx-auto">
        <Loader2 className="w-7 h-7 animate-spin" />
      </div>
      <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
        {message}
      </h4>
      <p className="text-xs text-[#687A96]">
        تتم المعالجة مباشرة على جهازك لضمان أقصى درجات السرعة والخصوصية.
      </p>
    </div>
  );
};

interface ErrorViewProps {
  title?: string;
  error: string;
  onRetry: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title = 'تعذر إتمام العملية',
  error,
  onRetry,
}) => {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  return (
    <div
      role="alert"
      className={`rounded-2xl border p-6 text-right space-y-4 ${
        isDark
          ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
          : 'bg-rose-50 border-rose-200 text-rose-900'
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-base font-bold">{title}</h4>
          <p className="text-sm leading-relaxed opacity-90">{error}</p>
        </div>
      </div>
      <div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    </div>
  );
};

interface EnginePendingNoticeProps {
  toolName: string;
  selectedFileCount: number;
  onReset: () => void;
}

/**
 * Honest notice for unimplemented engines per strict instructions:
 * "Do not fabricate processing progress or successful downloads.
 * Unimplemented tools must clearly indicate that their processing engine is not yet available."
 */
export const EnginePendingNotice: React.FC<EnginePendingNoticeProps> = ({
  toolName,
  selectedFileCount,
  onReset,
}) => {
  const { settings, navigate } = useApp();
  const isDark = settings.theme === 'dark';

  return (
    <div
      role="status"
      className={`rounded-2xl border p-6 sm:p-8 text-right space-y-4 ${
        isDark
          ? 'bg-amber-950/25 border-amber-700/50 text-amber-100'
          : 'bg-amber-50/90 border-amber-200 text-[#172B4D]'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Wrench className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h4 className="text-base sm:text-lg font-bold">
            محرك المعالجة لأداة «{toolName}» غير متاح بعد في هذه المرحلة
          </h4>
          <p className="text-sm leading-relaxed opacity-90">
            تم التحقق من {selectedFileCount > 0 ? `الملفات المرفوعة (${selectedFileCount}) و` : ''}إعدادات الأداة بنجاح، ولكن محرك المعالجة البرمجي المخصص لهذه الأداة قيد الربط في المرحلة القادمة من منصة <strong>فارس TOOLS</strong>. نحن لا نقوم بمحاكاة شريط تقدم وهمي أو تنزيل ملفات غير معالجة حفاظاً على مصداقية المنصة.
          </p>
          <p className="text-xs opacity-75">
            يمكنك حالياً تجربة الأدوات الفعالة بالكامل داخل المتصفح مثل: دمج PDF، ضغط PDF، تقسيم PDF، تدوير PDF، تحويل PDF إلى صور JPG، ضغط الصور، تغيير حجم الصور، قص الصور، تدوير الصور، تحسين الصور، تحويل الصور إلى JPG، مولد QR Code، قص الصوت، التشكيل وتصحيح الأخطاء العربية، وحاسبة الزكاة.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
        >
          تغيير الإعدادات أو الملف
        </button>
        <button
          type="button"
          onClick={() => navigate('/all-tools')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            isDark
              ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
              : 'border-amber-300 hover:bg-amber-100/60 text-[#172B4D]'
          }`}
        >
          استكشاف الأدوات المتاحة
        </button>
      </div>
    </div>
  );
};

interface SuccessDownloadViewProps {
  output: ProcessedOutput;
  onReset: () => void;
}

export const SuccessDownloadView: React.FC<SuccessDownloadViewProps> = ({
  output,
  onReset,
}) => {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  const savingsPercent =
    output.originalSize && output.originalSize > output.fileSize
      ? Math.max(
          1,
          Math.round(((output.originalSize - output.fileSize) / output.originalSize) * 100)
        )
      : null;

  return (
    <div
      className={`rounded-2xl border p-6 sm:p-8 space-y-6 ${
        isDark ? 'bg-slate-900 border-emerald-800/60' : 'bg-white border-emerald-200 shadow-xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-[#DCE7F5] dark:border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4
              className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              تمت المعالجة الحقيقية بنجاح!
            </h4>
            <p className="text-sm text-[#687A96] dark:text-slate-400 mt-0.5 leading-relaxed">
              {output.summaryText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={output.blobUrl}
            download={output.fileName}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white font-bold text-sm shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>
              {output.fileName.endsWith('.zip')
                ? 'تحميل الكل كملف مضغوط (ZIP)'
                : 'تحميل الملف الآن'}
            </span>
          </a>
          <button
            type="button"
            onClick={onReset}
            className={`p-3 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#687A96]'
            }`}
            title="معالجة ملف جديد"
            aria-label="معالجة ملف جديد"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {output.warningNotice && (
        <div
          className={`rounded-xl border p-4 text-xs sm:text-sm leading-relaxed ${
            isDark
              ? 'bg-amber-950/30 border-amber-700/50 text-amber-200'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          {output.warningNotice}
        </div>
      )}

      {/* File Details & Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-[#DCE7F5]/60 dark:border-slate-800">
            <span className="text-[#687A96]">اسم الملف الناتج:</span>
            <span className="font-semibold font-en truncate max-w-[240px]" dir="ltr">
              {output.fileName}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#DCE7F5]/60 dark:border-slate-800">
            <span className="text-[#687A96]">الحجم النهائي:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatFileSize(output.fileSize)}
            </span>
          </div>
          {output.originalSize !== undefined && (
            <div className="flex items-center justify-between py-2 border-b border-[#DCE7F5]/60 dark:border-slate-800">
              <span className="text-[#687A96]">الحجم الأصلي:</span>
              <span className="tabular-nums text-[#687A96]">
                {formatFileSize(output.originalSize)}
              </span>
            </div>
          )}
          {savingsPercent !== null && (
            <div className="flex items-center justify-between py-2">
              <span className="text-[#687A96]">نسبة التوفير الفعلية في الحجم:</span>
              <span className="font-bold text-[#1769FF] tabular-nums">
                {savingsPercent}% أقل
              </span>
            </div>
          )}
        </div>

        {output.previewType === 'image' && (
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-3 flex items-center justify-center max-h-60">
            <img
              src={output.blobUrl}
              alt="معاينة الصورة بعد المعالجة"
              className="max-h-52 w-auto object-contain rounded-lg"
            />
          </div>
        )}

        {output.previewType === 'audio' && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <p className="text-xs text-slate-400 mb-2">معاينة المقطع الصوتي المقصوص:</p>
            <audio controls src={output.blobUrl} className="w-full" />
          </div>
        )}
      </div>

      {/* Individual Downloadable Items (for PDF to JPG pages or Split PDF parts) */}
      {output.secondaryItems && output.secondaryItems.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#DCE7F5] dark:border-slate-800">
          <h5
            className={`text-sm font-bold ${
              isDark ? 'text-white' : 'text-[#172B4D]'
            }`}
          >
            الملفات الفردية المستخرجة ({output.secondaryItems.length}) — يمكنك تحميل أي ملف على حدة:
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
            {output.secondaryItems.map((item, idx) => (
              <div
                key={`${item.fileName}-${idx}`}
                className={`rounded-xl border p-3 flex flex-col justify-between gap-3 ${
                  isDark
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-[#F5F9FF] border-[#DCE7F5]'
                }`}
              >
                {item.previewType === 'image' && (
                  <div className="h-32 rounded-lg bg-white dark:bg-slate-900 border border-[#DCE7F5]/60 dark:border-slate-800 flex items-center justify-center overflow-hidden p-1.5">
                    <img
                      src={item.blobUrl}
                      alt={item.label}
                      className="max-h-full w-auto object-contain"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${
                        isDark ? 'text-slate-100' : 'text-[#172B4D]'
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-[11px] text-[#687A96] tabular-nums">
                      {formatFileSize(item.fileSize)}
                    </p>
                  </div>

                  <a
                    href={item.blobUrl}
                    download={item.fileName}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] dark:text-[#38A5FF] hover:bg-[#1769FF] hover:text-white text-xs font-bold transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
