import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share2, PlusSquare, CheckCircle, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, settings } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const isEn = lang === 'en';
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    // 1. Detect standalone mode
    const checkStandalone = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
      );
    };

    setIsInstalled(checkStandalone());

    // 2. Detect iOS devices (iPhone, iPad, iPod)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // 3. Listen to beforeinstallprompt event strictly
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setIsProcessing(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('[InstallButton] prompt error:', err);
      setDeferredPrompt(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // If already running inside installed standalone PWA, render nothing
  if (isInstalled) {
    return null;
  }

  // 1. Chromium / Android / Desktop: Render ONLY when beforeinstallprompt event has fired
  if (deferredPrompt) {
    return (
      <div
        className={`inline-flex items-center gap-3 p-2 sm:p-2.5 rounded-2xl border transition-all duration-300 shadow-md ${
          isDark
            ? 'bg-slate-800/90 border-[#1769FF]/40 text-white shadow-[#1769FF]/10'
            : 'bg-white border-[#1769FF]/30 text-[#172B4D] shadow-[0_4px_20px_rgba(23,105,255,0.12)]'
        } ${className}`}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#053BA6] to-[#1769FF] text-white flex items-center justify-center shrink-0 shadow-xs">
          <Download className="w-4 h-4 animate-bounce" />
        </div>

        <div className="text-start pr-1 pl-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-extrabold text-[#1769FF]">
              {isEn ? 'Install App' : 'تطبيق فارس تولز'}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#EAF3FF] text-[#1769FF] dark:bg-[#1769FF]/20 dark:text-[#7DD3FC]">
              <Sparkles className="w-2.5 h-2.5" />
              PWA
            </span>
          </div>
          <p className="text-[11px] text-[#687A96] dark:text-slate-400 hidden sm:block">
            {isEn
              ? 'Install on your desktop or phone for instant 1-click access'
              : 'ثبّت التطبيق على جهازك للوصول السريع بدون متصفح'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleInstallClick}
          disabled={isProcessing}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1769FF] hover:bg-[#0755E9] active:scale-95 transition-all shadow-sm shadow-[#1769FF]/30 cursor-pointer shrink-0 whitespace-nowrap"
          aria-label={isEn ? 'Install Fares Tools' : 'تثبيت Fares Tools'}
        >
          {isEn ? 'Install Now' : 'تثبيت Fares Tools'}
        </button>
      </div>
    );
  }

  // 2. iOS Devices: Tailored instructions for iPhone / iPad Safari users
  if (isIOS) {
    return (
      <>
        <div
          className={`inline-flex items-center gap-3 p-2 sm:p-2.5 rounded-2xl border transition-all duration-300 shadow-md ${
            isDark
              ? 'bg-slate-800/90 border-[#1769FF]/40 text-white shadow-[#1769FF]/10'
              : 'bg-white border-[#1769FF]/30 text-[#172B4D] shadow-[0_4px_20px_rgba(23,105,255,0.12)]'
          } ${className}`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#053BA6] to-[#1769FF] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Smartphone className="w-4 h-4" />
          </div>

          <div className="text-start pr-1 pl-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold text-[#1769FF]">
                {isEn ? 'iOS App Available' : 'تثبيت على آيفون وآيباد'}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#EAF3FF] text-[#1769FF] dark:bg-[#1769FF]/20 dark:text-[#7DD3FC]">
                iOS
              </span>
            </div>
            <p className="text-[11px] text-[#687A96] dark:text-slate-400 hidden sm:block">
              {isEn ? 'Add to Home Screen directly from Safari' : 'أضف التطبيق لشاشتك الرئيسية في خطوات بسيطة'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border border-[#1769FF]/30 bg-[#EAF3FF] hover:bg-[#D5E7FF] text-[#1769FF] dark:bg-[#1769FF]/20 dark:text-[#7DD3FC] dark:hover:bg-[#1769FF]/30 transition-all cursor-pointer shrink-0 whitespace-nowrap"
            aria-label={isEn ? 'How to install on iOS' : 'طريقة التثبيت على آيفون'}
          >
            {isEn ? 'Install on iOS' : 'تثبيت على آيفون'}
          </button>
        </div>

        {/* Dedicated Modal with step-by-step instructions for iOS users */}
        {showIOSGuide && (
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
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
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
                    {isEn ? 'Install Fares Tools on iOS' : 'تثبيت Fares Tools على أجهزة آبل'}
                  </h3>
                  <p className="text-xs text-[#687A96] dark:text-slate-400">
                    {isEn
                      ? 'Follow these 3 easy steps in Safari to add to your Home Screen:'
                      : 'متصفح Safari يدعم التثبيت اليدوي بسهولة باتباع 3 خطوات:'}
                  </p>
                </div>
              </div>

              <ol className="space-y-3 my-5 text-xs sm:text-sm font-medium">
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
                      {isEn
                        ? 'Found in the Safari toolbar at the bottom of the screen (or top on iPad)'
                        : 'الموجود في شريط متصفح سفاري أسفل الشاشة (أو بالأعلى في الآيباد)'}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F9FF] dark:bg-slate-800/60 border border-[#DCE7F5] dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-full bg-[#1769FF] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold">
                      {isEn ? 'Select "Add to Home Screen"' : 'مرر للأسفل واختر «إضافة إلى الشاشة الرئيسية»'}
                    </span>
                    <p className="text-xs text-[#687A96] dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <PlusSquare className="w-3.5 h-3.5 text-[#1769FF] inline" />
                      {isEn ? 'Tap "Add to Home Screen" option' : 'أو بالإنجليزية Add to Home Screen'}
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
                      {isEn
                        ? 'Fares Tools will be added as a standalone app on your Home Screen'
                        : 'سيتم وضع أيقونة فارس تولز على شاشتك ليعمل كتطبيق مستقل بدون متصفح'}
                    </p>
                  </div>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-[#1769FF] hover:bg-[#0755E9] text-white cursor-pointer transition-colors"
              >
                {isEn ? 'Got it, thank you' : 'فهمت ذلك، شكرًا'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Otherwise, return null
  return null;
};
