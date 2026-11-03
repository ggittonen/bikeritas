import * as Location from 'expo-location';

import type { TagStatus } from '@/domain/types';
import type { TagService } from './TagService';

/**
 * Fixes worse than this are dropped: indoor GPS can jump tens of meters,
 * which would otherwise trigger false theft alarms.
 */
const MAX_ACCURACY_M = 30;

type Listener = (status: TagStatus) => void;

/**
 * Uses this phone's own GPS as the "tag". Handy for prototype tests:
 * put a phone in the bike bag and ride. Works only while the app is open.
 */
export class PhoneLocationTagService implements TagService {
  private listeners = new Set<Listener>();
  private watch: Location.LocationSubscription | null = null;
  private running = false;
  private status: TagStatus = {
    id: 'PHONE-GPS',
    name: 'Puhelimen GPS',
    connected: false,
    batteryPercent: null,
    charging: false,
    lastFix: null,
  };

  start() {
    if (this.running) return;
    this.running = true;
    this.begin().catch(() => this.update({ connected: false, error: 'Sijaintia ei saatu' }));
  }

  stop() {
    this.running = false;
    this.watch?.remove();
    this.watch = null;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.status);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async begin() {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      this.update({ connected: false, error: 'Sijaintilupa puuttuu – salli sijainti asetuksista' });
      return;
    }
    const watch = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 0 },
      ({ coords, timestamp }) => {
        if (coords.accuracy != null && coords.accuracy > MAX_ACCURACY_M) return;
        this.update({
          connected: true,
          error: undefined,
          lastFix: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            timestamp,
            speedKmh: Math.max(0, coords.speed ?? 0) * 3.6,
          },
        });
      },
    );
    // stop() may have been called while we were awaiting permission.
    if (this.running) this.watch = watch;
    else watch.remove();
  }

  private update(patch: Partial<TagStatus>) {
    this.status = { ...this.status, ...patch };
    this.listeners.forEach((l) => l(this.status));
  }
}
