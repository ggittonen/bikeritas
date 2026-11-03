import type { Coordinate } from './types';

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Great-circle distance in meters (haversine). */
export function distanceMeters(a: Coordinate, b: Coordinate): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Moves a point `meters` along `bearingDeg` (0 = north). Accurate enough for short distances. */
export function offset(from: Coordinate, bearingDeg: number, meters: number): Coordinate {
  const bearing = toRad(bearingDeg);
  const dLat = (meters * Math.cos(bearing)) / EARTH_RADIUS_M;
  const dLon = (meters * Math.sin(bearing)) / (EARTH_RADIUS_M * Math.cos(toRad(from.latitude)));
  return { latitude: from.latitude + toDeg(dLat), longitude: from.longitude + toDeg(dLon) };
}
