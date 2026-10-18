import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Mail,
  Info,
  CheckCircle2,
  Send,
  Lock,
  Cpu,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { KnightLogo } from '../components/KnightLogo';
import { useApp } from '../context/AppContext';
import { usePageSeo } from '../hooks/usePageSeo';
import { WhatsAppFeedbackSection } from '../components/WhatsAppFeedbackSection';

export const AboutPage: React.FC = () => {
  const { settings, navigate } = useApp();
  const isDark = settings.theme === 'dark';

  usePageSeo({
    title: 'عن المنصة (من نحن)',
    description:
      'تعرف على منصة فارس TOOLS، المنصة العربية المتكاملة التي توفر 40 أداة مجانية للعمل مع ملفات PDF والمستندات والصور محلياً وبأمان تام.',
    canonicalPath: '/about',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in-up">
      <div
        className={`rounded-2xl border p-8 sm:p-10 space-y-6 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <div className="flex items-center gap-4">
          <KnightLogo size={54} animate={!settings.reducedMotion} />
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1769FF]">
              <Info className="w-4 h-4" />
              <span>تعرف على المنصة</span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-extrabold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              فارس <span className="font-en text-[#1769FF]">TOOLS</span>
            </h1>
          </div>
        </div>

        <p className="text-sm sm:text-base leading-loose text-[#687A96] dark:text-slate-300">
          <strong>فارس تولز (فارس TOOLS)</strong> هي منصة ويب عربية متكاملة صُممت لتمكين المستخدم العربي من إنجاز مهامه الرقمية اليومية بخطوات واضحة وبأعلى معايير السرعة والخصوصية. تجمع المنصة <strong>40 أداة فعالة بالكامل</strong> تغطي معالجة وتأمين مستندات PDF، التحويل المتبادل مع ملفات Office (Word وExcel وPowerPoint)، ضغط وتعديل الصور وإزالة الخلفية وإزالة العلامات المائية، معالجة الفيديو والصوت، التدقيق الإملائي والتشكيل العربي، مولد رموز QR القياسي، وحاسبة الزكاة الشرعية.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div
            className={`p-5 rounded-xl border ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-[#F5F9FF] border-[#DCE7F5]'
            }`}
          >
            <h3 className="text-sm font-bold text-[#1769FF] mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>معالجة محلية 100%</span>
            </h3>
            <p className="text-xs leading-relaxed text-[#687A96] dark:text-slate-400">
              تعتمد المنصة على محركات WebAssembly وCanvas وWeb Audio لمعالجة ملفاتك مباشرة داخل متصفحك دون رفع أي مستند أو صورة إلى خادم خارجي.
            </p>
          </div>

          <div
            className={`p-5 rounded-xl border ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-[#F5F9FF] border-[#DCE7F5]'
            }`}
          >
            <h3 className="text-sm font-bold text-[#1769FF] mb-1.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              <span>تشفير وأمان حقيقي</span>
            </h3>
            <p className="text-xs leading-relaxed text-[#687A96] dark:text-slate-400">
              تدعم أدوات PDF تشفير المستندات الحساسة بمعيار RC4-128 القياسي بكلمة مرور حقيقية، مع تنظيف تلقائي للذاكرة المؤقتة بعد التنزيل.
            </p>
          </div>

          <div
            className={`p-5 rounded-xl border ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-[#F5F9FF] border-[#DCE7F5]'
            }`}
          >
            <h3 className="text-sm font-bold text-[#1769FF] mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>واجهة عربية أصيلة</span>
            </h3>
            <p className="text-xs leading-relaxed text-[#687A96] dark:text-slate-400">
              تجربة استخدام مصممة بالكامل من اليمين إلى اليسار (RTL) مع تقسيم واضح لخطوات كل أداة: اختيار الملف، ضبط الخيارات، المعالجة، والتنزيل.
            </p>
          </div>
        </div>

        {/* Platform Capabilities Overview */}
        <div
          className={`rounded-xl border p-5 space-y-3 ${
            isDark
              ? 'bg-slate-950/60 border-slate-800'
              : 'bg-[#F5F9FF]/60 border-[#DCE7F5]'
          }`}
        >
          <h2 className="text-base font-extrabold text-[#1769FF]">
            الأقسام الرئيسية في المنصة (40 أداة جاهزة):
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-[#687A96] dark:text-slate-300">
            <li>• <strong>أدوات PDF (12 أداة):</strong> دمج، تقسيم، ضغط، تدوير، حذف واستخراج صفحات، ترقيم، علامة مائية، توقيع، استخراج نص، وحماية بكلمة مرور.</li>
            <li>• <strong>المستندات المكتبية (6 أدوات):</strong> التحويل المتبادل بين PDF وكل من Word (DOCX) وExcel (XLSX) وPowerPoint (PPTX).</li>
            <li>• <strong>أدوات الصور (11 أداة):</strong> ضغط، تغيير أبعاد، قص، تدوير، تحسين، إزالة خلفية، إزالة العلامة المائية، تحويل صيغ، دمج صور في PDF، ومولد QR Code.</li>
            <li>• <strong>الفيديو والصوت واللغة (11 أداة):</strong> ضغط وقص ودمج الفيديو والصوت، تحويل الفيديو إلى GIF أو صوت، التدقيق العربي والتشكيل، وحاسبة الزكاة.</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/all-tools')}
            className="px-6 py-3 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            استكشف جميع الأدوات الـ 40
          </button>
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                : 'border-[#DCE7F5] hover:bg-[#F5F9FF] text-[#172B4D]'
            }`}
          >
            تواصل مع فريق المنصة
          </button>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  usePageSeo({
    title: 'سياسة الخصوصية وحماية البيانات',
    description:
      'سياسة الخصوصية لمنصة فارس TOOLS: لا يتم رفع أو حفظ أي ملفات على خوادم خارجية؛ المعالجة تتم 100% داخل متصفحك.',
    canonicalPath: '/privacy',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div
        className={`rounded-2xl border p-8 sm:p-10 space-y-6 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <div className="flex items-center gap-3 border-b pb-4 border-[#DCE7F5] dark:border-slate-800">
          <ShieldCheck className="w-7 h-7 text-[#1769FF]" />
          <div>
            <h1
              className={`text-2xl sm:text-3xl font-extrabold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              سياسة الخصوصية وحماية البيانات
            </h1>
            <p className="text-xs text-[#687A96] mt-1">
              آخر تحديث: أكتوبر 2026 · منصة فارس TOOLS
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm leading-loose text-[#687A96] dark:text-slate-300">
          <h2 className="text-base font-bold text-[#1769FF]">
            1. المعالجة المحلية داخل المتصفح (Zero Server Upload)
          </h2>
          <p>
            تلتزم منصة <strong>فارس TOOLS</strong> بحماية سرية ملفاتك ومستنداتك الشخصية والتجارية. تتم معالجة جميع الملفات (PDF، Word، Excel، PowerPoint، الصور، المقاطع الصوتية، الفيديوهات، والنصوص) محلياً داخل الذاكرة المؤقتة لمتصفحك (Client-Side Browser Memory) دون إرسالها أو تخزينها على أي خادم سحابي خارجي.
          </p>

          <h2 className="text-base font-bold text-[#1769FF]">
            2. إدارة الروابط المؤقتة وتنظيف الذاكرة
          </h2>
          <p>
            عند إنشاء ملف ناتج للتنزيل، ينشئ المتصفح رابطاً محلياً مؤقتاً (Blob Object URL) صالحاً لجلسة التصفح الحالية فقط. تقوم المنصة تلقائياً بإلغاء وتفريغ هذه الروابط (`URL.revokeObjectURL`) فور بدء عملية جديدة أو إغلاق التبويب لضمان عدم بقاء أي أثر للملفات في الذاكرة.
          </p>

          <h2 className="text-base font-bold text-[#1769FF]">
            3. التخزين المحلي (Local Storage)
          </h2>
          <p>
            نستخدم التخزين المحلي في متصفحك (`localStorage`) حصرياً لحفظ تفضيلاتك الشخصية: قائمة الأدوات المفضلة، سجل آخر الأدوات المفتوحة، وإعدادات المظهر وجودة الضغط الافتراضية. يمكنك مسح هذه البيانات في أي لحظة من صفحة «الإعدادات».
          </p>

          <h2 className="text-base font-bold text-[#1769FF]">
            4. عدم مشاركة البيانات مع أطراف ثالثة
          </h2>
          <p>
            لا نقوم بجمع أو بيع أو مشاركة أي ملفات أو نصوص أو كلمات مرور مدخلة في أدوات التشفير مع أي طرف ثالث.
          </p>
        </div>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  usePageSeo({
    title: 'شروط وأحكام الاستخدام',
    description:
      'الشروط والأحكام الخاصة باستخدام خدمات وأدوات فارس TOOLS المجانية للأغراض الشخصية والتجارية المشروعة.',
    canonicalPath: '/terms',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div
        className={`rounded-2xl border p-8 sm:p-10 space-y-6 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <div className="flex items-center gap-3 border-b pb-4 border-[#DCE7F5] dark:border-slate-800">
          <FileText className="w-7 h-7 text-[#1769FF]" />
          <div>
            <h1
              className={`text-2xl sm:text-3xl font-extrabold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              شروط وأحكام الاستخدام
            </h1>
            <p className="text-xs text-[#687A96] mt-1">
              يرجى قراءة الشروط بعناية قبل استخدام خدمات فارس TOOLS
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm leading-loose text-[#687A96] dark:text-slate-300">
          <h2 className="text-base font-bold text-[#1769FF]">
            1. الاستخدام المشروع للأدوات
          </h2>
          <p>
            تُقدم جميع أدوات منصة فارس TOOLS مجاناً للاستخدام الشخصي، الأكاديمي، والتجاري المشروع. يتحمل المستخدم المسؤولية القانونية الكاملة عن ملكية وصلاحية الملفات والمستندات التي يقوم بمعالجتها أو تشفيرها عبر المنصة.
          </p>

          <h2 className="text-base font-bold text-[#1769FF]">
            2. طبيعة المعالجة البرمجية في المتصفح
          </h2>
          <p>
            تعمل الأدوات الـ 40 بالكامل بالاعتماد على إمكانيات متصفح المستخدم. في أدوات تحويل PDF إلى تنسيقات مكتبية (Word وExcel وPowerPoint)، يتم استخراج النصوص والفقرات والجداول وإعادة بنائها برمجياً، وقد يختلف التنسيق البصري المعقد أو الخطوط المدمجة غير القياسية عن المستند الأصلي. كما تعتمد أدوات الفيديو والصوت على واجهات `MediaRecorder` و`Web Audio API` المدعومة في المتصفحات الحديثة.
          </p>

          <h2 className="text-base font-bold text-[#1769FF]">
            3. حفظ النسخ الاحتياطية وكلمات المرور
          </h2>
          <p>
            نظراً لأن المنصة لا تحتفظ بأي نسخة من ملفاتك أو كلمات المرور التي تعينها في أداة «حماية PDF بكلمة مرور»، فإن فقدان كلمة المرور يعني عدم إمكانية استرجاعها من قِبل المنصة. نوصي دائماً بالاحتفاظ بنسخة احتياطية من ملفاتك الأصلية قبل إجراء عمليات الحذف أو القص أو التشفير.
          </p>
        </div>
      </div>
    </div>
  );
};

interface SavedContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

const CONTACT_MESSAGES_STORAGE_KEY = 'fares_tools_contact_messages_v1';

export const ContactPage: React.FC = () => {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  usePageSeo({
    title: 'تواصل معنا والدعم الفني',
    description:
      'تواصل مع فريق تطوير فارس TOOLS للاقتراحات والملاحظات والاستفسارات الفنية حول الأدوات الرقمية.',
    canonicalPath: '/contact',
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('اقتراح أداة أو ميزة جديدة');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [savedMessages, setSavedMessages] = useState<SavedContactMessage[]>(
    () => {
      try {
        const raw = localStorage.getItem(CONTACT_MESSAGES_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // ignore
      }
      return [];
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newEntry: SavedContactMessage = {
      id: `${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      subject,
      message: message.trim(),
      createdAt: new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    const updated = [newEntry, ...savedMessages].slice(0, 10);
    setSavedMessages(updated);
    try {
      localStorage.setItem(
        CONTACT_MESSAGES_STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch {
      // ignore
    }
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in-up">
      <div
        className={`rounded-2xl border p-8 sm:p-10 space-y-6 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <div className="flex items-center gap-3 border-b pb-4 border-[#DCE7F5] dark:border-slate-800">
          <Mail className="w-7 h-7 text-[#1769FF]" />
          <div>
            <h1
              className={`text-2xl sm:text-3xl font-extrabold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              تواصل معنا
            </h1>
            <p className="text-xs text-[#687A96] mt-1">
              نسعد باستقبال اقتراحاتكم وملاحظاتكم لتطوير أدوات فارس TOOLS
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold">شكراً لتواصلك معنا، {name}!</h3>
            <p className="text-sm text-[#687A96] dark:text-slate-300">
              تم حفظ رسالتك وملاحظاتك بنجاح. نقدر مساهمتك في تحسين تجربة منصة فارس TOOLS.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setName('');
                setEmail('');
                setMessage('');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white text-xs font-bold cursor-pointer"
            >
              إرسال رسالة أخرى
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold">الاسم الكريم *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسمك"
                  className={`w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#1769FF] ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full rounded-xl px-4 py-2.5 text-sm border font-en focus:outline-none focus:border-[#1769FF] ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold">موضوع الرسالة</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:border-[#1769FF] ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                }`}
              >
                <option value="اقتراح أداة أو ميزة جديدة">
                  اقتراح أداة أو ميزة جديدة
                </option>
                <option value="الإبلاغ عن مشكلة تقنية">
                  الإبلاغ عن مشكلة تقنية
                </option>
                <option value="استفسار عام">استفسار عام</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold">الرسالة أو التفاصيل *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك أو ملاحظتك بالتفصيل..."
                className={`w-full rounded-xl p-4 text-sm border focus:outline-none focus:border-[#1769FF] ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                }`}
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إرسال الرسالة</span>
            </button>
          </form>
        )}

        {/* Saved Feedback History */}
        {savedMessages.length > 0 && (
          <div className="pt-6 border-t border-[#DCE7F5] dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1769FF]">
              <Clock className="w-4 h-4" />
              <span>رسائلك المرسلة سابقاً ({savedMessages.length})</span>
            </div>
            <div className="space-y-2.5 max-h-56 overflow-y-auto">
              {savedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-[#F5F9FF] border-[#DCE7F5]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{msg.subject}</span>
                    <span className="text-[#687A96]">{msg.createdAt}</span>
                  </div>
                  <p className="text-[#687A96] dark:text-slate-300 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Direct WhatsApp Contact & Feedback Builder */}
      <WhatsAppFeedbackSection />

      {/* Quick FAQ Card */}
      <div
        className={`rounded-2xl border p-6 sm:p-8 space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <div className="flex items-center gap-2 text-base font-extrabold">
          <HelpCircle className="w-5 h-5 text-[#1769FF]" />
          <span>أسئلة شائعة سريعة</span>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-[#687A96] dark:text-slate-300 leading-relaxed">
          <p>
            <strong className={isDark ? 'text-white' : 'text-[#172B4D]'}>
              هل تُرفع ملفاتي إلى أي خادم خارجي؟
            </strong>{' '}
            لا، جميع الأدوات الـ 40 تعالج ملفاتك محلياً داخل متصفحك لضمان الخصوصية الكاملة.
          </p>
          <p>
            <strong className={isDark ? 'text-white' : 'text-[#172B4D]'}>
              لماذا قد لا يعمل تحويل الفيديو في بعض المتصفحات القديمة؟
            </strong>{' '}
            تعتمد معالجة الفيديو والصوت على واجهات MediaRecorder الحديثة، لذا نوصي باستخدام أحدث إصدار من Chrome أو Edge أو Firefox.
          </p>
        </div>
      </div>
    </div>
  );
};

