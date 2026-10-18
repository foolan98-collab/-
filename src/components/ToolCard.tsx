import React from 'react';
import { Heart, ArrowUpLeft } from 'lucide-react';
import { ToolItem } from '../types/tools';
import { ToolIcon } from './ToolIcon';
import { useApp } from '../context/AppContext';
import { getToolColorPalette } from '../utils/toolColors';

interface ToolCardProps {
  tool: ToolItem;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { navigate, isFavorite, toggleFavorite, settings, lang, t } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';
  const fav = isFavorite(tool.id);

  // Each tool gets its color, and similar tools share the same color family
  const palette = getToolColorPalette(tool.slug, tool.category);

  const displayName = isEn ? tool.nameEn || tool.name : tool.name;
  const displayDesc = isEn ? tool.shortDescEn || tool.shortDesc : tool.shortDesc;

  const handleCardClick = () => {
    navigate(tool.route);
  };

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(tool.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`group relative rounded-2xl p-5 text-start transition-all duration-200 cursor-pointer border overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] flex flex-col justify-between min-h-[184px] ${
        isDark
          ? `bg-slate-900 border-slate-800 ${palette.cardBorderHoverDark} hover:-translate-y-1 ${palette.cardShadowHover}`
          : `bg-white border-[#DCE7F5] ${palette.cardBorderHoverLight} hover:-translate-y-1 shadow-[0_2px_8px_rgba(23,105,255,0.04)] ${palette.cardShadowHover}`
      }`}
    >
      {/* Top Color Bar Indicator matching the tool's family color */}
      <span
        className="absolute top-0 right-0 left-0 h-1 transition-opacity duration-200 opacity-85 group-hover:opacity-100"
        style={{ backgroundColor: palette.accentHex }}
        aria-hidden="true"
      />

      <div>
        <div className="flex items-start justify-between gap-2 mb-3.5 pt-0.5">
          {/* Colored Icon Container */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
              isDark
                ? `${palette.iconBgDark} ${palette.iconTextDark}`
                : `${palette.iconBgLight} ${palette.iconTextLight}`
            }`}
          >
            <ToolIcon name={tool.iconName} className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleFavClick}
              aria-label={
                fav
                  ? (isEn ? `Remove ${displayName} from favorites` : `إزالة ${displayName} من المفضلة`)
                  : (isEn ? `Add ${displayName} to favorites` : `إضافة ${displayName} إلى المفضلة`)
              }
              title={fav ? (isEn ? 'Remove from favorites' : 'إزالة من المفضلة') : (isEn ? 'Add to favorites' : 'إضافة إلى المفضلة')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] ${
                fav
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/20'
                  : isDark
                  ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                  : 'text-[#687A96]/75 hover:text-rose-500 hover:bg-rose-50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-current' : ''}`} />
            </button>

            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isDark ? 'text-slate-500' : 'text-[#687A96]'
              } ${palette.arrowHoverBg} ${palette.arrowHoverText}`}
              aria-hidden="true"
            >
              <ArrowUpLeft className={`w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 ${isEn ? 'rotate-90' : ''}`} />
            </span>
          </div>
        </div>

        {/* Clear Tool Title */}
        <h3
          className={`text-[15px] sm:text-base font-bold mb-1.5 leading-snug transition-colors ${
            isDark ? 'text-white' : 'text-[#172B4D]'
          } ${palette.titleHoverText}`}
        >
          {displayName}
        </h3>

        {/* Concise Description */}
        <p
          className={`text-xs leading-relaxed line-clamp-2 ${
            isDark ? 'text-slate-400' : 'text-[#687A96]'
          }`}
        >
          {displayDesc}
        </p>
      </div>

      {/* Subtle Family Group Label at the bottom */}
      <div
        className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] ${
          isDark
            ? 'border-slate-800/80 text-slate-400'
            : 'border-slate-100 text-[#687A96]'
        }`}
      >
        <span className="truncate">{palette.groupLabel}</span>
        <span
          className={`font-bold shrink-0 ${
            isDark ? palette.iconTextDark : palette.iconTextLight
          }`}
        >
          {t.open}
        </span>
      </div>
    </div>
  );
};
