import React, { useState } from 'react';
import {
  MessageCircle,
  Send,
  Star,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Wrench,
  HelpCircle,
  ThumbsUp,
  X,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WHATSAPP_PHONE_LOCAL = '01043047585';
export const WHATSAPP_LINK_BASE = 'https://wa.me/201043047585';

export type FeedbackMessageType =
  | 'new_tool'
  | 'enhancement'
  | 'issue'
  | 'review'
  | 'general';

interface FeedbackTypeOption {
  id: FeedbackMessageType;
  labelAr: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FEEDBACK_TYPES: FeedbackTypeOption[] = [
  {
    id: 'new_tool',
    labelAr: 'اقتراح إضافة أداة جديدة',
    labelEn: 'Suggest a new tool',
    icon: Lightbulb,
  },
  {
    id: 'enhancement',
    labelAr: 'طلب تعديل أو تحسين',
    labelEn: 'Request an enhancement',
    icon: Wrench,
  },
  {
    id: 'issue',
    labelAr: 'الإبلاغ عن مشكلة في إحدى الأدوات',
    labelEn: 'Report a tool issue',
    icon: AlertTriangle,
  },
  {
    id: 'review',
    labelAr: 'إرسال رأي أو تقييم للموقع',
    labelEn: 'Share review or rating',
    icon: ThumbsUp,
  },
  {
    id: 'general',
    labelAr: 'استفسار عام',
    labelEn: 'General inquiry',
    icon: HelpCircle,
  },
];

interface WhatsAppFeedbackProps {
  initialToolName?: string;
  initialType?: FeedbackMessageType;
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
}

export const WhatsAppFeedbackSection: React.FC<WhatsAppFeedbackProps> = ({
  initialToolName = '',
  initialType = 'enhancement',
  isModal = false,
  isOpen = true,
  onClose,
  title,
}) => {
  const { settings, lang } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';

  const [messageType, setMessageType] = useState<FeedbackMessageType>(initialType);
  const [toolName, setToolName] = useState<string>(initialToolName);
  const [details, setDetails] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [formError, setFormError] = useState<string>('');
  const [hasOpenedWhatsApp, setHasOpenedWhatsApp] = useState<boolean>(false);

  if (isModal && !isOpen) return null;

  // Direct quick greeting message
  const defaultGreeting = isEn
    ? 'Hello! I am reaching out regarding Fares Tools. I have an inquiry or suggestion I would like to share with you.'
    : 'مرحبًا، أتواصل معك بخصوص موقع Fares Tools. لدي استفسار أو اقتراح أود مشاركته معك.';

  const handleQuickGreeting = () => {
    const url = `${WHATSAPP_LINK_BASE}?text=${encodeURIComponent(defaultGreeting)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanDetails = details.trim();
    if (!cleanDetails) {
      setFormError(
        isEn
          ? 'Please enter the details of your message or suggestion.'
          : 'يرجى كتابة تفاصيل الاقتراح أو المشكلة قبل المتابعة.'
      );
      return;
    }

    const selectedTypeObj = FEEDBACK_TYPES.find((t) => t.id === messageType);
    const typeLabel = isEn
      ? selectedTypeObj?.labelEn || messageType
      : selectedTypeObj?.labelAr || messageType;

    // Build the formatted Arabic WhatsApp message
    const lines: string[] = [
      'السلام عليكم ورحمة الله وبركاته،',
      'أتواصل معك بخصوص منصة Fares Tools:',
      '',
      `📋 نوع الرسالة: ${typeLabel}`,
    ];

    if (toolName.trim()) {
      lines.push(`🛠️ اسم الأداة: ${toolName.trim()}`);
    }

    if (rating > 0) {
      const starIcons = '⭐'.repeat(rating);
      lines.push(`⭐ التقييم: ${rating}/5 (${starIcons})`);
    }

    lines.push('');
    lines.push('📝 التفاصيل:');
    lines.push(cleanDetails);

    if (typeof window !== 'undefined' && window.location.href) {
      lines.push('');
      lines.push(`🔗 رابط الصفحة الحالية: ${window.location.href}`);
    }

    const finalMessage = lines.join('\n');
    const targetUrl = `${WHATSAPP_LINK_BASE}?text=${encodeURIComponent(finalMessage)}`;

    // Open WhatsApp
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    setHasOpenedWhatsApp(true);
  };

  const content = (
    <div
      className={`rounded-3xl border transition-all ${
        isModal
          ? isDark
            ? 'bg-slate-900 border-slate-800 text-white shadow-2xl p-6 sm:p-8 max-w-xl w-full mx-4 relative max-h-[90vh] overflow-y-auto'
            : 'bg-white border-[#DCE7F5] text-[#172B4D] shadow-2xl p-6 sm:p-8 max-w-xl w-full mx-4 relative max-h-[90vh] overflow-y-auto'
          : isDark
          ? 'bg-slate-900 border-slate-800 p-7 sm:p-10'
          : 'bg-white border-[#DCE7F5] shadow-[0_4px_24px_rgba(23,105,255,0.05)] p-7 sm:p-10'
      }`}
    >
      {/* Modal Close Button */}
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={isEn ? 'Close' : 'إغلاق'}
          className="absolute top-5 left-5 sm:top-6 sm:left-6 p-2 rounded-xl text-[#687A96] hover:text-[#172B4D] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header Area */}
      <div className="space-y-3 border-b pb-6 border-[#DCE7F5] dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#25D366]/10 text-[#128C7E] dark:text-[#25D366]">
          <MessageCircle className="w-4 h-4" />
          <span>{isEn ? 'Direct Owner Contact' : 'تواصل مباشر مع صاحب الموقع'}</span>
        </div>

        <h2
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isDark ? 'text-white' : 'text-[#172B4D]'
          }`}
        >
          {title ||
            (isEn
              ? 'Your Opinion Matters — Help Us Improve the Platform'
              : 'رأيك يهمنا — ساعدنا نطوّر الموقع')}
        </h2>

        <p
          className={`text-sm sm:text-base leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-[#687A96]'
          }`}
        >
          {isEn
            ? 'We are constantly refining Fares Tools. Whether you found a glitch, want a new feature, or have a suggestion, reach out directly via WhatsApp!'
            : 'نعمل يومياً على تحسين وتطوير أدوات Fares Tools. إذا واجهت مشكلة، أو رغبت في إضافة أداة جديدة، أو أردت مشاركة رأيك واقتراحك، نسعد بتواصلك المباشر مع صاحب الموقع عبر واتساب.'}
        </p>

        {/* Quick Contact Button */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleQuickGreeting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#25D366]/20 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>{isEn ? 'Direct WhatsApp Chat' : 'تواصل معنا مباشرة عبر واتساب'}</span>
          </button>
          <span className="text-xs text-[#687A96] font-mono dir-ltr" dir="ltr">
            (+20) {WHATSAPP_PHONE_LOCAL}
          </span>
        </div>
      </div>

      {/* Interactive Form for Custom Messages */}
      <form onSubmit={handleFormSubmit} className="pt-6 space-y-5 text-start">
        <div className="space-y-1.5">
          <label className="text-xs font-bold block text-[#172B4D] dark:text-slate-200">
            {isEn ? 'Message Type' : 'نوع الرسالة أو الطلب:'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FEEDBACK_TYPES.map((typeOption) => {
              const IconComp = typeOption.icon;
              const isSelected = messageType === typeOption.id;
              return (
                <button
                  type="button"
                  key={typeOption.id}
                  onClick={() => setMessageType(typeOption.id)}
                  className={`p-3 rounded-2xl border text-start flex items-center gap-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1769FF] bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] dark:text-[#38A5FF] font-bold ring-2 ring-[#1769FF]/15'
                      : isDark
                      ? 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      : 'border-[#DCE7F5] bg-[#F5F9FF] text-[#172B4D] hover:border-[#1769FF]/40'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span className="text-xs truncate">
                    {isEn ? typeOption.labelEn : typeOption.labelAr}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool Name (shown or prefilled when relevant) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold block text-[#172B4D] dark:text-slate-200">
            {isEn ? 'Tool Name (Optional)' : 'اسم الأداة (إن كانت الرسالة مرتبطة بأداة محددة):'}
          </label>
          <input
            type="text"
            value={toolName}
            onChange={(e) => setToolName(e.target.value)}
            placeholder={
              isEn
                ? 'e.g., Merge PDF, Compress Image, QR Generator...'
                : 'مثال: دمج PDF، ضغط الصور، مولد QR...'
            }
            className={`w-full rounded-2xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#1769FF] ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D] placeholder-slate-400'
            }`}
          />
        </div>

        {/* Message Details */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold block text-[#172B4D] dark:text-slate-200">
            {isEn ? 'Details of Suggestion or Issue *' : 'تفاصيل الاقتراح أو المشكلة أو الاستفسار *'}
          </label>
          <textarea
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={
              isEn
                ? 'Write your feedback or description here...'
                : 'اكتب تفاصيل طلبك أو ما لاحظته بالتفصيل...'
            }
            required
            className={`w-full rounded-2xl p-4 text-sm border leading-relaxed focus:outline-none focus:border-[#1769FF] ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D] placeholder-slate-400'
            }`}
          />
        </div>

        {/* Optional Star Rating (1 to 5) */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold block text-[#172B4D] dark:text-slate-200">
            {isEn ? 'Optional Rating for Fares Tools:' : 'تقييم اختياري للموقع أو الأداة:'}
          </label>
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="تقييم الموقع">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= (hoveredStar || rating);
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(rating === star ? 0 : star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  aria-label={`${star} من 5 نجوم`}
                  className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      active
                        ? 'text-amber-400 fill-amber-400'
                        : isDark
                        ? 'text-slate-700'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
            {rating > 0 && (
              <span className="text-xs font-bold text-amber-500 mr-2">
                {rating} / 5 {isEn ? 'stars' : 'نجوم'}
              </span>
            )}
          </div>
        </div>

        {/* Validation Error Banner */}
        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Explicit Honest Guidance Notice */}
        <div
          className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
            isDark
              ? 'bg-[#1769FF]/10 border-[#1769FF]/20 text-slate-300'
              : 'bg-[#EAF3FF] border-[#DCE7F5] text-[#172B4D]'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-[#1769FF]">
            <Info className="w-4 h-4 shrink-0" />
            <span>{isEn ? 'Important Transparency Note' : 'تنبيه شفاف قبل الإرسال:'}</span>
          </div>
          <p className="text-[11px] sm:text-xs leading-relaxed text-[#687A96] dark:text-slate-300">
            {isEn
              ? 'Clicking "Send via WhatsApp" will open WhatsApp with your message pre-composed. You must click the Send button inside WhatsApp yourself to dispatch it.'
              : 'الضغط على زر «إرسال عبر واتساب» سيقوم بفتح تطبيق واتساب ومعه رسالتك مجهزة بالكامل؛ وعليك الضغط على زر الإرسال داخل واتساب بنفسك لإتمام إرسالها.'}
          </p>
        </div>

        {/* Post-open confirmation banner */}
        {hasOpenedWhatsApp && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {isEn
                ? 'WhatsApp opened with your message prepared. Please tap Send in WhatsApp!'
                : 'تم تجهيز الرسالة وفتح واتساب. نرجو الضغط على زر الإرسال داخل التطبيق.'}
            </span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#25D366]/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{isEn ? 'Send via WhatsApp' : 'إرسال عبر واتساب'}</span>
        </button>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()}>{content}</div>
      </div>
    );
  }

  return content;
};
