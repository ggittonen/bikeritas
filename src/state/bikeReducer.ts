import { CONSECUTIVE_READINGS_REQUIRED, isUnauthorizedMovement } from '@/domain/movementDetection';
import {
  EMPTY_BIKE_PROFILE,
  type BikeProfile,
  type Coordinate,
  type Incident,
  type IncidentEvent,
  type IncidentStatus,
  type LocationFix,
  type ReportProgress,
  type TagStatus,
} from '@/domain/types';
import type { TagSourceId } from '@/services';

/** The part of the state that survives app restarts. */
export type PersistedState = {
  tagSource: TagSourceId;
  /** Pairing code of the tag followed when tagSource is 'remote'. */
  remoteBikeId: string | null;
  armed: boolean;
  parkedAt: Coordinate | null;
  subscriptionActive: boolean;
  profile: BikeProfile;
  /** The bike-details step has been completed or skipped. */
  setupDone: boolean;
  /** Turn monitoring on when the owner walks away from the bike. */
  autoArm: boolean;
};

export type BikeState = PersistedState & {
  hydrated: boolean;
  tag: TagStatus | null;
  incident: Incident | null;
  /** Readings in a row past the movement threshold (false-alarm filter). */
  outsideStreak: number;
  /**
   * Monitoring is on by default: arm at the first location we get. Cleared once
   * armed, when the owner turns it off by hand, or when a saved choice exists.
   */
  armOnFirstFix: boolean;
};

export type BikeAction =
  | { type: 'hydrate'; persisted: Partial<PersistedState> }
  | { type: 'tagUpdate'; status: TagStatus }
  | { type: 'arm'; at: Coordinate }
  | { type: 'disarm' }
  | { type: 'setSubscription'; active: boolean }
  | { type: 'setTagSource'; source: TagSourceId; remoteBikeId?: string }
  | { type: 'setProfile'; profile: BikeProfile }
  | { type: 'setAutoArm'; enabled: boolean }
  | { type: 'incidentProgress'; event: IncidentEvent['kind']; status?: IncidentStatus; supportCaseId?: string }
  | { type: 'reportProgress'; progress: ReportProgress }
  | { type: 'incidentClosed' };

export const initialBikeState: BikeState = {
  hydrated: false,
  tagSource: 'simulator',
  remoteBikeId: null,
  tag: null,
  armed: false,
  parkedAt: null,
  subscriptionActive: false,
  profile: EMPTY_BIKE_PROFILE,
  setupDone: false,
  autoArm: true,
  incident: null,
  outsideStreak: 0,
  armOnFirstFix: true,
};

function newIncident(parkedAt: Coordinate, fix: LocationFix): Incident {
  return {
    id: `inc-${fix.timestamp.toString(36)}`,
    startedAt: fix.timestamp,
    status: 'detected',
    path: [parkedAt, fix],
    timeline: [{ at: fix.timestamp, kind: 'detected' }],
  };
}

export function bikeReducer(state: BikeState, action: BikeAction): BikeState {
  switch (action.type) {
    case 'hydrate':
      // A remembered on/off choice wins over the default.
      return {
        ...state,
        ...action.persisted,
        hydrated: true,
        armOnFirstFix: action.persisted.armed === undefined,
      };

    case 'tagUpdate': {
      const fix = action.status.lastFix;
      // Status-only updates (battery, connection) repeat the old fix; don't count them twice.
      const isNewFix = fix?.timestamp !== state.tag?.lastFix?.timestamp;
      let { incident, outsideStreak, armed, parkedAt, armOnFirstFix } = state;
      if (fix && armOnFirstFix && !armed && !incident) {
        // Default-on monitoring: the bike is parked where we first see it.
        armed = true;
        parkedAt = { latitude: fix.latitude, longitude: fix.longitude };
        armOnFirstFix = false;
        return { ...state, tag: action.status, armed, parkedAt, armOnFirstFix, outsideStreak: 0 };
      }
      if (fix && isNewFix) {
        if (incident) {
          // Once the police have the bike, the route is complete.
          if (incident.status !== 'recovered_by_police') {
            incident = { ...incident, path: [...incident.path, fix] };
          }
        } else if (state.armed && state.parkedAt) {
          outsideStreak = isUnauthorizedMovement(state.parkedAt, fix) ? outsideStreak + 1 : 0;
          if (outsideStreak >= CONSECUTIVE_READINGS_REQUIRED) {
            incident = newIncident(state.parkedAt, fix);
            outsideStreak = 0;
          }
        }
      }
      return { ...state, tag: action.status, incident, outsideStreak };
    }

    case 'arm':
      return { ...state, armed: true, parkedAt: action.at, outsideStreak: 0, armOnFirstFix: false };

    case 'disarm':
      return { ...state, armed: false, parkedAt: null, outsideStreak: 0, armOnFirstFix: false };

    case 'setSubscription':
      return { ...state, subscriptionActive: action.active };

    case 'setTagSource':
      // A new source means a new position: reset monitoring so it can't fire a false alarm.
      return {
        ...state,
        tagSource: action.source,
        remoteBikeId: action.remoteBikeId ?? state.remoteBikeId,
        tag: null,
        armed: false,
        parkedAt: null,
        incident: null,
        outsideStreak: 0,
        armOnFirstFix: true, // the new source starts with monitoring on, too
      };

    case 'setProfile':
      return { ...state, profile: action.profile, setupDone: true };

    case 'setAutoArm':
      return { ...state, autoArm: action.enabled };

    case 'incidentProgress': {
      if (!state.incident) return state;
      const { event, status, supportCaseId } = action;
      return {
        ...state,
        incident: {
          ...state.incident,
          status: status ?? state.incident.status,
          supportCaseId: supportCaseId ?? state.incident.supportCaseId,
          timeline: [...state.incident.timeline, { at: Date.now(), kind: event, caseId: supportCaseId }],
        },
      };
    }

    case 'reportProgress': {
      if (!state.incident) return state;
      const incident = { ...state.incident, progress: action.progress };
      // The police found the bike: the theft is over, the owner just acknowledges it.
      if (action.progress.bikeRecovered && incident.status !== 'recovered_by_police') {
        incident.status = 'recovered_by_police';
        incident.timeline = [...incident.timeline, { at: Date.now(), kind: 'police_recovered' }];
      }
      return { ...state, incident };
    }

    case 'incidentClosed':
      // Stays off: re-arming right away would alarm again while the owner moves the bike.
      return { ...state, incident: null, armed: false, parkedAt: null, outsideStreak: 0, armOnFirstFix: false };
  }
}
