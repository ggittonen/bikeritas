import { doc, onSnapshot, setDoc } from 'firebase/firestore';

import type { LocationFix, TagStatus } from '@/domain/types';
import { db } from './firebase';

/**
 * One Firestore document per bike: bikes/{bikeId}. The tag (for now a phone
 * on the bike, later the real GPS tag) writes it; the owner's phone listens.
 */
export type RemoteBikeDoc = {
  name: string;
  batteryPercent: number | null;
  lastFix: LocationFix | null;
  updatedAt: number;
};

// No 0/O/1/I so the code is easy to read out and type.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const BIKE_ID_LENGTH = 8;

export function generateBikeId(): string {
  let id = '';
  for (let i = 0; i < BIKE_ID_LENGTH; i++) id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return id;
}

/** Accepts "ab3k-9xq2", "AB3K 9XQ2" etc. Returns null if it can't be a valid code. */
export function normalizeBikeId(input: string): string | null {
  const id = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return id.length === BIKE_ID_LENGTH && [...id].every((c) => ALPHABET.includes(c)) ? id : null;
}

export const formatBikeId = (id: string) => `${id.slice(0, 4)}-${id.slice(4)}`;

function requireDb() {
  if (!db) throw new Error('Firebase is not configured (.env.local)');
  return db;
}

export async function publishTagStatus(bikeId: string, status: TagStatus): Promise<void> {
  // Firestore rejects `undefined`, so build the document explicitly.
  const data: RemoteBikeDoc = {
    name: status.name,
    batteryPercent: status.batteryPercent,
    lastFix: status.lastFix,
    updatedAt: Date.now(),
  };
  await setDoc(doc(requireDb(), 'bikes', bikeId), data);
}

/** Calls `onChange` with the bike's document (null if no tag has used this code yet). */
export function watchBike(
  bikeId: string,
  onChange: (bike: RemoteBikeDoc | null) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    doc(requireDb(), 'bikes', bikeId),
    (snap) => onChange(snap.exists() ? (snap.data() as RemoteBikeDoc) : null),
    onError,
  );
}
