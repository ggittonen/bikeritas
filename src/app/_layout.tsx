import { SpaceMono_400Regular, SpaceMono_700Bold, useFonts } from '@expo-google-fonts/space-mono';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { brandHeaderOptions } from '@/components/BrandHeader';
import { LanguagePicker } from '@/components/LanguagePicker';
import { LanguageProvider, useI18n } from '@/i18n/LanguageContext';
import { BikeProvider } from '@/state/BikeContext';
import { colors } from '@/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ SpaceMono_400Regular, SpaceMono_700Bold });
  if (!fontsLoaded) return null;

  return (
    <LanguageProvider>
      <StatusBar style="light" />
      <App />
    </LanguageProvider>
  );
}

function App() {
  const { loaded, language, setLanguage } = useI18n();
  if (!loaded) return null;
  // First launch: ask the language before anything else (incl. permission prompts).
  if (!language) return <LanguagePicker onPick={setLanguage} />;

  return (
    <BikeProvider>
      <Stack screenOptions={{ ...brandHeaderOptions, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="alert" options={{ presentation: 'modal' }} />
        <Stack.Screen name="incident" />
        <Stack.Screen name="tag-mode" />
      </Stack>
    </BikeProvider>
  );
}
