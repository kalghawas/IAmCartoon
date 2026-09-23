import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, UserCreditState, HistoryItem } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Sign in or sign up with Google Popup (with fallback)
 */
export async function firebaseSignInWithGoogle(): Promise<{ user: UserProfile; isNewUser: boolean }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    const userProfile: UserProfile = {
      id: fbUser.uid,
      email: fbUser.email || '',
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Cartoonist',
      avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.uid)}`,
      provider: 'google',
      createdAt: Date.now(),
      credits: {
        freeCreditsRemaining: 3,
        purchasedCredits: 0,
        lastMonthlyReset: Date.now(),
        unlockedImageIds: []
      }
    };

    // Check existing Firestore doc
    const userDocRef = doc(db, 'users', fbUser.uid);
    const existingDoc = await getDoc(userDocRef);

    if (existingDoc.exists()) {
      const data = existingDoc.data();
      userProfile.credits = {
        freeCreditsRemaining: data.freeCreditsRemaining ?? 3,
        purchasedCredits: data.purchasedCredits ?? 0,
        lastMonthlyReset: data.lastMonthlyReset ?? Date.now(),
        unlockedImageIds: data.unlockedImageIds ?? []
      };
      // Update profile info
      await setDoc(
        userDocRef,
        {
          displayName: userProfile.name,
          email: userProfile.email,
          photoURL: userProfile.avatarUrl,
          updatedAt: Date.now()
        },
        { merge: true }
      );
      return { user: userProfile, isNewUser: false };
    } else {
      // Create new user in Firestore
      await setDoc(userDocRef, {
        uid: fbUser.uid,
        email: userProfile.email,
        displayName: userProfile.name,
        photoURL: userProfile.avatarUrl,
        provider: 'google',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        freeCreditsRemaining: 3,
        purchasedCredits: 0,
        lastMonthlyReset: Date.now(),
        unlockedImageIds: []
      });
      return { user: userProfile, isNewUser: true };
    }
  } catch (error) {
    console.error('Firebase Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Sign in or sign up with Email & Password
 */
export async function firebaseSignInWithEmail(
  email: string,
  pass: string,
  isSignUp: boolean,
  displayName?: string
): Promise<{ user: UserProfile; isNewUser: boolean }> {
  try {
    let fbUser: User;

    if (isSignUp) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass || 'cartoon123456');
      fbUser = cred.user;
      if (displayName) {
        await updateProfile(fbUser, { displayName });
      }
    } else {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass || 'cartoon123456');
        fbUser = cred.user;
      } catch (err: any) {
        // If user not found during mock/testing, auto-register smoothly
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          const cred = await createUserWithEmailAndPassword(auth, email, pass || 'cartoon123456');
          fbUser = cred.user;
        } else {
          throw err;
        }
      }
    }

    const name = displayName?.trim() || fbUser.displayName || email.split('@')[0];
    const userProfile: UserProfile = {
      id: fbUser.uid,
      email: fbUser.email || email,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.uid)}`,
      provider: 'email',
      createdAt: Date.now(),
      credits: {
        freeCreditsRemaining: 3,
        purchasedCredits: 0,
        lastMonthlyReset: Date.now(),
        unlockedImageIds: []
      }
    };

    const userDocRef = doc(db, 'users', fbUser.uid);
    const existingDoc = await getDoc(userDocRef);

    if (existingDoc.exists()) {
      const data = existingDoc.data();
      userProfile.credits = {
        freeCreditsRemaining: data.freeCreditsRemaining ?? 3,
        purchasedCredits: data.purchasedCredits ?? 0,
        lastMonthlyReset: data.lastMonthlyReset ?? Date.now(),
        unlockedImageIds: data.unlockedImageIds ?? []
      };
      await setDoc(userDocRef, { updatedAt: Date.now() }, { merge: true });
      return { user: userProfile, isNewUser: false };
    } else {
      await setDoc(userDocRef, {
        uid: fbUser.uid,
        email: userProfile.email,
        displayName: userProfile.name,
        photoURL: userProfile.avatarUrl,
        provider: 'email',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        freeCreditsRemaining: 3,
        purchasedCredits: 0,
        lastMonthlyReset: Date.now(),
        unlockedImageIds: []
      });
      return { user: userProfile, isNewUser: true };
    }
  } catch (error) {
    console.error('Firebase Email Sign-In Error:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function firebaseSignOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.error('Firebase Sign-Out Error:', e);
  }
}

/**
 * Sync user credit balance directly to Firestore
 */
export async function syncCreditsToFirestore(userId: string, credits: UserCreditState): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        freeCreditsRemaining: credits.freeCreditsRemaining,
        purchasedCredits: credits.purchasedCredits,
        lastMonthlyReset: credits.lastMonthlyReset,
        unlockedImageIds: credits.unlockedImageIds,
        updatedAt: Date.now()
      },
      { merge: true }
    );
  } catch (e) {
    console.error('Failed to sync credits to Firestore:', e);
  }
}

/**
 * Save generated character creation to user's 30-day Firestore storage
 */
export async function saveCreationToFirestore(
  userId: string,
  creation: HistoryItem
): Promise<void> {
  try {
    const creationDocRef = doc(db, 'users', userId, 'creations', creation.id);
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    await setDoc(creationDocRef, {
      id: creation.id,
      userId,
      generatedImage: creation.generatedImage,
      originalImage: creation.originalImage,
      artStyle: creation.artStyle,
      pose: creation.pose,
      wardrobe: creation.wardrobe,
      customWardrobeText: creation.customWardrobeText || '',
      expression: creation.expression,
      seed: creation.seed,
      promptUsed: creation.promptUsed,
      aspectRatio: creation.aspectRatio,
      durationMs: creation.durationMs,
      isMock: creation.isMock,
      timestamp: creation.timestamp,
      expiresAt: creation.timestamp + THIRTY_DAYS_MS
    });
  } catch (e) {
    console.error('Failed to save creation to Firestore:', e);
  }
}

/**
 * Load user's 30-day creation history from Firestore
 */
export async function loadCreationsFromFirestore(userId: string): Promise<HistoryItem[]> {
  try {
    const creationsRef = collection(db, 'users', userId, 'creations');
    const now = Date.now();
    // Fetch user creations
    const snapshot = await getDocs(creationsRef);
    const items: HistoryItem[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Enforce 30-day retention filter
      if (!data.expiresAt || data.expiresAt > now) {
        items.push({
          id: data.id,
          originalImage: data.originalImage || '',
          generatedImage: data.generatedImage || '',
          artStyle: data.artStyle || 'pixar-3d',
          pose: data.pose || 'neutral-portrait',
          wardrobe: data.wardrobe || 'casual-hoodie',
          customWardrobeText: data.customWardrobeText,
          expression: data.expression || 'warm-smile',
          seed: data.seed || 12345,
          promptUsed: data.promptUsed || '',
          aspectRatio: data.aspectRatio || '1:1',
          durationMs: data.durationMs || 1000,
          isMock: data.isMock || false,
          timestamp: data.timestamp || Date.now(),
          expiresAt: data.expiresAt
        });
      }
    });

    // Sort newest first
    return items.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    console.error('Failed to load creations from Firestore:', e);
    return [];
  }
}

/**
 * Prepared Payment Gateway Intent Helper
 * Ready to receive webhooks when Stripe/payment gateway is added.
 */
export async function recordPaymentIntent(
  userId: string,
  planId: string,
  amount: number,
  currency: string,
  creditsAdded: number
): Promise<string> {
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  try {
    const paymentDocRef = doc(db, 'payments', paymentId);
    await setDoc(paymentDocRef, {
      id: paymentId,
      userId,
      planId,
      amount,
      currency,
      creditsAdded,
      status: 'completed',
      createdAt: Date.now()
    });
  } catch (e) {
    console.error('Failed to record payment intent:', e);
  }
  return paymentId;
}
