import { UserCreditState, PricingPlan } from '../types';

const CREDIT_STORAGE_KEY = 'iam_cartoon_user_credits_v1';
const MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'single_unlock',
    name: 'Single HD Unlock',
    priceUsd: 0.99,
    priceSar: 3.75,
    creditsAdded: 1,
    removesWatermark: true,
    description: 'Perfect for a single finished avatar',
    features: [
      'Removes watermark from active cartoon',
      '1 Extra High-Definition AI Generation',
      'Ultra 4K export resolution',
      'Full personal & avatar usage rights'
    ]
  },
  {
    id: 'creator_pack',
    name: 'Creator Pack',
    priceUsd: 2.99,
    priceSar: 11.25,
    creditsAdded: 10,
    removesWatermark: true,
    popular: true,
    description: 'Most popular for trying multiple styles & poses',
    features: [
      '10 High-Definition AI Generations',
      'Instant watermark removal on all downloads',
      'Identity consistency seed lock',
      'Access to all Gulf & Cultural wardrobe presets',
      'No monthly expiration on purchased credits'
    ]
  },
  {
    id: 'pro_master_pack',
    name: 'Pro Master Pack',
    priceUsd: 6.99,
    priceSar: 26.25,
    creditsAdded: 30,
    removesWatermark: true,
    description: 'Best value for content creators and teams',
    features: [
      '30 High-Definition AI Generations',
      'Permanent watermark removal',
      'Priority GPU AI generation queue',
      'Batch variations generator',
      'Commercial license for business use'
    ]
  }
];

// Initialize or load credits from localStorage with 30-day reset check
export function loadUserCredits(): UserCreditState {
  try {
    const raw = localStorage.getItem(CREDIT_STORAGE_KEY);
    if (raw) {
      const state: UserCreditState = JSON.parse(raw);
      const now = Date.now();
      // Check if 30 days passed since last reset
      if (now - (state.lastMonthlyReset || 0) > MONTH_MS) {
        state.freeCreditsRemaining = 3;
        state.lastMonthlyReset = now;
        saveUserCredits(state);
      }
      return state;
    }
  } catch (e) {
    console.error('Failed to load user credits:', e);
  }

  // Default initial credit state
  const initial: UserCreditState = {
    freeCreditsRemaining: 3,
    purchasedCredits: 0,
    lastMonthlyReset: Date.now(),
    unlockedImageIds: []
  };
  saveUserCredits(initial);
  return initial;
}

export function saveUserCredits(state: UserCreditState): void {
  try {
    localStorage.setItem(CREDIT_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save user credits:', e);
  }
}

// Calculate days remaining until next 30-day reset
export function getDaysUntilReset(lastReset: number): number {
  const nextReset = lastReset + MONTH_MS;
  const diffMs = nextReset - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// Check if user has available credits (free or purchased)
export function hasAvailableCredits(state: UserCreditState): boolean {
  return state.freeCreditsRemaining > 0 || state.purchasedCredits > 0;
}

// Total credits count
export function getTotalCredits(state: UserCreditState): number {
  return state.freeCreditsRemaining + state.purchasedCredits;
}

// Consume 1 credit
export function consumeCredit(state: UserCreditState): UserCreditState {
  const updated = { ...state };
  if (updated.freeCreditsRemaining > 0) {
    updated.freeCreditsRemaining -= 1;
  } else if (updated.purchasedCredits > 0) {
    updated.purchasedCredits -= 1;
  }
  saveUserCredits(updated);
  return updated;
}

// Add purchased plan credits & unlock
export function applyPurchasedPlan(
  state: UserCreditState,
  plan: PricingPlan,
  currentImageId?: string
): UserCreditState {
  const updated: UserCreditState = {
    ...state,
    purchasedCredits: state.purchasedCredits + plan.creditsAdded,
    unlockedImageIds: [...state.unlockedImageIds]
  };

  if (currentImageId && !updated.unlockedImageIds.includes(currentImageId)) {
    updated.unlockedImageIds.push(currentImageId);
  }

  saveUserCredits(updated);
  return updated;
}

// Download helper with optional watermarking
export async function downloadImageWithWatermarkOption(
  imageUrl: string,
  fileName: string,
  isUnlocked: boolean
): Promise<void> {
  // If unlocked, download raw image without watermark
  if (isUnlocked) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${fileName}-hd-clean.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // If free/locked, draw watermark onto canvas and download
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imageUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || 1024;
  canvas.height = img.naturalHeight || 1024;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  // Draw base image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Draw stylish aesthetic watermark pill in top-left corner
  const pad = Math.max(16, canvas.width * 0.02);
  const fontSize = Math.max(14, canvas.width * 0.022);
  const text = '✨ I Am Cartoon • iamcartoon.com';

  ctx.font = `600 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const textMetrics = ctx.measureText(text);
  const boxWidth = textMetrics.width + pad * 1.5;
  const boxHeight = fontSize * 2.2;
  const boxX = pad;
  const boxY = pad;
  const radius = boxHeight / 2;

  // Background pill
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius);
  ctx.fill();
  ctx.stroke();

  // Text inside pill
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.fillText(text, boxX + pad * 0.75, boxY + boxHeight / 2 + fontSize * 0.35);
  ctx.restore();

  // Trigger download
  const watermarkedDataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = watermarkedDataUrl;
  link.download = `${fileName}-free-watermarked.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
