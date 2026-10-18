import { ProcessedOutput } from '../components/workspace/StatusAndResultViews';
import { inpaintImageData } from './watermarkInpainter';

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('تعذر قراءة ملف الصورة. تأكد من أن الملف غير تالف.'));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('حدث خطأ أثناء تصدير الصورة من المتصفح.'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export async function processImageTool(
  slug: string,
  file: File,
  options: Record<string, string | number | boolean>
): Promise<ProcessedOutput> {
  const img = await loadImageElement(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('متصفحك لا يدعم معالجة الرسوميات ثنائية الأبعاد (Canvas 2D).');
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  let targetMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  let quality = 0.88;
  let summaryText = '';
  let ext = targetMime === 'image/png' ? 'png' : 'jpg';

  if (slug === 'compress-images') {
    const q = Number(options.quality ?? 75) / 100;
    targetMime = String(options.outputFormat || 'image/jpeg');
    ext = targetMime === 'image/webp' ? 'webp' : 'jpg';
    quality = q;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    summaryText = `تم ضغط الصورة بأبعاد ${canvas.width}×${canvas.height} بكسل وبجودة ${Math.round(q * 100)}%.`;
  } else if (slug === 'resize-images') {
    const customW = Number(options.customWidth || 0);
    const scalePercent = Number(options.scalePercent || 50) / 100;

    let newWidth = Math.round(img.naturalWidth * scalePercent);
    let newHeight = Math.round(img.naturalHeight * scalePercent);

    if (customW > 0) {
      const ratio = img.naturalHeight / img.naturalWidth;
      newWidth = customW;
      newHeight = Math.max(1, Math.round(customW * ratio));
    }

    canvas.width = Math.max(1, newWidth);
    canvas.height = Math.max(1, newHeight);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    summaryText = `تم تغيير الأبعاد من ${img.naturalWidth}×${img.naturalHeight} إلى ${canvas.width}×${canvas.height} بكسل.`;
  } else if (slug === 'crop-images') {
    const ratioStr = String(options.aspectRatio || '1:1');
    const [rw, rh] = ratioStr.split(':').map(Number);
    const targetRatio = rw / rh;
    const srcRatio = img.naturalWidth / img.naturalHeight;

    let cropW = img.naturalWidth;
    let cropH = img.naturalHeight;

    if (srcRatio > targetRatio) {
      cropW = Math.round(img.naturalHeight * targetRatio);
    } else {
      cropH = Math.round(img.naturalWidth / targetRatio);
    }

    const startX = Math.round((img.naturalWidth - cropW) / 2);
    const startY = Math.round((img.naturalHeight - cropH) / 2);

    canvas.width = cropW;
    canvas.height = cropH;
    ctx.drawImage(img, startX, startY, cropW, cropH, 0, 0, cropW, cropH);

    summaryText = `تم قص الصورة بنسبة ${ratioStr} وأبعاد نهائية ${cropW}×${cropH} بكسل.`;
  } else if (slug === 'convert-to-jpg') {
    targetMime = 'image/jpeg';
    ext = 'jpg';
    quality = Number(options.jpgQuality ?? 90) / 100;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    summaryText = `تم تحويل الصورة إلى صيغة JPG القياسية بدقة ${Math.round(quality * 100)}%.`;
  } else if (slug === 'enhance-image-quality') {
    const contrast = Number(options.contrast ?? 115);
    const brightness = Number(options.brightness ?? 105);
    const saturation = Number(options.saturation ?? 115);

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.filter = `contrast(${contrast}%) brightness(${brightness}%) saturate(${saturation}%)`;
    ctx.drawImage(img, 0, 0);
    ctx.filter = 'none';

    summaryText = `تم تحسين تباين وسطوع وألوان الصورة بنجاح.`;
  } else if (slug === 'rotate-images') {
    const rot = String(options.rotation || '90');

    if (rot === '90' || rot === '270') {
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
    } else {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    ctx.save();
    if (rot === '90') {
      ctx.translate(canvas.width, 0);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, 0, 0);
    } else if (rot === '180') {
      ctx.translate(canvas.width, canvas.height);
      ctx.rotate(Math.PI);
      ctx.drawImage(img, 0, 0);
    } else if (rot === '270') {
      ctx.translate(0, canvas.height);
      ctx.rotate(-Math.PI / 2);
      ctx.drawImage(img, 0, 0);
    } else if (rot === 'flip-h') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
    }
    ctx.restore();

    summaryText = `تم تدوير الصورة وحفظ الاتجاه الجديد بأبعاد ${canvas.width}×${canvas.height} بكسل.`;
  } else if (slug === 'remove-background') {
    targetMime = 'image/png';
    ext = 'png';
    const tolerance = Number(options.tolerance ?? 38);
    const edgeSmoothing = options.edgeSmoothing !== false;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Sample the 4 corners to detect the dominant background color
    const w = canvas.width;
    const h = canvas.height;
    const sampleCoords = [
      [0, 0],
      [w - 1, 0],
      [0, h - 1],
      [w - 1, h - 1],
    ];
    let bgR = 0;
    let bgG = 0;
    let bgB = 0;
    for (const [sx, sy] of sampleCoords) {
      const idx = (sy * w + sx) * 4;
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
    }
    bgR = Math.round(bgR / sampleCoords.length);
    bgG = Math.round(bgG / sampleCoords.length);
    bgB = Math.round(bgB / sampleCoords.length);

    const maxDist = Math.max(12, tolerance * 1.8);
    const softBand = edgeSmoothing ? 18 : 1;
    let removedPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const dr = data[i] - bgR;
      const dg = data[i + 1] - bgG;
      const db = data[i + 2] - bgB;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      if (dist <= maxDist) {
        data[i + 3] = 0;
        removedPixels++;
      } else if (edgeSmoothing && dist <= maxDist + softBand) {
        const factor = (dist - maxDist) / softBand;
        data[i + 3] = Math.round(data[i + 3] * factor);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const totalPixels = w * h;
    const pctRemoved = Math.round((removedPixels / totalPixels) * 100);

  } else if (slug === 'remove-watermark') {
    const format = String(options.outputFormat || 'image/png');
    targetMime = format === 'image/jpeg' ? 'image/jpeg' : 'image/png';
    ext = targetMime === 'image/jpeg' ? 'jpg' : 'png';
    quality = Number(options.jpegQuality || 92) / 100;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const mask = new Uint8Array(canvas.width * canvas.height);

    if (typeof options.maskJson === 'string') {
      try {
        const parsed = JSON.parse(options.maskJson);
        if (Array.isArray(parsed) && parsed.length === mask.length) {
          mask.set(parsed);
        }
      } catch {
        // ignore
      }
    } else if (
      options.rectX !== undefined &&
      options.rectY !== undefined &&
      options.rectW !== undefined &&
      options.rectH !== undefined
    ) {
      const rx = Math.max(
        0,
        Math.min(canvas.width, Math.round(Number(options.rectX)))
      );
      const ry = Math.max(
        0,
        Math.min(canvas.height, Math.round(Number(options.rectY)))
      );
      const rw = Math.max(
        1,
        Math.min(canvas.width - rx, Math.round(Number(options.rectW)))
      );
      const rh = Math.max(
        1,
        Math.min(canvas.height - ry, Math.round(Number(options.rectH)))
      );
      for (let y = ry; y < ry + rh; y++) {
        for (let x = rx; x < rx + rw; x++) {
          mask[y * canvas.width + x] = 1;
        }
      }
    } else {
      // Default corner region (bottom-right 22% width, 10% height)
      const rw = Math.round(canvas.width * 0.22);
      const rh = Math.round(canvas.height * 0.1);
      const rx = Math.max(0, canvas.width - rw - Math.round(canvas.width * 0.02));
      const ry = Math.max(0, canvas.height - rh - Math.round(canvas.height * 0.02));
      for (let y = ry; y < ry + rh; y++) {
        for (let x = rx; x < rx + rw; x++) {
          mask[y * canvas.width + x] = 1;
        }
      }
    }

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    inpaintImageData(imgData, mask, {
      algorithm: (options.algorithm as 'diffusion' | 'patch' | 'smooth') || 'diffusion',
      dilationRadius: Number(options.dilationRadius ?? 3),
      featherRadius: 2,
    });
    ctx.putImageData(imgData, 0, 0);

    summaryText = `تمت إزالة العلامة المائية واستعادة تفاصيل الخلفية محلياً بأبعاد ${canvas.width}×${canvas.height} بكسل.`;
  } else {
    throw new Error('الأداة غير مدعومة في معالج الصور المحلي.');
  }

  const blob = await canvasToBlob(canvas, targetMime, quality);
  const blobUrl = URL.createObjectURL(blob);

  return {
    blobUrl,
    fileName: `${baseName}-fares-tools.${ext}`,
    fileSize: blob.size,
    originalSize: file.size,
    summaryText,
    warningNotice:
      slug === 'remove-background'
        ? 'ملاحظة تقنية: يعمل محرك المتصفح المحلي عبر تحليل وعزل لون الخلفية الموحد المحيط بالعنصر (Chroma/Corner Keying) دون إرسال صورك لأي خادم خارجي. للحصول على أفضل نتيجة، استخدم صوراً ذات خلفية موحدة أو متباينة.'
        : slug === 'remove-watermark'
        ? 'تنويه تقني: يعتمد محرك المتصفح المحلي على تقنية استعادة الأنسجة والانتشار التوافقي (Harmonic Boundary Diffusion). تعطي الأداة أفضل النتائج على الخلفيات المتناسقة أو المتدرجة أو الطبيعية، بينما قد تترك شوائب طفيفة عند وجود وجوه أو تفاصيل معقدة خلف العلامة.'
        : undefined,
    previewType: 'image',
  };
}

function getAudioContextClass(): typeof AudioContext {
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext
  );
}

/**
 * Real browser-based Audio Trimmer using Web Audio API (AudioContext + WAV encoder)
 */
export async function processAudioTrim(
  file: File,
  options: Record<string, string | number | boolean>
): Promise<ProcessedOutput> {
  const startSec = Math.max(0, Number(options.startSec ?? 0));
  const durationSec = Math.max(1, Number(options.durationSec ?? 15));

  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx = getAudioContextClass();
  const audioCtx = new AudioCtx();

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const totalDuration = audioBuffer.duration;

    if (startSec >= totalDuration) {
      throw new Error(
        `ثانية البداية (${startSec} ثانية) أكبر من إجمالي مدة الملف الصوتي (${totalDuration.toFixed(
          1
        )} ثانية).`
      );
    }

    const actualDuration = Math.min(durationSec, totalDuration - startSec);
    const sampleRate = audioBuffer.sampleRate;
    const startOffset = Math.floor(startSec * sampleRate);
    const frameCount = Math.floor(actualDuration * sampleRate);
    const numChannels = audioBuffer.numberOfChannels;

    const wavBuffer = encodeAudioBufferSliceToWav(
      audioBuffer,
      startOffset,
      frameCount,
      numChannels,
      sampleRate
    );

    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    const blobUrl = URL.createObjectURL(blob);
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return {
      blobUrl,
      fileName: `${baseName}-trimmed-fares.wav`,
      fileSize: blob.size,
      originalSize: file.size,
      summaryText: `تم اقتطاع ${actualDuration.toFixed(
        1
      )} ثانية بدءاً من الثانية ${startSec} بنجاح.`,
      previewType: 'audio',
    };
  } finally {
    await audioCtx.close().catch(() => {});
  }
}

/**
 * VIDEO TO AUDIO (/tools/video-to-mp3)
 * Decodes the audio track from a video file (MP4, WebM, MOV) using Web Audio API
 * and exports a clean, playable WAV audio file.
 */
export async function processVideoToAudio(
  file: File,
  _options: Record<string, string | number | boolean>,
  onProgress?: (msg: string, pct?: number) => void
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ قراءة ملف الفيديو وفصل المسار الصوتي...', 20);
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx = getAudioContextClass();
  const audioCtx = new AudioCtx();

  try {
    let audioBuffer: AudioBuffer;
    try {
      audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch {
      throw new Error(
        `تعذر استخراج مسار صوتي من الفيديو "${file.name}". قد يكون الفيديو صامتاً (بدون مسار صوتي) أو بترميز غير مدعوم في متصفحك.`
      );
    }

    onProgress?.('جارٍ ترميز المسار الصوتي المستخرج بجودة عالية...', 70);
    const wavBuffer = encodeAudioBufferSliceToWav(
      audioBuffer,
      0,
      audioBuffer.length,
      audioBuffer.numberOfChannels,
      audioBuffer.sampleRate
    );

    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    const blobUrl = URL.createObjectURL(blob);
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    onProgress?.('اكتمل استخراج الصوت بنجاح!', 100);

    return {
      blobUrl,
      fileName: `${baseName}-extracted-audio.wav`,
      fileSize: blob.size,
      originalSize: file.size,
      summaryText: `تم استخراج المسار الصوتي الكامل (${audioBuffer.duration.toFixed(
        1
      )} ثانية) من ملف الفيديو بنجاح.`,
      warningNotice:
        'ملاحظة تقنية: يتم تصدير الصوت المستخرج محلياً بصيغة WAV القياسية غير المضغوطة (PCM 16-bit) المتوافقة مع جميع المشغلات دون الحاجة لخادم خارجي.',
      previewType: 'audio',
    };
  } finally {
    await audioCtx.close().catch(() => {});
  }
}

/**
 * ENHANCE AUDIO QUALITY (/tools/enhance-audio)
 * Uses OfflineAudioContext with a Highpass Filter (removes low-frequency rumble/hum),
 * a Lowpass Filter (attenuates high-frequency hiss), presence boost, and Dynamic Compressor + Peak Normalization.
 */
export async function processEnhanceAudio(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: (msg: string, pct?: number) => void
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ فك ترميز الملف الصوتي وتحليل الترددات...', 20);
  const level = String(options.noiseReduction || 'medium');
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx = getAudioContextClass();
  const audioCtx = new AudioCtx();

  try {
    const sourceBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const offlineCtx = new OfflineAudioContext(
      sourceBuffer.numberOfChannels,
      sourceBuffer.length,
      sourceBuffer.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = sourceBuffer;

    // 1. Highpass filter to remove rumble / mic hum
    const highpass = offlineCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value =
      level === 'strong' ? 130 : level === 'light' ? 70 : 95;

    // 2. Lowpass filter to reduce high-frequency hiss
    const lowpass = offlineCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value =
      level === 'strong' ? 7500 : level === 'light' ? 12000 : 9500;

    // 3. Vocal presence peaking filter around 2.8 kHz
    const presence = offlineCtx.createBiquadFilter();
    presence.type = 'peaking';
    presence.frequency.value = 2800;
    presence.Q.value = 1.0;
    presence.gain.value = level === 'strong' ? 4.5 : 3.0;

    // 4. Dynamics Compressor to balance quiet & loud passages
    const compressor = offlineCtx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 20;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.005;
    compressor.release.value = 0.2;

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(presence);
    presence.connect(compressor);
    compressor.connect(offlineCtx.destination);

    source.start(0);
    onProgress?.(
      'جارٍ تطبيق مرشحات تنقية الترددات وموازنة مستوى الصوت...',
      65
    );
    const renderedBuffer = await offlineCtx.startRendering();

    // Normalize peak to 0.95 so audio is clear and strong without clipping
    let maxPeak = 0;
    for (let ch = 0; ch < renderedBuffer.numberOfChannels; ch++) {
      const data = renderedBuffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        const abs = Math.abs(data[i]);
        if (abs > maxPeak) maxPeak = abs;
      }
    }
    if (maxPeak > 0.01 && maxPeak < 0.95) {
      const gain = 0.95 / maxPeak;
      for (let ch = 0; ch < renderedBuffer.numberOfChannels; ch++) {
        const data = renderedBuffer.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
          data[i] *= gain;
        }
      }
    }

    const wavBuffer = encodeAudioBufferSliceToWav(
      renderedBuffer,
      0,
      renderedBuffer.length,
      renderedBuffer.numberOfChannels,
      renderedBuffer.sampleRate
    );

    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    const blobUrl = URL.createObjectURL(blob);
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    onProgress?.('تم تحسين وتنقية الملف الصوتي بنجاح!', 100);

    return {
      blobUrl,
      fileName: `${baseName}-enhanced.wav`,
      fileSize: blob.size,
      originalSize: file.size,
      summaryText: `تم تطبيق مرشحات عزل الضجيج المنخفض والعالي وموازنة شدة الصوت (Normalization) على التسجيل (${renderedBuffer.duration.toFixed(
        1
      )} ثانية).`,
      previewType: 'audio',
    };
  } finally {
    await audioCtx.close().catch(() => {});
  }
}

/**
 * MERGE AUDIO FILES (/tools/merge-audio)
 * Decodes 2 or more audio files and concatenates their PCM samples sequentially into a single WAV file.
 */
export async function processMergeAudio(
  files: File[],
  _options: Record<string, string | number | boolean>,
  onProgress?: (msg: string, pct?: number) => void
): Promise<ProcessedOutput> {
  if (!files || files.length < 2) {
    throw new Error('يرجى اختيار ملفين صوتيين على الأقل لإجراء عملية الدمج.');
  }

  const AudioCtx = getAudioContextClass();
  const audioCtx = new AudioCtx();

  try {
    const buffers: AudioBuffer[] = [];
    let totalFrames = 0;
    let totalDuration = 0;
    let totalInputSize = 0;
    let targetSampleRate = 44100;
    let maxChannels = 1;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      totalInputSize += f.size;
      onProgress?.(
        `جارٍ قراءة وفك ترميز الملف الصوتي (${i + 1} من ${files.length}): ${
          f.name
        }...`,
        Math.round(15 + ((i + 1) / files.length) * 55)
      );
      const ab = await f.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(ab);
      if (i === 0) {
        targetSampleRate = decoded.sampleRate;
      }
      maxChannels = Math.max(maxChannels, decoded.numberOfChannels);
      buffers.push(decoded);
      totalFrames += Math.floor(decoded.duration * targetSampleRate);
      totalDuration += decoded.duration;
    }

    onProgress?.('جارٍ دمج المسارات الصوتية في ملف واحد متواصل...', 80);

    const combinedBuffer = audioCtx.createBuffer(
      maxChannels,
      Math.max(1, totalFrames),
      targetSampleRate
    );

    let frameCursor = 0;
    for (const buf of buffers) {
      const ratio = buf.sampleRate / targetSampleRate;
      const outLen = Math.floor(buf.length / ratio);

      for (let ch = 0; ch < maxChannels; ch++) {
        const srcData = buf.getChannelData(
          Math.min(ch, buf.numberOfChannels - 1)
        );
        const dstData = combinedBuffer.getChannelData(ch);

        for (let i = 0; i < outLen; i++) {
          if (frameCursor + i < dstData.length) {
            const srcIdx = Math.min(srcData.length - 1, Math.floor(i * ratio));
            dstData[frameCursor + i] = srcData[srcIdx];
          }
        }
      }
      frameCursor += outLen;
    }

    const wavBuffer = encodeAudioBufferSliceToWav(
      combinedBuffer,
      0,
      combinedBuffer.length,
      maxChannels,
      targetSampleRate
    );

    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    const blobUrl = URL.createObjectURL(blob);
    const firstBase = files[0].name.replace(/\.[^/.]+$/, '');

    onProgress?.('اكتمل دمج الملفات الصوتية بنجاح!', 100);

    return {
      blobUrl,
      fileName: `${firstBase}-merged-${files.length}-tracks.wav`,
      fileSize: blob.size,
      originalSize: totalInputSize,
      summaryText: `تم دمج ${
        files.length
      } ملفات صوتية بالترتيب المحدد في مسار صوتي واحد مدته الإجمالية ${totalDuration.toFixed(
        1
      )} ثانية.`,
      previewType: 'audio',
    };
  } finally {
    await audioCtx.close().catch(() => {});
  }
}

/**
 * Minimal pure-TypeScript GIF89a animated encoder for Video-to-GIF
 * Uses a 6x6x6 web-safe 216-color cube + LZW compression so it works 100% offline with zero external dependencies.
 */
function encodeFramesToAnimatedGif(
  frames: ImageData[],
  width: number,
  height: number,
  delayCs: number
): Uint8Array {
  const bytes: number[] = [];
  const writeStr = (s: string) => {
    for (let i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i));
  };
  const writeU16 = (v: number) => {
    bytes.push(v & 0xff, (v >> 8) & 0xff);
  };

  // Header GIF89a
  writeStr('GIF89a');
  writeU16(width);
  writeU16(height);
  bytes.push(0xf7); // Global color table flag (1), color res (7), sort (0), size of GCT = 2^(7+1) = 256 colors
  bytes.push(0); // bg color index
  bytes.push(0); // pixel aspect ratio

  // Build 256-entry Global Color Table (6x6x6 = 216 color cube + 40 grays)
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        bytes.push(Math.round((r * 255) / 5));
        bytes.push(Math.round((g * 255) / 5));
        bytes.push(Math.round((b * 255) / 5));
      }
    }
  }
  for (let i = 216; i < 256; i++) {
    bytes.push(0, 0, 0);
  }

  // Netscape 2.0 Application Extension for infinite looping
  bytes.push(0x21, 0xff, 0x0b);
  writeStr('NETSCAPE2.0');
  bytes.push(0x03, 0x01, 0x00, 0x00, 0x00);

  // LZW encoder for 8-bit color indices
  const lzwEncode = (indexStream: Uint8Array): number[] => {
    const minCodeSize = 8;
    const clearCode = 1 << minCodeSize;
    const eoiCode = clearCode + 1;

    const outSubBlocks: number[] = [minCodeSize];
    let bitBuffer = 0;
    let bitCount = 0;
    const byteAccum: number[] = [];

    const emitCode = (code: number, codeSize: number) => {
      bitBuffer |= code << bitCount;
      bitCount += codeSize;
      while (bitCount >= 8) {
        byteAccum.push(bitBuffer & 0xff);
        bitBuffer >>= 8;
        bitCount -= 8;
      }
    };

    let codeSize = minCodeSize + 1;
    let nextCode = eoiCode + 1;
    let dict = new Map<number, number>();

    emitCode(clearCode, codeSize);

    let prefix = indexStream[0];
    for (let i = 1; i < indexStream.length; i++) {
      const k = indexStream[i];
      const key = (prefix << 8) | k;
      const found = dict.get(key);
      if (found !== undefined) {
        prefix = found;
      } else {
        emitCode(prefix, codeSize);
        if (nextCode < 4096) {
          dict.set(key, nextCode++);
          if (nextCode > 1 << codeSize && codeSize < 12) {
            codeSize++;
          }
        } else {
          emitCode(clearCode, codeSize);
          dict = new Map<number, number>();
          codeSize = minCodeSize + 1;
          nextCode = eoiCode + 1;
        }
        prefix = k;
      }
    }

    emitCode(prefix, codeSize);
    emitCode(eoiCode, codeSize);
    if (bitCount > 0) {
      byteAccum.push(bitBuffer & 0xff);
    }

    // Write sub-blocks of max 255 bytes
    for (let i = 0; i < byteAccum.length; i += 255) {
      const chunk = byteAccum.slice(i, i + 255);
      outSubBlocks.push(chunk.length);
      for (let j = 0; j < chunk.length; j++) {
        outSubBlocks.push(chunk[j]);
      }
    }
    outSubBlocks.push(0x00); // Block terminator
    return outSubBlocks;
  };

  for (const frame of frames) {
    // Graphic Control Extension
    bytes.push(0x21, 0xf9, 0x04, 0x00);
    writeU16(delayCs);
    bytes.push(0x00, 0x00);

    // Image Descriptor
    bytes.push(0x2c);
    writeU16(0);
    writeU16(0);
    writeU16(width);
    writeU16(height);
    bytes.push(0x00); // No local color table

    const rgba = frame.data;
    const pixelCount = width * height;
    const indices = new Uint8Array(pixelCount);

    for (let p = 0; p < pixelCount; p++) {
      const r = Math.round((rgba[p * 4] * 5) / 255);
      const g = Math.round((rgba[p * 4 + 1] * 5) / 255);
      const b = Math.round((rgba[p * 4 + 2] * 5) / 255);
      indices[p] = r * 36 + g * 6 + b;
    }

    const encodedBlock = lzwEncode(indices);
    for (let i = 0; i < encodedBlock.length; i++) {
      bytes.push(encodedBlock[i]);
    }
  }

  bytes.push(0x3b); // GIF Trailer
  return new Uint8Array(bytes);
}

/**
 * VIDEO TO GIF (/tools/video-to-gif)
 * Loads a video file into an HTMLVideoElement, steps through frames at the selected FPS,
 * captures them via HTMLCanvasElement, and encodes a real animated GIF89a file.
 */
export async function processVideoToGif(
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: (msg: string, pct?: number) => void
): Promise<ProcessedOutput> {
  onProgress?.('جارٍ تحميل مقطع الفيديو وتحليل الإطارات...', 15);
  const fps = Math.min(20, Math.max(5, Number(options.fps || 10)));
  const maxSeconds = Math.min(8, Math.max(1, Number(options.maxDuration || 5)));

  const videoUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = videoUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () =>
        reject(
          new Error(
            'تعذر قراءة ملف الفيديو في المتصفح. تأكد من أن الفيديو بصيغة مدعومة (MP4 أو WebM).'
          )
        );
    });

    const duration = Math.min(maxSeconds, Math.max(0.5, video.duration || 3));
    const totalFrames = Math.max(2, Math.floor(duration * fps));
    const targetW = 360;
    const ratio = (video.videoHeight || 360) / (video.videoWidth || 640);
    const targetH = Math.max(120, Math.round(targetW * ratio));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d')!;

    const frames: ImageData[] = [];

    for (let i = 0; i < totalFrames; i++) {
      const timeSec = (i / totalFrames) * duration;
      onProgress?.(
        `جارٍ التقاط الإطار (${i + 1} من ${totalFrames}) من الفيديو...`,
        Math.round(20 + ((i + 1) / totalFrames) * 55)
      );

      video.currentTime = timeSec;
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
      });

      ctx.drawImage(video, 0, 0, targetW, targetH);
      frames.push(ctx.getImageData(0, 0, targetW, targetH));
    }

    onProgress?.('جارٍ ترميز الصورة المتحركة بصيغة GIF89a...', 85);
    const delayCs = Math.max(4, Math.round(100 / fps));
    const gifBytes = encodeFramesToAnimatedGif(
      frames,
      targetW,
      targetH,
      delayCs
    );

    const copy = new Uint8Array(gifBytes.byteLength);
    copy.set(gifBytes);
    const blob = new Blob([copy.buffer], { type: 'image/gif' });
    const blobUrl = URL.createObjectURL(blob);
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    onProgress?.('تم تحويل الفيديو إلى صورة متحركة GIF بنجاح!', 100);

    return {
      blobUrl,
      fileName: `${baseName}-animated.gif`,
      fileSize: blob.size,
      originalSize: file.size,
      summaryText: `تم تحويل أول ${duration.toFixed(
        1
      )} ثانية من الفيديو (${totalFrames} إطاراً بمعدل ${fps} FPS) إلى صورة GIF متحركة بأبعاد ${targetW}×${targetH} بكسل.`,
      previewType: 'image',
    };
  } finally {
    URL.revokeObjectURL(videoUrl);
    video.src = '';
  }
}

function parseTimeStringToSeconds(raw: string): number {
  const clean = raw.trim();
  if (/^\d+(\.\d+)?$/.test(clean)) {
    return Math.max(0, Number(clean));
  }
  const parts = clean.split(':').map((p) => Number(p.trim()));
  if (parts.some((n) => Number.isNaN(n) || n < 0)) {
    throw new Error(`صيغة الوقت "${raw}" غير صالحة. استخدم صيغة مثل 00:00:10.`);
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
}

/**
 * Shared Browser MediaRecorder + Canvas Video Processor for:
 * - compress-video
 * - convert-video-format
 * - resize-video
 * - trim-video
 */
export async function processBrowserVideoTool(
  slug: string,
  file: File,
  options: Record<string, string | number | boolean>,
  onProgress?: (msg: string, pct?: number) => void
): Promise<ProcessedOutput> {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error(
      'متصفحك الحالي لا يدعم واجهة MediaRecorder اللازمة لمعالجة الفيديو محلياً.'
    );
  }

  onProgress?.('جارٍ فحص ملف الفيديو وتجهيز محرك المعالجة المحلي...', 12);

  // Determine supported MediaRecorder mimeType honestly
  const requestedFormat = String(options.targetFormat || 'webm');
  let mimeType = 'video/webm;codecs=vp8,opus';
  let outExt = 'webm';

  if (
    requestedFormat === 'mp4' &&
    MediaRecorder.isTypeSupported('video/mp4')
  ) {
    mimeType = 'video/mp4';
    outExt = 'mp4';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
    mimeType = 'video/webm;codecs=vp9,opus';
    outExt = 'webm';
  } else if (MediaRecorder.isTypeSupported('video/webm')) {
    mimeType = 'video/webm';
    outExt = 'webm';
  }

  if (
    slug === 'convert-video-format' &&
    (requestedFormat === 'mp4' || requestedFormat === 'mov') &&
    outExt !== requestedFormat
  ) {
    throw new Error(
      `ملاحظة تقنية صادقة: متصفحك الحالي يدعم التصدير المباشر بصيغة WebM فقط عبر MediaRecorder API ولا يدعم ترميز حاويات ${requestedFormat.toUpperCase()} محلياً بدون خادم خارجي. يمكنك اختيار صيغة WebM لتحويل الفيديو محلياً داخل المتصفح.`
    );
  }

  const videoUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = videoUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () =>
        reject(
          new Error(
            `تعذر فتح ملف الفيديو "${file.name}". تأكد من أن صيغة الفيديو مدعومة في متصفحك.`
          )
        );
    });

    const totalDuration = video.duration || 0;
    if (!totalDuration || !Number.isFinite(totalDuration)) {
      throw new Error('تعذر تحديد مدة ملف الفيديو المرفوع.');
    }

    let startSec = 0;
    let endSec = Math.min(totalDuration, 30);

    if (slug === 'trim-video') {
      startSec = parseTimeStringToSeconds(String(options.startTime || '00:00:00'));
      endSec = parseTimeStringToSeconds(String(options.endTime || '00:00:10'));
      if (startSec >= totalDuration) {
        throw new Error(
          `وقت البداية (${startSec} ثانية) يتجاوز إجمالي مدة الفيديو (${totalDuration.toFixed(
            1
          )} ثانية).`
        );
      }
      endSec = Math.min(totalDuration, endSec);
      if (endSec <= startSec) {
        throw new Error('وقت النهاية يجب أن يكون أكبر من وقت البداية.');
      }
    }

    const srcW = video.videoWidth || 1280;
    const srcH = video.videoHeight || 720;
    let targetW = srcW;
    let targetH = srcH;
    let videoBitsPerSecond = 1_500_000;

    if (slug === 'resize-video') {
      const res = String(options.resolution || '720p');
      const maxH = res === '1080p' ? 1080 : res === '480p' ? 480 : 720;
      const scale = maxH / srcH;
      targetH = maxH;
      targetW = Math.max(160, Math.round((srcW * scale) / 2) * 2);
    } else if (slug === 'compress-video') {
      const preset = String(options.preset || 'balanced');
      const scale = preset === 'small' ? 0.5 : preset === 'balanced' ? 0.75 : 0.9;
      targetW = Math.max(240, Math.round((srcW * scale) / 2) * 2);
      targetH = Math.max(160, Math.round((srcH * scale) / 2) * 2);
      videoBitsPerSecond =
        preset === 'small'
          ? 450_000
          : preset === 'balanced'
          ? 850_000
          : 1_400_000;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d')!;

    const stream = canvas.captureStream(24);
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond,
    });

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) {
        chunks.push(ev.data);
      }
    };

    const recordingDone = new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: mimeType.split(';')[0] }));
      };
      recorder.onerror = () =>
        reject(new Error('حدث خطأ أثناء تسجيل الفيديو المعالج.'));
    });

    video.currentTime = startSec;
    await new Promise<void>((r) => {
      const onSeek = () => {
        video.removeEventListener('seeked', onSeek);
        r();
      };
      video.addEventListener('seeked', onSeek);
    });

    recorder.start(200);
    try {
      await video.play();
    } catch {
      // If play failed, ensure muted is true and try again
      video.muted = true;
      await video.play().catch(() => {});
    }

    const clipDuration = Math.max(0.5, endSec - startSec);

    await new Promise<void>((resolve) => {
      let isDone = false;
      let stalledCount = 0;
      let animFrameId = 0;

      const maxTimeoutMs = Math.max(8000, (clipDuration + 8) * 1000);
      const watchdogTimer = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          cancelAnimationFrame(animFrameId);
          video.pause();
          resolve();
        }
      }, maxTimeoutMs);

      const renderLoop = () => {
        if (isDone) return;

        if (video.ended || video.currentTime >= endSec) {
          isDone = true;
          clearTimeout(watchdogTimer);
          video.pause();
          resolve();
          return;
        }

        if (video.paused) {
          stalledCount++;
          if (stalledCount > 50) {
            isDone = true;
            clearTimeout(watchdogTimer);
            video.pause();
            resolve();
            return;
          }
        } else {
          stalledCount = 0;
        }

        ctx.drawImage(video, 0, 0, targetW, targetH);
        const elapsed = Math.max(0, video.currentTime - startSec);
        const pct = Math.min(
          92,
          Math.round(15 + (elapsed / clipDuration) * 75)
        );
        onProgress?.(
          `جارٍ معالجة إطارات الفيديو (${elapsed.toFixed(
            1
          )} / ${clipDuration.toFixed(1)} ثانية)...`,
          pct
        );
        animFrameId = requestAnimationFrame(renderLoop);
      };
      animFrameId = requestAnimationFrame(renderLoop);
    });

    if (recorder.state !== 'inactive') {
      recorder.stop();
    }

    const outBlob = await recordingDone;

    if (slug === 'compress-video' && outBlob.size >= file.size) {
      throw new Error(
        `هذا الفيديو مضغوط بالفعل بدرجة عالية (${(file.size / 1024).toFixed(
          1
        )} KB). الحجم الناتج بعد إعادة الترميز لم يكن أصغر من الحجم الأصلي، لذلك لم يتم استبدال الملف حفاظاً على المصداقية.`
      );
    }

    const blobUrl = URL.createObjectURL(outBlob);
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    onProgress?.('اكتملت معالجة الفيديو بنجاح!', 100);

    return {
      blobUrl,
      fileName: `${baseName}-${slug}.${outExt}`,
      fileSize: outBlob.size,
      originalSize: file.size,
      summaryText: `تمت معالجة الفيديو بنجاح بأبعاد ${targetW}×${targetH} بكسل ومدة ${clipDuration.toFixed(
        1
      )} ثانية.`,
      previewType: 'none',
    };
  } finally {
    video.pause();
    URL.revokeObjectURL(videoUrl);
    video.src = '';
  }
}

function encodeAudioBufferSliceToWav(
  audioBuffer: AudioBuffer,
  startOffset: number,
  frameCount: number,
  numChannels: number,
  sampleRate: number
): ArrayBuffer {
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = frameCount * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(audioBuffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < frameCount; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sampleIndex = startOffset + i;
      const sample = Math.max(-1, Math.min(1, channels[ch][sampleIndex] || 0));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      );
      offset += 2;
    }
  }

  return buffer;
}

/**
 * MERGE VIDEOS (/tools/merge-videos)
 * Sequentially plays 2 or more video files onto a unified HTMLCanvasElement
 * and records the combined visual stream into a single downloadable video file via MediaRecorder.
 */
export async function processMergeVideos(
  files: File[],
  _options: Record<string, string | number | boolean>,
  onProgress?: (msg: string, pct?: number) => void
): Promise<ProcessedOutput> {
  if (!files || files.length < 2) {
    throw new Error('يرجى اختيار مقطعي فيديو على الأقل لإجراء عملية الدمج.');
  }

  if (typeof MediaRecorder === 'undefined') {
    throw new Error(
      'متصفحك الحالي لا يدعم واجهة MediaRecorder اللازمة لدمج مقاطع الفيديو محلياً.'
    );
  }

  onProgress?.('جارٍ فحص مقاطع الفيديو وتجهيز مساحة الدمج...', 10);

  let mimeType = 'video/webm';
  let outExt = 'webm';
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    mimeType = 'video/webm;codecs=vp9';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
    mimeType = 'video/webm;codecs=vp8';
  } else if (MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
    outExt = 'mp4';
  }

  const targetW = 1280;
  const targetH = 720;
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d')!;

  const stream = canvas.captureStream(24);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 1_500_000,
  });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (ev) => {
    if (ev.data && ev.data.size > 0) {
      chunks.push(ev.data);
    }
  };

  const recordingDone = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType.split(';')[0] }));
    };
    recorder.onerror = () =>
      reject(new Error('حدث خطأ أثناء تسجيل الفيديو المدمج.'));
  });

  recorder.start(200);
  let totalInputSize = 0;
  let totalRecordedSeconds = 0;

  try {
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      totalInputSize += f.size;

      const url = URL.createObjectURL(f);
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.src = url;

      try {
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () =>
            reject(
              new Error(`تعذر قراءة ملف الفيديو رقم ${i + 1}: "${f.name}".`)
            );
        });

        const clipLimit = Math.min(20, Math.max(0.5, video.duration || 5));
        totalRecordedSeconds += clipLimit;

        try {
          await video.play();
        } catch {
          video.muted = true;
          await video.play().catch(() => {});
        }

        await new Promise<void>((resolve) => {
          let isDone = false;
          let stalledCount = 0;
          let animFrameId = 0;

          const maxTimeoutMs = Math.max(8000, (clipLimit + 6) * 1000);
          const watchdogTimer = setTimeout(() => {
            if (!isDone) {
              isDone = true;
              cancelAnimationFrame(animFrameId);
              video.pause();
              resolve();
            }
          }, maxTimeoutMs);

          const loop = () => {
            if (isDone) return;

            if (video.ended || video.currentTime >= clipLimit) {
              isDone = true;
              clearTimeout(watchdogTimer);
              video.pause();
              resolve();
              return;
            }

            if (video.paused) {
              stalledCount++;
              if (stalledCount > 50) {
                isDone = true;
                clearTimeout(watchdogTimer);
                video.pause();
                resolve();
                return;
              }
            } else {
              stalledCount = 0;
            }

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, targetW, targetH);

            const vw = video.videoWidth || targetW;
            const vh = video.videoHeight || targetH;
            const scale = Math.min(targetW / vw, targetH / vh);
            const dw = vw * scale;
            const dh = vh * scale;
            ctx.drawImage(
              video,
              (targetW - dw) / 2,
              (targetH - dh) / 2,
              dw,
              dh
            );

            const clipProgress = video.currentTime / clipLimit;
            const overallPct = Math.min(
              94,
              Math.round(12 + ((i + clipProgress) / files.length) * 80)
            );
            onProgress?.(
              `جارٍ دمج المقطع (${i + 1} من ${files.length}): ${f.name}...`,
              overallPct
            );

            animFrameId = requestAnimationFrame(loop);
          };
          animFrameId = requestAnimationFrame(loop);
        });
      } finally {
        video.pause();
        URL.revokeObjectURL(url);
        video.src = '';
      }
    }

    if (recorder.state !== 'inactive') {
      recorder.stop();
    }

    const mergedBlob = await recordingDone;
    const blobUrl = URL.createObjectURL(mergedBlob);
    const firstBase = files[0].name.replace(/\.[^/.]+$/, '');

    onProgress?.('اكتمل دمج مقاطع الفيديو بنجاح!', 100);

    return {
      blobUrl,
      fileName: `${firstBase}-merged-${files.length}-clips.${outExt}`,
      fileSize: mergedBlob.size,
      originalSize: totalInputSize,
      summaryText: `تم دمج ${
        files.length
      } مقاطع فيديو بالترتيب المحدد في ملف فيديو موحد بدقة HD (${targetW}×${targetH}) ومدة إجمالية ${totalRecordedSeconds.toFixed(
        1
      )} ثانية.`,
      previewType: 'none',
    };
  } catch (err) {
    if (recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        // ignore
      }
    }
    throw err;
  }
}

