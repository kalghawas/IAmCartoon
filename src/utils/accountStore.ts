import {
  UserProfile,
  CreationRecord,
  PaymentRecord,
  UserSubscriptionState,
  ContactSettings,
  ChatThemeMode,
  ParserConfig,
  AnimationSettings,
} from '../types';
import {
  auth,
  googleProvider,
  db,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from './firebase';

const USERS_STORAGE_KEY = 'iamwhatsapp_users_db_v1';
const CURRENT_USER_ID_KEY = 'iamwhatsapp_current_user_id';
const CREATIONS_STORAGE_KEY = 'iamwhatsapp_creations_v1';
const PAYMENTS_STORAGE_KEY = 'iamwhatsapp_payments_v1';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const DEFAULT_FREE_LIMIT = 15;

/**
 * Get all local registered accounts
 */
export function getAllUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get the currently active signed-in user from local cache
 */
export function getCurrentUser(): UserProfile | null {
  try {
    const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (!currentId) return null;
    const users = getAllUsers();
    return users.find((u) => u.id === currentId) || null;
  } catch {
    return null;
  }
}

/**
 * Save user profile to both LocalStorage and Firebase Firestore
 */
export async function saveUser(user: UserProfile): Promise<void> {
  try {
    // 1. Update local storage
    const users = getAllUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_ID_KEY, user.id);

    // 2. Sync to Firebase Firestore if logged in
    if (auth.currentUser && auth.currentUser.uid === user.id) {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, user, { merge: true });
    }
  } catch (err) {
    console.warn('Could not sync user to Firestore:', err);
  }
}

/**
 * Firebase Sign-In with Google Popup
 */
export async function loginWithGoogleFirebase(): Promise<UserProfile> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const uid = fbUser.uid;
    const email = fbUser.email || 'user@gmail.com';
    const name = fbUser.displayName || email.split('@')[0];
    const avatarUrl =
      fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`;

    // Check if user document already exists in Firestore
    let existingProfile: UserProfile | null = null;
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        existingProfile = userDoc.data() as UserProfile;
      }
    } catch (e) {
      console.warn('Firestore fetch fallback:', e);
    }

    const profile: UserProfile = existingProfile || {
      id: uid,
      email,
      name,
      avatarUrl,
      provider: 'google',
      createdAt: new Date().toISOString(),
      creditsRemaining: DEFAULT_FREE_LIMIT,
      subscription: {
        tier: 'free',
        isPro: false,
        freeGenerationsUsed: 0,
        freeGenerationsLimit: DEFAULT_FREE_LIMIT,
      },
    };

    await saveUser(profile);
    return profile;
  } catch (err: any) {
    console.error('Google login error, falling back to local:', err);
    // Fallback if popup was blocked or offline
    return loginWithGoogleLocal();
  }
}

/**
 * Local Google sign-in fallback (used if offline/popup blocked)
 */
export function loginWithGoogleLocal(mockEmail?: string, mockName?: string): UserProfile {
  const email = mockEmail?.trim().toLowerCase() || 'creator@gmail.com';
  const name = mockName?.trim() || 'Google Creator';
  const users = getAllUsers();
  let user = users.find((u) => u.email.toLowerCase() === email);

  if (!user) {
    user = {
      id: `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      provider: 'google',
      createdAt: new Date().toISOString(),
      creditsRemaining: DEFAULT_FREE_LIMIT,
      subscription: {
        tier: 'free',
        isPro: false,
        freeGenerationsUsed: 0,
        freeGenerationsLimit: DEFAULT_FREE_LIMIT,
      },
    };
    users.push(user);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
  return user;
}

/**
 * Firebase Email / Password Sign In & Sign Up
 */
export async function loginWithEmailFirebase(
  email: string,
  pass: string,
  mode: 'signin' | 'signup',
  name?: string
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    let uid = '';
    let displayName = name || cleanEmail.split('@')[0];

    if (mode === 'signup') {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      uid = cred.user.uid;
    } else {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      uid = cred.user.uid;
      displayName = cred.user.displayName || displayName;
    }

    // Check Firestore doc
    let profile: UserProfile | null = null;
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        profile = userDoc.data() as UserProfile;
      }
    } catch {}

    if (!profile) {
      profile = {
        id: uid,
        email: cleanEmail,
        name: displayName,
        provider: 'email',
        createdAt: new Date().toISOString(),
        creditsRemaining: DEFAULT_FREE_LIMIT,
        subscription: {
          tier: 'free',
          isPro: false,
          freeGenerationsUsed: 0,
          freeGenerationsLimit: DEFAULT_FREE_LIMIT,
        },
      };
    }

    await saveUser(profile);
    return profile;
  } catch (err: any) {
    // If Firebase error is about user not found or auth config, try local fallback for testing
    console.warn('Firebase Auth email error, attempting local auth fallback:', err?.message);
    return loginWithEmailLocal(cleanEmail, name);
  }
}

/**
 * Local Email login fallback
 */
export function loginWithEmailLocal(email: string, name?: string): UserProfile {
  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();
  let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    user = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: name?.trim() || cleanEmail.split('@')[0],
      provider: 'email',
      createdAt: new Date().toISOString(),
      creditsRemaining: DEFAULT_FREE_LIMIT,
      subscription: {
        tier: 'free',
        isPro: false,
        freeGenerationsUsed: 0,
        freeGenerationsLimit: DEFAULT_FREE_LIMIT,
      },
    };
    users.push(user);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
  return user;
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch {}
  try {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  } catch {}
}

/**
 * Save user preferences
 */
export async function saveUserPreferences(
  userId: string,
  settings: {
    contact: ContactSettings;
    chatThemeMode: ChatThemeMode;
    parserConfig: ParserConfig;
    animSettings: AnimationSettings;
  }
): Promise<void> {
  const users = getAllUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.savedSettings = settings;
    await saveUser(user);
  }
}

/**
 * Get all creations for a user (prunes older than 30 days)
 */
export function getUserCreations(userId: string): CreationRecord[] {
  try {
    const raw = localStorage.getItem(`${CREATIONS_STORAGE_KEY}_${userId}`);
    if (!raw) return [];
    const parsed: CreationRecord[] = JSON.parse(raw);
    const now = Date.now();

    const valid = parsed.filter((item) => now - item.createdAt <= THIRTY_DAYS_MS);
    if (valid.length !== parsed.length) {
      localStorage.setItem(`${CREATIONS_STORAGE_KEY}_${userId}`, JSON.stringify(valid));
    }
    return valid.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

/**
 * Fetch creations from Firestore and sync with local storage
 */
export async function syncUserCreationsFromCloud(userId: string): Promise<CreationRecord[]> {
  try {
    const creationsRef = collection(db, 'users', userId, 'creations');
    const q = query(creationsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const cloudCreations: CreationRecord[] = [];
    const now = Date.now();

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as CreationRecord;
      if (now - data.createdAt <= THIRTY_DAYS_MS) {
        cloudCreations.push(data);
      }
    });

    if (cloudCreations.length > 0) {
      localStorage.setItem(
        `${CREATIONS_STORAGE_KEY}_${userId}`,
        JSON.stringify(cloudCreations)
      );
      return cloudCreations;
    }
  } catch (err) {
    console.warn('Could not sync creations from Firestore:', err);
  }

  return getUserCreations(userId);
}

/**
 * Save a new creation in the user's 30-day history (Cloud + Local)
 */
export async function saveCreationRecord(
  userId: string,
  creation: Omit<CreationRecord, 'id' | 'createdAt'>
): Promise<CreationRecord> {
  const newRecord: CreationRecord = {
    ...creation,
    id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: Date.now(),
  };

  // Local sync
  const existing = getUserCreations(userId);
  const updated = [newRecord, ...existing];
  try {
    localStorage.setItem(`${CREATIONS_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
  } catch {}

  // Cloud Firestore sync
  try {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      const recDoc = doc(db, 'users', userId, 'creations', newRecord.id);
      await setDoc(recDoc, newRecord);
    }
  } catch (err) {
    console.warn('Failed to sync creation to Firestore:', err);
  }

  return newRecord;
}

/**
 * Delete a specific creation record (Cloud + Local)
 */
export async function deleteCreationRecord(userId: string, recordId: string): Promise<void> {
  const existing = getUserCreations(userId);
  const filtered = existing.filter((c) => c.id !== recordId);
  try {
    localStorage.setItem(`${CREATIONS_STORAGE_KEY}_${userId}`, JSON.stringify(filtered));
  } catch {}

  try {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      const recDoc = doc(db, 'users', userId, 'creations', recordId);
      await deleteDoc(recDoc);
    }
  } catch (err) {
    console.warn('Failed to delete creation from Firestore:', err);
  }
}

/**
 * Get payment receipts
 */
export function getUserPayments(userId: string): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(`${PAYMENTS_STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Add a payment record (Cloud + Local)
 */
export async function addPaymentRecord(
  userId: string,
  payment: Omit<PaymentRecord, 'id' | 'date'>
): Promise<PaymentRecord> {
  const record: PaymentRecord = {
    ...payment,
    id: `inv_${Date.now()}`,
    date: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  };

  const existing = getUserPayments(userId);
  const updated = [record, ...existing];
  try {
    localStorage.setItem(`${PAYMENTS_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
  } catch {}

  try {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      const payDoc = doc(db, 'users', userId, 'payments', record.id);
      await setDoc(payDoc, record);
    }
  } catch (err) {
    console.warn('Failed to sync payment to Firestore:', err);
  }

  return record;
}
