import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { DailyUsageRecord } from './types';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const USAGE_FILE = path.join(DATA_DIR, 'usage.json');

const LOCK_DURATION_MS = 60 * 1000; // 60 seconds processing lock timeout

export class DailyLimitManager {
  private records: Map<string, DailyUsageRecord> = new Map();
  private initialized = false;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (this.initialized) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(USAGE_FILE)) {
        const raw = fs.readFileSync(USAGE_FILE, 'utf-8');
        const list: DailyUsageRecord[] = JSON.parse(raw);
        list.forEach((r) => this.records.set(`${r.userId}:${r.dateBucket}`, r));
      }
    } catch (e) {
      console.error('[DailyLimitManager] Error loading usage:', e);
    }
    this.initialized = true;
  }

  private persist() {
    try {
      const list = Array.from(this.records.values());
      fs.writeFileSync(USAGE_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DailyLimitManager] Error saving usage:', e);
    }
  }

  /**
   * Current date bucket in UTC format: YYYY-MM-DD
   */
  public getCurrentDateBucket(): string {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    const d = String(now.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Milliseconds until the next UTC midnight
   */
  public getMsUntilReset(): number {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
    return Math.max(0, tomorrow.getTime() - now.getTime());
  }

  /**
   * Next UTC reset timestamp in milliseconds
   */
  public getNextResetTimestamp(): number {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
    return tomorrow.getTime();
  }

  /**
   * Derive a secure identifier from request.
   * If authenticated userId passed in headers or body, use that.
   * Otherwise, derive from IP + User-Agent + signed server anonymous token.
   */
  public resolveUserIdentifier(req: Request, res?: Response): string {
    const authUser = (req.headers['x-user-id'] as string) || req.body?.userId;
    if (authUser && typeof authUser === 'string' && authUser.trim().length > 0) {
      return `auth_${authUser.trim()}`;
    }

    // Anonymous identification strategy
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown-ua';

    // Check signed anonymous cookie/header
    let anonToken = (req.headers['x-anonymous-token'] as string) || req.cookies?.['iam_anon_id'];
    if (!anonToken) {
      // Create new cryptographically secure anonymous token
      const rawSeed = `${clientIp}:${userAgent}:${Date.now()}:${Math.random()}`;
      anonToken = crypto.createHash('sha256').update(rawSeed).digest('hex').substring(0, 32);
      if (res) {
        res.setHeader('x-anonymous-token', anonToken);
      }
    }

    // Fingerprint combines IP subnet and hashed token to prevent localStorage bypass
    const ipPrefix = clientIp.split('.').slice(0, 3).join('.');
    const combined = crypto.createHash('sha256').update(`${ipPrefix}:${userAgent}:${anonToken}`).digest('hex').substring(0, 24);
    return `anon_${combined}`;
  }

  /**
   * Check daily usage for a user
   */
  public getUsage(userId: string) {
    this.ensureInitialized();
    const dateBucket = this.getCurrentDateBucket();
    const key = `${userId}:${dateBucket}`;
    const record = this.records.get(key);

    const successfulGenerations = record?.successfulGenerations || 0;
    const isLocked =
      record?.requestStatus === 'processing' &&
      record.lockExpiresAt !== undefined &&
      record.lockExpiresAt > Date.now();

    const usedToday = successfulGenerations >= 1;
    const remaining = usedToday ? 0 : 1;
    const resetAt = this.getNextResetTimestamp();

    return {
      userId,
      dateBucket,
      usedToday,
      remaining,
      isLocked,
      resetAt,
      lastSuccessAt: record?.lastSuccessAt,
      providerUsed: record?.providerUsed
    };
  }

  /**
   * Atomically acquire a lock for generation.
   * Enforces 1-per-day limit and idempotency.
   */
  public acquireLock(
    userId: string,
    idempotencyKey: string
  ): { allowed: boolean; reason?: string; resetAt: number; record?: DailyUsageRecord } {
    this.ensureInitialized();
    const dateBucket = this.getCurrentDateBucket();
    const key = `${userId}:${dateBucket}`;
    const now = Date.now();
    const resetAt = this.getNextResetTimestamp();

    let record = this.records.get(key);

    // 1. Check if user already generated 1 image today
    if (record && record.successfulGenerations >= 1) {
      return {
        allowed: false,
        reason: 'You have reached your daily free generation limit (1/day). Your free generation resets at midnight UTC.',
        resetAt
      };
    }

    // 2. Check if identical request is currently processing or already completed with this idempotencyKey
    if (record) {
      if (record.idempotencyKey === idempotencyKey && record.requestStatus === 'completed') {
        return {
          allowed: false,
          reason: 'This generation was already completed successfully.',
          resetAt
        };
      }

      if (
        record.requestStatus === 'processing' &&
        record.lockExpiresAt &&
        record.lockExpiresAt > now
      ) {
        return {
          allowed: false,
          reason: 'A generation is currently in progress. Please wait for it to complete.',
          resetAt
        };
      }
    }

    // 3. Reserve lock
    record = {
      userId,
      dateBucket,
      successfulGenerations: record?.successfulGenerations || 0,
      requestStatus: 'processing',
      idempotencyKey,
      lockExpiresAt: now + LOCK_DURATION_MS
    };

    this.records.set(key, record);
    this.persist();

    return {
      allowed: true,
      resetAt,
      record
    };
  }

  /**
   * Release lock on failure without consuming allowance
   */
  public releaseLock(userId: string, errorReason: string) {
    this.ensureInitialized();
    const dateBucket = this.getCurrentDateBucket();
    const key = `${userId}:${dateBucket}`;
    const record = this.records.get(key);
    if (!record) return;

    record.requestStatus = 'failed';
    record.lockExpiresAt = undefined;
    record.errorReason = errorReason.slice(0, 200);
    this.persist();
  }

  /**
   * Record a successful generation and consume 1 allowance
   */
  public recordSuccess(userId: string, providerId: string, idempotencyKey: string) {
    this.ensureInitialized();
    const dateBucket = this.getCurrentDateBucket();
    const key = `${userId}:${dateBucket}`;
    const now = Date.now();

    const record: DailyUsageRecord = {
      userId,
      dateBucket,
      successfulGenerations: 1,
      lastSuccessAt: now,
      requestStatus: 'completed',
      idempotencyKey,
      lockExpiresAt: undefined,
      providerUsed: providerId
    };

    this.records.set(key, record);
    this.persist();
  }
}

export const dailyLimitManager = new DailyLimitManager();
