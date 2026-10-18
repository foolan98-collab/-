import React, { useState } from 'react';
import {
  SpellCheck,
  Sparkles,
  Copy,
  Check,
  Download,
  Trash2,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const COMMON_DIACRITICS_DICTIONARY: Record<string, string> = {
  بسم: 'بِسْمِ',
  الله: 'اللَّهِ',
  الرحمن: 'الرَّحْمَنِ',
  الرحيم: 'الرَّحِيمِ',
  الحمد: 'الْحَمْدُ',
  لله: 'لِلَّهِ',
  رب: 'رَبِّ',
  العالمين: 'الْعَالَمِينَ',
  السلام: 'السَّلَامُ',
  عليكم: 'عَلَيْكُمْ',
  ورحمة: 'وَرَحْمَةُ',
  وبركاته: 'وَبَرَكَاتُهُ',
  مرحبا: 'مَرْحَباً',
  أهلا: 'أَهْلاً',
  وسهلا: 'وَسَهْلاً',
  العلم: 'الْعِلْمُ',
  نور: 'نُورٌ',
  المستقبل: 'الْمُسْتَقْبَلُ',
  العمل: 'الْعَمَلُ',
  النجاح: 'النَّجَاحُ',
  الوقت: 'الْوَقْتُ',
  الكتاب: 'الْكِتَابُ',
  اللغة: 'اللُّغَةُ',
  العربية: 'الْعَرَبِيَّةُ',
  جميلة: 'جَمِيلَةٌ',
  شكرا: 'شُكْراً',
  جزيلا: 'جَزِيلاً',
  لكم: 'لَكُمْ',
  جميعا: 'جَمِيعاً',
  اليوم: 'الْيَوْمَ',
  غدا: 'غَداً',
  أمس: 'أَمْسِ',
  حكومة: 'حُكُومَةٌ',
  تقنية: 'تِقْنِيَّةٌ',
  منصة: 'مِنَصَّةُ',
  فارس: 'فَارِسْ',
};

const COMMON_SPELLING_CORRECTIONS: [string, string, string][] = [
  ['ان شاء الله', 'إن شاء الله', 'تصحيح "إن شاء الله"'],
  ['إنشاء الله', 'إن شاء الله', 'تصحيح "إن شاء الله" (فصل إن عن شاء)'],
  ['انشاء الله', 'إن شاء الله', 'تصحيح "إن شاء الله"'],
  ['لاكن', 'لكن', 'تصحيح الألف الزائدة في "لكن"'],
  ['هاذا', 'هذا', 'تصحيح الألف الزائدة في "هذا"'],
  ['هاذه', 'هذه', 'تصحيح الألف الزائدة في "هذه"'],
  ['هاؤلاء', 'هؤلاء', 'تصحيح "هؤلاء"'],
  ['ذالك', 'ذلك', 'تصحيح الألف الزائدة في "ذلك"'],
  ['أولائك', 'أولئك', 'تصحيح الألف الزائدة في "أولئك"'],
  ['الى', 'إلى', 'إضافة همزة القطع في "إلى"'],
  ['او', 'أو', 'إضافة همزة القطع في "أو"'],
  ['ايضا', 'أيضاً', 'تصحيح همزة وتنوين "أيضاً"'],
  ['ايضاً', 'أيضاً', 'إضافة همزة القطع في "أيضاً"'],
  ['مساءا', 'مساءً', 'تصحيح التنوين بعد الألف والهمزة في "مساءً"'],
  ['صباحا', 'صباحاً', 'إضافة تنوين الفتح في "صباحاً"'],
  ['جدا', 'جداً', 'إضافة تنوين الفتح في "جداً"'],
  ['شكرا', 'شكراً', 'إضافة تنوين الفتح في "شكراً"'],
  ['اهلا', 'أهلاً', 'تصحيح همزة وتنوين "أهلاً"'],
  ['أهلا', 'أهلاً', 'إضافة تنوين الفتح في "أهلاً"'],
  ['سهلا', 'سهلاً', 'إضافة تنوين الفتح في "سهلاً"'],
  ['الاخطاء', 'الأخطاء', 'إضافة همزة القطع في "الأخطاء"'],
  ['اخطاء', 'أخطاء', 'إضافة همزة القطع في "أخطاء"'],
  ['الاسلام', 'الإسلام', 'إضافة همزة القطع في "الإسلام"'],
  ['الانسان', 'الإنسان', 'إضافة همزة القطع في "الإنسان"'],
  ['اكثر', 'أكثر', 'إضافة همزة القطع في "أكثر"'],
  ['افضل', 'أفضل', 'إضافة همزة القطع في "أفضل"'],
  ['اللهم صلي', 'اللهم صلِّ', 'تصحيح فعل الأمر "صلِّ" (حذف حرف العلة)'],
  ['مبروك', 'مبارك', 'استبدال "مبروك" بالأفصح لغوياً "مبارك"'],
  ['مدراء', 'مديرون', 'تصحيح جمع "مدير" إلى "مديرون"'],
  ['ملف بي دي اف', 'ملف PDF', 'تنسيق مصطلح PDF'],
];

export const ArabicWritingWorkspace: React.FC = () => {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  const [text, setText] = useState<string>(
    'بسم الله الرحمن الرحيم. أهلا وسهلا بكم في منصة فارس، ان شاء الله تساعدكم هاذه الأداة في مراجعة النصوص العربية وتنسيق علامات الترقيم ، وتصحيح الاخطاء الشائعة جدا .'
  );
  const [appliedLogs, setAppliedLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Word & character counts
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const charCount = text.length;
  const diacriticsCount = (text.match(/[\u064B-\u065F\u0670]/g) || []).length;

  const handleCorrectSpellingAndPunctuation = () => {
    let updated = text;
    const logs: string[] = [];

    // Use Unicode-safe Arabic token boundary lookbehind/lookahead instead of ASCII \b
    COMMON_SPELLING_CORRECTIONS.forEach(([wrongPhrase, replacement, label]) => {
      const escaped = wrongPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(
        `(^|[\\s،؛؟!.:()«»"'])(${escaped})(?=$|[\\s،؛؟!.:()«»"'])`,
        'g'
      );
      if (pattern.test(updated)) {
        updated = updated.replace(pattern, `$1${replacement}`);
        logs.push(label);
      }
    });

    // Normalize multiple spaces & punctuation spacing
    const beforeSpace = updated;
    updated = updated
      .replace(/[ \t]+/g, ' ')
      .replace(/\s+([،؛؟!.])/g, '$1')
      .replace(/([،؛؟!.])([^\s\n])/g, '$1 $2')
      .replace(/,/g, '،')
      .replace(/\?/g, '؟');

    if (beforeSpace !== updated) {
      logs.push('ضبط المسافات وتوحيد علامات الترقيم العربية (، ؛ ؟)');
    }

    setText(updated);
    setAppliedLogs(
      logs.length > 0
        ? logs
        : ['النص منسق بالفعل ولا يحتوي على أخطاء إملائية شائعة مسجلة.']
    );
  };

  const handleAddDiacritics = () => {
    let count = 0;
    const words = text.split(/(\s+)/);
    const updatedWords = words.map((token) => {
      const cleanWord = token.replace(/[،؛؟!.:]/g, '');
      const punct = token.slice(cleanWord.length);
      if (COMMON_DIACRITICS_DICTIONARY[cleanWord]) {
        count++;
        return COMMON_DIACRITICS_DICTIONARY[cleanWord] + punct;
      }
      return token;
    });

    setText(updatedWords.join(''));
    setAppliedLogs([
      count > 0
        ? `تم تشكيل ${count} كلمة وعبارة قياسية بنجاح.`
        : 'تم فحص النص؛ الكلمات القياسية مشكلة بالفعل.',
    ]);
  };

  const handleRemoveDiacritics = () => {
    // Strip harakat & tatweel
    const updated = text.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
    setText(updated);
    setAppliedLogs(['تمت إزالة جميع حركات التشكيل والتطويل (الكشيدة) من النص.']);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arabic-text-fares-tools.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div
        className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-[#DCE7F5] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1769FF] dark:text-[#38A5FF]" />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
              محرر النصوص العربية والتدقيق الذكي
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#687A96] dark:text-slate-400 tabular-nums">
            <span>الكلمات: {wordCount}</span>
            <span aria-hidden="true">·</span>
            <span>الأحرف: {charCount}</span>
            <span aria-hidden="true">·</span>
            <span>حركات التشكيل: {diacriticsCount}</span>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder="اكتب أو الصق النص العربي هنا لتصحيح الهمزات وعلامات الترقيم أو ضبط التشكيل..."
          className={`w-full rounded-xl p-4 text-base leading-loose border focus:outline-none focus:border-[#1769FF] resize-y ${
            isDark
              ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
              : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D] placeholder-[#687A96]'
          }`}
        />

        {/* Primary Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCorrectSpellingAndPunctuation}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white font-bold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
            >
              <SpellCheck className="w-4 h-4" />
              <span>تصحيح الأخطاء والترقيم</span>
            </button>

            <button
              type="button"
              onClick={handleAddDiacritics}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0755E9] hover:bg-[#1769FF] text-white font-bold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>تشكيل الكلمات الشائعة</span>
            </button>

            <button
              type="button"
              onClick={handleRemoveDiacritics}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                  : 'border-[#DCE7F5] hover:bg-[#EAF3FF] text-[#172B4D]'
              }`}
            >
              إزالة التشكيل والكشيدة
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!text}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                copied
                  ? 'border-[#1769FF] bg-[#EAF3FF] text-[#1769FF]'
                  : isDark
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                  : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#172B4D]'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              disabled={!text}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                  : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#172B4D]'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>تنزيل TXT</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setText('');
                setAppliedLogs([]);
              }}
              aria-label="مسح النص"
              className="p-2 rounded-xl text-[#687A96] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Correction Log Feedback */}
      {appliedLogs.length > 0 && (
        <div
          className={`rounded-2xl border p-5 ${
            isDark
              ? 'bg-[#1769FF]/15 border-[#38A5FF]/40 text-slate-100'
              : 'bg-[#EAF3FF] border-[#DCE7F5] text-[#172B4D]'
          }`}
        >
          <h4 className="text-sm font-bold mb-2 text-[#1769FF]">
            سجل التحسينات المطبقة على النص:
          </h4>
          <ul className="space-y-1 text-xs sm:text-sm list-disc list-inside opacity-90">
            {appliedLogs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
