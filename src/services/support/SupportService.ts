import type { Coordinate, LocationFix } from '@/domain/types';

export type TheftReport = {
  incidentId: string;
  tagId: string;
  bikeName: string;
  startedAt: number;
  path: Coordinate[];
};

export type SupportCase = {
  caseId: string;
  policeNotified: boolean;
  crimeReportFiled: boolean;
  insuranceClaimFiled: boolean;
};

/**
 * Bikeritas customer service (part of the monthly subscription). On a theft it
 * notifies the police, files the crime report and insurance claim on the
 * customer's behalf, and forwards the live location to the authorities.
 */
export interface SupportService {
  reportTheft(report: TheftReport): Promise<SupportCase>;
  shareLocation(caseId: string, fix: LocationFix): Promise<void>;
}
