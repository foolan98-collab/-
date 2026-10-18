import React, { useState, useRef } from 'react';
import {
  Search,
  X,
  ArrowUpLeft,
  ShieldCheck,
  Zap,
  Layers,
  Clock,
  Share2,
  MessageCircle,
} from 'lucide-react';
import {
  SORTED_TOOLS_CATALOG,
  FILTER_TABS,
  getToolsByFilterCategory,
} from '../data/toolsCatalog';
import { FilterCategoryId } from '../types/tools';
import { ToolCard } from '../components/ToolCard';
import { ToolIcon } from '../components/ToolIcon';
import { AdSlot } from '../components/AdSlot';
import { InstallButton } from '../components/InstallButton';
import { SocialShareModal } from '../components/SocialShareModal';
import { WhatsAppFeedbackSection } from '../components/WhatsAppFeedbackSection';
import { useApp } from '../context/AppContext';
import { usePageSeo } from '../hooks/usePageSeo';

export const HomePage: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    settings,
    lang,
    t,
    recentToolIds,
    navigate,
  } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';
  const [selectedFilter, setSelectedFilter] = useState<FilterCategoryId>('all');
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const toolsGridRef = useRef<HTMLDivElement | null>(null);

  usePageSeo({
    title: isEn
      ? 'Fares Tools | Fast & Free PDF, Image & Document Utilities'
      : 'فارس TOOLS | منصة أدوات PDF والصور والمستندات الذكية',
    description: isEn
      ? 'Free, lightning-fast utilities to merge, compress, split, and convert PDF, images, video, and audio directly in your browser with 100% privacy.'
      : 'أدوات مجانية وسريعة لتحويل وضغط وتعديل مستندات PDF والصور والفيديو والصوت محلياً في المتصفح بأمان وخصوصية تامة.',
    canonicalPath: '/',
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const baseToolsForFilter = getToolsByFilterCategory(selectedFilter);

  const filteredTools = baseToolsForFilter.filter((tool) => {
    if (!normalizedQuery) return true;
    return (
      tool.name.toLowerCase().includes(normalizedQuery) ||
      (tool.nameEn && tool.nameEn.toLowerCase().includes(normalizedQuery)) ||
      tool.shortDesc.toLowerCase().includes(normalizedQuery) ||
      (tool.shortDescEn && tool.shortDescEn.toLowerCase().includes(normalizedQuery)) ||
      tool.fullDesc.toLowerCase().includes(normalizedQuery) ||
      tool.slug.toLowerCase().includes(normalizedQuery)
    );
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toolsGridRef.current?.scrollIntoView({
      behavior: settings.reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const handleCategoryBrowsingSelect = (filterId: FilterCategoryId) => {
    setSelectedFilter(filterId);
    toolsGridRef.current?.scrollIntoView({
      behavior: settings.reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <div className=" pb-16">
      {/* 1. Spacious Centered iLovePDF-Style Hero Section */}
      <section
        className={`relative overflow-hidden border-b transition-colors pt-10 pb-8 sm:pt-14 sm:pb-10 ${
          isDark
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-gradient-to-b from-white via-[#F5F9FF] to-[#F5F9FF] border-[#DCE7F5]/70'
        }`}
      >
        {/* Subtle Pale-Blue Geometric Background Decorations (Pure CSS) */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div
            className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl ${
              isDark ? 'bg-[#1769FF]/10' : 'bg-[#EAF3FF]'
            }`}
          />
          <div
            className={`absolute top-12 -left-20 w-72 h-72 rounded-3xl rotate-12 blur-2xl ${
              isDark ? 'bg-[#0755E9]/10' : 'bg-[#EAF3FF]/80'
            }`}
          />
          <div
            className={`hidden lg:block absolute top-8 right-12 w-24 h-24 rounded-2xl border rotate-12 ${
              isDark ? 'border-slate-800/60' : 'border-[#DCE7F5]/60 bg-white/40'
            }`}
          />
          <div
            className={`hidden lg:block absolute bottom-10 left-16 w-20 h-20 rounded-full border ${
              isDark ? 'border-slate-800/60' : 'border-[#DCE7F5]/60 bg-white/40'
            }`}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 animate-fade-in-up">
          {/* Headline */}
          <h1
            className={`text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-[#172B4D]'
            }`}
            style={{ textWrap: 'balance' }}
          >
            {t.heroHeadline}
          </h1>

          {/* Supporting Text */}
          <p
            className={`text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium ${
              isDark ? 'text-slate-300' : 'text-[#687A96]'
            }`}
            style={{ textWrap: 'balance' }}
          >
            {t.heroSubheadline}
          </p>

          {/* Wide Search Bar with White Background, Subtle Blue Border/Shadow, and Blue Search Button */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto pt-2"
            role="search"
          >
            <div
              className={`relative flex items-center rounded-2xl border transition-all duration-200 p-1.5 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 focus-within:border-[#38A5FF] focus-within:ring-4 focus-within:ring-[#1769FF]/20'
                  : 'bg-white border-[#DCE7F5] shadow-[0_8px_26px_-4px_rgba(23,105,255,0.09)] focus-within:border-[#1769FF] focus-within:ring-4 focus-within:ring-[#1769FF]/15'
              }`}
            >
              <div className="pr-3.5 pl-2 text-[#687A96] flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-[#1769FF]" aria-hidden="true" />
              </div>

              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
                className={`w-full py-2.5 px-2 text-sm sm:text-base font-medium bg-transparent focus:outline-none ${
                  isDark
                    ? 'text-white placeholder-slate-400'
                    : 'text-[#172B4D] placeholder-[#687A96]'
                }`}
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="مسح البحث"
                  className="p-2 text-[#687A96] hover:text-[#172B4D] dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-xs sm:text-sm font-bold transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                {t.searchButton}
              </button>
            </div>
          </form>

          {/* Quick Actions: PWA In-App Install Callout & Share Website */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <InstallButton />
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-xs ${
                isDark
                  ? 'border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-white'
                  : 'border-[#DCE7F5] bg-white hover:bg-[#EAF3FF] text-[#172B4D]'
              }`}
            >
              <Share2 className="w-4 h-4 text-[#1769FF]" />
              <span>{isEn ? 'Share Fares Tools' : 'شارك Fares Tools'}</span>
            </button>
          </div>

          {/* Horizontal Category Filter Pills */}
          <div className="pt-2">
            <div
              role="tablist"
              aria-label="تصفية الأدوات حسب القسم"
              className="flex items-center sm:justify-center gap-2 overflow-x-auto no-scrollbar py-1.5 px-1"
            >
              {FILTER_TABS.map((tab) => {
                const isActive = selectedFilter === tab.id;
                const tabLabel = isEn ? tab.labelEn || tab.label : tab.label;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedFilter(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] ${
                      isActive
                        ? 'bg-[#1769FF] text-white shadow-[0_4px_14px_rgba(23,105,255,0.3)] border border-[#1769FF]'
                        : isDark
                        ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:border-[#38A5FF] hover:text-white'
                        : 'bg-white text-[#172B4D] border border-[#DCE7F5] hover:border-[#38A5FF] hover:bg-[#EAF3FF]/50'
                    }`}
                  >
                    <ToolIcon
                      name={tab.iconName}
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-white'
                          : isDark
                          ? 'text-[#38A5FF]'
                          : 'text-[#1769FF]'
                      }`}
                    />
                    <span>{tabLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Tools Grid Container */}
      <div
        ref={toolsGridRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-14"
      >
        {/* Primary iLovePDF-Style Unified Tool Cards Grid */}
        <section className="space-y-5 animate-fade-in-up delay-75">
          {/* Quick Access to Recent Tools if any */}
          {recentToolIds.length > 0 && selectedFilter === 'all' && !normalizedQuery && (
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCE7F5] dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-xs">
              <span className="text-xs font-bold text-[#687A96] dark:text-slate-400 shrink-0 flex items-center gap-1.5 px-2">
                <Clock className="w-3.5 h-3.5 text-[#1769FF]" />
                <span>{isEn ? 'Recently Used:' : 'استخدمتها مؤخراً:'}</span>
              </span>
              <div className="flex items-center gap-2">
                {recentToolIds.slice(0, 6).map((id) => {
                  const tool = SORTED_TOOLS_CATALOG.find((tItem) => tItem.id === id);
                  if (!tool) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => navigate(tool.route)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F9FF] dark:bg-slate-800 hover:bg-[#EAF3FF] dark:hover:bg-slate-750 border border-[#DCE7F5]/60 dark:border-slate-700 text-xs font-bold text-[#172B4D] dark:text-slate-200 hover:text-[#1769FF] dark:hover:text-[#38A5FF] transition-all shrink-0 cursor-pointer"
                    >
                      <ToolIcon name={tool.iconName} className="w-3.5 h-3.5 text-[#1769FF]" />
                      <span>{isEn ? tool.nameEn || tool.name : tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Filter / Search Status Header */}
          {(selectedFilter !== 'all' || normalizedQuery.length > 0) && (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              <div className="flex items-center gap-2">
                <h2
                  className={`text-lg sm:text-xl font-extrabold ${
                    isDark ? 'text-white' : 'text-[#172B4D]'
                  }`}
                >
                  {(() => {
                    const found = FILTER_TABS.find((tItem) => tItem.id === selectedFilter);
                    return isEn ? found?.sectionTitleEn || found?.sectionTitle : found?.sectionTitle;
                  })()}
                </h2>
                <span className="text-xs font-bold text-[#1769FF] tabular-nums">
                  ({filteredTools.length} {isEn ? t.toolsCount : 'أداة'})
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-[#1769FF] hover:text-[#0755E9] hover:underline"
              >
                {isEn ? `Show all ${SORTED_TOOLS_CATALOG.length} tools` : `عرض جميع الأدوات (${SORTED_TOOLS_CATALOG.length})`}
              </button>
            </div>
          )}

          {filteredTools.length > 0 ? (
            /* Responsive Grid: 1 col on narrow, 2 on mobile, 3 on tablet, 4 on medium desktop, 5 on wide desktop */
            <div className="grid grid-cols-1 min-[460px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div
              className={`rounded-2xl border p-12 text-center space-y-4 ${
                isDark
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-[#DCE7F5]'
              }`}
            >
              <p
                className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-[#172B4D]'
                }`}
              >
                {isEn ? `No tools found matching "${searchQuery}"` : `لم نعثر على أداة تطابق «${searchQuery}»`}
              </p>
              <p
                className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-[#687A96]'
                }`}
              >
                {isEn
                  ? 'Try searching by terms like: merge, compress, PDF, images, Word, or convert.'
                  : 'جرّب البحث بكلمات مثل: دمج، ضغط، PDF، صور، Word، أو زكاة.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-xs font-bold transition-colors"
              >
                {isEn ? `Show all tools (${SORTED_TOOLS_CATALOG.length})` : `إظهار كافة الأدوات (${SORTED_TOOLS_CATALOG.length})`}
              </button>
            </div>
          )}
        </section>

        {/* 3. Secondary Category-Browsing Section with Dynamically Calculated Counts */}
        <section className="space-y-6 pt-4 animate-fade-in-up delay-150">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2
              className={`text-2xl sm:text-3xl font-extrabold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              {t.browseByCategory}
            </h2>
            <p
              className={`text-sm sm:text-base ${
                isDark ? 'text-slate-400' : 'text-[#687A96]'
              }`}
            >
              {t.browseCategoryDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FILTER_TABS.filter((tab) => tab.id !== 'all').map((tab) => {
              const dynamicCount = getToolsByFilterCategory(tab.id).length;
              const isSelected = selectedFilter === tab.id;
              const tabTitle = isEn ? tab.sectionTitleEn || tab.sectionTitle : tab.sectionTitle;
              const tabDesc = isEn ? tab.descriptionEn || tab.description : tab.description;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleCategoryBrowsingSelect(tab.id)}
                  className={`group text-start rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] ${
                    isSelected
                      ? 'bg-[#EAF3FF] border-[#1769FF] dark:bg-[#1769FF]/20 dark:border-[#38A5FF]'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 hover:border-[#38A5FF]'
                      : 'bg-white border-[#DCE7F5] hover:border-[#38A5FF] hover:shadow-[0_8px_20px_-6px_rgba(23,105,255,0.12)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isDark
                          ? 'bg-[#1769FF]/20 text-[#38A5FF]'
                          : 'bg-[#EAF3FF] text-[#1769FF]'
                      }`}
                    >
                      <ToolIcon name={tab.iconName} className="w-5 h-5" />
                    </div>

                    <span
                      className={`text-xs font-bold tabular-nums ${
                        isDark ? 'text-[#38A5FF]' : 'text-[#1769FF]'
                      }`}
                    >
                      {dynamicCount} {isEn ? (dynamicCount === 1 ? t.tool : t.toolsCount) : (dynamicCount === 1 ? 'أداة' : 'أدوات')}
                    </span>
                  </div>

                  <div>
                    <h3
                      className={`text-base font-bold mb-1 flex items-center justify-between ${
                        isDark ? 'text-white' : 'text-[#172B4D]'
                      }`}
                    >
                      <span>{tabTitle}</span>
                      <ArrowUpLeft className={`w-4 h-4 text-[#1769FF] opacity-70 group-hover:opacity-100 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 ${isEn ? 'rotate-90' : ''}`} />
                    </h3>
                    <p
                      className={`text-xs leading-relaxed line-clamp-2 ${
                        isDark ? 'text-slate-400' : 'text-[#687A96]'
                      }`}
                    >
                      {tabDesc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Non-intrusive Ad Slot after core tools showcase */}
        <AdSlot placement="home-bottom" format="horizontal" />

        {/* 4. Clean Platform Trust & Features Strip */}
        <section
          className={`rounded-2xl border p-8 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up delay-225 ${
            isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-[#DCE7F5] shadow-[0_2px_12px_rgba(23,105,255,0.04)]'
          }`}
        >
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-xl bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] dark:text-[#38A5FF] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3
              className={`text-base font-bold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              {t.trustSpeedTitle}
            </h3>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-[#687A96]'
              }`}
            >
              {t.trustSpeedDesc}
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-11 h-11 rounded-xl bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#0755E9] dark:text-[#38A5FF] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3
              className={`text-base font-bold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              {t.trustPrivacyTitle}
            </h3>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-[#687A96]'
              }`}
            >
              {t.trustPrivacyDesc}
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-11 h-11 rounded-xl bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] dark:text-[#38A5FF] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3
              className={`text-base font-bold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              {SORTED_TOOLS_CATALOG.length} {isEn ? 'Tools in One Suite' : 'أداة في منصة واحدة'}
            </h3>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-[#687A96]'
              }`}
            >
              {t.trustCatalogDesc}
            </p>
          </div>
        </section>

        {/* 5. User Feedback & WhatsApp Contact Section */}
        <section className="pt-2 animate-fade-in-up">
          <WhatsAppFeedbackSection />
        </section>
      </div>

      {/* Global Social Share Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
