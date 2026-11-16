import type { LocationFix, ReportProgress } from '@/domain/types';
import type { SupportCase, SupportService, TheftReport } from './SupportService';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Demo timeline: how both reports advance, a few seconds per step. */
const DEMO_STEPS: ReportProgress[] = [
  { crimeReport: 'sent', insuranceClaim: 'sent' },
  { crimeReport: 'received', insuranceClaim: 'sent' },
  { crimeReport: 'received', insuranceClaim: 'received' },
  { crimeReport: 'processing', insuranceClaim: 'received' },
  { crimeReport: 'processing', insuranceClaim: 'processing' },
  { crimeReport: 'done', insuranceClaim: 'processing' },
];
const STEP_MS = 6000;

export class MockSupportService implements SupportService {
  /** Cases that include an insurance claim (an insurer was saved). */
  private casesWithClaim = new Set<string>();

  async reportTheft(report: TheftReport): Promise<SupportCase> {
    await wait(1500);
    const caseId = `CASE-${report.incidentId.slice(-6).toUpperCase()}`;
    const hasInsurer = report.profile.insurer.trim() !== '';
    if (hasInsurer) this.casesWithClaim.add(caseId);
    return { caseId, policeNotified: true, crimeReportFiled: true, insuranceClaimFiled: hasInsurer };
  }

  async shareLocation(_caseId: string, _fix: LocationFix): Promise<void> {
    // The real backend would forward this to the police in real time.
  }

  watchProgress(caseId: string, onChange: (progress: ReportProgress) => void): () => void {
    const withClaim = this.casesWithClaim.has(caseId);
    const emit = (step: ReportProgress) =>
      onChange(withClaim ? step : { ...step, insuranceClaim: null });
    let step = 0;
    emit(DEMO_STEPS[0]);
    const timer = setInterval(() => {
      step += 1;
      emit(DEMO_STEPS[step]);
      if (step >= DEMO_STEPS.length - 1) clearInterval(timer);
    }, STEP_MS);
    return () => clearInterval(timer);
  }
}
