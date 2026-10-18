export type Language = 'ar' | 'en';

export interface TranslationDictionary {
  brandName: string;
  brandTagline: string;
  brandDescription: string;
  allTools: string;
  pdfTools: string;
  imageTools: string;
  videoTools: string;
  audioTools: string;
  documentTools: string;
  arabicTools: string;
  calculatorTools: string;
  home: string;
  favorites: string;
  settings: string;
  searchPlaceholder: string;
  searchButton: string;
  heroHeadline: string;
  heroSubheadline: string;
  freeOnlineTools: string;
  exploreAllTools: string;
  browseByCategory: string;
  browseCategoryDesc: string;
  toolsCount: string;
  tool: string;
  open: string;
  howToUseSteps: string;
  step: string;
  chooseFiles: string;
  dragDropFiles: string;
  supportedFormats: string;
  allStandardFormats: string;
  removeAll: string;
  confirmRemoveAll: string;
  selectedFiles: string;
  readyForProcessing: string;
  create: string;
  starting: string;
  cancelProcessing: string;
  processingState: string;
  processingInProgress: string;
  processingNotice: string;
  fileCreatedSuccessfully: string;
  downloadFile: string;
  chooseAnotherFile: string;
  returnToToolSettings: string;
  returnToAllTools: string;
  failedProcessing: string;
  retrySameSettings: string;
  enginePendingTitle: string;
  enginePendingNotice: string;
  localSafeProcessing: string;
  noActiveJobTitle: string;
  noActiveJobDesc: string;
  copyExtractedText: string;
  copiedTextSuccess: string;
  extractedIndividualFiles: string;
  downloadItem: string;
  savingPercent: string;
  outputFileName: string;
  outputFileSize: string;
  originalSize: string;
  themeLight: string;
  themeDark: string;
  reducedMotion: string;
  reducedMotionDesc: string;
  defaultImageQuality: string;
  defaultExportPrefix: string;
  defaultExportPrefixDesc: string;
  autoScrollWorkspace: string;
  autoScrollWorkspaceDesc: string;
  confirmBeforeClearLabel: string;
  confirmBeforeClearDesc: string;
  recentTools: string;
  clearHistory: string;
  clearFavorites: string;
  confirmClearFavorites: string;
  favoritesEmptyTitle: string;
  favoritesEmptyDesc: string;
  suggestedTools: string;
  aboutUs: string;
  privacyPolicy: string;
  termsOfUse: string;
  cookiePolicy: string;
  contactUs: string;
  faqTitle: string;
  allRightsReserved: string;
  trustSpeedTitle: string;
  trustSpeedDesc: string;
  trustPrivacyTitle: string;
  trustPrivacyDesc: string;
  trustCatalogTitle: string;
  trustCatalogDesc: string;
  adSenseSettingsTitle: string;
  adSenseSettingsDesc: string;
  adSenseEnableToggle: string;
  adSensePublisherIdLabel: string;
  adSensePublisherIdHelper: string;
  adSensePreviewPlaceholders: string;
  adSensePreviewPlaceholdersDesc: string;
  savedSettingsSuccess: string;
  resetDefaultSettings: string;
  removeWatermarkTitle: string;
  removeWatermarkDesc: string;
  responsibleUseTitle: string;
  responsibleUseNotice: string;
  technicalLimitsTitle: string;
  technicalLimitsNotice: string;
  brushTool: string;
  rectangleTool: string;
  brushSize: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  fitToScreen: string;
  undoAction: string;
  redoAction: string;
  clearSelection: string;
  executeWatermarkRemoval: string;
  watermarkRemovedSuccess: string;
  beforeAfterComparison: string;
  sideBySideView: string;
  splitSliderView: string;
  resultOnlyView: string;
  originalImageLabel: string;
  cleanedImageLabel: string;
  noMaskSelectedWarning: string;
  downloadCleanedImage: string;
  selectWatermarkFirstPrompt: string;
}

export const AR_TRANSLATIONS: TranslationDictionary = {
  brandName: 'فارس TOOLS',
  brandTagline: 'أنجز أكثر. بخطوات أقل.',
  brandDescription:
    'منصة أدوات رقمية مجانية شاملة لتحويل وضغط وتعديل ملفات PDF، الصور، الفيديو، الصوت، والمستندات، مع معالجة محلية آمنة 100% داخل متصفحك.',
  allTools: 'كل الأدوات',
  pdfTools: 'أدوات PDF',
  imageTools: 'أدوات الصور',
  videoTools: 'أدوات الفيديو',
  audioTools: 'أدوات الصوت',
  documentTools: 'أدوات المستندات',
  arabicTools: 'الكتابة والذكاء الاصطناعي',
  calculatorTools: 'الحاسبات الذكية',
  home: 'الرئيسية',
  favorites: 'المفضلة',
  settings: 'الإعدادات',
  searchPlaceholder: 'ابحث عن أداة بالاسم أو الوصف...',
  searchButton: 'بحث',
  heroHeadline: 'كل أدواتك في مكان واحد.',
  heroSubheadline:
    'أدوات ذكية وسريعة لتحويل ملفاتك وتعديل مستنداتك وصورك، بسهولة وأمان محلي.',
  freeOnlineTools: 'أدوات ويب مجانية وفورية',
  exploreAllTools: 'استكشاف جميع الأدوات',
  browseByCategory: 'تصفح الأدوات حسب التخصص',
  browseCategoryDesc:
    'اختر القسم المناسب للوصول السريع إلى أدوات المعالجة والتحويل المتخصصة.',
  toolsCount: 'أدوات',
  tool: 'أداة',
  open: 'فتح',
  howToUseSteps: 'كيفية استخدام الأداة في 3 خطوات',
  step: 'الخطوة',
  chooseFiles: 'اختيار ملف من جهازك',
  dragDropFiles: 'اسحب وأفلت الملفات هنا، أو اضغط للاختيار',
  supportedFormats: 'الصيغ المدعومة',
  allStandardFormats: 'جميع الملفات القياسية مدعومة',
  removeAll: 'إزالة الكل',
  confirmRemoveAll: 'تأكيد إزالة الكل؟',
  selectedFiles: 'الملفات المحددة',
  readyForProcessing: 'جاهز للمعالجة الفورية',
  create: 'إنشاء',
  starting: 'جارٍ البدء...',
  cancelProcessing: 'إلغاء المعالجة',
  processingState: 'حالة الانتظار والمعالجة الفورية',
  processingInProgress: 'جارٍ معالجة الملف محلياً...',
  processingNotice:
    'يرجى الانتظار للحظات بينما يقوم محرك فارس TOOLS بمعالجة ملفاتك محلياً بأمان تام دون رفعها لأي خادم.',
  fileCreatedSuccessfully: 'تم إنشاء الملف بنجاح',
  downloadFile: 'تنزيل الملف',
  chooseAnotherFile: 'اختيار ملف آخر',
  returnToToolSettings: 'العودة لإعدادات الأداة',
  returnToAllTools: 'العودة إلى الأدوات',
  failedProcessing: 'تعذر إتمام معالجة الملف',
  retrySameSettings: 'إعادة المحاولة بنفس الإعدادات',
  enginePendingTitle: 'محرك المعالجة قيد الإتاحة',
  enginePendingNotice:
    'تم التحقق من الملفات والإعدادات، وسيتاح المحرك البرمجي المتخصص في التحديث القادم بدون ادعاءات وهمية.',
  localSafeProcessing: 'معالجة محلية آمنة 100%',
  noActiveJobTitle: 'لا توجد عملية معالجة نشطة حالياً',
  noActiveJobDesc:
    'نظراً لأن جميع الملفات تُعالج محلياً داخل متصفحك، يرجى اختيار الملف من صفحة الأداة للبدء.',
  copyExtractedText: 'نسخ النص',
  copiedTextSuccess: 'تم نسخ النص بالكامل',
  extractedIndividualFiles: 'الملفات الفردية المستخرجة',
  downloadItem: 'تنزيل',
  savingPercent: 'أقل',
  outputFileName: 'اسم الملف الناتج',
  outputFileSize: 'حجم الملف الناتج',
  originalSize: 'الحجم الأصلي',
  themeLight: 'الوضع الفاتح (Light Mode)',
  themeDark: 'الوضع الداكن (Dark Mode)',
  reducedMotion: 'تقليل الحركات والانتقالات البصرية (Reduced Motion)',
  reducedMotionDesc: 'إيقاف حركة الشعار والتمرير السلس لراحة أكبر.',
  defaultImageQuality: 'الجودة الافتراضية عند ضغط الصور',
  defaultExportPrefix: 'بادئة أسماء الملفات الناتجة عند التنزيل',
  defaultExportPrefixDesc:
    'تُستخدم هذه البادئة تلقائياً في تسمية جميع الملفات بعد معالجتها.',
  autoScrollWorkspace: 'التمرير التلقائي إلى خيارات الأداة بعد اختيار الملف',
  autoScrollWorkspaceDesc:
    'ينقلك تلقائياً إلى لوحة ضبط الإعدادات وزر «إنشاء» فور رفع الملف.',
  confirmBeforeClearLabel: 'طلب تأكيد قبل إفراغ قائمة الملفات أو المفضلة',
  confirmBeforeClearDesc:
    'يمنع الحذف غير المقصود عند الضغط على زر «إزالة الكل» أو «إفراغ المفضلة».',
  recentTools: 'الأدوات المستخدمة مؤخراً',
  clearHistory: 'مسح السجل',
  clearFavorites: 'إفراغ قائمة المفضلة',
  confirmClearFavorites: 'اضغط مرة أخرى لتأكيد الإفراغ',
  favoritesEmptyTitle: 'قائمة المفضلة فارغة حالياً',
  favoritesEmptyDesc:
    'اضغط على أيقونة القلب الموجودة أعلى أي بطاقة أداة لإضافتها إلى قائمتك المفضلة وحفظها في متصفحك.',
  suggestedTools: 'أدوات مقترحة يمكنك إضافتها للمفضلة',
  aboutUs: 'من نحن',
  privacyPolicy: 'سياسة الخصوصية',
  termsOfUse: 'شروط الاستخدام',
  cookiePolicy: 'سياسة ملفات تعريف الارتباط',
  contactUs: 'اتصل بنا',
  faqTitle: 'أسئلة شائعة',
  allRightsReserved: 'جميع الحقوق محفوظة.',
  trustSpeedTitle: 'سرعة فورية وبلا تعقيد',
  trustSpeedDesc:
    'اختر الأداة المطلوبة، ارفع ملفك، واضبط الإعدادات في ثوانٍ معدودة عبر واجهة واضحة ومألوفة.',
  trustPrivacyTitle: 'أمان وخصوصية تامة',
  trustPrivacyDesc:
    'تتم معالجة الملفات والصور والصوت مباشرة داخل متصفح جهازك دون رفع بياناتك إلى أي خوادم خارجية.',
  trustCatalogTitle: '40 أداة في منصة واحدة',
  trustCatalogDesc:
    'مجموعة متكاملة تشمل أدوات PDF، المستندات المكتبية، الصور، الفيديو، الصوت، الكتابة العربية، والحاسبات.',
  adSenseSettingsTitle: 'إعدادات Google AdSense (للناشرين)',
  adSenseSettingsDesc:
    'بنية مركزية لإدارة معرف الناشر ووحدات الإعلانات بعد اعتماد الحساب رسمياً.',
  adSenseEnableToggle: 'تفعيل إعلانات Google AdSense',
  adSensePublisherIdLabel: 'معرف الناشر (Publisher ID)',
  adSensePublisherIdHelper:
    'يبدأ بـ ca-pub-XXXXXXXXXXXXXXXX. اتركه فارغاً حتى يتم قبول حسابك رسمياً.',
  adSensePreviewPlaceholders: 'معاينة أماكن الإعلانات المحجوزة في التخطيط',
  adSensePreviewPlaceholdersDesc:
    'يعرض حدوداً تجريبية لمواقع الإعلانات لاختبار التناسق البصري والتجاوب مع الموبايل.',
  savedSettingsSuccess: 'تم تحديث وحفظ الإعدادات في متصفحك بنجاح.',
  resetDefaultSettings: 'استعادة الإعدادات الافتراضية',
  removeWatermarkTitle: 'إزالة العلامة المائية من الصور',
  removeWatermarkDesc:
    'إزالة العلامات المائية من الصور التي يملك المستخدم حقوق تعديلها أو لديه إذن بتعديلها مع استعادة تفاصيل الخلفية.',
  responsibleUseTitle: 'ميثاق الاستخدام المسؤول والأخلاقي',
  responsibleUseNotice:
    'هذه الأداة مخصصة حصراً لمعالجة الصور التي تملك حقوق ملكيتها الفكرية أو لديك إذن رسمي وموثق من مالكها بإزالة العلامات أو الشعارات منها. يمنع منعاً باتاً استخدام الأداة لتجاوز حقوق النشر أو طمس العلامات التوثيقية دون موافقة أصحابها.',
  technicalLimitsTitle: 'ملاحظة حول حدود المعالجة المحلية',
  technicalLimitsNotice:
    'تتم المعالجة محلياً في متصفحك عبر خوارزميات استعادة الأنسجة والانتشار التوافقي دون إرسال صورك لأي خادم. تعطي الأداة نتائج ممتازة على الخلفيات البسيطة أو المتدرجة أو الأنماط المكررة، بينما قد تترك شوائب طفيفة عند وجود وجوه بشرية أو تفاصيل معقدة خلف العلامة.',
  brushTool: 'فرشاة التحديد',
  rectangleTool: 'تحديد مستطيل',
  brushSize: 'حجم الفرشاة',
  zoomIn: 'تكبير',
  zoomOut: 'تصغير',
  resetZoom: 'إعادة الضبط',
  fitToScreen: 'ملاءمة الشاشة',
  undoAction: 'تراجع',
  redoAction: 'إعادة',
  clearSelection: 'مسح التحديد',
  executeWatermarkRemoval: 'إزالة العلامة المائية',
  watermarkRemovedSuccess: 'تمت إزالة العلامة المائية بنجاح!',
  beforeAfterComparison: 'مقارنة قبل وبعد',
  sideBySideView: 'جنباً إلى جنب',
  splitSliderView: 'شريط مقارنة منزلق',
  resultOnlyView: 'النتيجة فقط',
  originalImageLabel: 'الصورة الأصلية',
  cleanedImageLabel: 'بعد إزالة العلامة',
  noMaskSelectedWarning: 'يرجى تحديد منطقة العلامة المائية أولاً باستخدام الفرشاة أو المستطيل قبل بدء المعالجة.',
  downloadCleanedImage: 'تنزيل الصورة المعالجة',
  selectWatermarkFirstPrompt: 'حدد العلامة المائية بالفرشاة أو بالمستطيل لتفعيل زر المعالجة.',
};

export const EN_TRANSLATIONS: TranslationDictionary = {
  brandName: 'Fares Tools',
  brandTagline: 'Do more. In fewer steps.',
  brandDescription:
    'Free, comprehensive online utility platform for PDF, image, video, audio, and document conversion with 100% private in-browser client-side processing.',
  allTools: 'All Tools',
  pdfTools: 'PDF Tools',
  imageTools: 'Image Tools',
  videoTools: 'Video Tools',
  audioTools: 'Audio Tools',
  documentTools: 'Document Tools',
  arabicTools: 'Writing & AI Tools',
  calculatorTools: 'Calculators',
  home: 'Home',
  favorites: 'Favorites',
  settings: 'Settings',
  searchPlaceholder: 'Search tools by name, format, or task...',
  searchButton: 'Search',
  heroHeadline: 'All Your Tools in One Place.',
  heroSubheadline:
    'Smart, lightning-fast utilities to convert, edit, compress, and secure your files directly in your browser.',
  freeOnlineTools: 'Free Online Browser Utilities',
  exploreAllTools: 'Explore All 40 Tools',
  browseByCategory: 'Browse Tools by Category',
  browseCategoryDesc:
    'Select a dedicated department for instant access to high-performance client-side utilities.',
  toolsCount: 'tools',
  tool: 'tool',
  open: 'Open',
  howToUseSteps: 'How to use this tool in 3 simple steps',
  step: 'Step',
  chooseFiles: 'Choose File from Device',
  dragDropFiles: 'Drag and drop files here, or click to browse',
  supportedFormats: 'Supported Formats',
  allStandardFormats: 'All standard formats supported',
  removeAll: 'Remove All',
  confirmRemoveAll: 'Confirm remove all?',
  selectedFiles: 'Selected Files',
  readyForProcessing: 'Ready for instant local processing',
  create: 'Process',
  starting: 'Starting...',
  cancelProcessing: 'Cancel Processing',
  processingState: 'Client-side processing in progress',
  processingInProgress: 'Processing file locally...',
  processingNotice:
    'Please hold on while Fares Tools processes your file securely inside your browser. No files are uploaded to any external server.',
  fileCreatedSuccessfully: 'File Created Successfully',
  downloadFile: 'Download File',
  chooseAnotherFile: 'Choose Another File',
  returnToToolSettings: 'Back to Tool Settings',
  returnToAllTools: 'Back to All Tools',
  failedProcessing: 'Processing Failed',
  retrySameSettings: 'Retry with Same Settings',
  enginePendingTitle: 'Engine In Pipeline',
  enginePendingNotice:
    'File parameters and schema verified. Engine rollout scheduled without mock downloads.',
  localSafeProcessing: '100% Safe Local Browser Processing',
  noActiveJobTitle: 'No Active Processing Job',
  noActiveJobDesc:
    'Because all tasks run locally in browser memory, please select a file from the tool page to start.',
  copyExtractedText: 'Copy Text',
  copiedTextSuccess: 'Text Copied to Clipboard',
  extractedIndividualFiles: 'Extracted Individual Files',
  downloadItem: 'Download',
  savingPercent: 'smaller',
  outputFileName: 'Output File Name',
  outputFileSize: 'Output File Size',
  originalSize: 'Original Size',
  themeLight: 'Light Mode',
  themeDark: 'Dark Mode',
  reducedMotion: 'Reduced Motion',
  reducedMotionDesc:
    'Disables horse emblem animation and smooth auto-scrolling for visual comfort.',
  defaultImageQuality: 'Default Image Compression Quality',
  defaultExportPrefix: 'Default Export File Name Prefix',
  defaultExportPrefixDesc:
    'Prepended automatically to all downloaded files (e.g., fares-tools-merged.pdf).',
  autoScrollWorkspace: 'Auto-scroll to options after file selection',
  autoScrollWorkspaceDesc:
    'Scrolls smoothly down to the options panel once files are dropped or chosen.',
  confirmBeforeClearLabel: 'Confirm before clearing file list or favorites',
  confirmBeforeClearDesc:
    'Prevents accidental loss when clicking "Remove All" or "Clear Favorites".',
  recentTools: 'Recently Used Tools',
  clearHistory: 'Clear History',
  clearFavorites: 'Clear Favorites',
  confirmClearFavorites: 'Click again to confirm clear',
  favoritesEmptyTitle: 'Your favorites list is empty',
  favoritesEmptyDesc:
    'Click the heart icon on any tool card or detail header to save it for quick access.',
  suggestedTools: 'Suggested Tools You May Like',
  aboutUs: 'About Us',
  privacyPolicy: 'Privacy Policy',
  termsOfUse: 'Terms of Use',
  cookiePolicy: 'Cookie Policy',
  contactUs: 'Contact Us',
  faqTitle: 'Frequently Asked Questions',
  allRightsReserved: 'All rights reserved.',
  trustSpeedTitle: 'Instant & Zero Hassle',
  trustSpeedDesc:
    'Select your tool, pick your file, and get your result in seconds without complex signups.',
  trustPrivacyTitle: 'Complete Privacy by Design',
  trustPrivacyDesc:
    'Documents, photos, and media are computed directly in client memory without external server transmission.',
  trustCatalogTitle: '40 Essential Tools in One Suite',
  trustCatalogDesc:
    'Comprehensive utilities covering PDF, Office conversions, images, audio, video, Arabic script, and calculations.',
  adSenseSettingsTitle: 'Google AdSense Configuration (Publisher)',
  adSenseSettingsDesc:
    'Centralized infrastructure for publisher credentials and ad unit placements once approved.',
  adSenseEnableToggle: 'Enable Google AdSense Integration',
  adSensePublisherIdLabel: 'Publisher ID (Ad Client)',
  adSensePublisherIdHelper:
    'Must start with ca-pub-XXXXXXXXXXXXXXXX. Leave blank until formally approved.',
  adSensePreviewPlaceholders: 'Preview Reserved Layout Ad Placements',
  adSensePreviewPlaceholdersDesc:
    'Renders non-intrusive container outlines to verify responsive layout without third-party scripts.',
  savedSettingsSuccess: 'Settings updated and saved in local storage.',
  resetDefaultSettings: 'Reset to Defaults',
  removeWatermarkTitle: 'Remove Watermark from Image',
  removeWatermarkDesc:
    'Remove watermarks from images you have rights or permission to edit, reconstructing background textures cleanly.',
  responsibleUseTitle: 'Responsible & Ethical Use Notice',
  responsibleUseNotice:
    'This tool is strictly designated for images that you own or have explicit authorization from the copyright holder to edit. Removing copyright markings or ownership identifiers without permission is prohibited.',
  technicalLimitsTitle: 'Local Processing Boundaries & Limitations',
  technicalLimitsNotice:
    'Processing occurs locally in your browser via harmonic diffusion and texture reconstruction without sending files to any server. Results are optimal on simple, textured, or gradient backgrounds; faint smoothing may appear over faces or intricate patterns.',
  brushTool: 'Brush Selector',
  rectangleTool: 'Rectangle Box',
  brushSize: 'Brush Size',
  zoomIn: 'Zoom In',
  zoomOut: 'Zoom Out',
  resetZoom: 'Reset Zoom',
  fitToScreen: 'Fit to Screen',
  undoAction: 'Undo',
  redoAction: 'Redo',
  clearSelection: 'Clear Selection',
  executeWatermarkRemoval: 'Remove Watermark',
  watermarkRemovedSuccess: 'Watermark removed successfully!',
  beforeAfterComparison: 'Before & After Comparison',
  sideBySideView: 'Side-by-Side',
  splitSliderView: 'Split Slider',
  resultOnlyView: 'Result Only',
  originalImageLabel: 'Original Image',
  cleanedImageLabel: 'Cleaned Image',
  noMaskSelectedWarning: 'Please mark the watermark area with the brush or rectangle tool first before processing.',
  downloadCleanedImage: 'Download Cleaned Image',
  selectWatermarkFirstPrompt: 'Select the watermark region on the image using brush or rectangle to enable processing.',
};
