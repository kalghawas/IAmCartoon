import crypto from 'crypto';

// Secret key derivation (32 bytes for AES-256-GCM)
let masterKey: Buffer | null = null;

function getMasterKey(): Buffer {
  if (masterKey) return masterKey;
  const envKey = process.env.SERVER_ENCRYPTION_KEY?.trim();
  if (envKey && envKey.length >= 16) {
    masterKey = crypto.createHash('sha256').update(envKey).digest();
  } else {
    // Derive a stable machine/environment seed so keys persist between requests
    const seed = process.env.APP_URL || process.env.GEMINI_API_KEY || 'iam-cartoon-studio-secure-seed-v1';
    masterKey = crypto.createHash('sha256').update(`iam-cartoon-storage-salt:${seed}`).digest();
  }
  return masterKey;
}

/**
 * Encrypt a secret string using AES-256-GCM
 */
export function encryptSecret(plaintext: string): string {
  if (!plaintext) return '';
  const key = getMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  // Format: iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a secret string
 */
export function decryptSecret(ciphertext?: string): string {
  if (!ciphertext) return '';
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      // In case unencrypted key was stored
      return ciphertext;
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getMasterKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Failed to decrypt secret:', err);
    return '';
  }
}

/**
 * Mask an API key so it can be safely displayed in the creator admin panel
 * e.g. "AIzaSyD3R...524Bab5BR7lDI" -> "AIzaSy••••••••••••••••••••DI"
 */
export function maskApiKey(key?: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) {
    return '••••••••';
  }
  const prefixLen = Math.min(6, Math.floor(trimmed.length / 4));
  const suffixLen = Math.min(4, Math.floor(trimmed.length / 5));
  const prefix = trimmed.substring(0, prefixLen);
  const suffix = trimmed.substring(trimmed.length - suffixLen);
  const maskLength = Math.max(8, trimmed.length - prefixLen - suffixLen);
  return `${prefix}${'•'.repeat(Math.min(16, maskLength))}${suffix}`;
}
