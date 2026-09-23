import { ArtStyle, PoseOption, WardrobeOption, ExpressionOption, AppSettings, OfflineModeSettings, OfflineDebugLayers } from '../types';
import { generateMockCartoonSvg, mockSvgToDataUrl } from './mockGenerator';
import { processOfflineCanvasCartoon } from './offlineCanvasFilter';

interface GenerateCharacterParams {
  originalImageDataUrl: string;
  artStyle: ArtStyle;
  pose: PoseOption;
  wardrobe: WardrobeOption;
  customWardrobeText?: string;
  expression: ExpressionOption;
  seed: number;
  additionalNotes?: string;
  settings: AppSettings;
  isFreeTier?: boolean;
  userId?: string;
  offlineSettings?: OfflineModeSettings;
  onProgress?: (step: number, label: string, percent: number) => void;
  onFallback?: (reason: string) => void;
}

export interface GenerateResult {
  imageUrl: string;
  isMock: boolean;
  promptUsed: string;
  revertedToOfflineMock?: boolean;
  fallbackReason?: string;
  debugLayers?: OfflineDebugLayers;
  remainingFreeGenerations?: number;
  resetAt?: number;
}

// Convert data URL to pure base64 + mimeType
function parseDataUrl(dataUrl: string): { mimeType: string; base64Data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], base64Data: match[2] };
  }
  // If svg+xml
  if (dataUrl.startsWith('data:image/svg+xml')) {
    const svgContent = decodeURIComponent(dataUrl.split(',')[1] || '');
    const base64 = btoa(unescape(encodeURIComponent(svgContent)));
    return { mimeType: 'image/svg+xml', base64Data: base64 };
  }
  return { mimeType: 'image/png', base64Data: dataUrl.replace(/^data:[^;]+;base64,/, '') };
}

// Build the structured multi-modal prompt
export function buildGenerationPrompt(
  artStyle: ArtStyle,
  pose: PoseOption,
  wardrobe: WardrobeOption,
  customWardrobeText: string | undefined,
  expression: ExpressionOption,
  seed: number,
  additionalNotes?: string
): string {
  const wardrobeDescription =
    wardrobe.id === 'custom-override' && customWardrobeText?.trim()
      ? customWardrobeText.trim()
      : wardrobe.promptText;

  const prompt = [
    `COMPOSITION & FRAMING DIRECTIVE (CRITICAL):`,
    `- The generated image MUST be a waist-up / upper-body character portrait showing the full torso, arms, hands, and outfit clearly to accurately execute the chosen pose.`,
    `- Even if the provided reference photo is a close-up cropped face or headshot, extend the character down through the shoulders, chest, arms, hands, and waist. Do NOT render a floating head or close-up cropped face.`,
    ``,
    `SUBJECT LIKENESS & FACIAL IDENTITY:`,
    `- Carefully replicate the facial features, eye shape, eyebrows, nose, beard/mustache, skin tone, gender, hair style, and age of the person in the reference portrait into a stylized animated character.`,
    ``,
    `ART STYLE & RENDERING:`,
    `- Style: ${artStyle.name}`,
    `- Aesthetics: ${artStyle.promptDescription}`,
    ``,
    `CHARACTER POSE & GESTURE (MANDATORY):`,
    `- Selected Pose: ${pose.label}`,
    `- Action & Hand Details: ${pose.promptText}`,
    `- Both hands/arms and body posture MUST be visibly performing this pose.`,
    ``,
    `WARDROBE & ATTIRE:`,
    `- Outfit: ${wardrobeDescription}`,
    `- Render the complete garment on the upper body with crisp details and fabric physics.`,
    ``,
    `FACIAL EXPRESSION:`,
    `- Mood: ${expression.label} (${expression.promptText})`,
    ``,
    `CONSISTENCY SEED:`,
    `- Seed: ${seed}`,
    additionalNotes?.trim() ? `ADDITIONAL STYLING DIRECTIVES:\n- ${additionalNotes.trim()}` : ''
  ]
    .filter(Boolean)
    .join('\n');

  return prompt;
}

export async function generateCartoonCharacter(
  params: GenerateCharacterParams
): Promise<GenerateResult> {
  const {
    originalImageDataUrl,
    artStyle,
    pose,
    wardrobe,
    customWardrobeText,
    expression,
    seed,
    additionalNotes,
    settings,
    isFreeTier = false,
    userId,
    offlineSettings,
    onProgress,
    onFallback
  } = params;

  const promptUsed = buildGenerationPrompt(
    artStyle,
    pose,
    wardrobe,
    customWardrobeText,
    expression,
    seed,
    additionalNotes
  );

  // If user explicitly configured Local Mock Mode in settings
  if (settings.useMockMode) {
    onProgress?.(1, 'Processing locally on device...', 15);

    const offlineResult = await processOfflineCanvasCartoon({
      imageDataUrl: originalImageDataUrl,
      artStyle: artStyle.id,
      offlineSettings,
      onProgress: (p) => {
        onProgress?.(p.step, p.label, p.percentage);
      }
    });

    onProgress?.(9, 'Finalizing character render...', 100);

    return {
      imageUrl: offlineResult.imageUrl,
      isMock: true,
      promptUsed,
      debugLayers: offlineResult.debugLayers
    };
  }

  // Step 1: Analyzing features
  onProgress?.(1, 'Analyzing portrait facial geometry & features...', 25);

  const { mimeType, base64Data } = parseDataUrl(originalImageDataUrl);
  const idempotencyKey = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // ==========================================
  // FREE TIER (AI-Powered, 1/Day, Server Fallback Chain)
  // ==========================================
  if (isFreeTier) {
    onProgress?.(2, 'Executing Free Tier AI Provider Fallback Chain...', 45);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch('/api/generations/free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': idempotencyKey,
          ...(userId ? { 'x-user-id': userId } : {})
        },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: promptUsed,
          systemInstruction: settings.systemPrompt,
          imageData: base64Data,
          mimeType: mimeType,
          aspectRatio: settings.aspectRatio || '1:1',
          seed: seed,
          userId,
          idempotencyKey
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMessage = errorData.error || `Free generation error (HTTP ${response.status})`;
        // If daily limit reached (429), rethrow so UI displays the limit and reset timer
        throw new Error(errMessage);
      }

      onProgress?.(3, 'Rendering multi-modal character...', 85);
      const data = await response.json();

      if (!data.imageUrl) {
        throw new Error(data.message || 'No image data returned from AI provider chain');
      }

      onProgress?.(4, 'Complete!', 100);

      return {
        imageUrl: data.imageUrl,
        isMock: false,
        promptUsed,
        remainingFreeGenerations: data.remaining ?? 0,
        resetAt: data.resetAt
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const errorMsg = err instanceof Error ? err.message : 'Free Tier AI service temporarily unavailable.';
      onFallback?.(errorMsg);
      throw err;
    }
  }

  // ==========================================
  // PAID TIER / BYOK FLOW
  // ==========================================
  const hasUserKey = !!settings.geminiApiKey?.trim();
  const shouldUseCustomKey = hasUserKey && !settings.useBuiltinChain;

  try {
    onProgress?.(2, shouldUseCustomKey ? `Contacting ${settings.provider.toUpperCase()} engine...` : 'Connecting to Paid Tier Provider Chain...', 50);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    const response = await fetch('/api/generations/paid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(shouldUseCustomKey ? { 'x-gemini-key': settings.geminiApiKey.trim() } : {}),
        'x-ai-provider': settings.provider || 'google',
        'x-ai-model': settings.model || 'gemini-3.1-flash-image',
        'x-idempotency-key': idempotencyKey,
        ...(userId ? { 'x-user-id': userId } : {})
      },
      signal: controller.signal,
      body: JSON.stringify({
        provider: settings.provider || 'google',
        prompt: promptUsed,
        systemInstruction: settings.systemPrompt,
        imageData: base64Data,
        mimeType: mimeType,
        model: settings.model || 'gemini-3.1-flash-image',
        aspectRatio: settings.aspectRatio || '1:1',
        seed: seed,
        customApiKey: shouldUseCustomKey ? settings.geminiApiKey.trim() : undefined,
        customProvider: settings.provider,
        customModel: settings.model,
        idempotencyKey
      })
    });

    clearTimeout(timeoutId);
    onProgress?.(3, 'Processing generated multi-modal imagery...', 85);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API returned status ${response.status}: Key quota exceeded or invalid`
      );
    }

    const data = await response.json();

    if (!data.imageUrl) {
      throw new Error(data.message || 'No image data returned from AI provider');
    }

    onProgress?.(4, 'Complete!', 100);

    return {
      imageUrl: data.imageUrl,
      isMock: false,
      promptUsed
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : 'API key is invalid, quota reached, or server unreachable.';

    console.warn('AI API call failed, reverting to Offline Mock Mode:', errorMsg);

    onFallback?.(errorMsg);

    // Graceful fallback to offline canvas cartoon filter so the user experience is never broken
    onProgress?.(3, 'Reverting to offline canvas cartoon filter...', 85);
    await new Promise((r) => setTimeout(r, 400));

    let fallbackUrl = '';
    try {
      const res = await processOfflineCanvasCartoon({
        imageDataUrl: originalImageDataUrl,
        artStyle: artStyle.id,
        offlineSettings
      });
      fallbackUrl = res.imageUrl;
    } catch {
      fallbackUrl = mockSvgToDataUrl(generateMockCartoonSvg({
        artStyle: artStyle.id,
        pose: pose.id,
        wardrobe: wardrobe.id,
        customWardrobeText,
        expression: expression.id,
        seed
      }));
    }

    onProgress?.(4, 'Finalizing render...', 100);

    return {
      imageUrl: fallbackUrl,
      isMock: true,
      revertedToOfflineMock: true,
      fallbackReason: errorMsg,
      promptUsed
    };
  }
}
