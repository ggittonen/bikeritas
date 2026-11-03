import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { BikeProvider } from '@/state/BikeContext';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <BikeProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="alert" options={{ presentation: 'modal', title: 'Hälytys' }} />
        <Stack.Screen name="incident" options={{ title: 'Pyörän seuranta' }} />
      </Stack>
    </BikeProvider>
  );
}
