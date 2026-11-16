import { distanceMeters } from './geo';
import type { Coordinate } from './types';

/**
 * How far the bike may drift from where it was parked before we call it theft.
 * Must stay well above GPS noise (typically 5–15 m in cities).
 */
export const MOVEMENT_THRESHOLD_M = 30;

/**
 * Readings in a row that must be past the threshold before alerting. A single
 * GPS jump then can't cause a false alarm (a tester worry), at the cost of a
 * few seconds' delay.
 */
export const CONSECUTIVE_READINGS_REQUIRED = 2;

/**
 * Owner this far from the bike turns monitoring on automatically. Short enough to
 * catch "locked it outside the shop and went in"; GPS error on both devices can
 * occasionally trigger it while the owner is still close.
 */
export const AUTO_ARM_DISTANCE_M = 25;

/** Battery level that triggers a low-battery notification. */
export const LOW_BATTERY_PERCENT = 20;

export function isUnauthorizedMovement(parkedAt: Coordinate, current: Coordinate): boolean {
  return distanceMeters(parkedAt, current) > MOVEMENT_THRESHOLD_M;
}
