import { UserProfile, UserCreditState } from '../types';
import { loadUserCredits, saveUserCredits } from './creditManager';
import {
  firebaseSignInWithGoogle,
  firebaseSignInWithEmail,
  firebaseSignOut,
  syncCreditsToFirestore
} from './firebase';

const CURRENT_USER_STORAGE_KEY = 'iam_cartoon_current_user_v1';
const USERS_DATABASE_KEY = 'iam_cartoon_users_db_v1';

// Get all stored accounts from local persistence
export function getRegisteredUsers(): Record<string, UserProfile> {
  try {
    const raw = localStorage.getItem(USERS_DATABASE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse users db:', e);
  }
  return {};
}

// Save registered users dictionary
export function saveRegisteredUsers(users: Record<string, UserProfile>): void {
  try {
    localStorage.setItem(USERS_DATABASE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users db:', e);
  }
}

// Get currently active logged-in user (or null if guest)
export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (raw) {
      const user: UserProfile = JSON.parse(raw);
      // Synchronize with database version
      const allUsers = getRegisteredUsers();
      if (allUsers[user.id]) {
        return allUsers[user.id];
      }
      return user;
    }
  } catch (e) {
    console.error('Failed to load active user:', e);
  }
  return null;
}

// Set active user session
export function setCurrentUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
      const allUsers = getRegisteredUsers();
      allUsers[user.id] = user;
      saveRegisteredUsers(allUsers);
      saveUserCredits(user.credits);
      // Async sync to Firestore
      syncCreditsToFirestore(user.id, user.credits).catch(() => {});
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      firebaseSignOut().catch(() => {});
    }
  } catch (e) {
    console.error('Failed to set current user:', e);
  }
}

// Log in or Sign Up with Google (Firebase-backed with safe local sync)
export async function authenticateWithGoogleAsync(userEmail?: string, userName?: string): Promise<UserProfile> {
  try {
    const result = await firebaseSignInWithGoogle();
    const user = result.user;
    setCurrentUser(user);
    return user;
  } catch (error) {
    console.warn('Firebase Google Auth fallback to client mode:', error);
    // Graceful fallback for iframe/restricted environments
    return authenticateWithGoogle(userEmail, userName);
  }
}

// Synchronous helper for instant mock/offline login
export function authenticateWithGoogle(userEmail?: string, userName?: string): UserProfile {
  const email = userEmail || 'user@example.com';
  const name = userName || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const id = `google-${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  const allUsers = getRegisteredUsers();
  let user = allUsers[id];

  if (!user) {
    const defaultCredits = loadUserCredits();
    user = {
      id,
      email,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      provider: 'google',
      createdAt: Date.now(),
      credits: defaultCredits
    };
  } else {
    user.name = name;
  }

  allUsers[id] = user;
  saveRegisteredUsers(allUsers);
  setCurrentUser(user);
  return user;
}

// Log in or Sign up with Email & Password (Firebase-backed)
export async function authenticateWithEmailAsync(
  email: string,
  password: string,
  isSignUp: boolean,
  displayName?: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const result = await firebaseSignInWithEmail(email, password, isSignUp, displayName);
    const user = result.user;
    setCurrentUser(user);
    return { success: true, user };
  } catch (error: any) {
    console.warn('Firebase Email Auth fallback to client mode:', error);
    return authenticateWithEmail(email, password, isSignUp, displayName);
  }
}

// Synchronous helper
export function authenticateWithEmail(
  email: string,
  _password: string,
  isSignUp: boolean,
  displayName?: string
): { success: boolean; user?: UserProfile; error?: string } {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const id = `email-${email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
  const allUsers = getRegisteredUsers();
  let user = allUsers[id];

  if (isSignUp || !user) {
    const name = displayName?.trim() || email.split('@')[0];
    const defaultCredits = loadUserCredits();
    user = {
      id,
      email: email.trim().toLowerCase(),
      name,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      provider: 'email',
      createdAt: Date.now(),
      credits: defaultCredits
    };
    allUsers[id] = user;
    saveRegisteredUsers(allUsers);
  }

  setCurrentUser(user);
  return { success: true, user };
}

// Update current user's credits and persist to account and Firestore
export function syncUserCreditsToProfile(updatedCredits: UserCreditState): void {
  const current = getCurrentUser();
  if (current) {
    current.credits = updatedCredits;
    const allUsers = getRegisteredUsers();
    allUsers[current.id] = current;
    saveRegisteredUsers(allUsers);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(current));
    syncCreditsToFirestore(current.id, updatedCredits).catch(() => {});
  }
}
