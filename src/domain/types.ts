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

/**
 * Identifying details saved at setup, so they don't have to be remembered in
 * the middle of a theft. Attached to the report automatically.
 */
export type BikeProfile = {
  make: string;
  model: string;
  color: string;
  frameNumber: string;
  /** Local image URIs. */
  photos: string[];
  receiptUri: string | null;
  /** Insurance company the claim goes to. Empty = no claim is filed. */
  insurer: string;
  policyNumber: string;
};

export const EMPTY_BIKE_PROFILE: BikeProfile = {
  make: '',
  model: '',
  color: '',
  frameNumber: '',
  photos: [],
  receiptUri: null,
  insurer: '',
  policyNumber: '',
};

/** How far customer service has got with one of the reports it files. */
export type ReportStage = 'sent' | 'received' | 'processing' | 'done';

export type ReportProgress = {
  crimeReport: ReportStage;
  /** null when no insurer is saved, so no claim was filed. */
  insuranceClaim: ReportStage | null;
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
    | 'report_failed'
    | 'self_report_opened';
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
  /** Set once customer service has the case. */
  progress?: ReportProgress;
};
