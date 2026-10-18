import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, CheckCircle, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useApp } from '../context/AppContext';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'mobile-drawer' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { lang, settings } = useApp();
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  const isEn = lang === 'en';
  const isDark = settings.theme === 'dark';

  // 1. If already installed as a standalone PWA, never show the button
  if (isInstalled) {
    return null;
  }

  // 2. Handlers
  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // 3. Chromium / Android / Windows / macOS Desktop (via beforeinstallprompt)
  if (isInstallable) {
    if (variant === 'mobile-drawer') {
      return (
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-bold text-sm text-white bg-[#1769FF] hover:bg-[#0755E9] active:scale-[0.99] transition-all shadow-md shadow-[#1769FF]/20 cursor-pointer ${className}`}
          aria-label={isEn ? 'Install Fares Tools' : 'تثبيت Fares Tools'}
        >
          <Download className="w-4 h-4 animate-bounce shrink-0" />
          <span>{isEn ? 'Install Fares Tools' : 'تثبيت Fares Tools'}</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl font-bold text-xs text-white bg-[#1769FF] hover:bg-[#0755E9] active:scale-95 transition-all shadow-sm shadow-[#1769FF]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] cursor-pointer whitespace-nowrap shrink-0 ${className}`}
        aria-label={isEn ? 'Install Fares Tools' : 'تثبيت Fares Tools'}
        title={isEn ? 'Install Fares Tools on your device' : 'تثبيت Fares Tools كتطبيق مستقل على جهازك'}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">{isEn ? 'Install Fares Tools' : 'تثبيت Fares Tools'}</span>
        <span className="sm:hidden">{isEn ? 'تثبيت' : 'Install'}</span>
      </button>
    );
  }

  // 4. iOS Safari Guide Flow (iPhone / iPad)
  if (isIOS) {
    return (
      <>
        {variant === 'mobile-drawer' ? (
          <button
            type="button"
            onClick={() => setShowIOSModal(true)}
            className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
              isDark
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'
                : 'border-[#1769FF]/30 bg-[#EAF3FF] text-[#1769FF] hover:bg-[#D5E7FF]'
            } ${className}`}
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>{isEn ? 'Install on iPhone / iPad' : 'تثبيت على آيفون / آيباد'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowIOSModal(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              isDark
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'
                : 'border-[#1769FF]/30 bg-[#EAF3FF] text-[#1769FF] hover:bg-[#D5E7FF]'
            } ${className}`}
            title={isEn ? 'Add to iPhone / iPad Home Screen' : 'إضافة إلى الشاشة الرئيسية للآيفون والآيباد'}
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{isEn ? 'Install on iOS' : 'تثبيت على آيفون'}</span>
            <span className="sm:hidden">{isEn ? 'iOS' : 'آيفون'}</span>
          </button>
        )}

        {/* Modal for iOS Safari Manual Installation Instructions */}
        {showIOSModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-modal-title"
          >
            <div
              className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl border ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-white border-[#DCE7F5] text-[#172B4D]'
              }`}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className={`absolute top-4 ${isEn ? 'right-4' : 'left-4'} p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-800 bg-slate-800 text-slate-300 hover:text-white'
                    : 'border-slate-200 bg-slate-100 text-slate-500 hover:text-slate-800'
                }`}
                aria-label={isEn ? 'Close' : 'إغلاق'}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#1769FF] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#1769FF]/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="ios-modal-title" className="text-base font-extrabold">
                    {isEn ? 'Install on iPhone & iPad' : 'تثبيت Fares Tools على أجهزة آبل'}
                  </h3>
                  <p className="text-xs text-[#687A96] dark:text-slate-400">
                    {isEn ? 'Safari does not support 1-click install. Follow 3 simple steps:' : 'متصفح Safari يتطلب إضافته يدويًا عبر 3 خطوات سهلة:'}
                  </p>
                </div>
              </div>

              {/* Instructions List */}
              <ol className="space-y-3.5 my-5 text-xs sm:text-sm font-medium">
                <li className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F9FF] dark:bg-slate-800/60 border border-[#DCE7F5] dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-full bg-[#1769FF] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold">
                      {isEn ? 'Tap the Share icon' : 'اضغط على زر المشاركة (Share)'}
                    </span>
                    <p className="text-xs text-[#687A96] dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-[#1769FF] inline" />
                      {isEn ? 'Found in Safari bottom toolbar (or top on iPad)' : 'الموجود في شريط سفاري أسفل الشاشة (أو بالأعلى في الآيباد)'}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F9FF] dark:bg-slate-800/60 border border-[#DCE7F5] dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-full bg-[#1769FF] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold">
                      {isEn ? 'Scroll down & tap "Add to Home Screen"' : 'مرر للأسفل واختر «إضافة إلى الشاشة الرئيسية»'}
                    </span>
                    <p className="text-xs text-[#687A96] dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <PlusSquare className="w-3.5 h-3.5 text-[#1769FF] inline" />
                      {isEn ? 'Select "Add to Home Screen"' : 'أو بالإنجليزية Add to Home Screen'}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F9FF] dark:bg-slate-800/60 border border-[#DCE7F5] dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-full bg-[#1769FF] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-bold">
                      {isEn ? 'Tap "Add" in the top corner' : 'اضغط «إضافة» (Add) في الزاوية العلوية'}
                    </span>
                    <p className="text-xs text-[#687A96] dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 inline" />
                      {isEn ? 'Fares Tools will appear on your home screen!' : 'سيظهر تطبيق Fares Tools على شاشتك الرئيسية فوراً!'}
                    </p>
                  </div>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-[#1769FF] hover:bg-[#0755E9] text-white cursor-pointer transition-colors"
              >
                {isEn ? 'Got it' : 'فهمت ذلك، شكرًا'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // 5. In unsupported browsers or if installation is not applicable, return null
  return null;
};
