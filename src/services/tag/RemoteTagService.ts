import type { TagStatus } from '@/domain/types';
import { formatBikeId, watchBike, type RemoteBikeDoc } from '../backend/bikeChannel';
import { backendConfigured } from '../backend/firebase';
import type { TagService } from './TagService';

/** No update for this long and we show the tag as disconnected. */
const STALE_AFTER_MS = 30_000;

type Listener = (status: TagStatus) => void;

/**
 * Owner side: follows a tag on another device through the backend.
 * Theft detection then runs on this phone exactly as with a local source.
 */
export class RemoteTagService implements TagService {
  private listeners = new Set<Listener>();
  private unwatch: (() => void) | null = null;
  private staleTimer: ReturnType<typeof setInterval> | null = null;
  private bike: RemoteBikeDoc | null = null;
  private status: TagStatus;

  constructor(private readonly bikeId: string | null) {
    this.status = {
      id: bikeId ? formatBikeId(bikeId) : '–',
      name: 'Pyörän tägi',
      connected: false,
      batteryPercent: null,
      charging: false,
      lastFix: null,
    };
  }

  start() {
    if (this.unwatch) return;
    if (!backendConfigured) return this.update({ problem: { code: 'backend_missing' } });
    if (!this.bikeId) return this.update({ problem: { code: 'no_code' } });

    this.unwatch = watchBike(
      this.bikeId,
      (bike) => {
        this.bike = bike;
        this.refresh();
      },
      () => this.update({ connected: false, problem: { code: 'backend_lost' } }),
    );
    // Re-check freshness even when no new data arrives.
    this.staleTimer = setInterval(() => this.refresh(), 5000);
  }

  stop() {
    this.unwatch?.();
    this.unwatch = null;
    if (this.staleTimer) clearInterval(this.staleTimer);
    this.staleTimer = null;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.status);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private refresh() {
    const bike = this.bike;
    if (!bike) {
      this.update({ connected: false, problem: { code: 'not_found' } });
      return;
    }
    const fresh = Date.now() - bike.updatedAt < STALE_AFTER_MS;
    this.update({
      connected: fresh,
      batteryPercent: bike.batteryPercent,
      lastFix: bike.lastFix,
      problem: fresh ? undefined : { code: 'stale' },
    });
  }

  private update(patch: Partial<TagStatus>) {
    // Only notify on real changes; the stale timer runs every few seconds.
    const next = { ...this.status, ...patch };
    const changed =
      next.lastFix?.timestamp !== this.status.lastFix?.timestamp ||
      next.connected !== this.status.connected ||
      next.problem?.code !== this.status.problem?.code ||
      next.batteryPercent !== this.status.batteryPercent;
    this.status = next;
    if (changed) this.listeners.forEach((l) => l(this.status));
  }
}
