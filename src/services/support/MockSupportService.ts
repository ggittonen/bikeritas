import type { LocationFix } from '@/domain/types';
import type { SupportCase, SupportService, TheftReport } from './SupportService';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockSupportService implements SupportService {
  async reportTheft(report: TheftReport): Promise<SupportCase> {
    await wait(1500);
    return {
      caseId: `CASE-${report.incidentId.slice(-6).toUpperCase()}`,
      policeNotified: true,
      crimeReportFiled: true,
      insuranceClaimFiled: true,
    };
  }

  async shareLocation(_caseId: string, _fix: LocationFix): Promise<void> {
    // The real backend would forward this to the police in real time.
  }
}
