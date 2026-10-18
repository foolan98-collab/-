/**
 * High-value educational guides for Fares Tools.
 * Each guide answers a real question, gives step-by-step instructions,
 * links directly to the appropriate tool, and explains realistic limitations.
 */

export interface GuideArticle {
  slug: string;
  titleAr: string;
  titleEn: string;
  shortDescAr: string;
  shortDescEn: string;
  category: 'pdf' | 'images';
  categoryLabelAr: string;
  categoryLabelEn: string;
  toolSlug: string;
  toolNameAr: string;
  toolNameEn: string;
  readTimeMinutes: number;
  publishDate: string;
  keywordsAr: string[];
  keywordsEn: string[];
  introAr: string;
  introEn: string;
  steps: {
    num: string;
    headingAr: string;
    headingEn: string;
    textAr: string;
    textEn: string;
  }[];
  tipsAr: string[];
  tipsEn: string[];
  limitationsAr: string[];
  limitationsEn: string[];
  faqs: {
    qAr: string;
    aAr: string;
    qEn: string;
    aEn: string;
  }[];
}

export const GUIDES_LIST: GuideArticle[] = [
  // Guide 1: How to compress PDF without losing quality
  {
    slug: 'how-to-compress-pdf-without-losing-quality',
    titleAr: 'كيفية ضغط ملف PDF مع الحفاظ على وضوحه وجودته',
    titleEn: 'How to Compress a PDF File Without Losing Quality',
    shortDescAr: 'دليل عملي خطوة بخطوة لتقليص حجم مستندات PDF لتسهيل إرسالها بالبريد الإلكتروني مع الحفاظ على حدة النصوص والخطوط.',
    shortDescEn: 'A practical step-by-step guide to reducing PDF file size for email sharing while preserving crisp vector text and font fidelity.',
    category: 'pdf',
    categoryLabelAr: 'دليل مستندات PDF',
    categoryLabelEn: 'PDF Guide',
    toolSlug: 'compress-pdf',
    toolNameAr: 'أداة ضغط ملفات PDF',
    toolNameEn: 'Compress PDF Tool',
    readTimeMinutes: 4,
    publishDate: '2026-10-12',
    keywordsAr: ['ضغط ملف PDF', 'تقليل حجم بي دي اف بدون فقدان الجودة', 'تصغير حجم PDF للبريد'],
    keywordsEn: ['compress PDF without losing quality', 'reduce PDF size for email', 'lossless PDF compression'],
    introAr: 'كثيراً ما نواجه مشكلة رفض بوابات التوظيف أو البريد الإلكتروني للمستندات بسبب تجاوزها الحجم الأقصى المسموح (مثل 5 أو 10 ميجابايت). في هذا الدليل العملي، نوضح كيف يتم تقليص حجم ملفات PDF بذكاء دون المساس بالنصوص المتجهة والخطوط الأساسية.',
    introEn: 'Job application portals and email providers often enforce strict file upload limits (typically 5 to 10 MB). This practical guide explains how to compress PDF files intelligently while retaining razor-sharp vector typography.',
    steps: [
      {
        num: '01',
        headingAr: 'التحقق من طبيعة المحتوى داخل المستند',
        headingEn: 'Examine the Document Composition',
        textAr: 'تحقق مما إذا كان الملف يحتوي على صور ممسوحة ضوئياً (Scanned pages) أو نصوص متجهة أصلية؛ فالصور الممسوحة تقبل ضغطاً كبيراً، بينما النصوص تتطلب ضغطاً هيكلياً فقط.',
        textEn: 'Check whether your file consists of scanned bitmap pages or digital vector text; scanned photos compress drastically, whereas pure text requires structural optimization.',
      },
      {
        num: '02',
        headingAr: 'اختيار مستوى الضغط المناسب للغرض',
        headingEn: 'Select the Appropriate Compression Profile',
        textAr: 'اختر نمط «الضغط المتوازن» للتقارير الرسمية ليظل النص حاداً جداً، أو نمط «الضغط الأقصى» إذا كان الهدف هو الإرسال السريع عبر تطبيقات الدردشة.',
        textEn: 'Choose "Balanced" for official work documents to preserve font clarity, or "Extreme" if your goal is rapid messaging over mobile networks.',
      },
      {
        num: '03',
        headingAr: 'المعالجة المحلية الآمنة والتنزيل المباشر',
        headingEn: 'Local In-Browser Processing & Download',
        textAr: 'اضغط على تنفيذ المعالجة داخل المتصفح، حيث تُعاد هيكلة مصفوفات البايت محلياً دون رفع الملف لأي خادم خارجي، ثم احفظ الملف الناتج باسم جديد.',
        textEn: 'Run the compression locally in your browser memory without uploading sensitive records, and save the verified reduced output.',
      },
    ],
    tipsAr: [
      'احرص دائماً على الاحتفاظ بنسخة من الملف الأصلي قبل استبداله.',
      'إذا كان المستند يحتوي على صور ذات دقة 300 DPI مخصصة للمطابع، فإن تحويلها لـ 150 DPI يوفر حتى 70% من الحجم دون أي فرق ملحوظ على الشاشة.',
    ],
    tipsEn: [
      'Always keep a backup copy of your original high-resolution document.',
      'Downscaling 300 DPI print photos to 150 DPI screen resolution saves up to 70% of size with no noticeable loss on mobile and desktop displays.',
    ],
    limitationsAr: [
      'الملفات المحمية بكلمات مرور تحتاج إلى فك التشفير أولاً.',
      'الملفات النصية الخالصة التي ضُغطت سابقاً لن تنخفض بدرجة ملحوظة لأن البايتات مهيأة بالفعل إلى حدها الأدنى.',
    ],
    limitationsEn: [
      'Password-encrypted documents must be unlocked before compression.',
      'Already optimized pure-text documents will not shrink noticeably because their font tables are already minimal.',
    ],
    faqs: [
      {
        qAr: 'هل يمكنني قراءة نصوص الـ PDF بعد الضغط؟',
        aAr: 'نعم، في نمط الضغط المتوازن تظل جميع النصوص الرقمية قابلة للقراءة والبحث والنسخ بالكامل.',
        qEn: 'Will texts remain readable and searchable?',
        aEn: 'Yes, in balanced mode vector text streams remain fully selectable and searchable.',
      },
    ],
  },

  // Guide 2: How to convert images to PDF
  {
    slug: 'how-to-convert-images-to-pdf',
    titleAr: 'كيفية تحويل وترتيب الصور إلى مستند PDF مجمّع',
    titleEn: 'How to Convert and Combine Images into a Single PDF',
    shortDescAr: 'شرح مبسط لكيفية جمع الفواتير، بطاقات الهوية، ولقطات الشاشة في ملف PDF واحد منظم يسهل إرساله وطباعته.',
    shortDescEn: 'A clear guide to combining invoices, receipts, and photos into an organized, professional PDF document.',
    category: 'images',
    categoryLabelAr: 'دليل الصور',
    categoryLabelEn: 'Image Guide',
    toolSlug: 'jpg-to-pdf',
    toolNameAr: 'أداة تحويل الصور إلى PDF',
    toolNameEn: 'JPG to PDF Tool',
    readTimeMinutes: 3,
    publishDate: '2026-10-12',
    keywordsAr: ['تحويل الصور الى PDF', 'دمج الصور في ملف بي دي اف', 'جمع الفواتير في PDF'],
    keywordsEn: ['convert images to PDF', 'combine JPG into PDF', 'photos to PDF maker'],
    introAr: 'عند تقديم المعاملات الرسمية أو إرسال التقارير، يُطلب منا غالباً تقديم مستند PDF واحد بدلاً من إرسال عشرات الصور المبعثرة. إليك كيفية تجميع وترتيب الصور في ملف PDF متناسق في ثوانٍ معدودة.',
    introEn: 'Government forms and business clients frequently request a single consolidated PDF rather than dozens of separate image attachments. Learn how to sequence and merge photos into an elegant PDF in seconds.',
    steps: [
      {
        num: '01',
        headingAr: 'تجهيز واختيار الصور المناسبة',
        headingEn: 'Select & Review Source Photos',
        textAr: 'اختر صور الفواتير أو الصفحات بصيغة JPG أو PNG من هاتفك أو جهازك، وتأكد من أن اتجاه الصور معتدل وقابل للقراءة.',
        textEn: 'Gather your receipts, invoices, or screenshots in JPG or PNG format, verifying that all pages are oriented upright.',
      },
      {
        num: '02',
        headingAr: 'تنظيم تسلسل الصفحات والاتجاه',
        headingEn: 'Arrange Sequence & Page Orientation',
        textAr: 'رتب تسلسل الصور بحسب الترتيب الزمني أو الرقمي المطلوب، وحدد اتجاه الصفحة (عمودي Portrait أو أفقي Landscape).',
        textEn: 'Organize files in your preferred sequence and select page orientation (Portrait or Landscape) to match your document.',
      },
      {
        num: '03',
        headingAr: 'التوليد الفوري والحفظ',
        headingEn: 'Instant PDF Generation & Download',
        textAr: 'انقر على زر التحويل ليقوم المحرك المحلي بتجميع الصور في صفحات PDF ذات أبعاد قياسية متوافقة مع الطباعة.',
        textEn: 'Click generate to compile the photos into standardized, printable PDF pages within your browser.',
      },
    ],
    tipsAr: [
      'تجنب اقتصاص حواف الوثيقة الهامة، واحرص على وجود إضاءة كافية عند تصوير الأوراق بالكاميرا.',
      'إذا كانت الصور كبيرة جداً، استخدم أداة ضغط الصور أولاً لتسريع العملية.',
    ],
    tipsEn: [
      'Avoid cropping text borders, and ensure even lighting when photographing documents with your phone.',
      'If your photos exceed 10 MB each, run them through an image compressor first to keep the final PDF nimble.',
    ],
    limitationsAr: [
      'تظل الصور المدمجة كطبقات بصرية (Raster images)؛ لا يقوم هذا التحويل بالتعرف التلقائي على النصوص OCR.',
      'يُنصح باختيار صور ذات نسب أبعاد متقاربة للحصول على مظهر متناسق للصفحات.',
    ],
    limitationsEn: [
      'Photos are embedded as visual raster layers; this conversion does not perform automatic OCR text extraction.',
      'Using images with consistent aspect ratios results in the most professional visual layout.',
    ],
    faqs: [
      {
        qAr: 'هل يمكنني إضافة صور بصيغ مختلفة كـ PNG وJPG معاً؟',
        aAr: 'نعم، يمكنك خلط صور JPG وPNG وWebP في نفس المستند بكل سلاسة.',
        qEn: 'Can I mix JPG and PNG files together?',
        aEn: 'Yes, you can combine JPG, PNG, and WebP files into the same output PDF document seamlessly.',
      },
    ],
  },

  // Guide 3: How to reduce image size for web
  {
    slug: 'how-to-reduce-image-size-for-web',
    titleAr: 'كيفية تقليل حجم الصور للمواقع والمشاركة بدون فقدان الجودة',
    titleEn: 'How to Reduce Image Size for Web Sharing Without Quality Loss',
    shortDescAr: 'طرق ذكية لتقليل حجم صور JPG وPNG بنسبة تصل إلى 80% لتسريع تحميل المواقع وإرسالها بسهولة عبر تطبيقات المراسلة.',
    shortDescEn: 'Smart techniques to shrink JPG and PNG image weight by up to 80% for faster page loads and smooth chat delivery.',
    category: 'images',
    categoryLabelAr: 'دليل تحسين الصور',
    categoryLabelEn: 'Image Optimization Guide',
    toolSlug: 'compress-images',
    toolNameAr: 'أداة ضغط الصور',
    toolNameEn: 'Compress Images Tool',
    readTimeMinutes: 4,
    publishDate: '2026-10-12',
    keywordsAr: ['تصغير حجم الصور', 'تقليل حجم الصور للويب', 'ضغط الصور بدون فقدان الجودة'],
    keywordsEn: ['reduce image size for web', 'compress photos free', 'optimize images for website'],
    introAr: 'الصور الثقيلة هي السبب الأول في بطء تحميل المواقع الإلكترونية واستهلاك باقات الإنترنت عند المشاركة على واتساب ومواقع التواصل. من خلال موازنة جودة الضغط، يمكنك تصغير الصورة من 5 ميجابايت إلى 300 كيلوبايت دون أي فرق تلاحظه العين المجردة.',
    introEn: 'Bloated images are the number one cause of sluggish web page speeds and heavy data usage. By leveraging perceptual compression, you can reduce 5 MB photos to 300 KB with virtually zero visible difference.',
    steps: [
      {
        num: '01',
        headingAr: 'تحديد الصيغة الأنسب لنوع المحتوى',
        headingEn: 'Select the Best Image Format',
        textAr: 'استخدم JPG للصور الفوتوغرافية الطبيعية الغنية بالألوان، واستخدم PNG للشعارات والرسومات التوضيحية التي تتطلب شفافية.',
        textEn: 'Use JPG for real-world photos with rich gradients, and PNG for logos or icons requiring crisp sharp edges and transparency.',
      },
      {
        num: '02',
        headingAr: 'تعديل جودة التصدير الذكية (70% - 85%)',
        headingEn: 'Tune the Export Quality Slider (70% - 85%)',
        textAr: 'تُظهر الدراسات البصرية أن ضبط الجودة عند 80% يحذف المعلومات غير المحسوسة للعين البشرية ويوفر أكثر من نصف الحجم فوراً.',
        textEn: 'Perceptual psychovisual research shows that an 80% quality setting strips imperceptible color redundancies while cutting file weight in half.',
      },
      {
        num: '03',
        headingAr: 'المعاينة اللحظية والحفظ المباشر',
        headingEn: 'Live Preview & Verified Download',
        textAr: 'عاين نسبة التوفير المحققة وتأكد من وضوح الصورة قبل حفظها على جهازك دون أي علامة مائية.',
        textEn: 'Inspect the resulting file size and preview quality side-by-side before downloading your optimized file.',
      },
    ],
    tipsAr: [
      'إذا كانت أبعاد الصورة الأصلية تتجاوز 4000 بكسل، استخدم أداة تغيير الأبعاد لتصغيرها إلى 1920 بكسل قبل الضغط لمضاعفة التوفير.',
      'لا تكرر ضغط الصورة نفسها عدة مرات بصيغة JPG حتى لا تتراكم عيوب الترميز.',
    ],
    tipsEn: [
      'If your camera shot exceeds 4000px width, resize it to 1920px first for maximum savings.',
      'Avoid re-compressing the same JPG file multiple times to prevent generation loss artifacts.',
    ],
    limitationsAr: [
      'ضغط الصور المتكرر بجودة منخفضة جداً (أقل من 30%) قد يؤدي لظهور تحبب أو مربعات بكسلية حول الحواف الحادة.',
      'الصور التي تم ضغطها مسبقاً بأقصى درجة لن تحقق نسب توفير إضافية كبيرة.',
    ],
    limitationsEn: [
      'Setting quality below 30% introduces visible blocking artifacts around contrasty edges.',
      'Photos that have already been aggressively compressed by chat apps will not yield further savings.',
    ],
    faqs: [
      {
        qAr: 'ما الفرق بين ضغط الصور وتغيير أبعادها؟',
        aAr: 'تغيير الأبعاد يغير عدد البكسلات (العرض والارتفاع)، بينما الضغط يقلل كمية البيانات المشفرة لكل بكسل مع إبقاء نفس الأبعاد.',
        qEn: 'What is the difference between compressing and resizing?',
        aEn: 'Resizing alters pixel dimensions (width/height), whereas compression optimizes data encoding while keeping the dimensions intact.',
      },
    ],
  },

  // Guide 4: How to extract text from PDF
  {
    slug: 'how-to-extract-text-from-pdf',
    titleAr: 'كيفية استخراج النص من ملف PDF القابل للنسخ محلياً',
    titleEn: 'How to Extract Searchable Text from a PDF Document Locally',
    shortDescAr: 'طريقة استخراج النصوص والفقرات من مستندات وأبحاث PDF ونسخها مباشرة أو حفظها كملف نصي دون الحاجة لبرامج مدفوعة.',
    shortDescEn: 'How to parse and extract selectable digital text from PDF reports and articles without paying for expensive desktop software.',
    category: 'pdf',
    categoryLabelAr: 'دليل استخراج النصوص',
    categoryLabelEn: 'Text Extraction Guide',
    toolSlug: 'extract-pdf-text',
    toolNameAr: 'أداة استخراج النص من PDF',
    toolNameEn: 'Extract PDF Text Tool',
    readTimeMinutes: 3,
    publishDate: '2026-10-12',
    keywordsAr: ['استخراج النص من PDF', 'نسخ نص من بي دي اف', 'سحب محتوى PDF الى نص'],
    keywordsEn: ['extract text from PDF', 'copy text from PDF', 'PDF to text converter free'],
    introAr: 'عند تصفح أبحاث أو كتب بصيغة PDF، قد تحتاج لاقتباس فقرات أو نسخ جداول ونصوص لإعادة استخدامها في تقرير أو مقال. نوضح في هذا الدليل كيفية استخراج النصوص الكاملة مباشرة بنقرة واحدة.',
    introEn: 'When researching papers or reading PDF reports, extracting citations and paragraphs into your notes saves hours of re-typing. Here is how to extract and copy readable text streams in one click.',
    steps: [
      {
        num: '01',
        headingAr: 'التأكد من أن ملف PDF يحتوي على نصوص رقمية',
        headingEn: 'Confirm Digital Text Availability',
        textAr: 'تأكد من أن المستند يحتوي على نصوص رقمية قابلة للتحديد، حيث تختلف الملفات الرقمية عن المستندات المصورة بكاميرا الهاتف.',
        textEn: 'Check that the document has digital selectable characters rather than being a raw scanned photograph.',
      },
      {
        num: '02',
        headingAr: 'رفع المستند والمعالجة اللحظية',
        headingEn: 'Load Document & Parse Streams',
        textAr: 'افتح ملفك داخل الأداة ليقوم محرك PDF.js المدمج بقراءة تدفق النصوص وترتيب الأسطر من اليمين لليسار.',
        textEn: 'Open your file in the tool to let the internal PDF engine parse text tokens and format them in clean reading order.',
      },
      {
        num: '03',
        headingAr: 'نسخ النص أو تنزيله كملف نصي',
        headingEn: 'Copy to Clipboard or Save as File',
        textAr: 'راجع النص المستخرج داخل نافذة العرض، ثم انقر على «نسخ النص» أو حمله كملف نصي خالص (.txt).',
        textEn: 'Review the text in the viewer, then click "Copy Text" or download it as a plain .txt file.',
      },
    ],
    tipsAr: [
      'إذا كان المستند يحتوي على نصوص عربية، تضمن الأداة الحفاظ على ترتيب الكلمات والهمزات بالاتجاه الصحيح.',
      'يمكنك استخدام نصوص الـ PDF المستخرجة في أداة «التدقيق وتشكيل النصوص» لضبط القواعد والتشكيل.',
    ],
    tipsEn: [
      'For Arabic documents, our engine preserves right-to-left word sequencing and diacritics.',
      'You can paste extracted text into our Arabic Writing Assistant to proofread spelling and typography.',
    ],
    limitationsAr: [
      'الأوراق الممسوحة كصورة فوتوغرافية دون طبقة نصوص مدمجة تتطلب محرك OCR للتعرف البصري على الحروف.',
      'الملفات المقفلة بحماية تمنع نسخ المحتوى تتطلب إدخال كلمة المرور أولاً.',
    ],
    limitationsEn: [
      'Scanned photos with no underlying digital font layer require specialized OCR engines.',
      'Permissions-restricted PDF files require password authentication before extraction.',
    ],
    faqs: [
      {
        qAr: 'هل تُحفظ نصوصي أو ملفاتي بعد الاستخراج؟',
        aAr: 'لا، تتم قراءة النصوص بالكامل داخل ذاكرة متصفحك وتختفي فور إغلاق الصفحة لضمان خصوصيتك.',
        qEn: 'Are my extracted texts stored on a server?',
        aEn: 'No, text parsing happens purely inside your browser memory and is discarded upon leaving.',
      },
    ],
  },

  // Guide 5: How to remove watermarks responsibly
  {
    slug: 'how-to-remove-watermarks-responsibly',
    titleAr: 'الدليل المسؤول لإزالة العلامات المائية واستعادة تفاصيل الصور',
    titleEn: 'Responsible Guide to Removing Watermarks & Object Inpainting',
    shortDescAr: 'شرح كيفية استعادة خلفيات الصور وإزالة التواريخ والعلامات غير المرغوبة من الصور المصرح بتعديلها عبر المعالجة المحلية.',
    shortDescEn: 'How to clean up date stamps and unwanted visual marks from authorized personal photos using in-browser inpainting.',
    category: 'images',
    categoryLabelAr: 'دليل معالجة الصور',
    categoryLabelEn: 'Image Repair Guide',
    toolSlug: 'remove-watermark',
    toolNameAr: 'أداة إزالة العلامة المائية',
    toolNameEn: 'Remove Watermark Tool',
    readTimeMinutes: 4,
    publishDate: '2026-10-12',
    keywordsAr: ['إزالة العلامة المائية من الصور', 'مسح التاريخ من الصورة', 'تعديل الصور بمسؤولية'],
    keywordsEn: ['remove watermark responsibly', 'photo inpainting in browser', 'erase date stamp from picture'],
    introAr: 'عند التقاط صور بكاميرات الهواتف القديمة أو بعض التطبيقات، قد يُطبع تاريخ أو علامة وقت غير مرغوبة على زاوية الصورة العائلية. يوضح هذا الدليل كيفية استخدام خوارزميات الاستكمال اللوني التوافقي (Harmonic Diffusion) لاستعادة خلفية الصورة دون تشويه.',
    introEn: 'Old phone cameras or scanner apps often stamp unwanted date marks across personal pictures. This guide explains how to use local harmonic diffusion inpainting to cleanly restore background textures.',
    steps: [
      {
        num: '01',
        headingAr: 'التحقق من حقوق ملكية وتعديل الصورة',
        headingEn: 'Verify Authorized Modification Rights',
        textAr: 'تأكد من أنك تملك الصورة أو تملك إذناً صريحاً بتعديلها واستخدامها لأغراض مشروعة تحترم الملكية الفكرية.',
        textEn: 'Ensure you own the picture or hold authorized permission to modify it in compliance with intellectual property standards.',
      },
      {
        num: '02',
        headingAr: 'تحديد منطقة العلامة المائية بدقة',
        headingEn: 'Accurately Highlight the Mark Area',
        textAr: 'استخدم أداة التحديد المستطيل أو الفرشاة لإحاطة العلامة المائية بأقرب حافة ممكنة دون توسيع التحديد على تفاصيل بريئة.',
        textEn: 'Use the box or brush tool to select strictly the marked region without extending onto unrelated subject details.',
      },
      {
        num: '03',
        headingAr: 'المعالجة واستعراض مقارنة قبل وبعد',
        headingEn: 'Execute Inpainting & Review Before/After',
        textAr: 'انقر على إزالة العلامة المائية ليقوم المحرك باستقراء بكسلات المحيط ونشر التدرج اللوني، ثم قارن النتيجة قبل الحفظ.',
        textEn: 'Click remove watermark to propagate surrounding boundary gradients and inspect the side-by-side comparison before saving.',
      },
    ],
    tipsAr: [
      'الخلفيات البسيطة (كالسماء، الجدران، الأرضيات الرملية) تعطي نتائج استعادة غير ملحوظة على الإطلاق.',
      'إذا كانت العلامة فوق نصوص أو وجوه دقيقة، استخدم فرشاة صغيرة الحجم للحد من منطقة التعديل.',
    ],
    tipsEn: [
      'Uniform backgrounds (sky, gradients, sand) restore with virtually invisible transitions.',
      'For marks near intricate edges, use a smaller brush radius to constrain diffusion strictly to the target pixels.',
    ],
    limitationsAr: [
      'لا يُستخدم هذا النظام لتجاوز حماية المحتوى المحمي بحقوق النشر للغير.',
      'إزالة العلامات الكبيرة الممتدة على كامل الصورة قد تترك تأثيراً ضبابياً طفيفاً في المناطق ذات التفاصيل العالية.',
    ],
    limitationsEn: [
      'Never use this tool to infringe upon copyright-protected artwork of other creators.',
      'Very large marks spanning complex facial details will exhibit mild smoothing artifacts.',
    ],
    faqs: [
      {
        qAr: 'كيف تعمل خوارزمية الاستكمال التوافقي محلياً؟',
        aAr: 'تحدد الخوارزمية بكسلات الإطار الخارجي وتقوم بنشر الألوان والأنماط نحو الداخل لملء الفراغ بشكل ناعم ومتناسق.',
        qEn: 'How does harmonic diffusion work in the browser?',
        aEn: 'The algorithm samples boundary pixels around the mask and iteratively diffuses color gradients inward to fill the gap naturally.',
      },
    ],
  },
];

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return GUIDES_LIST.find((g) => g.slug === slug);
}
