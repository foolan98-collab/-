import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  RotateCcw,
  FilePlus2,
  AlertCircle,
  Loader2,
  FileText,
  Shield,
  Wrench,
  Copy,
  Check,
  XCircle,
  LayoutGrid,
  Heart,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { getToolBySlug, CATEGORIES } from '../data/toolsCatalog';
import { ToolIcon } from '../components/ToolIcon';
import { getToolColorPalette } from '../utils/toolColors';
import { useApp } from '../context/AppContext';
import { formatFileSize } from '../components/workspace/FileUploadDropzone';
import { usePageSeo } from '../hooks/usePageSeo';
import { AdSlot } from '../components/AdSlot';
import { SocialShareModal } from '../components/SocialShareModal';
import { WhatsAppFeedbackSection } from '../components/WhatsAppFeedbackSection';

interface ProcessingPageProps {
  slug: string;
}

export const ProcessingPage: React.FC<ProcessingPageProps> = ({ slug }) => {
  const {
    navigate,
    settings,
    activeJob,
    cancelProcessingJob,
    retryProcessingJob,
    clearActiveJob,
    clearToolDraft,
    isFavorite,
    toggleFavorite,
    lang,
  } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';

  const [copiedText, setCopiedText] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const tool = getToolBySlug(slug);
  const palette = tool ? getToolColorPalette(tool.slug, tool.category) : null;

  usePageSeo({
    title: tool ? `معالجة ${tool.name}` : 'معالجة الملف',
    description: tool
      ? `صفحة معالجة وتنزيل ملفات ${tool.name} محلياً في المتصفح.`
      : 'معالجة وتنزيل الملفات عبر فارس TOOLS.',
    canonicalPath: `/tools/${slug}/process`,
  });

  if (!tool) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-5">
        <h1 className="text-2xl font-extrabold">الأداة المطلوبة غير موجودة</h1>
        <button
          type="button"
          onClick={() => navigate('/all-tools')}
          className="px-6 py-3 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-sm font-bold transition-colors cursor-pointer"
        >
          العودة إلى جميع الأدوات
        </button>
      </div>
    );
  }

  const fav = isFavorite(tool.id);

  // Handle direct page refresh or navigating to /tools/:slug/process without an active job
  if (!activeJob || activeJob.toolSlug !== slug || activeJob.files.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 animate-fade-in-up">
        <div
          className={`rounded-3xl border p-8 sm:p-10 text-center space-y-6 ${
            isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-[#DCE7F5] shadow-[0_8px_30px_rgba(23,105,255,0.06)]'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] dark:text-[#38A5FF] flex items-center justify-center mx-auto">
            <ToolIcon name={tool.iconName} className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1
              className={`text-xl sm:text-2xl font-extrabold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              لا توجد عملية معالجة نشطة حالياً لأداة «{tool.name}»
            </h1>
            <p className="text-sm text-[#687A96] dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              ربما قمت بتحديث الصفحة أو العودة إليها بعد انتهاء الجلسة. نظراً لأن جميع الملفات تُعالج محلياً داخل متصفحك، يرجى اختيار الملف من صفحة الأداة للبدء.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/tools/${tool.slug}`)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-sm font-bold shadow-md transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>اختيار ملف والعودة للأداة</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/all-tools')}
              className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                  : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#172B4D]'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-[#1769FF]" />
              <span>العودة إلى الأدوات</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cat = CATEGORIES[tool.category];
  const output = activeJob.output;

  const handleReturnToToolKeepSettings = () => {
    navigate(`/tools/${tool.slug}`);
  };

  const handleChooseAnotherFile = () => {
    clearActiveJob();
    clearToolDraft(tool.slug);
    navigate(`/tools/${tool.slug}`);
  };

  const handleReturnToAllTools = () => {
    navigate('/all-tools');
  };

  const handleCopyExtractedText = async () => {
    if (!output?.textContent) return;
    try {
      await navigator.clipboard.writeText(output.textContent);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  const savingsPercent =
    output?.originalSize && output.originalSize > output.fileSize
      ? Math.max(
          1,
          Math.round(
            ((output.originalSize - output.fileSize) / output.originalSize) *
              100
          )
        )
      : null;

  const isSuccess = activeJob.status === 'success';
  const isProcessing = activeJob.status === 'processing';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 animate-fade-in-up">
      {/* Top Navigation & Favorite Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#687A96]">
          <button
            type="button"
            onClick={handleReturnToAllTools}
            className="inline-flex items-center gap-1 hover:text-[#1769FF] font-semibold transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>كل الأدوات</span>
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            onClick={handleReturnToToolKeepSettings}
            className="hover:text-[#1769FF] font-bold transition-colors cursor-pointer"
          >
            {tool.name}
          </button>
          <span aria-hidden="true">/</span>
          <span className="font-bold text-[#1769FF]">
            {isSuccess ? 'النتيجة والتنزيل' : 'شاشة المعالجة'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toggleFavorite(tool.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              fav
                ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300'
                : isDark
                ? 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                : 'border-[#DCE7F5] bg-white text-[#172B4D] hover:bg-[#F5F9FF]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-current text-rose-500' : ''}`} />
            <span>{fav ? 'في المفضلة' : 'إضافة للمفضلة'}</span>
          </button>

          <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#687A96]">
            <Shield className="w-4 h-4 text-[#1769FF]" />
            <span>معالجة محلية آمنة 100%</span>
          </div>
        </div>
      </div>

      {/* Clear 4-Step Visual Progress Stepper */}
      <div
        aria-label="مراحل استخدام الأداة"
        className={`rounded-2xl border p-4 sm:px-6 ${
          isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-[#DCE7F5] shadow-[0_2px_12px_rgba(23,105,255,0.04)]'
        }`}
      >
        <ol className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
          <li className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </span>
            <span>1. اختيار الملف</span>
          </li>
          <li className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </span>
            <span>2. ضبط الخيارات</span>
          </li>
          <li
            className={`flex items-center gap-2.5 ${
              isSuccess
                ? 'text-emerald-600 dark:text-emerald-400'
                : isProcessing
                ? 'text-[#1769FF] dark:text-[#38A5FF]'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 tabular-nums ${
                isSuccess
                  ? 'bg-emerald-500/15'
                  : isProcessing
                  ? 'bg-[#1769FF] text-white'
                  : 'bg-amber-500/15'
              }`}
            >
              {isSuccess ? <Check className="w-3.5 h-3.5" /> : '3'}
            </span>
            <span>3. بدء المعالجة</span>
          </li>
          <li
            className={`flex items-center gap-2.5 ${
              isSuccess
                ? 'text-[#1769FF] dark:text-[#38A5FF]'
                : 'text-[#687A96] opacity-60'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 tabular-nums ${
                isSuccess
                  ? 'bg-[#1769FF] text-white'
                  : isDark
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-[#EAF3FF] text-[#687A96]'
              }`}
            >
              4
            </span>
            <span>4. عرض النتيجة والتنزيل</span>
          </li>
        </ol>
      </div>

      {/* Main Full-Page White Card on Pale Blue Surface */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-10 transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-[#DCE7F5] shadow-[0_12px_40px_rgba(23,105,255,0.07)]'
        }`}
      >
        {palette && (
          <span
            className="absolute top-0 right-0 left-0 h-1.5"
            style={{ backgroundColor: palette.accentHex }}
            aria-hidden="true"
          />
        )}

        {/* Tool Context Header & Selected File Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE7F5] dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                palette
                  ? isDark
                    ? `${palette.iconBgDark} ${palette.iconTextDark}`
                    : `${palette.iconBgLight} ${palette.iconTextLight}`
                  : 'bg-[#EAF3FF] text-[#1769FF]'
              }`}
            >
              <ToolIcon name={tool.iconName} className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#687A96]">
                {cat.name}
              </span>
              <h1
                className={`text-lg sm:text-xl font-extrabold ${
                  isDark ? 'text-white' : 'text-[#172B4D]'
                }`}
              >
                {tool.name}
              </h1>
            </div>
          </div>

          {/* Selected Files Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {activeJob.files.slice(0, 3).map((f, idx) => (
              <div
                key={`${f.name}-${idx}`}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-300'
                    : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#1769FF] shrink-0" />
                <span className="truncate max-w-[160px] font-en" dir="ltr">
                  {f.name}
                </span>
                <span className="text-[11px] text-[#687A96] tabular-nums">
                  ({formatFileSize(f.size)})
                </span>
              </div>
            ))}
            {activeJob.files.length > 3 && (
              <span className="px-2.5 py-1 rounded-lg bg-[#EAF3FF] text-[#1769FF] text-xs font-bold">
                +{activeJob.files.length - 3} ملفات أخرى
              </span>
            )}
          </div>
        </div>

        {/* STATE 1: PROCESSING */}
        {activeJob.status === 'processing' && (
          <div
            role="status"
            aria-live="polite"
            className="py-12 sm:py-16 text-center max-w-xl mx-auto space-y-6"
          >
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-[#1769FF]/15 animate-ping" />
              <div className="relative w-20 h-20 rounded-3xl bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] dark:text-[#38A5FF] flex items-center justify-center shadow-inner">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] dark:text-[#38A5FF] text-xs font-extrabold">
                حالة الانتظار والمعالجة الفورية
              </span>
              <h2
                className={`text-xl sm:text-2xl font-extrabold ${
                  isDark ? 'text-white' : 'text-[#172B4D]'
                }`}
              >
                {activeJob.progressMessage || 'جارٍ معالجة الملف...'}
              </h2>
              <p className="text-xs sm:text-sm text-[#687A96] dark:text-slate-400">
                يرجى الانتظار للحظات بينما يقوم محرك فارس TOOLS بمعالجة ملفاتك محلياً بأمان تام.
              </p>
            </div>

            {/* Honest Progress Bar: Determinate ONLY when engine supplies real progressPercent, Indeterminate otherwise */}
            <div className="space-y-2 pt-2">
              <div className="w-full h-3 rounded-full bg-[#EAF3FF] dark:bg-slate-800 overflow-hidden p-0.5">
                {typeof activeJob.progressPercent === 'number' ? (
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-[#1769FF] to-[#38A5FF] transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(8, activeJob.progressPercent)
                      )}%`,
                    }}
                  />
                ) : (
                  <div className="h-full w-2/5 rounded-full bg-gradient-to-l from-[#1769FF] to-[#38A5FF] animate-pulse mx-auto" />
                )}
              </div>

              {typeof activeJob.progressPercent === 'number' && (
                <div className="text-xs font-extrabold text-[#1769FF] dark:text-[#38A5FF] tabular-nums">
                  {Math.round(activeJob.progressPercent)}%
                </div>
              )}
            </div>

            {/* Real Cancel Processing Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={cancelProcessingJob}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-rose-800/70 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50'
                    : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>إلغاء المعالجة</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 1B: CANCELLED BY USER */}
        {activeJob.status === 'cancelled' && (
          <div
            role="status"
            className="py-10 sm:py-12 max-w-2xl mx-auto space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <XCircle className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2
                className={`text-xl sm:text-2xl font-extrabold ${
                  isDark ? 'text-white' : 'text-[#172B4D]'
                }`}
              >
                تم إلغاء عملية المعالجة
              </h2>
              <p className="text-sm text-[#687A96] dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                تم إيقاف المهمة الحالية وتنظيف الذاكرة المؤقتة بأمان. يمكنك إعادة تشغيل المعالجة بنفس الخيارات أو اختيار ملف آخر.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={retryProcessingJob}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة بدء المعالجة</span>
              </button>

              <button
                type="button"
                onClick={handleChooseAnotherFile}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white'
                    : 'border-[#DCE7F5] bg-[#F5F9FF] hover:bg-[#EAF3FF] text-[#172B4D]'
                }`}
              >
                <FilePlus2 className="w-4 h-4 text-[#1769FF]" />
                <span>اختيار ملف آخر</span>
              </button>

              <button
                type="button"
                onClick={handleReturnToToolKeepSettings}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                    : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#687A96]'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                <span>تعديل الخيارات</span>
              </button>

              <button
                type="button"
                onClick={handleReturnToAllTools}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                    : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#687A96]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>العودة إلى الأدوات</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 2: SUCCESS */}
        {activeJob.status === 'success' && output && (
          <div className="pt-8 space-y-8">
            {/* Hero Success Banner & Prominent Download CTA */}
            <div className="text-center max-w-2xl mx-auto space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-11 h-11" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
                  اكتملت المعالجة بنجاح
                </span>
                <h2
                  className={`text-2xl sm:text-3xl font-extrabold ${
                    isDark ? 'text-white' : 'text-[#172B4D]'
                  }`}
                >
                  تم إنشاء الملف بنجاح
                </h2>
                <p className="text-sm sm:text-base text-[#687A96] dark:text-slate-300 leading-relaxed">
                  {output.summaryText}
                </p>
              </div>

              {/* Prominent Primary Download Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <a
                  href={output.blobUrl}
                  download={output.fileName}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-2xl bg-[#1769FF] hover:bg-[#0755E9] text-white font-extrabold text-base sm:text-lg shadow-[0_10px_25px_rgba(23,105,255,0.28)] hover:shadow-[0_14px_30px_rgba(23,105,255,0.36)] transition-all"
                >
                  <Download className="w-5 h-5" />
                  <span>تنزيل الملف</span>
                </a>
              </div>

              {/* Secondary Navigation Actions: Choose Another File, Return to Tool, Return to All Tools */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleChooseAnotherFile}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white'
                      : 'border-[#DCE7F5] bg-[#F5F9FF] hover:bg-[#EAF3FF] text-[#172B4D]'
                  }`}
                >
                  <FilePlus2 className="w-4 h-4 text-[#1769FF]" />
                  <span>اختيار ملف آخر</span>
                </button>

                <button
                  type="button"
                  onClick={handleReturnToToolKeepSettings}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                      : 'border-[#DCE7F5] bg-white hover:bg-[#F5F9FF] text-[#687A96]'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة لإعدادات الأداة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white'
                      : 'border-[#DCE7F5] bg-white hover:bg-[#EAF3FF] text-[#172B4D]'
                  }`}
                >
                  <Share2 className="w-4 h-4 text-[#1769FF]" />
                  <span>{isEn ? 'Share Tool' : 'شارك الأداة'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReturnToAllTools}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                      : 'border-[#DCE7F5] bg-white hover:bg-[#F5F9FF] text-[#687A96]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-[#1769FF]" />
                  <span>العودة إلى الأدوات</span>
                </button>
              </div>
            </div>

            {output.warningNotice && (
              <div
                className={`rounded-2xl border p-4 text-xs sm:text-sm leading-relaxed ${
                  isDark
                    ? 'bg-amber-950/30 border-amber-700/50 text-amber-200'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {output.warningNotice}
              </div>
            )}

            {/* Output Metadata Summary & Live Preview */}
            <div
              className={`rounded-2xl border p-5 sm:p-6 grid grid-cols-1 ${
                output.previewType === 'image' || output.previewType === 'audio'
                  ? 'md:grid-cols-2'
                  : 'md:grid-cols-1'
              } gap-6 items-center ${
                isDark
                  ? 'bg-slate-950/60 border-slate-800'
                  : 'bg-[#F5F9FF]/70 border-[#DCE7F5]'
              }`}
            >
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-[#DCE7F5]/70 dark:border-slate-800">
                  <span className="text-[#687A96]">اسم الملف الناتج:</span>
                  <span
                    className="font-bold font-en truncate max-w-[260px]"
                    dir="ltr"
                  >
                    {output.fileName}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#DCE7F5]/70 dark:border-slate-800">
                  <span className="text-[#687A96]">حجم الملف الناتج:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatFileSize(output.fileSize)}
                  </span>
                </div>
                {output.originalSize !== undefined && (
                  <div className="flex items-center justify-between py-2 border-b border-[#DCE7F5]/70 dark:border-slate-800">
                    <span className="text-[#687A96]">الحجم الأصلي:</span>
                    <span className="tabular-nums text-[#687A96]">
                      {formatFileSize(output.originalSize)}
                    </span>
                  </div>
                )}
                {savingsPercent !== null && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#687A96]">نسبة التوفير الفعلية:</span>
                    <span className="font-extrabold text-[#1769FF] tabular-nums">
                      {savingsPercent}% أقل
                    </span>
                  </div>
                )}
              </div>

              {output.previewType === 'image' && (
                <div className="rounded-xl overflow-hidden border border-[#DCE7F5] dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex items-center justify-center max-h-64">
                  <img
                    src={output.blobUrl}
                    alt="معاينة الصورة الناتجة"
                    className="max-h-56 w-auto object-contain rounded-lg"
                  />
                </div>
              )}

              {output.previewType === 'audio' && (
                <div className="p-4 rounded-xl border border-[#DCE7F5] dark:border-slate-800 bg-white dark:bg-slate-900">
                  <p className="text-xs text-[#687A96] mb-2">
                    معاينة المقطع الصوتي الناتج:
                  </p>
                  <audio controls src={output.blobUrl} className="w-full" />
                </div>
              )}
            </div>

            {/* Copyable Extracted Text View (when previewType === 'text') */}
            {output.previewType === 'text' && output.textContent && (
              <div
                className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${
                  isDark
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-[#F5F9FF] border-[#DCE7F5]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3
                    className={`text-sm sm:text-base font-extrabold ${
                      isDark ? 'text-white' : 'text-[#172B4D]'
                    }`}
                  >
                    النص المستخرج من ملف PDF (قابل للقراءة والنسخ):
                  </h3>

                  <button
                    type="button"
                    onClick={handleCopyExtractedText}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] dark:text-[#38A5FF] hover:bg-[#1769FF] hover:text-white text-xs font-extrabold transition-colors cursor-pointer"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تم نسخ النص بالكامل</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ النص</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  readOnly
                  value={output.textContent}
                  rows={10}
                  aria-label="النص المستخرج من ملف PDF"
                  className={`w-full rounded-xl p-4 text-sm leading-relaxed font-medium border focus:outline-none focus:border-[#1769FF] ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-100'
                      : 'bg-white border-[#DCE7F5] text-[#172B4D]'
                  }`}
                />
              </div>
            )}

            {/* Individual Downloadable Items (for PDF to JPG pages or Split PDF parts) */}
            {output.secondaryItems && output.secondaryItems.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[#DCE7F5] dark:border-slate-800">
                <h3
                  className={`text-sm sm:text-base font-extrabold ${
                    isDark ? 'text-white' : 'text-[#172B4D]'
                  }`}
                >
                  الملفات الفردية المستخرجة ({output.secondaryItems.length}) — يمكنك تنزيل أي ملف منفرداً:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-96 overflow-y-auto p-1">
                  {output.secondaryItems.map((item, idx) => (
                    <div
                      key={`${item.fileName}-${idx}`}
                      className={`rounded-xl border p-3.5 flex flex-col justify-between gap-3 ${
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

            {/* Non-intrusive, clear AdSlot placed safely below the results and separated from downloads */}
            <AdSlot placement="result-page" format="horizontal" className="mt-8" />
          </div>
        )}

        {/* STATE 3: ERROR */}
        {activeJob.status === 'error' && (
          <div
            role="alert"
            className="py-8 sm:py-10 max-w-2xl mx-auto space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 text-xs font-extrabold">
                حالة خطأ أثناء المعالجة
              </span>
              <h2
                className={`text-xl sm:text-2xl font-extrabold ${
                  isDark ? 'text-white' : 'text-[#172B4D]'
                }`}
              >
                تعذر إتمام معالجة الملف
              </h2>
              <p className="text-sm sm:text-base text-rose-600 dark:text-rose-300 font-semibold leading-relaxed bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-4">
                {activeJob.errorMessage ||
                  'حدث خطأ أثناء معالجة الملف. يرجى التحقق من سلامة الملف وأن صيغته مدعومة ثم المحاولة مرة أخرى.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={retryProcessingJob}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة المحاولة بنفس الإعدادات</span>
              </button>

              <button
                type="button"
                onClick={handleChooseAnotherFile}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white'
                    : 'border-[#DCE7F5] bg-[#F5F9FF] hover:bg-[#EAF3FF] text-[#172B4D]'
                }`}
              >
                <FilePlus2 className="w-4 h-4 text-[#1769FF]" />
                <span>اختيار ملف آخر</span>
              </button>

              <button
                type="button"
                onClick={handleReturnToToolKeepSettings}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                    : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#172B4D]'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة للأداة</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-[#25D366] hover:bg-[#1EBE5D] text-white transition-colors cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{isEn ? 'Report Error via WhatsApp' : 'أبلغ عن المشكلة عبر واتساب'}</span>
              </button>

              <button
                type="button"
                onClick={handleReturnToAllTools}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                    : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#687A96]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>العودة إلى الأدوات</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 4: ENGINE PENDING */}
        {activeJob.status === 'engine-pending' && (
          <div className="py-8 sm:py-10 max-w-2xl mx-auto space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Wrench className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2
                className={`text-xl sm:text-2xl font-extrabold ${
                  isDark ? 'text-white' : 'text-[#172B4D]'
                }`}
              >
                محرك المعالجة لأداة «{tool.name}» قيد الإتاحة في المرحلة القادمة
              </h2>
              <p className="text-sm leading-relaxed text-[#687A96] dark:text-slate-300">
                تم استلام الملفات ({activeJob.files.length}) والإعدادات بنجاح، ولكن محرك المعالجة المحلي المخصص لهذه الأداة لم يُفعّل بعد. نحن لا نقوم بعرض نتائج وهمية أو ملفات غير معالجة حفاظاً على مصداقية منصة فارس TOOLS.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReturnToToolKeepSettings}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-sm font-bold transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة للأداة</span>
              </button>
              <button
                type="button"
                onClick={handleReturnToAllTools}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                    : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#172B4D]'
                }`}
              >
                <span>العودة إلى الأدوات</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareData={{
          title: tool ? `${tool.name} - فارس TOOLS` : 'فارس TOOLS',
          text: tool
            ? `أنصحك بتجربة أداة ${tool.name} المجانية عبر منصة Fares Tools — معالجة سريعة وآمنة 100%! `
            : 'أدوات مجانية وسريعة لتحويل ومعالجة الملفات عبر Fares Tools',
          url: typeof window !== 'undefined' ? window.location.origin + (tool ? tool.route : '') : 'https://fares-tools.ai.studio/',
        }}
      />

      {/* WhatsApp Feedback & Bug Report Modal */}
      <WhatsAppFeedbackSection
        isModal={true}
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        initialToolName={tool?.name || ''}
        initialType="issue"
        title={
          activeJob.status === 'error'
            ? `إبلاغ عن خطأ في معالجة أداة «${tool?.name || slug}»`
            : `ملاحظات حول أداة «${tool?.name || slug}»`
        }
      />
    </div>
  );
};

