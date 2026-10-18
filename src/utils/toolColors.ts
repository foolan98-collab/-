import { CategoryId } from '../types/tools';

export interface ToolColorPalette {
  groupId: string;
  groupLabel: string;
  accentHex: string;
  iconBgLight: string;
  iconBgDark: string;
  iconTextLight: string;
  iconTextDark: string;
  cardBorderHoverLight: string;
  cardBorderHoverDark: string;
  cardShadowHover: string;
  titleHoverText: string;
  arrowHoverBg: string;
  arrowHoverText: string;
  buttonBg: string;
  buttonHoverBg: string;
  softSurfaceLight: string;
}

const COLOR_PALETTES: Record<string, ToolColorPalette> = {
  // 1. Word & Text Documents (Royal Blue - like iLovePDF Word tools)
  wordDocs: {
    groupId: 'wordDocs',
    groupLabel: 'مستندات Word والنصوص',
    accentHex: '#2563EB',
    iconBgLight: 'bg-blue-50',
    iconBgDark: 'bg-blue-500/20',
    iconTextLight: 'text-blue-600',
    iconTextDark: 'text-blue-400',
    cardBorderHoverLight: 'hover:border-blue-400',
    cardBorderHoverDark: 'hover:border-blue-500/70',
    cardShadowHover: 'hover:shadow-[0_12px_28px_-6px_rgba(37,99,235,0.18)]',
    titleHoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    arrowHoverBg: 'group-hover:bg-blue-50 dark:group-hover:bg-blue-500/20',
    arrowHoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    buttonBg: 'bg-blue-600',
    buttonHoverBg: 'hover:bg-blue-700',
    softSurfaceLight: 'bg-blue-50/60',
  },

  // 2. Excel & Spreadsheets (Emerald Green - like iLovePDF Excel tools)
  excelSheets: {
    groupId: 'excelSheets',
    groupLabel: 'جداول بيانات Excel',
    accentHex: '#10B981',
    iconBgLight: 'bg-emerald-50',
    iconBgDark: 'bg-emerald-500/20',
    iconTextLight: 'text-emerald-600',
    iconTextDark: 'text-emerald-400',
    cardBorderHoverLight: 'hover:border-emerald-400',
    cardBorderHoverDark: 'hover:border-emerald-500/70',
    cardShadowHover: 'hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.18)]',
    titleHoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    arrowHoverBg: 'group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/20',
    arrowHoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    buttonBg: 'bg-emerald-600',
    buttonHoverBg: 'hover:bg-emerald-700',
    softSurfaceLight: 'bg-emerald-50/60',
  },

  // 3. PowerPoint & Presentations (Warm Orange - like iLovePDF PPT tools)
  powerpointSlides: {
    groupId: 'powerpointSlides',
    groupLabel: 'عروض PowerPoint',
    accentHex: '#F97316',
    iconBgLight: 'bg-orange-50',
    iconBgDark: 'bg-orange-500/20',
    iconTextLight: 'text-orange-600',
    iconTextDark: 'text-orange-400',
    cardBorderHoverLight: 'hover:border-orange-400',
    cardBorderHoverDark: 'hover:border-orange-500/70',
    cardShadowHover: 'hover:shadow-[0_12px_28px_-6px_rgba(249,115,22,0.18)]',
    titleHoverText: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
    arrowHoverBg: 'group-hover:bg-orange-50 dark:group-hover:bg-orange-500/20',
    arrowHoverText: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
    buttonBg: 'bg-orange-600',
    buttonHoverBg: 'hover:bg-orange-700',
    softSurfaceLight: 'bg-orange-50/60',
  },

  // 4. PDF Merge, Split, Extract & Delete Pages (Crimson / Rose Red - Organize PDF family)
  pdfOrganize: {
    groupId: 'pdfOrganize',
    groupLabel: 'دمج وتقسيم وتنظيم PDF',
    accentHex: '#E11D48',
    iconBgLight: 'bg-rose-50',
    iconBgDark: 'bg-rose-500/20',
    iconTextLight: 'text-rose-600',
    iconTextDark: 'text-rose-400',
    cardBorderHoverLight: 'hover:border-rose-400',
    cardBorderHoverDark: 'hover:border-rose-500/70',
    cardShadowHover: 'hover:shadow-[0_12px_28px_-6px_rgba(225,29,72,0.18)]',
    titleHoverText: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
    arrowHoverBg: 'group-hover:bg-rose-50 dark:group-hover:bg-rose-500/20',
    arrowHoverText: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
    buttonBg: 'bg-rose-600',
    buttonHoverBg: 'hover:bg-rose-700',
    softSurfaceLight: 'bg-rose-50/60',
  },

  // 5. Compression & Optimization Tools (Red-Orange / Coral - Compress PDF, Image, Video)
  compression: {
    groupId: 'compression',
    groupLabel: 'أدوات الضغط وتقليل الحجم',
    accentHex: '#EA580C',
    iconBgLight: 'bg-orange-50',
    iconBgDark: 'bg-orange-500/20',
    iconTextLight: 'text-orange-600',
    iconTextDark: 'text-orange-400',
    cardBorderHoverLight: 'hover:border-orange-400',
    cardBorderHoverDark: 'hover:border-orange-500/70',
    cardShadowHover: 'hover:shadow-[0_12px_28px_-6px_rgba(234,88,12,0.18)]',
    titleHoverText: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
    arrowHoverBg: 'group-hover:bg-orange-50 dark:group-hover:bg-orange-500/20',
    arrowHoverText: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
    buttonBg: 'bg-orange-600',
    buttonHoverBg: 'hover:bg-orange-700',
    softSurfaceLight: 'bg-orange-50/60',
  },

  // 6. PDF Security, Sign, Watermark, Page Numbers (Indigo - Security & Stamp family)
  pdfSecurityAndStamp: {
    groupId: 'pdfSecurityAndStamp',
    groupLabel: 'حماية وتوقيع وترقيم PDF',
    accentHex: '#4F46E5',
    iconBgLight: 'bg-indigo-50',
    iconBgDark: 'bg-indigo-500/20',
    iconTextLight: 'text-indigo-600',
    iconTextDark: 'text-indigo-400',
    cardBorderHoverLight: 'hover:border-indigo-400',
    cardBorderHoverDark: 'hover:border-indigo-500/70',
    cardShadowHover: 'hover:shadow-[0_12px_28px_-6px_rgba(79,70,229,0.18)]',
    titleHoverText: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    arrowHoverBg: 'group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20',
    arrowHoverText: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    buttonBg: 'bg-indigo-600',
    buttonHoverBg: 'hover:bg-indigo-700',
    softSurfaceLight: 'bg-indigo-50/60',
  },

  // 7. Image & JPG Conversions (Cyan / Sky Blue - PDF<->JPG, Convert to JPG, QR)
  imageConversions: {
    groupId: 'imageConversions',
    groupLabel: 'تحويل الصور ورموز QR',
    accentHex: '#0284C7',
    iconBgLight: 'bg-sky-50',
    iconBgDark: 'bg-sky-500/20',
    iconTextLight: 'text-sky-600',
    iconTextDark: 'text-sky-400',
    cardBorderHoverLight: 'hover:border-sky-400',
    cardBorderHoverDark: 'hover:border-sky-500/70',
    cardShadowHover: 'hover:shadow-[0_12px_28px_-6px_rgba(2,132,199,0.18)]',
    titleHoverText: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
    arrowHoverBg: 'group-hover:bg-sky-50 dark:group-hover:bg-sky-500/20',
    arrowHoverText: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
    buttonBg: 'bg-sky-600',
    buttonHoverBg: 'hover:bg-sky-700',
    softSurfaceLight: 'bg-sky-50/60',
  },

  // 8. Image Geometry & Editing (Violet / Purple - Resize, Crop, Rotate, Remove BG, Enhance)
  imageEditing: {
    groupId: 'imageEditing',
    groupLabel: 'تعديل وقص وتحجيم الصور',
    accentHex: '#7C3AED',
    iconBgLight: 'bg-violet-50',
    iconBgDark: 'bg-violet-500/20',
    iconTextLight: 'text-violet-600',
    iconTextDark: 'text-violet-400',
    cardBorderHoverLight: 'hover:border-violet-400',
    cardBorderHoverDark: 'hover:border-violet-500/70',
    cardShadowHover: 'hover:shadow-[0_12px_28px_-6px_rgba(124,58,237,0.18)]',
    titleHoverText: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
    arrowHoverBg: 'group-hover:bg-violet-50 dark:group-hover:bg-violet-500/20',
    arrowHoverText: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
    buttonBg: 'bg-violet-600',
    buttonHoverBg: 'hover:bg-violet-700',
    softSurfaceLight: 'bg-violet-50/60',
  },

  // 9. Video Tools (Fuchsia / Purple - Video editing & conversion)
  videoTools: {
    groupId: 'videoTools',
    groupLabel: 'معالجة وتحويل الفيديو',
    accentHex: '#9333EA',
    iconBgLight: 'bg-purple-50',
    iconBgDark: 'bg-purple-500/20',
    iconTextLight: 'text-purple-600',
    iconTextDark: 'text-purple-400',
    cardBorderHoverLight: 'hover:border-purple-400',
    cardBorderHoverDark: 'hover:border-purple-500/70',
    cardShadowHover: 'hover:shadow-[0_12px_28px_-6px_rgba(147,51,234,0.18)]',
    titleHoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    arrowHoverBg: 'group-hover:bg-purple-50 dark:group-hover:bg-purple-500/20',
    arrowHoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    buttonBg: 'bg-purple-600',
    buttonHoverBg: 'hover:bg-purple-700',
    softSurfaceLight: 'bg-purple-50/60',
  },

  // 10. Audio Tools (Pink / Magenta - Audio trim, merge, MP3, enhance)
  audioTools: {
    groupId: 'audioTools',
    groupLabel: 'الهندسة الصوتية و MP3',
    accentHex: '#DB2777',
    iconBgLight: 'bg-pink-50',
    iconBgDark: 'bg-pink-500/20',
    iconTextLight: 'text-pink-600',
    iconTextDark: 'text-pink-400',
    cardBorderHoverLight: 'hover:border-pink-400',
    cardBorderHoverDark: 'hover:border-pink-500/70',
    cardShadowHover: 'hover:shadow-[0_12px_28px_-6px_rgba(219,39,119,0.18)]',
    titleHoverText: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
    arrowHoverBg: 'group-hover:bg-pink-50 dark:group-hover:bg-pink-500/20',
    arrowHoverText: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
    buttonBg: 'bg-pink-600',
    buttonHoverBg: 'hover:bg-pink-700',
    softSurfaceLight: 'bg-pink-50/60',
  },

  // 11. Arabic Writing & Diacritics (Teal - Arabic language & AI)
  arabicWriting: {
    groupId: 'arabicWriting',
    groupLabel: 'التشكيل والتدقيق العربي',
    accentHex: '#0D9488',
    iconBgLight: 'bg-teal-50',
    iconBgDark: 'bg-teal-500/20',
    iconTextLight: 'text-teal-600',
    iconTextDark: 'text-teal-400',
    cardBorderHoverLight: 'hover:border-teal-400',
    cardBorderHoverDark: 'hover:border-teal-500/70',
    cardShadowHover: 'hover:shadow-[0_12px_28px_-6px_rgba(13,148,136,0.18)]',
    titleHoverText: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
    arrowHoverBg: 'group-hover:bg-teal-50 dark:group-hover:bg-teal-500/20',
    arrowHoverText: 'group-hover:text-teal-600 dark:group-hover:text-teal-400',
    buttonBg: 'bg-teal-600',
    buttonHoverBg: 'hover:bg-teal-700',
    softSurfaceLight: 'bg-teal-50/60',
  },

  // 12. Calculators & Zakat (Amber Gold - Financial & Zakat)
  calculatorTools: {
    groupId: 'calculatorTools',
    groupLabel: 'الحاسبات المالية والشرعية',
    accentHex: '#D97706',
    iconBgLight: 'bg-amber-50',
    iconBgDark: 'bg-amber-500/20',
    iconTextLight: 'text-amber-600',
    iconTextDark: 'text-amber-400',
    cardBorderHoverLight: 'hover:border-amber-400',
    cardBorderHoverDark: 'hover:border-amber-500/70',
    cardShadowHover: 'hover:shadow-[0_12px_28px_-6px_rgba(217,119,6,0.18)]',
    titleHoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    arrowHoverBg: 'group-hover:bg-amber-50 dark:group-hover:bg-amber-500/20',
    arrowHoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    buttonBg: 'bg-amber-600',
    buttonHoverBg: 'hover:bg-amber-700',
    softSurfaceLight: 'bg-amber-50/60',
  },
};

const SLUG_TO_PALETTE_KEY: Record<string, keyof typeof COLOR_PALETTES> = {
  // Group 1: Word & Text Document Tools (Royal Blue)
  'pdf-to-word': 'wordDocs',
  'word-to-pdf': 'wordDocs',
  'extract-pdf-text': 'wordDocs',

  // Group 2: Excel Spreadsheet Tools (Emerald Green)
  'pdf-to-excel': 'excelSheets',
  'excel-to-pdf': 'excelSheets',

  // Group 3: PowerPoint Presentation Tools (Warm Orange)
  'pdf-to-powerpoint': 'powerpointSlides',
  'powerpoint-to-pdf': 'powerpointSlides',

  // Group 4: PDF Organize (Merge, Split, Delete, Extract Pages) (Crimson Rose)
  'merge-pdf': 'pdfOrganize',
  'split-pdf': 'pdfOrganize',
  'delete-pdf-pages': 'pdfOrganize',
  'extract-pdf-pages': 'pdfOrganize',

  // Group 5: Compression Tools (Coral Red-Orange)
  'compress-pdf': 'compression',
  'compress-images': 'compression',
  'compress-video': 'compression',

  // Group 6: PDF Security, Sign, Watermark, Page Numbers, Rotate PDF (Indigo)
  'watermark-pdf': 'pdfSecurityAndStamp',
  'add-pdf-page-numbers': 'pdfSecurityAndStamp',
  'sign-pdf': 'pdfSecurityAndStamp',
  'protect-pdf': 'pdfSecurityAndStamp',
  'rotate-pdf': 'pdfSecurityAndStamp',

  // Group 7: Image Conversions & QR (Sky Cyan)
  'pdf-to-jpg': 'imageConversions',
  'jpg-to-pdf': 'imageConversions',
  'convert-to-jpg': 'imageConversions',
  'qr-code-generator': 'imageConversions',

  // Group 8: Image Editing & Geometry (Violet)
  'resize-images': 'imageEditing',
  'crop-images': 'imageEditing',
  'remove-background': 'imageEditing',
  'remove-watermark': 'imageEditing',
  'enhance-image-quality': 'imageEditing',
  'rotate-images': 'imageEditing',

  // Group 9: Video Tools (Purple)
  'video-to-gif': 'videoTools',
  'convert-video-format': 'videoTools',
  'resize-video': 'videoTools',
  'trim-video': 'videoTools',
  'merge-videos': 'videoTools',

  // Group 10: Audio Tools (Pink)
  'video-to-mp3': 'audioTools',
  'trim-audio': 'audioTools',
  'enhance-audio': 'audioTools',
  'merge-audio': 'audioTools',

  // Group 11: Arabic Writing (Teal)
  'arabic-diacritics-and-correction': 'arabicWriting',

  // Group 12: Calculator (Amber Gold)
  'zakat-calculator': 'calculatorTools',
};

export function getToolColorPalette(
  slug: string,
  fallbackCategory?: CategoryId
): ToolColorPalette {
  const key = SLUG_TO_PALETTE_KEY[slug];
  if (key && COLOR_PALETTES[key]) {
    return COLOR_PALETTES[key];
  }

  switch (fallbackCategory) {
    case 'pdf':
      return COLOR_PALETTES.pdfOrganize;
    case 'images':
      return COLOR_PALETTES.imageEditing;
    case 'video':
      return COLOR_PALETTES.videoTools;
    case 'audio':
      return COLOR_PALETTES.audioTools;
    case 'arabic':
      return COLOR_PALETTES.arabicWriting;
    case 'calculator':
      return COLOR_PALETTES.calculatorTools;
    default:
      return COLOR_PALETTES.wordDocs;
  }
}
