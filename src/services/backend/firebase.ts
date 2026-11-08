import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Values come from .env.local (see .env.example). Expo only inlines
// variables that are written out literally as process.env.EXPO_PUBLIC_*.
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const backendConfigured = Boolean(config.apiKey && config.projectId && config.appId);

/** null when Firebase isn't configured – the app then works on one phone only. */
export const db: Firestore | null = backendConfigured
  ? getFirestore(getApps()[0] ?? initializeApp(config))
  : null;
