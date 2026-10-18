import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Heart,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Shield,
  AlertCircle,
  Check,
  Loader2,
  LayoutGrid,
  Share2,
  MessageCircle,
} from 'lucide-react';
import {
  getToolBySlug,
  CATEGORIES,
  getToolsByCategory,
} from '../data/toolsCatalog';
import { SocialShareModal } from '../components/SocialShareModal';
import { WhatsAppFeedbackSection } from '../components/WhatsAppFeedbackSection';
import { ToolIcon } from '../components/ToolIcon';
import { ToolCard } from '../components/ToolCard';
import { FileUploadDropzone } from '../components/workspace/FileUploadDropzone';
import {
  ToolOptionsPanel,
  SplitRangeSelector,
} from '../components/workspace/ToolOptionsPanel';
import { parsePageSelectionString } from '../utils/pdfPageParser';
import { getToolColorPalette } from '../utils/toolColors';
import { AdSlot } from '../components/AdSlot';
import { useApp } from '../context/AppContext';
import { usePageSeo } from '../hooks/usePageSeo';

import { ArabicWritingWorkspace } from '../components/workspace/ArabicWritingWorkspace';
import { ZakatCalculatorWorkspace } from '../components/workspace/ZakatCalculatorWorkspace';
import { QrGeneratorWorkspace } from '../components/workspace/QrGeneratorWorkspace';
import { WatermarkRemoverWorkspace } from '../components/workspace/WatermarkRemoverWorkspace';

interface ToolDetailPageProps {
  slug: string;
}

export const ToolDetailPage: React.FC<ToolDetailPageProps> = ({ slug }) => {
  const {
    navigate,
    isFavorite,
    toggleFavorite,
    settings,
    activeJob,
    startProcessingJob,
    recordToolUsage,
    toolDrafts,
    saveToolDraft,
    clearToolDraft,
    lang,
    t,
  } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';

  const tool = getToolBySlug(slug);
  const palette = tool ? getToolColorPalette(tool.slug, tool.category) : null;

  usePageSeo({
    title: tool ? `${tool.name} أونلاين مجاناً` : 'الأداة غير موجودة',
    description: tool
      ? tool.fullDesc
      : 'أداة معالجة رقمية ضمن منصة فارس TOOLS العربية.',
    canonicalPath: tool ? tool.route : `/tools/${slug}`,
    jsonLd: tool
      ? {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: `${tool.name} - فارس TOOLS`,
          description: tool.fullDesc,
          url: `https://fares-tools.com${tool.route}`,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'All',
          inLanguage: 'ar',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        }
      : null,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [fileMetaBadges, setFileMetaBadges] = useState<Record<string, string>>(
    {}
  );
  const [pdfPageCount, setPdfPageCount] = useState<number>(1);
  const [splitFromPage, setSplitFromPage] = useState<number>(1);
  const [splitToPage, setSplitToPage] = useState<number>(1);
  const [optionValues, setOptionValues] = useState<
    Record<string, string | number | boolean>
  >({});
  const [validationError, setValidationError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmittingJob, setIsSubmittingJob] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const optionsPanelRef = useRef<HTMLDivElement | null>(null);

  // Release submission lock whenever tool route, files, or activeJob status changes
  useEffect(() => {
    if (activeJob?.status !== 'processing') {
      setIsSubmittingJob(false);
    }
  }, [slug, files, activeJob?.status]);

  // Restore saved draft (if returning from processing page) or initialize defaults when changing tool route
  useEffect(() => {
    setValidationError('');
    setFieldErrors({});
    setFileMetaBadges({});
    setIsSubmittingJob(false);
    if (tool) {
      recordToolUsage(tool.id);
    }

    const existingDraft = toolDrafts[slug];
    if (existingDraft && existingDraft.files.length > 0) {
      setFiles(existingDraft.files);
      setOptionValues(existingDraft.optionValues);
      if (existingDraft.splitFromPage !== undefined) {
        setSplitFromPage(existingDraft.splitFromPage);
      }
      if (existingDraft.splitToPage !== undefined) {
        setSplitToPage(existingDraft.splitToPage);
      }
      return;
    }

    setFiles([]);
    setPdfPageCount(1);
    setSplitFromPage(1);
    setSplitToPage(1);

    if (tool?.optionsSchema) {
      const defaults: Record<string, string | number | boolean> = {};
      tool.optionsSchema.forEach((f) => {
        defaults[f.id] = f.defaultValue;
      });
      if (tool.slug === 'compress-images') {
        defaults.quality = settings.defaultImageQuality;
      }
      setOptionValues(defaults);
    } else {
      setOptionValues({});
    }
  }, [slug, tool, settings.defaultImageQuality]);

  // Automatically inspect PDF page counts when PDF files are selected
  useEffect(() => {
    let cancelled = false;
    if (!tool || !tool.acceptedFormats?.includes('.pdf') || files.length === 0) {
      setFileMetaBadges({});
      setPdfPageCount(1);
      return;
    }

    (async () => {
      const nextBadges: Record<string, string> = {};
      let firstFileCount = 1;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        try {
          const { inspectPdfPageCount } = await import('../utils/pdfProcessors');
          const count = await inspectPdfPageCount(file);
          nextBadges[key] = `${count} ${count === 1 ? 'صفحة' : 'صفحات'}`;
          if (i === 0) {
            firstFileCount = count;
          }
        } catch (err) {
          nextBadges[key] = 'ملف غير صالح';
          if (!cancelled && err instanceof Error) {
            setValidationError(err.message);
          }
        }
      }

      if (!cancelled) {
        setFileMetaBadges(nextBadges);
        setPdfPageCount(firstFileCount);

        // Initialize or clamp Split PDF range bounds to [1..firstFileCount]
        const existingDraft = toolDrafts[slug];
        if (
          existingDraft &&
          existingDraft.files[0]?.name === files[0]?.name &&
          existingDraft.splitFromPage !== undefined &&
          existingDraft.splitToPage !== undefined
        ) {
          const clampedFrom = Math.max(
            1,
            Math.min(firstFileCount, existingDraft.splitFromPage)
          );
          const clampedTo = Math.max(
            clampedFrom,
            Math.min(firstFileCount, existingDraft.splitToPage)
          );
          setSplitFromPage(clampedFrom);
          setSplitToPage(clampedTo);
        } else {
          setSplitFromPage(1);
          setSplitToPage(firstFileCount);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [files, tool, slug]);

  if (!tool) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-extrabold">الأداة المطلوبة غير موجودة</h1>
        <p className="text-sm text-slate-500">
          تأكد من صحة الرابط أو تصفح قائمة الأدوات الكاملة.
        </p>
        <button
          type="button"
          onClick={() => navigate('/all-tools')}
          className="px-6 py-3 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-sm font-bold transition-colors"
        >
          العودة إلى جميع الأدوات
        </button>
      </div>
    );
  }

  const cat = CATEGORIES[tool.category];
  const fav = isFavorite(tool.id);
  const relatedTools = getToolsByCategory(tool.category)
    .filter((t) => t.id !== tool.id)
    .slice(0, 4);

  // Filter conditional options so users only see custom page inputs when relevant
  const visibleSchema = (tool.optionsSchema || []).filter((field) => {
    if (
      tool.slug === 'rotate-pdf' &&
      field.id === 'customPageRange' &&
      optionValues.targetPages !== 'custom'
    ) {
      return false;
    }
    if (
      tool.slug === 'pdf-to-jpg' &&
      field.id === 'customPages' &&
      optionValues.pageSelectionMode !== 'custom'
    ) {
      return false;
    }
    return true;
  });

  const handleOptionChange = (id: string, val: string | number | boolean) => {
    setValidationError('');
    setFieldErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setOptionValues((prev) => ({ ...prev, [id]: val }));
  };

  const handleResetWorkspace = () => {
    setFiles([]);
    setFileMetaBadges({});
    setValidationError('');
    setFieldErrors({});
    clearToolDraft(tool.slug);
  };

  const handleStartProcessingJob = () => {
    if (
      isSubmittingJob ||
      (activeJob?.toolSlug === tool.slug && activeJob?.status === 'processing')
    ) {
      return;
    }

    setValidationError('');
    setFieldErrors({});

    if (tool.inputType === 'file' && files.length === 0) {
      setValidationError('يرجى اختيار ملف واحد على الأقل قبل الضغط على «إنشاء».');
      return;
    }

    if (tool.slug === 'merge-pdf' && files.length < 2) {
      setValidationError(
        'تتطلب أداة دمج ملفات PDF اختيار ملفين (2) على الأقل لإجراء الدمج.'
      );
      return;
    }

    if (tool.slug === 'merge-audio' && files.length < 2) {
      setValidationError(
        'تتطلب أداة دمج الملفات الصوتية اختيار ملفين صوتيين (2) على الأقل لإجراء الدمج.'
      );
      return;
    }

    if (tool.slug === 'merge-videos' && files.length < 2) {
      setValidationError(
        'تتطلب أداة دمج الفيديوهات اختيار مقطعي فيديو (2) على الأقل لإجراء الدمج.'
      );
      return;
    }

    if (tool.slug === 'watermark-pdf') {
      const txt = String(optionValues.watermarkText || '').trim();
      if (!txt) {
        setFieldErrors({
          watermarkText: 'يرجى كتابة نص العلامة المائية قبل بدء المعالجة.',
        });
        return;
      }
    }

    if (tool.slug === 'sign-pdf') {
      const signer = String(optionValues.signerName || '').trim();
      if (!signer) {
        setFieldErrors({
          signerName: 'يرجى كتابة اسم الموقّع أو النص الرسمي للتوقيع.',
        });
        return;
      }
    }

    // Validate Split PDF page range when not splitting every single page
    if (tool.slug === 'split-pdf' && optionValues.splitMode !== 'everyPage') {
      if (
        !Number.isInteger(splitFromPage) ||
        !Number.isInteger(splitToPage) ||
        splitFromPage < 1 ||
        splitToPage < 1 ||
        splitFromPage > pdfPageCount ||
        splitToPage > pdfPageCount
      ) {
        setValidationError(
          `يرجى تحديد نطاق صفحات صالح بين 1 و ${pdfPageCount}.`
        );
        return;
      }
      if (splitFromPage > splitToPage) {
        setValidationError(
          'رقم «من صفحة» لا يمكن أن يكون أكبر من رقم «إلى صفحة».'
        );
        return;
      }
    }

    // Validate Delete PDF Pages
    if (tool.slug === 'delete-pdf-pages' && pdfPageCount > 0) {
      if (pdfPageCount <= 1) {
        setValidationError(
          'هذا المستند يحتوي على صفحة واحدة فقط، ولا يمكن حذف جميع صفحات ملف PDF.'
        );
        return;
      }
      try {
        const parsed = parsePageSelectionString(
          String(optionValues.pagesToDelete || ''),
          pdfPageCount
        );
        if (parsed.pages.length >= pdfPageCount) {
          setFieldErrors({
            pagesToDelete: `لا يمكن حذف جميع صفحات المستند (${pdfPageCount} صفحة). يرجى الإبقاء على صفحة واحدة على الأقل.`,
          });
          return;
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'أرقام الصفحات غير صالحة.';
        setFieldErrors({ pagesToDelete: msg });
        return;
      }
    }

    // Validate Extract PDF Pages
    if (tool.slug === 'extract-pdf-pages' && pdfPageCount > 0) {
      try {
        parsePageSelectionString(
          String(optionValues.pagesToExtract || ''),
          pdfPageCount
        );
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'أرقام الصفحات غير صالحة.';
        setFieldErrors({ pagesToExtract: msg });
        return;
      }
    }

    // Validate Protect PDF password & confirmation match
    if (tool.slug === 'protect-pdf') {
      const pwd = String(optionValues.password || '');
      const confirmPwd = String(optionValues.confirmPassword || '');
      if (!pwd.trim()) {
        setFieldErrors({
          password: 'يرجى إدخال كلمة المرور المطلوبة لتأمين الملف.',
        });
        return;
      }
      if (pwd.length < 4) {
        setFieldErrors({
          password: 'يجب أن تتكون كلمة المرور من 4 أحرف أو أرقام على الأقل.',
        });
        return;
      }
      if (pwd !== confirmPwd) {
        setFieldErrors({
          confirmPassword:
            'كلمتا المرور غير متطابقتين. يرجى التأكد من كتابة نفس كلمة المرور في الحقلين.',
        });
        return;
      }
    }

    // Pre-validate custom page ranges for Rotate PDF & PDF to JPG before leaving the page
    if (
      tool.slug === 'rotate-pdf' &&
      optionValues.targetPages === 'custom' &&
      pdfPageCount > 0
    ) {
      try {
        parsePageSelectionString(
          String(optionValues.customPageRange || ''),
          pdfPageCount
        );
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'أرقام الصفحات غير صالحة.';
        setFieldErrors({ customPageRange: msg });
        return;
      }
    }

    if (
      tool.slug === 'pdf-to-jpg' &&
      optionValues.pageSelectionMode === 'custom' &&
      pdfPageCount > 0
    ) {
      try {
        parsePageSelectionString(
          String(optionValues.customPages || ''),
          pdfPageCount
        );
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'أرقام الصفحات غير صالحة.';
        setFieldErrors({ customPages: msg });
        return;
      }
    }

    const finalOptions: Record<string, string | number | boolean> = {
      ...optionValues,
    };

    if (tool.slug === 'split-pdf') {
      finalOptions.fromPage = splitFromPage;
      finalOptions.toPage = splitToPage;
      finalOptions.pageRange =
        splitFromPage === splitToPage
          ? `${splitFromPage}`
          : `${splitFromPage}-${splitToPage}`;
    }

    // Save draft so "العودة للأداة" preserves files & settings
    saveToolDraft(tool.slug, {
      files,
      optionValues: finalOptions,
      splitFromPage,
      splitToPage,
    });

    setIsSubmittingJob(true);
    try {
      // Launch processing job in AppContext and navigate to dedicated processing page
      startProcessingJob(tool.slug, files, finalOptions);
    } finally {
      setTimeout(() => {
        setIsSubmittingJob(false);
      }, 600);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 animate-fade-in-up">
      {/* Top Breadcrumb & Favorite Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#687A96]">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1 hover:text-[#1769FF] font-semibold transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            onClick={() => navigate(`/all-tools?category=${tool.category}`)}
            className="hover:text-[#1769FF] transition-colors cursor-pointer"
          >
            {cat.name}
          </button>
          <span aria-hidden="true">/</span>
          <span className="font-bold text-[#1769FF]">{tool.name}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Share Tool Button */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer shadow-xs ${
              isDark
                ? 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                : 'border-[#DCE7F5] bg-white text-[#172B4D] hover:bg-[#F5F9FF]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-[#1769FF]" />
            <span>{isEn ? 'Share Tool' : 'مشاركة الأداة'}</span>
          </button>

          {/* Report Issue / Suggest Feature via WhatsApp Button */}
          <button
            type="button"
            onClick={() => setIsFeedbackModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer shadow-xs ${
              isDark
                ? 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                : 'border-[#DCE7F5] bg-white text-[#172B4D] hover:bg-[#F5F9FF]'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>{isEn ? 'Report Issue' : 'أبلغ عن مشكلة'}</span>
          </button>

          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={() => toggleFavorite(tool.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              fav
                ? 'border-[#1769FF] bg-[#EAF3FF] text-[#1769FF] dark:bg-[#1769FF]/20 dark:text-[#38A5FF]'
                : isDark
                ? 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                : 'border-[#DCE7F5] bg-white text-[#172B4D] hover:bg-[#F5F9FF]'
            }`}
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
            <span>{fav ? 'محفوظة في المفضلة' : 'إضافة إلى المفضلة'}</span>
          </button>
        </div>
      </div>

      {/* Tool Header Banner */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
          isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-[#DCE7F5] shadow-[0_4px_20px_rgba(23,105,255,0.05)]'
        }`}
      >
        {palette && (
          <span
            className="absolute top-0 right-0 left-0 h-1.5"
            style={{ backgroundColor: palette.accentHex }}
            aria-hidden="true"
          />
        )}

        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 ${
              palette
                ? isDark
                  ? `${palette.iconBgDark} ${palette.iconTextDark}`
                  : `${palette.iconBgLight} ${palette.iconTextLight}`
                : 'bg-[#EAF3FF] text-[#1769FF]'
            }`}
          >
            <ToolIcon name={tool.iconName} className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#687A96]">
              <span>أداة #{tool.id}</span>
              <span aria-hidden="true">·</span>
              <span>{palette?.groupLabel || cat.name}</span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  tool.status === 'ready'
                    ? 'text-[#1769FF] dark:text-[#38A5FF] font-semibold'
                    : 'text-[#687A96] font-semibold'
                }
              >
                {tool.status === 'ready'
                  ? 'محرك المتصفح جاهز للعمل'
                  : 'محرك المعالجة قيد الإتاحة'}
              </span>
            </div>

            <h1
              className={`text-2xl sm:text-3xl font-extrabold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              {tool.name}
            </h1>

            <p
              className={`text-sm sm:text-base leading-relaxed max-w-2xl ${
                isDark ? 'text-slate-300' : 'text-[#687A96]'
              }`}
            >
              {tool.fullDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tool Interactive Workspace */}
      <div className="space-y-6">
        <React.Suspense
          fallback={
            <div
              className={`rounded-2xl border p-8 text-center text-sm font-bold animate-pulse ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-400'
                  : 'bg-white border-[#DCE7F5] text-[#687A96]'
              }`}
            >
              {isEn ? 'Loading workspace...' : 'جارٍ تهيئة مساحة العمل...'}
            </div>
          }
        >
          {tool.inputType === 'text' && <ArabicWritingWorkspace />}
          {tool.inputType === 'calculator' && <ZakatCalculatorWorkspace />}
          {tool.inputType === 'qr' && <QrGeneratorWorkspace />}
          {tool.slug === 'remove-watermark' && (
            <WatermarkRemoverWorkspace tool={tool} />
          )}
        </React.Suspense>

        {tool.inputType === 'file' && tool.slug !== 'remove-watermark' && (
          <div className="space-y-6">
            {/* Clear 4-Step Visual Workflow Stepper */}
            <div
              aria-label="خطوات استخدام الأداة"
              className={`rounded-2xl border p-4 sm:px-6 ${
                isDark
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-[#DCE7F5] shadow-[0_2px_12px_rgba(23,105,255,0.04)]'
              }`}
            >
              <ol className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                <li
                  className={`flex items-center gap-2.5 ${
                    files.length > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-[#1769FF] dark:text-[#38A5FF]'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 tabular-nums ${
                      files.length > 0
                        ? 'bg-emerald-500/15'
                        : 'bg-[#1769FF] text-white'
                    }`}
                  >
                    {files.length > 0 ? <Check className="w-3.5 h-3.5" /> : '1'}
                  </span>
                  <span>1. اختيار الملف</span>
                </li>

                <li
                  className={`flex items-center gap-2.5 ${
                    files.length > 0
                      ? 'text-[#1769FF] dark:text-[#38A5FF]'
                      : 'text-[#687A96] opacity-60'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 tabular-nums ${
                      files.length > 0
                        ? 'bg-[#1769FF] text-white'
                        : isDark
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-[#EAF3FF] text-[#687A96]'
                    }`}
                  >
                    2
                  </span>
                  <span>2. ضبط الخيارات</span>
                </li>

                <li className="flex items-center gap-2.5 text-[#687A96] opacity-65">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 tabular-nums ${
                      isDark
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-[#EAF3FF] text-[#687A96]'
                    }`}
                  >
                    3
                  </span>
                  <span>3. بدء المعالجة</span>
                </li>

                <li className="flex items-center gap-2.5 text-[#687A96] opacity-65">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 tabular-nums ${
                      isDark
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

            {/* Step 1: Upload / Dropzone */}
            <FileUploadDropzone
              files={files}
              onFilesChange={(newFiles) => {
                const hadNoFiles = files.length === 0;
                setFiles(newFiles);
                setValidationError('');
                setFieldErrors({});
                if (
                  hadNoFiles &&
                  newFiles.length > 0 &&
                  settings.autoScrollToWorkspace
                ) {
                  setTimeout(() => {
                    optionsPanelRef.current?.scrollIntoView({
                      behavior: settings.reducedMotion ? 'auto' : 'smooth',
                      block: 'nearest',
                    });
                  }, 120);
                }
              }}
              acceptedFormats={tool.acceptedFormats}
              acceptMime={tool.acceptMime}
              multiple={tool.multipleFiles}
              allowReorder={
                tool.slug === 'merge-pdf' ||
                tool.slug === 'jpg-to-pdf' ||
                tool.slug === 'merge-audio' ||
                tool.slug === 'merge-videos'
              }
              fileMetaBadges={fileMetaBadges}
              onValidationError={(msg) => {
                setValidationError(msg);
              }}
            />

            {/* Step 2: Tool Configuration Options & Dedicated Split Range Selector */}
            {files.length > 0 && (
              <div ref={optionsPanelRef}>
                <ToolOptionsPanel
                  schema={visibleSchema}
                  values={optionValues}
                  onChange={handleOptionChange}
                  fieldErrors={fieldErrors}
                  extraTopSlot={
                    tool.slug === 'split-pdf' &&
                    optionValues.splitMode !== 'everyPage' ? (
                      <SplitRangeSelector
                        totalPages={pdfPageCount}
                        fromPage={splitFromPage}
                        toPage={splitToPage}
                        onRangeChange={(from, to) => {
                          setValidationError('');
                          setSplitFromPage(from);
                          setSplitToPage(to);
                        }}
                      />
                    ) : undefined
                  }
                />
              </div>
            )}

            {/* Inline Validation Alert (if any) */}
            {validationError && (
              <div
                role="alert"
                className={`rounded-2xl border p-4 flex items-center gap-3 text-xs sm:text-sm font-bold ${
                  isDark
                    ? 'bg-rose-950/35 border-rose-800/70 text-rose-200'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Step 3: Action Bar with Prominent "إنشاء" Button */}
            {files.length > 0 && (
              <div
                className={`rounded-2xl border p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 ${
                  isDark
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-[#DCE7F5] shadow-[0_4px_20px_rgba(23,105,255,0.04)]'
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#687A96]">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span>
                    جاهز للمعالجة الفورية ({files.length}{' '}
                    {files.length === 1 ? 'ملف' : 'ملفات'}) — جميع الملفات تُعالج محلياً داخل متصفحك
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/all-tools')}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                        : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#687A96]'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>العودة للأدوات</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetWorkspace}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                        : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#687A96]'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>اختيار ملف آخر</span>
                  </button>

                  <button
                    type="button"
                    disabled={
                      isSubmittingJob ||
                      (activeJob?.toolSlug === tool.slug &&
                        activeJob?.status === 'processing')
                    }
                    onClick={handleStartProcessingJob}
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm sm:text-base shadow-[0_8px_20px_rgba(23,105,255,0.25)] hover:shadow-[0_10px_24px_rgba(23,105,255,0.35)] transition-all cursor-pointer"
                  >
                    {isSubmittingJob ||
                    (activeJob?.toolSlug === tool.slug &&
                      activeJob?.status === 'processing') ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جارٍ البدء...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>إنشاء</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* How to Use Steps Section */}
      <div
        className={`rounded-2xl border p-6 sm:p-8 space-y-5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <h2
          className={`text-lg font-bold flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-[#172B4D]'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-[#1769FF]" />
          <span>كيفية استخدام أداة {tool.name} في 3 خطوات</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tool.steps.map((stepText, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-4 border ${
                isDark
                  ? 'bg-slate-950/60 border-slate-800'
                  : 'bg-[#F5F9FF] border-[#DCE7F5]'
              }`}
            >
              <div className="text-xs font-extrabold text-[#1769FF] mb-1.5 tabular-nums">
                الخطوة 0{idx + 1}
              </div>
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-[#172B4D]'
                }`}
              >
                {stepText}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tool Share & Feedback Banner */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-[#F5F9FF] border-[#DCE7F5]'
        }`}
      >
        <div className="space-y-1 text-center sm:text-start">
          <h3 className="text-sm font-extrabold text-[#172B4D] dark:text-white">
            {isEn ? `Enjoying the ${tool.name} tool?` : `هل أعجبتك أداة «${tool.name}»؟`}
          </h3>
          <p className="text-xs text-[#687A96] dark:text-slate-400">
            {isEn
              ? 'Share it with your colleagues or contact the owner on WhatsApp to suggest a feature or report a bug.'
              : 'شاركها مع زملائك أو تواصل مع صاحب الموقع مباشرة عبر واتساب إذا كانت لديك رغبة في إضافة ميزة أو الإبلاغ عن مشكلة.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isEn ? 'Share Tool' : 'شارك هذه الأداة'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFeedbackModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>{isEn ? 'Contact on WhatsApp' : 'تواصل عبر واتساب'}</span>
          </button>
        </div>
      </div>

      {/* Non-intrusive AdSlot placed safely below the guide and above related tools */}
      <AdSlot placement="tool-detail-footer" format="horizontal" />

      {/* Related Tools in the Same Category */}
      {relatedTools.length > 0 && (
        <div className="space-y-5 pt-4">
          <div className="flex items-center justify-between">
            <h2
              className={`text-xl font-extrabold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              أدوات أخرى ضمن {cat.name}
            </h2>
            <button
              type="button"
              onClick={() => navigate(`/all-tools?category=${tool.category}`)}
              className="text-xs font-bold text-[#1769FF] hover:underline cursor-pointer"
            >
              عرض القسم بالكامل
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedTools.map((rel) => (
              <ToolCard key={rel.id} tool={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Social Share Modal for this Tool */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareData={{
          title: `${tool.name} - فارس TOOLS`,
          text: `أنصحك بتجربة أداة ${tool.name} المجانية عبر منصة Fares Tools — معالجة سريعة وآمنة 100% بدون رفع الملفات!`,
          url: typeof window !== 'undefined' ? window.location.href : `https://fares-tools.ai.studio${tool.route}`,
        }}
      />

      {/* WhatsApp Feedback & Bug Report Modal for this Tool */}
      <WhatsAppFeedbackSection
        isModal={true}
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        initialToolName={tool.name}
        initialType="issue"
        title={`ملاحظات أو بلاغ حول أداة «${tool.name}»`}
      />
    </div>
  );
};

