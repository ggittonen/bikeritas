import { SpaceMono_400Regular, SpaceMono_700Bold, useFonts } from '@expo-google-fonts/space-mono';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { brandHeaderOptions } from '@/components/BrandHeader';
import { BikeProvider } from '@/state/BikeContext';
import { colors } from '@/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ SpaceMono_400Regular, SpaceMono_700Bold });
  if (!fontsLoaded) return null;

  return (
    <BikeProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ ...brandHeaderOptions, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="alert" options={{ presentation: 'modal' }} />
        <Stack.Screen name="incident" />
      </Stack>
    </BikeProvider>
  );
}
