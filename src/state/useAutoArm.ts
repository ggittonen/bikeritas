import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

import { distanceMeters } from '@/domain/geo';
import { AUTO_ARM_DISTANCE_M } from '@/domain/movementDetection';
import type { Coordinate } from '@/domain/types';

type Options = {
  /** Only true when the bike's tag is a different device from this phone. */
  enabled: boolean;
  bike: Coordinate | null;
  armed: boolean;
  onArm: () => void;
};

/**
 * Turns monitoring on when the owner walks away from the bike, so it can't be
 * forgotten (tester feedback). Arms only on the near → far transition, so
 * switching monitoring off by hand while away isn't immediately undone.
 * Returns the owner's distance to the bike in meters, or null if unknown.
 */
export function useAutoArm({ enabled, bike, armed, onArm }: Options): number | null {
  const [owner, setOwner] = useState<Coordinate | null>(null);
  const wasNear = useRef<boolean | null>(null);
  const onArmRef = useRef(onArm);
  useEffect(() => {
    onArmRef.current = onArm;
  });

  // Watch this phone's own location while the feature is on.
  useEffect(() => {
    if (!enabled) return;
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;
    (async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted || cancelled) return;
      const watch = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 10_000, distanceInterval: 10 },
        ({ coords }) => setOwner({ latitude: coords.latitude, longitude: coords.longitude }),
      );
      if (cancelled) watch.remove();
      else sub = watch;
    })().catch(() => {});
    return () => {
      cancelled = true;
      sub?.remove();
      wasNear.current = null; // start fresh next time, so re-enabling while away doesn't arm instantly
    };
  }, [enabled]);

  const distance = enabled && owner && bike ? distanceMeters(owner, bike) : null;

  useEffect(() => {
    if (distance === null) return;
    const near = distance <= AUTO_ARM_DISTANCE_M;
    if (wasNear.current === true && !near && !armed) onArmRef.current();
    wasNear.current = near;
  }, [distance, armed]);

  return distance;
}
