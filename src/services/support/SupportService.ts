import type { BikeProfile, Coordinate, LocationFix, ReportProgress } from '@/domain/types';

export type TheftReport = {
  incidentId: string;
  tagId: string;
  startedAt: number;
  path: Coordinate[];
  /** Details saved at setup: make, model, frame number, photos, receipt. */
  profile: BikeProfile;
};

export type SupportCase = {
  caseId: string;
  policeNotified: boolean;
  crimeReportFiled: boolean;
  insuranceClaimFiled: boolean;
};

/**
 * Bikeritas customer service (part of the monthly subscription). Only after the
 * owner confirms a theft does it notify the police, file the crime report and
 * insurance claim on the customer's behalf, and forward the live location.
 */
export interface SupportService {
  reportTheft(report: TheftReport): Promise<SupportCase>;
  shareLocation(caseId: string, fix: LocationFix): Promise<void>;
  /** Follows how the crime report and insurance claim progress. Returns unsubscribe. */
  watchProgress(caseId: string, onChange: (progress: ReportProgress) => void): () => void;
}
