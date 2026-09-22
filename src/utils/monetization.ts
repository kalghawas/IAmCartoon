import { UserSubscriptionState } from '../types';

const STORAGE_KEY = 'iamwhatsapp_subscription_state_v1';
export const DEFAULT_FREE_LIMIT = 15; // 15 free generations/exports

// Built-in test / promo license keys for instant activation
const VALID_PROMO_KEYS = new Set([
  'PRO-VIP',
  'CREATOR-SAUDI',
  'WHATSAPP-PRO-2026',
  'SAUDI-CREATOR-PASS',
  'MADA-PRO-UNLOCK',
]);

/**
 * Load current user subscription state
 */
export function loadSubscriptionState(): UserSubscriptionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        tier: parsed.tier || 'free',
        isPro: parsed.isPro || parsed.tier === 'pro',
        freeGenerationsUsed: typeof parsed.freeGenerationsUsed === 'number' ? parsed.freeGenerationsUsed : 0,
        freeGenerationsLimit: typeof parsed.freeGenerationsLimit === 'number' ? parsed.freeGenerationsLimit : DEFAULT_FREE_LIMIT,
        licenseKey: parsed.licenseKey || '',
      };
    }
  } catch {}

  return {
    tier: 'free',
    isPro: false,
    freeGenerationsUsed: 0,
    freeGenerationsLimit: DEFAULT_FREE_LIMIT,
  };
}

/**
 * Save user subscription state
 */
export function saveSubscriptionState(state: UserSubscriptionState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

/**
 * Record a generation usage (Make bubbles or Export).
 * Returns true if allowed, false if limit reached and user needs to upgrade.
 */
export function recordGenerationUsage(
  currentState: UserSubscriptionState,
  onUpdate: (newState: UserSubscriptionState) => void
): { allowed: boolean; remaining: number } {
  if (currentState.isPro) {
    return { allowed: true, remaining: Infinity };
  }

  if (currentState.freeGenerationsUsed >= currentState.freeGenerationsLimit) {
    return { allowed: false, remaining: 0 };
  }

  const nextUsed = currentState.freeGenerationsUsed + 1;
  const nextState: UserSubscriptionState = {
    ...currentState,
    freeGenerationsUsed: nextUsed,
  };

  saveSubscriptionState(nextState);
  onUpdate(nextState);

  const remaining = Math.max(0, currentState.freeGenerationsLimit - nextUsed);
  return { allowed: true, remaining };
}

/**
 * Redeem or verify a license key (or promo key)
 */
export function redeemLicenseKey(key: string): { success: boolean; message: string } {
  const cleanKey = key.trim().toUpperCase();
  if (!cleanKey) {
    return { success: false, message: 'Please enter a valid license key or order ID.' };
  }

  // Check valid promo keys only. NOTE: this is a client-side check with no
  // server-side verification against real purchase/order records — it stops
  // arbitrary strings from unlocking Pro, but a determined user can still
  // read these keys out of the shipped bundle. Do not treat this as a real
  // paywall until license keys are verified server-side (e.g. against a
  // payment provider webhook or Firestore doc written by a trusted backend).
  if (VALID_PROMO_KEYS.has(cleanKey)) {
    return {
      success: true,
      message: 'Pro Plan activated successfully! Unlimited 1080p exports unlocked with no watermark.',
    };
  }

  return {
    success: false,
    message: 'Invalid key. If you purchased recently, check your confirmation email or enter a valid promo code.',
  };
}
