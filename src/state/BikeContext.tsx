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

import { supportService, tagService, tagSimulator } from '@/services';
import {
  configureNotifications,
  notifyUnauthorizedMovement,
  onNotificationOpened,
  requestNotificationPermission,
} from '@/services/notifications';
import { bikeReducer, initialBikeState, type BikeState, type PersistedState } from './bikeReducer';

const STORAGE_KEY = 'bikeritas/state/v1';

export type ReportResult = 'ok' | 'no_subscription' | 'already_reported' | 'no_incident' | 'failed';

type BikeContextValue = BikeState & {
  arm: () => void;
  disarm: () => void;
  setSubscription: (active: boolean) => void;
  /** Hands the theft over to customer service (police, crime report, insurance). */
  reportTheft: () => Promise<ReportResult>;
  /** "It was me" – closes the incident and turns off monitoring. */
  dismissIncident: () => void;
  markRecovered: () => void;
};

const BikeContext = createContext<BikeContextValue | null>(null);

export function BikeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bikeReducer, initialBikeState);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  // Load persisted state, then start listening to the tag.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => (raw ? (JSON.parse(raw) as Partial<PersistedState>) : {}))
      .catch(() => ({}))
      .then((persisted) => dispatch({ type: 'hydrate', persisted }));
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    tagService.start();
    const unsubscribe = tagService.subscribe((status) => dispatch({ type: 'tagUpdate', status }));
    return () => {
      unsubscribe();
      tagService.stop();
    };
  }, [state.hydrated]);

  // Persist the parts that should survive a restart.
  const { hydrated, armed, parkedAt, subscriptionActive } = state;
  useEffect(() => {
    if (!hydrated) return;
    const persisted: PersistedState = { armed, parkedAt, subscriptionActive };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch(() => {});
  }, [hydrated, armed, parkedAt, subscriptionActive]);

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
    notifyUnauthorizedMovement();
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

  const reportTheft = useCallback(async (): Promise<ReportResult> => {
    const { incident, subscriptionActive, tag } = stateRef.current;
    if (!incident) return 'no_incident';
    if (incident.status !== 'detected') return 'already_reported';
    if (!subscriptionActive) return 'no_subscription';

    dispatch({ type: 'incidentProgress', status: 'reporting', message: 'Ilmoitus lähetetty asiakaspalveluun' });
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
        message: `Poliisille ilmoitettu (tapaus ${supportCase.caseId})`,
      });
      if (supportCase.crimeReportFiled) {
        dispatch({ type: 'incidentProgress', message: 'Rikosilmoitus tehty puolestasi' });
      }
      if (supportCase.insuranceClaimFiled) {
        dispatch({ type: 'incidentProgress', message: 'Vakuutusilmoitus tehty puolestasi' });
      }
      dispatch({ type: 'incidentProgress', message: 'Reaaliaikainen sijainti jaetaan viranomaisille' });
      return 'ok';
    } catch {
      dispatch({ type: 'incidentProgress', status: 'detected', message: 'Ilmoitus epäonnistui – yritä uudelleen' });
      return 'failed';
    }
  }, []);

  const closeIncident = useCallback(() => {
    tagSimulator?.stopMovement(); // no-op once a real tag is in use
    dispatch({ type: 'incidentClosed' });
  }, []);
  const dismissIncident = closeIncident;
  const markRecovered = closeIncident;

  const value = useMemo<BikeContextValue>(
    () => ({ ...state, arm, disarm, setSubscription, reportTheft, dismissIncident, markRecovered }),
    [state, arm, disarm, setSubscription, reportTheft, dismissIncident, markRecovered],
  );

  return <BikeContext.Provider value={value}>{children}</BikeContext.Provider>;
}

export function useBike(): BikeContextValue {
  const ctx = useContext(BikeContext);
  if (!ctx) throw new Error('useBike must be used inside <BikeProvider>');
  return ctx;
}
