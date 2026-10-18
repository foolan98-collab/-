import React, { useState } from 'react';
import { Heart, Trash2, Sparkles, Search, X, Clock } from 'lucide-react';
import {
  TOOLS_CATALOG,
  POPULAR_TOOLS,
  FILTER_TABS,
} from '../data/toolsCatalog';
import { FilterCategoryId } from '../types/tools';
import { ToolCard } from '../components/ToolCard';
import { useApp } from '../context/AppContext';
import { usePageSeo } from '../hooks/usePageSeo';

export const FavoritesPage: React.FC = () => {
  const {
    favorites,
    clearFavorites,
    recentToolIds,
    clearRecentTools,
    navigate,
    settings,
    lang,
    t,
  } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';

  usePageSeo({
    title: isEn
      ? 'Favorite Tools & Recent History | Fares Tools'
      : 'الأدوات المفضلة وسجل الاستخدام | فارس TOOLS',
    description: isEn
      ? 'Your personalized list of saved utilities in Fares Tools with fast 1-click access and category filters.'
      : 'قائمتك الشخصية للأدوات المفضلة في منصة فارس TOOLS، مع إمكانية الوصول السريع والتصفية حسب الأقسام.',
    canonicalPath: '/favorites',
  });

  const [localQuery, setLocalQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategoryId>('all');
  const [confirmClearFavs, setConfirmClearFavs] = useState(false);

  const favoriteTools = TOOLS_CATALOG.filter((tool) =>
    favorites.includes(tool.id)
  );

  const filteredFavoriteTools = favoriteTools.filter((tool) => {
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'documents') {
        if (!tool.isDocumentConversion) return false;
      } else if (tool.category !== selectedCategory) {
        return false;
      }
    }
    const q = localQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.shortDesc.toLowerCase().includes(q) ||
      tool.slug.toLowerCase().includes(q)
    );
  });

  const recentTools = recentToolIds
    .map((id) => TOOLS_CATALOG.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const handleClearFavoritesClick = () => {
    if (settings.confirmBeforeClear && !confirmClearFavs) {
      setConfirmClearFavs(true);
      setTimeout(() => setConfirmClearFavs(false), 3500);
      return;
    }
    setConfirmClearFavs(false);
    clearFavorites();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-[#DCE7F5] dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>قائمتك الشخصية المحفوظة محلياً</span>
          </div>
          <h1
            className={`text-2xl sm:text-4xl font-extrabold ${
              isDark ? 'text-white' : 'text-[#172B4D]'
            }`}
          >
            الأدوات المفضلة ({favoriteTools.length})
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#687A96]'}`}>
            احفظ الأدوات التي تستخدمها يومياً للوصول إليها فوراً بضغطة واحدة.
          </p>
        </div>

        {favoriteTools.length > 0 && (
          <button
            type="button"
            onClick={handleClearFavoritesClick}
            className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              confirmClearFavs
                ? 'bg-rose-600 text-white'
                : 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {confirmClearFavs
                ? 'اضغط مرة أخرى لتأكيد الإفراغ'
                : 'إفراغ قائمة المفضلة'}
            </span>
          </button>
        )}
      </div>

      {/* Quick Search & Category Filter inside Favorites when user has tools saved */}
      {favoriteTools.length > 0 && (
        <div
          className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${
            isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-[#DCE7F5] shadow-[0_2px_12px_rgba(23,105,255,0.04)]'
          }`}
        >
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#1769FF] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="ابحث داخل أدواتك المفضلة..."
              aria-label="ابحث داخل أدواتك المفضلة"
              className={`w-full rounded-xl pr-10 pl-9 py-2.5 text-sm border transition-all focus:outline-none focus:border-[#1769FF] ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D] placeholder-[#687A96]'
              }`}
            />
            {localQuery && (
              <button
                type="button"
                onClick={() => setLocalQuery('')}
                aria-label="مسح البحث"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#687A96] hover:text-[#172B4D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#1769FF] text-white'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-[#F5F9FF] text-[#172B4D] hover:bg-[#EAF3FF]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {favoriteTools.length > 0 ? (
        filteredFavoriteTools.length > 0 ? (
          <div className="grid grid-cols-1 min-[460px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {filteredFavoriteTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div
            className={`rounded-2xl border p-10 text-center space-y-3 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
            }`}
          >
            <p className="text-base font-bold">
              {isEn ? 'No favorite tools match your search' : 'لا توجد أداة في مفضلتك تطابق البحث الحالي'}
            </p>
            <button
              type="button"
              onClick={() => {
                setLocalQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-[#1769FF] text-white text-xs font-bold cursor-pointer"
            >
              {isEn ? `Show all ${favoriteTools.length} favorites` : `إظهار جميع المفضلة (${favoriteTools.length})`}
            </button>
          </div>
        )
      ) : (
        <div
          className={`rounded-2xl border p-12 text-center space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#EAF3FF] text-[#1769FF] flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h2
            className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-[#172B4D]'
            }`}
          >
            {t.favoritesEmptyTitle}
          </h2>
          <p className="text-sm text-[#687A96] max-w-md mx-auto">
            {t.favoritesEmptyDesc}
          </p>
          <button
            type="button"
            onClick={() => navigate('/all-tools')}
            className="px-6 py-3 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            {t.exploreAllTools}
          </button>
        </div>
      )}

      {/* Recently Used Tools Section */}
      {recentTools.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1769FF]" />
              <h3
                className={`text-lg font-extrabold ${
                  isDark ? 'text-white' : 'text-[#172B4D]'
                }`}
              >
                {t.recentTools} ({recentTools.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={clearRecentTools}
              className="text-xs font-bold text-[#687A96] hover:text-rose-500 transition-colors cursor-pointer"
            >
              {t.clearHistory}
            </button>
          </div>
          <div className="grid grid-cols-1 min-[460px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {recentTools.slice(0, 5).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* Suggested Popular Tools */}
      {favoriteTools.length < 5 && (
        <div className="space-y-5 pt-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1769FF]" />
            <h3
              className={`text-lg font-extrabold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              {t.suggestedTools}
            </h3>
          </div>
          <div className="grid grid-cols-1 min-[460px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {POPULAR_TOOLS.slice(0, 5).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

