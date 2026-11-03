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
  batteryPercent: number;
  charging: boolean;
  lastFix: LocationFix | null;
};

export type IncidentStatus = 'detected' | 'reporting' | 'police_notified';

export type IncidentEvent = {
  at: number;
  message: string;
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
