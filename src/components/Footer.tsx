import React, { useState } from 'react';
import { KnightLogo } from './KnightLogo';
import { useApp } from '../context/AppContext';
import { FILTER_TABS } from '../data/toolsCatalog';
import { Share2, MessageCircle } from 'lucide-react';
import { SocialShareModal } from './SocialShareModal';
import {
  WHATSAPP_LINK_BASE,
  WHATSAPP_PHONE_LOCAL,
} from './WhatsAppFeedbackSection';

export const Footer: React.FC = () => {
  const { navigate, settings, lang, t } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const defaultGreeting = isEn
    ? 'Hello! I am reaching out regarding Fares Tools. I have an inquiry or suggestion I would like to share with you.'
    : 'مرحبًا، أتواصل معك بخصوص موقع Fares Tools. لدي استفسار أو اقتراح أود مشاركته معك.';

  return (
    <footer
      className={`border-t transition-colors ${
        isDark
          ? 'bg-slate-900 border-slate-800 text-slate-300'
          : 'bg-white border-[#DCE7F5] text-[#687A96]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Column & Quick Contact Actions */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 text-start focus:outline-none group cursor-pointer"
            >
              <KnightLogo
                size={40}
                animate={!settings.reducedMotion}
                showWordmark={true}
                wordmarkClassName={isDark ? 'text-white' : 'text-[#172B4D]'}
              />
            </button>
            <p
              className={`text-sm leading-relaxed max-w-xs ${
                isDark ? 'text-slate-400' : 'text-[#687A96]'
              }`}
            >
              {t.brandDescription}
            </p>

            {/* Quick Action Buttons in Footer: WhatsApp Contact & Share */}
            <div className="pt-2 flex flex-col gap-2 max-w-xs">
              <a
                href={`${WHATSAPP_LINK_BASE}?text=${encodeURIComponent(defaultGreeting)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{isEn ? 'Contact Owner via WhatsApp' : 'تواصل معنا عبر واتساب'}</span>
              </a>

              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white'
                    : 'border-[#DCE7F5] bg-[#F5F9FF] hover:bg-[#EAF3FF] text-[#172B4D]'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-[#1769FF]" />
                <span>{isEn ? 'Share Fares Tools' : 'شارك Fares Tools'}</span>
              </button>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h3
              className={`text-sm font-bold mb-4 ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              {isEn ? 'Categories' : 'أقسام الأدوات'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {FILTER_TABS.filter((tItem) => tItem.id !== 'all').map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/all-tools?category=${cat.id}`)}
                    className={`transition-colors hover:text-[#1769FF] ${
                      isDark ? 'text-slate-400' : 'text-[#687A96]'
                    }`}
                  >
                    {isEn ? cat.sectionTitleEn || cat.sectionTitle : cat.sectionTitle}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Shortcuts */}
          <div>
            <h3
              className={`text-sm font-bold mb-4 ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              {isEn ? 'Popular Tools' : 'الأدوات الأكثر استخداماً'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/tools/merge-pdf')}
                  className="hover:text-[#1769FF] transition-colors"
                >
                  {isEn ? 'Merge PDF Files' : 'دمج ملفات PDF'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/tools/compress-pdf')}
                  className="hover:text-[#1769FF] transition-colors"
                >
                  {isEn ? 'Compress PDF Files' : 'ضغط ملفات PDF'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/tools/split-pdf')}
                  className="hover:text-[#1769FF] transition-colors"
                >
                  {isEn ? 'Split PDF Files' : 'تقسيم ملفات PDF'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/tools/jpg-to-pdf')}
                  className="hover:text-[#1769FF] transition-colors"
                >
                  {isEn ? 'Convert JPG to PDF' : 'تحويل صور JPG إلى PDF'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/tools/pdf-to-word')}
                  className="hover:text-[#1769FF] transition-colors"
                >
                  {isEn ? 'Convert PDF to Word' : 'تحويل PDF إلى Word'}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Information Links */}
          <div>
            <h3
              className={`text-sm font-bold mb-4 ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              {isEn ? 'About & Legal' : 'معلومات المنصة'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/about')}
                  className="hover:text-[#1769FF] transition-colors"
                >
                  {t.aboutUs}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/privacy')}
                  className="hover:text-[#1769FF] transition-colors"
                >
                  {t.privacyPolicy}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/terms')}
                  className="hover:text-[#1769FF] transition-colors"
                >
                  {t.termsOfUse}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className="hover:text-[#1769FF] transition-colors"
                >
                  {t.contactUs}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div
          className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
            isDark ? 'border-slate-800 text-slate-500' : 'border-[#DCE7F5] text-[#687A96]'
          }`}
        >
          <p>
            © {new Date().getFullYear()} <strong>{t.brandName}</strong>. {t.allRightsReserved}
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="hover:text-[#1769FF] transition-colors"
            >
              {t.privacyPolicy}
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => navigate('/terms')}
              className="hover:text-[#1769FF] transition-colors"
            >
              {t.termsOfUse}
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="hover:text-[#1769FF] transition-colors"
            >
              {t.contactUs}
            </button>
          </div>
        </div>
      </div>

      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </footer>
  );
};
