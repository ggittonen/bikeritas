export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type LocationFix = Coordinate & {
  timestamp: number;
  speedKmh: number;
};

/** Snapshot of the GPS tag hidden in the bike. */
export type TagStatus = {
  id: string;
  name: string;
  connected: boolean;
  /** null when the source can't report battery (e.g. phone GPS). */
  batteryPercent: number | null;
  charging: boolean;
  lastFix: LocationFix | null;
  /** Something the user should know, e.g. missing permission. Shown translated by the UI. */
  problem?: TagProblem;
};

export type TagProblem = {
  code:
    | 'permission'
    | 'no_location'
    | 'inaccurate'
    | 'backend_missing'
    | 'no_code'
    | 'not_found'
    | 'backend_lost'
    | 'stale';
  accuracyM?: number;
};

export type IncidentStatus = 'detected' | 'reporting' | 'police_notified';

/** Timeline entry. Stored as a kind (not text) so it can be shown in any language. */
export type IncidentEvent = {
  at: number;
  kind:
    | 'detected'
    | 'sent_to_support'
    | 'police_notified'
    | 'crime_report'
    | 'insurance_claim'
    | 'sharing_location'
    | 'report_failed';
  caseId?: string;
};

/** An unauthorized-movement episode, from detection until recovered or dismissed. */
export type Incident = {
  id: string;
  startedAt: number;
  status: IncidentStatus;
  path: Coordinate[];
  timeline: IncidentEvent[];
  supportCaseId?: string;
};
