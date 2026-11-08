import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateBikeId } from './bikeChannel';

const KEY = 'bikeritas/ownTagId/v1';

/** This device's pairing code when used as a tag. Created once and kept, so pairing survives restarts. */
export async function getOrCreateOwnTagId(): Promise<string> {
  const existing = await AsyncStorage.getItem(KEY).catch(() => null);
  if (existing) return existing;
  const id = generateBikeId();
  await AsyncStorage.setItem(KEY, id).catch(() => {});
  return id;
}
