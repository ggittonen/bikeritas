import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

const supported = Platform.OS !== 'web';

export function configureNotifications() {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Varkaushälytykset / Theft alerts', // shown in Android settings; created before a language is known
      importance: AndroidImportance.MAX,
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!supported) return false;
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

/** `title` and `body` come from the UI so they're in the user's language. */
export async function notifyUnauthorizedMovement(title: string, body: string) {
  if (!supported) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { route: '/alert' },
    },
    trigger: null,
  });
}

/** Calls `onOpen` with the notification's route when the user taps it. Returns unsubscribe. */
export function onNotificationOpened(onOpen: (route: string) => void): () => void {
  if (!supported) return () => {};
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const route = response.notification.request.content.data?.route;
    if (typeof route === 'string') onOpen(route);
  });
  return () => sub.remove();
}
