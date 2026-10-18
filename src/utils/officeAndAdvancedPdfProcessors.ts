import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';
import { ProcessedOutput } from '../components/workspace/StatusAndResultViews';
import {
  loadValidatedPdfDocument,
  ProgressCallback,
} from './pdfProcessors';

// Configure PDF.js worker reliably even when office tools are loaded first
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  if (typeof pdfWorkerUrl === 'string' && pdfWorkerUrl.length > 0) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  } else {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
}

function uint8ArrayToPdfBlob(bytes: Uint8Array): Blob {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: 'application/pdf' });
}

function renderTextStampToPngBytes(
  text: string,
  options: {
    fontSizePx: number;
    color: string;
    opacity: number;
    rotateDeg?: number;
    addSignatureLine?: boolean;
    subText?: string;
  }
): Promise<{ pngBytes: Uint8Array; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('متصفحك لا يدعم الرسم ثنائي الأبعاد (Canvas 2D).'));
      return;
    }

    const fontSpec = `bold ${options.fontSizePx}px "Tajawal", "Inter", sans-serif`;
    ctx.font = fontSpec;
    const metrics = ctx.measureText(text);
    const textW = Math.max(120, Math.ceil(metrics.width) + 48);
    const textH = Math.ceil(options.fontSizePx * 2.4) + (options.subText ? 36 : 0);

    const rad = ((options.rotateDeg || 0) * Math.PI) / 180;
    const absCos = Math.abs(Math.cos(rad));
    const absSin = Math.abs(Math.sin(rad));

    const canvasW = Math.ceil(textW * absCos + textH * absSin) + 24;
    const canvasH = Math.ceil(textW * absSin + textH * absCos) + 24;

    canvas.width = Math.max(64, canvasW);
    canvas.height = Math.max(48, canvasH);

    ctx.save();
    ctx.globalAlpha = Math.max(0.08, Math.min(1, options.opacity));
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (options.rotateDeg) {
      ctx.rotate(rad);
    }

    ctx.font = fontSpec;
    ctx.fillStyle = options.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, options.subText ? -10 : 0);

    if (options.addSignatureLine) {
      ctx.strokeStyle = options.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-textW * 0.38, options.fontSizePx * 0.45);
      ctx.lineTo(textW * 0.38, options.fontSizePx * 0.45);
      ctx.stroke();
    }

    if (options.subText) {
      ctx.font = `600 ${Math.round(options.fontSizePx * 0.48)}px "Tajawal", "Inter", sans-serif`;
      ctx.fillText(options.subText, 0, options.fontSizePx * 0.85);
    }

    ctx.restore();

    canvas.toBlob((blob) => {
      canvas.width = 0;
      canvas.height = 0;
      if (!blob) {
        reject(new Error('تعذر توليد طبقة النص الرسومية.'));
        return;
      }
      blob
        .arrayBuffer()
        .then((buf) =>
          resolve({
            pngBytes: new Uint8Array(buf),
            width: canvasW,
            height: canvasH,
          })
        )
        .catch(reject);
    }, 'image/png');
  });
}

/**
 * 1. WATERMARK PDF (/tools/watermark-pdf)
 * Stamps Arabic or English text watermark across every page of a PDF
 * using high-DPI transparent PNG rendering so Arabic ligatures & RTL shaping are 100% preserved.
 */
export async function processWatermarkPdf(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ قراءة ملف PDF وتجهيز العلامة المائية...', 15);
  const { pdfDoc, pageCount } = await loadValidatedPdfDocument(file);

  const watermarkText = String(
    options.watermarkText || 'سري للغاية - Fares Tools'
  ).trim();
  if (!watermarkText) {
    throw new Error('يرجى كتابة نص العلامة المائية قبل بدء المعالجة.');
  }

  const opacityPct = Number(options.opacity ?? 35);
  const opacity = Math.max(0.1, Math.min(1, opacityPct / 100));
  const position = String(options.position || 'diagonal');

  const rotateDeg = position === 'diagonal' ? -32 : 0;
  const stamp = await renderTextStampToPngBytes(watermarkText, {
    fontSizePx: 54,
    color: '#172B4D',
    opacity,
    rotateDeg,
  });

  const embeddedPng = await pdfDoc.embedPng(stamp.pngBytes);
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    const maxStampW = width * (position === 'diagonal' ? 0.72 : 0.6);
    const scale = Math.min(1, maxStampW / stamp.width);
    const drawW = stamp.width * scale;
    const drawH = stamp.height * scale;

    let x = (width - drawW) / 2;
    let y = (height - drawH) / 2;

    if (position === 'header') {
      y = Math.max(20, height - drawH - 28);
    } else if (position === 'footer') {
      y = 24;
    }

    page.drawImage(embeddedPng, {
      x,
      y,
      width: drawW,
      height: drawH,
    });

    if (i % 2 === 0 || i === pages.length - 1) {
      const pct = Math.round(25 + ((i + 1) / pages.length) * 65);
      onProgress?.(
        `جارٍ تطبيق العلامة المائية على الصفحة (${i + 1} من ${pageCount})...`,
        pct
      );
    }
  }

  onProgress?.('جارٍ حفظ ملف PDF المحمي بالعلامة المائية...', 95);
  const outBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = uint8ArrayToPdfBlob(outBytes);
  const blobUrl = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.('تمت إضافة العلامة المائية بنجاح!', 100);

  return {
    blobUrl,
    fileName: `${baseName}-watermarked.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
    summaryText: `تم إدراج العلامة المائية «${watermarkText}» بشفافية ${opacityPct}% على جميع صفحات المستند (${pageCount} صفحة).`,
    previewType: 'pdf',
  };
}

/**
 * 2. SIGN PDF (/tools/sign-pdf)
 * Stamps an electronic text signature (Arabic or English) + optional date stamp onto the PDF.
 */
export async function processSignPdf(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ قراءة ملف PDF وتجهيز ختم التوقيع...', 15);
  const { pdfDoc, pageCount } = await loadValidatedPdfDocument(file);

  const signerName = String(options.signerName || '').trim();
  if (!signerName) {
    throw new Error('يرجى إدخال اسم الموقّع أو النص الرسمي للتوقيع.');
  }

  const includeDate = options.includeDate !== false;
  const signPageTarget = String(options.signPageTarget || 'last');
  const signPosition = String(options.signPosition || 'bottom-left');

  const todayStr = includeDate
    ? `التاريخ: ${new Date().toISOString().slice(0, 10)}`
    : undefined;

  const stamp = await renderTextStampToPngBytes(signerName, {
    fontSizePx: 42,
    color: '#0755E9',
    opacity: 0.95,
    addSignatureLine: true,
    subText: todayStr,
  });

  const embeddedSig = await pdfDoc.embedPng(stamp.pngBytes);
  const pages = pdfDoc.getPages();

  const targetIndices =
    signPageTarget === 'all'
      ? pages.map((_, idx) => idx)
      : signPageTarget === 'first'
      ? [0]
      : [pages.length - 1];

  onProgress?.('جارٍ إدراج التوقيع الإلكتروني في الموضع المحدد...', 65);

  for (const pageIdx of targetIndices) {
    const page = pages[pageIdx];
    const { width } = page.getSize();
    const scale = Math.min(0.55, (width * 0.35) / stamp.width);
    const drawW = stamp.width * scale;
    const drawH = stamp.height * scale;

    const margin = 36;
    let x = margin;
    const y = margin;

    if (signPosition === 'bottom-right') {
      x = Math.max(margin, width - drawW - margin);
    } else if (signPosition === 'bottom-center') {
      x = (width - drawW) / 2;
    }

    page.drawImage(embeddedSig, {
      x,
      y,
      width: drawW,
      height: drawH,
    });
  }

  const outBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = uint8ArrayToPdfBlob(outBytes);
  const blobUrl = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.('تم توقيع ملف PDF بنجاح!', 100);

  return {
    blobUrl,
    fileName: `${baseName}-signed.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
    summaryText: `تم إدراج التوقيع الإلكتروني باسم «${signerName}»${
      includeDate ? ' مع تاريخ التوقيع' : ''
    } بنجاح.`,
    previewType: 'pdf',
  };
}

/**
 * 3. PDF TO WORD (/tools/pdf-to-word)
 * Extracts structured paragraphs from each PDF page using pdfjs-dist and builds a real, valid .docx file using `docx`.
 * Honest check: If the PDF is a scanned image with no selectable text, throws a clear Arabic error instead of producing an empty DOCX.
 */
export async function processPdfToWord(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ تحليل صفحات PDF واستخراج الفقرات النصية...', 15);
  const { bytes, pageCount } = await loadValidatedPdfDocument(file);
  const keepLayout = options.keepLayout !== false;

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(bytes.slice(0)),
  });
  const pdfjsDoc = await loadingTask.promise;

  try {
    const docChildren: Paragraph[] = [];
    let totalExtractedChars = 0;

    for (let p = 1; p <= pageCount; p++) {
      const pct = Math.round(15 + (p / pageCount) * 65);
      onProgress?.(
        `جارٍ تحويل نصوص الصفحة (${p} من ${pageCount}) إلى فقرات Word...`,
        pct
      );

      const page = await pdfjsDoc.getPage(p);
      const textContent = await page.getTextContent();
      const items = textContent.items as Array<{
        str?: string;
        hasEOL?: boolean;
      }>;

      let rawPageText = '';
      for (const item of items) {
        if (typeof item.str === 'string') {
          rawPageText += item.str;
          rawPageText += item.hasEOL ? '\n' : ' ';
        }
      }

      const lines = rawPageText
        .split('\n')
        .map((l) => l.replace(/\s+/g, ' ').trim())
        .filter(Boolean);

      if (keepLayout && pageCount > 1) {
        docChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            bidirectional: true,
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `الصفحة ${p} من ${pageCount}`,
                bold: true,
                size: 24,
              }),
            ],
          })
        );
      }

      for (const line of lines) {
        totalExtractedChars += line.length;
        const isRtlLine = /[\u0600-\u06FF]/.test(line);
        docChildren.push(
          new Paragraph({
            bidirectional: isRtlLine,
            alignment: isRtlLine ? AlignmentType.RIGHT : AlignmentType.LEFT,
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: line,
                size: 24,
                rightToLeft: isRtlLine,
              }),
            ],
          })
        );
      }
    }

    if (totalExtractedChars === 0) {
      throw new Error(
        'هذا الملف لا يحتوي على أي نصوص رقمية قابلة للتحويل إلى Word (يبدو أنه مستند ممسوح ضوئياً كصور Scanned PDF). نحن لا ننشئ ملف Word فارغاً حفاظاً على المصداقية.'
      );
    }

    onProgress?.('جارٍ بناء وحزم مستند Word (DOCX)...', 90);

    const wordDoc = new DocxDocument({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    const docxBlob = await Packer.toBlob(wordDoc);
    const blobUrl = URL.createObjectURL(docxBlob);
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    onProgress?.('تم تحويل PDF إلى Word (DOCX) بنجاح!', 100);

    return {
      blobUrl,
      fileName: `${baseName}-converted.docx`,
      fileSize: docxBlob.size,
      originalSize: file.size,
      summaryText: `تم استخراج وتحويل نصوص ${pageCount} صفحة (${totalExtractedChars.toLocaleString(
        'en-US'
      )} حرفاً) إلى مستند Word (DOCX) حقيقي قابل للتحرير.`,
      warningNotice:
        'ملاحظة تقنية: يتم تحويل النصوص والفقرات الرقمية القابلة للتحديد إلى مستند DOCX قابل للتحرير، بينما قد لا تنتقل الرسوميات المعقدة أو الجداول المرسومة كخطوط.',
      previewType: 'none',
    };
  } finally {
    await pdfjsDoc.cleanup().catch(() => {});
    await loadingTask.destroy().catch(() => {});
  }
}

/**
 * 4. PDF TO EXCEL (/tools/pdf-to-excel)
 * Extracts coordinate-positioned text items from each PDF page using pdfjs-dist,
 * groups rows by Y coordinate and columns by X coordinate, and builds a real .xlsx workbook using SheetJS (`xlsx`).
 */
export async function processPdfToExcel(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ تحليل الجداول والبيانات النصية داخل ملف PDF...', 15);
  const { bytes, pageCount } = await loadValidatedPdfDocument(file);
  const mergeSheets = Boolean(options.mergeSheets);

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(bytes.slice(0)),
  });
  const pdfjsDoc = await loadingTask.promise;

  try {
    const workbook = XLSX.utils.book_new();
    const combinedRows: string[][] = [];
    let totalCellsExtracted = 0;

    for (let p = 1; p <= pageCount; p++) {
      const pct = Math.round(15 + (p / pageCount) * 70);
      onProgress?.(
        `جارٍ استخراج الصفوف والأعمدة من الصفحة (${p} من ${pageCount})...`,
        pct
      );

      const page = await pdfjsDoc.getPage(p);
      const textContent = await page.getTextContent();
      const rawItems = textContent.items as Array<{
        str?: string;
        transform?: number[];
      }>;

      // Collect non-empty items with (x, y) coordinates
      const positioned: { text: string; x: number; y: number }[] = [];
      for (const item of rawItems) {
        const txt = (item.str || '').trim();
        if (!txt) continue;
        const x = item.transform ? Number(item.transform[4] || 0) : 0;
        const y = item.transform ? Number(item.transform[5] || 0) : 0;
        positioned.push({ text: txt, x, y });
      }

      // Sort top-to-bottom (descending Y in PDF coords)
      positioned.sort((a, b) => b.y - a.y);

      // Group items with close Y coordinates (within 6 pts) into the same table row
      const pageRows: { y: number; cells: { x: number; text: string }[] }[] =
        [];
      const rowTolerance = 6;

      for (const cell of positioned) {
        const existingRow = pageRows.find(
          (r) => Math.abs(r.y - cell.y) <= rowTolerance
        );
        if (existingRow) {
          existingRow.cells.push({ x: cell.x, text: cell.text });
        } else {
          pageRows.push({ y: cell.y, cells: [{ x: cell.x, text: cell.text }] });
        }
      }

      const matrix: string[][] = pageRows.map((r) => {
        // Sort cells horizontally (left-to-right or right-to-left)
        r.cells.sort((a, b) => a.x - b.x);
        totalCellsExtracted += r.cells.length;
        return r.cells.map((c) => c.text);
      });

      if (mergeSheets) {
        if (matrix.length > 0) {
          if (pageCount > 1) {
            combinedRows.push([`--- الصفحة ${p} ---`]);
          }
          combinedRows.push(...matrix);
        }
      } else {
        const sheetData =
          matrix.length > 0 ? matrix : [['لا توجد بيانات نصية في هذه الصفحة']];
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, ws, `Page_${p}`);
      }
    }

    if (totalCellsExtracted === 0) {
      throw new Error(
        'لم يتم العثور على أي نصوص أو بيانات جدولية قابلة للاستخراج في هذا الملف (قد يكون ملف PDF ممسوحاً ضوئياً كصورة).'
      );
    }

    if (mergeSheets) {
      const ws = XLSX.utils.aoa_to_sheet(combinedRows);
      XLSX.utils.book_append_sheet(workbook, ws, 'All_Pages');
    }

    onProgress?.('جارٍ تصدير ملف جدول البيانات XLSX...', 92);
    const xlsxArrayBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    }) as ArrayBuffer;

    const blob = new Blob([xlsxArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const blobUrl = URL.createObjectURL(blob);
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    onProgress?.('تم تحويل PDF إلى Excel (XLSX) بنجاح!', 100);

    return {
      blobUrl,
      fileName: `${baseName}-extracted.xlsx`,
      fileSize: blob.size,
      originalSize: file.size,
      summaryText: `تم استخراج ${totalCellsExtracted.toLocaleString(
        'en-US'
      )} خلية نصية/رقمية من ${pageCount} صفحة وتنظيمها في ملف Excel (XLSX) حقيقي.`,
      previewType: 'none',
    };
  } finally {
    await pdfjsDoc.cleanup().catch(() => {});
    await loadingTask.destroy().catch(() => {});
  }
}

/**
 * 5. PDF TO POWERPOINT (/tools/pdf-to-powerpoint)
 * Renders each PDF page at high resolution via pdfjs-dist and builds a real .pptx presentation
 * where each PDF page is a crisp slide using `pptxgenjs`.
 */
export async function processPdfToPowerpoint(
  file: File,
  _options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ قراءة صفحات PDF لتجهيز شرائح العرض التقديمي...', 12);
  const { bytes, pageCount } = await loadValidatedPdfDocument(file);

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(bytes.slice(0)),
  });
  const pdfjsDoc = await loadingTask.promise;

  try {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    for (let p = 1; p <= pageCount; p++) {
      const pct = Math.round(15 + (p / pageCount) * 70);
      onProgress?.(
        `جارٍ تحويل الصفحة (${p} من ${pageCount}) إلى شريحة PowerPoint...`,
        pct
      );

      const page = await pdfjsDoc.getPage(p);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('متصفحك لا يدعم الرسم ثنائي الأبعاد (Canvas 2D).');
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      canvas.width = 0;
      canvas.height = 0;

      const slide = pptx.addSlide();
      slide.background = { color: 'F5F9FF' };

      // Fit page image centered inside the 10 x 5.625 inch widescreen slide
      const slideW = 10;
      const slideH = 5.625;
      const pageRatio = viewport.width / viewport.height;
      let imgH = slideH - 0.3;
      let imgW = imgH * pageRatio;
      if (imgW > slideW - 0.4) {
        imgW = slideW - 0.4;
        imgH = imgW / pageRatio;
      }

      slide.addImage({
        data: dataUrl,
        x: (slideW - imgW) / 2,
        y: (slideH - imgH) / 2,
        w: imgW,
        h: imgH,
      });
    }

    onProgress?.('جارٍ حزم ملف العرض التقديمي PPTX...', 92);
    const pptxBlob = (await pptx.write({ outputType: 'blob' })) as Blob;
    const blobUrl = URL.createObjectURL(pptxBlob);
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    onProgress?.('تم تحويل PDF إلى PowerPoint (PPTX) بنجاح!', 100);

    return {
      blobUrl,
      fileName: `${baseName}-slides.pptx`,
      fileSize: pptxBlob.size,
      originalSize: file.size,
      summaryText: `تم تحويل ${pageCount} صفحة من ملف PDF إلى عرض تقديمي PowerPoint (PPTX) يضم ${pageCount} شريحة عالية الدقة.`,
      previewType: 'none',
    };
  } finally {
    await pdfjsDoc.cleanup().catch(() => {});
    await loadingTask.destroy().catch(() => {});
  }
}

/**
 * Helper to render multi-page lines of text (Arabic/English) onto paginated A4 canvases
 * and embed them into a real PDFDocument.
 */
async function renderLinesToPaginatedPdf(
  title: string,
  lines: string[],
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const pageWidthPx = 1190; // 2x A4 width (595pt * 2)
  const pageHeightPx = 1684; // 2x A4 height (842pt * 2)
  const marginPx = 96;
  const maxTextWidthPx = pageWidthPx - marginPx * 2;
  const lineHeightPx = 42;

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) {
    throw new Error('متصفحك لا يدعم الرسم ثنائي الأبعاد (Canvas 2D).');
  }
  measureCtx.font = '500 26px "Tajawal", "Inter", sans-serif';

  // Word-wrap all input lines into wrapped visual lines
  const wrappedLines: string[] = [];
  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      wrappedLines.push('');
      continue;
    }
    const words = trimmed.split(/\s+/);
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (measureCtx.measureText(candidate).width > maxTextWidthPx && current) {
        wrappedLines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) wrappedLines.push(current);
  }

  const linesPerPage = Math.max(
    10,
    Math.floor((pageHeightPx - marginPx * 2 - 80) / lineHeightPx)
  );
  const totalPages = Math.max(
    1,
    Math.ceil(wrappedLines.length / linesPerPage)
  );

  for (let p = 0; p < totalPages; p++) {
    const pct = Math.round(35 + ((p + 1) / totalPages) * 55);
    onProgress?.(`جارٍ تنسيق ورسم الصفحة (${p + 1} من ${totalPages})...`, pct);

    const canvas = document.createElement('canvas');
    canvas.width = pageWidthPx;
    canvas.height = pageHeightPx;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, pageWidthPx, pageHeightPx);

    // Header bar on first page
    let yCursor = marginPx;
    if (p === 0 && title) {
      ctx.font = 'bold 34px "Tajawal", "Inter", sans-serif';
      ctx.fillStyle = '#1769FF';
      ctx.textAlign = 'right';
      ctx.fillText(title, pageWidthPx - marginPx, yCursor + 28);
      yCursor += 64;

      ctx.strokeStyle = '#DCE7F5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(marginPx, yCursor);
      ctx.lineTo(pageWidthPx - marginPx, yCursor);
      ctx.stroke();
      yCursor += 44;
    }

    ctx.font = '500 26px "Tajawal", "Inter", sans-serif';
    ctx.fillStyle = '#172B4D';

    const slice = wrappedLines.slice(
      p * linesPerPage,
      (p + 1) * linesPerPage
    );

    for (const lineText of slice) {
      if (lineText) {
        const isArabic = /[\u0600-\u06FF]/.test(lineText);
        ctx.textAlign = isArabic ? 'right' : 'left';
        const xPos = isArabic ? pageWidthPx - marginPx : marginPx;
        ctx.fillText(lineText, xPos, yCursor);
      }
      yCursor += lineHeightPx;
    }

    // Page footer
    ctx.font = '600 20px "Inter", "Tajawal", sans-serif';
    ctx.fillStyle = '#687A96';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${p + 1} / ${totalPages}`,
      pageWidthPx / 2,
      pageHeightPx - 42
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('فشل تصدير الصفحة.'))),
        'image/jpeg',
        0.9
      );
    });
    canvas.width = 0;
    canvas.height = 0;

    const jpgBytes = new Uint8Array(await blob.arrayBuffer());
    const embedded = await pdfDoc.embedJpg(jpgBytes);
    const pdfPage = pdfDoc.addPage([595.28, 841.89]);
    pdfPage.drawImage(embedded, {
      x: 0,
      y: 0,
      width: 595.28,
      height: 841.89,
    });
  }

  return pdfDoc.save({ useObjectStreams: true });
}

/**
 * 6. WORD TO PDF (/tools/word-to-pdf)
 * Uses `mammoth` to extract the real text/paragraphs from a `.docx` file and renders them into a paginated A4 PDF.
 * Rejects legacy binary `.doc` files with a clear Arabic explanation.
 */
export async function processWordToPdf(
  file: File,
  _options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ قراءة مستند Word وفحص محتواه...', 15);
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'doc') {
    throw new Error(
      'صيغة Word القديمة (.doc الثنائية) غير مدعومة للمعالجة المباشرة داخل المتصفح. يرجى حفظ الملف بصيغة Word الحديثة (.docx) ثم إعادة المحاولة.'
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  let rawText = '';
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXmlFile = zip.file('word/document.xml');
    if (!docXmlFile) {
      throw new Error('Missing word/document.xml');
    }
    const xmlStr = await docXmlFile.async('string');
    const paragraphs = xmlStr.split(/<\/w:p>/i);
    const extractedLines: string[] = [];
    for (const p of paragraphs) {
      const texts = Array.from(p.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi)).map(
        (m) =>
          m[1]
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
      );
      const joined = texts.join('').trim();
      if (joined) extractedLines.push(joined);
    }
    rawText = extractedLines.join('\n').trim();
  } catch {
    throw new Error(
      `تعذر قراءة ملف Word "${file.name}". تأكد من أنه ملف DOCX صالح وغير تالف.`
    );
  }

  if (!rawText) {
    throw new Error('مستند Word المرفوع فارغ ولا يحتوي على نصوص لتحويلها.');
  }

  const lines = rawText.split(/\r?\n/);
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const pdfBytes = await renderLinesToPaginatedPdf(baseName, lines, onProgress);

  const blob = uint8ArrayToPdfBlob(pdfBytes);
  const blobUrl = URL.createObjectURL(blob);

  onProgress?.('تم تحويل مستند Word إلى PDF بنجاح!', 100);

  return {
    blobUrl,
    fileName: `${baseName}.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
    summaryText: `تم استخراج محتوى مستند Word (${rawText.length.toLocaleString(
      'en-US'
    )} حرفاً) وتحويله إلى ملف PDF منسق.`,
    previewType: 'pdf',
  };
}

/**
 * 7. EXCEL TO PDF (/tools/excel-to-pdf)
 * Reads `.xlsx` / `.xls` / `.csv` files using SheetJS (`xlsx`) and renders the spreadsheet tables
 * cleanly onto A4 PDF pages with headers and gridlines.
 */
export async function processExcelToPdf(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ قراءة جدول بيانات Excel...', 15);
  const fitToPage = options.fitToPage !== false;

  const arrayBuffer = await file.arrayBuffer();
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(arrayBuffer, { type: 'array' });
  } catch {
    throw new Error(
      `تعذر قراءة ملف جدول البيانات "${file.name}". تأكد من أنه ملف Excel صالح.`
    );
  }

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('ملف Excel لا يحتوي على أي أوراق عمل.');
  }

  const pdfDoc = await PDFDocument.create();
  let totalRowsRendered = 0;

  for (let sIdx = 0; sIdx < workbook.SheetNames.length; sIdx++) {
    const sheetName = workbook.SheetNames[sIdx];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      defval: '',
    });

    const nonEmptyRows = rows.filter((r) =>
      r.some((cell) => String(cell ?? '').trim().length > 0)
    );
    if (nonEmptyRows.length === 0) continue;

    totalRowsRendered += nonEmptyRows.length;
    const maxCols = Math.min(
      fitToPage ? 10 : 8,
      Math.max(1, ...nonEmptyRows.map((r) => r.length))
    );

    const rowsPerPage = 26;
    const sheetPages = Math.max(
      1,
      Math.ceil(nonEmptyRows.length / rowsPerPage)
    );

    for (let p = 0; p < sheetPages; p++) {
      onProgress?.(
        `جارٍ رسم جدول ورقة "${sheetName}" (صفحة ${p + 1} من ${sheetPages})...`,
        Math.round(25 + ((p + 1) / sheetPages) * 65)
      );

      const canvas = document.createElement('canvas');
      canvas.width = 1684; // Landscape A4 2x
      canvas.height = 1190;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const margin = 64;
      ctx.font = 'bold 28px "Tajawal", "Inter", sans-serif';
      ctx.fillStyle = '#1769FF';
      ctx.textAlign = 'right';
      ctx.fillText(
        `ورقة عمل: ${sheetName} (${p + 1}/${sheetPages})`,
        canvas.width - margin,
        margin + 10
      );

      const tableTop = margin + 40;
      const tableW = canvas.width - margin * 2;
      const colW = tableW / maxCols;
      const rowH = 38;

      const slice = nonEmptyRows.slice(
        p * rowsPerPage,
        (p + 1) * rowsPerPage
      );

      slice.forEach((rowCells, rIdx) => {
        const y = tableTop + rIdx * rowH;
        const isHeader = p === 0 && rIdx === 0;

        ctx.fillStyle = isHeader
          ? '#EAF3FF'
          : rIdx % 2 === 0
          ? '#FFFFFF'
          : '#F5F9FF';
        ctx.fillRect(margin, y, tableW, rowH);

        ctx.strokeStyle = '#DCE7F5';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(margin, y, tableW, rowH);

        ctx.font = isHeader
          ? 'bold 20px "Tajawal", "Inter", sans-serif'
          : '500 18px "Tajawal", "Inter", sans-serif';
        ctx.fillStyle = '#172B4D';

        for (let c = 0; c < maxCols; c++) {
          const cellX = margin + c * colW;
          ctx.beginPath();
          ctx.moveTo(cellX, y);
          ctx.lineTo(cellX, y + rowH);
          ctx.stroke();

          const val = String(rowCells[c] ?? '').trim();
          if (val) {
            const clipped = val.length > 26 ? `${val.slice(0, 24)}…` : val;
            ctx.textAlign = 'center';
            ctx.fillText(clipped, cellX + colW / 2, y + rowH * 0.68);
          }
        }
      });

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('فشل تصدير الجدول.'))),
          'image/jpeg',
          0.9
        );
      });
      canvas.width = 0;
      canvas.height = 0;

      const jpgBytes = new Uint8Array(await blob.arrayBuffer());
      const embedded = await pdfDoc.embedJpg(jpgBytes);
      const pdfPage = pdfDoc.addPage([841.89, 595.28]); // Landscape A4
      pdfPage.drawImage(embedded, {
        x: 0,
        y: 0,
        width: 841.89,
        height: 595.28,
      });
    }
  }

  if (totalRowsRendered === 0) {
    throw new Error('ملف Excel المرفوع فارغ ولا يحتوي على أي صفوف بيانات.');
  }

  const outBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = uint8ArrayToPdfBlob(outBytes);
  const blobUrl = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.('تم تحويل جدول Excel إلى PDF بنجاح!', 100);

  return {
    blobUrl,
    fileName: `${baseName}-table.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
    summaryText: `تم تحويل ${totalRowsRendered.toLocaleString(
      'en-US'
    )} صفاً من بيانات Excel إلى تقرير PDF منسق للطباعة.`,
    previewType: 'pdf',
  };
}

/**
 * 8. POWERPOINT TO PDF (/tools/powerpoint-to-pdf)
 * Unpacks `.pptx` XML slides (`ppt/slides/slide*.xml`) using `JSZip`,
 * extracts all slide text elements (`<a:t>`), and renders each slide into a landscape PDF page.
 */
export async function processPowerpointToPdf(
  file: File,
  _options: Record<string, string | number | boolean>,
  onProgress?: ProgressCallback
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ فتح ملف العرض التقديمي وقراءة الشرائح...', 15);
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'ppt') {
    throw new Error(
      'صيغة PowerPoint القديمة (.ppt الثنائية) غير مدعومة للمعالجة المباشرة داخل المتصفح. يرجى حفظ العرض بصيغة (.pptx) الحديثة.'
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(arrayBuffer);
  } catch {
    throw new Error(
      `تعذر قراءة ملف العرض التقديمي "${file.name}". تأكد من أنه ملف PPTX صالح.`
    );
  }

  const slideFiles = Object.keys(zip.files)
    .filter((k) => /^ppt\/slides\/slide\d+\.xml$/i.test(k))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)\.xml/i)?.[1] || 0);
      const nb = Number(b.match(/slide(\d+)\.xml/i)?.[1] || 0);
      return na - nb;
    });

  if (slideFiles.length === 0) {
    throw new Error('لم يتم العثور على أي شرائح داخل ملف PPTX المرفوع.');
  }

  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < slideFiles.length; i++) {
    const slidePath = slideFiles[i];
    const pct = Math.round(20 + ((i + 1) / slideFiles.length) * 70);
    onProgress?.(
      `جارٍ تحويل الشريحة (${i + 1} من ${slideFiles.length}) إلى صفحة PDF...`,
      pct
    );

    const xmlStr = await zip.files[slidePath].async('string');
    const matches = Array.from(xmlStr.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g));
    const slideTexts = matches
      .map((m) =>
        m[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .trim()
      )
      .filter(Boolean);

    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 900;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top accent bar
    ctx.fillStyle = '#1769FF';
    ctx.fillRect(0, 0, canvas.width, 14);

    ctx.font = 'bold 26px "Tajawal", "Inter", sans-serif';
    ctx.fillStyle = '#687A96';
    ctx.textAlign = 'right';
    ctx.fillText(
      `شريحة ${i + 1} من ${slideFiles.length}`,
      canvas.width - 72,
      68
    );

    let y = 150;
    slideTexts.forEach((line, idx) => {
      if (y > canvas.height - 80) return;
      ctx.font =
        idx === 0
          ? 'bold 42px "Tajawal", "Inter", sans-serif'
          : '500 28px "Tajawal", "Inter", sans-serif';
      ctx.fillStyle = idx === 0 ? '#172B4D' : '#334155';
      const isAr = /[\u0600-\u06FF]/.test(line);
      ctx.textAlign = isAr ? 'right' : 'left';
      const x = isAr ? canvas.width - 80 : 80;
      ctx.fillText(line.slice(0, 95), x, y);
      y += idx === 0 ? 70 : 48;
    });

    if (slideTexts.length === 0) {
      ctx.font = '500 28px "Tajawal", sans-serif';
      ctx.fillStyle = '#687A96';
      ctx.textAlign = 'center';
      ctx.fillText(
        '[شريحة تحتوي على عناصر رسومية فقط بدون نصوص]',
        canvas.width / 2,
        canvas.height / 2
      );
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('فشل تصدير الشريحة.'))),
        'image/jpeg',
        0.9
      );
    });
    canvas.width = 0;
    canvas.height = 0;

    const jpgBytes = new Uint8Array(await blob.arrayBuffer());
    const embedded = await pdfDoc.embedJpg(jpgBytes);
    const page = pdfDoc.addPage([841.89, 473.56]); // 16:9 PDF page
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width: 841.89,
      height: 473.56,
    });
  }

  const outBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = uint8ArrayToPdfBlob(outBytes);
  const blobUrl = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  onProgress?.('تم تحويل العرض التقديمي إلى PDF بنجاح!', 100);

  return {
    blobUrl,
    fileName: `${baseName}-presentation.pdf`,
    fileSize: blob.size,
    originalSize: file.size,
    summaryText: `تم استخراج وتحويل ${slideFiles.length} شريحة من ملف PowerPoint (PPTX) إلى مستند PDF.`,
    warningNotice:
      'ملاحظة تقنية: يتم استخراج وتنسيق النصوص والعناوين الموجودة داخل شرائح PPTX محلياً في المتصفح إلى صفحات PDF.',
    previewType: 'pdf',
  };
}
