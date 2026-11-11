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

import { createTagSource, supportService, tagSimulator, TAG_SOURCE_IDS, type TagSourceId } from '@/services';
import {
  configureNotifications,
  notifyUnauthorizedMovement,
  onNotificationOpened,
  requestNotificationPermission,
} from '@/services/notifications';
import { useI18n } from '@/i18n/LanguageContext';
import { bikeReducer, initialBikeState, type BikeState, type PersistedState } from './bikeReducer';

const STORAGE_KEY = 'bikeritas/state/v1';

export type ReportResult = 'ok' | 'no_subscription' | 'already_reported' | 'no_incident' | 'failed';

type BikeContextValue = BikeState & {
  arm: () => void;
  disarm: () => void;
  setSubscription: (active: boolean) => void;
  /** For 'remote', pass the pairing code of the tag to follow. */
  setTagSource: (source: TagSourceId, remoteBikeId?: string) => void;
  /** Hands the theft over to customer service (police, crime report, insurance). */
  reportTheft: () => Promise<ReportResult>;
  /** "It was me" – closes the incident and turns off monitoring. */
  dismissIncident: () => void;
  markRecovered: () => void;
};

const BikeContext = createContext<BikeContextValue | null>(null);

export function BikeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bikeReducer, initialBikeState);
  const { s } = useI18n();
  // Read through a ref so a language change doesn't re-run the new-incident effect.
  const notificationTextRef = useRef(s.notification);
  useEffect(() => {
    notificationTextRef.current = s.notification;
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
  const { armed, parkedAt, subscriptionActive } = state;
  useEffect(() => {
    if (!hydrated) return;
    const persisted: PersistedState = { tagSource, remoteBikeId, armed, parkedAt, subscriptionActive };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch(() => {});
  }, [hydrated, tagSource, remoteBikeId, armed, parkedAt, subscriptionActive]);

  // Notifications: set up once, open the alert screen when one is tapped.
  useEffect(() => {
    configureNotifications();
    requestNotificationPermission();
    return onNotificationOpened((route) => {
      if (route === '/alert') router.push('/alert');
    });
  }, []);

  // A new incident: push notification + jump straight to the alert screen.
  const incidentId = state.incident?.id;
  useEffect(() => {
    if (!incidentId) return;
    const { title, body } = notificationTextRef.current;
    notifyUnauthorizedMovement(title, body);
    router.push('/alert');
  }, [incidentId]);

  // Once customer service has the case, stream the live location to it.
  const caseId = state.incident?.supportCaseId;
  const lastFix = state.tag?.lastFix;
  useEffect(() => {
    if (caseId && lastFix) supportService.shareLocation(caseId, lastFix).catch(() => {});
  }, [caseId, lastFix]);

  const arm = useCallback(() => {
    const fix = stateRef.current.tag?.lastFix;
    if (fix) dispatch({ type: 'arm', at: { latitude: fix.latitude, longitude: fix.longitude } });
  }, []);

  const disarm = useCallback(() => dispatch({ type: 'disarm' }), []);

  const setSubscription = useCallback(
    (active: boolean) => dispatch({ type: 'setSubscription', active }),
    [],
  );

  const setTagSource = useCallback((source: TagSourceId, remoteBikeId?: string) => {
    tagSimulator.stopMovement();
    dispatch({ type: 'setTagSource', source, remoteBikeId });
  }, []);

  const reportTheft = useCallback(async (): Promise<ReportResult> => {
    const { incident, subscriptionActive, tag } = stateRef.current;
    if (!incident) return 'no_incident';
    if (incident.status !== 'detected') return 'already_reported';
    if (!subscriptionActive) return 'no_subscription';

    dispatch({ type: 'incidentProgress', status: 'reporting', event: 'sent_to_support' });
    try {
      const supportCase = await supportService.reportTheft({
        incidentId: incident.id,
        tagId: tag?.id ?? 'unknown',
        bikeName: tag?.name ?? 'Pyörä',
        startedAt: incident.startedAt,
        path: incident.path,
      });
      dispatch({
        type: 'incidentProgress',
        status: 'police_notified',
        supportCaseId: supportCase.caseId,
        event: 'police_notified',
      });
      if (supportCase.crimeReportFiled) {
        dispatch({ type: 'incidentProgress', event: 'crime_report' });
      }
      if (supportCase.insuranceClaimFiled) {
        dispatch({ type: 'incidentProgress', event: 'insurance_claim' });
      }
      dispatch({ type: 'incidentProgress', event: 'sharing_location' });
      return 'ok';
    } catch {
      dispatch({ type: 'incidentProgress', status: 'detected', event: 'report_failed' });
      return 'failed';
    }
  }, []);

  const closeIncident = useCallback(() => {
    tagSimulator.stopMovement(); // no-op unless the simulator is riding away
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
      reportTheft,
      dismissIncident,
      markRecovered,
    }),
    [state, arm, disarm, setSubscription, setTagSource, reportTheft, dismissIncident, markRecovered],
  );

  return <BikeContext.Provider value={value}>{children}</BikeContext.Provider>;
}

export function useBike(): BikeContextValue {
  const ctx = useContext(BikeContext);
  if (!ctx) throw new Error('useBike must be used inside <BikeProvider>');
  return ctx;
}
