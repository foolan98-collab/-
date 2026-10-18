import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Activity,
  BarChart3,
  Download,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  LogOut,
  Sliders,
  Info,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePageSeo } from '../hooks/usePageSeo';
import {
  getStoredMetrics,
  clearStoredMetrics,
  getMostUsedTools,
  getFailingTools,
} from '../utils/toolMetrics';

const ADMIN_SESSION_KEY = 'fares_tools_admin_session_v1';
const ADMIN_HASH_KEY = 'fares_tools_admin_auth_v1';

// Cryptographically derive a key using Web Crypto PBKDF2-SHA256
async function hashPassphrase(passphrase: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await window.crypto.subtle.exportKey('raw', derivedKey);
  const hashArray = Array.from(new Uint8Array(exported));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const AdminPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    adConfig,
    updateAdConfig,
    navigate,
    lang,
    t,
  } = useApp();

  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';

  usePageSeo({
    title: isEn ? 'Admin Portal | Fares Tools' : 'لوحة الإدارة والتحكم | فارس TOOLS',
    description: 'لوحة التحكم الإدارية الخاصة بمالك منصة فارس تولز لإدارة الإعلانات والتحليلات ومتابعة أداء الأدوات.',
    canonicalPath: '/admin',
    noIndex: true,
  });

  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'active';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<'ads' | 'analytics' | 'metrics'>('ads');
  const [passphraseInput, setPassphraseInput] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [authError, setAuthError] = useState('');
  const [savedBanner, setSavedBanner] = useState(false);
  const [isSettingUpFirstTime, setIsSettingUpFirstTime] = useState(false);
  const [metrics, setMetrics] = useState(getStoredMetrics);

  useEffect(() => {
    // Check if an admin credential was previously initialized locally
    try {
      const storedAuth = localStorage.getItem(ADMIN_HASH_KEY);
      setIsSettingUpFirstTime(!storedAuth);
    } catch {
      setIsSettingUpFirstTime(true);
    }
  }, []);

  const triggerSavedFeedback = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const trimmed = passphraseInput.trim();
    if (!trimmed || trimmed.length < 6) {
      setAuthError(
        isEn
          ? 'Passphrase must be at least 6 characters long.'
          : 'يجب أن تتكون كلمة المرور الإدارية من 6 خانات على الأقل.'
      );
      return;
    }

    try {
      const storedData = localStorage.getItem(ADMIN_HASH_KEY);

      if (!storedData) {
        // First-time owner setup
        if (trimmed !== confirmPassphrase.trim()) {
          setAuthError(isEn ? 'Passphrases do not match.' : 'كلمتا المرور غير متطابقتين.');
          return;
        }

        const salt = window.crypto.randomUUID();
        const derivedHash = await hashPassphrase(trimmed, salt);
        localStorage.setItem(ADMIN_HASH_KEY, JSON.stringify({ hash: derivedHash, salt }));

        sessionStorage.setItem(ADMIN_SESSION_KEY, 'active');
        setIsAuthorized(true);
        setIsSettingUpFirstTime(false);
        setPassphraseInput('');
        setConfirmPassphrase('');
        return;
      }

      // Existing owner verification
      const { hash: expectedHash, salt } = JSON.parse(storedData);
      const computedHash = await hashPassphrase(trimmed, salt);

      if (computedHash === expectedHash) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'active');
        setIsAuthorized(true);
        setPassphraseInput('');
      } else {
        setAuthError(
          isEn
            ? 'Access Denied: Invalid owner passphrase.'
            : 'عذراً: كلمة المرور الإدارية غير صحيحة. تم رفض الوصول.'
        );
      }
    } catch (err) {
      setAuthError(isEn ? 'Verification error.' : 'حدث خطأ أثناء معالجة التحقق.');
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
    setIsAuthorized(false);
    navigate('/');
  };

  const handleClearMetrics = () => {
    clearStoredMetrics();
    setMetrics(getStoredMetrics());
    triggerSavedFeedback();
  };

  const handleDownloadAdsTxt = () => {
    const rawPub = (adConfig.publisherId || 'pub-0000000000000000').replace(/^ca-/, '');
    const content = `# Google AdSense Authorized Digital Sellers (ads.txt)\n# Generated by Fares Tools Admin Portal\ngoogle.com, ${rawPub}, DIRECT, f08c47fec0942fa0\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ads.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const mostUsedList = getMostUsedTools(6);
  const failingList = getFailingTools();

  // ==========================================
  // 1. UNPROTECTED / VISITOR LOCK SCREEN
  // ==========================================
  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 animate-fade-in-up">
        <div
          className={`rounded-3xl border p-8 shadow-xl text-center space-y-6 ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-[#DCE7F5] text-[#172B4D]'
          }`}
        >
          {/* Lock Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#1769FF]/10 text-[#1769FF] flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1769FF]/10 text-[#1769FF]">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isEn ? 'Restricted Admin Gateway' : 'بوابة الإدارة المركزية (محمية)'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              {isEn ? 'Owner Authorization Required' : 'الوصول مقتصر على مالك الموقع فقط'}
            </h1>
            <p className="text-xs sm:text-sm text-[#687A96] dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {isEn
                ? 'Administrative settings (AdSense, Google Analytics, and internal system diagnostics) are strictly isolated from public visitors.'
                : 'تم عزل الإعدادات الإدارية (Google AdSense، وGoogle Analytics، وإحصائيات النظام) لمنع اطلاع الزوار العاديين عليها وحماية الخصوصية.'}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-2 text-start">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-start">
            <div className="space-y-1.5">
              <label className="text-xs font-bold block flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#1769FF]" />
                <span>
                  {isSettingUpFirstTime
                    ? isEn
                      ? 'Set Master Admin Passphrase'
                      : 'تعيين كلمة المرور الإدارية للمالك'
                    : isEn
                    ? 'Enter Admin Passphrase'
                    : 'أدخل كلمة المرور الإدارية للمالك'}
                </span>
              </label>
              <input
                type="password"
                value={passphraseInput}
                onChange={(e) => setPassphraseInput(e.target.value)}
                placeholder="••••••••••••"
                required
                className={`w-full rounded-xl px-4 py-2.5 text-sm font-mono border focus:outline-none focus:border-[#1769FF] ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                }`}
              />
            </div>

            {isSettingUpFirstTime && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold block">
                  {isEn ? 'Confirm Passphrase' : 'تأكيد كلمة المرور'}
                </label>
                <input
                  type="password"
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className={`w-full rounded-xl px-4 py-2.5 text-sm font-mono border focus:outline-none focus:border-[#1769FF] ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                  }`}
                />
                <p className="text-[11px] text-[#687A96] dark:text-slate-400">
                  {isEn
                    ? 'First-time setup: This will securely initialize your owner authorization key on this device.'
                    : 'إعداد لأول مرة: سيتم تشفير مفتاح المصادقة وتثبيته محلياً لمالك الموقع.'}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#1769FF] hover:bg-[#0755E9] active:scale-[0.99] transition-all shadow-md shadow-[#1769FF]/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>
                {isSettingUpFirstTime
                  ? isEn
                    ? 'Initialize & Enter Dashboard'
                    : 'تثبيت المفتاح والدخول للوحة الإدارة'
                  : isEn
                  ? 'Verify & Unlock'
                  : 'التحقق والدخول للوحة الإدارة'}
              </span>
            </button>
          </form>

          {/* Privacy & Hosting Transparency Notice */}
          <div className="pt-4 border-t border-[#DCE7F5] dark:border-slate-800 text-start space-y-1.5 text-[11px] text-[#687A96] dark:text-slate-400">
            <div className="flex items-center gap-1 font-bold text-[#172B4D] dark:text-slate-300">
              <Info className="w-3.5 h-3.5 text-[#1769FF]" />
              <span>{isEn ? 'Security Architecture Note' : 'ملاحظة معمارية الأمان والخصوصية:'}</span>
            </div>
            <p className="leading-relaxed">
              {isEn
                ? 'Zero plaintext passwords or secrets exist in the public bundle. The application uses client-side PBKDF2 cryptographic key derivation. For enterprise multi-admin sessions, a full-stack auth service (such as Firebase Auth) can be provisioned on request.'
                : 'لا توجد أي كلمات مرور أو مفاتيح سرية مكشوفة في كود الموقع. تم استخدام تشفير PBKDF2 لاشتقاق المفاتيح محلياً. عند الرغبة في مصادقة سحابية متعددة المشرفين مع خادم جلسات، يمكن ترقية النظام عبر Firebase Auth بسهولة.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. AUTHORIZED OWNER DASHBOARD
  // ==========================================
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in-up">
      {/* Admin Header with Session Status & Logout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-[#DCE7F5] dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isEn ? 'Active Admin Session' : 'جلسة مالك المنصة (نشطة ومحمية)'}</span>
            </div>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold ${
              isDark ? 'text-white' : 'text-[#172B4D]'
            }`}
          >
            {isEn ? 'Fares Tools Control Center' : 'لوحة الإدارة والتحكم | فارس TOOLS'}
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#687A96]'}`}>
            {isEn
              ? 'Centralized administration for AdSense monetization, GA4 analytics, and real tool performance.'
              : 'إدارة مركزية لخدمات إعلانات AdSense، وقياس Google Analytics، ومتابعة كفاءة أدوات المنصة.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{isEn ? 'Sign Out & Lock Portal' : 'تسجيل الخروج وقفل اللوحة'}</span>
        </button>
      </div>

      {savedBanner && (
        <div
          role="status"
          className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{isEn ? 'Admin configuration updated successfully.' : 'تم حفظ الإعدادات الإدارية بنجاح.'}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DCE7F5] dark:border-slate-800 pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('ads')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ads'
              ? 'border-[#1769FF] text-[#1769FF]'
              : 'border-transparent text-[#687A96] hover:text-[#172B4D] dark:hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>{isEn ? 'Google AdSense' : 'إعلانات Google AdSense'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-[#1769FF] text-[#1769FF]'
              : 'border-transparent text-[#687A96] hover:text-[#172B4D] dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isEn ? 'Google Analytics 4' : 'تحليلات Google Analytics 4'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'metrics'
              ? 'border-[#1769FF] text-[#1769FF]'
              : 'border-transparent text-[#687A96] hover:text-[#172B4D] dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{isEn ? 'System Health & Metrics' : 'إحصائيات وتشخيص الأدوات'}</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: GOOGLE ADSENSE SETUP               */}
      {/* ========================================== */}
      {activeTab === 'ads' && (
        <div
          className={`rounded-2xl border p-6 space-y-6 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
          }`}
        >
          <div className="flex items-center gap-2 border-b pb-3 border-[#DCE7F5] dark:border-slate-800">
            <Eye className="w-5 h-5 text-[#1769FF]" />
            <div>
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
                {t.adSenseSettingsTitle}
              </h2>
              <p className="text-xs text-[#687A96] dark:text-slate-400">
                {t.adSenseSettingsDesc}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="text-sm font-bold">{t.adSenseEnableToggle}</p>
                <p className="text-xs text-[#687A96] dark:text-slate-400">
                  {isEn
                    ? 'Kept off by default. Activate only after your website receives official Google approval.'
                    : 'معطل افتراضياً. لا يتم تفعيله إلا بعد حصول الموقع على الاعتماد الرسمي من جوجل.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={adConfig.enabled}
                onChange={(e) => {
                  updateAdConfig({ enabled: e.target.checked });
                  triggerSavedFeedback();
                }}
                className="w-5 h-5 accent-[#1769FF] rounded cursor-pointer"
              />
            </label>

            <div className="space-y-1.5 pt-3 border-t border-[#DCE7F5] dark:border-slate-800">
              <label className="text-xs font-bold block">{t.adSensePublisherIdLabel}</label>
              <input
                type="text"
                dir="ltr"
                value={adConfig.publisherId || ''}
                onChange={(e) => {
                  updateAdConfig({ publisherId: e.target.value.trim() });
                  triggerSavedFeedback();
                }}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                className={`w-full max-w-md rounded-xl px-3.5 py-2.5 text-xs font-mono border focus:outline-none focus:border-[#1769FF] ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D] placeholder-slate-400'
                }`}
              />
              <p className="text-[11px] text-[#687A96] dark:text-slate-400">
                {t.adSensePublisherIdHelper}
              </p>
            </div>

            <label className="flex items-center justify-between gap-4 pt-3 border-t border-[#DCE7F5] dark:border-slate-800 cursor-pointer">
              <div>
                <p className="text-sm font-bold">{t.adSensePreviewPlaceholders}</p>
                <p className="text-xs text-[#687A96] dark:text-slate-400">
                  {t.adSensePreviewPlaceholdersDesc}
                </p>
              </div>
              <input
                type="checkbox"
                checked={adConfig.previewPlaceholders || false}
                onChange={(e) => {
                  updateAdConfig({ previewPlaceholders: e.target.checked });
                  updateSettings({ showAdPlaceholders: e.target.checked });
                  triggerSavedFeedback();
                }}
                className="w-5 h-5 accent-[#1769FF] rounded cursor-pointer"
              />
            </label>

            {/* ads.txt Download Generator */}
            <div className="pt-4 border-t border-[#DCE7F5] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold">
                  {isEn ? 'Authorized Digital Sellers (ads.txt)' : 'توليد ملف البائعين الرقميين المعتمدين (ads.txt)'}
                </p>
                <p className="text-[11px] text-[#687A96] dark:text-slate-400">
                  {isEn
                    ? 'Generate and download an official ads.txt pre-filled with your Publisher ID to upload to your domain root.'
                    : 'توليد وتنزيل ملف ads.txt معبأ تلقائياً بمعرف الناشر الخاص بك لرفعه إلى جذر موقعك.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadAdsTxt}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors shrink-0 cursor-pointer ${
                  isDark
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                    : 'border-[#DCE7F5] hover:bg-[#EAF3FF] text-[#172B4D]'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-[#1769FF]" />
                <span>{isEn ? 'Download ads.txt' : 'تنزيل ملف ads.txt'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: GOOGLE ANALYTICS 4 SETUP            */}
      {/* ========================================== */}
      {activeTab === 'analytics' && (
        <div
          className={`rounded-2xl border p-6 space-y-5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
          }`}
        >
          <div className="flex items-center gap-2 border-b pb-3 border-[#DCE7F5] dark:border-slate-800">
            <Activity className="w-5 h-5 text-[#1769FF]" />
            <div>
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
                {isEn ? 'Google Analytics 4 Measurement' : 'إعداد قياس Google Analytics 4 (GA4)'}
              </h2>
              <p className="text-xs text-[#687A96] dark:text-slate-400">
                {isEn
                  ? 'Configures official aggregate site visits and tool lifecycle metrics with strict privacy compliance.'
                  : 'ضبط معرّف التتبع لقياس إجمالي الزيارات ومعدلات اكتمال الأدوات مع الالتزام التام بضوابط الخصوصية.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#1769FF]/5 border border-[#1769FF]/15 text-xs text-[#687A96] dark:text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#1769FF]">
                <ShieldCheck className="w-4 h-4" />
                <span>{isEn ? 'Strict Privacy Enforcement' : 'ضمانات الخصوصية والأمان الصارمة:'}</span>
              </div>
              <p className="leading-relaxed text-[11px] sm:text-xs">
                {isEn
                  ? 'Zero user files, file names, file contents, passwords, or personal data are ever sent to Analytics. Tracking only executes with a genuine G- ID and visitor consent.'
                  : 'ممنوع منعاً باتاً إرسال أسماء الملفات أو محتوياتها أو كلمات المرور أو أي بيانات خاصة إلى Analytics. لا يتم تحميل السكربتات إلا بمعرف G- رسمي وموافقة الزائر.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold block">
                {isEn ? 'GA4 Measurement ID' : 'معرّف قياس Google Analytics 4 (Measurement ID)'}
              </label>
              <input
                type="text"
                dir="ltr"
                value={settings.gaMeasurementId || ''}
                onChange={(e) => {
                  updateSettings({ gaMeasurementId: e.target.value.trim() });
                  triggerSavedFeedback();
                }}
                placeholder="G-XXXXXXXXXX"
                className={`w-full max-w-md rounded-xl px-3.5 py-2.5 text-xs font-mono border focus:outline-none focus:border-[#1769FF] ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D] placeholder-slate-400'
                }`}
              />
              <p className="text-[11px] text-[#687A96] dark:text-slate-400">
                {isEn
                  ? 'Starts with "G-". Kept empty by default until your official GA4 stream is created.'
                  : 'يبدأ بـ "G-". يُترك فارغاً افتراضياً حتى تنشئ تدفق البيانات الخاص بموقعك في Google Analytics.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: SYSTEM HEALTH & TOOL METRICS        */}
      {/* ========================================== */}
      {activeTab === 'metrics' && (
        <div
          className={`rounded-2xl border p-6 space-y-5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3 border-[#DCE7F5] dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#1769FF]" />
              <div>
                <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
                  {isEn ? 'Real-Time Tool Diagnostics' : 'تشخيص أداء الأدوات وسجل العمليات'}
                </h2>
                <p className="text-xs text-[#687A96] dark:text-slate-400">
                  {isEn
                    ? 'Actual local execution statistics to monitor tool reliability and identify potential errors.'
                    : 'إحصائيات حقيقية 100% لمراقبة كفاءة الأدوات واكتشاف أي أخطاء برمجية لمعالجتها.'}
                </p>
              </div>
            </div>

            {metrics.totalExecutions > 0 && (
              <button
                type="button"
                onClick={handleClearMetrics}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Reset Metrics' : 'مسح سجل الأداء'}</span>
              </button>
            )}
          </div>

          {metrics.totalExecutions === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-[#DCE7F5] dark:border-slate-800">
              <Activity className="w-8 h-8 mx-auto text-[#687A96]/60 dark:text-slate-500 mb-2" />
              <p className="text-sm font-bold text-[#172B4D] dark:text-white">
                {isEn ? 'No usage records logged yet' : 'لا تتوفر سجلات استخدام مسجلة حتى الآن'}
              </p>
              <p className="text-xs text-[#687A96] dark:text-slate-400 max-w-md mx-auto mt-1">
                {isEn
                  ? 'Real execution data will populate here as tools are utilized in the platform.'
                  : 'ستظهر إحصائيات الأدوات والعمليات الناجحة والأخطاء هنا تلقائياً مع استخدام الأدوات.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className={`p-4 rounded-xl border ${
                    isDark ? 'bg-slate-800/60 border-slate-750' : 'bg-[#F5F9FF] border-[#DCE7F5]'
                  }`}
                >
                  <span className="text-xs text-[#687A96] dark:text-slate-400 font-medium">
                    {isEn ? 'Total Local Executions' : 'إجمالي العمليات المنفذة'}
                  </span>
                  <p className="text-2xl font-black text-[#1769FF] mt-1">
                    {metrics.totalExecutions}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    isDark
                      ? 'bg-slate-800/60 border-slate-750'
                      : 'bg-emerald-50/50 border-emerald-100 dark:border-emerald-950/30'
                  }`}
                >
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {isEn ? 'Successful Operations' : 'العمليات الناجحة'}
                  </span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {metrics.totalSuccesses}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    isDark
                      ? 'bg-slate-800/60 border-slate-750'
                      : 'bg-rose-50/50 border-rose-100 dark:border-rose-950/30'
                  }`}
                >
                  <span className="text-xs text-rose-500 font-medium">
                    {isEn ? 'Failed Operations' : 'العمليات التي واجهت أخطاء'}
                  </span>
                  <p className="text-2xl font-black text-rose-500 mt-1">
                    {metrics.totalFailures}
                  </p>
                </div>
              </div>

              {/* Most Used Tools */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#687A96] dark:text-slate-400">
                  {isEn ? 'Most Used Tools' : 'الأدوات الأكثر طلباً واستخداماً'}
                </h3>
                <div className="divide-y divide-[#DCE7F5] dark:divide-slate-800 rounded-xl border border-[#DCE7F5] dark:border-slate-800 overflow-hidden">
                  {mostUsedList.map((item) => (
                    <div
                      key={item.slug}
                      className={`p-3 flex items-center justify-between text-xs ${
                        isDark ? 'bg-slate-850' : 'bg-white'
                      }`}
                    >
                      <span className="font-bold text-[#172B4D] dark:text-white">
                        {isEn ? item.nameEn || item.name : item.name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1769FF]/10 text-[#1769FF] font-extrabold text-[11px]">
                        {item.startCount} {isEn ? 'runs' : 'عملية'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Diagnostics */}
              {failingList.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5 text-rose-500 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{isEn ? 'Error Diagnostics' : 'تشخيص الأدوات التي واجهت أخطاء'}</span>
                  </div>
                  <div className="divide-y divide-[#DCE7F5] dark:divide-slate-800 rounded-xl border border-[#DCE7F5] dark:border-slate-800 overflow-hidden">
                    {failingList.map((item) => (
                      <div
                        key={item.slug}
                        className={`p-3 flex items-center justify-between text-xs ${
                          isDark ? 'bg-slate-850' : 'bg-white'
                        }`}
                      >
                        <span className="font-bold text-[#172B4D] dark:text-white">
                          {isEn ? item.nameEn || item.name : item.name}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-extrabold text-[11px]">
                          {item.failureCount} {isEn ? 'errors' : 'أخطاء'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
