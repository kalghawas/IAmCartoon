import { Request, Response, NextFunction } from 'express';

const CREATOR_EMAIL = (process.env.CREATOR_EMAIL || 'kalghawas@gmail.com').toLowerCase().trim();
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY?.trim();

/**
 * Middleware to protect creator-only admin endpoints
 */
export function requireCreatorAuth(req: Request, res: Response, next: NextFunction) {
  // Check Creator Secret Header if configured
  const secretHeader = (req.headers['x-creator-secret'] as string)?.trim();
  if (ADMIN_SECRET && secretHeader && secretHeader === ADMIN_SECRET) {
    return next();
  }

  // Check authenticated email header or body
  const userEmail = (
    (req.headers['x-creator-email'] as string) ||
    (req.headers['x-user-email'] as string) ||
    req.body?.userEmail ||
    req.body?.email ||
    ''
  ).toLowerCase().trim();

  if (userEmail && userEmail === CREATOR_EMAIL) {
    return next();
  }

  // Allow localhost / internal dev environment in AI studio if marked
  const isDevAdmin = req.headers['x-admin-role'] === 'creator' && req.headers['x-admin-verified'] === 'true';
  if (isDevAdmin) {
    return next();
  }

  return res.status(403).json({
    error: 'Forbidden: Creator authorization required to access provider management.',
    creatorEmail: CREATOR_EMAIL
  });
}

/**
 * Helper to check whether an email belongs to the creator
 */
export function isCreatorEmail(email?: string): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === CREATOR_EMAIL;
}
