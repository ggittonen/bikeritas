import { Tabs } from 'expo-router/js-tabs';
import { Text } from 'react-native';

import { colors } from '@/theme';

function TabIcon({ glyph }: { glyph: string }) {
  return <Text style={{ fontSize: 20 }}>{glyph}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Pyörä', tabBarIcon: () => <TabIcon glyph="🚲" /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Asetukset', tabBarIcon: () => <TabIcon glyph="⚙️" /> }}
      />
    </Tabs>
  );
}
