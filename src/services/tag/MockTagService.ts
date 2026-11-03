import { offset } from '@/domain/geo';
import type { Coordinate, TagStatus } from '@/domain/types';
import type { TagService, TagSimulator } from './TagService';

// Otaniemi, Espoo
const START: Coordinate = { latitude: 60.1867, longitude: 24.8277 };
const GPS_NOISE_M = 5;
const THIEF_SPEED_MS = 4; // ~15 km/h

type Listener = (status: TagStatus) => void;

/** Simulated tag: sits still with a little GPS noise until `simulateTheft()` makes it ride away. */
export class MockTagService implements TagService, TagSimulator {
  private listeners = new Set<Listener>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private anchor: Coordinate = START;
  private heading: number | null = null;
  private status: TagStatus = {
    id: 'BKR-0001',
    name: 'Oma pyörä',
    connected: false,
    batteryPercent: 87,
    charging: false,
    lastFix: null,
  };

  constructor(private readonly intervalMs = 3000) {}

  start() {
    if (this.timer) return;
    this.tick();
    this.timer = setInterval(() => this.tick(), this.intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.status);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Arrow functions so they can be passed straight to onPress without losing `this`.
  simulateTheft = () => {
    if (this.heading !== null) return;
    this.heading = Math.random() * 360;
    this.tick(); // react immediately instead of on the next interval
  };

  stopMovement = () => {
    if (this.heading === null) return;
    this.heading = null;
    this.tick();
  };

  private tick() {
    let position: Coordinate;
    let speedKmh = 0;
    if (this.heading !== null) {
      this.heading += (Math.random() - 0.5) * 30;
      this.anchor = offset(this.anchor, this.heading, (THIEF_SPEED_MS * this.intervalMs) / 1000);
      position = this.anchor;
      speedKmh = THIEF_SPEED_MS * 3.6;
    } else {
      position = offset(this.anchor, Math.random() * 360, Math.random() * GPS_NOISE_M);
    }

    this.status = {
      ...this.status,
      connected: true,
      batteryPercent: Math.max(0, (this.status.batteryPercent ?? 100) - 0.02),
      lastFix: { ...position, timestamp: Date.now(), speedKmh },
    };
    this.listeners.forEach((l) => l(this.status));
  }
}
