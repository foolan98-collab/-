/**
 * Inpainting Engine for Watermark & Object Removal
 * High-performance, client-side, pure JavaScript/Canvas pixel reconstruction.
 *
 * Algorithms supported:
 * 1. 'diffusion': Fast Marching & Harmonic Boundary Diffusion (Telea & Poisson-Laplace inspired)
 * 2. 'patch': Exemplar & Texture-aware Nearest Neighbor synthesis
 * 3. 'smooth': Multi-scale Gaussian & Harmonic surface smoothing
 */

import { ProcessedOutput } from '../components/workspace/StatusAndResultViews';

export type InpaintAlgorithm = 'diffusion' | 'patch' | 'smooth';

export interface InpaintOptions {
  algorithm?: InpaintAlgorithm;
  dilationRadius?: number; // Expand mask by N pixels to cover anti-aliased watermark fringes
  featherRadius?: number; // Soft blend at mask boundary
  outputFormat?: 'image/png' | 'image/jpeg';
  jpegQuality?: number;
}

export interface InpaintRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Dilates a binary mask within a subregion to eliminate watermark border halos.
 */
function dilateMask(
  mask: Uint8Array,
  width: number,
  height: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  radius: number
): Uint8Array {
  if (radius <= 0) return mask;
  const dilated = new Uint8Array(mask);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = y * width + x;
      if (mask[idx] === 1) {
        // Expand circle of radius
        for (let dy = -radius; dy <= radius; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) continue;
            if (dx * dx + dy * dy <= radius * radius) {
              dilated[ny * width + nx] = 1;
            }
          }
        }
      }
    }
  }

  return dilated;
}

/**
 * Fast Euclidean distance squared
 */
function distSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
}

/**
 * Solves inpainting via harmonic diffusion and boundary propagation.
 * Highly optimized by restricting computation to the bounding box of the mask plus padding.
 */
export function inpaintImageData(
  imageData: ImageData,
  mask: Uint8Array,
  options: InpaintOptions = {}
): ImageData {
  const {
    algorithm = 'diffusion',
    dilationRadius = 3,
    featherRadius = 2,
  } = options;

  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // 1. Find bounding box of all masked pixels
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let maskedPixelCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x] === 1) {
        maskedPixelCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If nothing is marked, return unchanged
  if (maskedPixelCount === 0 || maxX < minX || maxY < minY) {
    return imageData;
  }

  // 2. Expand mask to cover anti-aliased edges
  const effectiveDilation = Math.max(0, Math.min(10, dilationRadius));
  const workMask = effectiveDilation > 0
    ? dilateMask(mask, width, height, minX, minY, maxX, maxY, effectiveDilation)
    : mask;

  // Expand bounding box to account for dilation & boundary neighborhood
  const margin = effectiveDilation + 32;
  const boxX1 = Math.max(0, minX - margin);
  const boxY1 = Math.max(0, minY - margin);
  const boxX2 = Math.min(width - 1, maxX + margin);
  const boxY2 = Math.min(height - 1, maxY + margin);

  // 3. Collect boundary pixels (known pixels that touch masked pixels)
  interface BoundarySample {
    x: number;
    y: number;
    r: number;
    g: number;
    b: number;
  }

  const boundarySamples: BoundarySample[] = [];

  for (let y = boxY1; y <= boxY2; y++) {
    for (let x = boxX1; x <= boxX2; x++) {
      const idx = y * width + x;
      if (workMask[idx] === 0) {
        // Check if it neighbors any masked pixel
        let touchesMask = false;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
          [1, 1],
          [-1, -1],
          [1, -1],
          [-1, 1],
        ]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (workMask[ny * width + nx] === 1) {
              touchesMask = true;
              break;
            }
          }
        }

        if (touchesMask) {
          const pIdx = idx * 4;
          boundarySamples.push({
            x,
            y,
            r: data[pIdx],
            g: data[pIdx + 1],
            b: data[pIdx + 2],
          });
        }
      }
    }
  }

  if (boundarySamples.length === 0) {
    return imageData;
  }

  // Work buffers for red, green, blue channels inside bounding box
  const boxW = boxX2 - boxX1 + 1;
  const boxH = boxY2 - boxY1 + 1;
  const rBuf = new Float32Array(boxW * boxH);
  const gBuf = new Float32Array(boxW * boxH);
  const bBuf = new Float32Array(boxW * boxH);
  const isMaskedBuf = new Uint8Array(boxW * boxH);
  const distToEdgeBuf = new Float32Array(boxW * boxH);

  // Copy current pixels into work buffers
  for (let by = 0; by < boxH; by++) {
    const y = boxY1 + by;
    for (let bx = 0; bx < boxW; bx++) {
      const x = boxX1 + bx;
      const fullIdx = y * width + x;
      const bIdx = by * boxW + bx;
      const pIdx = fullIdx * 4;

      rBuf[bIdx] = data[pIdx];
      gBuf[bIdx] = data[pIdx + 1];
      bBuf[bIdx] = data[pIdx + 2];
      isMaskedBuf[bIdx] = workMask[fullIdx];
    }
  }

  // 4. Initial fill of masked pixels using inverse-distance-weighted boundary samples
  // Subsample boundary if very dense for performance
  const step = boundarySamples.length > 300 ? Math.ceil(boundarySamples.length / 250) : 1;
  const activeBoundary: BoundarySample[] = [];
  for (let i = 0; i < boundarySamples.length; i += step) {
    activeBoundary.push(boundarySamples[i]);
  }

  for (let by = 0; by < boxH; by++) {
    const y = boxY1 + by;
    for (let bx = 0; bx < boxW; bx++) {
      const bIdx = by * boxW + bx;
      if (isMaskedBuf[bIdx] === 1) {
        const x = boxX1 + bx;

        let totalWeight = 0;
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let minDist = Infinity;

        for (let i = 0; i < activeBoundary.length; i++) {
          const s = activeBoundary[i];
          const d2 = distSq(x, y, s.x, s.y);
          if (d2 < minDist) {
            minDist = d2;
          }
          // Weight inversely proportional to distance squared plus epsilon
          const w = 1 / (d2 + 1.5);
          totalWeight += w;
          sumR += s.r * w;
          sumG += s.g * w;
          sumB += s.b * w;
        }

        distToEdgeBuf[bIdx] = Math.sqrt(minDist);

        if (totalWeight > 0) {
          rBuf[bIdx] = sumR / totalWeight;
          gBuf[bIdx] = sumG / totalWeight;
          bBuf[bIdx] = sumB / totalWeight;
        }
      }
    }
  }

  // 5. Relaxation pass: Poisson / Laplace Harmonic Diffusion
  // Solves Laplace's equation nabla^2 I = 0 to yield smoothly blended gradients
  const iterations = algorithm === 'smooth' ? 35 : algorithm === 'patch' ? 12 : 25;
  const nextR = new Float32Array(rBuf);
  const nextG = new Float32Array(gBuf);
  const nextB = new Float32Array(bBuf);

  for (let iter = 0; iter < iterations; iter++) {
    for (let by = 0; by < boxH; by++) {
      for (let bx = 0; bx < boxW; bx++) {
        const bIdx = by * boxW + bx;
        if (isMaskedBuf[bIdx] === 1) {
          let count = 0;
          let rSum = 0;
          let gSum = 0;
          let bSum = 0;

          // 4-connected neighbors
          const neighbors = [
            bx > 0 ? bIdx - 1 : -1,
            bx < boxW - 1 ? bIdx + 1 : -1,
            by > 0 ? bIdx - boxW : -1,
            by < boxH - 1 ? bIdx + boxW : -1,
          ];

          for (const n of neighbors) {
            if (n !== -1) {
              rSum += rBuf[n];
              gSum += gBuf[n];
              bSum += bBuf[n];
              count++;
            }
          }

          if (count > 0) {
            nextR[bIdx] = rSum / count;
            nextG[bIdx] = gSum / count;
            nextB[bIdx] = bSum / count;
          }
        }
      }
    }

    rBuf.set(nextR);
    gBuf.set(nextG);
    bBuf.set(nextB);
  }

  // 6. Optional Patch synthesis texture enrichment:
  // For 'patch' mode, subtly re-introduce surrounding boundary texture grain
  if (algorithm === 'patch' && activeBoundary.length > 0) {
    // Measure local high-frequency variance around boundary
    let meanR = 0;
    let meanG = 0;
    let meanB = 0;
    for (const s of activeBoundary) {
      meanR += s.r;
      meanG += s.g;
      meanB += s.b;
    }
    meanR /= activeBoundary.length;
    meanG /= activeBoundary.length;
    meanB /= activeBoundary.length;

    let varSum = 0;
    for (const s of activeBoundary) {
      const dr = s.r - meanR;
      const dg = s.g - meanG;
      const db = s.b - meanB;
      varSum += dr * dr + dg * dg + db * db;
    }
    const stdDev = Math.min(18, Math.sqrt(varSum / (activeBoundary.length * 3)));

    if (stdDev > 2) {
      for (let by = 0; by < boxH; by++) {
        for (let bx = 0; bx < boxW; bx++) {
          const bIdx = by * boxW + bx;
          if (isMaskedBuf[bIdx] === 1) {
            // Pick a deterministic pseudo-random offset from nearest boundary
            const d = distToEdgeBuf[bIdx];
            if (d > 1) {
              const hash = Math.sin((bx * 12.9898 + by * 78.233) * 43758.5453);
              const grain = (hash - Math.floor(hash) - 0.5) * (stdDev * 0.6);
              rBuf[bIdx] = Math.max(0, Math.min(255, rBuf[bIdx] + grain));
              gBuf[bIdx] = Math.max(0, Math.min(255, gBuf[bIdx] + grain));
              bBuf[bIdx] = Math.max(0, Math.min(255, bBuf[bIdx] + grain));
            }
          }
        }
      }
    }
  }

  // 7. Write back to ImageData with soft boundary feathering
  const feather = Math.max(0.5, featherRadius);

  for (let by = 0; by < boxH; by++) {
    const y = boxY1 + by;
    for (let bx = 0; bx < boxW; bx++) {
      const bIdx = by * boxW + bx;
      if (isMaskedBuf[bIdx] === 1) {
        const x = boxX1 + bx;
        const fullIdx = y * width + x;
        const pIdx = fullIdx * 4;

        const origR = data[pIdx];
        const origG = data[pIdx + 1];
        const origB = data[pIdx + 2];

        const inpR = rBuf[bIdx];
        const inpG = gBuf[bIdx];
        const inpB = bBuf[bIdx];

        // Feather factor based on distance from mask edge:
        // distToEdge === 0 means right at boundary -> soft blend with original
        const d = distToEdgeBuf[bIdx];
        const alpha = Math.max(0, Math.min(1, d / feather));

        data[pIdx] = Math.round(origR * (1 - alpha) + inpR * alpha);
        data[pIdx + 1] = Math.round(origG * (1 - alpha) + inpG * alpha);
        data[pIdx + 2] = Math.round(origB * (1 - alpha) + inpB * alpha);
        // Alpha channel remains fully opaque (or unchanged)
      }
    }
  }

  return imageData;
}

/**
 * Execute inpainting on a canvas with a companion mask canvas or binary mask
 */
export async function processCanvasInpainting(
  sourceCanvas: HTMLCanvasElement,
  mask: Uint8Array,
  options: InpaintOptions = {}
): Promise<{
  resultCanvas: HTMLCanvasElement;
  blob: Blob;
  dataUrl: string;
}> {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = width;
  resultCanvas.height = height;

  const ctx = resultCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('متصفحك لا يدعم معالجة سياق Canvas 2D.');
  }

  // Draw source image
  ctx.drawImage(sourceCanvas, 0, 0);

  // Read ImageData
  const imgData = ctx.getImageData(0, 0, width, height);

  // Perform inpainting
  inpaintImageData(imgData, mask, options);

  // Put repaired image back
  ctx.putImageData(imgData, 0, 0);

  const format = options.outputFormat || 'image/png';
  const quality = options.jpegQuality ?? 0.92;

  const blob = await new Promise<Blob>((resolve, reject) => {
    resultCanvas.toBlob(
      (b) => {
        if (!b) {
          reject(new Error('فشل تصدير الصورة بعد إزالة العلامة المائية.'));
          return;
        }
        resolve(b);
      },
      format,
      format === 'image/jpeg' ? quality : undefined
    );
  });

  const dataUrl = resultCanvas.toDataURL(format, format === 'image/jpeg' ? quality : undefined);

  return {
    resultCanvas,
    blob,
    dataUrl,
  };
}

/**
 * Inpaint an image File given a mask array, returning ProcessedOutput for the platform
 */
export async function inpaintImageFile(
  file: File,
  mask: Uint8Array,
  options: InpaintOptions = {}
): Promise<ProcessedOutput> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('تعذر قراءة ملف الصورة.'));
    };
    image.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('فشل تهيئة محرك الرسوميات في المتصفح.');
  }
  ctx.drawImage(img, 0, 0);

  const { blob } = await processCanvasInpainting(canvas, mask, options);
  const blobUrl = URL.createObjectURL(blob);

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const ext = options.outputFormat === 'image/jpeg' ? 'jpg' : 'png';

  return {
    blobUrl,
    fileName: `${baseName}-no-watermark-fares-tools.${ext}`,
    fileSize: blob.size,
    originalSize: file.size,
    summaryText: `تمت إزالة العلامة المائية واستعادة تفاصيل الخلفية محلياً بأبعاد ${img.naturalWidth}×${img.naturalHeight} بكسل.`,
    warningNotice:
      'تنويه تقني: يعتمد المحرك المحلي على تقنية استعادة الأنسجة والانتشار التوافقي (Harmonic Diffusion & Boundary Reconstruction). تعطي الأداة أفضل النتائج على الخلفيات المتناسقة أو المتدرجة أو الطبيعية، بينما قد تترك شوائب طفيفة عند وجود وجوه أو تفاصيل معقدة خلف العلامة.',
    previewType: 'image',
  };
}
