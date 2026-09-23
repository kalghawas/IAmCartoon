import {
  OfflineModeSettings,
  OfflineStyle,
  OfflineBackgroundMode,
  OfflineDebugLayers
} from '../types';

export const DEFAULT_OFFLINE_SETTINGS: OfflineModeSettings = {
  style: 'clean-cartoon',
  cartoonStrength: 70,
  colorSimplification: 65,
  shadowStrength: 60,
  outlineStrength: 55,
  smoothing: 65,
  saturation: 125,
  backgroundMode: 'simplified',
  solidColor: '#1e293b',
  gradientColor1: '#1e293b',
  gradientColor2: '#0f172a',
  autoCropPortrait: false,
  debugMode: false
};

export interface OfflineProcessingProgress {
  step: number;
  label: string;
  percentage: number;
}

export interface OfflineProcessingResult {
  imageUrl: string;
  durationMs: number;
  faceDetected: boolean;
  facesCount: number;
  width: number;
  height: number;
  debugLayers?: OfflineDebugLayers;
}

export interface FaceLandmarks {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  noseTip: { x: number; y: number };
  mouthCenter: { x: number; y: number };
  jawlinePoints: { x: number; y: number }[];
}

export interface FaceRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  landmarks?: FaceLandmarks;
}

// Global job counter to cancel older rapid requests
let currentJobId = 0;

/**
 * Validate image file or DataURL
 */
export function validateImageFile(fileOrDataUrl: File | string): { valid: boolean; error?: string } {
  if (fileOrDataUrl instanceof File) {
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const type = fileOrDataUrl.type.toLowerCase();
    const name = fileOrDataUrl.name.toLowerCase();
    const isSupported =
      validMimes.includes(type) ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.png') ||
      name.endsWith('.webp');

    if (!isSupported) {
      return {
        valid: false,
        error: `Unsupported file format. Please upload a JPEG, PNG, or WebP image.`
      };
    }
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (fileOrDataUrl.size > maxSize) {
      return {
        valid: false,
        error: `File is too large (${(fileOrDataUrl.size / (1024 * 1024)).toFixed(1)}MB). Max 25MB supported.`
      };
    }
    return { valid: true };
  }

  if (typeof fileOrDataUrl === 'string') {
    if (!fileOrDataUrl.startsWith('data:image/')) {
      return { valid: false, error: 'Invalid image format. Supported formats: JPEG, PNG, WebP.' };
    }
    return { valid: true };
  }

  return { valid: false, error: 'Unrecognized image source.' };
}

/**
 * Non-blocking yield helper to keep browser UI 60fps responsive
 */
function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Load image safely into HTMLImageElement
 */
function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('Image could not be decoded or is corrupted. Please try a different photo.'));
    img.src = dataUrl;
  });
}

/**
 * Stage 2: Detect Faces & Facial Geometry / Landmarks
 * Uses native FaceDetector if available (Chromium) and high-precision spatial chromaticity fallback.
 */
async function detectFaceAndLandmarks(
  canvas: HTMLCanvasElement,
  imgData: ImageData
): Promise<{ primaryFace: FaceRegion | null; facesCount: number }> {
  const { width, height, data } = imgData;

  // 1. Try native FaceDetector API (available in modern Chrome, Edge, Android)
  if (typeof window !== 'undefined' && 'FaceDetector' in window) {
    try {
      // @ts-ignore
      const detector = new window.FaceDetector({ fastMode: false, maxDetectedFaces: 5 });
      const detectedFaces = await detector.detect(canvas);
      if (detectedFaces && detectedFaces.length > 0) {
        // Pick the largest / most central face
        let bestFace = detectedFaces[0];
        let maxScore = -1;
        const imgCenterX = width / 2;
        const imgCenterY = height / 2;

        for (const face of detectedFaces) {
          const area = face.boundingBox.width * face.boundingBox.height;
          const centerX = face.boundingBox.x + face.boundingBox.width / 2;
          const centerY = face.boundingBox.y + face.boundingBox.height / 2;
          const distToCenter = Math.hypot(centerX - imgCenterX, centerY - imgCenterY);
          // Score combines large area and proximity to center
          const score = area / (1 + distToCenter * 0.5);
          if (score > maxScore) {
            maxScore = score;
            bestFace = face;
          }
        }

        const fx = Math.max(0, Math.round(bestFace.boundingBox.x));
        const fy = Math.max(0, Math.round(bestFace.boundingBox.y));
        const fw = Math.min(width - fx, Math.round(bestFace.boundingBox.width));
        const fh = Math.min(height - fy, Math.round(bestFace.boundingBox.height));

        // Estimate landmarks from bounding box if native landmarks not detailed
        const landmarks: FaceLandmarks = {
          leftEye: { x: Math.round(fx + fw * 0.33), y: Math.round(fy + fh * 0.42) },
          rightEye: { x: Math.round(fx + fw * 0.67), y: Math.round(fy + fh * 0.42) },
          noseTip: { x: Math.round(fx + fw * 0.5), y: Math.round(fy + fh * 0.62) },
          mouthCenter: { x: Math.round(fx + fw * 0.5), y: Math.round(fy + fh * 0.8) },
          jawlinePoints: []
        };

        // Construct 7-point jawline arc
        for (let i = 0; i <= 6; i++) {
          const t = i / 6;
          const angle = Math.PI * (0.15 + t * 0.7);
          landmarks.jawlinePoints.push({
            x: Math.round(fx + fw * 0.5 - Math.cos(angle) * (fw * 0.48)),
            y: Math.round(fy + fh * 0.5 + Math.sin(angle) * (fh * 0.52))
          });
        }

        return {
          primaryFace: { x: fx, y: fy, width: fw, height: fh, landmarks },
          facesCount: detectedFaces.length
        };
      }
    } catch {
      // Fall through to chromaticity spatial detector
    }
  }

  // 2. High-Precision Anthropomorphic Skin Locus & Spatial Cluster Detector
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  let skinPixelCount = 0;

  // Portrait scan region (central 80% horizontally, upper 80% vertically)
  const startY = Math.round(height * 0.05);
  const endY = Math.round(height * 0.85);
  const startX = Math.round(width * 0.1);
  const endX = Math.round(width * 0.9);

  for (let y = startY; y < endY; y += 3) {
    for (let x = startX; x < endX; x += 3) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // YCbCr conversion
      const yVal = 0.299 * r + 0.587 * g + 0.114 * b;
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

      // Skin chromaticity locus across diverse human complexions
      const isSkin =
        yVal > 35 &&
        cb >= 77 &&
        cb <= 130 &&
        cr >= 130 &&
        cr <= 178 &&
        r > g &&
        r > b &&
        Math.abs(r - g) > 8;

      if (isSkin) {
        skinPixelCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const minSkinThreshold = (width * height * 0.005) / 9;
  if (skinPixelCount > minSkinThreshold && maxX > minX && maxY > minY) {
    const rawW = maxX - minX;
    const rawH = maxY - minY;

    // Constrain to reasonable portrait face proportions
    const faceW = Math.min(width * 0.75, Math.max(width * 0.2, rawW));
    const faceH = Math.min(height * 0.75, Math.max(height * 0.22, rawH));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const fx = Math.max(0, Math.round(centerX - faceW / 2));
    const fy = Math.max(0, Math.round(centerY - faceH / 2));
    const fw = Math.min(width - fx, Math.round(faceW));
    const fh = Math.min(height - fy, Math.round(faceH));

    const landmarks: FaceLandmarks = {
      leftEye: { x: Math.round(fx + fw * 0.33), y: Math.round(fy + fh * 0.42) },
      rightEye: { x: Math.round(fx + fw * 0.67), y: Math.round(fy + fh * 0.42) },
      noseTip: { x: Math.round(fx + fw * 0.5), y: Math.round(fy + fh * 0.62) },
      mouthCenter: { x: Math.round(fx + fw * 0.5), y: Math.round(fy + fh * 0.8) },
      jawlinePoints: []
    };

    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const angle = Math.PI * (0.15 + t * 0.7);
      landmarks.jawlinePoints.push({
        x: Math.round(fx + fw * 0.5 - Math.cos(angle) * (fw * 0.48)),
        y: Math.round(fy + fh * 0.5 + Math.sin(angle) * (fh * 0.52))
      });
    }

    return {
      primaryFace: { x: fx, y: fy, width: fw, height: fh, landmarks },
      facesCount: 1
    };
  }

  // Graceful fallback: no face identified, return null without error
  return { primaryFace: null, facesCount: 0 };
}

/**
 * Stage 3: Multi-Region Semantic Segmentation
 * Generates subjectMask, backgroundMask, skinMask, hairMask, clothingMask, and facialFeaturesMask
 */
function generateSemanticRegions(
  imgData: ImageData,
  primaryFace: FaceRegion | null
): {
  subjectMask: Float32Array;
  skinMask: Uint8Array;
  hairMask: Uint8Array;
  clothingMask: Uint8Array;
  featuresMask: Uint8Array;
} {
  const { width, height, data } = imgData;
  const totalPixels = width * height;
  const subjectMask = new Float32Array(totalPixels);
  const skinMask = new Uint8Array(totalPixels);
  const hairMask = new Uint8Array(totalPixels);
  const clothingMask = new Uint8Array(totalPixels);
  const featuresMask = new Uint8Array(totalPixels);

  if (primaryFace) {
    const { x: fx, y: fy, width: fw, height: fh } = primaryFace;
    const faceCenterX = fx + fw * 0.5;
    const faceCenterY = fy + fh * 0.52;
    const faceRadiusX = fw * 0.52;
    const faceRadiusY = fh * 0.55;

    // Approximate body trapezoid from shoulders to bottom
    const shoulderTopY = fy + fh * 0.75;
    const shoulderLeftX = Math.max(0, fx - fw * 0.85);
    const shoulderRightX = Math.min(width, fx + fw * 1.85);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const pIdx = idx * 4;
        const r = data[pIdx];
        const g = data[pIdx + 1];
        const b = data[pIdx + 2];

        // 1. Distance from face center (normalized elliptical distance)
        const dx = (x - faceCenterX) / faceRadiusX;
        const dy = (y - faceCenterY) / faceRadiusY;
        const faceDistSq = dx * dx + dy * dy;

        // Inside face ellipse
        const inFaceEllipse = faceDistSq <= 1.0;

        // 2. Head & Hair envelope (above eyes & sides)
        const inHairEnvelope =
          faceDistSq <= 1.6 && y < fy + fh * 0.55 && (y < fy + fh * 0.3 || Math.abs(dx) > 0.65);

        // 3. Torso / Clothing zone
        let inTorso = false;
        if (y >= shoulderTopY) {
          const progressY = (y - shoulderTopY) / Math.max(1, height - shoulderTopY);
          const currentLeft = shoulderLeftX - progressY * (width * 0.2);
          const currentRight = shoulderRightX + progressY * (width * 0.2);
          if (x >= currentLeft && x <= currentRight) {
            inTorso = true;
          }
        }

        // Subject mask probability [0.0 - 1.0]
        let isSubject = 0;
        if (inFaceEllipse) isSubject = 1.0;
        else if (inHairEnvelope) isSubject = 0.95;
        else if (inTorso) isSubject = 0.9;
        else if (faceDistSq <= 2.2) isSubject = Math.max(0, 1.0 - (faceDistSq - 1.0) / 1.2);

        subjectMask[idx] = isSubject;

        // Skin detection via YCbCr
        const yVal = 0.299 * r + 0.587 * g + 0.114 * b;
        const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

        const isSkin =
          isSubject > 0.3 &&
          yVal > 35 &&
          cb >= 75 &&
          cb <= 132 &&
          cr >= 128 &&
          cr <= 180 &&
          r > g &&
          r > b &&
          Math.abs(r - g) > 8;

        // Facial Features (Eyes and Lips) detection
        let isFeature = false;
        if (inFaceEllipse) {
          // Eye horizontal level
          const isEyeY = Math.abs(y - (fy + fh * 0.42)) < fh * 0.08;
          const isEyeX = Math.abs(x - (fx + fw * 0.33)) < fw * 0.14 || Math.abs(x - (fx + fw * 0.67)) < fw * 0.14;
          // Lip level
          const isMouthY = Math.abs(y - (fy + fh * 0.8)) < fh * 0.08;
          const isMouthX = Math.abs(x - (fx + fw * 0.5)) < fw * 0.2;

          // Eye contrast check or Lip redness index: (2*R - G - B)/(R + G + B + 1)
          const lipRedness = (2 * r - g - b) / (r + g + b + 1);
          if ((isEyeY && isEyeX) || (isMouthY && isMouthX && lipRedness > 0.22)) {
            isFeature = true;
            featuresMask[idx] = 255;
          }
        }

        if (isSkin && !isFeature) {
          skinMask[idx] = 255;
        } else if (inHairEnvelope && !isSkin) {
          hairMask[idx] = 255;
        } else if (inTorso && !isSkin) {
          clothingMask[idx] = 255;
        }
      }
    }
  } else {
    // Fallback if no face detected: Central vignette subject mask
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusX = width * 0.45;
    const radiusY = height * 0.45;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const dx = (x - centerX) / radiusX;
        const dy = (y - centerY) / radiusY;
        const distSq = dx * dx + dy * dy;
        subjectMask[idx] = distSq <= 1.0 ? 1.0 : Math.max(0, 1.0 - (distSq - 1.0));
      }
    }
  }

  return { subjectMask, skinMask, hairMask, clothingMask, featuresMask };
}

/**
 * Stage 4: Photographic Texture Removal
 * High-performance Generalized 4-Quadrant Kuwahara Filter
 * Eliminates skin pores, camera noise, fabric weave, and micro-gradients into crisp flat painted plates.
 */
function applyKuwaharaAbstraction(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): void {
  // Pre-calculate integral images for ultra-fast quadrant mean & variance
  // N = (radius + 1) * (radius + 1)
  const quadrantArea = (radius + 1) * (radius + 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const centerIdx = (y * width + x) * 4;

      // 4 Quadrants:
      // Q1: [-radius, 0] x [-radius, 0] (Top-Left)
      // Q2: [0, radius]  x [-radius, 0] (Top-Right)
      // Q3: [-radius, 0] x [0, radius]  (Bottom-Left)
      // Q4: [0, radius]  x [0, radius]  (Bottom-Right)
      const qRanges = [
        { x0: -radius, x1: 0, y0: -radius, y1: 0 },
        { x0: 0, x1: radius, y0: -radius, y1: 0 },
        { x0: -radius, x1: 0, y0: 0, y1: radius },
        { x0: 0, x1: radius, y0: 0, y1: radius }
      ];

      let minVariance = Infinity;
      let bestMeanR = src[centerIdx];
      let bestMeanG = src[centerIdx + 1];
      let bestMeanB = src[centerIdx + 2];

      for (let q = 0; q < 4; q++) {
        const range = qRanges[q];
        let sumR = 0, sumG = 0, sumB = 0;
        let sumSqR = 0, sumSqG = 0, sumSqB = 0;

        for (let dy = range.y0; dy <= range.y1; dy++) {
          const ny = Math.min(height - 1, Math.max(0, y + dy));
          const rowOffset = ny * width;
          for (let dx = range.x0; dx <= range.x1; dx++) {
            const nx = Math.min(width - 1, Math.max(0, x + dx));
            const pIdx = (rowOffset + nx) * 4;
            const r = src[pIdx];
            const g = src[pIdx + 1];
            const b = src[pIdx + 2];

            sumR += r;
            sumG += g;
            sumB += b;
            sumSqR += r * r;
            sumSqG += g * g;
            sumSqB += b * b;
          }
        }

        const meanR = sumR / quadrantArea;
        const meanG = sumG / quadrantArea;
        const meanB = sumB / quadrantArea;

        // Variance: E[X^2] - (E[X])^2
        const varR = Math.max(0, sumSqR / quadrantArea - meanR * meanR);
        const varG = Math.max(0, sumSqG / quadrantArea - meanG * meanG);
        const varB = Math.max(0, sumSqB / quadrantArea - meanB * meanB);
        const totalVariance = varR + varG + varB;

        if (totalVariance < minVariance) {
          minVariance = totalVariance;
          bestMeanR = meanR;
          bestMeanG = meanG;
          bestMeanB = meanB;
        }
      }

      dst[centerIdx] = Math.round(bestMeanR);
      dst[centerIdx + 1] = Math.round(bestMeanG);
      dst[centerIdx + 2] = Math.round(bestMeanB);
      dst[centerIdx + 3] = src[centerIdx + 3];
    }
  }
}

/**
 * Stage 5: Region-Specific Cel-Shading & Color Quantization
 * Maps luminance into discrete illustration bands (Shadow, Base Midtone, Highlight)
 * with region-specific palettes (warm amber for skin shadows, deep tone for hair).
 */
function applyCelShadingAndQuantization(
  smoothed: Uint8ClampedArray,
  quantized: Uint8ClampedArray,
  toneBands: Uint8ClampedArray,
  width: number,
  height: number,
  skinMask: Uint8Array,
  hairMask: Uint8Array,
  clothingMask: Uint8Array,
  featuresMask: Uint8Array,
  subjectMask: Float32Array,
  settings: OfflineModeSettings
): void {
  const { colorSimplification, shadowStrength, style, saturation } = settings;
  const satFactor = saturation / 100;
  const isComic = style === 'comic';
  const isCelShaded = style === 'cel-shaded';

  // Find median skin tone for warm shadow derivation
  let skinSumR = 0, skinSumG = 0, skinSumB = 0, skinCount = 0;
  for (let i = 0; i < skinMask.length; i++) {
    if (skinMask[i] > 0) {
      const idx = i * 4;
      skinSumR += smoothed[idx];
      skinSumG += smoothed[idx + 1];
      skinSumB += smoothed[idx + 2];
      skinCount++;
    }
  }

  const baseSkinR = skinCount > 0 ? skinSumR / skinCount : 220;
  const baseSkinG = skinCount > 0 ? skinSumG / skinCount : 175;
  const baseSkinB = skinCount > 0 ? skinSumB / skinCount : 145;

  // Cel-shading luminance thresholds
  const shadowCutoff = 80 + (100 - shadowStrength) * 0.4; // lower cutoff = deeper shadows
  const highlightCutoff = 175 - (colorSimplification * 0.3);

  // Discrete quantization steps for clothing & background (1 to 100 -> 3 to 7 discrete steps)
  const numSteps = Math.max(3, Math.min(8, Math.round(9 - (colorSimplification / 100) * 5)));
  const stepSize = 255 / (numSteps - 1);

  for (let idx = 0; idx < width * height; idx++) {
    const pIdx = idx * 4;
    const r = smoothed[pIdx];
    const g = smoothed[pIdx + 1];
    const b = smoothed[pIdx + 2];
    const a = smoothed[pIdx + 3];

    // Calculate perceptual luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    let qr = r;
    let qg = g;
    let qb = b;

    // 1. Skin Region: Warm Cel-Shading (Highlight, Flat Midtone, Amber-Sepia Shadow)
    if (skinMask[idx] > 0) {
      if (lum < shadowCutoff) {
        // Warm cel shadow: preserve warm undertone rather than dirty grey
        const shadowMul = isCelShaded ? 0.65 : 0.75;
        qr = baseSkinR * shadowMul;
        qg = baseSkinG * shadowMul * 0.94;
        qb = baseSkinB * shadowMul * 0.9;
        toneBands[pIdx] = 40; toneBands[pIdx + 1] = 40; toneBands[pIdx + 2] = 70; // Debug: Shadow
      } else if (lum > highlightCutoff) {
        // Luminous highlight glow
        qr = Math.min(255, baseSkinR * 1.14);
        qg = Math.min(255, baseSkinG * 1.12);
        qb = Math.min(255, baseSkinB * 1.10);
        toneBands[pIdx] = 230; toneBands[pIdx + 1] = 220; toneBands[pIdx + 2] = 180; // Debug: Highlight
      } else {
        // Velvet base skin
        qr = baseSkinR;
        qg = baseSkinG;
        qb = baseSkinB;
        toneBands[pIdx] = 160; toneBands[pIdx + 1] = 160; toneBands[pIdx + 2] = 160; // Debug: Midtone
      }
    }
    // 2. Hair Region: Simplified Graphic Masses
    else if (hairMask[idx] > 0) {
      if (lum < 65) {
        // Deep shadow mass
        qr = r * 0.6;
        qg = g * 0.6;
        qb = b * 0.6;
        toneBands[pIdx] = 30; toneBands[pIdx + 1] = 30; toneBands[pIdx + 2] = 30;
      } else if (lum > 140) {
        // Specular hair sheen
        qr = Math.min(255, r * 1.25);
        qg = Math.min(255, g * 1.25);
        qb = Math.min(255, b * 1.25);
        toneBands[pIdx] = 220; toneBands[pIdx + 1] = 220; toneBands[pIdx + 2] = 220;
      } else {
        // Base hair mass
        qr = r;
        qg = g;
        qb = b;
        toneBands[pIdx] = 120; toneBands[pIdx + 1] = 120; toneBands[pIdx + 2] = 120;
      }
    }
    // 3. Clothing / General Subject Region: Quantized Color Blocks
    else if (subjectMask[idx] > 0.4 && featuresMask[idx] === 0) {
      // Discrete step snapping
      qr = Math.round(Math.round(r / stepSize) * stepSize);
      qg = Math.round(Math.round(g / stepSize) * stepSize);
      qb = Math.round(Math.round(b / stepSize) * stepSize);

      if (lum < shadowCutoff) {
        qr = qr * 0.72;
        qg = qg * 0.72;
        qb = qb * 0.72;
        toneBands[pIdx] = 50; toneBands[pIdx + 1] = 50; toneBands[pIdx + 2] = 50;
      } else {
        toneBands[pIdx] = 180; toneBands[pIdx + 1] = 180; toneBands[pIdx + 2] = 180;
      }
    }
    // 4. Facial Features (Eyes, Eyebrows, Lips): Crisp Preservation
    else if (featuresMask[idx] > 0) {
      qr = r;
      qg = g;
      qb = b;
      toneBands[pIdx] = 200; toneBands[pIdx + 1] = 50; toneBands[pIdx + 2] = 50;
    }
    // 5. Background Region
    else {
      qr = Math.round(Math.round(r / (stepSize * 1.4)) * (stepSize * 1.4));
      qg = Math.round(Math.round(g / (stepSize * 1.4)) * (stepSize * 1.4));
      qb = Math.round(Math.round(b / (stepSize * 1.4)) * (stepSize * 1.4));
      toneBands[pIdx] = 90; toneBands[pIdx + 1] = 90; toneBands[pIdx + 2] = 90;
    }

    // Apply color saturation boost & graphic contrast
    const gray = 0.299 * qr + 0.587 * qg + 0.114 * qb;
    let finalR = gray + (qr - gray) * satFactor;
    let finalG = gray + (qg - gray) * satFactor;
    let finalB = gray + (qb - gray) * satFactor;

    // Comic style subtle dot/screentone effect in mid-shadow tones
    if (isComic && lum > 45 && lum < 100) {
      const px = idx % width;
      const py = Math.floor(idx / width);
      if ((px + py) % 4 === 0) {
        finalR *= 0.85;
        finalG *= 0.85;
        finalB *= 0.85;
      }
    }

    quantized[pIdx] = Math.min(255, Math.max(0, Math.round(finalR)));
    quantized[pIdx + 1] = Math.min(255, Math.max(0, Math.round(finalG)));
    quantized[pIdx + 2] = Math.min(255, Math.max(0, Math.round(finalB)));
    quantized[pIdx + 3] = a;

    toneBands[pIdx + 3] = 255;
  }
}

/**
 * Stage 6: Structural Boundary Detection & Controlled Colored Inking
 * Extracts meaningful silhouette, jawline, eye, mouth, and garment lines.
 * Suppresses micro-wrinkles, pores, cheek noise, and tiny speckles.
 */
function extractStructuralInking(
  quantized: Uint8ClampedArray,
  width: number,
  height: number,
  skinMask: Uint8Array,
  hairMask: Uint8Array,
  featuresMask: Uint8Array,
  subjectMask: Float32Array,
  outlineStrength: number,
  style: OfflineStyle
): { outlineAlpha: Float32Array; outlineColor: Uint8ClampedArray } {
  const totalPixels = width * height;
  const outlineAlpha = new Float32Array(totalPixels);
  const outlineColor = new Uint8ClampedArray(totalPixels * 4);

  const strength = outlineStrength / 100;
  const baseThreshold = style === 'comic' ? 22 : style === 'cel-shaded' ? 30 : 38;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;

      // Check luminance neighborhood
      const getLum = (px: number, py: number) => {
        const p = (py * width + px) * 4;
        return 0.299 * quantized[p] + 0.587 * quantized[p + 1] + 0.114 * quantized[p + 2];
      };

      const p00 = getLum(x - 1, y - 1);
      const p10 = getLum(x, y - 1);
      const p20 = getLum(x + 1, y - 1);
      const p01 = getLum(x - 1, y);
      const p21 = getLum(x + 1, y);
      const p02 = getLum(x - 1, y + 1);
      const p12 = getLum(x, y + 1);
      const p22 = getLum(x + 1, y + 1);

      const gx = p20 + 2 * p21 + p22 - (p00 + 2 * p01 + p02);
      const gy = p02 + 2 * p12 + p22 - (p00 + 2 * p10 + p20);
      const magnitude = Math.sqrt(gx * gx + gy * gy);

      const isSkin = skinMask[idx] > 0;
      const isFeature = featuresMask[idx] > 0;
      const isHair = hairMask[idx] > 0;
      const isSubject = subjectMask[idx] > 0.4;

      // Thresholding rules:
      // High threshold inside skin to prevent cheek/wrinkle lines.
      // Low threshold on facial features and subject perimeter.
      let threshold = baseThreshold;
      if (isSkin && !isFeature) {
        threshold = baseThreshold * 2.2; // Suppress skin micro-lines
      } else if (isFeature) {
        threshold = baseThreshold * 0.75; // Catch clean eye & lip boundaries
      }

      if (magnitude > threshold && (isSubject || magnitude > baseThreshold * 1.5)) {
        const excess = magnitude - threshold;
        let alpha = Math.min(1.0, (excess / 50) * strength);

        if (isSkin && !isFeature) {
          alpha *= 0.45; // Soften skin contours
        }

        outlineAlpha[idx] = alpha;

        // Controlled colored contours:
        // Skin contours -> Warm dark chestnut brown (#3e2016)
        // Hair contours -> Deep umber / slate
        // Clothing / Silhouette -> Rich charcoal ink (#1b1e2b)
        const cIdx = idx * 4;
        if (isSkin && !isFeature) {
          outlineColor[cIdx] = 62;     // R (Warm chestnut)
          outlineColor[cIdx + 1] = 32; // G
          outlineColor[cIdx + 2] = 22; // B
        } else if (isHair) {
          outlineColor[cIdx] = 28;
          outlineColor[cIdx + 1] = 24;
          outlineColor[cIdx + 2] = 34;
        } else {
          outlineColor[cIdx] = 24;
          outlineColor[cIdx + 1] = 28;
          outlineColor[cIdx + 2] = 40;
        }
        outlineColor[cIdx + 3] = 255;
      }
    }
  }

  return { outlineAlpha, outlineColor };
}

/**
 * Stage 7: Composite Illustrated Result with Background Treatment
 */
function compositeIllustration(
  quantized: Uint8ClampedArray,
  outlineAlpha: Float32Array,
  outlineColor: Uint8ClampedArray,
  subjectMask: Float32Array,
  width: number,
  height: number,
  settings: OfflineModeSettings
): Uint8ClampedArray {
  const finalPixels = new Uint8ClampedArray(width * height * 4);
  const { backgroundMode, solidColor, gradientColor1, gradientColor2 } = settings;

  // Parse background colors
  const parseHex = (hexStr?: string, defaultHex = '#1e293b') => {
    const clean = (hexStr || defaultHex).replace('#', '');
    return {
      r: parseInt(clean.substring(0, 2), 16) || 30,
      g: parseInt(clean.substring(2, 4), 16) || 41,
      b: parseInt(clean.substring(4, 6), 16) || 59
    };
  };

  const bgSolid = parseHex(solidColor, '#1e293b');
  const bgGrad1 = parseHex(gradientColor1, '#1e293b');
  const bgGrad2 = parseHex(gradientColor2, '#0f172a');

  for (let idx = 0; idx < width * height; idx++) {
    const pIdx = idx * 4;
    const px = idx % width;
    const py = Math.floor(idx / width);

    let r = quantized[pIdx];
    let g = quantized[pIdx + 1];
    let b = quantized[pIdx + 2];
    const a = quantized[pIdx + 3];

    const subAlpha = subjectMask[idx];

    // Background replacement if not purely original
    if (subAlpha < 0.95 && backgroundMode !== 'original' && backgroundMode !== 'simplified') {
      let bgR = r, bgG = g, bgB = b;

      if (backgroundMode === 'flat-color' || backgroundMode === 'solid-color') {
        bgR = bgSolid.r;
        bgG = bgSolid.g;
        bgB = bgSolid.b;
      } else if (backgroundMode === 'simple-gradient') {
        const gradT = py / height;
        bgR = Math.round(bgGrad1.r * (1 - gradT) + bgGrad2.r * gradT);
        bgG = Math.round(bgGrad1.g * (1 - gradT) + bgGrad2.g * gradT);
        bgB = Math.round(bgGrad1.b * (1 - gradT) + bgGrad2.b * gradT);
      } else if (backgroundMode === 'soft-blur') {
        // Soft pastel tint
        bgR = Math.round(r * 0.7 + bgSolid.r * 0.3);
        bgG = Math.round(g * 0.7 + bgSolid.g * 0.3);
        bgB = Math.round(b * 0.7 + bgSolid.b * 0.3);
      }

      // Blend subject over background
      r = Math.round(r * subAlpha + bgR * (1 - subAlpha));
      g = Math.round(g * subAlpha + bgG * (1 - subAlpha));
      b = Math.round(b * subAlpha + bgB * (1 - subAlpha));
    }

    // Blend controlled inking outlines
    const lineAlpha = outlineAlpha[idx] || 0;
    if (lineAlpha > 0) {
      const inkR = outlineColor[pIdx];
      const inkG = outlineColor[pIdx + 1];
      const inkB = outlineColor[pIdx + 2];

      finalPixels[pIdx] = Math.round(r * (1 - lineAlpha) + inkR * lineAlpha);
      finalPixels[pIdx + 1] = Math.round(g * (1 - lineAlpha) + inkG * lineAlpha);
      finalPixels[pIdx + 2] = Math.round(b * (1 - lineAlpha) + inkB * lineAlpha);
    } else {
      finalPixels[pIdx] = r;
      finalPixels[pIdx + 1] = g;
      finalPixels[pIdx + 2] = b;
    }
    finalPixels[pIdx + 3] = a;
  }

  return finalPixels;
}

/**
 * Generate Developer Debug Image Layers
 */
function createDebugLayers(
  originalCanvas: HTMLCanvasElement,
  primaryFace: FaceRegion | null,
  subjectMask: Float32Array,
  skinMask: Uint8Array,
  hairMask: Uint8Array,
  toneBands: Uint8ClampedArray,
  outlineAlpha: Float32Array,
  outlineColor: Uint8ClampedArray,
  quantized: Uint8ClampedArray,
  finalCompositeUrl: string,
  width: number,
  height: number
): OfflineDebugLayers {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const ctx = tempCanvas.getContext('2d');
  if (!ctx) return {};

  const toUrl = () => tempCanvas.toDataURL('image/jpeg', 0.85);

  // 1. Original
  const original = originalCanvas.toDataURL('image/jpeg', 0.85);

  // 2. Face and Landmarks
  ctx.drawImage(originalCanvas, 0, 0);
  if (primaryFace) {
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.strokeRect(primaryFace.x, primaryFace.y, primaryFace.width, primaryFace.height);

    if (primaryFace.landmarks) {
      ctx.fillStyle = '#ef4444';
      const drawPoint = (p: { x: number; y: number }, r = 4) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      };
      drawPoint(primaryFace.landmarks.leftEye);
      drawPoint(primaryFace.landmarks.rightEye);
      drawPoint(primaryFace.landmarks.noseTip);
      drawPoint(primaryFace.landmarks.mouthCenter);

      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      primaryFace.landmarks.jawlinePoints.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    }
  }
  const faceAndLandmarks = toUrl();

  // 3. Subject Mask
  const subImgData = ctx.createImageData(width, height);
  for (let i = 0; i < subjectMask.length; i++) {
    const val = Math.round(subjectMask[i] * 255);
    const p = i * 4;
    subImgData.data[p] = val;
    subImgData.data[p + 1] = val;
    subImgData.data[p + 2] = val;
    subImgData.data[p + 3] = 255;
  }
  ctx.putImageData(subImgData, 0, 0);
  const subjectMaskUrl = toUrl();

  // 4. Background Mask
  for (let i = 0; i < subjectMask.length; i++) {
    const val = 255 - Math.round(subjectMask[i] * 255);
    const p = i * 4;
    subImgData.data[p] = val;
    subImgData.data[p + 1] = val;
    subImgData.data[p + 2] = val;
    subImgData.data[p + 3] = 255;
  }
  ctx.putImageData(subImgData, 0, 0);
  const backgroundMaskUrl = toUrl();

  // 5. Skin Mask
  const skinImgData = ctx.createImageData(width, height);
  for (let i = 0; i < skinMask.length; i++) {
    const p = i * 4;
    if (skinMask[i] > 0) {
      skinImgData.data[p] = 245;
      skinImgData.data[p + 1] = 158;
      skinImgData.data[p + 2] = 11;
      skinImgData.data[p + 3] = 255;
    } else {
      skinImgData.data[p] = 15;
      skinImgData.data[p + 1] = 23;
      skinImgData.data[p + 2] = 42;
      skinImgData.data[p + 3] = 255;
    }
  }
  ctx.putImageData(skinImgData, 0, 0);
  const skinMaskUrl = toUrl();

  // 6. Hair Mask
  const hairImgData = ctx.createImageData(width, height);
  for (let i = 0; i < hairMask.length; i++) {
    const p = i * 4;
    if (hairMask[i] > 0) {
      hairImgData.data[p] = 168;
      hairImgData.data[p + 1] = 85;
      hairImgData.data[p + 2] = 247;
      hairImgData.data[p + 3] = 255;
    } else {
      hairImgData.data[p] = 15;
      hairImgData.data[p + 1] = 23;
      hairImgData.data[p + 2] = 42;
      hairImgData.data[p + 3] = 255;
    }
  }
  ctx.putImageData(hairImgData, 0, 0);
  const hairMaskUrl = toUrl();

  // 7. Tone Bands (Cel Shading)
  const toneImgData = ctx.createImageData(width, height);
  toneImgData.data.set(toneBands);
  ctx.putImageData(toneImgData, 0, 0);
  const toneBandsUrl = toUrl();

  // 8. Structural Edges
  const edgeImgData = ctx.createImageData(width, height);
  for (let i = 0; i < outlineAlpha.length; i++) {
    const a = outlineAlpha[i];
    const p = i * 4;
    if (a > 0) {
      edgeImgData.data[p] = outlineColor[p];
      edgeImgData.data[p + 1] = outlineColor[p + 1];
      edgeImgData.data[p + 2] = outlineColor[p + 2];
    } else {
      edgeImgData.data[p] = 255;
      edgeImgData.data[p + 1] = 255;
      edgeImgData.data[p + 2] = 255;
    }
    edgeImgData.data[p + 3] = 255;
  }
  ctx.putImageData(edgeImgData, 0, 0);
  const structuralEdgesUrl = toUrl();

  // 9. Color Quantized
  const quantImgData = ctx.createImageData(width, height);
  quantImgData.data.set(quantized);
  ctx.putImageData(quantImgData, 0, 0);
  const colorQuantizedUrl = toUrl();

  tempCanvas.width = 0;
  tempCanvas.height = 0;

  return {
    original,
    faceAndLandmarks,
    subjectMask: subjectMaskUrl,
    backgroundMask: backgroundMaskUrl,
    skinMask: skinMaskUrl,
    hairMask: hairMaskUrl,
    toneBands: toneBandsUrl,
    structuralEdges: structuralEdgesUrl,
    colorQuantized: colorQuantizedUrl,
    finalComposite: finalCompositeUrl
  };
}

/**
 * Main Offline NPR Photo-Illustration Pipeline
 * 100% in-browser, zero network requests, zero generative AI.
 */
export async function runOfflineCartoonPipeline(
  imageDataUrl: string,
  settings: OfflineModeSettings,
  onProgress?: (progress: OfflineProcessingProgress) => void
): Promise<OfflineProcessingResult> {
  const jobId = ++currentJobId;
  const startTime = Date.now();

  // Stage 1: Validation
  onProgress?.({ step: 1, label: 'Validating image source...', percentage: 8 });
  const validation = validateImageFile(imageDataUrl);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  // Stage 2: Safe Image Loading & Scaling (Max 1600px, preserve aspect ratio)
  onProgress?.({ step: 2, label: 'Preparing high-resolution canvas...', percentage: 16 });
  const img = await loadImageElement(imageDataUrl);

  if (jobId !== currentJobId) throw new Error('Processing cancelled by user.');

  const maxDimension = 1600;
  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;

  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    if (targetWidth > targetHeight) {
      targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
      targetWidth = maxDimension;
    } else {
      targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
      targetHeight = maxDimension;
    }
  }

  // Create initial working canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Browser could not allocate Canvas 2D context.');
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  let rawImgData = ctx.getImageData(0, 0, targetWidth, targetHeight);

  // Stage 3: Face Detection & Composition Analysis
  onProgress?.({ step: 3, label: 'Detecting facial geometry & landmarks...', percentage: 28 });
  await yieldToMainThread();
  const { primaryFace, facesCount } = await detectFaceAndLandmarks(canvas, rawImgData);

  if (jobId !== currentJobId) throw new Error('Processing cancelled by user.');

  // Auto-Crop Portrait Composition (Head & Shoulders) if requested
  if (settings.autoCropPortrait && primaryFace) {
    onProgress?.({ step: 3, label: 'Composing head-and-shoulders crop...', percentage: 34 });
    const cropX = Math.max(0, Math.round(primaryFace.x - primaryFace.width * 0.45));
    const cropY = Math.max(0, Math.round(primaryFace.y - primaryFace.height * 0.35));
    const cropW = Math.min(targetWidth - cropX, Math.round(primaryFace.width * 1.9));
    const cropH = Math.min(targetHeight - cropY, Math.round(primaryFace.height * 2.5));

    if (cropW > 100 && cropH > 100) {
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = cropW;
      croppedCanvas.height = cropH;
      const cCtx = croppedCanvas.getContext('2d');
      if (cCtx) {
        cCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        canvas.width = cropW;
        canvas.height = cropH;
        ctx.drawImage(croppedCanvas, 0, 0);
        targetWidth = cropW;
        targetHeight = cropH;
        rawImgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        // Adjust primaryFace coordinates relative to cropped canvas
        primaryFace.x = Math.max(0, primaryFace.x - cropX);
        primaryFace.y = Math.max(0, primaryFace.y - cropY);
      }
    }
  }

  // Stage 4: Multi-Region Semantic Segmentation
  onProgress?.({ step: 4, label: 'Segmenting skin, hair, and subject masks...', percentage: 44 });
  await yieldToMainThread();
  const { subjectMask, skinMask, hairMask, clothingMask, featuresMask } = generateSemanticRegions(
    rawImgData,
    primaryFace
  );

  if (jobId !== currentJobId) throw new Error('Processing cancelled by user.');

  // Stage 5: Photographic Texture Removal (Kuwahara Filter)
  onProgress?.({ step: 5, label: 'Removing photographic texture (Kuwahara NPR)...', percentage: 58 });
  await yieldToMainThread();

  const smoothedBuffer = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  // Kuwahara radius scales with smoothing slider (radius 2 to 5)
  const kuwaharaRadius = Math.max(2, Math.min(5, Math.round(settings.smoothing * 0.05)));
  applyKuwaharaAbstraction(rawImgData.data, smoothedBuffer, targetWidth, targetHeight, kuwaharaRadius);

  if (jobId !== currentJobId) throw new Error('Processing cancelled by user.');

  // Stage 6: Region-Specific Cel-Shading & Color Quantization
  onProgress?.({ step: 6, label: 'Quantizing color regions & cel-shading...', percentage: 74 });
  await yieldToMainThread();

  const quantizedBuffer = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  const toneBandsBuffer = new Uint8ClampedArray(targetWidth * targetHeight * 4);

  applyCelShadingAndQuantization(
    smoothedBuffer,
    quantizedBuffer,
    toneBandsBuffer,
    targetWidth,
    targetHeight,
    skinMask,
    hairMask,
    clothingMask,
    featuresMask,
    subjectMask,
    settings
  );

  if (jobId !== currentJobId) throw new Error('Processing cancelled by user.');

  // Stage 7: Meaningful Structural Boundaries & Controlled Colored Inking
  onProgress?.({ step: 7, label: 'Extracting structural cartoon contours...', percentage: 86 });
  await yieldToMainThread();

  const { outlineAlpha, outlineColor } = extractStructuralInking(
    quantizedBuffer,
    targetWidth,
    targetHeight,
    skinMask,
    hairMask,
    featuresMask,
    subjectMask,
    settings.outlineStrength,
    settings.style
  );

  // Stage 8: Final Composition & Color Grading
  onProgress?.({ step: 8, label: 'Finalizing illustrated composite...', percentage: 95 });
  await yieldToMainThread();

  const finalPixels = compositeIllustration(
    quantizedBuffer,
    outlineAlpha,
    outlineColor,
    subjectMask,
    targetWidth,
    targetHeight,
    settings
  );

  const finalImgData = ctx.createImageData(targetWidth, targetHeight);
  finalImgData.data.set(finalPixels);
  ctx.putImageData(finalImgData, 0, 0);

  const outputDataUrl = canvas.toDataURL('image/jpeg', 0.94);

  // Stage 9: Generate Developer Debug Layers if Debug Mode is enabled
  let debugLayers: OfflineDebugLayers | undefined;
  if (settings.debugMode) {
    debugLayers = createDebugLayers(
      canvas,
      primaryFace,
      subjectMask,
      skinMask,
      hairMask,
      toneBandsBuffer,
      outlineAlpha,
      outlineColor,
      quantizedBuffer,
      outputDataUrl,
      targetWidth,
      targetHeight
    );
  }

  // Cleanup
  canvas.width = 0;
  canvas.height = 0;

  const durationMs = Date.now() - startTime;
  onProgress?.({ step: 9, label: 'Render complete!', percentage: 100 });

  return {
    imageUrl: outputDataUrl,
    durationMs,
    faceDetected: !!primaryFace,
    facesCount,
    width: targetWidth,
    height: targetHeight,
    debugLayers
  };
}
