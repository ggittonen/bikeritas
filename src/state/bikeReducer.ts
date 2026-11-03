import { isUnauthorizedMovement } from '@/domain/movementDetection';
import type { Coordinate, Incident, IncidentStatus, LocationFix, TagStatus } from '@/domain/types';
import type { TagSourceId } from '@/services';

/** The part of the state that survives app restarts. */
export type PersistedState = {
  tagSource: TagSourceId;
  armed: boolean;
  parkedAt: Coordinate | null;
  subscriptionActive: boolean;
};

export type BikeState = PersistedState & {
  hydrated: boolean;
  tag: TagStatus | null;
  incident: Incident | null;
};

export type BikeAction =
  | { type: 'hydrate'; persisted: Partial<PersistedState> }
  | { type: 'tagUpdate'; status: TagStatus }
  | { type: 'arm'; at: Coordinate }
  | { type: 'disarm' }
  | { type: 'setSubscription'; active: boolean }
  | { type: 'setTagSource'; source: TagSourceId }
  | { type: 'incidentProgress'; message: string; status?: IncidentStatus; supportCaseId?: string }
  | { type: 'incidentClosed' };

export const initialBikeState: BikeState = {
  hydrated: false,
  tagSource: 'simulator',
  tag: null,
  armed: false,
  parkedAt: null,
  subscriptionActive: false,
  incident: null,
};

function newIncident(parkedAt: Coordinate, fix: LocationFix): Incident {
  return {
    id: `inc-${fix.timestamp.toString(36)}`,
    startedAt: fix.timestamp,
    status: 'detected',
    path: [parkedAt, fix],
    timeline: [{ at: fix.timestamp, message: 'Luvaton liike havaittu' }],
  };
}

export function bikeReducer(state: BikeState, action: BikeAction): BikeState {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.persisted, hydrated: true };

    case 'tagUpdate': {
      const fix = action.status.lastFix;
      let incident = state.incident;
      if (fix && incident) {
        incident = { ...incident, path: [...incident.path, fix] };
      } else if (fix && state.armed && state.parkedAt && isUnauthorizedMovement(state.parkedAt, fix)) {
        incident = newIncident(state.parkedAt, fix);
      }
      return { ...state, tag: action.status, incident };
    }

    case 'arm':
      return { ...state, armed: true, parkedAt: action.at };

    case 'disarm':
      return { ...state, armed: false, parkedAt: null };

    case 'setSubscription':
      return { ...state, subscriptionActive: action.active };

    case 'setTagSource':
      // A new source means a new position: reset monitoring so it can't fire a false alarm.
      return { ...state, tagSource: action.source, tag: null, armed: false, parkedAt: null, incident: null };

    case 'incidentProgress': {
      if (!state.incident) return state;
      const { message, status, supportCaseId } = action;
      return {
        ...state,
        incident: {
          ...state.incident,
          status: status ?? state.incident.status,
          supportCaseId: supportCaseId ?? state.incident.supportCaseId,
          timeline: [...state.incident.timeline, { at: Date.now(), message }],
        },
      };
    }

    case 'incidentClosed':
      return { ...state, incident: null, armed: false, parkedAt: null };
  }
}
