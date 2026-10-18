import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Database,
  Trash2,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePageSeo } from '../hooks/usePageSeo';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetSettings,
    favorites,
    clearFavorites,
    recentToolIds,
    clearRecentTools,
    navigate,
    lang,
    t,
  } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';

  usePageSeo({
    title: isEn ? 'Platform Settings & Preferences' : 'إعدادات المنصة والتخصيص',
    description: isEn
      ? 'Customize your Fares Tools experience: Light/Dark theme, file export quality, and local storage data preferences.'
      : 'تخصيص تجربة استخدام منصة فارس TOOLS: المظهر الفاتح/الداكن، جودة التصدير، إدارة البيانات المحفوظة، وتفضيلات العرض.',
    canonicalPath: '/settings',
    noIndex: true,
  });

  const [savedBanner, setSavedBanner] = useState(false);
  const [confirmClearFavs, setConfirmClearFavs] = useState(false);

  const triggerSavedFeedback = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  const handleClearFavsClick = () => {
    if (settings.confirmBeforeClear && !confirmClearFavs) {
      setConfirmClearFavs(true);
      setTimeout(() => setConfirmClearFavs(false), 3500);
      return;
    }
    setConfirmClearFavs(false);
    clearFavorites();
    triggerSavedFeedback();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-[#DCE7F5] dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#1769FF] text-xs font-bold">
            <Settings className="w-4 h-4" />
            <span>{isEn ? 'Customize User Experience' : 'تخصيص تجربة الاستخدام'}</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold ${
              isDark ? 'text-white' : 'text-[#172B4D]'
            }`}
          >
            {isEn ? 'Platform Settings' : 'إعدادات المنصة'}
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#687A96]'}`}>
            {isEn
              ? 'All preferences are saved automatically in your private local browser storage.'
              : 'تُحفظ جميع تفضيلاتك الشخصية تلقائياً في التخزين المحلي لمتصفحك (Local Storage).'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetSettings();
            triggerSavedFeedback();
          }}
          className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            isDark
              ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
              : 'border-[#DCE7F5] hover:bg-[#EAF3FF] text-[#172B4D]'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isEn ? 'Reset Defaults' : 'استعادة الإعدادات الافتراضية'}</span>
        </button>
      </div>

      {savedBanner && (
        <div
          role="status"
          className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{isEn ? 'Settings updated and saved successfully.' : 'تم تحديث وحفظ الإعدادات في متصفحك بنجاح.'}</span>
        </div>
      )}

      {/* 1. Theme & Appearance Card */}
      <div
        className={`rounded-2xl border p-6 space-y-6 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <div className="flex items-center gap-2 border-b pb-3 border-[#DCE7F5] dark:border-slate-800">
          <Sun className="w-5 h-5 text-[#1769FF]" />
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
            {isEn ? 'Theme & Visual Appearance' : 'المظهر والعرض البصري'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              updateSettings({ theme: 'light' });
              triggerSavedFeedback();
            }}
            className={`p-4 rounded-xl border text-start flex items-center justify-between transition-all cursor-pointer ${
              settings.theme === 'light'
                ? 'border-[#1769FF] bg-[#EAF3FF]/60 ring-2 ring-[#1769FF]/20'
                : isDark
                ? 'border-slate-800 hover:border-slate-700'
                : 'border-[#DCE7F5] hover:border-[#38A5FF]'
            }`}
          >
            <div className="space-y-1">
              <p className="text-sm font-bold">{isEn ? 'Light Mode' : 'الوضع الفاتح (Light Mode)'}</p>
              <p className="text-xs text-[#687A96]">
                {isEn ? 'Bright white & royal blue clean palette' : 'خلفية بيضاء وزرقاء مشرقة مريحة للعين'}
              </p>
            </div>
            <Sun className="w-5 h-5 text-[#1769FF] shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => {
              updateSettings({ theme: 'dark' });
              triggerSavedFeedback();
            }}
            className={`p-4 rounded-xl border text-start flex items-center justify-between transition-all cursor-pointer ${
              settings.theme === 'dark'
                ? 'border-[#38A5FF] bg-[#1769FF]/15 ring-2 ring-[#38A5FF]/20'
                : isDark
                ? 'border-slate-800 hover:border-slate-700'
                : 'border-[#DCE7F5] hover:border-[#38A5FF]'
            }`}
          >
            <div className="space-y-1">
              <p className="text-sm font-bold">{isEn ? 'Dark Mode' : 'الوضع الداكن (Dark Mode)'}</p>
              <p className="text-xs text-[#687A96]">
                {isEn ? 'Comfortable night theme for low light' : 'مظهر ليلي مريح للعين في الإضاءة المنخفضة'}
              </p>
            </div>
            <Moon className="w-5 h-5 text-[#38A5FF] shrink-0" />
          </button>
        </div>

        <label className="flex items-center justify-between gap-4 pt-2 cursor-pointer">
          <div>
            <p className="text-sm font-bold">{isEn ? 'Reduce Animations' : 'تقليل الحركات والانتقالات البصرية'}</p>
            <p className="text-xs text-[#687A96]">
              {isEn
                ? 'Disable logo animations and smooth scrolling effects (Reduced Motion).'
                : 'إيقاف حركة الشعار والتمرير السلس لراحة أكبر (Reduced Motion).'}
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => {
              updateSettings({ reducedMotion: e.target.checked });
              triggerSavedFeedback();
            }}
            className="w-5 h-5 accent-[#1769FF] rounded cursor-pointer"
          />
        </label>
      </div>

      {/* 2. Tool Processing & Export Defaults */}
      <div
        className={`rounded-2xl border p-6 space-y-6 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <div className="flex items-center gap-2 border-b pb-3 border-[#DCE7F5] dark:border-slate-800">
          <Sliders className="w-5 h-5 text-[#1769FF]" />
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
            {isEn ? 'Processing & Export Defaults' : 'خيارات المعالجة وتصدير الملفات'}
          </h2>
        </div>

        {/* Default Image Quality */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="default-quality-range"
              className="text-sm font-bold"
            >
              {isEn ? 'Default Image Compression Quality' : 'الجودة الافتراضية عند ضغط الصور'}
            </label>
            <span className="text-xs font-bold text-[#1769FF] tabular-nums">
              {settings.defaultImageQuality}%
            </span>
          </div>
          <input
            id="default-quality-range"
            type="range"
            min={30}
            max={95}
            step={5}
            value={settings.defaultImageQuality}
            onChange={(e) => {
              updateSettings({ defaultImageQuality: Number(e.target.value) });
              triggerSavedFeedback();
            }}
            className="w-full accent-[#1769FF] cursor-pointer"
          />
          <p className="text-xs text-[#687A96]">
            {isEn
              ? 'Automatically applied when opening image compression utilities (80% recommended).'
              : 'تُطبق هذه النسبة تلقائياً عند فتح أداة ضغط الصور (80% موصى بها).'}
          </p>
        </div>

        {/* Default Export Filename Prefix */}
        <div className="space-y-2 pt-3 border-t border-[#DCE7F5] dark:border-slate-800">
          <label
            htmlFor="default-export-prefix"
            className="block text-sm font-bold"
          >
            {isEn ? 'Downloaded File Prefix' : 'بادئة أسماء الملفات الناتجة عند التنزيل'}
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              id="default-export-prefix"
              type="text"
              dir="ltr"
              value={settings.defaultExportPrefix || ''}
              onChange={(e) => {
                updateSettings({ defaultExportPrefix: e.target.value });
                triggerSavedFeedback();
              }}
              placeholder="fares-tools"
              className={`w-full sm:max-w-xs rounded-xl px-3.5 py-2.5 text-sm font-en font-semibold border focus:outline-none focus:border-[#1769FF] ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
              }`}
            />
            <span className="text-xs text-[#687A96] font-en" dir="ltr">
              {isEn ? 'Example:' : 'مثال:'} {(settings.defaultExportPrefix || 'fares-tools').trim()}-result.pdf
            </span>
          </div>
          <p className="text-xs text-[#687A96]">
            {isEn
              ? 'Pre-appended automatically to names of processed PDF, image, audio, and video files.'
              : 'تُستخدم هذه البادئة تلقائياً في تسمية جميع ملفات PDF والصور والصوت والفيديو بعد معالجتها.'}
          </p>
        </div>

        {/* Auto Scroll to Workspace Toggle */}
        <label className="flex items-center justify-between gap-4 pt-3 border-t border-[#DCE7F5] dark:border-slate-800 cursor-pointer">
          <div>
            <p className="text-sm font-bold">
              {isEn ? 'Auto-scroll to options after file upload' : 'التمرير التلقائي إلى خيارات الأداة بعد اختيار الملف'}
            </p>
            <p className="text-xs text-[#687A96]">
              {isEn
                ? 'Automatically jumps down to customization options once you select your files.'
                : 'ينقلك تلقائياً إلى لوحة ضبط الإعدادات وزر «إنشاء» فور رفع الملف.'}
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.autoScrollToWorkspace}
            onChange={(e) => {
              updateSettings({ autoScrollToWorkspace: e.target.checked });
              triggerSavedFeedback();
            }}
            className="w-5 h-5 accent-[#1769FF] rounded cursor-pointer"
          />
        </label>

        {/* Confirm Before Clear Toggle */}
        <label className="flex items-center justify-between gap-4 pt-3 border-t border-[#DCE7F5] dark:border-slate-800 cursor-pointer">
          <div>
            <p className="text-sm font-bold">
              {isEn ? 'Confirm before clearing lists' : 'طلب تأكيد قبل إفراغ قائمة الملفات أو المفضلة'}
            </p>
            <p className="text-xs text-[#687A96]">
              {isEn
                ? 'Prevents accidental deletion when clicking "Clear All" or "Empty Favorites".'
                : 'يمنع الحذف غير المقصود عند الضغط على زر «إزالة الكل» أو «إفراغ المفضلة».'}
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.confirmBeforeClear}
            onChange={(e) => {
              updateSettings({ confirmBeforeClear: e.target.checked });
              triggerSavedFeedback();
            }}
            className="w-5 h-5 accent-[#1769FF] rounded cursor-pointer"
          />
        </label>
      </div>

      {/* 3. Local Data & History Management */}
      <div
        className={`rounded-2xl border p-6 space-y-5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <div className="flex items-center gap-2 border-b pb-3 border-[#DCE7F5] dark:border-slate-800">
          <Database className="w-5 h-5 text-[#1769FF]" />
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
            {isEn ? 'Local Data & History' : 'إدارة البيانات المحفوظة محلياً'}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">{isEn ? 'Favorite Tools List' : 'قائمة الأدوات المفضلة'}</p>
            <p className="text-xs text-[#687A96]">
              {isEn
                ? `You have (${favorites.length}) tools saved in favorites.`
                : `لديك حالياً (${favorites.length}) أداة محفوظة في المفضلة.`}
            </p>
          </div>
          <button
            type="button"
            disabled={favorites.length === 0}
            onClick={handleClearFavsClick}
            className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer ${
              confirmClearFavs
                ? 'bg-rose-600 text-white'
                : 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {confirmClearFavs
                ? isEn ? 'Click to confirm' : 'اضغط لتأكيد المسح'
                : isEn ? 'Clear Favorites' : 'مسح المفضلة'}
            </span>
          </button>
        </div>

        <div className="pt-3 border-t border-[#DCE7F5] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">{isEn ? 'Recent Tools History' : 'سجل الأدوات المستخدمة مؤخراً'}</p>
            <p className="text-xs text-[#687A96]">
              {isEn
                ? `History contains your last (${recentToolIds.length}) opened tools.`
                : `يحتوي السجل على آخر (${recentToolIds.length}) أدوات قمت بفتحها لتسهيل العودة إليها.`}
            </p>
          </div>
          <button
            type="button"
            disabled={recentToolIds.length === 0}
            onClick={() => {
              clearRecentTools();
              triggerSavedFeedback();
            }}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isEn ? 'Clear History' : 'مسح السجل'}</span>
          </button>
        </div>
      </div>

      {/* 4. Privacy & Telemetry Consent (User-Facing Only) */}
      <div
        className={`rounded-2xl border p-6 space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <div className="flex items-center gap-2 border-b pb-3 border-[#DCE7F5] dark:border-slate-800">
          <ShieldCheck className="w-5 h-5 text-[#1769FF]" />
          <div>
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
              {isEn ? 'Privacy & Data Preferences' : 'الخصوصية وتفضيلات القياس'}
            </h2>
            <p className="text-xs text-[#687A96] dark:text-slate-400">
              {isEn
                ? 'We strictly respect your privacy: all files remain 100% inside your browser.'
                : 'نلتزم بالخصوصية المطلقة: ملفاتك لا تُرفع لأي خادم وتُعالج بالكامل داخل متصفحك محلياً.'}
            </p>
          </div>
        </div>

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="text-sm font-bold">
              {isEn ? 'Allow Anonymous Usage Telemetry' : 'الموافقة على مشاركة إحصائيات الاستخدام المجهولة'}
            </p>
            <p className="text-xs text-[#687A96] dark:text-slate-400">
              {isEn
                ? 'Helps improve tools by tracking page views and success/failure counts without any personal or file information.'
                : 'تساعد في تحسين المنصة عبر رصد عدد الزيارات ومعدل نجاح الأدوات دون جمع أي بيانات شخصية أو أسماء ملفات إطلاقاً.'}
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.analyticsConsent || false}
            onChange={(e) => {
              updateSettings({ analyticsConsent: e.target.checked });
              triggerSavedFeedback();
            }}
            className="w-5 h-5 accent-[#1769FF] rounded cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
