import React, { useState } from 'react';
import {
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ArrowRight,
  FileCode,
  HardDrive,
  Cpu,
  Layers,
} from 'lucide-react';
import { ToolItem } from '../types/tools';
import { ToolSeoData, getToolSeoData } from '../data/toolsSeoData';
import { getToolBySlug } from '../data/toolsCatalog';
import { ToolIcon } from './ToolIcon';
import { useApp } from '../context/AppContext';

interface ToolSeoSectionProps {
  tool: ToolItem;
}

export const ToolSeoSection: React.FC<ToolSeoSectionProps> = ({ tool }) => {
  const { navigate, settings, lang } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';

  const seoData: ToolSeoData | undefined = getToolSeoData(tool.slug);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  if (!seoData) {
    return null;
  }

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx((prev) => (prev === idx ? null : idx));
  };

  // Resolve curated related tools
  const relatedTools: ToolItem[] = seoData.relatedSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is ToolItem => Boolean(t));

  return (
    <section className="space-y-8 pt-4">
      {/* 1. Technical Specs & In-Browser Reality Box */}
      <div
        className={`rounded-2xl border p-6 sm:p-8 space-y-6 ${
          isDark
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-[#DCE7F5] shadow-xs'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-[#DCE7F5]/70 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1769FF]/10 text-[#1769FF] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-base font-extrabold ${
                  isDark ? 'text-white' : 'text-[#172B4D]'
                }`}
              >
                {isEn
                  ? 'Technical Specifications & Privacy Guarantees'
                  : 'المواصفات التقنية وضمانات الخصوصية'}
              </h2>
              <p className="text-xs text-[#687A96] dark:text-slate-400">
                {isEn
                  ? 'Transparent browser-based architecture details'
                  : 'تفاصيل معمارية المعالجة المباشرة داخل متصفحك'}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isEn ? '100% In-Browser Privacy' : 'خصوصية محلية 100%'}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div
            className={`p-4 rounded-xl border ${
              isDark
                ? 'bg-slate-950/50 border-slate-800/80 text-slate-300'
                : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#1769FF] mb-1">
              <FileCode className="w-4 h-4" />
              <span>{isEn ? 'Supported Formats' : 'الصيغ المدعومة'}</span>
            </div>
            <p className="font-mono text-xs opacity-90">
              {seoData.fileSpecs.formats.join(', ')}
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              isDark
                ? 'bg-slate-950/50 border-slate-800/80 text-slate-300'
                : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#1769FF] mb-1">
              <HardDrive className="w-4 h-4" />
              <span>{isEn ? 'Memory Capacity' : 'سعة المعالجة'}</span>
            </div>
            <p className="text-xs opacity-90">{seoData.fileSpecs.maxSize}</p>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              isDark
                ? 'bg-slate-950/50 border-slate-800/80 text-slate-300'
                : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#1769FF] mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{isEn ? 'Zero Server Upload' : 'انعدام الرفع السحابي'}</span>
            </div>
            <p className="text-xs opacity-90">
              {isEn
                ? seoData.fileSpecs.privacyNoteEn
                : seoData.fileSpecs.privacyNoteAr}
            </p>
          </div>
        </div>

        {/* Real Technical Limitations Notice */}
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed border ${
            isDark
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}
        >
          <span className="font-extrabold ml-1 inline-block">
            {isEn ? 'Performance Note:' : 'ملاحظة تقنية مهمة:'}
          </span>
          <span>
            {isEn
              ? seoData.fileSpecs.limitationsEn
              : seoData.fileSpecs.limitationsAr}
          </span>
        </div>
      </div>

      {/* 2. Frequently Asked Questions (FAQ) with Accordion */}
      {seoData.faqs.length > 0 && (
        <div
          className={`rounded-2xl border p-6 sm:p-8 space-y-6 ${
            isDark
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-[#DCE7F5] shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3 border-b pb-4 border-[#DCE7F5]/70 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-[#1769FF]/10 text-[#1769FF] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-lg font-extrabold ${
                  isDark ? 'text-white' : 'text-[#172B4D]'
                }`}
              >
                {isEn
                  ? `Frequently Asked Questions About ${seoData.nameEn}`
                  : `الأسئلة الشائعة حول ${tool.name}`}
              </h2>
              <p className="text-xs text-[#687A96] dark:text-slate-400">
                {isEn
                  ? 'Accurate answers to common user questions'
                  : 'إجابات دقيقة وموثوقة حول استخدام الأداة وحدودها'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {seoData.faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              const question = isEn ? faq.qEn : faq.qAr;
              const answer = isEn ? faq.aEn : faq.aAr;

              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isOpen
                      ? isDark
                        ? 'border-[#1769FF]/50 bg-slate-950/70'
                        : 'border-[#1769FF]/40 bg-[#F5F9FF]'
                      : isDark
                      ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                      : 'border-[#DCE7F5] bg-white hover:border-[#BED3F3]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-start cursor-pointer focus:outline-none"
                  >
                    <span
                      className={`text-sm sm:text-base font-bold ${
                        isOpen
                          ? 'text-[#1769FF] dark:text-[#38A5FF]'
                          : isDark
                          ? 'text-white'
                          : 'text-[#172B4D]'
                      }`}
                    >
                      {question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#687A96] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#1769FF]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm leading-relaxed text-[#687A96] dark:text-slate-300 border-t border-[#DCE7F5]/50 dark:border-slate-800/80 pt-3.5">
                      {answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Contextual Recommended Next Tools (Internal Linking) */}
      {relatedTools.length > 0 && (
        <div className="space-y-5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#1769FF]" />
              <h2
                className={`text-lg sm:text-xl font-extrabold ${
                  isDark ? 'text-white' : 'text-[#172B4D]'
                }`}
              >
                {isEn ? 'Recommended Next Tools' : 'أدوات مكملة ومقترحة لإنجاز مهامك'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/all-tools')}
              className="text-xs font-bold text-[#1769FF] hover:underline cursor-pointer"
            >
              {isEn ? 'View All 40 Tools' : 'استكشف كافة الأدوات الـ 40'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((relTool) => {
              const relName = isEn ? relTool.nameEn || relTool.name : relTool.name;
              const relDesc = isEn
                ? relTool.shortDescEn || relTool.shortDesc
                : relTool.shortDesc;

              return (
                <button
                  key={relTool.id}
                  type="button"
                  onClick={() => navigate(relTool.route)}
                  className={`p-4 rounded-2xl border text-start flex flex-col justify-between gap-3 transition-all group cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 hover:border-[#1769FF] hover:bg-slate-850'
                      : 'bg-white border-[#DCE7F5] hover:border-[#1769FF] hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#1769FF]/10 text-[#1769FF] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ToolIcon iconName={relTool.iconName} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-bold group-hover:text-[#1769FF] transition-colors ${
                          isDark ? 'text-white' : 'text-[#172B4D]'
                        }`}
                      >
                        {relName}
                      </h3>
                      <p className="text-xs text-[#687A96] dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {relDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-extrabold text-[#1769FF] pt-2 border-t border-[#DCE7F5]/50 dark:border-slate-800/80">
                    <span>{isEn ? 'Open Tool' : 'فتح الأداة'}</span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${
                        isEn ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1 rotate-180'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
