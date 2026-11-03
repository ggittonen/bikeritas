import type { TagStatus } from '@/domain/types';

/**
 * Connection to the bike's GPS tag. The app only depends on this interface,
 * so the mock can be swapped for the real tag backend (BLE / LTE-M / cloud API)
 * in `src/services/index.ts` without touching the UI.
 */
export interface TagService {
  start(): void;
  stop(): void;
  /** Calls `listener` immediately with the current status and on every update. Returns unsubscribe. */
  subscribe(listener: (status: TagStatus) => void): () => void;
}

/** Extra controls only the simulator has, used for demos and user testing. */
export interface TagSimulator {
  simulateTheft(): void;
  stopMovement(): void;
}
