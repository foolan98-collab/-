import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { UserSettings } from '../types/tools';
import { getToolBySlug } from '../data/toolsCatalog';
import { ProcessedOutput } from '../components/workspace/StatusAndResultViews';

import { Language, TranslationDictionary, AR_TRANSLATIONS, EN_TRANSLATIONS } from '../i18n/translations';
import { AdConfig, DEFAULT_AD_CONFIG, AD_CONFIG_STORAGE_KEY } from '../types/ads';
import { initGoogleAnalytics, trackToolUsageEvent } from '../utils/analytics';
import { recordToolMetric } from '../utils/toolMetrics';

export interface ProcessingJobState {
  jobId: string;
  toolSlug: string;
  toolName: string;
  files: File[];
  optionValues: Record<string, string | number | boolean>;
  status: 'processing' | 'success' | 'error' | 'cancelled' | 'engine-pending';
  progressMessage: string;
  progressPercent?: number;
  errorMessage?: string;
  output?: ProcessedOutput | null;
}

export interface ToolWorkspaceDraft {
  files: File[];
  optionValues: Record<string, string | number | boolean>;
  splitFromPage?: number;
  splitToPage?: number;
}

export function revokeProcessedOutputUrls(output?: ProcessedOutput | null) {
  if (!output) return;
  if (output.blobUrl) {
    URL.revokeObjectURL(output.blobUrl);
  }
  if (output.secondaryItems) {
    output.secondaryItems.forEach((item) => {
      if (item.blobUrl) URL.revokeObjectURL(item.blobUrl);
    });
  }
}

interface AppContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationDictionary;
  adConfig: AdConfig;
  updateAdConfig: (partial: Partial<AdConfig>) => void;
  favorites: number[];
  toggleFavorite: (toolId: number) => void;
  isFavorite: (toolId: number) => boolean;
  clearFavorites: () => void;
  recentToolIds: number[];
  recordToolUsage: (toolId: number) => void;
  clearRecentTools: () => void;
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetSettings: () => void;
  currentPath: string;
  navigate: (path: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeJob: ProcessingJobState | null;
  setActiveJob: React.Dispatch<React.SetStateAction<ProcessingJobState | null>>;
  startProcessingJob: (
    toolSlug: string,
    files: File[],
    optionValues: Record<string, string | number | boolean>
  ) => void;
  cancelProcessingJob: () => void;
  retryProcessingJob: () => void;
  clearActiveJob: () => void;
  toolDrafts: Record<string, ToolWorkspaceDraft>;
  saveToolDraft: (slug: string, draft: ToolWorkspaceDraft) => void;
  clearToolDraft: (slug: string) => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  reducedMotion: false,
  defaultImageQuality: 80,
  defaultExportPrefix: 'fares-tools',
  autoScrollToWorkspace: true,
  confirmBeforeClear: true,
  showAdPlaceholders: false,
  gaMeasurementId: '',
  analyticsConsent: false,
};

const FAVORITES_STORAGE_KEY = 'fares_tools_favorites_v1';
const RECENT_TOOLS_STORAGE_KEY = 'fares_tools_recent_v1';
const SETTINGS_STORAGE_KEY = 'fares_tools_settings_v1';
const LANG_STORAGE_KEY = 'fares_tools_lang_v1';

function applyCustomExportPrefix(
  fileName: string,
  customPrefix: string
): string {
  const cleanPrefix = (customPrefix || '').trim().replace(/[\\/:*?"<>|]/g, '-');
  if (!cleanPrefix || cleanPrefix === 'fares-tools') return fileName;
  if (fileName.startsWith('fares-tools-')) {
    return `${cleanPrefix}-${fileName.slice('fares-tools-'.length)}`;
  }
  return `${cleanPrefix}-${fileName}`;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [1, 6, 20, 27, 38, 39];
  });

  const [recentToolIds, setRecentToolIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_TOOLS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [lang, setLangState] = useState<Language>(() => {
    try {
      // 1. Detect language from URL query string if present (essential for search engine indexing)
      if (typeof window !== 'undefined') {
        const search =
          window.location.search ||
          (window.location.hash.includes('?')
            ? window.location.hash.split('?')[1]
            : '');
        const params = new URLSearchParams(search);
        const queryLang = params.get('lang');
        if (queryLang === 'en' || queryLang === 'ar') return queryLang;
      }
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en' || saved === 'ar') return saved;
    } catch {
      // ignore
    }
    return 'ar';
  });

  const [adConfig, setAdConfig] = useState<AdConfig>(() => {
    try {
      const saved = localStorage.getItem(AD_CONFIG_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_AD_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_AD_CONFIG;
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';

      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        if (newLang === 'en') {
          searchParams.set('lang', 'en');
        } else {
          searchParams.delete('lang');
        }
        const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const currentClean = window.location.pathname || '/';
        const updated = `${currentClean}${qs}`;
        try {
          window.history.replaceState(null, '', updated);
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const updateAdConfig = useCallback((partial: Partial<AdConfig>) => {
    setAdConfig((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(AD_CONFIG_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    } catch {
      // ignore
    }
  }, [lang]);

  const t = lang === 'en' ? EN_TRANSLATIONS : AR_TRANSLATIONS;

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_SETTINGS;
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    const hash = window.location.hash.replace(/^#/, '');
    if (hash && hash !== '/') return hash;
    const pathname = window.location.pathname;
    if (pathname && pathname !== '/' && pathname !== '/index.html') {
      return `${pathname}${window.location.search || ''}`;
    }
    return hash || '/';
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeJob, setActiveJob] = useState<ProcessingJobState | null>(null);
  const [toolDrafts, setToolDrafts] = useState<
    Record<string, ToolWorkspaceDraft>
  >({});

  // Track current active job ID in a ref so async callbacks only update if still current
  const currentJobIdRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(
        RECENT_TOOLS_STORAGE_KEY,
        JSON.stringify(recentToolIds)
      );
    } catch {
      // ignore
    }
  }, [recentToolIds]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    if (settings.gaMeasurementId && settings.analyticsConsent) {
      initGoogleAnalytics({
        measurementId: settings.gaMeasurementId,
        consentGranted: true,
      });
    }
  }, [settings.gaMeasurementId, settings.analyticsConsent]);

  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      let resolved = '/';
      if (hash && hash !== '/') {
        resolved = hash;
      } else {
        const pathname = window.location.pathname;
        if (pathname && pathname !== '/' && pathname !== '/index.html') {
          resolved = `${pathname}${window.location.search || ''}`;
        } else {
          resolved = hash || '/';
        }
      }

      setCurrentPath(resolved);

      // Check if lang query param was set
      const search =
        window.location.search ||
        (resolved.includes('?') ? resolved.split('?')[1] : '');
      const params = new URLSearchParams(search);
      const queryLang = params.get('lang');
      if (queryLang === 'en' || queryLang === 'ar') {
        setLangState(queryLang);
        document.documentElement.lang = queryLang;
        document.documentElement.dir = queryLang === 'ar' ? 'rtl' : 'ltr';
      }

      window.scrollTo({
        top: 0,
        behavior: settings.reducedMotion ? 'auto' : 'smooth',
      });
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [settings.reducedMotion]);

  const navigate = useCallback(
    (path: string) => {
      const normalized = path.startsWith('/') ? path : `/${path}`;
      if (typeof window !== 'undefined') {
        try {
          if (window.location.pathname !== normalized.split('?')[0]) {
            window.history.pushState(null, '', normalized);
          }
        } catch {
          // fallback
        }
        window.location.hash = normalized;
      }
      setCurrentPath(normalized);
      window.scrollTo({
        top: 0,
        behavior: settings.reducedMotion ? 'auto' : 'smooth',
      });
    },
    [settings.reducedMotion]
  );

  const recordToolUsage = useCallback((toolId: number) => {
    setRecentToolIds((prev) => {
      const filtered = prev.filter((id) => id !== toolId);
      return [toolId, ...filtered].slice(0, 8);
    });
  }, []);

  const clearRecentTools = useCallback(() => {
    setRecentToolIds([]);
  }, []);

  const executeJobAsync = useCallback(
    async (
      jobId: string,
      toolSlug: string,
      files: File[],
      optionValues: Record<string, string | number | boolean>
    ) => {
      const tool = getToolBySlug(toolSlug);
      if (!tool) {
        if (currentJobIdRef.current === jobId) {
          setActiveJob((prev) =>
            prev && prev.jobId === jobId
              ? {
                  ...prev,
                  status: 'error',
                  errorMessage: 'الأداة المطلوبة غير موجودة في النظام.',
                }
              : prev
          );
        }
        return;
      }

      const updateProgress = (msg: string, pct?: number) => {
        if (currentJobIdRef.current !== jobId) return;
        setActiveJob((prev) =>
          prev && prev.jobId === jobId && prev.status === 'processing'
            ? {
                ...prev,
                progressMessage: msg,
                progressPercent: pct,
              }
            : prev
        );
      };

      try {
        // Yield briefly to allow route transition to render the processing screen smoothly
        await new Promise((r) => setTimeout(r, 80));

        if (currentJobIdRef.current !== jobId) return;

        let result: ProcessedOutput;

        const isStandardPdfTool =
          tool.slug === 'merge-pdf' ||
          tool.slug === 'compress-pdf' ||
          tool.slug === 'split-pdf' ||
          tool.slug === 'rotate-pdf' ||
          tool.slug === 'pdf-to-jpg' ||
          tool.slug === 'delete-pdf-pages' ||
          tool.slug === 'add-pdf-page-numbers' ||
          tool.slug === 'extract-pdf-text' ||
          tool.slug === 'extract-pdf-pages' ||
          tool.slug === 'jpg-to-pdf' ||
          tool.slug === 'protect-pdf';

        const isOfficeOrAdvancedPdfTool =
          tool.slug === 'watermark-pdf' ||
          tool.slug === 'sign-pdf' ||
          tool.slug === 'pdf-to-word' ||
          tool.slug === 'pdf-to-excel' ||
          tool.slug === 'pdf-to-powerpoint' ||
          tool.slug === 'word-to-pdf' ||
          tool.slug === 'excel-to-pdf' ||
          tool.slug === 'powerpoint-to-pdf';

        if (isStandardPdfTool) {
          const pdf = await import('../utils/pdfProcessors');
          if (tool.slug === 'merge-pdf') {
            result = await pdf.processMergePdf(files, optionValues, updateProgress);
          } else if (tool.slug === 'compress-pdf') {
            result = await pdf.processCompressPdf(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'split-pdf') {
            result = await pdf.processSplitPdf(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'rotate-pdf') {
            result = await pdf.processRotatePdf(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'pdf-to-jpg') {
            result = await pdf.processPdfToJpg(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'delete-pdf-pages') {
            result = await pdf.processDeletePdfPages(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'add-pdf-page-numbers') {
            result = await pdf.processAddPdfPageNumbers(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'extract-pdf-text') {
            result = await pdf.processExtractPdfText(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'extract-pdf-pages') {
            result = await pdf.processExtractPdfPages(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'jpg-to-pdf') {
            result = await pdf.processJpgToPdf(files, optionValues, updateProgress);
          } else {
            result = await pdf.processProtectPdf(files[0], optionValues, updateProgress);
          }
        } else if (isOfficeOrAdvancedPdfTool) {
          const office = await import('../utils/officeAndAdvancedPdfProcessors');
          if (tool.slug === 'watermark-pdf') {
            result = await office.processWatermarkPdf(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'sign-pdf') {
            result = await office.processSignPdf(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'pdf-to-word') {
            result = await office.processPdfToWord(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'pdf-to-excel') {
            result = await office.processPdfToExcel(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'pdf-to-powerpoint') {
            result = await office.processPdfToPowerpoint(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'word-to-pdf') {
            result = await office.processWordToPdf(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'excel-to-pdf') {
            result = await office.processExcelToPdf(files[0], optionValues, updateProgress);
          } else {
            result = await office.processPowerpointToPdf(files[0], optionValues, updateProgress);
          }
        } else if (tool.category === 'images' && tool.inputType === 'file') {
          updateProgress('جارٍ معالجة الصورة محلياً...', 40);
          const browser = await import('../utils/browserProcessors');
          result = await browser.processImageTool(tool.slug, files[0], optionValues);
        } else if (
          tool.slug === 'trim-audio' ||
          tool.slug === 'video-to-mp3' ||
          tool.slug === 'enhance-audio' ||
          tool.slug === 'merge-audio' ||
          tool.slug === 'video-to-gif' ||
          tool.slug === 'compress-video' ||
          tool.slug === 'convert-video-format' ||
          tool.slug === 'resize-video' ||
          tool.slug === 'trim-video' ||
          tool.slug === 'merge-videos'
        ) {
          const browser = await import('../utils/browserProcessors');
          if (tool.slug === 'trim-audio') {
            updateProgress('جارٍ قص المقطع الصوتي محلياً...', 45);
            result = await browser.processAudioTrim(files[0], optionValues);
          } else if (tool.slug === 'video-to-mp3') {
            result = await browser.processVideoToAudio(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'enhance-audio') {
            result = await browser.processEnhanceAudio(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'merge-audio') {
            result = await browser.processMergeAudio(files, optionValues, updateProgress);
          } else if (tool.slug === 'video-to-gif') {
            result = await browser.processVideoToGif(files[0], optionValues, updateProgress);
          } else if (tool.slug === 'merge-videos') {
            result = await browser.processMergeVideos(files, optionValues, updateProgress);
          } else {
            result = await browser.processBrowserVideoTool(tool.slug, files[0], optionValues, updateProgress);
          }
        } else {
          if (currentJobIdRef.current === jobId) {
            setActiveJob((prev) =>
              prev && prev.jobId === jobId
                ? { ...prev, status: 'engine-pending' }
                : prev
            );
          }
          return;
        }

        // Apply user's preferred filename prefix from settings
        const prefixedResult: ProcessedOutput = {
          ...result,
          fileName: applyCustomExportPrefix(
            result.fileName,
            settings.defaultExportPrefix
          ),
        };

        if (currentJobIdRef.current === jobId) {
          recordToolMetric(tool.slug, 'success');
          trackToolUsageEvent({
            toolSlug: tool.slug,
            toolName: lang === 'en' ? tool.nameEn || tool.name : tool.name,
            lang,
            status: 'success',
          });

          setActiveJob((prev) => {
            if (!prev || prev.jobId !== jobId || prev.status === 'cancelled') {
              revokeProcessedOutputUrls(prefixedResult);
              return prev;
            }
            if (prev.output && prev.output !== prefixedResult) {
              revokeProcessedOutputUrls(prev.output);
            }
            return {
              ...prev,
              status: 'success',
              progressMessage: 'تم إنشاء الملف بنجاح',
              progressPercent: 100,
              output: prefixedResult,
            };
          });
        } else {
          revokeProcessedOutputUrls(prefixedResult);
        }
      } catch (err) {
        if (currentJobIdRef.current === jobId) {
          recordToolMetric(tool.slug, 'fail');
          trackToolUsageEvent({
            toolSlug: tool.slug,
            toolName: lang === 'en' ? tool.nameEn || tool.name : tool.name,
            lang,
            status: 'fail',
          });

          const msg =
            err instanceof Error
              ? err.message
              : 'حدث خطأ غير متوقع أثناء معالجة الملف.';
          setActiveJob((prev) =>
            prev && prev.jobId === jobId && prev.status !== 'cancelled'
              ? {
                  ...prev,
                  status: 'error',
                  errorMessage: msg,
                }
              : prev
          );
        }
      }
    },
    [settings.defaultExportPrefix, lang]
  );

  const startProcessingJob = useCallback(
    (
      toolSlug: string,
      files: File[],
      optionValues: Record<string, string | number | boolean>
    ) => {
      const tool = getToolBySlug(toolSlug);

      // Prevent launching empty jobs for file-based tools
      if (tool && tool.inputType === 'file' && (!files || files.length === 0)) {
        return;
      }

      // Prevent duplicate submissions while a job for the same tool is actively processing
      if (
        activeJob &&
        activeJob.toolSlug === toolSlug &&
        activeJob.status === 'processing' &&
        currentJobIdRef.current === activeJob.jobId
      ) {
        return;
      }

      if (tool) {
        recordToolUsage(tool.id);
      }

      recordToolMetric(toolSlug, 'start');
      trackToolUsageEvent({
        toolSlug,
        toolName: tool ? (lang === 'en' ? tool.nameEn || tool.name : tool.name) : toolSlug,
        lang,
        status: 'start',
      });

      const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      currentJobIdRef.current = jobId;

      setActiveJob((prev) => {
        if (prev?.output) {
          revokeProcessedOutputUrls(prev.output);
        }
        return {
          jobId,
          toolSlug,
          toolName: tool?.name || toolSlug,
          files,
          optionValues,
          status: 'processing',
          progressMessage: 'جارٍ تجهيز ملفاتك...',
          progressPercent: undefined,
          output: null,
        };
      });

      navigate(`/tools/${toolSlug}/process`);
      void executeJobAsync(jobId, toolSlug, files, optionValues);
    },
    [activeJob, navigate, executeJobAsync, recordToolUsage, lang]
  );

  const cancelProcessingJob = useCallback(() => {
    currentJobIdRef.current = null;
    setActiveJob((prev) => {
      if (!prev) return null;
      if (prev.output) {
        revokeProcessedOutputUrls(prev.output);
      }
      return {
        ...prev,
        status: 'cancelled',
        progressMessage: 'تم إلغاء المعالجة بناءً على طلبك.',
        output: null,
      };
    });
  }, []);

  const retryProcessingJob = useCallback(() => {
    if (!activeJob) return;
    const { toolSlug, files, optionValues } = activeJob;
    // Clear current ref first so startProcessingJob won't treat it as a duplicate
    currentJobIdRef.current = null;
    const tool = getToolBySlug(toolSlug);
    const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    currentJobIdRef.current = jobId;

    recordToolMetric(toolSlug, 'start');
    trackToolUsageEvent({
      toolSlug,
      toolName: tool ? (lang === 'en' ? tool.nameEn || tool.name : tool.name) : toolSlug,
      lang,
      status: 'start',
    });

    setActiveJob((prev) => {
      if (prev?.output) {
        revokeProcessedOutputUrls(prev.output);
      }
      return {
        jobId,
        toolSlug,
        toolName: tool?.name || toolSlug,
        files,
        optionValues,
        status: 'processing',
        progressMessage: 'جارٍ إعادة تجهيز ملفاتك...',
        progressPercent: undefined,
        output: null,
      };
    });

    navigate(`/tools/${toolSlug}/process`);
    void executeJobAsync(jobId, toolSlug, files, optionValues);
  }, [activeJob, navigate, executeJobAsync]);

  const clearActiveJob = useCallback(() => {
    currentJobIdRef.current = null;
    setActiveJob((prev) => {
      if (prev?.output) {
        revokeProcessedOutputUrls(prev.output);
      }
      return null;
    });
  }, []);

  const saveToolDraft = useCallback(
    (slug: string, draft: ToolWorkspaceDraft) => {
      setToolDrafts((prev) => ({ ...prev, [slug]: draft }));
    },
    []
  );

  const clearToolDraft = useCallback((slug: string) => {
    setToolDrafts((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  }, []);

  const toggleFavorite = (toolId: number) => {
    setFavorites((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
    );
  };

  const isFavorite = (toolId: number) => favorites.includes(toolId);

  const clearFavorites = () => setFavorites([]);

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        adConfig,
        updateAdConfig,
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites,
        recentToolIds,
        recordToolUsage,
        clearRecentTools,
        settings,
        updateSettings,
        resetSettings,
        currentPath,
        navigate,
        searchQuery,
        setSearchQuery,
        activeJob,
        setActiveJob,
        startProcessingJob,
        cancelProcessingJob,
        retryProcessingJob,
        clearActiveJob,
        toolDrafts,
        saveToolDraft,
        clearToolDraft,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}



