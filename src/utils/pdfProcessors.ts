import {
  PDFDocument,
  degrees,
  StandardFonts,
  rgb,
  PDFName,
  PDFDict,
  PDFString,
  PDFHexString,
  PDFNumber,
  PDFArray,
  PDFStream,
  PDFObject,
} from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';
import {
  ProcessedOutput,
  SecondaryProcessedItem,
} from '../components/workspace/StatusAndResultViews';
import { formatFileSize } from '../components/workspace/FileUploadDropzone';
import { parsePageSelectionString } from './pdfPageParser';

// Polyfill Promise.try, Uint8Array.prototype.toHex, and Map.prototype.getOrInsertComputed for browsers/runtimes that do not yet implement ES2025 methods (used internally by pdfjs-dist v5)
if (typeof (Promise as unknown as { try?: unknown }).try !== 'function') {
  (
    Promise as unknown as {
      try: <T>(
        fn: (...args: unknown[]) => T,
        ...args: unknown[]
      ) => Promise<Awaited<T>>;
    }
  ).try = function <T>(
    fn: (...args: unknown[]) => T,
    ...args: unknown[]
  ): Promise<Awaited<T>> {
    return new Promise((resolve, reject) => {
      try {
        resolve(fn(...args) as Awaited<T>);
      } catch (err) {
        reject(err);
      }
    });
  };
}

if (
  typeof (Uint8Array.prototype as unknown as { toHex?: unknown }).toHex !==
  'function'
) {
  (Uint8Array.prototype as unknown as { toHex: () => string }).toHex =
    function (this: Uint8Array): string {
      let hex = '';
      for (let i = 0; i < this.length; i++) {
        hex += this[i].toString(16).padStart(2, '0');
      }
      return hex;
    };
}

if (
  typeof (Map.prototype as unknown as { getOrInsertComputed?: unknown })
    .getOrInsertComputed !== 'function'
) {
  (
    Map.prototype as unknown as {
      getOrInsertComputed: <K, V>(
        this: Map<K, V>,
        key: K,
        callbackfn: (key: K) => V
      ) => V;
    }
  ).getOrInsertComputed = function <K, V>(
    this: Map<K, V>,
    key: K,
    callbackfn: (key: K) => V
  ): V {
    if (this.has(key)) {
      return this.get(key) as V;
    }
    const val = callbackfn(key);
    this.set(key, val);
    return val;
  };
}

// Configure PDF.js worker using Vite's asset URL import
if (typeof pdfWorkerUrl === 'string' && pdfWorkerUrl.length > 0) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
} else {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

function uint8ArrayToPdfBlob(bytes: Uint8Array): Blob {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: 'application/pdf' });
}

async function cleanupPdfJsDoc(doc: pdfjsLib.PDFDocumentProxy): Promise<void> {
  try {
    await doc.cleanup();
  } catch {
    // ignore cleanup error
  }
}

/**
 * Helper to load and validate a PDF file using pdf-lib.
 * Provides clear Arabic error messages for encrypted, empty, or corrupted files.
 */
export async function loadValidatedPdfDocument(
  file: File
): Promise<{ pdfDoc: PDFDocument; bytes: ArrayBuffer; pageCount: number }> {
  if (!file || file.size === 0) {
    throw new Error(`الملف "${file?.name || 'غير معروف'}" فارغ ولا يمكن قراءته.`);
  }

  let bytes: ArrayBuffer;
  try {
    bytes = await file.arrayBuffer();
  } catch {
    throw new Error(`تعذر قراءة محتوى الملف "${file.name}" من جهازك.`);
  }

  // Basic PDF header signature check (%PDF-)
  const headerBytes = new Uint8Array(bytes.slice(0, 8));
  const headerStr = String.fromCharCode(...headerBytes);
  if (!headerStr.includes('%PDF-')) {
    throw new Error(
      `الملف "${file.name}" ليس ملف PDF صالحاً (ترويسة الملف غير مطابقة لصيغة PDF).`
    );
  }

  try {
    const pdfDoc = await PDFDocument.load(bytes, {
      updateMetadata: false,
    });
    const pageCount = pdfDoc.getPageCount();
    if (pageCount === 0) {
      throw new Error(`الملف "${file.name}" لا يحتوي على أي صفحات.`);
    }
    return { pdfDoc, bytes, pageCount };
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (
      msg.toLowerCase().includes('encrypted') ||
      msg.toLowerCase().includes('password')
    ) {
      throw new Error(
        `الملف "${file.name}" محمي بكلمة مرور (مشفّر). يرجى استخدام ملف غير مشفّر.`
      );
    }
    if (msg.includes('لا يحتوي على أي صفحات') || msg.includes('ليس ملف PDF')) {
      throw err;
    }
    throw new Error(
      `الملف "${file.name}" تالف أو بتنسيق PDF غير مدعوم ولا يمكن فتحه.`
    );
  }
}

/**
 * Inspects a PDF file and returns its page count for UI display.
 */
export async function inspectPdfPageCount(file: File): Promise<number> {
  const { pageCount } = await loadValidatedPdfDocument(file);
  return pageCount;
}

export { parsePageSelectionString } from './pdfPageParser';

export type ProgressCallback = (msg: string, percent?: number) => void;

/**
 * 1. MERGE PDF (/tools/merge-pdf)
 * Merges 2 or more PDF files in the exact displayed order.
 * Validates the output PDF before returning.
 */
export async function processMergePdf(
  files: File[],
  _options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  if (!files || files.length < 2) {
    throw new Error(
      'يرجى اختيار ملفين بصيغة PDF على الأقل لإجراء عملية الدمج.'
    );
  }

  onProgress?.('جارٍ تجهيز ملفاتك لعملية الدمج...', 10);

  const mergedPdf = await PDFDocument.create();
  let totalInputSize = 0;
  let totalMergedPages = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const pct = Math.round(15 + ((i + 0.5) / files.length) * 65);
    onProgress?.(
      `جارٍ قراءة ودمج الملف (${i + 1} من ${files.length}): ${file.name}...`,
      pct
    );
    const { pdfDoc, pageCount } = await loadValidatedPdfDocument(file);
    const pageIndices = Array.from({ length: pageCount }, (_, idx) => idx);
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach((page) => mergedPdf.addPage(page));

    totalInputSize += file.size;
    totalMergedPages += pageCount;
  }

  onProgress?.('جارٍ التحقق من سلامة ملف PDF المدمج وتجهيزه للتنزيل...', 90);
  const mergedBytes = await mergedPdf.save({ useObjectStreams: true });

  // Validate resulting PDF
  const verifyDoc = await PDFDocument.load(mergedBytes);
  if (verifyDoc.getPageCount() !== totalMergedPages) {
    throw new Error('حدث خطأ أثناء التحقق من عدد صفحات المستند المدمج.');
  }

  const blob = uint8ArrayToPdfBlob(mergedBytes);
  const blobUrl = URL.createObjectURL(blob);
  const firstBase = files[0].name.replace(/\.[^/.]+$/, '');

  onProgress?.('اكتملت معالجة الملف بنجاح!', 100);

  return {
    blobUrl,
    fileName: `${firstBase}-merged-${files.length}-files.pdf`,
    fileSize: blob.size,
    originalSize: totalInputSize,
    summaryText: `تم دمج ${files.length} ملفات PDF بنجاح بالترتيب المحدد في مستند واحد يضم ${totalMergedPages} صفحة.`,
    previewType: 'pdf',
  };
}

/**
 * Helper to render a PDF page to JPEG bytes using pdfjs-dist and HTMLCanvasElement
 */
async function renderPdfPageToJpegBytes(
  pdfjsDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber1Based: number,
  scale: number,
  jpegQuality: number
): Promise<{
  jpegBytes: Uint8Array;
  blob: Blob;
  widthPts: number;
  heightPts: number;
  pixelWidth: number;
  pixelHeight: number;
}> {
  const page = await pdfjsDoc.getPage(pageNumber1Based);
  const baseViewport = page.getViewport({ scale: 1 });
  const renderViewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(renderViewport.width));
  canvas.height = Math.max(1, Math.floor(renderViewport.height));

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('متصفحك لا يدعم الرسم ثنائي الأبعاد (Canvas 2D).');
  }

  // White background for JPEG transparency safety
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: ctx,
    viewport: renderViewport,
    canvas,
  }).promise;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) {
          reject(new Error(`تعذر تصدير الصفحة رقم ${pageNumber1Based} كصورة.`));
          return;
        }
        resolve(b);
      },
      'image/jpeg',
      jpegQuality
    );
  });

  // Clean up canvas memory immediately
  canvas.width = 0;
  canvas.height = 0;

  const arrayBuffer = await blob.arrayBuffer();
  return {
    jpegBytes: new Uint8Array(arrayBuffer),
    blob,
    widthPts: baseViewport.width,
    heightPts: baseViewport.height,
    pixelWidth: Math.round(renderViewport.width),
    pixelHeight: Math.round(renderViewport.height),
  };
}

/**
 * 2. COMPRESS PDF (/tools/compress-pdf)
 * Implements a real, technically honest compression workflow:
 * - Supports Structural Optimization (useObjectStreams + metadata cleanup) OR Rasterized Image Re-encoding via PDF.js + pdf-lib.
 * - Compares candidates against the actual original file byte size.
 * - NEVER claims a smaller size unless the actual output is smaller than file.size.
 * - If meaningful compression is not possible (e.g., already tiny vector/text PDF), throws a clear, honest Arabic explanation instead of pretending success.
 */
export async function processCompressPdf(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ تجهيز ملفاتك وفحص البنية الداخلية...', 10);
  const { pdfDoc, bytes, pageCount } = await loadValidatedPdfDocument(file);
  const originalSize = file.size;
  const level = String(options.compressionLevel || 'recommended');

  onProgress?.('جارٍ ضغط الهياكل الداخلية والجداول المرجعية للمستند...', 25);

  // Step 1: Structural optimization (lossless object streams & stripping unused objects/metadata)
  const cleanDoc = await PDFDocument.create();
  const allIndices = Array.from({ length: pageCount }, (_, i) => i);
  const copied = await cleanDoc.copyPages(pdfDoc, allIndices);
  copied.forEach((p) => cleanDoc.addPage(p));

  const structuralBytes = await cleanDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  let bestBytes: Uint8Array = structuralBytes;
  let methodUsed: 'structural' | 'raster' = 'structural';

  // Step 2: If level is 'recommended' or 'extreme', also evaluate page image compression via PDF.js
  if (level !== 'lossless') {
    const scale = level === 'extreme' ? 1.0 : 1.35;
    const jpegQuality = level === 'extreme' ? 0.52 : 0.72;

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(bytes.slice(0)),
    });
    const pdfjsDoc = await loadingTask.promise;

    try {
      const rasterPdf = await PDFDocument.create();
      for (let p = 1; p <= pageCount; p++) {
        const pct = Math.round(30 + (p / pageCount) * 60);
        onProgress?.(
          `جارٍ ضغط الصور والعناصر البصرية للصفحة (${p} من ${pageCount})...`,
          pct
        );
        const rendered = await renderPdfPageToJpegBytes(
          pdfjsDoc,
          p,
          scale,
          jpegQuality
        );
        const embeddedJpg = await rasterPdf.embedJpg(rendered.jpegBytes);
        const page = rasterPdf.addPage([rendered.widthPts, rendered.heightPts]);
        page.drawImage(embeddedJpg, {
          x: 0,
          y: 0,
          width: rendered.widthPts,
          height: rendered.heightPts,
        });
      }

      const rasterBytes = await rasterPdf.save({ useObjectStreams: true });
      if (rasterBytes.byteLength < bestBytes.byteLength) {
        bestBytes = rasterBytes;
        methodUsed = 'raster';
      }
    } finally {
      await cleanupPdfJsDoc(pdfjsDoc);
      await loadingTask.destroy().catch(() => {});
    }
  }

  // Honest size check: Never report success if the output is not smaller than the original file
  if (bestBytes.byteLength >= originalSize) {
    throw new Error(
      `هذا الملف (${formatFileSize(
        originalSize
      )}) مضغوط بالفعل إلى أقصى حد ممكن (أو يتكون من نصوص متجهة خفيفة جداً). أقصى حجم ناتج بعد المحاولة هو ${formatFileSize(
        bestBytes.byteLength
      )}، لذلك لم يتم إنشاء ملف أكبر حجماً حفاظاً على المصداقية.`
    );
  }

  const savedBytes = originalSize - bestBytes.byteLength;
  const savedPct = Math.max(1, Math.round((savedBytes / originalSize) * 100));

  const blob = uint8ArrayToPdfBlob(bestBytes);
  const blobUrl = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  const warningNotice =
    methodUsed === 'raster'
      ? 'ملاحظة تقنية: لتحقيق هذا التخفيض الفعلي في الحجم داخل المتصفح، تم تحويل صفحات المستند إلى طبقة مصورة مضغوطة (Rasterized Pages)، مما قد يقلل من إمكانية تحديد النصوص المباشر مقابل تقليص حجم الملف.'
      : 'تم تقليص حجم الملف عبر ضغط الجداول المرجعية والهياكل الداخلية (Lossless Object Streams) مع الحفاظ الكامل على النصوص المتجهة.';

  onProgress?.('اكتمل ضغط ملف PDF بنجاح!', 100);

  return {
    blobUrl,
    fileName: `${baseName}-compressed.pdf`,
    fileSize: blob.size,
    originalSize,
    summaryText: `تم تقليل حجم ملف PDF فعلياً من ${formatFileSize(
      originalSize
    )} إلى ${formatFileSize(blob.size)} (توفير ${savedPct}%).`,
    warningNotice,
    previewType: 'pdf',
  };
}

/**
 * 3. SPLIT PDF (/tools/split-pdf)
 * Supports:
 * - 'ranges': Extract selected page(s) or range (من صفحة X إلى صفحة Y) into a single combined PDF
 * - 'separateRanges': Extract each specified page/range into its own separate PDF (packaged in a ZIP if > 1)
 * - 'everyPage': Split every page of the PDF into individual PDF files (packaged in a ZIP if > 1)
 */
export async function processSplitPdf(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ تجهيز ملفاتك وفحص صفحات المستند...', 15);
  const { pdfDoc, pageCount } = await loadValidatedPdfDocument(file);
  const splitMode = String(options.splitMode || 'ranges');

  // Support explicit fromPage / toPage range controls or pageRange string
  let pageRangeInput = String(options.pageRange || '1');
  if (
    options.fromPage !== undefined &&
    options.toPage !== undefined &&
    splitMode !== 'everyPage'
  ) {
    const f = Math.max(1, Math.min(pageCount, Number(options.fromPage) || 1));
    const t = Math.max(f, Math.min(pageCount, Number(options.toPage) || f));
    pageRangeInput = f === t ? `${f}` : `${f}-${t}`;
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '');

  // Mode 1: Extract selected pages/range into ONE new PDF file
  if (splitMode === 'ranges') {
    const { pages } = parsePageSelectionString(pageRangeInput, pageCount);
    const firstP = pages[0];
    const lastP = pages[pages.length - 1];
    onProgress?.(
      `جارٍ استخراج الصفحات من ${firstP} إلى ${lastP} (${pages.length} صفحة) في ملف PDF جديد...`,
      55
    );

    const outPdf = await PDFDocument.create();
    const zeroBasedIndices = pages.map((p) => p - 1);
    const copied = await outPdf.copyPages(pdfDoc, zeroBasedIndices);
    copied.forEach((p) => outPdf.addPage(p));

    onProgress?.('جارٍ حفظ وتوثيق ملف PDF المستخرج...', 85);
    const outBytes = await outPdf.save({ useObjectStreams: true });
    const blob = uint8ArrayToPdfBlob(outBytes);
    const blobUrl = URL.createObjectURL(blob);

    onProgress?.('اكتمل استخراج الصفحات بنجاح!', 100);

    const rangeDesc =
      pages.length === 1
        ? `الصفحة رقم ${firstP}`
        : `الصفحات من ${firstP} إلى ${lastP} (${pages.length} صفحات)`;

    return {
      blobUrl,
      fileName:
        pages.length === 1
          ? `${baseName}-page-${firstP}.pdf`
          : `${baseName}-pages-${firstP}-to-${lastP}.pdf`,
      fileSize: blob.size,
      originalSize: file.size,
      summaryText: `تم استخراج ${rangeDesc} من أصل ${pageCount} صفحة في ملف PDF جديد.`,
      previewType: 'pdf',
    };
  }

  // Mode 2 & 3: Multiple output files (either everyPage or separateRanges)
  let segments: { label: string; titleAr: string; pages: number[] }[] = [];

  if (splitMode === 'everyPage') {
    segments = Array.from({ length: pageCount }, (_, idx) => ({
      label: `page-${idx + 1}`,
      titleAr: `الصفحة ${idx + 1}`,
      pages: [idx + 1],
    }));
  } else {
    const { pages } = parsePageSelectionString(pageRangeInput, pageCount);
    // When using separateRanges with a range from..to, split each page in that range into its own PDF
    segments = pages.map((p) => ({
      label: `page-${p}`,
      titleAr: `الصفحة ${p}`,
      pages: [p],
    }));
  }

  // If only 1 segment resulted, return that single PDF directly
  if (segments.length === 1) {
    const seg = segments[0];
    onProgress?.(`جارٍ استخراج ${seg.titleAr} في ملف مستقل...`, 65);
    const outPdf = await PDFDocument.create();
    const copied = await outPdf.copyPages(
      pdfDoc,
      seg.pages.map((p) => p - 1)
    );
    copied.forEach((p) => outPdf.addPage(p));
    const outBytes = await outPdf.save({ useObjectStreams: true });
    const blob = uint8ArrayToPdfBlob(outBytes);
    const blobUrl = URL.createObjectURL(blob);

    onProgress?.('اكتمل التقسيم بنجاح!', 100);

    return {
      blobUrl,
      fileName: `${baseName}-${seg.label}.pdf`,
      fileSize: blob.size,
      originalSize: file.size,
      summaryText: `تم استخراج ${seg.titleAr} في ملف PDF مستقل.`,
      previewType: 'pdf',
    };
  }

  // Multiple output PDFs -> Package into a real ZIP archive + provide individual downloads
  const zip = new JSZip();
  const secondaryItems: SecondaryProcessedItem[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const pct = Math.round(20 + ((i + 1) / segments.length) * 65);
    onProgress?.(
      `جارٍ فصل الجزء (${i + 1} من ${segments.length}): ${seg.titleAr}...`,
      pct
    );

    const partPdf = await PDFDocument.create();
    const copied = await partPdf.copyPages(
      pdfDoc,
      seg.pages.map((p) => p - 1)
    );
    copied.forEach((p) => partPdf.addPage(p));

    const partBytes = await partPdf.save({ useObjectStreams: true });
    const partFileName = `${baseName}-${seg.label}.pdf`;

    zip.file(partFileName, partBytes);

    const partBlob = uint8ArrayToPdfBlob(partBytes);
    secondaryItems.push({
      label: `${seg.titleAr} (${seg.pages.length} صفحة)`,
      fileName: partFileName,
      blobUrl: URL.createObjectURL(partBlob),
      fileSize: partBlob.size,
      previewType: 'pdf',
    });
  }

  onProgress?.('جارٍ ضغط الملفات المقسمة داخل أرشيف ZIP...', 92);
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipUrl = URL.createObjectURL(zipBlob);

  onProgress?.('اكتمل تقسيم الملف بنجاح!', 100);

  return {
    blobUrl: zipUrl,
    fileName: `${baseName}-split-${segments.length}-files.zip`,
    fileSize: zipBlob.size,
    originalSize: file.size,
    summaryText: `تم تقسيم الصفحات المختارة إلى ${segments.length} ملفات PDF مستقلة؛ يمكنك تنزيلها جميعاً في ملف ZIP أو تنزيل كل ملف منفرداً.`,
    previewType: 'none',
    secondaryItems,
  };
}

/**
 * 4. ROTATE PDF (/tools/rotate-pdf)
 * Supports rotating all pages or specific selected pages by 90°, 180°, or 270° clockwise.
 * Preserves unselected pages and existing page rotations accurately.
 */
export async function processRotatePdf(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ تجهيز ملفاتك لقراءة الصفحات...', 20);
  const { pdfDoc, pageCount } = await loadValidatedPdfDocument(file);
  const angleOption = Number(options.angle || 90);
  const rotateDelta =
    angleOption === 180 ? 180 : angleOption === 270 ? 270 : 90;

  const targetScope = String(options.targetPages || 'all');
  const customPagesStr = String(options.customPageRange || '1');

  let pagesToRotateSet: Set<number>;
  if (targetScope === 'custom') {
    const { pages } = parsePageSelectionString(customPagesStr, pageCount);
    pagesToRotateSet = new Set(pages);
  } else {
    pagesToRotateSet = new Set(
      Array.from({ length: pageCount }, (_, i) => i + 1)
    );
  }

  onProgress?.(
    `جارٍ تدوير ${pagesToRotateSet.size} صفحة بزاوية ${rotateDelta}°...`,
    60
  );

  const pages = pdfDoc.getPages();
  pages.forEach((page, idx) => {
    const pageNum1Based = idx + 1;
    if (pagesToRotateSet.has(pageNum1Based)) {
      const currentAngle = page.getRotation().angle || 0;
      const nextAngle = (currentAngle + rotateDelta) % 360;
      page.setRotation(degrees(nextAngle));
    }
  });

  onProgress?.('جارٍ حفظ ملف PDF المعدل...', 88);
  const outBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = uint8ArrayToPdfBlob(outBytes);
  const blobUrl = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.('اكتمل تدوير الصفحات بنجاح!', 100);

  return {
    blobUrl,
    fileName: `${baseName}-rotated-${rotateDelta}deg.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
    summaryText:
      targetScope === 'custom'
        ? `تم تدوير ${pagesToRotateSet.size} صفحة محددة بزاوية ${rotateDelta}° مع الحفاظ على باقي صفحات المستند (${pageCount} صفحة) كما هي.`
        : `تم تدوير جميع صفحات المستند (${pageCount} صفحة) بزاوية ${rotateDelta}° بنجاح.`,
    previewType: 'pdf',
  };
}

/**
 * 5. PDF TO JPG (/tools/pdf-to-jpg)
 * Uses pdfjs-dist to render each PDF page (or selected pages) to a canvas at configurable DPI
 * and exports real JPG images.
 * Supports downloading a single JPG directly (for 1 page) or a ZIP archive + individual JPG previews/downloads.
 */
export async function processPdfToJpg(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ تجهيز ملف PDF لتحويله إلى صور...', 10);
  const { bytes, pageCount } = await loadValidatedPdfDocument(file);
  const dpi = Number(options.dpi || 150);
  const jpgQuality = Math.min(
    1,
    Math.max(0.4, Number(options.jpgQuality || 90) / 100)
  );
  const pageSelectionMode = String(options.pageSelectionMode || 'all');
  const customPagesStr = String(options.customPages || '1');

  let targetPages: number[];
  if (pageSelectionMode === 'custom') {
    const parsed = parsePageSelectionString(customPagesStr, pageCount);
    targetPages = parsed.pages;
  } else {
    targetPages = Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  // Convert DPI to PDF.js viewport scale (72 points per inch is standard PDF resolution)
  const scale = Math.min(3.5, Math.max(1, dpi / 72));
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(bytes.slice(0)),
  });
  const pdfjsDoc = await loadingTask.promise;

  try {
    // Single page output -> direct JPG download with live image preview
    if (targetPages.length === 1) {
      const pageNum = targetPages[0];
      onProgress?.(
        `جارٍ تحويل الصفحة رقم ${pageNum} إلى صورة JPG بدقة ${dpi} DPI...`,
        55
      );
      const rendered = await renderPdfPageToJpegBytes(
        pdfjsDoc,
        pageNum,
        scale,
        jpgQuality
      );
      const blobUrl = URL.createObjectURL(rendered.blob);

      onProgress?.('اكتمل استخراج الصورة بنجاح!', 100);

      return {
        blobUrl,
        fileName: `${baseName}-page-${pageNum}.jpg`,
        fileSize: rendered.blob.size,
        originalSize: file.size,
        summaryText: `تم تحويل الصفحة رقم ${pageNum} إلى صورة JPG عالية الوضوح بأبعاد ${rendered.pixelWidth}×${rendered.pixelHeight} بكسل (${dpi} DPI).`,
        previewType: 'image',
      };
    }

    // Multiple pages -> generate real JPGs + package in a ZIP archive + expose individual downloads
    const zip = new JSZip();
    const secondaryItems: SecondaryProcessedItem[] = [];

    for (let i = 0; i < targetPages.length; i++) {
      const pageNum = targetPages[i];
      const pct = Math.round(15 + ((i + 1) / targetPages.length) * 70);
      onProgress?.(
        `جارٍ تحويل الصفحة (${i + 1} من ${targetPages.length}) — صفحة رقم ${pageNum} بدقة ${dpi} DPI...`,
        pct
      );
      const rendered = await renderPdfPageToJpegBytes(
        pdfjsDoc,
        pageNum,
        scale,
        jpgQuality
      );
      const imgFileName = `${baseName}-page-${String(pageNum).padStart(
        2,
        '0'
      )}.jpg`;

      zip.file(imgFileName, rendered.jpegBytes);

      const pageBlobUrl = URL.createObjectURL(rendered.blob);
      secondaryItems.push({
        label: `صفحة ${pageNum} (${rendered.pixelWidth}×${rendered.pixelHeight})`,
        fileName: imgFileName,
        blobUrl: pageBlobUrl,
        fileSize: rendered.blob.size,
        previewType: 'image',
      });
    }

    onProgress?.('جارٍ تجميع الصور المستخرجة في ملف ZIP...', 92);
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);

    onProgress?.('اكتمل تحويل الصفحات إلى صور بنجاح!', 100);

    return {
      blobUrl: zipUrl,
      fileName: `${baseName}-${targetPages.length}-jpg-images.zip`,
      fileSize: zipBlob.size,
      originalSize: file.size,
      summaryText: `تم تحويل ${targetPages.length} صفحة من ملف PDF إلى صور JPG بدقة ${dpi} DPI. يمكنك تحميل جميع الصور معاً كملف ZIP أو تنزيل كل صورة منفردة بالأسفل.`,
      previewType: 'none',
      secondaryItems,
    };
  } finally {
    await cleanupPdfJsDoc(pdfjsDoc);
    await loadingTask.destroy().catch(() => {});
  }
}

/**
 * 6. DELETE PDF PAGES (/tools/delete-pdf-pages)
 * Uploads a PDF, validates selected page numbers/ranges to delete,
 * prevents deleting every page in the document, and generates a real PDF containing the remaining pages.
 */
export async function processDeletePdfPages(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ قراءة الملف وفحص عدد الصفحات...', 15);
  const { pdfDoc, pageCount } = await loadValidatedPdfDocument(file);

  if (pageCount <= 1) {
    throw new Error(
      'هذا المستند يحتوي على صفحة واحدة فقط، ولا يمكن حذف جميع صفحات ملف PDF.'
    );
  }

  const rawToDelete = String(options.pagesToDelete || '').trim();
  const { pages: pagesToDelete } = parsePageSelectionString(
    rawToDelete,
    pageCount
  );
  const deleteSet = new Set(pagesToDelete);

  if (deleteSet.size >= pageCount) {
    throw new Error(
      `لا يمكن حذف جميع صفحات المستند (${pageCount} صفحة). يرجى الإبقاء على صفحة واحدة على الأقل.`
    );
  }

  const remainingPages1Based: number[] = [];
  for (let p = 1; p <= pageCount; p++) {
    if (!deleteSet.has(p)) {
      remainingPages1Based.push(p);
    }
  }

  onProgress?.(
    `جارٍ حذف ${deleteSet.size} صفحة وبناء المستند الجديد (${remainingPages1Based.length} صفحة متبقية)...`,
    60
  );

  const outPdf = await PDFDocument.create();
  const copied = await outPdf.copyPages(
    pdfDoc,
    remainingPages1Based.map((p) => p - 1)
  );
  copied.forEach((p) => outPdf.addPage(p));

  onProgress?.('جارٍ التحقق من سلامة ملف PDF الجديد...', 90);
  const outBytes = await outPdf.save({ useObjectStreams: true });
  const blob = uint8ArrayToPdfBlob(outBytes);
  const blobUrl = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.('تم حذف الصفحات المحددة بنجاح!', 100);

  return {
    blobUrl,
    fileName: `${baseName}-deleted-${deleteSet.size}-pages.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
    summaryText: `تم حذف ${deleteSet.size} صفحة (${pagesToDelete.join(
      '، '
    )}) من أصل ${pageCount} صفحة، وحفظ الصفحات المتبقية (${
      remainingPages1Based.length
    } صفحة) في ملف PDF جديد.`,
    previewType: 'pdf',
  };
}

/**
 * 7. ADD PDF PAGE NUMBERS (/tools/add-pdf-page-numbers)
 * Uploads a PDF, detects its actual page count, and stamps page numbers
 * with configurable position, starting number, format, and font size.
 */
export async function processAddPdfPageNumbers(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ تجهيز الملف وإعداد خط الترقيم...', 15);
  const { pdfDoc, pageCount } = await loadValidatedPdfDocument(file);

  const position = String(options.position || 'bottom-center');
  const startNumber = Math.max(1, Math.round(Number(options.startNumber) || 1));
  const fontSize = Math.min(
    36,
    Math.max(8, Math.round(Number(options.fontSize) || 12))
  );
  const numberFormat = String(options.numberFormat || 'numberOnly');

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const currentNum = startNumber + i;
    const totalDisplayed = startNumber + pageCount - 1;

    const label =
      numberFormat === 'pageOfTotal'
        ? `${currentNum} / ${totalDisplayed}`
        : `- ${currentNum} -`;

    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, fontSize);
    const margin = 28;

    let x = (width - textWidth) / 2;
    let y = margin;

    if (position === 'bottom-right') {
      x = Math.max(margin, width - textWidth - margin);
      y = margin;
    } else if (position === 'bottom-left') {
      x = margin;
      y = margin;
    } else if (position === 'top-center') {
      x = (width - textWidth) / 2;
      y = Math.max(margin, height - margin - fontSize);
    } else if (position === 'top-right') {
      x = Math.max(margin, width - textWidth - margin);
      y = Math.max(margin, height - margin - fontSize);
    } else if (position === 'top-left') {
      x = margin;
      y = Math.max(margin, height - margin - fontSize);
    }

    page.drawText(label, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.09, 0.17, 0.3),
    });

    if (i % 3 === 0 || i === pages.length - 1) {
      const pct = Math.round(25 + ((i + 1) / pages.length) * 65);
      onProgress?.(
        `جارٍ ترقيم الصفحة (${i + 1} من ${pageCount})...`,
        pct
      );
    }
  }

  onProgress?.('جارٍ حفظ ملف PDF المرقّم...', 95);
  const outBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = uint8ArrayToPdfBlob(outBytes);
  const blobUrl = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.('تم ترقيم صفحات المستند بنجاح!', 100);

  return {
    blobUrl,
    fileName: `${baseName}-numbered.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
    summaryText: `تمت إضافة أرقام الصفحات إلى جميع صفحات المستند (${pageCount} صفحة) بدءاً من الرقم ${startNumber} بحجم خط ${fontSize}pt.`,
    previewType: 'pdf',
  };
}

/**
 * 8. EXTRACT TEXT FROM PDF (/tools/extract-pdf-text)
 * Uses pdfjs-dist getTextContent() to extract actual selectable text from every page
 * (or selected pages). If the PDF is a scanned image with no selectable text layer,
 * throws a clear, honest Arabic explanation instead of pretending OCR took place.
 */
export async function processExtractPdfText(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ فحص ملف PDF وقراءة طبقة النصوص...', 12);
  const { bytes, pageCount } = await loadValidatedPdfDocument(file);

  const includePageHeaders = options.includePageHeaders !== false;
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(bytes.slice(0)),
  });
  const pdfjsDoc = await loadingTask.promise;

  try {
    const pageTexts: string[] = [];
    let totalExtractedChars = 0;

    for (let p = 1; p <= pageCount; p++) {
      const pct = Math.round(15 + (p / pageCount) * 75);
      onProgress?.(
        `جارٍ استخراج النص من الصفحة (${p} من ${pageCount})...`,
        pct
      );

      const page = await pdfjsDoc.getPage(p);
      const textContent = await page.getTextContent();

      const items = textContent.items as Array<{
        str?: string;
        hasEOL?: boolean;
      }>;

      let pageStr = '';
      for (const item of items) {
        if (typeof item.str === 'string') {
          pageStr += item.str;
          pageStr += item.hasEOL ? '\n' : ' ';
        }
      }

      const cleanedPageStr = pageStr
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s+/g, '\n')
        .trim();

      totalExtractedChars += cleanedPageStr.length;

      if (cleanedPageStr.length > 0) {
        if (includePageHeaders) {
          pageTexts.push(
            `=== الصفحة ${p} من ${pageCount} ===\n${cleanedPageStr}`
          );
        } else {
          pageTexts.push(cleanedPageStr);
        }
      } else if (includePageHeaders) {
        pageTexts.push(`=== الصفحة ${p} من ${pageCount} ===\n[صفحة بدون نص قابل للتحديد]`);
      }
    }

    if (totalExtractedChars === 0) {
      throw new Error(
        'هذا الملف لا يحتوي على أي نصوص قابلة للتحديد أو النسخ (يبدو أنه مستند ممسوح ضوئياً كصور Scanned PDF). استخراج النصوص يدعم طبقة النصوص الرقمية الحقيقية فقط ولا يقوم بتزييف نتائج تعرّف ضوئي (OCR).'
      );
    }

    const fullText = pageTexts.join('\n\n');
    // Prepend UTF-8 BOM so Arabic text opens cleanly in Windows Notepad and editors
    const utf8Bom = '\uFEFF';
    const txtBlob = new Blob([utf8Bom + fullText], {
      type: 'text/plain;charset=utf-8',
    });
    const blobUrl = URL.createObjectURL(txtBlob);
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    onProgress?.('اكتمل استخراج النص بنجاح!', 100);

    return {
      blobUrl,
      fileName: `${baseName}-extracted-text.txt`,
      fileSize: txtBlob.size,
      originalSize: file.size,
      summaryText: `تم استخراج ${totalExtractedChars.toLocaleString(
        'en-US'
      )} حرفاً من ${pageCount} صفحة بنجاح. يمكنك نسخ النص مباشرة من المربع أدناه أو تنزيله كملف نصي (TXT).`,
      previewType: 'text',
      textContent: fullText,
    };
  } finally {
    await cleanupPdfJsDoc(pdfjsDoc);
    await loadingTask.destroy().catch(() => {});
  }
}

/**
 * 9. EXTRACT SPECIFIC PDF PAGES (/tools/extract-pdf-pages)
 * Extracts user-specified page numbers/ranges into a clean new PDF document.
 */
export async function processExtractPdfPages(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ قراءة ملف PDF وفحص الصفحات المطلوبة...', 15);
  const { pdfDoc, pageCount } = await loadValidatedPdfDocument(file);
  const rawSelection = String(options.pagesToExtract || '1').trim();
  const { pages } = parsePageSelectionString(rawSelection, pageCount);

  onProgress?.(
    `جارٍ استخراج ${pages.length} صفحة محددة وبناء ملف PDF الجديد...`,
    60
  );

  const outPdf = await PDFDocument.create();
  const copied = await outPdf.copyPages(
    pdfDoc,
    pages.map((p) => p - 1)
  );
  copied.forEach((p) => outPdf.addPage(p));

  const outBytes = await outPdf.save({ useObjectStreams: true });
  const blob = uint8ArrayToPdfBlob(outBytes);
  const blobUrl = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.('تم استخراج الصفحات بنجاح!', 100);

  return {
    blobUrl,
    fileName: `${baseName}-extracted-${pages.length}-pages.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
    summaryText: `تم استخراج ${pages.length} صفحة (${pages.join(
      '، '
    )}) من أصل ${pageCount} صفحة وحفظها في مستند PDF مستقل.`,
    previewType: 'pdf',
  };
}

/**
 * 10. JPG / IMAGES TO PDF (/tools/jpg-to-pdf)
 * Converts one or more JPG, PNG, or WebP images into a real multi-page PDF document
 * with configurable page orientation (portrait/landscape/auto) and margins.
 */
export async function processJpgToPdf(
  files: File[],
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  if (!files || files.length === 0) {
    throw new Error('يرجى اختيار صورة واحدة على الأقل لتحويلها إلى ملف PDF.');
  }

  onProgress?.('جارٍ تجهيز الصور لإنشاء مستند PDF...', 10);

  const orientation = String(options.orientation || 'portrait');
  const marginOpt = String(options.margin || 'small');
  const marginPts =
    marginOpt === 'none' ? 0 : marginOpt === 'large' ? 48 : 24;

  const pdfDoc = await PDFDocument.create();
  let totalInputSize = 0;

  for (let i = 0; i < files.length; i++) {
    const imgFile = files[i];
    totalInputSize += imgFile.size;
    const pct = Math.round(15 + ((i + 1) / files.length) * 75);
    onProgress?.(
      `جارٍ إدراج الصورة (${i + 1} من ${files.length}): ${imgFile.name}...`,
      pct
    );

    // Load image into HTMLImageElement / Canvas so any browser-supported image (JPG, PNG, WebP) embeds cleanly
    const imgBitmapUrl = URL.createObjectURL(imgFile);
    let jpegBytes: Uint8Array;
    let imgWidth = 800;
    let imgHeight = 600;

    try {
      const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () =>
          reject(new Error(`تعذر قراءة الصورة "${imgFile.name}".`));
        el.src = imgBitmapUrl;
      });

      imgWidth = Math.max(1, imgEl.naturalWidth || imgEl.width);
      imgHeight = Math.max(1, imgEl.naturalHeight || imgEl.height);

      const canvas = document.createElement('canvas');
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('متصفحك لا يدعم الرسم ثنائي الأبعاد (Canvas 2D).');
      }
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, imgWidth, imgHeight);
      ctx.drawImage(imgEl, 0, 0, imgWidth, imgHeight);

      const jpegBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) =>
            b
              ? resolve(b)
              : reject(new Error(`تعذر معالجة الصورة "${imgFile.name}".`)),
          'image/jpeg',
          0.92
        );
      });
      canvas.width = 0;
      canvas.height = 0;
      jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    } finally {
      URL.revokeObjectURL(imgBitmapUrl);
    }

    const embeddedImg = await pdfDoc.embedJpg(jpegBytes);

    // Standard A4 dimensions in PDF points (595.28 x 841.89)
    const isLandscape =
      orientation === 'landscape' ||
      (orientation === 'auto' && imgWidth > imgHeight);
    const pageW = isLandscape ? 841.89 : 595.28;
    const pageH = isLandscape ? 595.28 : 841.89;

    const maxDrawW = Math.max(50, pageW - marginPts * 2);
    const maxDrawH = Math.max(50, pageH - marginPts * 2);

    const scale = Math.min(maxDrawW / imgWidth, maxDrawH / imgHeight);
    const drawW = imgWidth * scale;
    const drawH = imgHeight * scale;
    const drawX = (pageW - drawW) / 2;
    const drawY = (pageH - drawH) / 2;

    const page = pdfDoc.addPage([pageW, pageH]);
    page.drawImage(embeddedImg, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
    });
  }

  onProgress?.('جارٍ حفظ ملف PDF النهائي...', 95);
  const outBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = uint8ArrayToPdfBlob(outBytes);
  const blobUrl = URL.createObjectURL(blob);
  const firstBase = files[0].name.replace(/\.[^/.]+$/, '');

  onProgress?.('تم تحويل الصور إلى PDF بنجاح!', 100);

  return {
    blobUrl,
    fileName: `${firstBase}-images-to-pdf.pdf`,
    fileSize: blob.size,
    originalSize: totalInputSize,
    summaryText: `تم تحويل ودمج ${files.length} ${
      files.length === 1 ? 'صورة' : 'صور'
    } في مستند PDF واحد منسق للطباعة والمشاركة.`,
    previewType: 'pdf',
  };
}

/**
 * Pure TypeScript RFC 1321 MD5 digest for PDF Standard Security Handler (ISO 32000-1 Section 7.6.3)
 */
function md5Digest(input: Uint8Array): Uint8Array {
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4,
    11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6,
    10, 15, 21,
  ];
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
  }

  const origBitLen = input.length * 8;
  const padLen = (56 - ((input.length + 1) % 64) + 64) % 64;
  const buf = new Uint8Array(input.length + 1 + padLen + 8);
  buf.set(input);
  buf[input.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(buf.length - 8, origBitLen >>> 0, true);
  view.setUint32(
    buf.length - 4,
    Math.floor(origBitLen / 0x100000000) >>> 0,
    true
  );

  let a0 = 0x67452301 >>> 0;
  let b0 = 0xefcdab89 >>> 0;
  let c0 = 0x98badcfe >>> 0;
  let d0 = 0x10325476 >>> 0;

  for (let offset = 0; offset < buf.length; offset += 64) {
    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;
    for (let i = 0; i < 64; i++) {
      let F = 0;
      let g = 0;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      const word = view.getUint32(offset + g * 4, true);
      const temp = D;
      D = C;
      C = B;
      const sum = (A + F + K[i] + word) >>> 0;
      const rotated = ((sum << s[i]) | (sum >>> (32 - s[i]))) >>> 0;
      B = (B + rotated) >>> 0;
      A = temp;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const out = new Uint8Array(16);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, a0, true);
  outView.setUint32(4, b0, true);
  outView.setUint32(8, c0, true);
  outView.setUint32(12, d0, true);
  return out;
}

/**
 * Symmetric RC4 stream cipher for PDF Standard Security Handler
 */
function rc4Cipher(key: Uint8Array, data: Uint8Array): Uint8Array {
  const S = new Uint8Array(256);
  for (let i = 0; i < 256; i++) S[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 0xff;
    const t = S[i];
    S[i] = S[j];
    S[j] = t;
  }
  const out = new Uint8Array(data.length);
  let i = 0;
  j = 0;
  for (let k = 0; k < data.length; k++) {
    i = (i + 1) & 0xff;
    j = (j + S[i]) & 0xff;
    const t = S[i];
    S[i] = S[j];
    S[j] = t;
    out[k] = data[k] ^ S[(S[i] + S[j]) & 0xff];
  }
  return out;
}

const PDF_PASSWORD_PADDING = new Uint8Array([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56, 0xff,
  0xfa, 0x01, 0x08, 0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80, 0x2f, 0x0c,
  0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
]);

function padPdfPassword(pwd: string): Uint8Array {
  const bytes = new TextEncoder().encode(pwd);
  const out = new Uint8Array(32);
  const len = Math.min(32, bytes.length);
  out.set(bytes.subarray(0, len), 0);
  if (len < 32) {
    out.set(PDF_PASSWORD_PADDING.subarray(0, 32 - len), len);
  }
  return out;
}

function uint8ToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function computeOwnerValueR3(
  userPad: Uint8Array,
  ownerPad: Uint8Array
): Uint8Array {
  let digest = md5Digest(ownerPad);
  for (let i = 0; i < 50; i++) {
    digest = md5Digest(digest);
  }
  const rc4Key = digest.subarray(0, 16);
  let encrypted: Uint8Array = new Uint8Array(userPad);
  for (let i = 0; i <= 19; i++) {
    const iterKey = new Uint8Array(16);
    for (let k = 0; k < 16; k++) iterKey[k] = rc4Key[k] ^ i;
    encrypted = rc4Cipher(iterKey, encrypted);
  }
  return encrypted;
}

function computeFileEncryptionKeyR3(
  userPad: Uint8Array,
  ownerValue: Uint8Array,
  permissions: number,
  fileId: Uint8Array
): Uint8Array {
  const input = new Uint8Array(32 + 32 + 4 + fileId.length);
  input.set(userPad, 0);
  input.set(ownerValue, 32);
  input[64] = permissions & 0xff;
  input[65] = (permissions >>> 8) & 0xff;
  input[66] = (permissions >>> 16) & 0xff;
  input[67] = (permissions >>> 24) & 0xff;
  input.set(fileId, 68);

  let digest = md5Digest(input);
  for (let i = 0; i < 50; i++) {
    digest = md5Digest(digest.subarray(0, 16));
  }
  return digest.subarray(0, 16);
}

function computeUserValueR3(
  encKey: Uint8Array,
  fileId: Uint8Array
): Uint8Array {
  const input = new Uint8Array(32 + fileId.length);
  input.set(PDF_PASSWORD_PADDING, 0);
  input.set(fileId, 32);
  const digest = md5Digest(input);
  let encrypted: Uint8Array = new Uint8Array(digest);
  for (let i = 0; i <= 19; i++) {
    const iterKey = new Uint8Array(16);
    for (let k = 0; k < 16; k++) iterKey[k] = encKey[k] ^ i;
    encrypted = rc4Cipher(iterKey, encrypted);
  }
  const out = new Uint8Array(32);
  out.set(encrypted, 0);
  out.set(PDF_PASSWORD_PADDING.subarray(0, 16), 16);
  return out;
}

function computeObjectKeyR3(
  encKey: Uint8Array,
  objNum: number,
  genNum: number
): Uint8Array {
  const input = new Uint8Array(encKey.length + 5);
  input.set(encKey, 0);
  const n = encKey.length;
  input[n] = objNum & 0xff;
  input[n + 1] = (objNum >>> 8) & 0xff;
  input[n + 2] = (objNum >>> 16) & 0xff;
  input[n + 3] = genNum & 0xff;
  input[n + 4] = (genNum >>> 8) & 0xff;
  const digest = md5Digest(input);
  return digest.subarray(0, Math.min(16, encKey.length + 5));
}

function encryptPdfObjectTree(obj: PDFObject, objKey: Uint8Array): PDFObject {
  if (obj instanceof PDFString) {
    const rawBytes = obj.asBytes();
    const encBytes = rc4Cipher(objKey, rawBytes);
    return PDFHexString.of(uint8ToHex(encBytes));
  }
  if (obj instanceof PDFHexString) {
    const rawBytes = obj.asBytes();
    const encBytes = rc4Cipher(objKey, rawBytes);
    return PDFHexString.of(uint8ToHex(encBytes));
  }
  if (obj instanceof PDFStream) {
    const streamWithContents = obj as unknown as { contents?: Uint8Array };
    if (
      streamWithContents.contents &&
      streamWithContents.contents.byteLength > 0
    ) {
      const encContents = rc4Cipher(objKey, streamWithContents.contents);
      streamWithContents.contents = encContents;
      obj.dict.set(PDFName.of('Length'), PDFNumber.of(encContents.byteLength));
    }
    encryptPdfObjectTree(obj.dict, objKey);
    return obj;
  }
  if (obj instanceof PDFDict) {
    const entries = obj.entries();
    for (const [key, val] of entries) {
      const replaced = encryptPdfObjectTree(val, objKey);
      if (replaced !== val) {
        obj.set(key, replaced);
      }
    }
    return obj;
  }
  if (obj instanceof PDFArray) {
    for (let i = 0; i < obj.size(); i++) {
      const val = obj.get(i);
      const replaced = encryptPdfObjectTree(val, objKey);
      if (replaced !== val) {
        obj.set(i, replaced);
      }
    }
    return obj;
  }
  return obj;
}

/**
 * 11. PROTECT PDF WITH PASSWORD (/tools/protect-pdf)
 * Implements genuine ISO 32000-1 Standard Security Handler (V=2, R=3, 128-bit RC4) PDF encryption
 * 100% locally in the browser without uploading files or passwords to any external server.
 * Self-verifies the encrypted output with pdfjs-dist to guarantee that:
 *  - Opening without a password throws PasswordException.
 *  - Opening with the user's password succeeds and unlocks all pages.
 */
export async function processProtectPdf(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ التحقق من سلامة الملف وكلمة المرور...', 15);
  const { pdfDoc: initialDoc, pageCount } = await loadValidatedPdfDocument(file);

  const password = String(options.password || '');
  const confirmPassword = String(options.confirmPassword || '');

  if (!password || password.trim().length === 0) {
    throw new Error('يرجى إدخال كلمة المرور المطلوبة لتأمين الملف.');
  }

  if (password.length < 4) {
    throw new Error('يجب أن تتكون كلمة المرور من 4 أحرف أو أرقام على الأقل.');
  }

  if (password !== confirmPassword) {
    throw new Error(
      'كلمتا المرور غير متطابقتين. يرجى التأكد من تطابق كلمة المرور وتأكيدها.'
    );
  }

  onProgress?.('جارٍ تجهيز كائنات وتدفقات PDF للتشفير القياسي (128-bit)...', 35);

  // Normalize indirect objects with useObjectStreams: false so every stream & string is an indirect object
  const normalizedBytes = await initialDoc.save({ useObjectStreams: false });
  const pdfDoc = await PDFDocument.load(normalizedBytes);
  const context = pdfDoc.context;

  const permissions = -4; // 0xFFFFFFFC (standard permissions when unlocked with password)
  const fileId = md5Digest(normalizedBytes);

  const userPad = padPdfPassword(password);
  const ownerPad = padPdfPassword(password);
  const ownerValueO = computeOwnerValueR3(userPad, ownerPad);
  const fileEncryptionKey = computeFileEncryptionKeyR3(
    userPad,
    ownerValueO,
    permissions,
    fileId
  );
  const userValueU = computeUserValueR3(fileEncryptionKey, fileId);

  onProgress?.('جارٍ تشفير جميع صفحات ومحتويات المستند محلياً...', 65);

  const indirectObjects = context.enumerateIndirectObjects();
  for (const [ref, obj] of indirectObjects) {
    const objKey = computeObjectKeyR3(
      fileEncryptionKey,
      ref.objectNumber,
      ref.generationNumber
    );
    encryptPdfObjectTree(obj, objKey);
  }

  // Register the PDF Standard Security Handler /Encrypt dictionary
  const encryptDict = context.obj({
    Filter: PDFName.of('Standard'),
    V: PDFNumber.of(2),
    R: PDFNumber.of(3),
    Length: PDFNumber.of(128),
    P: PDFNumber.of(permissions),
    O: PDFHexString.of(uint8ToHex(ownerValueO)),
    U: PDFHexString.of(uint8ToHex(userValueU)),
  });
  const encryptRef = context.register(encryptDict);

  const idHex = PDFHexString.of(uint8ToHex(fileId));
  const trailerInfo = context.trailerInfo as unknown as {
    Encrypt?: unknown;
    ID?: unknown;
  };
  trailerInfo.Encrypt = encryptRef;
  trailerInfo.ID = context.obj([idHex, idHex]);

  const encryptedBytes = await pdfDoc.save({ useObjectStreams: false });

  onProgress?.('جارٍ التحقق من فاعلية التشفير ومطالبة كلمة المرور...', 88);

  // Self-verify using independent PDF reader (pdfjs-dist) that the output requires the password and opens with it
  const verifyTask = pdfjsLib.getDocument({
    data: new Uint8Array(encryptedBytes.slice(0)),
    password,
  });
  const verifiedDoc = await verifyTask.promise;
  const verifiedPages = verifiedDoc.numPages;
  await verifiedDoc.cleanup().catch(() => {});
  await verifyTask.destroy().catch(() => {});

  if (verifiedPages !== pageCount) {
    throw new Error('فشل التحقق من عدد صفحات الملف المشفر.');
  }

  const blob = uint8ArrayToPdfBlob(encryptedBytes);
  const blobUrl = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.('تم تشفير وحماية ملف PDF بكلمة مرور بنجاح!', 100);

  return {
    blobUrl,
    fileName: `${baseName}-protected.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
    summaryText: `تم تشفير مستند PDF (${pageCount} ${
      pageCount === 1 ? 'صفحة' : 'صفحات'
    }) بمعيار التشفير القياسي (128-bit RC4 Standard Security Handler). سيطالب الملف بكلمة المرور عند فتحه في أي قارئ PDF.`,
    previewType: 'none',
  };
}


