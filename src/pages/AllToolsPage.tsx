import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import {
  SORTED_TOOLS_CATALOG,
  FILTER_TABS,
  getToolsByFilterCategory,
} from '../data/toolsCatalog';
import { FilterCategoryId } from '../types/tools';
import { ToolCard } from '../components/ToolCard';
import { ToolIcon } from '../components/ToolIcon';
import { useApp } from '../context/AppContext';
import { usePageSeo } from '../hooks/usePageSeo';
import { AdSlot } from '../components/AdSlot';

export const AllToolsPage: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    currentPath,
    navigate,
    settings,
    favorites,
    lang,
    t,
  } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';

  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategoryId>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'favorites'>('all');

  usePageSeo({
    title: isEn
      ? `All Online Utilities (${SORTED_TOOLS_CATALOG.length} Tools) | Fares Tools`
      : `جميع الأدوات الرقمية (${SORTED_TOOLS_CATALOG.length} أداة) | فارس TOOLS`,
    description: isEn
      ? `Explore all ${SORTED_TOOLS_CATALOG.length} private in-browser digital tools: PDF merger, compressor, split, Office conversions, watermark removal, image resizing, video/audio editors, and calculators.`
      : 'استعرض كتالوج أدوات فارس الكامل: دمج وتقسيم وضغط PDF، تحويل Office، إزالة العلامات المائية، تحرير وضغط الصور، معالجة الفيديو والصوت، وتصحيح اللغة العربية.',
    canonicalPath: '/all-tools',
  });

  // Parse query param ?category=... if navigated from Header or Footer
  useEffect(() => {
    const queryIdx = currentPath.indexOf('?');
    if (queryIdx !== -1) {
      const params = new URLSearchParams(currentPath.slice(queryIdx));
      const catParam = params.get('category') as FilterCategoryId | null;
      if (catParam && FILTER_TABS.some((c) => c.id === catParam)) {
        setSelectedCategory(catParam);
      } else {
        setSelectedCategory('all');
      }
    } else {
      setSelectedCategory('all');
    }
  }, [currentPath]);

  const handleCategorySelect = (tabId: FilterCategoryId) => {
    setSelectedCategory(tabId);
    if (tabId === 'all') {
      navigate('/all-tools');
    } else {
      navigate(`/all-tools?category=${tabId}`);
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const baseTools = getToolsByFilterCategory(selectedCategory);

  const filteredTools = baseTools.filter((tool) => {
    if (statusFilter === 'favorites' && !favorites.includes(tool.id)) {
      return false;
    }
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

  const activeTabInfo =
    FILTER_TABS.find((t) => t.id === selectedCategory) || FILTER_TABS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <h1
          className={`text-2xl sm:text-4xl font-extrabold ${
            isDark ? 'text-white' : 'text-[#172B4D]'
          }`}
        >
          {selectedCategory === 'all'
            ? `${t.allTools} (${filteredTools.length} ${isEn ? t.toolsCount : 'أداة'})`
            : `${isEn ? activeTabInfo.sectionTitleEn || activeTabInfo.sectionTitle : activeTabInfo.sectionTitle} (${filteredTools.length})`}
        </h1>
        <p
          className={`text-sm sm:text-base ${
            isDark ? 'text-slate-400' : 'text-[#687A96]'
          }`}
        >
          {isEn ? activeTabInfo.descriptionEn || activeTabInfo.description : activeTabInfo.description}
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div
        className={`rounded-2xl border p-5 space-y-4 ${
          isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-[#DCE7F5] shadow-[0_4px_16px_rgba(23,105,255,0.05)]'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 relative">
            <Search
              className={`w-5 h-5 text-[#1769FF] absolute top-1/2 -translate-y-1/2 pointer-events-none ${isEn ? 'left-3.5' : 'right-3.5'}`}
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className={`w-full rounded-xl py-3 text-sm border transition-all focus:outline-none focus:border-[#1769FF] focus:ring-3 focus:ring-[#1769FF]/15 ${
                isEn ? 'pl-11 pr-10' : 'pr-11 pl-10'
              } ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D] placeholder-[#687A96]'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="مسح البحث"
                className={`absolute top-1/2 -translate-y-1/2 p-1 text-[#687A96] hover:text-[#172B4D] dark:hover:text-white transition-colors cursor-pointer ${
                  isEn ? 'right-3' : 'left-3'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#1769FF] shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'favorites')
              }
              aria-label="تصفية قائمة العرض"
              className={`w-full rounded-xl px-3.5 py-3 text-xs sm:text-sm font-semibold border focus:outline-none focus:border-[#1769FF] cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
              }`}
            >
              <option value="all">
                {isEn ? `All Tools (${SORTED_TOOLS_CATALOG.length})` : `جميع الأدوات (${SORTED_TOOLS_CATALOG.length} أداة)`}
              </option>
              <option value="favorites">
                {isEn ? `Favorite Tools (${favorites.length})` : `الأدوات المفضلة فقط (${favorites.length})`}
              </option>
            </select>
          </div>
        </div>

        {/* Horizontal Pill Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {FILTER_TABS.map((tab) => {
            const count = getToolsByFilterCategory(tab.id).length;
            const active = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleCategorySelect(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#1769FF] text-white border border-[#1769FF] shadow-xs'
                    : isDark
                    ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-[#38A5FF]'
                    : 'bg-white text-[#172B4D] border border-[#DCE7F5] hover:border-[#38A5FF] hover:bg-[#EAF3FF]/50'
                }`}
              >
                <ToolIcon
                  name={tab.iconName}
                  className={`w-3.5 h-3.5 ${
                    active ? 'text-white' : 'text-[#1769FF]'
                  }`}
                />
                <span>
                  {tab.label} ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Grid with non-intrusive AdSlot placed after the initial batch of cards */}
      {filteredTools.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 min-[460px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {filteredTools.slice(0, 10).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          {filteredTools.length > 5 && (
            <AdSlot placement="all-tools-middle" format="horizontal" />
          )}

          {filteredTools.length > 10 && (
            <div className="grid grid-cols-1 min-[460px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {filteredTools.slice(10).map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
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
            لا توجد أدوات مطابقة لخيارات البحث الحالية
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setStatusFilter('all');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-xs font-bold"
          >
            إعادة تعيين البحث
          </button>
        </div>
      )}
    </div>
  );
};
