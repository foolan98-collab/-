import React, { useState } from 'react';
import { Heart, Settings, Sun, Moon, Menu, X, Globe, Share2, MessageCircle } from 'lucide-react';
import { KnightLogo } from './KnightLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { SocialShareModal } from './SocialShareModal';
import { WHATSAPP_LINK_BASE } from './WhatsAppFeedbackSection';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    currentPath,
    navigate,
    favorites,
    settings,
    updateSettings,
    lang,
    setLang,
    t,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';

  const navLinks = [
    { label: t.home, path: '/' },
    { label: t.allTools, path: '/all-tools' },
    { label: t.pdfTools, path: '/all-tools?category=pdf' },
    { label: t.imageTools, path: '/all-tools?category=images' },
    { label: t.documentTools, path: '/all-tools?category=documents' },
  ];

  const isNavLinkActive = (linkPath: string) => {
    if (linkPath === '/') {
      return currentPath === '/' || currentPath === '';
    }
    if (linkPath === '/all-tools') {
      return currentPath === '/all-tools';
    }
    return currentPath === linkPath;
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    updateSettings({ theme: isDark ? 'light' : 'dark' });
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors ${
        isDark
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-white border-[#DCE7F5] text-[#172B4D] shadow-[0_2px_12px_rgba(23,105,255,0.04)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Right Zone (in RTL): Animated Arabian Horse Logo + Exact "فارس TOOLS" Brand Name */}
        <button
          type="button"
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-3 text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] rounded-xl whitespace-nowrap shrink-0 group cursor-pointer"
          aria-label="فارس TOOLS - الرئيسية"
        >
          <KnightLogo
            size={40}
            animate={!settings.reducedMotion}
            showWordmark={true}
            wordmarkClassName={
              isDark
                ? 'text-white group-hover:text-[#38A5FF] transition-colors'
                : 'text-[#172B4D] group-hover:text-[#1769FF] transition-colors'
            }
          />
        </button>

        {/* Center Zone: Clean iLovePDF-style Horizontal Navigation Links */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden lg:flex items-center gap-5 xl:gap-8 text-sm font-bold h-full"
        >
          {navLinks.map((item) => {
            const active = isNavLinkActive(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavClick(item.path)}
                className={`relative h-full inline-flex items-center px-1 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] ${
                  active
                    ? 'text-[#1769FF]'
                    : isDark
                    ? 'text-slate-300 hover:text-[#38A5FF]'
                    : 'text-[#172B4D] hover:text-[#1769FF]'
                }`}
              >
                <span>{item.label}</span>
                {active && (
                  <span className="absolute bottom-0 right-0 left-0 h-[3px] bg-[#1769FF] rounded-t-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Left Zone (in RTL): Quick Utility Actions (Install, Favorites, Settings, Theme, Mobile Menu) */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />

          <button
            type="button"
            onClick={() => handleNavClick('/favorites')}
            className={`relative p-2 rounded-lg border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] ${
              currentPath.startsWith('/favorites')
                ? 'border-[#1769FF] bg-[#EAF3FF] text-[#1769FF]'
                : isDark
                ? 'border-slate-800 bg-slate-800/70 text-slate-300 hover:text-white'
                : 'border-[#DCE7F5] bg-[#F5F9FF] text-[#687A96] hover:text-[#1769FF] hover:border-[#38A5FF]'
            }`}
            aria-label={`الأدوات المفضلة (${favorites.length})`}
            title={`المفضلة (${favorites.length})`}
          >
            <Heart
              className={`w-4 h-4 ${
                favorites.length > 0 ? 'text-rose-500 fill-rose-500/20' : ''
              }`}
            />
            {favorites.length > 0 && (
              <span className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#1769FF] text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums shadow-xs">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('/settings')}
            className={`p-2 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] ${
              currentPath.startsWith('/settings')
                ? 'border-[#1769FF] bg-[#EAF3FF] text-[#1769FF]'
                : isDark
                ? 'border-slate-800 bg-slate-800/70 text-slate-300 hover:text-white'
                : 'border-[#DCE7F5] bg-[#F5F9FF] text-[#687A96] hover:text-[#1769FF] hover:border-[#38A5FF]'
            }`}
            aria-label="الإعدادات"
            title="الإعدادات"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] ${
              isDark
                ? 'border-slate-800 bg-slate-800/70 text-[#38A5FF] hover:bg-slate-800'
                : 'border-[#DCE7F5] bg-[#F5F9FF] text-[#687A96] hover:text-[#1769FF] hover:border-[#38A5FF]'
            }`}
            aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
            title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setLang(isEn ? 'ar' : 'en')}
            className={`p-2 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] flex items-center gap-1.5 text-xs font-bold ${
              isDark
                ? 'border-slate-800 bg-slate-800/70 text-slate-300 hover:text-white'
                : 'border-[#DCE7F5] bg-[#F5F9FF] text-[#172B4D] hover:text-[#1769FF] hover:border-[#38A5FF]'
            }`}
            aria-label={isEn ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
            title={isEn ? 'العربية' : 'English'}
          >
            <Globe className="w-4 h-4 text-[#1769FF]" />
            <span className="hidden sm:inline">{isEn ? 'العربية' : 'English'}</span>
          </button>

          {/* Quick Share Button in Header */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className={`p-2 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] cursor-pointer ${
              isDark
                ? 'border-slate-800 bg-slate-800/70 text-slate-300 hover:text-white'
                : 'border-[#DCE7F5] bg-[#F5F9FF] text-[#687A96] hover:text-[#1769FF] hover:border-[#38A5FF]'
            }`}
            aria-label={isEn ? 'Share Website' : 'مشاركة الموقع'}
            title={isEn ? 'Share Fares Tools' : 'شارك Fares Tools'}
          >
            <Share2 className="w-4 h-4 text-[#1769FF]" />
          </button>

          {/* Responsive Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`lg:hidden p-2 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] cursor-pointer ${
              isDark
                ? 'border-slate-800 bg-slate-800 text-white'
                : 'border-[#DCE7F5] bg-[#F5F9FF] text-[#172B4D]'
            }`}
            aria-expanded={mobileMenuOpen}
            aria-label={isEn ? 'Main Menu' : 'القائمة الرئيسية'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile/Tablet Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className={`lg:hidden border-t px-4 sm:px-6 pt-3 pb-5 space-y-3 ${
            isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-[#DCE7F5]'
          }`}
        >
          <div className="pb-1">
            <PWAInstallButton variant="mobile-drawer" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {navLinks.map((item) => {
              const active = isNavLinkActive(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className={`px-4 py-2.5 rounded-xl text-start text-sm font-bold transition-colors ${
                    active
                      ? 'bg-[#1769FF] text-white'
                      : isDark
                      ? 'text-slate-200 hover:bg-slate-800'
                      : 'text-[#172B4D] hover:bg-[#EAF3FF]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="pt-2 mt-1 border-t border-[#DCE7F5] dark:border-slate-800 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleNavClick('/favorites')}
                className={`px-3 py-2 rounded-xl text-xs font-bold text-center border ${
                  isDark
                    ? 'border-slate-800 text-slate-300'
                    : 'border-[#DCE7F5] bg-[#F5F9FF] text-[#172B4D]'
                }`}
              >
                {t.favorites} ({favorites.length})
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('/settings')}
                className={`px-3 py-2 rounded-xl text-xs font-bold text-center border ${
                  isDark
                    ? 'border-slate-800 text-slate-300'
                    : 'border-[#DCE7F5] bg-[#F5F9FF] text-[#172B4D]'
                }`}
              >
                {t.settings}
              </button>
              <button
                type="button"
                onClick={() => setLang(isEn ? 'ar' : 'en')}
                className={`px-3 py-2 rounded-xl text-xs font-bold text-center border ${
                  isDark
                    ? 'border-slate-800 text-slate-300'
                    : 'border-[#DCE7F5] bg-[#F5F9FF] text-[#172B4D]'
                }`}
              >
                {isEn ? 'العربية' : 'English'}
              </button>
            </div>

            {/* Mobile Drawer Share & WhatsApp Quick Links */}
            <div className="pt-2 mt-1 border-t border-[#DCE7F5] dark:border-slate-800 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsShareModalOpen(true);
                }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border ${
                  isDark
                    ? 'border-slate-800 bg-slate-800 text-white'
                    : 'border-[#DCE7F5] bg-[#F5F9FF] text-[#172B4D]'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-[#1769FF]" />
                <span>{isEn ? 'Share Platform' : 'شارك الموقع'}</span>
              </button>

              <a
                href={`${WHATSAPP_LINK_BASE}?text=${encodeURIComponent(
                  isEn
                    ? 'Hello! I am reaching out regarding Fares Tools.'
                    : 'مرحبًا، أتواصل معك بخصوص موقع Fares Tools.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#25D366] text-white"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>{isEn ? 'WhatsApp' : 'واتساب المالك'}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Global Social Share Modal from Header */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </header>
  );
};
