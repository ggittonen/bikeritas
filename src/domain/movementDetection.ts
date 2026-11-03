import { distanceMeters } from './geo';
import type { Coordinate } from './types';

/**
 * How far the bike may drift from where it was parked before we call it theft.
 * Must stay well above GPS noise (typically 5–15 m in cities).
 */
export const MOVEMENT_THRESHOLD_M = 30;

export function isUnauthorizedMovement(parkedAt: Coordinate, current: Coordinate): boolean {
  return distanceMeters(parkedAt, current) > MOVEMENT_THRESHOLD_M;
}
