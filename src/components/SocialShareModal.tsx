import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  Mail,
  ExternalLink,
  Smartphone,
  Globe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface ShareData {
  title: string;
  text?: string;
  url?: string;
}

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData?: ShareData;
}

// Brand SVG Icons for crisp, recognizable social platform presentation
const BrandIcons = {
  WhatsApp: () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12.031 2C6.516 2 2.023 6.49 2.023 12c0 1.942.558 3.754 1.523 5.289L2 22l4.862-1.503A9.94 9.94 0 0012.031 22c5.516 0 10.009-4.49 10.009-10s-4.493-10-10.009-10zm5.88 14.183c-.244.686-1.42 1.31-1.954 1.393-.505.078-1.157.112-3.725-.947-3.08-1.272-5.048-4.417-5.201-4.62-.153-.205-1.246-1.657-1.246-3.16 0-1.503.784-2.245 1.062-2.551.278-.306.608-.383.811-.383.203 0 .407.002.585.011.189.01.442-.072.691.526.257.621.874 2.133.95 2.288.077.153.128.332.025.536-.102.203-.153.332-.305.51-.153.179-.321.4-.458.537-.153.153-.312.32-.134.626.178.306.793 1.306 1.701 2.115 1.168 1.041 2.152 1.364 2.458 1.517.306.153.483.128.661-.077.178-.205.763-.893.967-1.199.203-.306.407-.255.686-.153.278.102 1.764.832 2.069.985.306.153.509.23.585.357.076.128.076.739-.168 1.425z" />
    </svg>
  ),
  Facebook: () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  Telegram: () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.86 0 1.54-.68 1.54-1.54 0-.85-.7-1.54-1.54-1.54-.85 0-1.54.69-1.54 1.54 0 .86.69 1.54 1.54 1.54m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  ),
  Pinterest: () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.171-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
    </svg>
  ),
  Reddit: () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.56 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  ),
  Threads: () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.214-8.182-3.538C2.27 18.257 1.4 15.228 1.4 11.458 1.4 5.372 6.136.024 12.222 0h.014c3.42 0 6.223 1.22 8.106 3.529 1.776 2.179 2.68 5.234 2.614 8.835l-.004.148h-3.414c.068-3.04-.633-5.385-1.97-6.787-1.328-1.391-3.238-2.128-5.332-2.128h-.008C7.94 3.597 4.9 7.42 4.9 11.458c0 3.013.67 5.347 1.94 6.75 1.282 1.417 3.208 2.164 5.34 2.164h.007c2.274 0 4.103-.797 5.289-2.305.814-1.033 1.309-2.454 1.433-4.111h-6.724v-3.376h10.05v.358c.032 2.766-.59 5.32-1.796 7.391-1.69 2.898-4.482 4.471-8.253 4.471z" />
    </svg>
  ),
};

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  shareData,
}) => {
  const { settings, lang } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determine current effective URL and title
  const currentUrl =
    shareData?.url ||
    (typeof window !== 'undefined'
      ? window.location.href
      : 'https://fares-tools.ai.studio/');

  const defaultTitle = isEn
    ? 'Fares Tools | Fast & Free PDF, Image & Document Utilities'
    : 'منصة فارس TOOLS | أدوات مجانية لتحويل وضغط وتعديل مستندات PDF والصور والفيديو محلياً وبأمان تام';

  const pageTitle = shareData?.title || (typeof document !== 'undefined' ? document.title : defaultTitle);

  const shareText =
    shareData?.text ||
    (isEn
      ? `Check out ${pageTitle} — 100% free browser tools with zero file upload privacy!`
      : `أنصحك بتجربة ${pageTitle} — أدوات مجانية وسريعة تعمل داخل المتصفح بأمان وخصوصية 100%!`);

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent(pageTitle);

  // Native Web Share API handler (supports Instagram, Snapchat, AirDrop, etc. on mobile)
  const canWebShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleNativeShare = async () => {
    if (!canWebShare) return;
    try {
      await navigator.share({
        title: pageTitle,
        text: shareText,
        url: currentUrl,
      });
      onClose();
    } catch (err) {
      // User cancelled or share dismissed gracefully
    }
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        // Fallback for older browsers
        const temp = document.createElement('textarea');
        temp.value = currentUrl;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };

  const platforms = [
    {
      name: 'WhatsApp',
      nameAr: 'واتساب',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n\n' + currentUrl)}`,
      bg: 'bg-[#25D366] hover:bg-[#1EBE5D] text-white',
      icon: BrandIcons.WhatsApp,
    },
    {
      name: 'Facebook',
      nameAr: 'فيسبوك',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'bg-[#1877F2] hover:bg-[#0E65D9] text-white',
      icon: BrandIcons.Facebook,
    },
    {
      name: 'Telegram',
      nameAr: 'تيليجرام',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      bg: 'bg-[#24A1DE] hover:bg-[#1C8BCA] text-white',
      icon: BrandIcons.Telegram,
    },
    {
      name: 'X (Twitter)',
      nameAr: 'منصة إكس',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      bg: 'bg-[#0F1419] hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700',
      icon: BrandIcons.X,
    },
    {
      name: 'LinkedIn',
      nameAr: 'لينكد إن',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: 'bg-[#0A66C2] hover:bg-[#084E96] text-white',
      icon: BrandIcons.LinkedIn,
    },
    {
      name: 'Threads',
      nameAr: 'ثريدز',
      url: `https://threads.net/intent/post?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`,
      bg: 'bg-black hover:bg-neutral-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700',
      icon: BrandIcons.Threads,
    },
    {
      name: 'Reddit',
      nameAr: 'ريديت',
      url: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      bg: 'bg-[#FF4500] hover:bg-[#E03D00] text-white',
      icon: BrandIcons.Reddit,
    },
    {
      name: 'Pinterest',
      nameAr: 'بينتريست',
      url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
      bg: 'bg-[#E60023] hover:bg-[#C8001F] text-white',
      icon: BrandIcons.Pinterest,
    },
    {
      name: 'Email',
      nameAr: 'البريد الإلكتروني',
      url: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(shareText + '\n\n' + currentUrl)}`,
      bg: 'bg-[#687A96] hover:bg-[#4E607A] text-white',
      icon: () => <Mail className="w-5 h-5" />,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-6 transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-[#DCE7F5] text-[#172B4D]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4 border-[#DCE7F5] dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1769FF]/10 text-[#1769FF] flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-lg font-black">
                {isEn ? 'Share Fares Tools' : 'شارك Fares Tools مع الآخرين'}
              </h2>
              <p className="text-xs text-[#687A96] dark:text-slate-400">
                {isEn
                  ? 'Help friends & colleagues discover fast, private tools'
                  : 'ساعد أصدقاءك في إنجاز أعمالهم بأدوات مجانية وآمنة 100%'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? 'Close' : 'إغلاق'}
            className="p-2 rounded-xl text-[#687A96] hover:text-[#172B4D] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* URL Copy Box */}
        <div className="space-y-2">
          <label className="text-xs font-bold block text-[#172B4D] dark:text-slate-200">
            {isEn ? 'Page Link' : 'رابط الصفحة الحالية:'}
          </label>
          <div
            className={`flex items-center gap-2 rounded-2xl border p-2 transition-all ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-[#F5F9FF] border-[#DCE7F5]'
            }`}
          >
            <div className="px-2 text-[#687A96] shrink-0">
              <Globe className="w-4 h-4 text-[#1769FF]" />
            </div>
            <input
              type="text"
              readOnly
              dir="ltr"
              value={currentUrl}
              className="w-full bg-transparent text-xs font-mono font-medium focus:outline-none truncate text-start text-[#172B4D] dark:text-slate-200"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-[#1769FF] hover:bg-[#0755E9] text-white shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Copied!' : 'تم النسخ!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Copy' : 'نسخ'}</span>
                </>
              )}
            </button>
          </div>

          {copied && (
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>{isEn ? 'Link copied to clipboard!' : 'تم نسخ الرابط بنجاح إلى الحافظة.'}</span>
            </p>
          )}

          {copyError && (
            <p className="text-[11px] font-bold text-rose-500">
              {isEn ? 'Could not copy automatically. Please select and copy manually.' : 'تعذر النسخ التلقائي. يرجى تحديد الرابط ونسخه يدوياً.'}
            </p>
          )}
        </div>

        {/* Social Share Grid */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-[#687A96] dark:text-slate-400">
            {isEn ? 'Share directly to platform:' : 'مشاركة سريعة عبر المنصات:'}
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
            {platforms.map((plat) => {
              const IconComp = plat.icon;
              return (
                <a
                  key={plat.name}
                  href={plat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-2xl font-bold text-xs transition-transform active:scale-95 shadow-xs ${plat.bg}`}
                >
                  <IconComp />
                  <span className="truncate">{isEn ? plat.name : plat.nameAr}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Native Web Share API Button (Mobile & Desktop with OS Sheet) */}
        {canWebShare && (
          <div className="pt-2 border-t border-[#DCE7F5] dark:border-slate-800">
            <button
              type="button"
              onClick={handleNativeShare}
              className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-bold border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white'
                  : 'border-[#DCE7F5] bg-[#F5F9FF] hover:bg-[#EAF3FF] text-[#172B4D]'
              }`}
            >
              <Smartphone className="w-4 h-4 text-[#1769FF]" />
              <span>
                {isEn
                  ? 'Share via more apps (Instagram, Snapchat, etc.)'
                  : 'مشاركة عبر المزيد من التطبيقات (Instagram، Snapchat، وغيرها)'}
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
