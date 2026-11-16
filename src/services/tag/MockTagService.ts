import { distanceMeters, offset } from '@/domain/geo';
import type { Coordinate, TagStatus } from '@/domain/types';
import { SIMULATOR_ROUTES, SIMULATOR_START, type SimulatorRoute } from './simulatorRoutes';
import type { TagService, TagSimulator } from './TagService';

const GPS_NOISE_M = 5;
const THIEF_SPEED_MS = 4; // ~15 km/h

type Listener = (status: TagStatus) => void;

/** A route with the distance from its start to each point, for walking along it. */
type ActiveRoute = { points: Coordinate[]; cumulative: number[]; travelled: number };

function prepare(route: SimulatorRoute): ActiveRoute {
  const cumulative = [0];
  for (let i = 1; i < route.points.length; i++) {
    cumulative.push(cumulative[i - 1] + distanceMeters(route.points[i - 1], route.points[i]));
  }
  return { points: route.points, cumulative, travelled: 0 };
}

/** The point `meters` along the route, interpolated between its vertices. */
function pointAlong({ points, cumulative }: ActiveRoute, meters: number): Coordinate {
  let i = 1;
  while (i < points.length - 1 && cumulative[i] < meters) i++;
  const segment = cumulative[i] - cumulative[i - 1];
  const t = segment > 0 ? Math.min(1, Math.max(0, (meters - cumulative[i - 1]) / segment)) : 1;
  const a = points[i - 1];
  const b = points[i];
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  };
}

/**
 * Simulated tag, parked at Maarintie 8 with a little GPS noise. `simulateTheft()`
 * makes it ride away along one of three real routes (streets and bike paths).
 */
export class MockTagService implements TagService, TagSimulator {
  private listeners = new Set<Listener>();
  private timer: ReturnType<typeof setInterval> | null = null;
  /** Where the bike rests when not moving. */
  private anchor: Coordinate = SIMULATOR_START;
  private route: ActiveRoute | null = null;
  private status: TagStatus = {
    id: 'BKR-0001',
    name: 'Bikeritas tag',
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
    if (this.route) return;
    const pick = SIMULATOR_ROUTES[Math.floor(Math.random() * SIMULATOR_ROUTES.length)];
    this.anchor = SIMULATOR_START; // every route starts at Maarintie 8
    this.route = prepare(pick);
    this.tick(); // react immediately instead of on the next interval
  };

  /** Stops the bike where it is. */
  stopMovement = () => {
    if (!this.route) return;
    this.anchor = pointAlong(this.route, this.route.travelled);
    this.route = null;
    this.tick();
  };

  /** Puts the bike back at Maarintie 8, ready for the next demo. */
  reset = () => {
    this.route = null;
    this.anchor = SIMULATOR_START;
    this.tick();
  };

  private tick() {
    let position: Coordinate;
    let speedKmh = 0;
    if (this.route) {
      const route = this.route;
      route.travelled += (THIEF_SPEED_MS * this.intervalMs) / 1000;
      const length = route.cumulative[route.cumulative.length - 1];
      position = pointAlong(route, route.travelled);
      if (route.travelled >= length) {
        // Reached the end of the route: the bike stays there.
        this.anchor = position;
        this.route = null;
      } else {
        speedKmh = THIEF_SPEED_MS * 3.6;
      }
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
