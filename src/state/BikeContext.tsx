import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

import { LOW_BATTERY_PERCENT } from '@/domain/movementDetection';
import type { BikeProfile } from '@/domain/types';
import { useI18n } from '@/i18n/LanguageContext';
import { createTagSource, supportService, tagSimulator, TAG_SOURCE_IDS, type TagSourceId } from '@/services';
import {
  configureNotifications,
  notify,
  onNotificationOpened,
  requestNotificationPermission,
} from '@/services/notifications';
import { bikeReducer, initialBikeState, type BikeState, type PersistedState } from './bikeReducer';
import { useAutoArm } from './useAutoArm';

const STORAGE_KEY = 'bikeritas/state/v1';

export type ReportResult = 'ok' | 'no_subscription' | 'already_reported' | 'no_incident' | 'failed';

type BikeContextValue = BikeState & {
  arm: () => void;
  disarm: () => void;
  setSubscription: (active: boolean) => void;
  /** For 'remote', pass the pairing code of the tag to follow. */
  setTagSource: (source: TagSourceId, remoteBikeId?: string) => void;
  /** Saves the bike's details and marks the setup step done. */
  setProfile: (profile: BikeProfile) => void;
  setAutoArm: (enabled: boolean) => void;
  /** Owner's distance to the bike when auto-monitoring is active, else null. */
  ownerDistance: number | null;
  /** True when auto-monitoring can work (the tag is another device). */
  autoArmAvailable: boolean;
  /**
   * Hands the theft over to customer service (police, crime report, insurance).
   * Call only after the owner has confirmed what will be shared.
   */
  reportTheft: () => Promise<ReportResult>;
  /** Without a subscription: records that the owner went to file the report themselves. */
  logSelfReport: () => void;
  /** "It was me" – closes the incident and turns off monitoring. */
  dismissIncident: () => void;
  markRecovered: () => void;
};

const BikeContext = createContext<BikeContextValue | null>(null);

export function BikeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bikeReducer, initialBikeState);
  const { s } = useI18n();
  // Read through refs so a language change doesn't re-run the effects below.
  const textRef = useRef(s);
  useEffect(() => {
    textRef.current = s;
  });
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  // Load persisted state, then start listening to the tag.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => (raw ? (JSON.parse(raw) as Partial<PersistedState>) : {}))
      .catch((): Partial<PersistedState> => ({}))
      .then((persisted) => {
        if (persisted.tagSource && !TAG_SOURCE_IDS.includes(persisted.tagSource)) delete persisted.tagSource;
        dispatch({ type: 'hydrate', persisted });
      });
  }, []);

  // Listen to whichever tag source is selected.
  const { hydrated, tagSource, remoteBikeId } = state;
  useEffect(() => {
    if (!hydrated) return;
    const source = createTagSource(tagSource, remoteBikeId);
    source.start();
    const unsubscribe = source.subscribe((status) => dispatch({ type: 'tagUpdate', status }));
    return () => {
      unsubscribe();
      source.stop();
    };
  }, [hydrated, tagSource, remoteBikeId]);

  // Persist the parts that should survive a restart.
  const { armed, parkedAt, subscriptionActive, profile, setupDone, autoArm } = state;
  useEffect(() => {
    if (!hydrated) return;
    const persisted: PersistedState = {
      tagSource,
      remoteBikeId,
      armed,
      parkedAt,
      subscriptionActive,
      profile,
      setupDone,
      autoArm,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch(() => {});
  }, [hydrated, tagSource, remoteBikeId, armed, parkedAt, subscriptionActive, profile, setupDone, autoArm]);

  // Notifications: set up once, open the right screen when one is tapped.
  useEffect(() => {
    configureNotifications();
    requestNotificationPermission();
    return onNotificationOpened((route) => {
      if (route === '/alert') router.push('/alert');
      if (route === '/bikes') router.navigate('/bikes');
    });
  }, []);

  // A new incident: notification + jump straight to the alert screen.
  const incidentId = state.incident?.id;
  useEffect(() => {
    if (!incidentId) return;
    const { title, body } = textRef.current.notification;
    notify(title, body, '/alert');
    router.push('/alert');
  }, [incidentId]);

  // Low tag battery: notify once when it drops below the limit; re-arm after charging.
  const battery = state.tag?.batteryPercent ?? null;
  const lowBatteryNotified = useRef(false);
  useEffect(() => {
    if (battery === null) return;
    if (battery < LOW_BATTERY_PERCENT && !lowBatteryNotified.current) {
      lowBatteryNotified.current = true;
      const { title, body } = textRef.current.lowBatteryNotification;
      notify(title, body(Math.round(battery)), '/bikes');
    } else if (battery >= LOW_BATTERY_PERCENT + 5) {
      lowBatteryNotified.current = false;
    }
  }, [battery]);

  // Once customer service has the case: stream the live location and follow report progress.
  const caseId = state.incident?.supportCaseId;
  const lastFix = state.tag?.lastFix;
  useEffect(() => {
    if (caseId && lastFix) supportService.shareLocation(caseId, lastFix).catch(() => {});
  }, [caseId, lastFix]);
  useEffect(() => {
    if (!caseId) return;
    return supportService.watchProgress(caseId, (progress) => dispatch({ type: 'reportProgress', progress }));
  }, [caseId]);

  const arm = useCallback(() => {
    const fix = stateRef.current.tag?.lastFix;
    if (fix) dispatch({ type: 'arm', at: { latitude: fix.latitude, longitude: fix.longitude } });
  }, []);

  // Auto-monitoring only makes sense when the tag is a different device from this phone.
  const autoArmAvailable = tagSource === 'remote';
  const ownerDistance = useAutoArm({
    enabled: autoArm && autoArmAvailable && !state.incident,
    bike: lastFix ?? null,
    armed,
    onArm: arm,
  });

  const disarm = useCallback(() => dispatch({ type: 'disarm' }), []);

  const setSubscription = useCallback(
    (active: boolean) => dispatch({ type: 'setSubscription', active }),
    [],
  );

  const setTagSource = useCallback((source: TagSourceId, remoteBikeId?: string) => {
    tagSimulator.reset();
    dispatch({ type: 'setTagSource', source, remoteBikeId });
  }, []);

  const setProfile = useCallback((next: BikeProfile) => dispatch({ type: 'setProfile', profile: next }), []);
  const setAutoArm = useCallback((enabled: boolean) => dispatch({ type: 'setAutoArm', enabled }), []);

  const reportTheft = useCallback(async (): Promise<ReportResult> => {
    const { incident, subscriptionActive, tag, profile } = stateRef.current;
    if (!incident) return 'no_incident';
    if (incident.status !== 'detected') return 'already_reported';
    if (!subscriptionActive) return 'no_subscription';

    dispatch({ type: 'incidentProgress', status: 'reporting', event: 'sent_to_support' });
    try {
      const supportCase = await supportService.reportTheft({
        incidentId: incident.id,
        tagId: tag?.id ?? 'unknown',
        startedAt: incident.startedAt,
        path: incident.path,
        profile,
      });
      dispatch({
        type: 'incidentProgress',
        status: 'police_notified',
        supportCaseId: supportCase.caseId,
        event: 'police_notified',
      });
      if (supportCase.crimeReportFiled) dispatch({ type: 'incidentProgress', event: 'crime_report' });
      if (supportCase.insuranceClaimFiled) dispatch({ type: 'incidentProgress', event: 'insurance_claim' });
      dispatch({ type: 'incidentProgress', event: 'sharing_location' });
      return 'ok';
    } catch {
      dispatch({ type: 'incidentProgress', status: 'detected', event: 'report_failed' });
      return 'failed';
    }
  }, []);

  const logSelfReport = useCallback(() => dispatch({ type: 'incidentProgress', event: 'self_report_opened' }), []);

  const closeIncident = useCallback(() => {
    tagSimulator.reset(); // simulated bike back to Maarintie 8 for the next demo
    dispatch({ type: 'incidentClosed' });
  }, []);
  const dismissIncident = closeIncident;
  const markRecovered = closeIncident;

  const value = useMemo<BikeContextValue>(
    () => ({
      ...state,
      arm,
      disarm,
      setSubscription,
      setTagSource,
      setProfile,
      setAutoArm,
      ownerDistance,
      autoArmAvailable,
      reportTheft,
      logSelfReport,
      dismissIncident,
      markRecovered,
    }),
    [
      state,
      arm,
      disarm,
      setSubscription,
      setTagSource,
      setProfile,
      setAutoArm,
      ownerDistance,
      autoArmAvailable,
      reportTheft,
      logSelfReport,
      dismissIncident,
      markRecovered,
    ],
  );

  return <BikeContext.Provider value={value}>{children}</BikeContext.Provider>;
}

export function useBike(): BikeContextValue {
  const ctx = useContext(BikeContext);
  if (!ctx) throw new Error('useBike must be used inside <BikeProvider>');
  return ctx;
}
