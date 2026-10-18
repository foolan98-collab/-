import React, { useState } from 'react';
import { FileQuestion, ArrowRight, Home, Grid, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePageSeo } from '../hooks/usePageSeo';

export const NotFoundPage: React.FC = () => {
  const { navigate, settings, lang, setSearchQuery } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';
  const [localSearch, setLocalSearch] = useState('');

  usePageSeo({
    title: isEn ? 'Page Not Found (404) | Fares Tools' : 'الصفحة غير موجودة (404) | فارس TOOLS',
    description: isEn
      ? 'The requested page could not be found. Browse all our 40 free tools for PDF, images, audio, video and documents.'
      : 'عذراً، لم نتمكن من العثور على الصفحة المطلوبة. يمكنك تصفح جميع الأدوات الـ 40 لتحويل ومعالجة الملفات محلياً.',
    canonicalPath: '/404',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchQuery(localSearch.trim());
      navigate('/');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-fade-in-up">
      <div
        className={`rounded-3xl border p-8 sm:p-14 space-y-8 ${
          isDark
            ? 'bg-slate-900 border-slate-800 shadow-2xl'
            : 'bg-white border-[#DCE7F5] shadow-[0_12px_40px_rgba(23,105,255,0.06)]'
        }`}
      >
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#1769FF]/10 text-[#1769FF] flex items-center justify-center">
          <FileQuestion className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1769FF]/10 text-[#1769FF]">
            {isEn ? 'Error 404' : 'خطأ 404'}
          </span>
          <h1
            className={`text-2xl sm:text-4xl font-extrabold ${
              isDark ? 'text-white' : 'text-[#172B4D]'
            }`}
          >
            {isEn ? 'Page Not Found' : 'الصفحة غير موجودة أو تم نقلها'}
          </h1>
          <p
            className={`text-sm sm:text-base max-w-lg mx-auto leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-[#687A96]'
            }`}
          >
            {isEn
              ? 'The link you followed may be broken or the page may have been removed. You can search our suite of tools or return to the home page.'
              : 'الرابط الذي حاولت فتحه غير متوفر حالياً أو ربما تم تغيير مساره. يمكنك البحث عن الأداة التي تحتاجها أو العودة للصفحة الرئيسية.'}
          </p>
        </div>

        {/* Quick Search */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div
            className={`flex items-center rounded-2xl border p-1.5 transition-all ${
              isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-[#F5F9FF] border-[#DCE7F5]'
            }`}
          >
            <Search className="w-5 h-5 text-[#1769FF] mx-3 shrink-0" />
            <input
              type="search"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={isEn ? 'Search for a tool (e.g. compress pdf)...' : 'ابحث عن أداة (مثال: ضغط PDF)...'}
              className={`w-full py-2 bg-transparent text-sm font-medium focus:outline-none ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-xs font-bold transition-colors shrink-0"
            >
              {isEn ? 'Search' : 'بحث'}
            </button>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-sm font-bold shadow-md shadow-[#1769FF]/20 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>{isEn ? 'Go to Home' : 'الرئيسية'}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/all-tools')}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-bold transition-colors ${
              isDark
                ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'border-[#DCE7F5] text-[#172B4D] hover:bg-[#EAF3FF]'
            }`}
          >
            <Grid className="w-4 h-4 text-[#1769FF]" />
            <span>{isEn ? 'All 40 Tools' : 'جميع الـ 40 أداة'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
